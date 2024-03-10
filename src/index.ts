import { DiscordBot } from "./base/discordClient";
import { config } from "./config/index";

const bot = new DiscordBot(config.DISCORD_TOKEN, config.DISCORD_CHANNEL_ID);
bot.start();