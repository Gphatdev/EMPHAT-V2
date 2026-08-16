# EMPHAT V2

Chatbot Zalo cá nhân được xây dựng bằng thư viện không chính thức [zca-js](https://tdung.gitbook.io/zca-js).

> 🛑 **Lưu ý:** Sử dụng `zca-js` có thể vi phạm chính sách của Zalo.

> 🛑 **Lưu ý:** Đây chỉ là soure mẫu nên sẽ thiếu nhiều tính năng cần file full liên hệ mih để lấy nhé!!!!!
---

## 🚀 Tính năng chính

- Lắng Nghe Từ Các Handle
- Xử Lý Lệnh Qua Core/Commands & NoPrefix
- Xử Lý Các Điều Kiện Tự Động Qua Auto/ & Anti/
- Xử Lý Thanh Toán Tự Động Thông Qua Sepay
- Tích Hợp AI GPT Từ https://openrouter.ai/
---

## 📂 Cấu trúc thư mục mẫu

```
Baodubai_ZaloChat/
├── App/
│   ├── AutoSend.json       # Setup AutoSend
│   ├── Cookie.json         # Setup Cookie Zalo
│   ├── Settings.js         # Setup Imei & UserAgent
│   ├── BotInstance.js      # Api Xử Lý Sepay
│   └── Database.js         # Setup Database SQLite (tự động tạo file .db)
├── Auto/
│   ├── AutoDown.js         # Auto Downloads Từ 10+ Nển Tảng
│   ├── AutoSend.js         # AutoSend Text / Audio / File / Image
│   ├── TuongTacNgay.js     # Auto Send Top Day
│   ├── TuongTacTuan.js     # Auto Send Top Week
│   └── TuongTacThang.js    # Auto Send Top Month
├── Anti/
│   ├── AntiSpam.js         # Cấm Spam
│   └── AntiLink.js         # Cấm Gửi Link
├── Handlers/
│   └── Core.js             # Logic Xử Lý Event 
├── zalo.js                 # Điều Hướng Các File
└── README.md
```

---

## ⚙️ Cài đặt

### 1. Clone repo

```bash
git clone https://github.com/Gphatdev/EMPHAT-V2.git
cd EMPHAT-V2
```

### 2. Cài dependencies

```bash
npm install
```

> Hoặc nếu bạn dùng `bun`:
```bash
bun install
```

---

## 🔧 Cấu hình

### `App/Settings.js` 
```js
export const settings = {
  imei: "YOUR_IMEI",  
  userAgent: "YOUR_USER_AGENT" 
};
```

### `App/Cookie.json`
```json
{
    
}
```

### Database (SQLite)
Bot dùng SQLite, không cần cài MySQL server. File database sẽ tự động được tạo
theo đường dẫn cấu hình ở biến `DB_PATH` trong file `.env` (mặc định `./Data/zgwen.db`).

---

## ▶️ Chạy bot

```bash
node .
```

---

## 🔌 Webhook & API

| Route         | Mô tả                         |
|---------------|-------------------------------|
| `/`           | Check thanh toán (SePay)      |
| `/Router`     | Nhận webhook từ SePay Gateway |

---

## 📝 Ghi chú

- Api Hook Sepay: https:/domain/sepay_webhook
- 
- Hệ thống modular dễ mở rộng cho tính năng như auto-reply theo từ khoá

---

## ⚠️ Cảnh báo

> ❗ **Không sử dụng tài khoản chính để test.**
> ❗ Zalo có thể chặn tài khoản nếu phát hiện hoạt động tự động.
> ❗ Sử dụng tại máy chủ riêng và tránh spam người khác.

---

## 📜 Giấy phép

Dự án này sử dụng license `MIT`. Bạn có thể tự do fork, chỉnh sửa, nhưng **hãy chịu trách nhiệm khi sử dụng zca-js** trong môi trường thật.

---

## 👤 Tác giả

**Baodubai**  
📬 GitHub: [Gphatdev](https://github.com/Gphatdev)  

