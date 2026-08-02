export const APP_NAME = "StudySphere";

export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  FEATURES: "/features",
  PRICING: "/pricing",
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  DASHBOARD: "/dashboard",
  UPLOAD: "/dashboard/upload",
  CHAT: "/dashboard/chat",
  NOTES: "/dashboard/notes",
  FLASHCARDS: "/dashboard/flashcards",
  QUIZZES: "/dashboard/quizzes",
  PLANNER: "/dashboard/planner",
  MINDMAPS: "/dashboard/mindmaps",
  PROFILE: "/dashboard/profile",
  SETTINGS: "/dashboard/settings",
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];
