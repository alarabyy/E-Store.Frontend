export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    emailConfirmed: boolean;
    bio?: string;
    avatarUrl?: string;
    role?: string;
    lockoutEnabled: boolean;
    lockoutEnd?: string;
}

export interface UserListResponse {
    data: User[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
}

export interface UpdateUserPermissionsRequest {
    permissions: string[];
}

export interface UpdateUserRoleRequest {
    roleName: string;
}

export interface UpdateUserProfileRequest {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    bio?: string;
    avatar?: File;
}
