export interface PagedRequest {
    page: number;
    pageSize: number;
    search?: string;
}

export interface PagedResponse<T> {
    isSuccess: boolean;
    data: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    error?: {
        code: string;
        message: string;
    };
}
