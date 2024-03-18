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

    private async handleDailyCommand(message: Message): Promise<void> {
        // Define the endpoint and headers
        const graphqlEndpoint = 'https://leetcode.com/graphql/';
        const headers = {
            'Content-Type': 'application/json',
            'Referer': 'https://leetcode.com/',
        };

        try {
            const questionOfTodayQuery = {
                query: `
                    query questionOfToday {
                        activeDailyCodingChallengeQuestion {
                            question {
                                title
                                titleSlug
                                difficulty
                            }
                        }
                    }
                `,
            };

            let response = await axios.post(graphqlEndpoint, questionOfTodayQuery, { headers });
            const questionTitle = response.data.data.activeDailyCodingChallengeQuestion.question.title;
            const questionTitleSlug = response.data.data.activeDailyCodingChallengeQuestion.question.titleSlug;
            const questionDifficulty = response.data.data.activeDailyCodingChallengeQuestion.question.difficulty;

            console.log(`Today's question titleSlug: ${questionTitleSlug}`);

            const questionContentQuery = {
                query: `
                    query questionContent($titleSlug: String!) {
                        question(titleSlug: $titleSlug) {
                            content
                            mysqlSchemas
                        }
                    }
                `,
                variables: {
                    titleSlug: questionTitleSlug
                }
            };

            // Execute the second query
            response = await axios.post(graphqlEndpoint, questionContentQuery, { headers });
            const questionContent = response.data.data.question.content;

            const discordMarkdownContent = this.htmlToDiscordMarkdown(questionContent);

            console.log(`**LEETCODE DAILY QUESTION: \n ${questionTitle} \n ${questionContent}`);

            // Respond with the question content
            message.reply(`**LEETCODE DAILY QUESTION:** \n ${questionTitle} \n ${discordMarkdownContent}`);
            message.reply(`Difficulty: **[${questionDifficulty}]**`)
        } catch (error) {
            console.error('Error executing GraphQL query:', error);
            message.reply('Sorry, there was an error fetching the question information.');
        }
    }

    private handleHintCommand(message: Message): void {
        // Placeholder
        message.reply('Here is your hint. Good luck!');
    }

    private htmlToDiscordMarkdown(html: string): string {
        let markdown = html
            // Handle the replacements
            .replace(/<\s*p[^>]*>\s*<\s*strong[^>]*>(.*?)<\/\s*strong\s*>\s*<\/\s*p\s*>/g, '**$1**\n\n')
            .replace(/<\s*em\s*>/g, '*') // Italics
            .replace(/<\s*\/\s*em\s*>/g, '*')
            .replace(/<\s*code\s*>/g, '`') // Inline code
            .replace(/<\s*\/\s*code\s*>/g, '`')
            .replace(/<\s*ul\s*>/g, '') // Remove ul tags
            .replace(/<\s*\/\s*ul\s*>/g, '')
            // Add a dash and a space for list items, ensure not to add extra indentation
            .replace(/<\s*li\s*>/g, '\n- ')
            .replace(/<\/\s*li\s*>/g, '') // Remove end of list item tag
            .replace(/<\s*p\s*>/g, '') // Remove p tags
            .replace(/<\/\s*p\s*>/g, '\n\n') // Paragraph breaks
            .replace(/<\s*br\s*\/?>/g, '\n') // Line breaks
            .replace(/&nbsp;/g, ' ') // Space entities
            .replace(/&lt;/g, '<') // Less than
            .replace(/&gt;/g, '>') // Greater than
            .replace(/&amp;/g, '&') // Ampersand
            .replace(/&quot;/g, '"') // Double quotes
            .replace(/&apos;/g, '\'') // Single quotes
            .replace(/<sup>(.*?)<\/sup>/g, '^$1') // Superscript
            .replace(/(Example \d+:)/g, '**$1**')
            .replace(/(Input:)/g, '**$1**')
            .replace(/(Output:)/g, '**$1**')
            .replace(/(Explanation:)/g, '**$1**')
            .replace(/(Constraints:)/g, '**$1**')
            .replace(/<[^>]+>/g, ''); // Remove any remaining tags

        // Normalize line breaks: Reduce multiple newlines to a single newline
        markdown = markdown.replace(/\n{3,}/g, '\n\n'); // Reduce 3 or more newlines to just double newline
        markdown = markdown.trim(); // Trim whitespace at start and end

        return markdown;
    }

}
