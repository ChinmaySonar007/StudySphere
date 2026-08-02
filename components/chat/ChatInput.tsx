"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (query: string) => void;
  loading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, loading, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const quickPrompts = [
    "Summarize the key points of this document.",
    "What are the main concepts covered?",
    "Generate 3 practice questions with answers.",
  ];

  return (
    <div className="space-y-3">
      {/* Quick Prompts suggestions */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => onSend(prompt)}
            disabled={loading || disabled}
            className="flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100/70 hover:border-indigo-200 transition disabled:opacity-50"
          >
            <Sparkles size={12} className="text-indigo-500" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Main input form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your uploaded document..."
          disabled={loading || disabled}
          className="w-full resize-none rounded-2xl border border-slate-300 bg-white py-3.5 pl-4 pr-12 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={!input.trim() || loading || disabled}
          className="absolute right-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-40 disabled:hover:bg-indigo-600 shadow-xs"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </form>
    </div>
  );
}
