# 🧩 PROMPT GIAO TỪNG COWORK (làm song song, không xung đột)

> Mỗi Cowork mở **1 session riêng**, làm **1 phần**. Copy nguyên khối prompt tương ứng, dán vào Cowork đó.
> Mục tiêu: tăng tiến độ mà không đụng nhau.

---

## ⚠️ LUẬT CHUNG (đã ghi sẵn trong mỗi prompt — đọc để hiểu)

1. **Repo/site:** `~/Downloads/trilu-deploy` → github.com/luminhtri0-hash/trilu-website → trilu.edu.vn. Design system dùng chung file `/jlpt/jlpt-study.css` (đã có sẵn trong repo) — **không sửa file này**.
2. **Logo:** dùng đúng `/icon-512.png` và `/icon-180.png` (智 navy #1B3A6B + vòng gold #B89568). **Không đổi logo.**
3. **Thiết kế:** nhờ **Claude Design** (claude.ai/design, project *"Tri Lu Nihongo - Website"*) để đồng bộ. Tải HTML về → tích hợp vào repo.
4. **Tránh xung đột Git:** mỗi Cowork **chỉ tạo file trong thư mục của phần mình** (liệt kê trong từng prompt). KHÔNG sửa hub (`/jlpt/n5.html`…), picker (`tu-vung.html`, `ngu-phap.html`), hay `jlpt-study.css`. **Không tự push** — báo anh Tri để push gộp 1 lần, tránh đè commit.
5. **Claude Design dùng chung:** chỉ chạy **1 generation tại 1 thời điểm**. Nếu thấy "Your other tab is working", đợi tab kia xong. Phần quét/dựng dữ liệu thì làm song song thoải mái.
6. **Màu:** kem #FBF6E8 · navy #1B3A6B (đậm #0F2547) · gold #B89568 · sumi #8B3A2E. Font: Cormorant Garamond + Inter Tight + JetBrains Mono + Noto Serif JP. Đáp án đúng = xanh #2d7d4f.

---

## 🟦 COWORK A — THI THỬ (Mock test)

```
Bối cảnh: Mình làm web học tiếng Nhật Trí Lữ Nihongo (repo ~/Downloads/trilu-deploy → trilu.edu.vn). Design system dùng chung /jlpt/jlpt-study.css đã có sẵn; logo /icon-512.png (智 navy/gold) — KHÔNG đổi. Màu: kem #FBF6E8, navy #1B3A6B, gold #B89568, sumi #8B3A2E; font Cormorant Garamond + Inter Tight + JetBrains Mono + Noto Serif JP.

Nhiệm vụ của bạn: làm phần THI THỬ (mock test) cho JLPT N5–N1 (và EJU nếu có đề).
1. Hỏi mình vị trí file đề nguồn (PDF/HTML) cho từng cấp. Quét/parse thành cấu trúc: phần (Từ vựng–Hán tự / Ngữ pháp–Đọc / Nghe), câu hỏi trắc nghiệm, đáp án, giải thích.
2. Thiết kế giao diện làm bài bằng Claude Design (project "Tri Lu Nihongo - Website") cho ĐỒNG BỘ: trang chọn đề + trang làm bài (đếm giờ, chọn đáp án, chấm điểm tự động, báo cáo điểm theo kỹ năng). Tải HTML về.
3. Tích hợp, CHỈ tạo file trong: /jlpt/{n5..n1}/thi-thu/  và  /thi-thu/ (nếu cần trang tổng). KHÔNG sửa hub/picker/jlpt-study.css.
4. Render kiểm tra bằng trình duyệt headless, đảm bảo chấm điểm đúng, 0 lỗi JS.
5. KHÔNG tự push — báo mình để push gộp.
Lưu ý: Claude Design dùng chung session với các tab khác, chỉ chạy 1 generation 1 lúc; nếu báo "other tab is working" thì đợi.
```

---

## 🟩 COWORK B — ĐỌC HIỂU (Dokkai, quét từ sách)

```
Bối cảnh: (giống Cowork A — Trí Lữ Nihongo, repo ~/Downloads/trilu-deploy, /jlpt/jlpt-study.css dùng chung, logo /icon-512.png không đổi, bảng màu kem/navy/gold/sumi + 4 font như trên).

Nhiệm vụ của bạn: làm phần ĐỌC HIỂU (読解 Dokkai) cho JLPT N5–N1.
1. Hỏi mình file sách nguồn đọc hiểu từng cấp (PDF/HTML). Quét thành: bài đọc (đoạn văn tiếng Nhật + furigana nếu có) + câu hỏi + đáp án + bản dịch tiếng Việt + giải thích từ khó.
2. Thiết kế bằng Claude Design cho đồng bộ: trang chọn bài đọc + trang đọc (đoạn văn, nút hiện/ẩn dịch, câu hỏi chấm tức thì). Tải về.
3. CHỈ tạo file trong: /jlpt/{n5..n1}/doc-hieu/  (+ doc-hieu.html là trang chọn bài của cấp đó). KHÔNG sửa hub/picker/jlpt-study.css.
4. Giữ nguyên nội dung gốc (không bịa thêm), render kiểm tra, 0 lỗi JS.
5. KHÔNG tự push — báo mình.
Lưu ý Claude Design: chỉ 1 generation 1 lúc, đợi nếu tab khác đang chạy.
```

---

## 🟧 COWORK C — NGHE HIỂU (Choukai, quét từ sách + audio)

```
Bối cảnh: (giống trên — Trí Lữ Nihongo, repo ~/Downloads/trilu-deploy, /jlpt/jlpt-study.css dùng chung, logo /icon-512.png không đổi, màu kem/navy/gold/sumi + 4 font).

Nhiệm vụ của bạn: làm phần NGHE HIỂU (聴解 Choukai) cho JLPT N5–N1.
1. Hỏi mình file sách + file audio (mp3) nguồn từng cấp. Quét thành: từng câu nghe (audio + script tiếng Nhật + câu hỏi + đáp án + dịch).
2. Thiết kế bằng Claude Design cho đồng bộ: trang chọn bài nghe + trang nghe (player audio, ẩn/hiện script, chọn đáp án, chấm điểm). Tải về.
3. CHỈ tạo file trong: /jlpt/{n5..n1}/nghe-hieu/ (+ nghe-hieu.html trang chọn bài). File audio đặt trong /jlpt/{lv}/nghe-hieu/audio/. KHÔNG sửa hub/picker/jlpt-study.css.
4. Audio nặng → hỏi mình trước khi đưa file lớn vào repo (có thể dùng link ngoài). Render kiểm tra, 0 lỗi JS.
5. KHÔNG tự push — báo mình.
Lưu ý Claude Design: 1 generation 1 lúc.
```

---

## 🟨 COWORK D — KAIWA (quét sách hội thoại)

```
Bối cảnh: (giống trên — Trí Lữ Nihongo, repo ~/Downloads/trilu-deploy, /jlpt/jlpt-study.css dùng chung, logo /icon-512.png không đổi, màu kem/navy/gold/sumi + 4 font).

Nhiệm vụ của bạn: làm phần KAIWA (会話 Giao tiếp) từ sách hội thoại.
1. Hỏi mình file sách Kaiwa nguồn (PDF/HTML) theo cấp. Quét thành: từng bài hội thoại (đoạn thoại tiếng Nhật + romaji + dịch + mẫu câu giao tiếp + từ vựng tình huống).
2. Thiết kế bằng Claude Design cho đồng bộ với trang khóa học: trang chọn bài Kaiwa + trang bài hội thoại (hiện hội thoại, ẩn/hiện dịch, phát âm từng câu nếu có). Tải về.
3. CHỈ tạo file trong: /kaiwa/{n5-n4, n3, n2, n1}/...  (+ cập nhật các trang chọn bài Kaiwa trong /kaiwa/). KHÔNG sửa hub JLPT/picker/jlpt-study.css.
4. Giữ nguyên nội dung gốc, render kiểm tra, 0 lỗi JS.
5. KHÔNG tự push — báo mình.
Lưu ý Claude Design: 1 generation 1 lúc.
```

---

## 📌 SESSION NÀY (Cowork chính) đang giữ:
- Hub khóa học 5 cấp (`/jlpt/n5..n1.html`), trang chọn bài Từ vựng & Ngữ pháp, `jlpt-study.css`, và toàn bộ 199 trang bài Từ vựng/Ngữ pháp.
- Sẽ lo **push gộp** lên GitHub để tránh xung đột commit giữa các Cowork.
