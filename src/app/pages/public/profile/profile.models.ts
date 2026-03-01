import { ApiResponse } from '../../../components/models/api-response.model';

export interface UserProfileDto {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    bio?: string;
    avatarUrl?: string;
    jobTitle?: string;
    country?: string;
    city?: string;
    coverImageUrl?: string;
    joinedAt: string;
    role: string;
    twoFactorEnabled: boolean;
    phoneNumber?: string;
    facebookUrl?: string;
    twitterUrl?: string;
    instagramUrl?: string;
    linkedInUrl?: string;
    githubUrl?: string;
    youtubeUrl?: string;
    websiteUrl?: string;
}

export type UserProfileResponse = ApiResponse<UserProfileDto>;
