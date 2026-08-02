"use client";

import { useState, useEffect, useRef } from "react";
import Message, { ChatMessage } from "./Message";
import ChatInput from "./ChatInput";
import { api } from "@/lib/api";
import {
  Sparkles,
  Loader2,
  BookOpen,
  Layers,
  Trash2,
} from "lucide-react";

interface DocumentItem {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  status: string;
}

interface ChatWindowProps {
  initialDocumentId?: number | null;
}

export default function ChatWindow({ initialDocumentId }: ChatWindowProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(
    initialDocumentId || null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDocs, setFetchingDocs] = useState(true);
  const [deletingDoc, setDeletingDoc] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load user documents
  useEffect(() => {
    async function loadDocs() {
      try {
        setFetchingDocs(true);
        const data = await api.get<DocumentItem[]>("/documents/");
        setDocuments(data || []);
        if (!selectedDocId && data && data.length > 0) {
          const readyDoc = data.find((d) => d.status === "READY") || data[0];
          setSelectedDocId(readyDoc.id);
        }
      } catch (err: any) {
        console.error("Failed to load documents:", err);
      } finally {
        setFetchingDocs(false);
      }
    }
    loadDocs();
  }, []);

  // Update selected doc if initialDocumentId prop changes
  useEffect(() => {
    if (initialDocumentId) {
      setSelectedDocId(initialDocumentId);
    }
  }, [initialDocumentId]);

  const activeDoc = documents.find((d) => d.id === selectedDocId);

  const handleDeleteSelectedDoc = async () => {
    if (!selectedDocId) return;
    const docName = activeDoc?.original_filename || "this document";
    if (!confirm(`Are you sure you want to delete "${docName}"? This will also remove it from the RAG store.`)) {
      return;
    }

    try {
      setDeletingDoc(true);
      await api.delete(`/documents/${selectedDocId}`);
      setDocuments((prev) => prev.filter((d) => d.id !== selectedDocId));
      setSelectedDocId(null);
    } catch (err: any) {
      console.error("Failed to delete document:", err);
      alert(err.message || "Failed to delete document.");
    } finally {
      setDeletingDoc(false);
    }
  };

  const handleSendQuery = async (query: string) => {
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: query,
      createdAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<any>("/documents/query", {
        query,
        document_id: selectedDocId,
      });

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.answer || "No response generated.",
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("RAG Query error:", err);
      setError(err.message || "Failed to retrieve RAG response.");
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "⚠️ I encountered an error connecting to the RAG pipeline. Please make sure your backend is running and the document has finished indexing.",
        createdAt: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] max-w-5xl mx-auto rounded-3xl border border-slate-200/80 bg-white shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/70 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-100">
            <Sparkles size={20} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              RAG AI Assistant
            </h2>
            <p className="text-xs text-slate-500">
              Interactive document Q&A powered by vector store retrieval & Gemini
            </p>
          </div>
        </div>

        {/* Active Document Selector & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-xs">
            <Layers size={14} className="text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-500 shrink-0">Context:</span>
            {fetchingDocs ? (
              <Loader2 size={12} className="animate-spin text-slate-400" />
            ) : (
              <select
                value={selectedDocId || ""}
                onChange={(e) =>
                  setSelectedDocId(e.target.value ? Number(e.target.value) : null)
                }
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="">All Uploaded Documents</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.original_filename} ({doc.status})
                  </option>
                ))}
              </select>
            )}
          </div>

          {selectedDocId && (
            <button
              onClick={handleDeleteSelectedDoc}
              disabled={deletingDoc}
              title="Delete selected file"
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 transition disabled:opacity-50"
            >
              {deletingDoc ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              <span>Delete File</span>
            </button>
          )}

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              title="Clear chat history"
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-inner">
              <BookOpen size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Proceeding with RAG Pipeline
            </h3>
            <p className="mt-2 text-sm text-slate-500 max-w-md">
              {activeDoc
                ? `Active context: "${activeDoc.original_filename}". Ask any question to retrieve answers from this document.`
                : "Ask questions to search your study materials and generate detailed AI answers."}
            </p>
          </div>
        ) : (
          messages.map((msg) => <Message key={msg.id} message={msg} />)
        )}

        {loading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/60 max-w-xs">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-900">
              Querying vector store & Gemini AI...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Footer Chat Input */}
      <div className="border-t border-slate-200 bg-white p-4">
        <ChatInput onSend={handleSendQuery} loading={loading} />
      </div>
    </div>
  );
}
