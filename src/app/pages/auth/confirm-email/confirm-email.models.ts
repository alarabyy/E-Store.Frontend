export interface ConfirmEmailRequest {
    email: string;
    token: string;
}

export interface ConfirmEmailResponse {
    message: string;
}
