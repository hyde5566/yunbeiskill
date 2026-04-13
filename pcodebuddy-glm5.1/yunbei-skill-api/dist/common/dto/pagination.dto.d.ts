export declare class PaginationDto {
    page: number;
    pageSize: number;
    get skip(): number;
    get take(): number;
}
export declare class PaginatedResult<T> {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    constructor(list: T[], total: number, page: number, pageSize: number);
}
