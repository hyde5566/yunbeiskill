import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/rating.dto';
export declare class RatingController {
    private readonly ratingService;
    constructor(ratingService: RatingService);
    create(createDto: CreateRatingDto, user: any): Promise<import("./entities/rating.entity").Rating>;
    getSkillRatings(skillId: number): Promise<{
        skill_id: number;
        average_score: number;
        total_count: number;
        distribution: number[];
    }>;
    getMyRatings(user: any): Promise<import("./entities/rating.entity").Rating[]>;
}
