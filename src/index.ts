import { DiscordBot } from "./bot/DiscordBot";
import { config } from "./config/index";

const bot = new DiscordBot(
    config.DISCORD_TOKEN, 
    config.DISCORD_TEST_CHANNEL_ID, 
    config.DISCORD_DAILY_CHANNEL_ID, 
    config.DISCORD_ROADMAP_CHANNEL_ID, 
    config.ENVIRONMENT
    );

bot.start();