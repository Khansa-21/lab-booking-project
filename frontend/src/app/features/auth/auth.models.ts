export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: UserProfile;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest extends LoginRequest {
  name: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ApiErrorResponse {
  error?: {
    message?: string;
    details?: Array<{ field: string; message: string }>;
  };
}
