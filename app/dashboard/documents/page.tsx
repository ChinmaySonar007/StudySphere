"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import FileUploadBox from "@/components/upload/FileUploadBox";
import { api } from "@/lib/api";
import {
  FileText,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  ArrowRight,
  Trash2,
} from "lucide-react";

interface DocumentItem {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED" | string;
  created_at: string;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setError(null);
      const data = await api.get<DocumentItem[]>("/documents/");
      setDocuments(data || []);
    } catch (err: any) {
      console.error("Failed to fetch documents:", err);
      setError(err.message || "Failed to load uploaded documents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUploadSuccess = () => {
    fetchDocuments();
  };

  const handleProceedToRAG = (doc: DocumentItem) => {
    router.push(`/dashboard/chat?document_id=${doc.id}`);
  };

  const handleDeleteDocument = async (e: React.MouseEvent, doc: DocumentItem) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${doc.original_filename}"?`)) return;

    try {
      setDeletingId(doc.id);
      await api.delete(`/documents/${doc.id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err: any) {
      alert(err.message || "Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    (doc.original_filename || doc.filename)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READY":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-500" />
            Ready for RAG
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
            <Loader2 size={12} className="animate-spin text-amber-500" />
            Indexing...
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 border border-red-200">
            <AlertCircle size={12} className="text-red-500" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            <Clock size={12} />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documents</h1>
        <p className="mt-1 text-slate-500">
          Upload and manage your study materials (PDF, DOCX, PPTX) to use in the RAG pipeline.
        </p>
      </div>

      <FileUploadBox onUploadSuccess={handleUploadSuccess} />

      {/* Document Library Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Your Study Documents</h2>
            <p className="text-sm text-slate-500">
              Select any indexed document to launch the RAG pipeline
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition"
              />
            </div>

            <button
              onClick={fetchDocuments}
              title="Refresh list"
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-sm text-slate-500">Loading your documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-700">No documents found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery ? "No documents match your search filter." : "Upload a PDF, DOCX, or PPTX file above to get started."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FileText size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc.status)}
                      <button
                        onClick={(e) => handleDeleteDocument(e, doc)}
                        disabled={deletingId === doc.id}
                        title="Delete document"
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        {deletingId === doc.id ? (
                          <Loader2 size={14} className="animate-spin text-red-500" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-900 line-clamp-2 title-case" title={doc.original_filename}>
                    {doc.original_filename}
                  </h3>

                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span className="uppercase font-semibold tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                      {doc.file_type.replace(".", "")}
                    </span>
                    <span>•</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleProceedToRAG(doc)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-xs"
                  >
                    <Sparkles size={14} />
                    <span>Proceed with RAG Pipeline</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
