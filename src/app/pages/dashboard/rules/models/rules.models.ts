export interface Rule {
    id: number;
    name: string;
    permissions: string[];
    contentLimit?: number;
}

export interface RuleListResponse {
    isSuccess: boolean;
    data: Rule[];
    error?: {
        code: string;
        message: string;
    };
}

export interface RuleDetailResponse {
    isSuccess: boolean;
    data: Rule;
    error?: {
        code: string;
        message: string;
    };
}

export interface CreateRuleRequest {
    name: string;
    permissions: string[];
    contentLimit?: number;
}

export interface UpdateRuleRequest {
    name: string;
    permissions: string[];
    contentLimit?: number;
}
