export interface RegisterRequest {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    isOrganization: boolean;
}

export interface RegisterResponse {
    message: string;
}

export interface GoogleAuthRequest {
    idToken: string;
}

export interface GoogleAuthResponse {
    accessToken: string;
    refreshToken: string;
}
