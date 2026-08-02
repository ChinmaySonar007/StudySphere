export interface StudyPlan {
  id: string;
  tasks: PlannerTask[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
}

export interface PlannerTask {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  completed: boolean;
  documentId?: string;
  priority: "low" | "medium" | "high";
}
