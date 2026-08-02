"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  FileText,
  Plus,
  Sparkles,
  Search,
  Tag,
  Folder,
  Trash2,
  Edit3,
  BookOpen,
  Loader2,
  Check,
  X,
  Layers,
} from "lucide-react";

interface DocumentItem {
  id: number;
  original_filename: string;
  status: string;
}

interface Note {
  id: number;
  user_id: number;
  document_id?: number | null;
  title: string;
  content: string;
  category: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Note Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiDocId, setAiDocId] = useState<number | null>(null);
  const [aiTopic, setAiTopic] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [notesRes, docsRes] = await Promise.all([
        api.get<Note[]>("/notes/"),
        api.get<DocumentItem[]>("/documents/"),
      ]);
      setNotes(notesRes || []);
      setDocuments(docsRes || []);
    } catch (err) {
      console.error("Failed to load notes data:", err);
    } finally {
      setLoading(false);
    }
  }

  const categories = ["All", ...Array.from(new Set(notes.map((n) => n.category)))];

  const filteredNotes = notes.filter((n) => {
    const matchesCategory = selectedCategory === "All" || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openEditor = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setTitle(note.title);
      setCategory(note.category);
      setTags(note.tags);
      setContent(note.content);
      setSelectedDocId(note.document_id || null);
    } else {
      setEditingNote(null);
      setTitle("");
      setCategory("General");
      setTags("");
      setContent("");
      setSelectedDocId(null);
    }
    setIsEditorOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingNote) {
        const updated = await api.put<Note>(`/notes/${editingNote.id}`, {
          title,
          category,
          tags,
          content,
          document_id: selectedDocId,
        });
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      } else {
        const created = await api.post<Note>("/notes/", {
          title,
          category,
          tags,
          content,
          document_id: selectedDocId,
        });
        setNotes((prev) => [created, ...prev]);
      }
      setIsEditorOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to save note.");
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (!confirm("Are you sure you want to delete this note?")) return;
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      alert(err.message || "Failed to delete note.");
    }
  };

  const handleGenerateAiNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiDocId) return;

    try {
      setGeneratingAi(true);
      const newNote = await api.post<Note>("/notes/generate-ai", {
        document_id: aiDocId,
        topic: aiTopic || undefined,
      });
      setNotes((prev) => [newNote, ...prev]);
      setIsAiModalOpen(false);
      setAiTopic("");
    } catch (err: any) {
      alert(err.message || "Failed to generate AI note.");
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100 backdrop-blur-md">
            <Sparkles size={14} className="text-yellow-300" />
            <span>AI-Assisted Note Taking</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Study Notes</h1>
          <p className="text-indigo-100 text-sm max-w-xl">
            Organize concepts, outline study material, and auto-generate comprehensive summaries directly from your uploaded documents.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-3 text-sm font-semibold transition border border-white/20 shadow-md"
          >
            <Sparkles size={18} className="text-yellow-300" />
            <span>Generate with AI</span>
          </button>

          <button
            onClick={() => openEditor()}
            className="flex items-center gap-2 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 px-5 py-3 text-sm font-bold shadow-lg transition"
          >
            <Plus size={18} />
            <span>New Note</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes, tags, content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-inner">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No notes found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            Create a new manual note or use the AI Generator to produce comprehensive study summaries from your documents.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
            >
              <Sparkles size={14} />
              <span>Generate AI Note</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600">
                    <Folder size={12} />
                    {note.category}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEditor(note)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition">
                  {note.title}
                </h3>

                <p className="mt-2 text-xs text-slate-600 line-clamp-4 whitespace-pre-line leading-relaxed">
                  {note.content}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                {note.tags ? (
                  <span className="flex items-center gap-1 font-medium text-slate-500">
                    <Tag size={12} className="text-indigo-500" />
                    {note.tags}
                  </span>
                ) : (
                  <span className="italic text-slate-400">No tags</span>
                )}

                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingNote ? "Edit Note" : "Create New Note"}
              </h2>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Photosynthesis & Cellular Respiration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    placeholder="General, Biology, Math..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tags</label>
                  <input
                    type="text"
                    placeholder="exam, chapter1, key"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Note Content (Markdown supported)</label>
                <textarea
                  rows={8}
                  required
                  placeholder="Write your note content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 shadow-md"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Note Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">AI Note Generator</h2>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateAiNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Source Document *
                </label>
                {documents.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    No documents uploaded yet. Please upload a PDF or document first from the Documents tab.
                  </p>
                ) : (
                  <select
                    required
                    value={aiDocId || ""}
                    onChange={(e) => setAiDocId(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">Select a document...</option>
                    {documents.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.original_filename} ({doc.status})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific Topic / Focus Area (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Key definitions, Chapter 3 summary..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingAi || !aiDocId}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white hover:from-indigo-700 hover:to-purple-700 shadow-md disabled:opacity-50"
                >
                  {generatingAi ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Synthesizing Notes...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Generate Notes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
