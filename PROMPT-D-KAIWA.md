# PROMPT — COWORK D · KAIWA (Giao tiếp)

> Copy TOÀN BỘ nội dung dưới đây dán vào một Cowork mới.

```
Chào bạn. Mình cần bạn xây dựng phần "KAIWA" (会話 Giao tiếp) cho website học tiếng Nhật của mình. Đọc kỹ phần giới thiệu rồi bắt đầu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN 1 — GIỚI THIỆU WEBSITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Trí Lữ Nihongo là học viện tiếng Nhật (Cần Thơ + online). Website trilu.edu.vn dạy JLPT (N5–N1), Kaiwa (giao tiếp) và EJU — vừa tuyển sinh vừa là nơi học liệu online.
• Mã nguồn ở thư mục ~/Downloads/trilu-deploy (git repo, remote github.com/luminhtri0-hash/trilu-website, deploy GitHub Pages → trilu.edu.vn). HTML + CSS + JS thuần, không framework.
• Phong cách "editorial luxury": sang trọng, tối giản, nhiều khoảng trắng. Màu: kem #FBF6E8 (đậm #F5EBD4), navy #1B3A6B (đậm #0F2547), gold #B89568, mực #0A1530, sumi #8B3A2E. Font: Cormorant Garamond (tiêu đề serif nghiêng), Inter Tight (body), JetBrains Mono (nhãn IN HOA), Noto Serif JP (chữ Nhật).
• Stylesheet dùng chung: /jlpt/jlpt-study.css — <link> tới và tái dùng class (site-nav, wordmark, page, section, container, eyebrow, display, lede, lesson-grid, lesson-card, foot). KHÔNG sửa file này.
• Logo: /icon-512.png, /icon-180.png — tròn navy, chữ 智 gold, viền gold. KHÔNG đổi.
• Kiến trúc học liệu (theo mẫu Từ vựng/Ngữ pháp đã làm bên JLPT): mỗi cấp có trang CHỌN BÀI riêng; bấm 1 bài → mở file riêng bai-XX.html. KHÔNG để 1 file HTML dài.
• Web đã có sẵn khu Kaiwa: các trang /kaiwa.html, /kaiwa/n5-n4.html, /kaiwa/n3.html, /kaiwa/n2.html, /kaiwa/lo-trinh.html. Bạn sẽ bổ sung học liệu bài hội thoại vào đây.
• Thiết kế: nhờ "Claude Design" (claude.ai/design, project "Tri Lu Nihongo - Website") cho đồng bộ → tải HTML về → tích hợp. Claude Design dùng chung hạn mức, mỗi lần 1 yêu cầu — gặp "other tab is working" thì đợi.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN 2 — NỘI DUNG PHẦN KAIWA (việc của bạn)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Kaiwa" = bài học hội thoại giao tiếp: đoạn hội thoại tình huống (tự giới thiệu, hỏi đường, mua sắm, ở công ty…), kèm mẫu câu và từ vựng theo tình huống.

CÁC BƯỚC:
1. Hỏi mình file sách Kaiwa nguồn (PDF/HTML) theo cấp. Quét thành cấu trúc: mỗi bài gồm đoạn hội thoại tiếng Nhật + romaji + bản dịch tiếng Việt, các mẫu câu giao tiếp trọng tâm, và từ vựng tình huống. GIỮ NGUYÊN nội dung gốc.
2. Nhờ Claude Design thiết kế cho đồng bộ: (a) trang chọn bài Kaiwa của mỗi cấp; (b) trang bài hội thoại — hiển thị hội thoại theo lượt nói, nút Hiện/Ẩn dịch, nút phát âm từng câu nếu có audio, khung mẫu câu + từ vựng. Tải HTML về.
3. Tích hợp, CHỈ tạo file trong: /kaiwa/{n5-n4, n3, n2, n1}/ ; cập nhật trang chọn bài Kaiwa trong /kaiwa/ tương ứng (vd /kaiwa/n3.html liệt kê các bài → mở /kaiwa/n3/bai-XX.html). Dùng /jlpt/jlpt-study.css.
4. KHÔNG sửa hub JLPT (/jlpt/n5.html…), KHÔNG sửa trang Từ vựng/Ngữ pháp JLPT, KHÔNG sửa jlpt-study.css.
5. Render kiểm tra headless: đúng nội dung gốc, không lỗi JS, đúng phông màu.
6. ĐỪNG tự push — báo mình để push gộp.

Bắt đầu bằng việc hỏi mình file sách Kaiwa nguồn. Cảm ơn!
```
