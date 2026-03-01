export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    twoFactorRequired: boolean;
}

export interface GoogleAuthRequest {
    idToken: string;
}
