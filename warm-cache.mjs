// ────────────────────────────────────────────────────────────────
// Nạp sẵn cache từ điển Trí Lữ — gọi /api/word cho danh sách từ khó.
// Mỗi từ được Worker tự lưu vào cache (KV) → người dùng tra ra NGAY,
// không chờ Gemini, không tốn thêm API cho lần sau.
//
// CÁCH CHẠY:   node warm-cache.mjs
// (cần Node 18+; chi phí Gemini trừ vào credit trả phí — flash rất rẻ)
// Muốn thêm từ: cứ bổ sung vào mảng WORDS bên dưới.
// ────────────────────────────────────────────────────────────────

const API = "https://trilu-dict-api.luminhtri0.workers.dev/api/word";
const CONCURRENCY = 5;          // số từ chạy song song
const DELAY_MS = 150;           // nghỉ nhẹ giữa các lượt

// ~150 từ vựng khó/thông dụng (N4–N1). Thêm/bớt thoải mái.
const WORDS = [
  "勉強","大丈夫","約束","経済","政治","文化","環境","影響","関係","意見",
  "経験","説明","必要","重要","状況","情報","機会","問題","解決","方法",
  "努力","成功","失敗","準備","議論","判断","評価","責任","目的","目標",
  "計画","結果","原因","理由","変化","発展","成長","進歩","技術","科学",
  "研究","調査","分析","確認","報告","連絡","相談","提案","決定","選択",
  "比較","区別","関心","興味","期待","希望","不安","心配","満足","後悔",
  "我慢","遠慮","迷惑","世話","面倒","得意","苦手","真面目","正直","親切",
  "丁寧","複雑","単純","適当","正確","具体的","抽象的","積極的","消極的","効果",
  "効率","能力","才能","性格","態度","表情","印象","記憶","想像","理解",
  "意識","無意識","感情","感覚","気分","雰囲気","常識","知識","教養","文明",
  "歴史","伝統","習慣","風習","儀式","宗教","哲学","思想","価値観","道徳",
  "法律","規則","制度","政府","社会","国際","世界","平和","戦争","自由",
  "平等","権利","義務","責務","協力","競争","交流","貿易","産業","農業",
  "工業","商業","企業","会社","組織","管理","経営","営業","販売","購入",
  "消費","生産","製造","開発","設計","建設","交通","運輸","通信","放送"
];

async function warm(q){
  try{
    const r = await fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: q })
    });
    const d = await r.json();
    const n = (d.data && d.data.results || []).length;
    return { q, ok: !!d.ok && n > 0, cached: d.cached, n, err: d.error };
  }catch(e){
    return { q, ok: false, err: String(e).slice(0, 60) };
  }
}

let idx = 0, done = 0, fresh = 0, hit = 0, fail = 0;

async function runner(){
  while(idx < WORDS.length){
    const q = WORDS[idx++];
    const res = await warm(q);
    done++;
    if(!res.ok){ fail++; }
    else if(res.cached){ hit++; } else { fresh++; }
    const tag = !res.ok ? "✗ LỖI" : res.cached ? "• cache" : "✓ mới";
    console.log(`[${String(done).padStart(3)}/${WORDS.length}] ${tag}  ${q}${res.err?'  ('+res.err+')':''}`);
    await new Promise(r => setTimeout(r, DELAY_MS));
  }
}

(async () => {
  console.log(`Nạp ${WORDS.length} từ vào cache (song song ${CONCURRENCY})...\n`);
  const t0 = Date.now();
  await Promise.all(Array.from({ length: CONCURRENCY }, runner));
  console.log(`\nXong sau ${((Date.now()-t0)/1000).toFixed(1)}s — mới: ${fresh}, đã có cache: ${hit}, lỗi: ${fail}.`);
})();
