"use client";

import { Bot, User, Sparkles } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

interface MessageProps {
  message: ChatMessage;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex gap-3 sm:gap-4 p-4 rounded-2xl transition-all ${
        isUser
          ? "bg-white border border-slate-200/80 shadow-xs ml-8 sm:ml-16"
          : "bg-white border border-indigo-100 shadow-sm mr-8 sm:mr-16"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-semibold shadow-xs ${
          isUser
            ? "bg-slate-900 text-white"
            : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
        }`}
      >
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            {isUser ? "You" : "StudySphere RAG Assistant"}
            {!isUser && <Sparkles size={13} className="text-indigo-600" />}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            {message.createdAt}
          </span>
        </div>

        <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap leading-relaxed text-sm">
          {message.content}
        </div>
      </div>
    </div>
  );
}
