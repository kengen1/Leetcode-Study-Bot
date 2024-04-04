import { Client, GatewayIntentBits, Message, TextChannel, ThreadChannel } from 'discord.js';
import { Leetcode } from './Leetcode';
import { Problem } from 'leetcode-query';
import { FormattedProblem } from './interfaces/FormattedProblem';
import cron from 'node-cron';

export class DiscordBot {
    private client: Client;
    private readonly token: string;
    private readonly mainChannelId: string;
    private readonly dailyChannelId: string;
    private readonly roadmapChannelId: string;
    private readonly roleId: string;
    private leetcode: Leetcode;
    private problemThreadsMap: Map<string, { problem: FormattedProblem; timestamp: number }>;
    private randomQuestionCount: number;
    private lastRandomQuestionDate: Date;
    private roadmapDayCounter: number;

    constructor(token: string, mainChannelId: string, dailyChannelId: string, roadmapChannelId: string, roleId: string) {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
        this.token = token;
        this.mainChannelId = mainChannelId;
        this.dailyChannelId = dailyChannelId;
        this.roadmapChannelId = roadmapChannelId;
        this.roleId = roleId;
        this.leetcode = new Leetcode();
        this.problemThreadsMap = new Map();
        this.randomQuestionCount = 0;
        this.lastRandomQuestionDate = new Date();
        this.roadmapDayCounter = 1;

        this.registerEventListeners();
    }

    public start(): void {
        this.client.login(this.token).then(async () => {
            await this.leetcode.initialize();
            this.scheduleDailyTasks();
            setInterval(() => this.clearExpiredThreadEntries(), 3600 * 1000);
        }).catch(console.error);    
    }

    private registerEventListeners(): void {
        this.client.on('ready', () => {
            console.log(`Logged in as ${this.client.user?.tag}!`);
        });

        this.client.on('messageCreate', (message: Message) => this.handleIncomingMessage(message));
    }

    private handleIncomingMessage(message: Message): void {
        if (message.author.bot) return;
    
        const isFromMainChannel = message.channelId === this.mainChannelId;
        const isFromDailyChannelThread = message.channel.isThread() && message.channel.parentId === this.dailyChannelId;
        const isFromMainChannelThread = message.channel.isThread() && message.channel.parentId === this.mainChannelId;
    
        if (!isFromMainChannel && !isFromDailyChannelThread && !isFromMainChannelThread) {
            console.log(`Received message from unsupported channel or thread: ${message.content}`);
            return;
        }
    
        switch (message.content.toLowerCase()) {
            case '!random':
                if (isFromMainChannel) {
                    this.handleRandomCommand(message);
                }
                break;
            case '!hint':
                this.handleHintCommand(message);
                break;
            case '!tags':
                this.handleTagsCommand(message);
                break;
    
            default:
                console.log(`Received unhandled message: ${message.content}`);
                break;
        }
    }

    private handleRandomCommand(message: Message): void {
        const currentDate = new Date();

        if (currentDate.toLocaleDateString() !== this.lastRandomQuestionDate.toLocaleDateString()) {
            this.randomQuestionCount = 0;
            this.lastRandomQuestionDate = currentDate;
        }

        if (this.randomQuestionCount >= 3) {
            message.channel.send("The limit of 3 random questions per day has been reached. Please try again tomorrow.");
            return;
        }

        this.fetchAndPostRandomQuestion(message).then(() => {
            this.randomQuestionCount += 1;
        }).catch((error) => {
            console.error('Error handling random command:', error);
            message.channel.send("Sorry, I couldn't fetch a random problem.");
        });
    }

    private async handleHintCommand(message: Message): Promise<void> {
        if (message.channel.isThread()) {
            const entry = this.problemThreadsMap.get(message.channel.id);
            if (!entry || !entry.problem.hints || entry.problem.hints.length === 0) {
                message.reply("There are no hints for this question.");
                return;
            }
            const hints = entry.problem.hints.map(hint => `||${hint}||`).join('\n\n');
            message.reply(`Solution Hints:\n${hints}`);
        }
    }

    private async handleTagsCommand(message: Message): Promise<void> {
        if (message.channel.isThread()) {
            const entry = this.problemThreadsMap.get(message.channel.id);
            if (!entry || !entry.problem.topicTags || entry.problem.topicTags.length === 0) {
                message.reply("There are no tags for this question.");
                return;
            }
    
            const topicTags = entry.problem.topicTags.join(', ');
            message.reply(`Topic Tags:\n${topicTags}`);
        }
    }    

    private async formatProblemForDiscord(problem: Problem): Promise<FormattedProblem> {
        return {
            id: problem.questionFrontendId,
            title: problem.title,
            url: `https://leetcode.com/problems/${problem.titleSlug}/`,
            topicTags: problem.topicTags.map(tag => tag.name),
            hints: problem.hints,
            similarQuestions: problem.similarQuestions, 
        };
    }

    private async fetchAndPostRandomQuestion(message: Message): Promise<void> {
        const problem = await this.leetcode.getRandomProblem();
        if (!problem) {
            message.channel.send("Unable to fetch a random problem at this time.");
            return;
        }

        const formattedProblem = await this.formatProblemForDiscord(problem);
        const difficulty = problem.difficulty;
        const channel = message.channel as TextChannel;

        try {
            const thread = await channel.threads.create({
                name: `${formattedProblem.id} - ${formattedProblem.title}`,
                reason: 'Discussion for a Random LeetCode Problem',
            });
            console.log('Random problem thread created successfully:', thread.name);
            
            const formattedMessage = [
                `**Random LeetCode Problem: ${formattedProblem.title}**`,
                ``,
                `**Difficulty: ${difficulty}**`,
                `${formattedProblem.url}`,
                '',
                '**Discuss:**',
                '- What is your initial approach to solving this problem?',
                '- Can you identify any potential optimizations?',
                '- Share any insights or tricks you might know related to this problem.',
                '',
                'Before jumping into coding, consider discussing your strategies or thoughts on the above topics.',
                '',
                'Need a nudge in the right direction?',
                '`!hint` - Can provide hints to guide you.',
                '`!tags` - Will show the topic tags for this problem, helping you understand its categories.'
            ].join('\n');
    
            this.problemThreadsMap.set(thread.id, { problem: formattedProblem, timestamp: Date.now() });
            thread.send(formattedMessage);
        } catch (error) {
            console.error('Failed to create random problem thread:', error);
            throw new Error('Failed to create thread');
        }
    }

    private scheduleDailyTasks(): void {
        cron.schedule('0 9 * * *', async () => {
            await this.postDailyChallenge();
            await this.postRoadmapQuestion();
            this.roadmapDayCounter++;

            if(this.roadmapDayCounter == 150){
                this.roadmapDayCounter = 1;
            }
        });
    }

    private async postDailyChallenge(): Promise<void> {
        console.log('Posting daily challenge at', new Date().toISOString());

        const dailyChallenge = await this.leetcode.getDailyQuestion();
        if (!dailyChallenge) {
            console.error('Failed to fetch daily challenge.');
            return;
        }

        const formattedProblem = await this.formatProblemForDiscord(dailyChallenge.question);
        const link = formattedProblem.url;
        const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        const formattedMessage = [
            `<@&${this.roleId}>`,
            `**LeetCode Daily Challenge - ${today}**`,
            ``,
            `**Title: ${formattedProblem.title}**`,
            `**Difficulty: ${dailyChallenge.question.difficulty}**`,
            link,
            '',
            '**Discuss:**',
            '- What\'s the brute force approach for this question?',
            '- How can we optimize the algorithm?',
            '- Is there a trick to this question? If so, what is it?',
            '',
            'Before sending code, please try and answer some or all of the above questions to spark conversation.',
            '',
            'Stuck? Here are some commands that can help:',
            '`!hint` - Can provide one or many hints of increasing helpfulness.',
            '`!tags` - Will provide the topic tags for this question.'
        ].join('\n');

        const channel = this.client.channels.cache.get(this.dailyChannelId) as TextChannel;
        if (!channel) return;

        try {
            const thread = await channel.threads.create({
                name: 'Daily Challenge',
                autoArchiveDuration: 1440,
                reason: 'Discussion for the Daily Challenge',
            });
            console.log('Thread created successfully:', thread.name);
            this.problemThreadsMap.set(thread.id, { problem: formattedProblem, timestamp: Date.now() });
            thread.send(formattedMessage);
        } catch (error) {
            console.error('Failed to create thread:', error);
        }
    }
    
    private async postRoadmapQuestion(): Promise<void> {
        console.log('Posting roadmap question at', new Date().toISOString());

        const roadmapProblem = await this.leetcode.getRoadmapProblem(this.roadmapDayCounter);
        if (!roadmapProblem) {
            console.error(`Failed to fetch roadmap question for day ${this.roadmapDayCounter}.`);
            return;
        }

        const formattedProblem = roadmapProblem.problem;
        const link = formattedProblem.url;
        const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        const formattedMessage = [
            `**LeetCode Roadmap Challenge - ${today}**`,
            ``,
            `**Title: ${formattedProblem.title}**`,
            `**Category: ${roadmapProblem.problemCategory.category}**`,
            link,
            '',
            '**Discuss:**',
            '- What\'s the brute force approach for this question?',
            '- How can we optimize the algorithm?',
            '- Is there a trick to this question? If so, what is it?',
            '',
            'Feel free to discuss your approach and thoughts on this problem.',
            '',
            'Need some hints or want to know more about the topic tags?',
            '`!hint` - Provides hints for solving the problem.',
            '`!tags` - Shows the topic tags related to this problem.'
        ].join('\n');

        const channel = this.client.channels.cache.get(this.roadmapChannelId) as TextChannel;
        if (!channel) return;

        try {
            const thread = await channel.threads.create({
                name: `Roadmap Challenge - Day ${this.roadmapDayCounter}`,
                autoArchiveDuration: 1440,
                reason: 'Discussion for the Roadmap Challenge',
            });
            console.log('Roadmap question thread created successfully:', thread.name);
            this.problemThreadsMap.set(thread.id, { problem: formattedProblem, timestamp: Date.now() });
            thread.send(formattedMessage);
        } catch (error) {
            console.error('Failed to create roadmap question thread:', error);
        }
    }

    private clearExpiredThreadEntries(): void {
        const now = Date.now();
        const ttl = 1440 * 60 * 1000;
        this.problemThreadsMap.forEach((value, key) => {
            if (now - value.timestamp > ttl) {
                this.problemThreadsMap.delete(key);
            }
        });
    }
}
