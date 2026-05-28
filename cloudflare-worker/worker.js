/**
 * Trí Lữ Nihongo · Dictionary API Worker
 *
 * Endpoints:
 *   POST /api/word              { query }                → word lookup
 *   POST /api/grammar           { query }                → grammar lookup
 *   POST /api/translate         { text, direction }      → ja↔vi translation
 *
 *   POST /api/auth/magic-link   { email }                → sends email link
 *   GET  /api/auth/verify?token=…                        → verifies link, sets session
 *   GET  /api/auth/google                                → start Google OAuth
 *   GET  /api/auth/google/callback?code=…                → Google OAuth callback
 *   POST /api/auth/logout                                → clear session
 *   GET  /api/me                                         → { user, quota_used, quota_limit }
 *
 * Bindings (wrangler.toml):
 *   DICT_CACHE (KV)   lookup results, key: word|grammar|translate:{sha256}
 *   QUOTA      (KV)   per-day rate limit, key: quota:{user_id|ip}:{YYYY-MM-DD}
 *   SESSIONS   (KV)   session tokens, key: session:{token}
 *   USERS      (KV)   user records, key: user:{user_id}; index: email:{email} → user_id
 *   MAGIC      (KV)   pending magic links, key: magic:{token}
 *
 * Secrets:
 *   GEMINI_API_KEY
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   RESEND_API_KEY
 *   JWT_SECRET                  random 32+ chars, for HMAC-signed state tokens
 *
 * Vars:
 *   ALLOWED_ORIGIN              = https://trilu.edu.vn
 *   COOKIE_DOMAIN               = .trilu.edu.vn
 *   GEMINI_MODEL                = gemini-2.0-flash  (or gemini-2.5-flash)
 *   QUOTA_ANON                  = 10
 *   QUOTA_USER                  = 100
 */

const SESSION_COOKIE = "tlsid";
const SESSION_TTL    = 60 * 60 * 24 * 30;   // 30 days
const MAGIC_TTL      = 60 * 15;             // 15 minutes
const OAUTH_STATE_TTL = 60 * 10;            // 10 minutes
const CACHE_TTL      = 60 * 60 * 24 * 365;  // 1 year

const json = (data, init = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init.headers || {}) },
  });

// Wrap any response with CORS headers so trilu.edu.vn frontend can call workers.dev backend
function withCORS(res, env, reqOrigin) {
  const allowed = env.ALLOWED_ORIGIN || "https://trilu.edu.vn";
  // accept both production origin and wildcard prefix (e.g. preview deploys)
  const origin = reqOrigin || allowed;
  const ok = origin === allowed || origin === "https://www.trilu.edu.vn" || (origin && origin.endsWith(".trilu.edu.vn"));
  const h = new Headers(res.headers);
  h.set("access-control-allow-origin", ok ? origin : allowed);
  h.set("access-control-allow-credentials", "true");
  h.set("vary", "origin");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
}

const err = (status, msg, extra = {}) => json({ ok: false, error: msg, ...extra }, { status });

const html = (body, init = {}) =>
  new Response(body, {
    ...init,
    headers: { "content-type": "text/html; charset=utf-8", ...(init.headers || {}) },
  });

const redirect = (url, init = {}) =>
  new Response(null, { ...init, status: init.status || 302, headers: { location: url, ...(init.headers || {}) } });

/* ─────────── crypto helpers ─────────── */

async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomHex(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmacHex(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function normalizeQuery(q) {
  return (q || "").normalize("NFKC").trim().toLowerCase();
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function clientIp(req) {
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || "unknown";
}

function parseCookies(req) {
  const out = {};
  const h = req.headers.get("cookie") || "";
  h.split(/;\s*/).forEach((p) => {
    if (!p) return;
    const i = p.indexOf("=");
    if (i < 0) return;
    out[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1));
  });
  return out;
}

function setCookie(name, value, opts = {}) {
  const o = {
    Path: "/",
    HttpOnly: true,
    Secure: true,
    SameSite: "Lax",
    ...opts,
  };
  let s = `${name}=${encodeURIComponent(value)}`;
  for (const [k, v] of Object.entries(o)) {
    if (v === true) s += `; ${k}`;
    else if (v !== false && v != null) s += `; ${k}=${v}`;
  }
  return s;
}

function clearCookie(name, env) {
  return setCookie(name, "", {
    Domain: env.COOKIE_DOMAIN,
    "Max-Age": 0,
    Expires: "Thu, 01 Jan 1970 00:00:00 GMT",
  });
}

/* ─────────── session / user helpers ─────────── */

async function getSession(req, env) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  const raw = await env.SESSIONS.get(`session:${token}`);
  if (!raw) return null;
  const sess = JSON.parse(raw);
  if (sess.expires_at && sess.expires_at < Date.now()) return null;
  const userRaw = await env.USERS.get(`user:${sess.user_id}`);
  if (!userRaw) return null;
  const user = JSON.parse(userRaw);
  return { token, user };
}

async function createSession(env, userId) {
  const token = randomHex(32);
  const payload = {
    user_id: userId,
    created_at: Date.now(),
    expires_at: Date.now() + SESSION_TTL * 1000,
  };
  await env.SESSIONS.put(`session:${token}`, JSON.stringify(payload), { expirationTtl: SESSION_TTL });
  return token;
}

async function findOrCreateUser(env, { email, name, picture, provider, providerId }) {
  const emailNorm = (email || "").toLowerCase().trim();
  const idxKey = `email:${emailNorm}`;
  let userId = await env.USERS.get(idxKey);
  if (userId) {
    const raw = await env.USERS.get(`user:${userId}`);
    if (raw) {
      const u = JSON.parse(raw);
      u.last_login_at = Date.now();
      if (name && !u.name) u.name = name;
      if (picture && !u.picture) u.picture = picture;
      await env.USERS.put(`user:${userId}`, JSON.stringify(u));
      return userId;
    }
  }
  userId = await sha256Hex(`u:${emailNorm}`);
  const user = {
    id: userId,
    email: emailNorm,
    name: name || emailNorm.split("@")[0],
    picture: picture || null,
    tier: "user",
    provider,
    provider_id: providerId,
    created_at: Date.now(),
    last_login_at: Date.now(),
  };
  await env.USERS.put(`user:${userId}`, JSON.stringify(user));
  await env.USERS.put(idxKey, userId);
  return userId;
}

/* ─────────── quota ─────────── */

async function checkAndBumpQuota(env, who, limit) {
  const day = todayUTC();
  const key = `quota:${who}:${day}`;
  const cur = parseInt((await env.QUOTA.get(key)) || "0", 10);
  if (cur >= limit) return { ok: false, used: cur, limit };
  await env.QUOTA.put(key, String(cur + 1), { expirationTtl: 60 * 60 * 36 });
  return { ok: true, used: cur + 1, limit };
}

async function readQuota(env, who, limit) {
  const day = todayUTC();
  const key = `quota:${who}:${day}`;
  const cur = parseInt((await env.QUOTA.get(key)) || "0", 10);
  return { used: cur, limit };
}

async function quotaContext(req, env) {
  const sess = await getSession(req, env);
  if (sess) {
    return { who: `u:${sess.user.id}`, limit: parseInt(env.QUOTA_USER || "100", 10), user: sess.user };
  }
  const ip = clientIp(req);
  return { who: `ip:${await sha256Hex(ip)}`, limit: parseInt(env.QUOTA_ANON || "10", 10), user: null };
}

/* ─────────── monthly budget cap (hard $ limit) ───────────
   Counter key budget:YYYY-MM increments each Gemini call.
   Default cap 40000 calls/month ≈ $44 (Flash @ ~700 tokens/call).
   Override via env MAX_API_CALLS_PER_MONTH. */

async function checkAndBumpBudget(env) {
  const max = parseInt(env.MAX_API_CALLS_PER_MONTH || "40000", 10);
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const key = `budget:${month}`;
  const cur = parseInt((await env.QUOTA.get(key)) || "0", 10);
  if (cur >= max) return { ok: false, used: cur, max };
  // 40 day TTL (so next month rolls over cleanly)
  await env.QUOTA.put(key, String(cur + 1), { expirationTtl: 60 * 60 * 24 * 40 });
  return { ok: true, used: cur + 1, max };
}

/* ─────────── Gemini ─────────── */

async function callGemini(env, prompt, { model } = {}) {
  const m = model || env.GEMINI_MODEL || "gemini-2.5-flash";
  // AI Gateway routes via CF US edges → bypass Hong Kong/region block on Gemini 3.x
  const base = env.AI_GATEWAY_BASE || "https://generativelanguage.googleapis.com";
  const url = `${base}/v1beta/models/${m}:generateContent?key=${env.GEMINI_API_KEY}`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      // Disable Gemini 3.x thinking mode → saves ~30-50% tokens, faster response
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
  const r = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`gemini ${r.status}: ${text.slice(0, 200)}`);
  }
  const data = await r.json();
  const part = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!part) throw new Error("gemini: empty response");
  try {
    return JSON.parse(part);
  } catch (e) {
    // sometimes wrapped in ```json … ```
    const m = part.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) return JSON.parse(m[1]);
    throw new Error("gemini: not valid JSON: " + part.slice(0, 200));
  }
}

/* ─────────── prompts ─────────── */

const WORD_PROMPT = (q) => `Bạn là từ điển Nhật–Việt chuyên sâu, dành cho người Việt học tiếng Nhật.

Người dùng tra: ${JSON.stringify(q)}

Nhận diện input có thể là:
- Kanji (vd 孤独, 桜)
- Hiragana/Katakana (vd こどく, サクラ)
- Romaji (vd kodoku, sakura)
- Tiếng Việt (vd "cô độc", "hoa anh đào")
- Tiếng Anh (vd "loneliness")

Trả về **JSON đúng schema** dưới đây, không có text nào khác:

{
  "input": "${q}",
  "detected_lang": "ja" | "vi" | "en" | "romaji" | "unknown",
  "is_known": true | false,
  "results": [
    {
      "kanji": "孤独",                        // hoặc null nếu chỉ có kana
      "reading_hiragana": "こどく",
      "reading_romaji": "kodoku",
      "word_class": ["danh từ", "tính từ na"], // tiếng Việt
      "jlpt": "N2" | "N1" | "N3" | "N4" | "N5" | null,
      "common": true | false,
      "meanings_vi": ["cô độc", "sự đơn độc"],
      "meanings_en": ["solitude", "loneliness"],
      "examples": [
        {
          "ja": "彼は孤独を感じている。",
          "furigana": "かれはこどくをかんじている。",
          "vi": "Anh ấy đang cảm thấy cô đơn."
        }
      ],
      "related": ["孤立", "一人ぼっち"],
      "kanji_breakdown": [                    // chỉ khi có kanji
        { "char": "孤", "meaning": "cô · mồ côi", "on": "コ", "kun": "みなしご" },
        { "char": "独", "meaning": "độc · một mình", "on": "ドク", "kun": "ひと.り" }
      ]
    }
  ],
  "note": "ghi chú nếu cần (vd: từ có nhiều cách viết kanji)" | null
}

Quy tắc:
- Nếu input là Romaji ambiguous (vd "hashi" → 橋/箸), trả tất cả trong results.
- Nếu input không phải tiếng Nhật, dịch sang Nhật + trả 1-3 từ Nhật gần nhất.
- meanings_vi PHẢI có; meanings_en optional nhưng nên có.
- examples 2-4 câu, tự nhiên, có furigana cho kanji.
- jlpt: chỉ điền nếu chắc chắn, không thì null.
- Nếu không biết từ này: { "is_known": false, "results": [] }.
- Chỉ trả JSON, không markdown, không lời dẫn.`;

const GRAMMAR_PROMPT = (q) => `Bạn là từ điển ngữ pháp tiếng Nhật cho người Việt học JLPT.

Mẫu ngữ pháp user tra: ${JSON.stringify(q)}

Trả về **JSON đúng schema** dưới đây, không có text nào khác:

{
  "input": "${q}",
  "is_known": true | false,
  "patterns": [
    {
      "pattern": "～ばかり",
      "jlpt": "N4",
      "meaning_vi": "Chỉ ~ / Toàn là ~",
      "structure": [
        "Động từ thể て + ばかりいる",
        "Danh từ + ばかり"
      ],
      "usage": "Diễn tả việc làm một việc liên tục, lặp đi lặp lại — thường mang sắc thái tiêu cực.",
      "examples": [
        {"ja": "彼はテレビを見てばかりいる。", "vi": "Anh ấy chỉ xem TV cả ngày."},
        {"ja": "雨ばかり降っている。", "vi": "Trời cứ mưa suốt."}
      ],
      "compare_with": [
        { "pattern": "～だけ", "diff": "～だけ trung tính, ～ばかり mang sắc thái phê phán hơn." }
      ],
      "common_mistakes": [
        "Đừng nhầm ～ばかり với ～ばかりに (vì ~ mà ~ — chỉ nguyên nhân tiêu cực)."
      ]
    }
  ],
  "note": null
}

Quy tắc:
- Nếu input không có ~ ở đầu/cuối, vẫn nhận diện được (vd "ばかり" hoặc "te ba kari").
- Nếu input mơ hồ (vd "ば" trùng nhiều mẫu), trả tất cả patterns liên quan trong array.
- Nếu không phải pattern ngữ pháp: { "is_known": false, "patterns": [] }.
- meaning_vi PHẢI có. structure liệt kê các form chính.
- examples 2-4 câu thực tế.
- Chỉ trả JSON.`;

const TRANSLATE_PROMPT = (text, direction) => {
  const dirHuman = direction === "vi->ja" ? "Việt → Nhật" : "Nhật → Việt";
  return `Bạn là dịch giả chuyên Nhật–Việt, có nền tảng văn học và sư phạm.

Hướng dịch: ${dirHuman}
Văn bản cần dịch:
"""
${text}
"""

Trả về **JSON đúng schema** dưới đây, không có text nào khác:

{
  "source": "văn bản gốc",
  "target": "bản dịch chính (tự nhiên, không word-by-word)",
  "alternatives": [
    "bản dịch khác (formal hơn, hoặc casual hơn)"
  ],
  "notes": [
    "ghi chú về sắc thái, từ chọn, văn hoá nếu cần"
  ],
  "vocabulary": [
    {"word": "孤独", "reading": "こどく", "meaning_vi": "cô độc"},
    {"word": "感じる", "reading": "かんじる", "meaning_vi": "cảm thấy"}
  ],
  "grammar_notes": [
    {"pattern": "～ている", "explanation": "diễn tả trạng thái đang tiếp diễn"}
  ]
}

Quy tắc:
- Dịch tự nhiên như người bản xứ viết, không cứng nhắc.
- Nhật → Việt: dùng đại từ phù hợp (tôi/anh/bạn…), tránh "ngôi thứ nhất số ít" kiểu Google.
- Việt → Nhật: mặc định dùng です・ます (lịch sự). Nếu source casual rõ thì dùng casual.
- vocabulary: chỉ liệt kê 5-10 từ quan trọng nhất, không phải tất cả.
- grammar_notes: 1-3 pattern nếu có, không bắt buộc.
- Chỉ trả JSON.`;
};

/* ─────────── dictionary handlers ─────────── */

async function handleDictLookup(req, env, type) {
  if (req.method !== "POST") return err(405, "method not allowed");
  let body;
  try {
    body = await req.json();
  } catch {
    return err(400, "invalid json");
  }

  const ctx = await quotaContext(req, env);

  let cacheKey, prompt, normalized;
  if (type === "word") {
    const q = (body.query || "").trim();
    if (!q) return err(400, "missing query");
    if (q.length > 200) return err(400, "query too long");
    normalized = normalizeQuery(q);
    cacheKey = `word:${await sha256Hex(normalized)}`;
    prompt = WORD_PROMPT(q);
  } else if (type === "grammar") {
    const q = (body.query || "").trim();
    if (!q) return err(400, "missing query");
    if (q.length > 200) return err(400, "query too long");
    normalized = normalizeQuery(q);
    cacheKey = `grammar:${await sha256Hex(normalized)}`;
    prompt = GRAMMAR_PROMPT(q);
  } else if (type === "translate") {
    const text = (body.text || "").trim();
    const direction = body.direction === "vi->ja" ? "vi->ja" : "ja->vi";
    if (!text) return err(400, "missing text");
    if (text.length > 3000) return err(400, "text too long (max 3000 chars)");
    normalized = `${direction}|${text.normalize("NFKC")}`;
    cacheKey = `translate:${await sha256Hex(normalized)}`;
    prompt = TRANSLATE_PROMPT(text, direction);
  } else {
    return err(400, "unknown type");
  }

  // 1. Cache hit?
  const cached = await env.DICT_CACHE.get(cacheKey);
  if (cached) {
    const obj = JSON.parse(cached);
    obj.hits = (obj.hits || 0) + 1;
    // fire-and-forget hit counter update
    env.DICT_CACHE.put(cacheKey, JSON.stringify(obj), { expirationTtl: CACHE_TTL });
    const quota = await readQuota(env, ctx.who, ctx.limit);
    return json({
      ok: true,
      cached: true,
      data: obj.result,
      quota,
      user: ctx.user ? { email: ctx.user.email, name: ctx.user.name } : null,
    });
  }

  // 2. Quota check before paying API
  const quotaCheck = await checkAndBumpQuota(env, ctx.who, ctx.limit);
  if (!quotaCheck.ok) {
    return err(429, "quota exceeded", {
      quota: quotaCheck,
      login_url: ctx.user ? null : "/tra-cuu/login.html",
    });
  }

  // 3. Hard monthly budget cap — protect against runaway cost
  const bud = await checkAndBumpBudget(env);
  if (!bud.ok) {
    return err(503, "service paused: monthly budget reached", { budget: bud });
  }

  // 4. Call Gemini — translate uses Pro for quality, word/grammar use Flash for speed+cost
  let result;
  try {
    const model = type === "translate"
      ? (env.GEMINI_MODEL_PRO || "gemini-2.5-pro")
      : (env.GEMINI_MODEL || "gemini-2.5-flash");
    result = await callGemini(env, prompt, { model });
  } catch (e) {
    return err(502, "upstream error: " + e.message);
  }

  // 4. Save cache
  const cacheVal = {
    type,
    query: normalized,
    result,
    created_at: Date.now(),
    hits: 1,
  };
  await env.DICT_CACHE.put(cacheKey, JSON.stringify(cacheVal), { expirationTtl: CACHE_TTL });

  return json({
    ok: true,
    cached: false,
    data: result,
    quota: quotaCheck,
    user: ctx.user ? { email: ctx.user.email, name: ctx.user.name } : null,
  });
}

/* ─────────── auth: magic link ─────────── */

async function handleMagicLink(req, env) {
  if (req.method !== "POST") return err(405, "method not allowed");
  let body;
  try { body = await req.json(); } catch { return err(400, "invalid json"); }
  const email = (body.email || "").trim().toLowerCase();
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return err(400, "invalid email");

  const token = randomHex(32);
  const payload = { email, expires_at: Date.now() + MAGIC_TTL * 1000 };
  await env.MAGIC.put(`magic:${token}`, JSON.stringify(payload), { expirationTtl: MAGIC_TTL });

  const origin = env.ALLOWED_ORIGIN || "https://trilu.edu.vn";
  const link = `${origin}/api/auth/verify?token=${token}`;
  const subject = "Trí Lữ · Đăng nhập tra cứu từ điển";
  const text = `Chào bạn,\n\nClick đường dẫn dưới đây để đăng nhập vào Trí Lữ Nihongo (link hết hạn sau 15 phút):\n\n${link}\n\nNếu bạn không yêu cầu đăng nhập, vui lòng bỏ qua email này.\n\n— Trí Lữ Nihongo · trilu.edu.vn`;
  const htmlBody = `<div style="font-family:'Cormorant Garamond',Georgia,serif;background:#FBF6E8;padding:32px;color:#1B3A6B;line-height:1.6">
    <div style="max-width:520px;margin:0 auto;background:#fff;padding:36px;border-radius:14px;border:1px solid rgba(184,149,104,0.3)">
      <div style="font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.22em;color:#B89568;text-transform:uppercase;margin-bottom:14px">Trí Lữ · Nihongo &middot; 智 旅 日 本 語</div>
      <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-size:28px;margin:0 0 18px 0;color:#1B3A6B">Đăng nhập tra cứu từ điển</h1>
      <p style="margin:0 0 24px 0;font-size:16px">Click vào nút bên dưới để vào tra cứu — link sẽ hết hạn sau <strong>15 phút</strong>.</p>
      <p style="margin:0 0 28px 0"><a href="${link}" style="display:inline-block;background:#1B3A6B;color:#FBF6E8;padding:14px 28px;border-radius:999px;text-decoration:none;font-family:'JetBrains Mono',monospace;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;font-weight:700">Mở Trí Lữ →</a></p>
      <p style="margin:0;font-size:13px;color:rgba(27,58,107,0.7)">Nếu nút không hoạt động, copy link: <br><code style="font-family:'JetBrains Mono',monospace;font-size:11px;word-break:break-all">${link}</code></p>
      <hr style="border:none;border-top:1px solid rgba(184,149,104,0.25);margin:28px 0">
      <p style="margin:0;font-size:12px;color:rgba(27,58,107,0.55)">Nếu bạn không yêu cầu đăng nhập, vui lòng bỏ qua email này.</p>
    </div>
  </div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.MAIL_FROM || "Trí Lữ Nihongo <noreply@trilu.edu.vn>",
        to: [email],
        subject,
        text,
        html: htmlBody,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      return err(502, "email send failed: " + t.slice(0, 200));
    }
  } catch (e) {
    return err(502, "email send error: " + e.message);
  }

  return json({ ok: true, sent_to: email });
}

async function handleVerifyMagic(req, env) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return err(400, "missing token");
  const raw = await env.MAGIC.get(`magic:${token}`);
  if (!raw) return errPage("Link đã hết hạn hoặc không hợp lệ.");
  const payload = JSON.parse(raw);
  if (payload.expires_at < Date.now()) return errPage("Link đã hết hạn.");

  await env.MAGIC.delete(`magic:${token}`);
  const userId = await findOrCreateUser(env, {
    email: payload.email,
    provider: "magic",
    providerId: payload.email,
  });
  const sessionToken = await createSession(env, userId);
  const cookie = setCookie(SESSION_COOKIE, sessionToken, {
    Domain: env.COOKIE_DOMAIN,
    "Max-Age": SESSION_TTL,
  });
  return redirect("/tra-cuu.html?login=ok", {
    headers: { "set-cookie": cookie },
  });
}

function errPage(message) {
  return html(`<!doctype html>
<html lang="vi"><head><meta charset="utf-8">
<title>Lỗi đăng nhập — Trí Lữ</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:'Cormorant Garamond',Georgia,serif;background:#FBF6E8;color:#1B3A6B;padding:48px 24px;text-align:center}h1{font-style:italic;font-size:32px}p{font-size:17px;margin:18px 0 28px}a{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;background:#1B3A6B;color:#FBF6E8;padding:14px 28px;border-radius:999px;text-decoration:none;font-weight:700}</style>
</head><body>
<h1>Đăng nhập không thành công</h1>
<p>${message}</p>
<a href="/tra-cuu/login.html">← Thử lại</a>
</body></html>`, { status: 400 });
}

/* ─────────── auth: Google OAuth ─────────── */

async function handleGoogleStart(req, env) {
  const state = randomHex(16);
  const sig = await hmacHex(env.JWT_SECRET, state);
  const stateCookie = setCookie("oauth_state", `${state}.${sig}`, {
    Domain: env.COOKIE_DOMAIN,
    "Max-Age": OAUTH_STATE_TTL,
    SameSite: "Lax",
  });
  const origin = env.ALLOWED_ORIGIN || "https://trilu.edu.vn";
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${origin}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`, {
    headers: { "set-cookie": stateCookie },
  });
}

async function handleGoogleCallback(req, env) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return errPage("Thiếu code/state từ Google.");

  const cookies = parseCookies(req);
  const stateCookie = cookies.oauth_state || "";
  const [savedState, savedSig] = stateCookie.split(".");
  if (savedState !== state) return errPage("State không khớp (có thể là CSRF).");
  const expectSig = await hmacHex(env.JWT_SECRET, state);
  if (expectSig !== savedSig) return errPage("State bị giả mạo.");

  const origin = env.ALLOWED_ORIGIN || "https://trilu.edu.vn";
  // exchange code
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${origin}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) {
    const t = await tokenRes.text();
    return errPage("Đổi token thất bại: " + t.slice(0, 150));
  }
  const tokens = await tokenRes.json();

  // fetch user info
  const infoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { authorization: `Bearer ${tokens.access_token}` },
  });
  if (!infoRes.ok) return errPage("Không lấy được thông tin Google.");
  const info = await infoRes.json();
  if (!info.email) return errPage("Google không trả về email.");

  const userId = await findOrCreateUser(env, {
    email: info.email,
    name: info.name,
    picture: info.picture,
    provider: "google",
    providerId: info.sub,
  });
  const sessionToken = await createSession(env, userId);
  const cookie = setCookie(SESSION_COOKIE, sessionToken, {
    Domain: env.COOKIE_DOMAIN,
    "Max-Age": SESSION_TTL,
  });
  // also clear oauth_state
  const clearState = setCookie("oauth_state", "", {
    Domain: env.COOKIE_DOMAIN,
    "Max-Age": 0,
  });
  const res = redirect("/tra-cuu.html?login=ok");
  res.headers.append("set-cookie", cookie);
  res.headers.append("set-cookie", clearState);
  return res;
}

async function handleLogout(req, env) {
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (token) await env.SESSIONS.delete(`session:${token}`);
  return json({ ok: true }, {
    headers: { "set-cookie": clearCookie(SESSION_COOKIE, env) },
  });
}

async function handleMe(req, env) {
  const sess = await getSession(req, env);
  const ctx = await quotaContext(req, env);
  const quota = await readQuota(env, ctx.who, ctx.limit);
  return json({
    ok: true,
    user: sess
      ? { email: sess.user.email, name: sess.user.name, picture: sess.user.picture, tier: sess.user.tier }
      : null,
    quota,
  });
}

/* ─────────── router ─────────── */

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const p = url.pathname;
    const reqOrigin = req.headers.get("origin") || "";

    // CORS preflight
    if (req.method === "OPTIONS") {
      return withCORS(new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "86400",
        },
      }), env, reqOrigin);
    }

    try {
      let res;
      if (p === "/api/health") res = json({ ok: true, t: Date.now() });

      else if (p === "/api/word")      res = await handleDictLookup(req, env, "word");
      else if (p === "/api/grammar")   res = await handleDictLookup(req, env, "grammar");
      else if (p === "/api/translate") res = await handleDictLookup(req, env, "translate");

      else if (p === "/api/auth/magic-link")      res = await handleMagicLink(req, env);
      else if (p === "/api/auth/verify")          res = await handleVerifyMagic(req, env);
      else if (p === "/api/auth/google")          res = await handleGoogleStart(req, env);
      else if (p === "/api/auth/google/callback") res = await handleGoogleCallback(req, env);
      else if (p === "/api/auth/logout")          res = await handleLogout(req, env);
      else if (p === "/api/me")                   res = await handleMe(req, env);

      else res = err(404, "not found");

      return withCORS(res, env, reqOrigin);
    } catch (e) {
      return withCORS(err(500, "internal: " + (e.message || String(e))), env, reqOrigin);
    }
  },
};
