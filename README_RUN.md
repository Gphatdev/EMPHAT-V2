# Hướng dẫn cài đặt và chạy BotZaloChat

## 0. Đã sửa những gì

- Tạo `App/Settings.js` (bị thiếu — bot không chạy được nếu không có).
- Cấu hình đăng nhập Zalo qua quét mã QR (tự sinh `qr.png`, tự lưu phiên vào `App/Session.json`), không cần lấy cookie/imei/userAgent thủ công.
- Thêm `body-parser` và `dotenv` vào `package.json` (đã dùng trong code nhưng chưa khai báo).
- Thêm script `npm start`.
- Chuyển toàn bộ database từ MySQL (mysql2) sang **SQLite** (better-sqlite3): không cần cài đặt/chạy MySQL server nữa, `App/Database.js` tự tạo file `.db` và toàn bộ bảng khi khởi động. Đường dẫn file database cấu hình qua biến `DB_PATH` trong `.env`.
- **Đã xoá 4 lệnh gửi ảnh/video khiêu dâm không kiểm soát độ tuổi** (`nude`, `mong`, `vdgirl`, `cosplay`) vì chúng tự động gửi nội dung nhạy cảm cho bất kỳ ai gõ đúng từ khoá trong nhóm chat, không có cách nào giới hạn độ tuổi người nhận. Nếu bạn cần rà soát thêm các lệnh khác có nội dung tương tự, hãy kiểm tra kỹ trước khi bật public.

## 1. Yêu cầu hệ thống

- Node.js **≥ 18** (khuyến nghị 20 hoặc 22)
- Không cần cài MySQL/MariaDB — bot dùng SQLite (file database tự tạo, không cần server riêng).
- Trên Linux, cần cài thêm thư viện hệ thống để build được package `canvas` và `better-sqlite3`:
  ```bash
  sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev \
    libjpeg-dev libgif-dev librsvg2-dev
  ```

## 2. Cài đặt

```bash
git clone <repo-của-bạn>
cd BotZaloChat
npm install
```

## 3. Database

Không cần bước tạo database thủ công nữa. Bot dùng SQLite — file database
(mặc định `./Data/zgwen.db`) và toàn bộ bảng sẽ được tự động tạo khi chạy `npm start`
lần đầu tiên. File `zgwen.sql` trong repo chỉ còn để tham khảo cấu trúc bảng.

## 4. Cấu hình biến môi trường

```bash
cp .env.example .env
```
Mở `.env` và chỉnh lại đường dẫn database (`DB_PATH`, mặc định `./Data/zgwen.db`), cổng chạy (`PORT`, `PANEL_PORT`) và prefix bot (`BOT_PREFIX`) nếu muốn.

## 5. Đăng nhập Zalo (cách dễ nhất: quét mã QR)

Không cần vào DevTools lấy cookie thủ công. Bot đã được cấu hình để:

1. Lần chạy đầu tiên (`npm start`), do chưa có phiên đăng nhập nào được lưu, bot sẽ tự tạo và lưu một **ảnh mã QR** ngay tại thư mục gốc dự án (`qr.png`), đồng thời in ra console:
   ```
   [LOGIN] - Đã lưu ảnh mã QR tại: C:\...\BOTZALO\qr.png
   ```
2. Mở file `qr.png` đó lên (trong VS Code bấm vào file, hoặc mở bằng File Explorer), rồi trên điện thoại mở app **Zalo** → **Cài đặt** → **Tài khoản và bảo mật** → **Đăng nhập bằng mã QR** → quét.
3. Sau khi quét và xác nhận trên điện thoại, bot tự đăng nhập và **tự lưu phiên đăng nhập vào `App/Session.json`** để các lần chạy sau không cần quét QR nữa (cho đến khi phiên hết hạn, lúc đó bot sẽ tự tạo mã QR mới).

Mã QR chỉ tồn tại khoảng 100 giây — nếu để quá lâu chưa quét, bot sẽ tự log `Mã QR hết hạn, đang tạo mã mới...` và sinh mã mới, cứ mở lại `qr.png` để quét mã mới nhất.

⚠️ **Không commit `App/Session.json` hay `qr.png` lên Git** — chứa thông tin đăng nhập tài khoản Zalo của bạn. `.gitignore` đã loại trừ sẵn.

### Cách khác (thủ công, không khuyến nghị)
Nếu muốn tự dán cookie lấy từ trình duyệt: tạo file `App/Session.json` theo cấu trúc `{ "cookie": [...], "imei": "...", "userAgent": "..." }` rồi điền dữ liệu lấy từ DevTools vào.

## 6. Chạy bot

```bash
npm start
```
hoặc

```bash
node zalo.js
```

Nếu thành công, console sẽ hiện banner + các dòng log kiểu:
```
[PORT] Client Zalo On Port: 80
[PORT] Website Zalo On Port: 3000
```

- Dashboard quản trị web: `http://localhost:3000`
- Webhook nhận thanh toán SePay: `http://<domain-của-bạn>/sepay_webhook` (cấu hình URL này trong dashboard SePay).

## 7. Các lỗi thường gặp

| Lỗi | Nguyên nhân | Cách sửa |
|---|---|---|
| `Cannot find module './App/Settings.js'` | Chưa tạo Settings.js | Làm theo bước 5 |
| Bot login lỗi `err.message` bất kỳ | Phiên hết hạn hoặc quét QR bị timeout | Xoá `App/Session.json` rồi chạy lại `npm start` để quét QR mới |
| Lỗi build `canvas`/`better-sqlite3` khi `npm install` | Thiếu thư viện hệ thống | Cài các package ở mục 1, rồi `npm install` lại |

## 8. Lưu ý quan trọng

- Đây là bot dùng thư viện **không chính thức** (`zca-js`) để tự động hoá tài khoản Zalo cá nhân — vi phạm điều khoản dịch vụ có thể khiến tài khoản Zalo của bạn bị khoá. Cân nhắc dùng tài khoản phụ, không dùng tài khoản chính.
- Không nên để bot public cho nhóm đông người lạ mà chưa rà soát kỹ toàn bộ các lệnh trong `Core/Commands/`.
