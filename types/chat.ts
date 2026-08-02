export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

export interface Citation {
  id: string;
  text: string;
  page?: number;
  documentId: string;
  documentTitle: string;
}

export interface ChatSession {
  id: string;
  documentId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
