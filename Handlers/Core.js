// author @GphatDev
import { handleMessage } from "./HandleMessage.js";
import { handleReaction } from "./HandleReaction.js";
import { handleUndo } from "./HandleUndo.js";
import { handleGroupEvent } from "./HandleGroup.js";
function safe(name, fn) {
  return (...args) => {
    try {
      const result = fn(...args);
      if (result && typeof result.catch === "function") {
        result.catch((err) => {
          console.error(`[LISTENER] Lỗi không bắt được trong handler "${name}":`, err);
        });
      }
    } catch (err) {
      console.error(`[LISTENER] Lỗi đồng bộ trong handler "${name}":`, err);
    }
  };
}

export function init(api) {
  process.on("uncaughtException", (err) => {
    console.error("[PROCESS] uncaughtException:", err);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[PROCESS] unhandledRejection:", reason);
  });

  api.listener.on("message", safe("message", (msg) => handleMessage(msg, api)));
  api.listener.on("reaction", safe("reaction", (reaction) => handleReaction(reaction, api)));
  api.listener.on("undo", safe("undo", handleUndo));
  api.listener.on("group_event", safe("group_event", (event) => handleGroupEvent(event, api)));
  if (typeof api.listener.on === "function") {
    api.listener.on("error", (err) => {
      console.error("[LISTENER] api.listener bắn sự kiện lỗi:", err);
    });
  }

  api.listener.start();
}
