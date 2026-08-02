import { api } from "@/lib/api";
import type { ChatMessage } from "@/types/chat";

export const chatService = {
  sendMessage: (documentId: string, message: string) =>
    api.post<ChatMessage>("/chat/message", { documentId, message }),

  getHistory: (documentId: string) =>
    api.get<ChatMessage[]>(`/chat/history/${documentId}`),

  clearHistory: (documentId: string) =>
    api.delete(`/chat/history/${documentId}`),
};
