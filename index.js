const TelegramBot = require("node-telegram-bot-api");
const { getTransactions } = require("./config/db");
const {
  getTotalBoughtAmount,
  getCurrentBoughtAmount,
} = require("./helper/cal");

require("dotenv").config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

let txLength = 0;

// Add command handler for /start to test the message
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  // Send a welcome message
  await bot.sendMessage(chatId, "Welcome! Sending a test burn notification...");

  // Send a test burn notification with sample data
  const testTotalAmount = "1250.75";
  const testCurrentAmount = "42.50";
  const testType = "subscription"; // or "exchange" to test the other format

  // Send test message to the user who sent the command
  try {
    const message = `🔥 *TOKEN BURN DETECTED* 🔥

━━━━━━━━━━━━━━━━━━━━━━
💎 *Burn Details* 💎
━━━━━━━━━━━━━━━━━━━━━━

${
  testType === "subscription"
    ? "🔄 *New Burn:* " +
      testCurrentAmount +
      " $CHRLE from Subscription (Party Application)"
    : "🎟️ *New Burn:* " +
      testCurrentAmount +
      " $CHRLE from Ticket Exchange (Party Application)"
}

🔥 *Total Burned:* ${testTotalAmount} $CHRLE

━━━━━━━━━━━━━━━━━━━━━━

⏰ *Processed at:* ${new Date().toLocaleString()}

✅ *Burn completed successfully!*`;

    await bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("send test message error: ", error);
  }
});

async function scanTransaction() {
  try {
    const txs = await getTransactions();

    console.log(txs.length, txLength);

    if (!txs || txs.length === 0) return;

    if (txLength === 0) {
      txLength = txs.length;
      return;
    }

    if (txLength < txs.length) {
      const totalAmount = getTotalBoughtAmount(txs);
      console.log(totalAmount);
      const currentAmount = getCurrentBoughtAmount(txs[txs.length - 1], txs);
      console.log(currentAmount);
      await sendMessage(
        totalAmount.toFixed(2),
        currentAmount.toFixed(2),
        txs[txs.length - 1].type,
        txs[txs.length - 1].createdAt
      );
      txLength = txs.length;
    }
  } catch (error) {
    console.error("Scan transaction error:", error);
  }
}

async function sendMessage(totalAmount, currentAmount, type, createdAt) {
  try {
    const message = `🔥 *TOKEN BURN DETECTED* 🔥

━━━━━━━━━━━━━━━━━━━━━━
💎 *Burn Details* 💎
━━━━━━━━━━━━━━━━━━━━━━

${
  type === "subscription"
    ? "🔄 *New Burn:* " +
      currentAmount +
      " $CHRLE from Subscription (Party Application)"
    : "🎟️ *New Burn:* " +
      currentAmount +
      " $CHRLE from Ticket Exchange (Party Application)"
}

🔥 *Total Burned:* ${totalAmount} $CHRLE

━━━━━━━━━━━━━━━━━━━━━━

⏰ *Processed at:* ${new Date(createdAt).toLocaleString()}

✅ *Burn completed successfully!*`;

    await bot.sendMessage(CHANNEL_ID, message, { parse_mode: "Markdown" });
  } catch (error) {
    console.error("Send message error:", error);
  }
}

scanTransaction();

setInterval(scanTransaction, 30000);

console.log("Bot started and scanning for transactions every 2 minutes");

bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
});
