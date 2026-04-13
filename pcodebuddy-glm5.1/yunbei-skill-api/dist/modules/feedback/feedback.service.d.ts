import { Repository } from 'typeorm';
import { Feedback } from './entities/feedback.entity';
import { CreateFeedbackDto, MarkInvalidDto } from './dto/feedback.dto';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
export declare class FeedbackService {
    private feedbackRepository;
    constructor(feedbackRepository: Repository<Feedback>);
    create(createDto: CreateFeedbackDto, userId: number): Promise<Feedback>;
    getSkillFeedbacks(skillId: number, pagination: PaginationDto): Promise<PaginatedResult<Feedback>>;
    getMyFeedbacks(userId: number): Promise<Feedback[]>;
    markInvalid(id: number, dto: MarkInvalidDto): Promise<Feedback>;
    findAll(pagination: PaginationDto): Promise<PaginatedResult<Feedback>>;
}
