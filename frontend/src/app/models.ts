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
  jobPostingUrl?: string | null;
  notes?: string | null;
  source: ApplicationSource;
  createdAt: string;
  updatedAt?: string;
}

export type ApplicationStatus =
| 'Applied'
| 'Interviewing'
| 'Offered'
| 'Rejected';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Applied',
  'Interviewing',
  'Offered',
  'Rejected'
];

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

export const APPLICATION_SOURCES: ApplicationSource[] = [
  'Unknown',
  'Arbeitsagentur',
  'LinkedIn',
  'Indeed',
  'Xing',
  'Stepstone',
  'Referral',
  'Recruiter',
  'CompanyWebsite',
  'CarreerFair',
  'Other'
];

export interface JobApplicationsResponse {
  jobApplications: JobApplication[];
  totalCount: number;
}

export interface StatusChange {
  id: string;
  oldStatus: ApplicationStatus;
  newStatus: ApplicationStatus;
  changedAt: string;
  note?: string;
}

export interface UpdateStatusRequest {
  newStatus: ApplicationStatus;
  note?: string;
}

export interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  byStatus: Record<ApplicationStatus, number>;
  byMonth: Record<string, number>;
}

export interface Profile {
  fullName: string;
  email: string;
  pendingEmail?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}