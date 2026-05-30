# PROMPT — COWORK C · NGHE HIỂU (Choukai)

> Copy TOÀN BỘ nội dung dưới đây dán vào một Cowork mới.

```
Chào bạn. Mình cần bạn xây dựng phần "NGHE HIỂU" (聴解 Choukai) cho website học tiếng Nhật của mình. Đọc kỹ phần giới thiệu rồi bắt đầu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN 1 — GIỚI THIỆU WEBSITE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Trí Lữ Nihongo là học viện tiếng Nhật (Cần Thơ + online). Website trilu.edu.vn dạy JLPT (N5–N1), Kaiwa và EJU — vừa tuyển sinh vừa là nơi học liệu online.
• Mã nguồn ở thư mục ~/Downloads/trilu-deploy (git repo, remote github.com/luminhtri0-hash/trilu-website, deploy GitHub Pages → trilu.edu.vn). HTML + CSS + JS thuần, không framework.
• Phong cách "editorial luxury": sang trọng, tối giản, nhiều khoảng trắng. Màu: kem #FBF6E8 (đậm #F5EBD4), navy #1B3A6B (đậm #0F2547), gold #B89568, mực #0A1530, sumi #8B3A2E. Font: Cormorant Garamond (tiêu đề serif nghiêng), Inter Tight (body), JetBrains Mono (nhãn IN HOA), Noto Serif JP (chữ Nhật). Đáp án đúng = xanh #2d7d4f.
• Stylesheet dùng chung: /jlpt/jlpt-study.css — <link> tới và tái dùng class. KHÔNG sửa file này.
• Logo: /icon-512.png, /icon-180.png — tròn navy, chữ 智 gold, viền gold. KHÔNG đổi.
• Kiến trúc học liệu (theo mẫu Từ vựng/Ngữ pháp đã làm): mỗi cấp có HUB /jlpt/{lv}.html; mỗi học phần có trang CHỌN BÀI /jlpt/{lv}/{hocphan}.html; bấm 1 bài → mở file riêng /jlpt/{lv}/{hocphan}/bai-XX.html. KHÔNG để 1 file HTML dài. {lv} = n5..n1.
• Thiết kế: nhờ "Claude Design" (claude.ai/design, project "Tri Lu Nihongo - Website") cho đồng bộ → tải HTML về → tích hợp. Claude Design dùng chung hạn mức, mỗi lần 1 yêu cầu — gặp "other tab is working" thì đợi.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN 2 — NỘI DUNG PHẦN NGHE HIỂU (việc của bạn)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Nghe hiểu" = học viên nghe một đoạn audio (hội thoại/thông báo/bài giảng) rồi trả lời câu hỏi, đúng dạng đề Choukai JLPT.

CÁC BƯỚC:
1. Hỏi mình file sách nguồn + file audio (mp3) cho từng cấp N5–N1. Quét thành cấu trúc: mỗi câu nghe gồm audio, script tiếng Nhật (transcript), câu hỏi + 4 lựa chọn + đáp án, và bản dịch. GIỮ NGUYÊN nội dung gốc.
2. Nhờ Claude Design thiết kế cho đồng bộ: (a) trang chọn bài nghe; (b) trang nghe — có trình phát audio (play/pause, tua, tốc độ), nút Hiện/Ẩn script + dịch, chọn đáp án chấm tức thì. Tải HTML về.
3. Tích hợp, CHỈ tạo file trong: /jlpt/{n5..n1}/nghe-hieu/ ; trang chọn bài tại /jlpt/{lv}/nghe-hieu.html ; file audio đặt trong /jlpt/{lv}/nghe-hieu/audio/.
4. Audio thường NẶNG → hỏi mình trước khi đưa file lớn vào repo (có thể host ngoài rồi nhúng link). Dùng /jlpt/jlpt-study.css.
5. KHÔNG sửa hub, KHÔNG sửa trang Từ vựng/Ngữ pháp, KHÔNG sửa jlpt-study.css.
6. Render kiểm tra headless: player chạy, chấm điểm đúng, không lỗi JS.
7. ĐỪNG tự push — báo mình để push gộp.

Bắt đầu bằng việc hỏi mình file sách nghe + audio nguồn. Cảm ơn!
```
