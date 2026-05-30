# PROMPT — COWORK B · ĐỌC HIỂU (Dokkai)

> Copy TOÀN BỘ nội dung dưới đây dán vào một Cowork mới.

```
Chào bạn. Mình cần bạn xây dựng phần "ĐỌC HIỂU" (読解 Dokkai) cho website học tiếng Nhật của mình. Đọc kỹ phần giới thiệu rồi bắt đầu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN 1 — GIỚI THIỆU WEBSITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Trí Lữ Nihongo là học viện tiếng Nhật (Cần Thơ + online). Website trilu.edu.vn dạy JLPT (N5–N1), Kaiwa và EJU — vừa tuyển sinh vừa là nơi học liệu online.
• Mã nguồn ở thư mục ~/Downloads/trilu-deploy (git repo, remote github.com/luminhtri0-hash/trilu-website, deploy GitHub Pages → trilu.edu.vn). HTML + CSS + JS thuần, không framework.
• Phong cách "editorial luxury": sang trọng, tối giản, nhiều khoảng trắng. Màu: kem #FBF6E8 (đậm #F5EBD4), navy #1B3A6B (đậm #0F2547), gold #B89568, mực #0A1530, sumi #8B3A2E. Font: Cormorant Garamond (tiêu đề serif nghiêng), Inter Tight (body), JetBrains Mono (nhãn IN HOA), Noto Serif JP (chữ Nhật). Đáp án đúng = xanh #2d7d4f.
• Stylesheet dùng chung: /jlpt/jlpt-study.css — <link> tới và tái dùng class (site-nav, wordmark, page, section, container, eyebrow, display, lede, chip-row, lesson-grid, lesson-card, foot). KHÔNG sửa file này.
• Logo: /icon-512.png, /icon-180.png — tròn navy, chữ 智 gold, viền gold. KHÔNG đổi.
• Kiến trúc học liệu (theo đúng mẫu Từ vựng/Ngữ pháp đã làm): mỗi cấp có HUB /jlpt/{lv}.html; mỗi học phần có trang CHỌN BÀI /jlpt/{lv}/{hocphan}.html (lưới thẻ); bấm 1 bài → mở file riêng /jlpt/{lv}/{hocphan}/bai-XX.html. KHÔNG để 1 file HTML dài. {lv} = n5..n1.
• Thiết kế: nhờ "Claude Design" (claude.ai/design, project "Tri Lu Nihongo - Website") cho đồng bộ → tải HTML về → tích hợp. Claude Design dùng chung hạn mức, mỗi lần 1 yêu cầu — gặp "other tab is working" thì đợi.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN 2 — NỘI DUNG PHẦN ĐỌC HIỂU (việc của bạn)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Đọc hiểu" = học viên đọc một đoạn văn tiếng Nhật rồi trả lời câu hỏi. Cấp thấp (N5/N4) là biển hiệu, lịch, thực đơn, email ngắn; cấp cao (N3–N1) là đoạn văn/bài luận dài hơn.

CÁC BƯỚC:
1. Hỏi mình file sách nguồn đọc hiểu từng cấp (PDF/HTML). Quét thành cấu trúc: mỗi bài gồm đoạn văn tiếng Nhật (kèm furigana nếu có), (các) câu hỏi + 4 lựa chọn + đáp án, BẢN DỊCH tiếng Việt của đoạn văn, và giải thích từ/ngữ pháp khó. GIỮ NGUYÊN nội dung gốc, không tự bịa.
2. Nhờ Claude Design thiết kế cho đồng bộ: (a) trang chọn bài đọc; (b) trang đọc — hiển thị đoạn văn đẹp, nút Hiện/Ẩn bản dịch, câu hỏi chấm tức thì (đúng xanh/sai đỏ + giải thích). Tải HTML về.
3. Tích hợp, CHỈ tạo file trong: /jlpt/{n5..n1}/doc-hieu/ ; trang chọn bài đặt tại /jlpt/{lv}/doc-hieu.html. Dùng /jlpt/jlpt-study.css.
4. KHÔNG sửa hub, KHÔNG sửa trang Từ vựng/Ngữ pháp, KHÔNG sửa jlpt-study.css.
5. Render kiểm tra headless: đúng nội dung gốc, không lỗi JS, đúng phông màu.
6. ĐỪNG tự push — báo mình để push gộp.

Bắt đầu bằng việc hỏi mình file sách đọc hiểu nguồn. Cảm ơn!
```
