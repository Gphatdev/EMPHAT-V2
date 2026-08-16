// author @GwenDev
import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import checkPaymentRouter from "./Routes/checkPaymentRouter.js";
import sepayWebhook from "./Routes/sepayWebhook.js";
import { Zalo } from "zca-js";
import { LoginQRCallbackEventType } from "zca-js";
import fs from "fs/promises";
import path from "path";
import { loadImage } from "canvas";
import { settings } from "./App/Settings.js";
import { init } from "./Handlers/Core.js";
import { startAutoDown } from "./Auto/AutoDown.js";
import { startAutoSend } from "./Auto/AutoSend.js";
import { startAntiSpam } from "./Anti/AntiSpam.js"; 
import { startAntiLink } from "./Anti/AntiLink.js";
import { Logger, log } from "./Utils/Logger.js";
import { startTopNgay } from "./Auto/TuongTacNgay.js";
import { startTopTuan } from "./Auto/TuongTacTuan.js";
import { startTopThang } from "./Auto/TuongTacThang.js";
import { setApiInstance } from "./App/BotInstance.js";
import { query } from "./App/Database.js";
import { updatesql } from "./Database/Update.js";
import "./server.js"; 

await Logger();
await updatesql();

// zca-js >= 2.0 không còn tự đọc kích thước ảnh (đã bỏ sharp),
// nên phải tự cung cấp hàm lấy metadata (width/height/size) cho ảnh gửi qua đường dẫn file.
async function imageMetadataGetter(filePath) {
  const [stat, img] = await Promise.all([
    fs.stat(filePath),
    loadImage(filePath)
  ]);
  return {
    width: img.width,
    height: img.height,
    size: stat.size
  };
}

const zalo = new Zalo({
  selfListen: false,
  checkUpdate: false,
  logging: false,
  imageMetadataGetter
});

// Lưu cả cookie + imei + userAgent, vì cả 3 đều cần thiết để đăng nhập lại bằng phiên cũ
const sessionPath = path.resolve("App", "Session.json");
const qrImagePath = path.resolve("qr.png");

async function loginZalo() {
  // 1) Nếu đã có phiên đăng nhập lưu từ lần trước, thử đăng nhập nhanh (không cần quét QR lại)
  let savedSession = null;
  try {
    savedSession = JSON.parse(await fs.readFile(sessionPath, "utf-8"));
  } catch {
    // chưa có phiên nào được lưu, sẽ chuyển sang quét QR bên dưới
  }

  if (savedSession?.cookie && savedSession?.imei && savedSession?.userAgent) {
    try {
      const api = await zalo.login({
        cookie: savedSession.cookie,
        imei: savedSession.imei,
        userAgent: savedSession.userAgent
      });
      log("[LOGIN] - Đăng nhập bằng phiên đã lưu thành công.", "auto");
      return api;
    } catch (err) {
      log("[LOGIN] - Phiên đã lưu hết hạn hoặc không hợp lệ, chuyển sang quét mã QR...", "warn");
    }
  }

  // 2) Không có phiên hoặc phiên hết hạn -> quét mã QR bằng app Zalo trên điện thoại
  const api = await zalo.loginQR({}, (event) => {
    switch (event.type) {
      case LoginQRCallbackEventType.QRCodeGenerated:
        event.actions.saveToFile(qrImagePath).then(() => {
          log(`[LOGIN] - Đã lưu ảnh mã QR tại: ${qrImagePath}`, "new");
          log(`[LOGIN] - Mở ảnh trên, quét bằng app Zalo: Cài đặt > Tài khoản và bảo mật > Đăng nhập bằng mã QR.`, "new");
        });
        break;
      case LoginQRCallbackEventType.QRCodeScanned:
        log(`[LOGIN] - Đã quét mã, xác nhận đăng nhập trên điện thoại (${event.data?.display_name || ""})...`, "new");
        break;
      case LoginQRCallbackEventType.QRCodeExpired:
        log("[LOGIN] - Mã QR hết hạn, đang tạo mã mới...", "warn");
        event.actions.retry();
        break;
      case LoginQRCallbackEventType.QRCodeDeclined:
        log("[LOGIN] - Đã từ chối đăng nhập trên điện thoại.", "error");
        break;
      case LoginQRCallbackEventType.GotLoginInfo:
        // Lưu lại phiên đăng nhập để lần chạy sau không cần quét QR nữa
        fs.writeFile(
          sessionPath,
          JSON.stringify(
            { cookie: event.data.cookie, imei: event.data.imei, userAgent: event.data.userAgent },
            null,
            2
          ),
          "utf-8"
        )
          .then(() => log("[LOGIN] - Đã lưu phiên đăng nhập vào App/Session.json cho lần chạy sau.", "auto"))
          .catch((err) => log("[LOGIN] - Không lưu được phiên đăng nhập: " + err.message, "warn"));
        break;
    }
  });

  return api;
}

try {
  const api = await loginZalo();

  init(api);
  startAutoDown(api);
  startAutoSend(api);
  startAntiSpam(api); 
  startAntiLink(api);
  startTopNgay(api);
  startTopTuan(api);
  startTopThang(api);
  setApiInstance(api);

  log("[AUTO] - Settings AutoDown.", "auto");
  log("[AUTO] - Start Top Message.", "auto");
  log("[AUTO] - Settings AutoSend.", "auto");
  log("[ANTI] - Settings AntiSpam.", "auto");
  log("[ANTI] - Settings AntiLink.", "auto");
  log("[CORE] - Settings Core.", "auto");
  log("[SEPAY] - Settings Banking.", "auto");
  log("[API] - Settings Api.", "auto");
  log("[LOGIN] - Settings Login.", "auto");
 
  const app = express();
  const PORT = process.env.PORT || 80;

  app.use(bodyParser.json());
  app.use("/", checkPaymentRouter);
  app.use("/", sepayWebhook);
console.log(api.getOwnId());

  function listenWithRetry(port, retriesLeft = 10, delayMs = 500) {
    const server = app.listen(port, () => {
      log(`[PORT] Client Zalo On Port: ${port}`, "new");
      log(`[PORT] Website Zalo On Port: 3000`, "new");
    });
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE" && retriesLeft > 0) {
        // Thường gặp ngay sau khi .reset: tiến trình cũ chưa kịp nhả cổng.
        log(`[PORT] Cổng ${port} đang bận, thử lại sau ${delayMs}ms... (còn ${retriesLeft} lần)`, "warn");
        setTimeout(() => listenWithRetry(port, retriesLeft - 1, delayMs), delayMs);
      } else {
        log(`[PORT] Lỗi khi mở cổng ${port}: ${err.message}`, "error");
      }
    });
  }

  listenWithRetry(PORT);

} catch (err) {
  log("[LOGIN] - Bot Login Err." + err.message, "error");
}