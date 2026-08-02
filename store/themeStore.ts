// Theme store - placeholder for state management
// TODO: Implement with zustand or similar

export type Theme = "light" | "dark" | "system";

export interface ThemeState {
  theme: Theme;
}

export const initialThemeState: ThemeState = {
  theme: "system",
};
