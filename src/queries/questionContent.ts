import axios from 'axios';
import { graphqlEndpoint, headers } from './apiConfig';

export async function fetchQuestionContent(titleSlug: string) {
    const query = {
        query: `
            query questionContent($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    content
                }
            }
        `,
        variables: {
            titleSlug
        }
    };

    try {
        const response = await axios.post(graphqlEndpoint, query, { headers });
        return response.data.data.question.content;
    } catch (error) {
        console.error('Error fetching question content:', error);
        throw error;
    }
}