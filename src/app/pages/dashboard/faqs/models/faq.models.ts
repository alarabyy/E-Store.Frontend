export interface FAQ {
    id: number;
    question: string;
    answer: string;
    isActive: boolean;
    createdAt?: string;
}

export interface CreateFAQRequest {
    question: string;
    answer: string;
}

export interface UpdateFAQRequest {
    question: string;
    answer: string;
    isActive: boolean;
}
