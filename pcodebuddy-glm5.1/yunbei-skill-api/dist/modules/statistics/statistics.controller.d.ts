import type { Response } from 'express';
import { StatisticsService } from './statistics.service';
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
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
    getTopDownloads(limit?: string): Promise<any[]>;
    getRatingDistribution(): Promise<{
        distribution: any[];
        avg_score: string;
    }>;
    getDownloadTrend(months?: string): Promise<any[]>;
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
    exportStats(type: string, res: Response): Promise<void>;
}
