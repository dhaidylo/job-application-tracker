export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    email: string;
    fullName: string;
}

export interface JobApplication {
    id: string;
    companyName: string;
    position: string;
    location: string;
    status: ApplicationStatus;
    appliedDate: string;
    jobPostingUrl: string;
    notes: string;
    source: ApplicationSource;
    createdAt: string;
    updatedAt: string;
}

export type ApplicationStatus =
| 'Applied'
| 'Interviewing'
| 'Offered'
| 'Rejected';

export type ApplicationSource =
| 'Unknown'
| 'Arbeitsagentur'
| 'LinkedIn'
| 'Indeed'
| 'Xing'
| 'Stepstone'
| 'Referral'
| 'Recruiter'
| 'CompanyWebsite'
| 'CarreerFair'
| 'Other';