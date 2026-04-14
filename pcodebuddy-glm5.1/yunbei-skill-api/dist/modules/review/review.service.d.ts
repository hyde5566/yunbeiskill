import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Skill } from '../skill/entities/skill.entity';
import { SkillVersion } from '../skill/entities/skill-version.entity';
import { AssignReviewerDto, ReviewActionDto } from './dto/review.dto';
import { PaginatedResult, PaginationDto } from '../../common/dto/pagination.dto';
export declare class ReviewService {
    private reviewRepository;
    private skillRepository;
    private skillVersionRepository;
    constructor(reviewRepository: Repository<Review>, skillRepository: Repository<Skill>, skillVersionRepository: Repository<SkillVersion>);
    assignReviewer(assignDto: AssignReviewerDto, assignedBy: number): Promise<Review>;
    getPendingReviews(pagination: PaginationDto, reviewerId?: number, isAdmin?: boolean): Promise<PaginatedResult<Review>>;
    findOne(reviewId: number): Promise<Review>;
    getReviewsBySkillId(skillId: number): Promise<Review[]>;
    reviewAction(reviewId: number, actionDto: ReviewActionDto, reviewerId: number): Promise<Review>;
    getReviewHistory(pagination: PaginationDto, skillId?: number): Promise<PaginatedResult<Review>>;
}
