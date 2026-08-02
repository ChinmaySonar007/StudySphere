import { api } from "@/lib/api";

export interface Note {
  id: string;
  documentId: string;
  content: string;
  summary: string;
  createdAt: Date;
}

export const notesService = {
  getNotes: (documentId: string) =>
    api.get<Note[]>(`/notes/${documentId}`),

  generateSummary: (documentId: string) =>
    api.post<Note>(`/notes/summarize`, { documentId }),

  updateNote: (noteId: string, content: string) =>
    api.put<Note>(`/notes/${noteId}`, { content }),

  deleteNote: (noteId: string) => api.delete(`/notes/${noteId}`),
};
