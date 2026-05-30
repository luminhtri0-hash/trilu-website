# PROMPT — COWORK A · THI THỬ (Mock Test)

> Copy TOÀN BỘ nội dung dưới đây dán vào một Cowork mới.

```
Chào bạn. Mình cần bạn xây dựng phần "THI THỬ" cho website học tiếng Nhật của mình. Đọc kỹ phần giới thiệu để hiểu bối cảnh rồi hãy bắt đầu.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN 1 — GIỚI THIỆU WEBSITE (để bạn hiểu mình đang làm gì)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Trí Lữ Nihongo là học viện tiếng Nhật (Cần Thơ + online). Website trilu.edu.vn dạy JLPT (N5–N1), Kaiwa (giao tiếp) và EJU (du học) — vừa marketing tuyển sinh vừa là nơi học liệu trực tuyến.
• Mã nguồn nằm ở thư mục ~/Downloads/trilu-deploy trên máy này. Đây là một git repo (remote: github.com/luminhtri0-hash/trilu-website, deploy bằng GitHub Pages → trilu.edu.vn). Web viết bằng HTML + CSS + JS thuần, KHÔNG framework, không build step.
• Phong cách thiết kế: "editorial luxury" — sang trọng, tối giản, nhiều khoảng trắng. Bảng màu: nền kem #FBF6E8 (đậm hơn #F5EBD4), navy #1B3A6B (đậm #0F2547), gold #B89568, mực #0A1530, đỏ sumi #8B3A2E. Font: Cormorant Garamond (tiêu đề serif nghiêng), Inter Tight (body), JetBrains Mono (nhãn IN HOA), Noto Serif JP (chữ Nhật). Quy ước: đáp án ĐÚNG tô xanh #2d7d4f, SAI tô đỏ.
• Có sẵn stylesheet dùng chung: /jlpt/jlpt-study.css. Hãy <link> tới nó và tái dùng các class: site-nav, wordmark, page, section, container, eyebrow, display, lede, chip-row, lesson-grid, lesson-card, module-grid, course-block, foot. KHÔNG sửa file jlpt-study.css.
• Logo: /icon-512.png và /icon-180.png — hình tròn nền navy, chữ 智 màu gold, viền gold. KHÔNG đổi logo.
• Kiến trúc học liệu (phần Từ vựng & Ngữ pháp đã làm theo mẫu này, hãy theo đúng): mỗi cấp có trang HUB /jlpt/{lv}.html (2 khối khóa + lưới 8 học phần). Mỗi học phần có trang CHỌN BÀI /jlpt/{lv}/{hocphan}.html (lưới thẻ). Bấm 1 mục → mở 1 file riêng /jlpt/{lv}/{hocphan}/bai-XX.html — KHÔNG để một file HTML dài cuộn mãi. {lv} = n5, n4, n3, n2, n1.
• Thiết kế giao diện: hãy nhờ "Claude Design" (mở claude.ai/design trong Chrome, project tên "Tri Lu Nihongo - Website") tạo bản thiết kế cho ĐỒNG BỘ với web, rồi tải HTML về và tích hợp. LƯU Ý: Claude Design dùng chung 1 hạn mức và mỗi lần chỉ chạy 1 yêu cầu — nếu thấy báo "Your other tab is working", hãy đợi tab khác xong.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHẦN 2 — NỘI DUNG PHẦN THI THỬ (việc của bạn)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"Thi thử" = mock test mô phỏng đề JLPT thật: học viên làm trọn một đề có đếm giờ, chọn đáp án, nộp bài và được chấm điểm tự động + báo cáo điểm theo từng kỹ năng (Từ vựng–Hán tự / Ngữ pháp–Đọc hiểu / Nghe hiểu).

CÁC BƯỚC:
1. Hỏi mình vị trí file đề nguồn (PDF/HTML) cho từng cấp N5–N1 (và EJU nếu có). Quét/parse thành cấu trúc dữ liệu: từng phần thi, câu hỏi trắc nghiệm, 4 lựa chọn, đáp án đúng, giải thích (nếu có).
2. Nhờ Claude Design thiết kế 2 màn cho đồng bộ: (a) trang chọn đề thi thử của mỗi cấp, (b) trang làm bài — có đồng hồ đếm ngược, chọn đáp án, nộp bài, chấm điểm và báo cáo điểm theo kỹ năng. Tải HTML về.
3. Tích hợp vào repo, CHỈ tạo file trong: /jlpt/{n5..n1}/thi-thu/ (và /thi-thu/ nếu cần trang tổng). Trang chọn đề đặt tại /jlpt/{lv}/thi-thu.html. Dùng /jlpt/jlpt-study.css.
4. KHÔNG sửa hub (/jlpt/n5.html…), KHÔNG sửa trang chọn bài Từ vựng/Ngữ pháp, KHÔNG sửa jlpt-study.css (các phần đó do Cowork khác giữ).
5. Render kiểm tra bằng trình duyệt headless: chấm điểm đúng, không lỗi JS, đúng phông màu.
6. ĐỪNG tự push lên GitHub — báo lại cho mình để mình push gộp 1 lần (tránh xung đột commit giữa các Cowork).

Bắt đầu bằng việc hỏi mình file đề nguồn. Cảm ơn!
```
