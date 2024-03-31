import { LeetCode as LeetCodeAPI, ProblemList, DailyChallenge, Problem } from "leetcode-query";

export class Leetcode {
    private leetCodeAPI: LeetCodeAPI;
    private dailyQuestion: DailyChallenge | null;
    private problemList: ProblemList | null;

    constructor() {
        this.leetCodeAPI = new LeetCodeAPI();
        this.dailyQuestion = null;
        this.problemList = null;
    }

    async initialize(): Promise<void> {
        await this.fetchDailyQuestion();
        await this.fetchProblemList();
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

}