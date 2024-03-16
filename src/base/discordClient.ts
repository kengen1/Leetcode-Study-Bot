import { Client, GatewayIntentBits, TextChannel, Message } from 'discord.js';
import * as moment from 'moment-timezone';
import axios from 'axios';

export class DiscordBot {
    private client: Client;
    private readonly token: string;
    private readonly channelId: string;

    constructor(token: string, channelId: string) {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ]
        });
        this.token = token;
        this.channelId = channelId;

        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user?.tag}!`);
            this.scheduleDailyMessage();
        });

        this.client.on('messageCreate', (message: Message) => this.handleMessage(message));
    }

    public start(): void {
        this.client.login(this.token);
    }

    private scheduleDailyMessage(): void {
        const sendDailyMessage = () => {
            const channel = this.client.channels.cache.get(this.channelId) as TextChannel;
            channel?.send('Test message');
        };

        const sydneyTime = moment.tz('Australia/Sydney');
        const nextSend = sydneyTime.clone().hour(12).minute(0).second(0);
        if (sydneyTime > nextSend) nextSend.add(1, 'day');

        setTimeout(() => {
            sendDailyMessage();
            setInterval(sendDailyMessage, 24 * 60 * 60 * 1000); // Repeat every 24 hours
        }, nextSend.diff(sydneyTime));
    }

    private handleMessage(message: Message): void {
        if (message.author.bot) return;

        switch (message.content.toLowerCase()) {
            case '!help':
                this.handleHelpCommand(message);
                break;
            case '!daily':
                this.handleDailyCommand(message);
                break;
            case '!hint':
                this.handleHintCommand(message);
                break;
            default:
                break;
        }
    }

    private handleHelpCommand(message: Message): void {
        // Placeholder
        message.reply('Help explaining the problem');
    }

    private handleDailyCommand(message: Message): void {
        // Placeholder
        message.reply('Daily LeetCode Question');
        
        // Create GraphQL request to https://leetcode.com/graphql/
        // Define the GraphQL query
        const graphqlQuery = `
            query questionOfToday {
                activeDailyCodingChallengeQuestion {
                date
                userStatus
                link
                question {
                    acRate
                    difficulty
                    freqBar
                    frontendQuestionId: questionFrontendId
                    isFavor
                    paidOnly: isPaidOnly
                    status
                    title
                    titleSlug
                    hasVideoSolution
                    hasSolution
                    topicTags {
                    name
                    id
                    slug
                    }
                }
                }
            }
            `;

        // Define the GraphQL endpoint
        const graphqlEndpoint = 'https://leetcode.com/graphql/';

        // Define the GraphQL request headers
        const headers = {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com/',
        };

        // Send the POST request to the GraphQL endpoint
        axios.post(
        graphqlEndpoint,
        {
            query: graphqlQuery,
        },
        { headers }
        )
        .then((response) => {
            console.log('GraphQL response:', response.data);
            console.log(response.data.question);

        })
        .catch((error) => {
            console.error('Error executing GraphQL query:', error);
        });
    }

    private handleHintCommand(message: Message): void {
        // Placeholder
        message.reply('Here is your hint. Good luck!');
    }
}
