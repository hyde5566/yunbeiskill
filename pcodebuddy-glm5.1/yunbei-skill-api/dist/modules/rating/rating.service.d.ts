import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/rating.dto';
export declare class RatingService {
    private ratingRepository;
    constructor(ratingRepository: Repository<Rating>);
    create(createDto: CreateRatingDto, userId: number): Promise<Rating>;
    getSkillRatings(skillId: number): Promise<{
        skill_id: number;
        average_score: number;
        total_count: number;
        distribution: number[];
    }>;
    getMyRatings(userId: number): Promise<Rating[]>;
}
