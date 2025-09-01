const { Telegraf } = require("telegraf");

// 🔑 BotFather'dan olingan tokenni shu yerga yoz
const BOT_TOKEN = "7695831129:AAE-C8g7y6bQxFN84JNjH_u-SSZhGbQZzW0";

// 🌐 Netlify'da chiqqan linkni shu yerga yoz
const WEB_APP_URL = "https://creative-croquembouche-df793b.netlify.app";

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN yozilmagan! BotFather'dan token ol va qo'y.");
}

const bot = new Telegraf(BOT_TOKEN);

// /start komandasi
bot.start((ctx) => {
  ctx.reply("🎯 Reaksiya testi — Ko‘k to‘p o‘yini!", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "▶️ O‘yinni boshlash",
            web_app: { url: WEB_APP_URL },
          },
        ],
      ],
    },
  });
});

// Botni ishga tushirish
bot.launch();
console.log("✅ Bot ishga tushdi! Telegramda sinab ko‘r.");

// Graceful stop (CTRL+C bosilganda)
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
