# HƯỚNG DẪN CHO COWORK — ĐẨY DỮ LIỆU CÀO VÀO TỪ ĐIỂN (trilu.edu.vn)

*Đọc file này trước khi làm bất cứ việc gì liên quan tới dữ liệu của trang Tra cứu (`tra-cuu.html`) hoặc Flashcard.*
*Cập nhật: 31/05/2026.*

---

## 0. TÓM TẮT 30 GIÂY

- Có một **kho dữ liệu đang được cào tự động, MIỄN PHÍ** bằng Gemini web (tài khoản Ultra), KHÔNG dùng API trả phí.
- Trang Tra cứu (`/api/word`, `/api/grammar`, `/api/kanji`) và Flashcard **dùng CHUNG một cache KV** tên `DICT_CACHE`.
- Muốn "đẩy dữ liệu lên từ điển" = **ghi sẵn các key vào DICT_CACHE** → khi học viên tra, trúng cache → trả ngay, **không tốn API**.
- ⚠️ **CÓ LỆCH SCHEMA**: Tra cứu đọc `data.results[]` (shape native), Flashcard đọc `data.meanings[]` (shape phẳng). Đẩy sai shape → một trong hai bên không hiển thị. Xem §5.
- 🚫 **TUYỆT ĐỐI không bật lại Gemini API trả phí.** Đã từng đốt ~$43. Worker có budget cap (`MAX_API_CALLS_PER_MONTH`).

---

## 1. KHO CÀO ĐANG CHẠY

**Cơ chế:** Gemini web (gemini.google.com) không tự động hoá hoàn toàn được (Trusted Types + Angular chặn điền JS). Quy trình: JS focus `.ql-editor` → gõ phím thật → click nút gửi. Dùng chế độ **Flash + "Mở rộng"** cho data sạch (badJa≈0).

**Task tự động:** `trilu-gemini-data-collector` (Scheduled task) — chạy mỗi 7 phút, mỗi lần tối đa 6 lô, tải file về `~/Downloads`. Cần: Mac bật + Chrome mở + đã đăng nhập Gemini.

**Dữ liệu tích luỹ trong `localStorage` của gemini.google.com** (đây là "kho"):

| Key localStorage | Nội dung | Số mục (31/05/2026) |
|---|---|---|
| `fc_vocab` | Từ vựng giàu | **4.136** (100% có nghĩa VN + ví dụ) |
| `fc_grammar` | Ngữ pháp | **2.896** (N2/N1 nhiều nhất) |
| `fc_phrases` | Câu hội thoại | 3.243 |
| `fc_colloquial` | Khẩu ngữ | 961 |
| `fc_tettei_words` / `fc_tettei_idx` | Hàng đợi tettei | **4.140 / 4.140 = XONG** |

**Schema `fc_vocab` (mỗi mục):**
```json
{"q":"私","kanji":"私","hira":"わたし","romaji":"watashi","pos":["Đại từ"],
 "jlpt":"N5","vi":["tôi","tớ"],"en":["I","me"],
 "ex":[{"ja":"私はベトナム人です。","ruby":"{私|わたし}はベトナム{人|じん}です。","vi":"Tôi là người Việt Nam."}],
 "han":[{"c":"私","hv":"tư","mean":"riêng tư"}]}
```

**Schema `fc_grammar` (mỗi mục):**
```json
{"pattern":"~は~です","jlpt":"N5","meaning_vi":"X là Y",
 "structure":["N1 + は + N2 + です"],"usage":"...",
 "ex":[{"ja":"...","ruby":"...","vi":"..."}],"note":null}
```

**Xuất kho ra file** (chạy trong console tab Gemini, hoặc dùng Chrome MCP):
```js
const blob=new Blob([localStorage.getItem('fc_vocab')],{type:'application/json'});
const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='vocab-data.json';a.click();
```
Nhớ lọc ví dụ lẫn chữ Latinh trước khi xuất: bỏ `ex` nào có `/[A-Za-z]/.test(e.ja)` (~0,9%).

---

## 2. KIẾN TRÚC CACHE (worker `cloudflare-worker/worker.js`)

**Chỉ MỘT namespace** chứa mọi kết quả tra cứu:

```
DICT_CACHE   id = 9ec69b2aedd14be9862407c79a051ae3
```
(4 namespace còn lại: QUOTA, SESSIONS, USERS, MAGIC — không liên quan tra cứu.)

**Key cache** (worker.js dòng ~604-632):
```
word:     "word:"      + sha256hex(normalize(query))
grammar:  "grammar:"   + sha256hex(normalize(query))
kanji:    "kanji:"     + sha256hex(normalize(query))
translate:"translate:" + sha256hex(NFKC(text))     // không hạ lowercase
```
`normalize(q) = q.normalize("NFKC").trim().toLowerCase()` (dòng 99-100).

**Value cache:**
```json
{"type":"word","query":"<normalized>","result":<OBJECT>,"created_at":<ms>,"hits":1}
```
Worker trả về cho frontend đúng phần `result` (`data: obj.result`). TTL = 1 năm.

**Luồng:** tra → tính key → `DICT_CACHE.get(key)`. Trúng → trả ngay (FREE). Trượt → check quota + budget → gọi Gemini (TỐN TIỀN) → lưu cache. **Vì vậy ghi sẵn cache = vừa nhanh vừa né hoàn toàn chi phí.**

---

## 3. CÁCH ĐẨY DỮ LIỆU LÊN (build + import)

1. Gom file vào `~/Downloads/trilu-data/`: `dict-clean.json`, `vocab-data.json`, `grammar-data.json`.
2. Chạy `node build-data.mjs` → sinh `kv-bulk.json` (mảng `[{key, value, expiration_ttl}]`).
3. Import:
   ```bash
   npx wrangler kv bulk put --remote --namespace-id=9ec69b2aedd14be9862407c79a051ae3 kv-bulk.json
   ```
   (Cần `npx wrangler login` trước nếu báo lỗi auth 9109/10000.)

**Hàm key trong `build-data.mjs`** (đã có sẵn, dùng lại):
```js
const sha256 = s => createHash('sha256').update(s).digest('hex');
const normalize = q => (q||'').normalize('NFKC').trim().toLowerCase();
const cacheKey = (type, q) => type + ':' + sha256(normalize(q));
```

---

## 4. RESULT SCHEMA CANONICAL (để TRANG TRA CỨU hiển thị)

Đây là shape mà `renderWord` / `renderGrammar` / `renderKanji` trong `tra-cuu.html` đọc (= đúng schema mà worker tự sinh khi gọi Gemini). **Khi ghi cache cho từ điển, `result` PHẢI theo shape này.**

### word — `result`:
```json
{"is_known":true,"input":"<q>","detected_lang":"ja",
 "results":[{
   "word":"私","reading_hiragana":"わたし","reading_romaji":"watashi",
   "jlpt":"N5","common":false,"word_class":["Đại từ"],
   "meanings_vi":["tôi","tớ"],"meanings_en":["I","me"],
   "examples":[{"ja":"私は...","ja_ruby":"{私|わたし}は...","vi":"..."}],
   "kanji_breakdown":[{"char":"私","han_viet":"tư","han_meaning":"riêng tư",
                       "on":"し","kun":"わたし","strokes":7,"radical":"禾","radical_name":"hoà (lúa)","jlpt":"N5"}],
   "related":[]
 }]}
```
> Chuyển từ `fc_vocab`: `vi→meanings_vi`, `en→meanings_en`, `hira→reading_hiragana`, `romaji→reading_romaji`, `pos→word_class`, `ex[].ruby→ex[].ja_ruby`, `han[]{c,hv,mean}→kanji_breakdown[]{char,han_viet,han_meaning}`. (Kho cào CHƯA có `strokes/radical/on/kun` → tag đó sẽ trống, chấp nhận được; muốn đủ thì cào bổ sung.)

### grammar — `result`:
```json
{"is_known":true,"input":"<q>",
 "patterns":[{"pattern":"～ばかり","jlpt":"N4","meaning_vi":"Chỉ ~ / Toàn là ~",
   "structure":["V-て + ばかり"],"usage":"...",
   "examples":[{"ja":"...","ja_ruby":"...","vi":"..."}],
   "compare_with":[{"pattern":"～だけ","diff":"..."}],"note":null}]}
```
> Chuyển từ `fc_grammar`: gói nguyên mục vào `patterns:[{...}]`, đổi `ex→examples` và `ex[].ruby→ja_ruby`. Key = `grammar:` + sha256(normalize(**pattern**)).

### kanji — `result`:
```json
{"is_known":true,"input":"<char>","kanji":"桜","han_viet":"Anh",
 "kun":"さくら","on":"オウ","meanings_vi":["hoa anh đào"],
 "strokes":10,"radical":"木","radical_name":"mộc (cây)","jlpt":"N5",
 "examples":[{"ja":"...","ja_ruby":"...","vi":"..."}],
 "compounds":[{"word":"桜色","reading":"さくらいろ","meaning_vi":"màu hồng anh đào"}],
 "mnemonic":"...","related":[]}
```
> Kho cào HIỆN CHƯA có dataset kanji riêng (thiếu strokes/radical/on/kun). Danh sách 878 chữ cần cào nằm ở `enrich-queue.json`. Cần một prompt Gemini riêng cho kanji xuất đúng các field trên.

---

## 5. ⚠️ CẢNH BÁO LỆCH SCHEMA (quan trọng nhất)

- **Trang Tra cứu** đọc shape **native**: `data.results[0].meanings_vi`, `examples[].ja_ruby`, `kanji_breakdown[]`.
- **Flashcard** (`flashcard.html` → `hydrateCard`) đọc shape **phẳng**: `data.meanings[].vi`, `data.readings[].kana`, `data.examples[].ja_with_furigana`, `data.han_viet`.

→ Một key `word:<hash>` chỉ chứa MỘT `result`. Nếu ghi shape phẳng thì **Tra cứu không hiện**; nếu ghi shape native thì **Flashcard không hiện**.

**Phải thống nhất.** Đề xuất (đúng kiến trúc): **dùng shape native làm chuẩn** (vì worker tự sinh ra shape này khi gọi Gemini), rồi **sửa `hydrateCard` trong flashcard.html đọc native** (`d.results?.[0]` → map sang field thẻ). Như vậy 1 cache phục vụ cả 2.

> Lưu ý: bản `build-data.mjs` hiện tại đang ghi shape PHẲNG (cho flashcard). Trước khi đẩy cho từ điển phải đổi sang native + cập nhật flashcard, nếu không Tra cứu sẽ báo "Chưa tìm thấy".

---

## 6. TRẠNG THÁI HIỆN TẠI & VIỆC CẦN LÀM

| Endpoint | Có dữ liệu kho? | Đã đẩy cache? | Ghi chú |
|---|---|---|---|
| `/api/word` | ✅ 4.136 từ giàu | ⚠️ một phần (shape phẳng) | Cần đổi sang native (§5) rồi import lại |
| `/api/grammar` | ✅ 2.896 mẫu | ❌ chưa | `build-data.mjs` chưa sinh key `grammar:` |
| `/api/kanji` | ❌ chưa cào riêng | ❌ chưa | Cào 878 chữ trong `enrich-queue.json` bằng prompt kanji |
| `/api/translate` | — | — | Luôn gọi live (Pro); không pre-fill |

**Việc nên làm tiếp:**
1. Mở rộng `build-data.mjs`: sinh thêm key `grammar:` (từ `grammar-data.json`) và `kanji:` (khi có dataset) vào cùng `kv-bulk.json`.
2. Thống nhất schema word theo §5.
3. Cào kanji riêng (878 chữ) → đẩy `/api/kanji`.

---

## 7. RÀNG BUỘC BẮT BUỘC
- 🚫 Không gọi Gemini API trả phí. Mọi dữ liệu qua Gemini web (free) hoặc bóc PDF.
- File lớn (>100KB như `flashcard.html`, `kv-bulk.json`): Cowork không đẩy GitHub hộ được → user tự upload web hoặc git push.
- Luôn `--remote` khi `wrangler kv bulk put` (không có cờ này = ghi vào KV local, vô tác dụng).
