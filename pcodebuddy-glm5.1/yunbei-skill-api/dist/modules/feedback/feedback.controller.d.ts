import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto, MarkInvalidDto } from './dto/feedback.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    create(createDto: CreateFeedbackDto, user: any): Promise<import("./entities/feedback.entity").Feedback>;
    getSkillFeedbacks(skillId: number, pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/feedback.entity").Feedback>>;
    getMyFeedbacks(user: any): Promise<import("./entities/feedback.entity").Feedback[]>;
    findAll(pagination: PaginationDto): Promise<import("../../common/dto/pagination.dto").PaginatedResult<import("./entities/feedback.entity").Feedback>>;
    markInvalid(id: number, dto: MarkInvalidDto): Promise<import("./entities/feedback.entity").Feedback>;
}
