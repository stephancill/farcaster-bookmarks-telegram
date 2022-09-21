import * as TelegramBot from "node-telegram-bot-api"
import { resolveCast } from "./farcaster"
require("dotenv").config()

function setupBot() {
  const botOptions =
    (process.env.DEBUG || "").toLowerCase() === "true"
      ? {
          polling: true,
        }
      : {
          webHook: {
            port: parseInt(process.env.PORT),
          },
        }

  const token = process.env.BOT_TOKEN
  const url = process.env.APP_URL
  const bot = new TelegramBot(token, botOptions)

  if (botOptions.polling) {
    console.log("Polling")
  } else {
    console.log("Webhook")
    bot.deleteWebHook().then(() => {
      bot.setWebHook(`${url}/bot${token}`).then((e) => {
        console.log(e)
      })
    })
  }

  return bot
}

const bot = setupBot()

bot.onText(/(?<text>.*)/, async (msg, match) => {
  const chatId = msg.chat.id

  if (msg.text === "/start" || msg.text === "/help") {
    const msg = "Send a cast URI from the Farcaster app and I will send store it here in human readable text."
    await bot.sendMessage(chatId, msg)
    return
  }

  const castRegex = /farcaster:\/\/casts\/0x[0-9a-f]{64}\/0x[0-9a-f]{64}/
  const isCast = castRegex.test(msg.text)

  if (!isCast) {
    return
  }

  // Send processing message
  const processingPromise = bot.sendMessage(chatId, "Fetching cast...")

  // Parse cast URI
  const castAsMessage = await resolveCast(msg.text)
  await bot.sendMessage(chatId, castAsMessage, {
    parse_mode: "HTML",
  })

  // Delete processing message
  const processingMessage = await processingPromise
  bot.deleteMessage(chatId, processingMessage.message_id.toString())

  // Delete request message
  await bot.deleteMessage(chatId, msg.message_id.toString())
})
