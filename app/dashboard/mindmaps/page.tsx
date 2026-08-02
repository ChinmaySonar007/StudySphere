"use client";

import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { api } from "@/lib/api";
import {
  GitFork,
  Sparkles,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  X,
  Share2,
  Save,
} from "lucide-react";

interface DocumentItem {
  id: number;
  original_filename: string;
  status: string;
}

interface MindmapItem {
  id: number;
  user_id: number;
  document_id?: number | null;
  title: string;
  nodes_json: string;
  created_at: string;
  updated_at: string;
}

export default function MindmapsPage() {
  const [mindmaps, setMindmaps] = useState<MindmapItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Canvas View State
  const [activeMindmap, setActiveMindmap] = useState<MindmapItem | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [saving, setSaving] = useState(false);

  // AI Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiDocId, setAiDocId] = useState<number | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [mapsRes, docsRes] = await Promise.all([
        api.get<MindmapItem[]>("/mindmaps/"),
        api.get<DocumentItem[]>("/documents/"),
      ]);
      setMindmaps(mapsRes || []);
      setDocuments(docsRes || []);
    } catch (err) {
      console.error("Failed to load mindmaps:", err);
    } finally {
      setLoading(false);
    }
  }

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const openMindmapCanvas = (mapItem: MindmapItem) => {
    setActiveMindmap(mapItem);
    try {
      const parsed = JSON.parse(mapItem.nodes_json || "{}");
      setNodes(parsed.nodes || []);
      setEdges(parsed.edges || []);
    } catch (err) {
      console.error("Failed to parse mindmap nodes:", err);
      setNodes([]);
      setEdges([]);
    }
  };

  const handleSaveCanvas = async () => {
    if (!activeMindmap) return;
    try {
      setSaving(true);
      const graphData = JSON.stringify({ nodes, edges });
      const updated = await api.put<MindmapItem>(`/mindmaps/${activeMindmap.id}`, {
        nodes_json: graphData,
      });
      setMindmaps((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch (err: any) {
      alert(err.message || "Failed to save mindmap changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMindmap = async (id: number) => {
    if (!confirm("Are you sure you want to delete this mindmap?")) return;
    try {
      await api.delete(`/mindmaps/${id}`);
      setMindmaps((prev) => prev.filter((m) => m.id !== id));
      if (activeMindmap?.id === id) setActiveMindmap(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete mindmap.");
    }
  };

  const handleGenerateAiMindmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiDocId) return;

    try {
      setGeneratingAi(true);
      const generated = await api.post<MindmapItem>("/mindmaps/generate", {
        document_id: aiDocId,
      });
      setMindmaps((prev) => [generated, ...prev]);
      setIsAiModalOpen(false);
      openMindmapCanvas(generated);
    } catch (err: any) {
      alert(err.message || "Failed to generate mindmap.");
    } finally {
      setGeneratingAi(false);
    }
  };

  // Canvas View Mode
  if (activeMindmap) {
    return (
      <div className="flex flex-col h-[calc(100vh-6rem)] max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveMindmap(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div>
              <h1 className="text-lg font-bold text-slate-900">{activeMindmap.title}</h1>
              <p className="text-xs text-slate-500">Interactive visual concept node graph</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveCanvas}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 shadow-md disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              <span>Save Map</span>
            </button>

            <button
              onClick={() => handleDeleteMindmap(activeMindmap.id)}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* ReactFlow Interactive Canvas */}
        <div className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 overflow-hidden shadow-inner relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Controls className="bg-white rounded-xl shadow-md border border-slate-200" />
            <Background gap={16} color="#cbd5e1" />
          </ReactFlow>
        </div>
      </div>
    );
  }

  // Dashboard List View
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-700 p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-sky-100 backdrop-blur-md">
            <GitFork size={14} className="text-yellow-300" />
            <span>Visual Learning & Mindmapping</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Mind Maps</h1>
          <p className="text-sky-100 text-sm max-w-xl">
            Visualize relationships between topics, explore branch hierarchies, and construct AI concept maps from study materials.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-3 text-sm font-semibold transition border border-white/20 shadow-md"
          >
            <Sparkles size={18} className="text-yellow-300" />
            <span>AI Mindmap Generator</span>
          </button>
        </div>
      </div>

      {/* Mindmap Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        </div>
      ) : mindmaps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 mb-4 shadow-inner">
            <GitFork size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Mindmaps Created</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            Generate an interactive visual mindmap outline from any uploaded document.
          </p>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-sky-700 transition"
          >
            <Sparkles size={14} />
            <span>Generate Mindmap with AI</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mindmaps.map((mapItem) => (
            <div
              key={mapItem.id}
              onClick={() => openMindmapCanvas(mapItem)}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition">
                    <GitFork size={20} />
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMindmap(mapItem.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-sky-600 transition">
                  {mapItem.title}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Interactive Node Visualizer Map
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Created {new Date(mapItem.created_at).toLocaleDateString()}</span>
                <span className="font-bold text-sky-600 group-hover:underline">Open Canvas &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Mindmap Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">AI Mindmap Generator</h2>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateAiMindmap} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Source Document *
                </label>
                {documents.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    No documents uploaded yet. Please upload a PDF first from Documents tab.
                  </p>
                ) : (
                  <select
                    required
                    value={aiDocId || ""}
                    onChange={(e) => setAiDocId(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-xs font-bold text-white hover:from-sky-700 hover:to-indigo-700 shadow-md disabled:opacity-50"
                >
                  {generatingAi ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Building Concept Map...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Build Mindmap</span>
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
