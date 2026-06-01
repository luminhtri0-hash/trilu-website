# TRẠNG THÁI FLASHCARD — Trí Lữ Nihongo (trilu.edu.vn)

*Ghi cho các phiên Cowork sau hiểu phần flashcard đã làm tới đâu. Cập nhật: 01/06/2026.*
*Đọc kèm: `HUONG-DAN-DATA-TU-DIEN.md` (kiến trúc cache + schema) và `CACH-CAO-DU-LIEU.md` (cách cào Gemini).*

---

## 0. TÓM TẮT
Flashcard (`flashcard.html`, React 1 file) + Tra cứu (`tra-cuu.html`) **dùng chung cache KV `DICT_CACHE`** qua worker (`/api/word`, `/api/grammar`, `/api/kanji`). Mọi dữ liệu lấy từ cache → **miễn phí**, không gọi Gemini API trả phí.

Hiện ĐÃ XONG: dữ liệu 3 loại đã nạp lên cache; flashcard chia mục + đơn vị nhỏ; thẻ Hán tự hiển thị đầy đủ. CÒN: ảnh minh hoạ (Draw Things, đang chạy nền), (tùy chọn) track ngữ pháp cho flashcard.

---

## 1. DỮ LIỆU ĐANG PHỤC VỤ (trong DICT_CACHE, id `9ec69b2aedd14be9862407c79a051ae3`)
| Loại | Số mục | Key | Nguồn |
|---|---|---|---|
| Từ vựng | 16.247 | `word:<sha256>` | dict bóc PDF (15.803) + 4.136 bản giàu cào Gemini (đè lên) |
| Ngữ pháp | 3.199 | `grammar:<sha256>` | 3.720 mẫu cào Gemini (dedup) |
| Chữ Hán | 2.141 | `kanji:<sha256>` | cào Gemini (Hán-Việt, on/kun, số nét, bộ thủ, JLPT, mnemonic, 4-6 từ ghép) |

`sha256` của `query.normalize("NFKC").trim().toLowerCase()`. Value: `{type,query,result,created_at,hits}`. Worker trả `data = result`.

**Shape `result` (native, cả Tra cứu lẫn flashcard đọc được):**
- word: `{is_known, results:[{word, reading_hiragana, reading_romaji, meanings_vi[], meanings_en[], examples:[{ja, ja_ruby, vi}], kanji_breakdown[], han_viet, jlpt, word_class[]}]}`
- kanji: `{is_known, kanji, han_viet, on, kun, meanings_vi[], strokes, radical, radical_name, jlpt, mnemonic, compounds:[{word, reading, meaning_vi}]}`
- grammar: `{is_known, patterns:[{pattern, jlpt, meaning_vi, structure[], usage, examples:[{ja, ja_ruby, vi}]}]}`

---

## 2. CẤU TRÚC FLASHCARD (`flashcard.html`)
**Tracks (tab trên cùng):** `JLPT` (từ vựng N5→N1), `Hán tự` (chữ Hán N5→N1), `BJT`, `Tùy chỉnh`.
- Tab + cấp định nghĩa trong `TRACK_LEVELS`; lọc deck trong `filtered` (vd `track==='Hán tự' → d.track==='KANJI' && d.level===level`).
- Deck-group lấy từ `flashcard-lessons.json`. Mỗi key (`n5..n1`, `bjt`, `kanji`) = một nhóm; gắn track/level trong `LEVEL_META` (decks builder, `decks = useMemo`).
- **Group `kanji` được TÁCH thành 5 deck riêng theo cấp** (N5→N1) trong decks builder (regex `n([12345])` trên `lesson.id`), track `KANJI`.

**Đơn vị nhỏ để tự học:** `flashcard-lessons.json` đã chia mỗi bài thành phần **~10-15 mục** (id `<bài>-<n>`, label `... · phần n/k`). Thống kê: N5 88 đv · N4 102 · N3 55 · N2 46 · N1 28 · BJT 99 · Kanji 167 đv.

**Học một thẻ — `hydrateCard(word, mode)`:**
- `mode==='kanji'` (deck Hán tự) → gọi `/api/kanji`: hiện Hán-Việt, đọc = `kun ・ on`, nghĩa + mnemonic, tags = `[JLPT, "n nét", "Bộ X"]`, ví dụ = các từ ghép (furigana dạng `{từ|đọc}`).
- ngược lại → gọi `/api/word` (shape native `results[0]`; có fallback shape phẳng cũ).
- `mode` truyền: `openDeck` đặt `mode = d.track==='KANJI' ? 'kanji':'word'` → `currentDeckGroup.mode` → `startSession(words,label,mode)` → `hydrateCard`.

**Khác đã sửa:**
- Audio phát `card.reading || card.word` (chữ đơn 私 đọc "watashi", không "shi"). Nút loa cho cả câu ví dụ (`playAudio(example.ja)`).
- Furigana ví dụ render `{漢字|よみ}` qua `renderRuby`.
- Menu site: `/flash-card.html` redirect sang `/flashcard.html`.

**SRS:** worker `/api/srs/state` + `/api/srs/review` (FSRS). Tiến độ học lưu theo user.

---

## 3. CÁCH CẬP NHẬT (quy trình chuẩn)
Data nằm trong localStorage gemini.google.com (`fc_vocab`, `fc_grammar`, `fc_kanji`) → xuất file → build → import:
```bash
cd ~/Downloads/trilu-data       # cần: vocab-data.json, grammar-data.json, kanji-data.json, dict-clean.json, build-data.mjs
node build-data.mjs             # → kv-bulk.json (word + grammar + kanji) + decks.json
npx wrangler kv bulk put --remote --namespace-id=9ec69b2aedd14be9862407c79a051ae3 kv-bulk.json
```
Frontend: upload `flashcard.html` + `flashcard-lessons.json` lên repo `luminhtri0-hash/trilu-website` (GitHub web — file lớn, Cowork không đẩy hộ qua API được).

`build-data.mjs` đã hỗ trợ kanji: đọc `kanji-data.json` (bản cào) + gộp `kanji-list.json` (phần Hán-Việt/on/kun có sẵn), ưu tiên bản cào.

---

## 4. ⚠️ BẪY ĐÃ GẶP (đừng lặp lại)
- **Trùng tên file tải về:** collector tải `kanji-data.json`/`vocab-data.json`/`grammar-data.json` mỗi lần chạy → Chrome đánh số `(1)(2)...`. File KHÔNG số là **bản tải SỚM NHẤT (thường rỗng/thiếu)**. Khi gom build, **chọn file theo SỐ MỤC NHIỀU NHẤT**, không theo tên. (Đã dính lỗi build ra "kanji 0" vì lấy nhầm file rỗng.)
- **Phiên scheduled không đọc được file trên đĩa** (vd `~/Downloads/trilu-data/...`) → cho collector `fetch` danh sách từ repo (raw.githubusercontent, CORS OK) thay vì đọc file.
- **Lệch schema:** Tra cứu đọc `data.results[]`, flashcard cũ đọc phẳng `data.meanings[]`. Đã thống nhất về **native** (`build-data.mjs` ghi native; `hydrateCard` đọc native + fallback).
- **Gemini web:** Trusted Types + Angular chặn điền JS → phải gõ phím thật (computer "type"). Output mỗi lần có hạn → cào theo lô (vocab 30-50, ngữ pháp ~30, kanji ~30/lô).

---

## 5. CÒN LẠI / GỢI Ý TIẾP
- **Ảnh minh hoạ:** `dt-batch.mjs` (offline, FLUX.2 klein, Draw Things local, 0đ) đang sinh ảnh ra `~/Downloads/flashcard-images/<sha1(word)>.png` + `_index.json`. Khi đủ: đưa ảnh lên repo (hoặc R2) và gắn vào thẻ + nút tra.
- **(Tùy chọn) Track Ngữ pháp cho flashcard:** dữ liệu đã có trong cache `/api/grammar`; cần thêm tab + renderer thẻ ngữ pháp (pattern/structure/usage/ví dụ).
- **Enrich thêm ví dụ cho từ giáo trình:** nhiều từ Minna/ShinKanzen mới có nghĩa+đọc (từ dict), chưa có ví dụ. Cào bổ sung qua Gemini nếu muốn thẻ vựng nào cũng có ví dụ.
- Task `trilu-gemini-data-collector`: hiện ĐÃ TẮT (kanji xong). Bật lại + đổi prompt nếu cần cào thêm.
