"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UploadCloud, FileCheck, AlertCircle, Loader2, FileText, CheckCircle2, LogIn, Sparkles, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";


interface FileUploadBoxProps {
  onUploadSuccess?: (document: any) => void;
  onProceedToRAG?: (document: any) => void;
}

export default function FileUploadBox({ onUploadSuccess, onProceedToRAG }: FileUploadBoxProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProceedToRAG = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onProceedToRAG && uploadedDoc) {
      onProceedToRAG(uploadedDoc);
    } else if (uploadedDoc?.id) {
      router.push(`/dashboard/chat?document_id=${uploadedDoc.id}`);
    } else {
      router.push("/dashboard/chat");
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;

    const token = getToken();
    if (!token) {
      setIsAuthError(true);
      setError("You must be logged in to upload documents.");
      return;
    }

    const allowedExtensions = [".pdf", ".docx", ".pptx"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setIsAuthError(false);
      setError(`Invalid file type "${ext}". Only PDF, DOCX, and PPTX files are supported.`);
      return;
    }

    // Max 25 MB
    if (file.size > 25 * 1024 * 1024) {
      setIsAuthError(false);
      setError("File size exceeds the 25MB limit.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setIsAuthError(false);

      const formData = new FormData();
      formData.append("file", file);

      const doc = await api.upload<any>("/documents/upload", formData);

      setUploadedDoc(doc);
      if (onUploadSuccess) {
        onUploadSuccess(doc);
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("401") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("invalid token")) {
        setIsAuthError(true);
        setError("Your login session has expired. Please log in again.");
      } else {
        setIsAuthError(false);
        setError(msg || "Failed to upload document. Please try again.");
      }
    } finally {
      setUploading(false);
    }
  };


  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleBoxClick = () => {
    if (!uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.docx,.pptx"
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBoxClick}
        className={`
          relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-10 text-center transition-all duration-300
          ${
            isDragging
              ? "border-indigo-600 bg-indigo-50/80 scale-[1.01] shadow-lg shadow-indigo-100"
              : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50"
          }
          ${uploading ? "pointer-events-none opacity-80" : ""}
        `}
      >
        {uploading ? (
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-lg font-semibold text-slate-800">Processing & Uploading...</p>
            <p className="text-sm text-slate-500 mt-1">Indexing document for AI analysis</p>
          </div>
        ) : uploadedDoc ? (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {uploadedDoc.original_filename || "Document Uploaded Successfully!"}
            </h3>
            <p className="mt-1 text-sm text-slate-500 max-w-md">
              Document indexed and ready for interactive RAG analysis, AI Q&A, and study assistance.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleProceedToRAG}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 transition-all hover:scale-[1.02]"
              >
                <Sparkles size={18} />
                <span>Proceed with RAG Pipeline</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadedDoc(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Upload Another Document
              </button>
            </div>
          </div>

        ) : (
          <div className="flex flex-col items-center justify-center">
            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all ${
                isDragging ? "bg-indigo-600 text-white shadow-md" : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <UploadCloud size={32} />
            </div>

            <h3 className="text-xl font-bold text-slate-800">
              {isDragging ? "Drop your document here" : "Drag & drop your document here"}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              or <span className="font-semibold text-indigo-600 hover:underline">browse from your computer</span>
            </p>

            <div className="mt-6 flex items-center gap-3 rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-600">
              <FileText size={14} className="text-indigo-500" />
              <span>Supports PDF, DOCX, PPTX (Up to 25MB)</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>

          {isAuthError && (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
            >
              <LogIn size={14} />
              Log In Now
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

