export interface ResetPasswordRequest {
    email: string;
    newPassword: string;
    token: string;
}

export interface ResetPasswordResponse {
    message: string;
}
