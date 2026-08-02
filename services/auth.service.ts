import { api } from "@/lib/api";
import type { LoginCredentials, SignupData, AuthResponse } from "@/types/auth";

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>("/auth/login", credentials),

  signup: (data: SignupData) =>
    api.post<AuthResponse>("/auth/register", data),

  googleAuth: (data: { token?: string; email?: string; full_name?: string }) =>
    api.post<AuthResponse>("/auth/google", data),

  githubAuth: (data: { code?: string; access_token?: string; email?: string; full_name?: string }) =>
    api.post<AuthResponse>("/auth/github", data),



  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refresh_token: refreshToken }),

  refreshToken: (refreshToken: string) =>
    api.post<AuthResponse>("/auth/refresh", { refresh_token: refreshToken }),

  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),
};

