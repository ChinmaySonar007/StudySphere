import { api } from "@/lib/api";
import type { StudyPlan, PlannerTask } from "@/types/planner";

export const plannerService = {
  getPlan: () => api.get<StudyPlan>("/planner"),

  getTasks: (date?: string) =>
    api.get<PlannerTask[]>("/planner/tasks", {
      params: date ? { date } : undefined,
    }),

  createTask: (task: Omit<PlannerTask, "id">) =>
    api.post<PlannerTask>("/planner/tasks", task),

  updateTask: (taskId: string, updates: Partial<PlannerTask>) =>
    api.put<PlannerTask>(`/planner/tasks/${taskId}`, updates),

  deleteTask: (taskId: string) => api.delete(`/planner/tasks/${taskId}`),

  generatePlan: (documentIds: string[]) =>
    api.post<StudyPlan>("/planner/generate", { documentIds }),
};
