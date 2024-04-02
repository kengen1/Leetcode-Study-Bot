import { LeetCode as LeetCodeAPI, ProblemList, DailyChallenge, Problem } from "leetcode-query";
import { RoadmapProblem } from "./interfaces/RoadmapProblem";
import { FormattedProblem } from "./interfaces/FormattedProblem";
import * as fs from 'fs/promises';

export class Leetcode {
    private leetCodeAPI: LeetCodeAPI;
    private dailyQuestion: DailyChallenge | null;
    private problemList: ProblemList | null;
    private roadmapJson: any;
    private readonly jsonFilePath: string = 'src/bot/data/neetcode_roadmap.json';
    
    constructor() {
        this.leetCodeAPI = new LeetCodeAPI();
        this.dailyQuestion = null;
        this.problemList = null;
    }

    async initialize(): Promise<void> {
        await this.fetchDailyQuestion();
        await this.fetchProblemList();
        await this.loadRoadmapJson();
    }

    private async fetchDailyQuestion(): Promise<void> {
        console.log("Fetching daily question...");
        try {
            this.dailyQuestion = await this.leetCodeAPI.daily();
        } catch (error) {
            console.error("Failed to fetch daily challenge:", error);
        }
    }

    private async fetchProblemList(): Promise<void> {
        console.log("Fetching problem list...");
        try {
            this.problemList = await this.leetCodeAPI.problems();
            console.log("got the problems");
        } catch (error) {
            console.error("Failed to fetch problem list:", error);
        }
    }

    private async fetchProblem(frontendQuestionId: number): Promise<Problem | null> {
        if (!this.problemList || !this.problemList.questions) {
            console.error("Problem list is not fetched or empty.");
            return null;
        }

        const problemDetail = this.problemList.questions.find(problem => parseInt(problem.questionFrontendId) === frontendQuestionId);
        if (!problemDetail) {
            console.error(`Problem with frontendQuestionId ${frontendQuestionId} not found.`);
            return null;
        }

        try {
            const problem: Problem = await this.leetCodeAPI.problem(problemDetail.titleSlug);
            return problem;
        } catch (error) {
            console.error(`Failed to fetch problem details for ${problemDetail.titleSlug}:`, error);
            return null;
        }
    }

    getDailyQuestion(): DailyChallenge | null {
        return this.dailyQuestion;
    }

    getProblemList(): ProblemList | null {
        return this.problemList;
    }

    async getRandomProblem(): Promise<Problem | null>{
        const problemId = this.getRandomId();
        const problem = this.fetchProblem(problemId);
        return problem;
    }

    private getRandomId(): number {
        if (!this.problemList || !this.problemList.questions || this.problemList.questions.length === 0) {
            console.error("Problem list is not fetched or empty.");
            throw new Error("Problem list is not available.");
        }

        const randomIndex = Math.floor(Math.random() * this.problemList.questions.length);
        const randomProblem = this.problemList.questions[randomIndex];
        return parseInt(randomProblem.questionFrontendId);
    }

    private async loadRoadmapJson(): Promise<void> {
        try {
            const jsonData = await fs.readFile(this.jsonFilePath, 'utf-8');
            this.roadmapJson = JSON.parse(jsonData);
        } catch (error) {
            console.error("Failed to load roadmap JSON:", error);
            throw error;
        }
    }

    async getRoadmapProblem(problemId: Number): Promise<RoadmapProblem> {
        if (!this.roadmapJson || !this.roadmapJson['roadmap-problems']) {
            throw new Error('Roadmap JSON is not loaded or does not have the expected structure.');
        }
    
        const item = this.roadmapJson['roadmap-problems'].find((p: any) => p.id === problemId);
        if (!item) {
            throw new Error(`Problem with ID ${problemId} not found in roadmap.`);
        }
    
        try {
            const problemDetails: Problem = await this.leetCodeAPI.problem(item['title-slug']);
            const formattedProblem: FormattedProblem = {
                id: problemDetails.questionFrontendId,
                title: problemDetails.title,
                url: `https://leetcode.com/problems/${item['title-slug']}`,
                topicTags: problemDetails.topicTags.map(tag => tag.name),
                hints: problemDetails.hints,
                similarQuestions: problemDetails.similarQuestions
            };
    
            return {
                neetcodeId: item.id,
                problemCategory: { category: item.category, prerequisites: [] },
                problem: formattedProblem
            };
        } catch (error) {
            throw new Error(`Failed to fetch problem details for ${item['title-slug']}: ${error}`);
        }
    }
}