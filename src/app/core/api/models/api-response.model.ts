export interface ApiResponse<T = any> {
    isSuccess: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}