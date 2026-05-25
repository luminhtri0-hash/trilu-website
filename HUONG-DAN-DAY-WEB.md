# 📘 Hướng dẫn đưa website Trí Lữ Nihongo lên trilu.edu.vn

> Dành cho người **không rành kỹ thuật**. Đọc từ trên xuống dưới, làm theo từng bước. Toàn bộ hướng dẫn này **không tốn thêm một đồng nào** ngoài tiền domain bạn đã có.

---

## 🎯 Mục tiêu cuối cùng

Sau khi làm xong, gõ `trilu.edu.vn` vào trình duyệt → website Trí Lữ Nihongo của bạn hiện ra, có **HTTPS (ổ khoá xanh)**, **chạy nhanh trên toàn thế giới**, **miễn phí trọn đời**.

---

## 💡 Tổng quan: Tại sao chọn cách này?

Bạn KHÔNG cần mua hosting truyền thống (Vietnix, MatBao, AZDIGI...). Lý do:

| Hosting truyền thống (300k–2tr/năm) | Cloudflare Pages (MIỄN PHÍ) |
|---|---|
| Phải cài WordPress, dễ lỗi | Chỉ cần kéo thả file HTML |
| Tốc độ phụ thuộc server VN | CDN toàn cầu, nhanh như Google |
| Tự cài SSL, dễ hỏng | SSL tự động, miễn phí trọn đời |
| Bị tấn công thường xuyên | Firewall + chống DDoS tự động |
| Phải gia hạn hằng năm | Không bao giờ hết hạn |

**Kết luận:** Với web tĩnh (HTML/CSS/JS) như của bạn, dùng **Cloudflare Pages** là tối ưu nhất.

---

## 📋 Lộ trình tổng thể (5 bước, ~45 phút)

```
Bước 1: Tạo tài khoản GitHub      ──┐
Bước 2: Upload code lên GitHub      ├── (mất ~15 phút)
Bước 3: Tạo tài khoản Cloudflare  ──┘
Bước 4: Kết nối GitHub → Cloudflare Pages    (~10 phút)
Bước 5: Trỏ domain trilu.edu.vn về Cloudflare (~20 phút, đợi DNS)
```

---

## 🟢 BƯỚC 1 — Tạo tài khoản GitHub (5 phút)

GitHub là "kho lưu trữ code" miễn phí.

1. Vào https://github.com
2. Nhấn **Sign up** (góc trên bên phải)
3. Nhập email (nên dùng `triluedu@gmail.com`)
4. Đặt mật khẩu mạnh, ghi vào sổ tay
5. Đặt username, ví dụ: `trilu-nihongo`
6. Xác nhận qua email

✅ Xong. Đăng nhập vào GitHub.

---

## 🟢 BƯỚC 2 — Upload website lên GitHub (10 phút)

### 2.1. Tạo Repository (kho chứa code)

1. Sau khi đăng nhập, click dấu **+** góc trên bên phải → **New repository**
2. **Repository name:** `trilu-website`
3. Chọn **Public** (miễn phí)
4. Tick ô "**Add a README file**"
5. Nhấn **Create repository**

### 2.2. Upload files

1. Trong repository vừa tạo, click nút **Add file** → **Upload files**
2. Mở Finder máy Mac → vào folder `Lộ Trính JLPT và Kaiwa/website/`
3. Chọn **TẤT CẢ** file và folder bên trong:
   - `index.html`
   - `jlpt.html`, `kaiwa.html`, ... (các file HTML khác)
   - Folder `assets/` (kéo cả folder vào)
4. Kéo thả vào ô upload trên GitHub
5. Cuộn xuống dưới, nhấn **Commit changes**

⏱ Đợi 1-2 phút cho upload xong.

✅ Web của bạn giờ đã ở trên Internet — nhưng chưa có địa chỉ đẹp. Bước tiếp theo sẽ gắn trilu.edu.vn vào.

---

## 🟢 BƯỚC 3 — Tạo tài khoản Cloudflare (5 phút)

1. Vào https://dash.cloudflare.com/sign-up
2. Đăng ký với cùng email `triluedu@gmail.com`
3. Đặt mật khẩu (NÊN khác mật khẩu GitHub)
4. Xác nhận qua email

✅ Đăng nhập vào dashboard Cloudflare.

---

## 🟢 BƯỚC 4 — Tạo Cloudflare Pages từ GitHub (10 phút)

1. Trong dashboard Cloudflare, menu trái → **Workers & Pages**
2. Nhấn **Create** → tab **Pages** → **Connect to Git**
3. Click **Connect GitHub** → cho phép Cloudflare đọc repo của bạn
4. Chọn repository **`trilu-website`** → **Begin setup**
5. Cài đặt build:
   - **Project name:** `trilu` (chỉ chữ thường, không dấu)
   - **Production branch:** `main`
   - **Build command:** *để trống*
   - **Build output directory:** *để trống* hoặc gõ `/`
6. Nhấn **Save and Deploy**

⏱ Đợi 1-2 phút. Cloudflare sẽ cho bạn một link tạm như `trilu.pages.dev` — mở thử, web đã chạy rồi!

✅ Mở link `trilu.pages.dev` kiểm tra xem hiển thị đúng chưa.

---

## 🟢 BƯỚC 5 — Trỏ trilu.edu.vn về Cloudflare (15-30 phút)

Đây là bước **quan trọng nhất**, cần thao tác ở **2 nơi**:
- Phía Cloudflare → khai báo "tôi muốn domain này"
- Phía nhà cung cấp domain (MatBao / PA / Nhân Hoà / nơi bạn mua) → trỏ DNS sang Cloudflare

### 5.1. Khai báo domain trên Cloudflare Pages

1. Vào project **trilu** vừa tạo
2. Tab **Custom domains** → **Set up a custom domain**
3. Nhập `trilu.edu.vn` → **Continue** → **Activate domain**
4. Cloudflare sẽ hiện ra một dòng kiểu:
   ```
   CNAME    trilu.edu.vn    →    trilu.pages.dev
   ```
5. Chụp màn hình hoặc copy 2 giá trị này lại. Có thể nó cũng hiện thêm yêu cầu thêm cho `www.trilu.edu.vn` — làm tương tự.

### 5.2. Vào nhà cung cấp domain để cập nhật DNS

⚠️ **Bạn mua trilu.edu.vn ở đâu?** Đăng nhập vào trang đó. Các nhà cung cấp .edu.vn phổ biến tại VN:
- **MatBao** → https://id.matbao.net
- **PA Việt Nam** → https://my.pavietnam.vn
- **Nhân Hoà** → https://id.nhanhoa.com
- **iNet** → https://id.inet.vn
- **VietNam Domain** → https://my.tenten.vn

(Mở email khi bạn mua domain để biết là bên nào.)

Sau khi đăng nhập:

1. Tìm phần **Quản lý domain** / **Quản lý tên miền**
2. Chọn domain `trilu.edu.vn` → click **Quản lý DNS** / **DNS Manager**
3. **XOÁ** các bản ghi A, CNAME cũ trỏ về web cũ (nếu có)
4. Thêm 2 bản ghi mới:

   | Type | Name | Value | TTL |
   |---|---|---|---|
   | CNAME | @ (hoặc trilu.edu.vn) | trilu.pages.dev | Auto / 3600 |
   | CNAME | www | trilu.pages.dev | Auto / 3600 |

   > 💡 Nếu nhà cung cấp KHÔNG cho phép CNAME ở record `@`, bạn dùng record **A** với IP của Cloudflare: `192.0.2.1` và bật proxy nếu họ hỗ trợ. Hoặc gọi support nhà cung cấp nhờ hỗ trợ trỏ về `trilu.pages.dev` — họ sẽ làm giúp.

5. **Lưu** lại.

### 5.3. Đợi DNS lan toả

- Thường mất **15 phút – 2 giờ** để DNS cập nhật toàn cầu.
- Với .edu.vn có thể lâu hơn một chút (do VNNIC kiểm duyệt).

### 5.4. Kiểm tra

Sau khi đợi, quay lại Cloudflare Pages → tab **Custom domains** → trạng thái sẽ chuyển từ "Verifying" → ✅ **Active**.

Mở trình duyệt → gõ **https://trilu.edu.vn** → web hiện ra với ổ khoá xanh = THÀNH CÔNG! 🎉

---

## 🔄 Sau này muốn sửa web?

Cực đơn giản:

**Cách 1 — Sửa trực tiếp trên GitHub (cho text nhỏ):**
1. Vào repo `trilu-website`
2. Click file cần sửa (vd: `index.html`)
3. Click biểu tượng cây bút ✏️
4. Sửa nội dung → cuộn xuống → **Commit changes**
5. Cloudflare sẽ tự deploy lại sau ~30 giây

**Cách 2 — Sửa hàng loạt (khuyên dùng):**
1. Sửa file trong folder máy tính của bạn
2. Vào GitHub repo → **Add file** → **Upload files** → kéo lại file đã sửa
3. **Commit**

> 💡 Sau này nếu bạn muốn chuyên nghiệp hơn, cài thêm **GitHub Desktop** (https://desktop.github.com) để sync tự động.

---

## 🎬 Cách thay video nền hero

File `index.html` của bạn đang dùng video Cherry Blossom mặc định. Để dùng video riêng:

1. **Quay/Tải video đẹp về Nhật Bản** (Pixabay, Coverr.co, Pexels Videos — đều miễn phí):
   - Đề xuất từ khoá: `tokyo street`, `japan night`, `cherry blossom`, `mount fuji`, `kyoto temple`
2. **Nén video** xuống dưới 5MB tại https://www.veed.io/tools/video-compressor
3. Đổi tên thành `hero.mp4`
4. Upload lên repo GitHub vào folder `assets/img/`
5. Mở `index.html`, tìm dòng:
   ```html
   <source src="https://cdn.coverr.co/videos/..." type="video/mp4">
   ```
   Đổi thành:
   ```html
   <source src="assets/img/hero.mp4" type="video/mp4">
   ```
6. Commit → tự deploy.

---

## 📞 Cập nhật thông tin liên hệ thực

Mở `index.html`, tìm các đoạn sau và sửa:

| Chỗ cần sửa | Đổi thành |
|---|---|
| `href="tel:+84000000000"` | Số điện thoại thật của bạn |
| `href="https://zalo.me/"` | Link Zalo của bạn |
| `href="https://m.me/"` | Link Messenger fanpage |
| `triluedu@gmail.com` | Email của bạn (đã đúng) |

---

## 🆘 Khi gặp lỗi

| Lỗi | Cách xử lý |
|---|---|
| `DNS_PROBE_FINISHED` khi vào trilu.edu.vn | Đợi thêm 1-2h cho DNS lan toả |
| Web hiện nhưng không có HTTPS | Vào Cloudflare → SSL/TLS → set chế độ **Full** |
| Đã sửa code nhưng web không cập nhật | Vào Cloudflare Pages → tab **Deployments** xem đã deploy thành công chưa. Nếu chưa, bấm **Retry deployment** |
| Không trỏ được CNAME cho @ | Gọi hotline nhà cung cấp domain, đọc cho họ: "Em muốn trỏ tên miền về `trilu.pages.dev` qua CNAME flattening hoặc record A" |

---

## 💰 Tổng chi phí

| Khoản | Chi phí |
|---|---|
| Domain trilu.edu.vn | ~250-500k/năm (bạn đã có) |
| Hosting Cloudflare Pages | **0đ — Miễn phí trọn đời** |
| SSL (chứng chỉ HTTPS) | **0đ — Miễn phí** |
| CDN toàn cầu | **0đ — Miễn phí** |
| **TỔNG/năm** | **Chỉ tiền domain** |

---

## 🚀 Khi nào nên nâng cấp?

Bạn nên giữ Cloudflare Pages cho đến khi:

- Có > 100 học viên trả phí cần quản lý → cần thêm **Firebase Auth** (miễn phí 50k user) hoặc **Supabase**
- Muốn bán khoá học online → tích hợp **Stripe** hoặc **Vietqr / VNPay**
- Muốn dạy video → upload lên **YouTube unlisted** và nhúng vào web (vẫn miễn phí)

Lúc đó hãy gọi lại tôi giúp bạn nhé.

---

## ✉️ Tóm tắt việc cần làm hôm nay

- [ ] Tạo tài khoản GitHub
- [ ] Upload folder `website/` lên repo `trilu-website`
- [ ] Tạo tài khoản Cloudflare
- [ ] Tạo project Cloudflare Pages connect repo
- [ ] Đăng nhập nhà cung cấp domain → thêm 2 CNAME record
- [ ] Đợi 30 phút → kiểm tra https://trilu.edu.vn
- [ ] Sửa số điện thoại / Zalo / Messenger trong `index.html`
- [ ] Quay/tải video Nhật Bản, thay vào hero

Chúc bạn deploy thành công! 🎌
