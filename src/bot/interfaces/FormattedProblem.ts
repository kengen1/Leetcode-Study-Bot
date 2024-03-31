export interface FormattedProblem {
    id: string; // frontendQuestionId
    title: string;
    url: string;
    topicTags: string[]; // Simplifying to an array of tag names for concise Discord messages
    hints: string[];
    similarQuestions: string; // Assuming this will be a JSON string or converted to a readable format
}