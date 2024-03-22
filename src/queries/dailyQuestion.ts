import axios from 'axios';
import { graphqlEndpoint, headers } from './apiConfig'; // Adjust the path as needed

export async function fetchDailyQuestion() {
    const query = {
        query: `
            query questionOfToday {
                activeDailyCodingChallengeQuestion {
                    link
                    question {
                        title
                        titleSlug
                        difficulty
                        frontendQuestionId: questionFrontendId
                    }
                }
            }
        `,
    };

    try {
        const response = await axios.post(graphqlEndpoint, query, { headers });
        return response.data.data.activeDailyCodingChallengeQuestion.question;
    } catch (error) {
        console.error('Error fetching daily question:', error);
        throw error;
    }
}