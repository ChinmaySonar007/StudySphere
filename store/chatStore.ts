// Chat store - placeholder for state management
// TODO: Implement with zustand or similar

import type { ChatMessage } from "@/types/chat";

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  activeDocumentId: string | null;
}

export const initialChatState: ChatState = {
  messages: [],
  isLoading: false,
  activeDocumentId: null,
};
