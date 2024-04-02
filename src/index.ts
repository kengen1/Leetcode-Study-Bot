import { DiscordBot } from "./bot/DiscordBot";
import { config } from "./config/index";

const bot = new DiscordBot(
    config.DISCORD_TOKEN, 
    config.DISCORD_CHANNEL_ID, 
    config.DISCORD_DAILY_CHALLENGE_CHANNEL_ID, 
    config.DISCORD_ROADMAP_CHANNEL_ID, 
    config.ENVIRONMENT
    );

bot.start();