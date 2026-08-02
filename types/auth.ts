export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  full_name: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

