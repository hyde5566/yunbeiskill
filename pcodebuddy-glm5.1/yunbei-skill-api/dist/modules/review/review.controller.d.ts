import { ReviewService } from './review.service';
import { AssignReviewerDto, ReviewActionDto } from './dto/review.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ReviewController {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    getPendingReviews(pagination: PaginationDto, user: any): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/review.entity").Review>>;
    getAllReviews(pagination: PaginationDto, skillId?: number): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/review.entity").Review>>;
    getReviewDetail(id: number): Promise<{
        history: import("./entities/review.entity").Review[];
        id: number;
        skill_id: number;
        version_id: number;
        reviewer_id: number | null;
        assigned_by: number;
        status: string;
        comment: string;
        reviewed_at: Date;
        created_at: Date;
        skill: import("../skill/entities/skill.entity").Skill;
        version: import("../skill/entities/skill-version.entity").SkillVersion;
        reviewer: import("../user/entities/user.entity").User;
        assigner: import("../user/entities/user.entity").User;
    }>;
    assignReviewer(assignDto: AssignReviewerDto, user: any): Promise<import("./entities/review.entity").Review>;
    reviewAction(id: number, actionDto: ReviewActionDto, user: any): Promise<import("./entities/review.entity").Review>;
}
