-- Ghi chú: File này chỉ để tham khảo cấu trúc dữ liệu.
-- Kể từ khi bot chuyển sang dùng SQLite (better-sqlite3), KHÔNG cần import file này nữa.
-- App/Database.js sẽ tự động tạo file database SQLite (đường dẫn cấu hình qua DB_PATH trong .env)
-- và tự tạo toàn bộ các bảng bên dưới nếu chưa tồn tại.

CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id TEXT UNIQUE,
  name TEXT,
  expire_at TEXT,
  time TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  cmd TEXT PRIMARY KEY,
  status INTEGER DEFAULT 1,
  thread TEXT
);

CREATE TABLE IF NOT EXISTS tb_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT NOT NULL,
  total INTEGER NOT NULL,
  payment_status TEXT DEFAULT 'Unpaid',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  name TEXT
);

CREATE TABLE IF NOT EXISTS tb_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gateway TEXT,
  transaction_date TEXT,
  account_number TEXT,
  sub_account TEXT,
  amount_in INTEGER,
  amount_out INTEGER,
  accumulated INTEGER,
  code TEXT,
  transaction_content TEXT,
  reference_number TEXT,
  body TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uid TEXT UNIQUE,
  name TEXT,
  vnd INTEGER DEFAULT 0,
  admin INTEGER DEFAULT 0,
  tuongtac TEXT,
  ban INTEGER DEFAULT 0,
  thread_id TEXT,
  thread_name TEXT,
  tuongtactuan INTEGER DEFAULT 0,
  tuongtacthang INTEGER DEFAULT 0,
  mute INTEGER DEFAULT 0,
  mute_expire INTEGER,
  tongnap INTEGER DEFAULT 0,
  caro INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0
);