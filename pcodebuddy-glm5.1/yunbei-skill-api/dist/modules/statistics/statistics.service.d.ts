import { Repository } from 'typeorm';
import { Skill } from '../skill/entities/skill.entity';
import { User } from '../user/entities/user.entity';
import { Rating } from '../rating/entities/rating.entity';
import { DownloadRecord } from '../download/entities/download-record.entity';
import { Review } from '../review/entities/review.entity';
import { Feedback } from '../feedback/entities/feedback.entity';
import { Project } from '../project/entities/project.entity';
import { SkillCategory } from '../skill-category/entities/skill-category.entity';
export declare class StatisticsService {
    private skillRepository;
    private userRepository;
    private ratingRepository;
    private downloadRepository;
    private reviewRepository;
    private feedbackRepository;
    private projectRepository;
    private categoryRepository;
    constructor(skillRepository: Repository<Skill>, userRepository: Repository<User>, ratingRepository: Repository<Rating>, downloadRepository: Repository<DownloadRecord>, reviewRepository: Repository<Review>, feedbackRepository: Repository<Feedback>, projectRepository: Repository<Project>, categoryRepository: Repository<SkillCategory>);
    getOverview(): Promise<{
        skill_total: number;
        published_total: number;
        user_total: number;
        rating_total: number;
        download_total: number;
        review_total: number;
        feedback_total: number;
    }>;
    getDashboard(): Promise<{
        overview: {
            skill_total: number;
            published_total: number;
            user_total: number;
            rating_total: number;
            download_total: number;
            review_total: number;
            feedback_total: number;
        };
        categoryStats: any[];
        topDownloads: any[];
        ratingDistribution: {
            distribution: any[];
            avg_score: string;
        };
    }>;
    getByCategory(): Promise<any[]>;
    getTopDownloads(limit?: number): Promise<any[]>;
    getRatingDistribution(): Promise<{
        distribution: any[];
        avg_score: string;
    }>;
    getDownloadTrend(months?: number): Promise<any[]>;
    getByRating(): Promise<{
        top_rated: any[];
    }>;
    getByDownload(): Promise<{
        top_downloaded: any[];
    }>;
    getByProject(): Promise<any[]>;
    getByUser(): Promise<any[]>;
    getTimeline(startDate: string, endDate: string): Promise<{
        download_trend: any[];
        submit_trend: any[];
    }>;
    exportStats(type: string): Promise<{
        buffer: Buffer<ArrayBuffer>;
        filename: string;
    }>;
}
