# 📒 NHẬT KÝ COWORK — Tách bài JLPT/EJU + Hub khóa học

> File này Cowork tự cập nhật để anh Tri tiện theo dõi tiến độ. Cập nhật lần cuối: 2026-05-30.

---

## 1. MỤC TIÊU (theo yêu cầu anh Tri)

- Mỗi cấp **JLPT N5–N1** và mỗi **môn EJU** là một trang **hub** có menu lựa chọn gồm 8 mục:
  **từ vựng · ngữ pháp · hán tự · nghe hiểu · đọc hiểu · đề thi · thi thử · tài liệu**.
- Trên đầu mỗi hub ghi to **2 khóa học**: *Khóa JLPT (cấp đó)* và *Khóa Giao tiếp (Kaiwa, cấp đó)*.
- Mục **Từ vựng / Ngữ pháp** dùng dữ liệu trong thư mục `tv Np n5-1`. Yêu cầu: **chọn bài ở ngoài → bấm vào mới mở bài đó** (mỗi bài 1 file riêng, không để 1 file HTML dài).
- Anh Tri sẽ tự up tài liệu/HTML vào các mục còn lại sau.

## 2. QUYẾT ĐỊNH ĐÃ CHỐT

| # | Quyết định |
|---|---|
| Kiến trúc | **1A** — picker (trang chọn bài) riêng; mỗi bài là 1 file `bai-XX.html` mở khi bấm |
| Nội dung | **Giữ nguyên 100%** nội dung gốc (từ vựng/ngữ pháp/quiz/audio), chỉ đổi style khung + cấu trúc |
| 6 mục chưa có | Tạo trang **"đang cập nhật"** đúng style để link không gãy |
| Phạm vi | **Làm thử N5 trước**, duyệt xong mới nhân ra N4–N1 + EJU |
| Thiết kế picker | Đã **redesign editorial luxury** (bản đầu bị chê đơn điệu) |

## 3. NGUỒN & ĐÍCH

- **Nguồn dữ liệu:** `~/Downloads/tv Np n5-1/` (10 file: N5–N1, mỗi cấp 1 từ vựng + 1 ngữ pháp)
- **Repo web (live):** `~/Downloads/trilu-deploy/` → github.com/luminhtri0-hash/trilu-website → trilu.edu.vn
- **Script build (sandbox):** `build_lessons.js` (từ vựng), `build_grammar.js` (ngữ pháp), `picker_template.js` (giao diện chọn bài dùng chung), `build_hub.js` (hub + placeholder)

## 4. CẤU TRÚC FILE ĐÃ TẠO (N5)

```
jlpt/n5.html                      # HUB: 2 khóa + menu 8 mục
jlpt/n5/
├── tu-vung.html                  # picker từ vựng (25 bài)
├── tu-vung/bai-01.html … bai-25.html
├── ngu-phap.html                 # picker ngữ pháp (25 bài)
├── ngu-phap/bai-01.html … bai-25.html
├── han-tu.html                   # placeholder "đang cập nhật"
├── nghe-hieu.html                # placeholder
├── doc-hieu.html                 # placeholder
├── de-thi.html                   # placeholder
├── thi-thu.html                  # placeholder
└── tai-lieu.html                 # placeholder
```
- `jlpt/n5.html.bak_hub` = backup trang N5 cũ (bản nội dung dài trước đây).

## 5. TRẠNG THÁI TÁC VỤ

- [x] Phân tích cấu trúc 10 file nguồn (N5→N1)
- [x] Template shell đồng bộ Trí Lữ (cream/navy/gold)
- [x] Picker editorial luxury (anh Tri đã duyệt OK)
- [x] **N5**: 25 từ vựng + 25 ngữ pháp + hub + 6 placeholder
- [x] **N4**: 25 từ vựng (bài 26–50) + 25 ngữ pháp + hub + placeholder
- [x] **N3**: 21 từ vựng + 12 ngữ pháp + hub + placeholder
- [x] **N2**: 21 từ vựng + 10 ngữ pháp + hub + placeholder
- [x] **N1**: 15 từ vựng + 20 ngữ pháp + hub + placeholder
- [x] Kiểm tra toàn bộ: 199 trang bài render OK, 0 lỗi JS, 539 link nội bộ không gãy
- [ ] Push lên git → trilu.edu.vn
- [ ] Làm 4 môn EJU (Tiếng Nhật, Toán, Khoa học, Tổng hợp) — **cần file nguồn hoặc làm hub+placeholder trước**

### Số bài theo cấp
| Cấp | Từ vựng | Ngữ pháp | Engine |
|---|---|---|---|
| N5 | 25 (bài 1–25) | 25 | vocab JS · grammar article |
| N4 | 25 (bài 26–50) | 25 | vocab JS · grammar article |
| N3 | 21 | 12 | article tĩnh (Shinkanzen) |
| N2 | 21 | 10 | article tĩnh (Audio v3) |
| N1 | 15 | 20 | article tĩnh + TTS bar |

## 5b. SCRIPT BUILD (trong sandbox Cowork)
- `build_lessons.js` — tách file vocab engine `LESSONS{}` (N5, N4 từ vựng)
- `build_grammar.js` — tách `<article class="document" id="lesson-N">` (N5/N4 ngữ pháp, N3 cả hai)
- `build_static.js` — tách article tổng quát + TTS bar + 2 style/script (N2, N1 cả hai)
- `build_hub.js` — sinh hub 8 mục + 6 placeholder
- `picker_template.js` — giao diện trang chọn bài dùng chung

## 6. GHI CHÚ KỸ THUẬT

- Trang dùng **đường dẫn gốc** (`/jlpt/...`, `/nav.js`, `/icon-180.png`) → xem chuẩn nhất khi đã push lên trilu.edu.vn (mở bằng `file://` có thể lệch ảnh/link).
- Mỗi bài từ vựng ~130KB (CSS + engine + data 1 bài) thay vì file gốc 315KB chứa cả 25 bài.
- Sandbox **không xóa được file** (chỉ ghi đè) — build chạy lại sẽ overwrite, không cần xóa thủ công.
- Romaji/kana/nghĩa giữ y nguyên từ file gốc, không tự thêm/sửa.

## 7. CÁCH ĐƯA LÊN WEB — CẦN ANH TRI CHẠY 1 LỆNH

Toàn bộ đã được **commit gộp tại chỗ**: commit `c6a2627` (259 file) — gồm 199 trang bài + hub + trang chọn bài design mới + `jlpt-study.css`.

Cowork KHÔNG push được (sandbox không có credential GitHub, vì bảo mật). Anh Tri mở **Terminal** và chạy:

```
cd ~/Downloads/trilu-deploy
git push origin main
```

- Nếu báo lỗi `index.lock`: chạy `rm -f .git/index.lock` rồi push lại.
- Sau 1–2 phút → GitHub Pages deploy → xem tại https://www.trilu.edu.vn/jlpt/n5.html

## 8. ĐÃ HOÀN THÀNH (cập nhật 2026-05-30)
- 199 trang bài Từ vựng + Ngữ pháp N5–N1 (tách riêng từng bài).
- Hub 5 cấp + 10 trang chọn bài theo **thiết kế Claude Design** (editorial luxury, `jlpt-study.css`).
- 30 trang placeholder cho 6 học phần còn lại.
- 4 prompt giao Cowork song song: `PROMPT-A-THI-THU.md`, `PROMPT-B-DOC-HIEU.md`, `PROMPT-C-NGHE-HIEU.md`, `PROMPT-D-KAIWA.md`.

## 9. CÒN LẠI
- Anh Tri push (lệnh ở mục 7).
- Phần Thi thử / Đọc hiểu / Nghe hiểu / Kaiwa: giao 4 Cowork song song (xem các file PROMPT).
- Nâng cấp khung trang bài học (lesson chrome) theo design mới — đợt sau.
