# Trí Lữ Dictionary API — Deploy Guide

Backend cho `/tra-cuu.html` — Cloudflare Worker + KV cache + Gemini AI + auth (magic link + Google OAuth).

**Tổng thời gian deploy lần đầu: ~30-45 phút** (tính cả tạo Google OAuth client + Resend account).

---

## Tổng quan

```
Browser → trilu.edu.vn/api/* → Cloudflare Worker
                                  ├─ DICT_CACHE (KV)   ← results cache
                                  ├─ QUOTA       (KV)   ← rate limit
                                  ├─ SESSIONS    (KV)   ← login sessions
                                  ├─ USERS       (KV)   ← user records
                                  ├─ MAGIC       (KV)   ← magic-link tokens
                                  ├─ Gemini API         ← AI engine
                                  ├─ Resend API         ← gửi magic link email
                                  └─ Google OAuth       ← login Google
```

---

## Phase 1 · Cài wrangler + đăng nhập Cloudflare

```bash
# Trên máy bạn (cần Node.js 18+)
npm install -g wrangler
wrangler login                          # mở browser, login Cloudflare account
cd cloudflare-worker
```

---

## Phase 2 · Tạo 5 KV namespaces

```bash
wrangler kv namespace create DICT_CACHE
wrangler kv namespace create QUOTA
wrangler kv namespace create SESSIONS
wrangler kv namespace create USERS
wrangler kv namespace create MAGIC
```

Mỗi lệnh trả về `id = "xxxxxxxxxx"`. **Copy 5 id này, paste vào `wrangler.toml`** ở chỗ `PASTE_*_ID_HERE`.

---

## Phase 3 · Tạo Resend account (gửi email magic link)

1. Vào https://resend.com → Sign up (miễn phí 100 email/ngày, không cần thẻ).
2. **Domains → Add domain** → nhập `trilu.edu.vn` → Resend cho bạn 3 DNS records (TXT + MX + DKIM). Vào Cloudflare DNS → add 3 records → Resend tự verify.
3. **API Keys → Create** → đặt tên `trilu-dict-prod` → permission **Sending only** → copy key (`re_xxx...`).

> Tạm thời nếu chưa verify domain, bạn có thể dùng Resend onboarding domain `onboarding@resend.dev` — nhưng email sẽ vào Spam của user. Khuyến nghị verify domain trước launch.

---

## Phase 4 · Tạo Google OAuth client

1. Vào https://console.cloud.google.com → tạo project mới (vd "Trí Lữ Nihongo").
2. **APIs & Services → OAuth consent screen**:
   - User Type: **External**
   - App name: `Trí Lữ Nihongo`
   - User support email: email bạn
   - App logo: upload `/icon-180.png`
   - Authorized domains: `trilu.edu.vn`
   - Developer contact: email bạn
   - Scopes: bỏ qua (default openid + email + profile là đủ)
   - Test users: thêm email của bạn (để test trước khi publish)
   - Save & Continue → Save & Continue → Back to Dashboard

3. **APIs & Services → Credentials → + CREATE CREDENTIALS → OAuth client ID**:
   - Application type: **Web application**
   - Name: `Trí Lữ Dict API`
   - Authorized JavaScript origins: `https://trilu.edu.vn`
   - Authorized redirect URIs: `https://trilu.edu.vn/api/auth/google/callback`
   - CREATE → copy **Client ID** và **Client secret**.

4. Khi sẵn sàng cho user thật → **OAuth consent screen → PUBLISH APP** (Google sẽ verify ~vài ngày, trong khi đó vẫn dùng được).

---

## Phase 5 · Set Worker secrets

Bạn cần 5 secret (KHÔNG paste vào `wrangler.toml`, paste qua CLI):

```bash
wrangler secret put GEMINI_API_KEY
# paste Gemini API key (từ aistudio.google.com)

wrangler secret put GOOGLE_CLIENT_ID
# paste Google Client ID từ Phase 4.3

wrangler secret put GOOGLE_CLIENT_SECRET
# paste Google Client Secret từ Phase 4.3

wrangler secret put RESEND_API_KEY
# paste Resend API key từ Phase 3.3 (re_...)

wrangler secret put JWT_SECRET
# paste 1 chuỗi random 32+ ký tự. Tự tạo bằng:
#   openssl rand -hex 32
# Đây là secret để HMAC-sign OAuth state. Đừng dùng lại key này ở đâu khác.
```

---

## Phase 6 · Deploy Worker

```bash
wrangler deploy
```

Output sẽ là dạng:
```
Total Upload: 25.3 KiB / gzip: 8.1 KiB
Uploaded trilu-dict-api (1.5 sec)
Published trilu-dict-api (7.2 sec)
  trilu.edu.vn/api/*
Current Deployment ID: 0123abc...
```

---

## Phase 7 · Bật Cloudflare proxy cho trilu.edu.vn

Worker routes chỉ hoạt động khi DNS **proxy mode** (orange cloud).

1. Cloudflare Dashboard → trilu.edu.vn → **DNS → Records**
2. Tìm record `trilu.edu.vn` (CNAME → `luminhtri0-hash.github.io`).
3. Click edit → bật **Proxied** (cloud màu cam).
4. Tương tự cho `www.trilu.edu.vn`.

> Nếu trước đó cowork SSL đã làm bước này thì skip.

---

## Phase 8 · Test API

```bash
# Health check
curl https://trilu.edu.vn/api/health
# → {"ok":true,"t":17xxxx}

# Word lookup
curl -X POST https://trilu.edu.vn/api/word \
  -H "content-type: application/json" \
  -d '{"query":"桜"}'
# → {"ok":true,"cached":false,"data":{...},"quota":{"used":1,"limit":10},...}

# Lại lần 2 (test cache)
curl -X POST https://trilu.edu.vn/api/word \
  -H "content-type: application/json" \
  -d '{"query":"桜"}'
# → "cached":true (không gọi Gemini)

# Grammar
curl -X POST https://trilu.edu.vn/api/grammar \
  -H "content-type: application/json" \
  -d '{"query":"~ばかり"}'

# Translate
curl -X POST https://trilu.edu.vn/api/translate \
  -H "content-type: application/json" \
  -d '{"text":"私は学生です","direction":"ja->vi"}'

# Magic link (sẽ gửi email thật)
curl -X POST https://trilu.edu.vn/api/auth/magic-link \
  -H "content-type: application/json" \
  -d '{"email":"YOUR_EMAIL_HERE"}'
```

---

## Phase 9 · Verify frontend

1. Mở https://trilu.edu.vn/tra-cuu.html
2. Tab Từ vựng → gõ `桜` → enter. Phải thấy kết quả inline ~2-3s lần đầu, lần 2 instant (cache).
3. Tab Ngữ pháp → gõ `~ばかり` → ra cấu trúc + ví dụ + so sánh.
4. Tab Dịch → paste 1 câu Nhật → nhận bản dịch.
5. Click **ĐĂNG NHẬP →** → mở /tra-cuu/login.html → thử cả Google + magic link.
6. Sau login → quay lại tra-cuu → quota hiện 100 thay vì 10.

---

## Vận hành

### Theo dõi cost & traffic

- **Cloudflare Worker dashboard** → Analytics → xem requests/day, errors.
- **Cloudflare KV** → xem dung lượng (free 1GB).
- **Gemini AI Studio → Usage** → xem token spend ($).
- **Resend → Logs** → xem email gửi thành công/fail.

### Tăng quota cho user

Hiện đơn giản là cố định trong env var `QUOTA_USER`. Để có **paid tier** sau này:

1. Mở Worker code, thêm field `tier` trong USERS record.
2. Trong `quotaContext`, đọc `user.tier` để return limit khác nhau.
3. Có thể tích hợp Stripe → webhook update `tier`.

### Xóa cache 1 từ (nếu Gemini trả sai)

```bash
# Hash từ
echo -n "桜" | shasum -a 256
# → abc123...

# Xóa
wrangler kv key delete --binding=DICT_CACHE "word:abc123..."
```

### Backup / export KV

```bash
wrangler kv key list --binding=DICT_CACHE > cache-keys.json
# Mỗi key có thể curl --header 'authorization: Bearer CF_API_TOKEN' để dump.
```

### Update worker code

```bash
wrangler deploy
# Cloudflare deploy <1s, không downtime.
```

---

## Troubleshoot

### `gemini 401`
Sai/hết hạn `GEMINI_API_KEY`. Tạo lại key ở aistudio.google.com → `wrangler secret put GEMINI_API_KEY`.

### `gemini 429`
Vượt free tier (15 req/phút, 1500/ngày). Đợi 1 phút, hoặc nâng tier có trả phí ở Google Cloud.

### Magic link không tới email
- Check Spam.
- Resend → Logs → xem có "bounce" hay "delivered" không.
- Domain chưa verify → email gửi từ `onboarding@resend.dev` thường vào Spam. Verify domain ở Resend (Phase 3.2).

### Google OAuth lỗi `redirect_uri_mismatch`
Quay lại Google Cloud → Credentials → edit OAuth client → đảm bảo Authorized redirect URI **chính xác**: `https://trilu.edu.vn/api/auth/google/callback` (không có / cuối, https không phải http).

### Worker route không catch /api/*
- DNS proxy mode chưa bật (cloud xám thay vì cam) → bật ở Phase 7.
- Route chưa map đúng → Cloudflare Dashboard → Workers Routes → kiểm tra `trilu.edu.vn/api/*` → trỏ tới `trilu-dict-api`.

### Login xong vẫn thấy "Còn 10/10 lượt khách"
- Cookie domain sai. Check `COOKIE_DOMAIN` trong wrangler.toml phải là `.trilu.edu.vn` (có dấu chấm đầu).
- Browser block third-party cookies → không phải vấn đề vì cookie cùng domain.

---

## Cost estimate

Với 1000 lượt tra/ngày, ~70% cache hit sau 1 tháng:
- Gemini 2.0 Flash: ~300 lượt API call/ngày → ~$0.05/ngày → **~$1.5/tháng**
- Cloudflare: 1000 req/ngày → trong free tier (100k/ngày) → **$0**
- Resend: ~30 email/ngày → trong free tier (100/ngày) → **$0**
- KV: ~5MB cache + sessions → trong free tier (1GB) → **$0**

**Total: ~$1.5/tháng cho 30k lượt tra.** Có cache thì tăng user không tăng cost tuyến tính.

---

## Mở rộng tương lai

- **Admin dashboard** (`/admin/dict-stats`): top 100 từ hot, total spend, daily active users.
- **History sync**: lưu history trong USERS thay vì localStorage (đa thiết bị).
- **Bookmark từ**: nút ⭐ để user save từ vào danh sách riêng.
- **Quiz tự sinh**: pick từ random trong history → trắc nghiệm.
- **Voice input**: nói tiếng Việt → tra. Dùng Web Speech API (free).
- **OCR kanji**: upload ảnh chữ Hán → Gemini Vision đọc → tra.

---

**Maintained by:** Trí Lữ Nihongo · trilu.edu.vn
