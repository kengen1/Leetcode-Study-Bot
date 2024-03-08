import { Client, GatewayIntentBits, TextChannel } from 'discord.js';

export class DiscordBot {
    private client: Client;
    private readonly token: string;
    private readonly channelId: string;

    constructor(token: string, channelId: string) {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
            ]
        });
        this.token = token;
        this.channelId = channelId;

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user?.tag}!`);
            this.sendMessageEveryMinute();
        });
    }

    public start(): void {
        this.client.login(this.token);
    }

    private sendMessageEveryMinute(): void {
        setInterval(() => {
            const channel = this.client.channels.cache.get(this.channelId) as TextChannel;
            channel.send('Test message');
        }, 60000);
    }
}