// Auth store - placeholder for state management
// TODO: Implement with zustand or similar

import type { User } from "@/types/user";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
};
