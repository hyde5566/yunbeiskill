import { ReviewService } from './review.service';
import { AssignReviewerDto, ReviewActionDto } from './dto/review.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ReviewController {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    getPendingReviews(pagination: PaginationDto, user: any): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/review.entity").Review>>;
    getAllReviews(pagination: PaginationDto, skillId?: number): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/review.entity").Review>>;
    assignReviewer(assignDto: AssignReviewerDto, user: any): Promise<import("./entities/review.entity").Review>;
    reviewAction(id: number, actionDto: ReviewActionDto, user: any): Promise<import("./entities/review.entity").Review>;
}
