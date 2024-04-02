import { RoadmapCategory } from "./RoadmapCategory";
import { FormattedProblem } from "./FormattedProblem";

export interface RoadmapProblem {
    neetcodeId: number;
    problemCategory: RoadmapCategory;
    problem: FormattedProblem;
}