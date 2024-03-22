import { Client, GatewayIntentBits, TextChannel, Message } from 'discord.js';
import moment from 'moment-timezone';
import axios from 'axios';
import { fetchDailyQuestion } from '../queries/dailyQuestion';
import { fetchQuestionContent } from '../queries/questionContent';
import { fetchQuestionTags } from '../queries/dailyQuestionTags';

export class DiscordBot {
    private client: Client;
    private readonly token: string;
    private readonly channelId: string;
    private dailyQuestionThreadId: string | null = null;

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

    private handleMessage(message: Message): void {
        if (message.author.bot) return;

        switch (message.content.toLowerCase()) {
            case '!hint':
                this.handleHintCommand(message);
                break;
            case '!random':
                //placeholder
                break;
            default:
                break;
        }
    }

    private handleHelpCommand(message: Message): void {
        message.reply('Help explaining the problem');
    }

    private scheduleDailyMessage(): void {
        const executeDailyTask = async () => {
            // Fetch daily question details
            const { title, titleSlug, difficulty, frontendQuestionId } = await fetchDailyQuestion();
            const link = `https://leetcode.com/problems/${titleSlug}/description/`;

            // Format the message
            const formattedMessage = [
                `**LeetCode Daily Question:**`,
                `**${frontendQuestionId}. ${title}**`,
                `**Difficulty:** ${difficulty}`,
                '',
                link,
                '',
                '**Discuss:**',
                '- What\'s the brute force approach for this question?',
                '- How can we optimize the algorithm?',
                '- Is there a trick to this question? If so, what is it?',
                '',
                'Before sending code, please try and answer some or all of the above questions to spark conversation.',
                '',
                'If you are stuck, try using the `/hint` command.'
            ].join('\n');

            // Ensure the channel is a TextChannel and send the message
            const channel = this.client.channels.cache.get(this.channelId) as TextChannel;
            if (!channel) return;

            // Create thread and post the message
            const thread = await channel.threads.create({
                name: 'Leetcode Daily',
                autoArchiveDuration: 60, // Adjust as needed
                reason: 'Discussion for LeetCode Daily Question',
            });
            this.dailyQuestionThreadId = thread.id; // Store the thread ID
            thread.send(formattedMessage);
            channel.send(`<@1214886008823480382> Today's LeetCode question is up in the "Leetcode Daily" thread! 🚀`);
        };

        const scheduleTask = () => {
            const now = moment();
            const next9AM = now.clone().hour(9).minute(0).second(0);
            if (now.isAfter(next9AM)) next9AM.add(1, 'day');

            const msUntilNext9AM = next9AM.diff(now);
            setTimeout(() => {
                executeDailyTask();
                setInterval(executeDailyTask, 24 * 60 * 60 * 1000); // Schedule daily
            }, msUntilNext9AM);
        };
        scheduleTask();
    }

    private async handleHintCommand(message: Message): Promise<void> {
        if (message.channelId === this.dailyQuestionThreadId) {
            try {
                const hashtags: string[] = await fetchQuestionTags();

                // Format each tag with backticks and join with newline character for separate lines
                const hashtagString: string = hashtags.join(' ').split(' ').map(tag => `\`${tag}\``).join(' ');
                const hintMessage: string = `Question tags:\n${hashtagString}\nThink about the direction you can take with these in mind!`;

                message.reply(hintMessage);
            } catch (error) {
                console.error('Error in handleHintCommand:', error);
                message.reply('Sorry, there was an error fetching the hint information.');
            }
        }
    }
}
