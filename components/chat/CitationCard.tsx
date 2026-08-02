"use client";

import { BookOpen, FileText } from "lucide-react";

interface CitationCardProps {
  citation: {
    page?: number | null;
    content: string;
    document_id?: string | null;
  };
  index: number;
}

export default function CitationCard({ citation, index }: CitationCardProps) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-slate-700 transition-all hover:bg-indigo-50">
      <div className="flex items-center justify-between mb-1.5 font-semibold text-indigo-700">
        <div className="flex items-center gap-1.5">
          <BookOpen size={14} className="text-indigo-500" />
          <span>Source Chunk #{index + 1}</span>
        </div>
        {citation.page && (
          <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
            Page {citation.page}
          </span>
        )}
      </div>
      <p className="line-clamp-3 text-slate-600 font-mono text-[11px] leading-relaxed bg-white/70 p-2 rounded-lg border border-slate-100">
        "{citation.content}"
      </p>
    </div>
  );
}
