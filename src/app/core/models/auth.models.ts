export type { ApiResponse } from './api-response.model';


export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    twoFactorRequired: boolean;
}

export interface LoginRequest {
    email?: string;
    password?: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password?: string;
    isOrganization?: boolean;
}

export interface Verify2FARequest {
    email: string;
    code: string;
}

export interface ChangePasswordRequest {
    currentPassword?: string;
    newPassword?: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    newPassword?: string;
    token?: string;
}

export interface ConfirmEmailRequest {
    email: string;
    token: string;
}

export interface RefreshTokenRequest {
    token: string;
}

export interface GoogleAuthRequest {
    idToken: string;
}
