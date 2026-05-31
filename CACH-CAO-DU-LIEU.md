# PHỤ LỤC — CÁCH CÀO DỮ LIỆU CHO TỪ ĐIỂN (bổ sung cho HUONG-DAN-DATA-TU-DIEN.md §8)

*Dành cho Cowork phía từ điển muốn tự cào thêm dữ liệu. Đọc kèm HUONG-DAN-DATA-TU-DIEN.md.*

---

## 8.1 Chuẩn bị
- gemini.google.com, tài khoản **Ultra**, đăng nhập sẵn.
- Model **3.5 Flash**, Cấp độ tư duy = **Mở rộng** (menu model → Cấp độ tư duy → Mở rộng).
  ⚠️ BẮT BUỘC. Bản "Tiêu chuẩn" lỗi ~30% câu ví dụ (lẫn tiếng Việt/Latinh vào `ja`/`ruby`). "Mở rộng" đã test sạch (badJa≈0) nhưng chậm hơn (~30-40s/lô).
- Mac bật + Chrome mở (vì cào dùng Chrome MCP + computer-use gõ phím thật).

## 8.2 Vì sao KHÔNG điền JS thẳng được
gemini.google.com bật **Trusted Types** (cấm `innerHTML`) + **Angular change-detection** (set `.value` bằng JS không kích hoạt nút gửi) + **CORS** (không `fetch` API hộ).
→ Phải: JS focus ô nhập → **gõ phím thật** (computer-use `type`) → JS click nút gửi.

## 8.3 Selector (đã kiểm chứng)
| Việc | Selector |
|---|---|
| Ô nhập | `.ql-editor` |
| Nút gửi | `button[aria-label="Gửi tin nhắn"]` |
| Chat mới | `[aria-label="Cuộc trò chuyện mới"]` |
| Đọc kết quả (code block cuối) | `[...document.querySelectorAll('message-content code, pre code')].pop().innerText` |

## 8.4 Vòng lặp 1 lô (mỗi lô = 1 CHAT MỚI)
1. JS click `[aria-label="Cuộc trò chuyện mới"]`.
2. JS focus `.ql-editor`.
3. **Gõ prompt bằng computer-use `type`** (phím thật) — KHÔNG set `.value`.
4. JS click `button[aria-label="Gửi tin nhắn"]`.
5. Đợi trả lời xong (poll tới khi có code block và nút "dừng" biến mất, ~30-40s).
6. Đọc code block cuối (selector ở 8.3) → `JSON.parse`.
7. Validate + dedup + tích luỹ vào localStorage (8.6).
8. Lưu checkpoint index để lần sau cào tiếp đúng chỗ.

> Mỗi câu trả lời Gemini "nghĩ" đuôi khá lâu → **mở chat mới mỗi lô** cho sạch, tránh lỗi "thinking blocks cannot be modified" ở phiên dài.

## 8.5 Cỡ lô
- **Vocab:** 30-50 từ/lô.
- **Ngữ pháp:** cap **~30 mẫu/lô**. Xin "đầy đủ một lần" sẽ bị CẮT → hỏng JSON. Nếu dừng giữa chừng, gõ tiếp: `tiếp tục liệt kê các mẫu Nx còn lại, không lặp lại mẫu đã nêu`.
- **Kanji:** 30-40 chữ/lô.

## 8.6 Validate + tích luỹ (chạy trong console tab Gemini)
```js
function accumulate(key, arr){
  const cur = JSON.parse(localStorage.getItem(key) || '[]');
  const seen = new Set(cur.map(o => o.q || o.pattern));
  for (const o of arr){
    const id = o.q || o.pattern; if (!id || seen.has(id)) continue;
    if (Array.isArray(o.ex))            // bỏ ví dụ lẫn chữ Latinh (câu Nhật không được có)
      o.ex = o.ex.filter(e => e && e.ja && !/[A-Za-z]/.test(e.ja));
    cur.push(o); seen.add(id);
  }
  localStorage.setItem(key, JSON.stringify(cur));
  return cur.length;
}
// vd: accumulate('fc_kanji', JSON.parse(codeBlockText));
```
**Quy tắc validate:** loại entry nếu `ja` chứa `[A-Za-z]`; `ruby` sau khi bỏ markup `{漢字|よみ}` (lấy phần trước `|`) phải khớp `ja`.

localStorage key: `fc_vocab` (→/api/word), `fc_grammar` (→/api/grammar), `fc_kanji` (→/api/kanji — MỚI).

## 8.7 PROMPT MẪU

### A) VOCAB → `fc_vocab` → `/api/word`
Dán prompt, thay `<DANH SÁCH>` bằng 30-50 từ cách nhau bởi dấu phẩy:

> Bạn là từ điển Nhật–Việt cho người Việt học tiếng Nhật. Với MỖI từ trong danh sách, tạo một object JSON. Chỉ trả về DUY NHẤT một JSON array minified bên trong MỘT code block, tuyệt đối không kèm lời giải thích. Schema mỗi object: {"q":"<từ gốc đúng như danh sách>","kanji":"<kanji hoặc null nếu chỉ kana>","hira":"<đọc hiragana>","romaji":"<romaji>","pos":["từ loại tiếng Việt"],"jlpt":"N5|N4|N3|N2|N1|null","vi":["nghĩa tiếng Việt (1-3)"],"en":["english"],"ex":[{"ja":"câu ví dụ","ruby":"<furigana>","vi":"dịch"}],"han":[{"c":"<từng chữ kanji>","hv":"âm Hán-Việt","mean":"nghĩa Hán-Việt ngắn"}]}. QUY TẮC VÍ DỤ: (1) "ja" PHẢI là câu TIẾNG NHẬT THUẦN (chỉ kanji/kana + dấu câu Nhật), KHÔNG chứa chữ Latinh/tiếng Việt; (2) "ruby" PHẢI là ĐÚNG chuỗi "ja" chỉ thêm furigana {漢字|よみ} cho từng cụm kanji, không thêm/bớt/dịch; nếu không có kanji thì "ruby"="ja"; (3) "vi" mới chứa bản dịch. Mỗi từ 1-2 ví dụ. Không có kanji thì "kanji":null,"han":[]. Chỉ điền jlpt khi chắc chắn. Danh sách: <DANH SÁCH>

### B) NGỮ PHÁP → `fc_grammar` → `/api/grammar`
Dán theo từng cấp (N5→N1). Nếu dừng giữa chừng, gõ "tiếp tục…" (8.5):

> Bạn là chuyên gia ngữ pháp tiếng Nhật JLPT cho người Việt. Hãy liệt kê ĐẦY ĐỦ các mẫu ngữ pháp chuẩn trình độ **N3** (theo Shin Kanzen Master / Try! / Sou Matome — không bỏ sót). Trả về DUY NHẤT một JSON array minified trong MỘT code block. Schema mỗi mẫu: {"pattern":"~mẫu","jlpt":"N3","romaji":"","meaning_vi":"nghĩa tiếng Việt","structure":["cấu trúc kết hợp (Vて+…, Vる+…, N+…)"],"usage":"cách dùng + sắc thái (tiếng Việt)","ex":[{"ja":"câu Nhật thuần","ruby":"đúng câu ja chỉ thêm {漢字|よみ}","vi":"dịch"}],"compare":[{"pattern":"~mẫu gần giống","diff":"khác nhau thế nào"}],"note":"lưu ý/lỗi hay gặp hoặc null"}. QUY TẮC: ja là tiếng Nhật thuần (không Latinh/tiếng Việt); ruby chỉ thêm furigana; mỗi mẫu 2-3 ví dụ; liệt kê CÀNG NHIỀU CÀNG TỐT. Nếu quá dài cứ trả tối đa, mình sẽ nhắc "tiếp tục".

*(Đổi N3 → N5/N4/N2/N1 cho các cấp khác.)*

### C) KANJI → `fc_kanji` → `/api/kanji` (MỚI — cào 878 chữ trong `enrich-queue.json`)
Lấy danh sách chữ từ `enrich-queue.json` (field `kanji`), 30-40 chữ/lô:

> Bạn là chuyên gia Hán tự cho người Việt học tiếng Nhật. Với MỖI chữ Hán trong danh sách, tạo một object JSON. Chỉ trả về DUY NHẤT một JSON array minified trong MỘT code block. Schema: {"q":"<chữ Hán>","han_viet":"âm Hán-Việt","on":"âm On (katakana)","kun":"âm Kun (hiragana)","meanings_vi":["nghĩa tiếng Việt (1-3)"],"strokes":<số nét, integer>,"radical":"<bộ thủ>","radical_name":"tên bộ thủ tiếng Việt","jlpt":"N5|N4|N3|N2|N1|null","ex":[{"ja":"từ hoặc câu chứa chữ này","ruby":"{漢字|よみ}","vi":"dịch"}],"compounds":[{"word":"từ ghép","reading":"đọc hiragana","meaning_vi":"nghĩa"}],"mnemonic":"mẹo nhớ ngắn (tiếng Việt) hoặc null"}. QUY TẮC: "ja" là tiếng Nhật thuần (không Latinh/tiếng Việt); "ruby" chỉ thêm furigana {漢字|よみ}; "strokes" là số integer; 2-3 từ ghép thông dụng; "meanings_vi" PHẢI có. Danh sách: <DANH SÁCH CHỮ HÁN>

## 8.8 Đẩy kết quả lên từ điển
1. Xuất localStorage ra file (HUONG-DAN-DATA-TU-DIEN.md §1): `vocab-data.json`, `grammar-data.json`, `kanji-data.json`.
2. `node build-data.mjs` → `kv-bulk.json`.
3. `npx wrangler kv bulk put --remote --namespace-id=9ec69b2aedd14be9862407c79a051ae3 kv-bulk.json`.

⚠️ `build-data.mjs` HIỆN sinh key `word:` + `grammar:`. Muốn nạp `/api/kanji` thì thêm vào `build-data.mjs`:
- `loadJSON('kanji-data.json')`,
- hàm `kanjiToResult(o)` trả `{is_known:true, input:o.q, kanji:o.q, han_viet, kun:o.kun, on:o.on, meanings_vi:o.meanings_vi, strokes, radical, radical_name, jlpt, examples:o.ex.map(e=>({ja:e.ja,ja_ruby:e.ruby,vi:e.vi})), compounds:o.compounds, mnemonic:o.mnemonic, related:[]}`,
- vòng lặp `makeEntry('kanji', o.q, kanjiToResult(o))`.
(Xem schema kanji native ở HUONG-DAN-DATA-TU-DIEN.md §4.)

## 8.9 Tự động hoá
Task `trilu-gemini-data-collector` (Scheduled) đang chạy vòng lặp 8.4 mỗi 7 phút. Muốn cào kanji: thêm hàng đợi `fc_kanji_queue` = danh sách từ `enrich-queue.json`, và một `fc_kanji_idx`, dùng prompt C.

## 8.10 RÀNG BUỘC
🚫 Không gọi Gemini API trả phí — chỉ dùng Gemini web (free). Cào sai ô (badJa) thì lọc bỏ ví dụ đó, đừng nạp lên cache.
