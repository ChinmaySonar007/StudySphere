import { api } from "@/lib/api";
import type { Quiz, QuizResult } from "@/types/quiz";

export const quizService = {
  generateQuiz: (documentId: string, questionCount?: number) =>
    api.post<Quiz>("/quizzes/generate", { documentId, questionCount }),

  getQuizzes: () => api.get<Quiz[]>("/quizzes"),

  getQuiz: (quizId: string) => api.get<Quiz>(`/quizzes/${quizId}`),

  submitQuiz: (quizId: string, answers: Record<string, string>) =>
    api.post<QuizResult>(`/quizzes/${quizId}/submit`, { answers }),

  getResults: (quizId: string) =>
    api.get<QuizResult>(`/quizzes/${quizId}/results`),
};
