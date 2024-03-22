export interface TopicTag {
    name: string;
    id: string;
    slug: string;
}

export interface Question {
    topicTags: TopicTag[];
}

export interface DailyCodingChallengeQuestion {
    question: Question;
}

export interface GraphQLResponse {
    data: {
        activeDailyCodingChallengeQuestion: DailyCodingChallengeQuestion;
    }
}