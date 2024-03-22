import axios from "axios";
import { graphqlEndpoint, headers } from './apiConfig'; // Adjust the path as needed
import { GraphQLResponse } from "../interfaces";

export async function fetchQuestionTags(): Promise<string[]> {
    const query = `
        query questionOfToday {
            activeDailyCodingChallengeQuestion {
                question {
                    topicTags {
                        name
                        id
                        slug
                    }
                }
            }
        }
    `;

    try {
        const response = await axios.post<GraphQLResponse>('https://leetcode.com/graphql', { query });
        const tags = response.data.data.activeDailyCodingChallengeQuestion.question.topicTags;
        return tags.map(tag => `#${tag.name.replace(/\s+/g, '')}`);
    } catch (error) {
        console.error('Error fetching question tags:', error);
        throw error;
    }
}