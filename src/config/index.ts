import dotenv from "dotenv";

dotenv.config();

const { 
  DISCORD_TOKEN, 
  DISCORD_CLIENT_ID, 
  DISCORD_CHANNEL_ID, 
  DISCORD_DAILY_CHALLENGE_CHANNEL_ID,
  DISCORD_ROADMAP_CHANNEL_ID, 
} = process.env;

if (
  !DISCORD_TOKEN || 
  !DISCORD_CLIENT_ID || 
  !DISCORD_CHANNEL_ID || 
  !DISCORD_DAILY_CHALLENGE_CHANNEL_ID || 
  !DISCORD_ROADMAP_CHANNEL_ID
  ) {
  throw new Error("Missing environment variables");
}

export const config = {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  DISCORD_CHANNEL_ID,
  DISCORD_DAILY_CHALLENGE_CHANNEL_ID,
  DISCORD_ROADMAP_CHANNEL_ID,
};