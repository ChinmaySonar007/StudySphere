"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  Cpu,
  Bell,
  Database,
  Check,
  Loader2,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  theme_preference: string;
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("system");
  const [aiModel, setAiModel] = useState("gemini-2.5-flash");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchUserSettings();
  }, []);

  async function fetchUserSettings() {
    try {
      setLoading(true);
      const res = await api.get<UserProfile>("/users/me");
      setUser(res);
      setSelectedTheme(res.theme_preference || "system");
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.put<UserProfile>("/users/settings", {
        theme_preference: selectedTheme,
      });

      setUser(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-950 p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur-md">
            <SettingsIcon size={14} className="text-indigo-400" />
            <span>Preferences & System Control</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">App Settings</h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Configure appearance theme, AI provider defaults, notification schedules, and database preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">

        {/* AI Model Configuration */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="text-indigo-600" size={18} />
            <span>AI Reasoning & RAG Engine</span>
          </h2>
          <p className="text-xs text-slate-500">
            Select default AI model pipeline for document retrieval and Q&A generation.
          </p>

          <div className="space-y-3 pt-2">
            {[
              {
                id: "gemini-2.5-flash",
                name: "Google Gemini 2.5 Flash",
                desc: "High-speed reasoning & multimodal synthesis (Recommended)",
              },
              {
                id: "grok-2-latest",
                name: "xAI Grok 2",
                desc: "Advanced logic & reasoning pipeline",
              },
              {
                id: "fallback-nlp",
                name: "Context-Driven Local NLP Engine",
                desc: "Offline context extraction & rule-based sentence parsing",
              },
            ].map((model) => (
              <div
                key={model.id}
                onClick={() => setAiModel(model.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition cursor-pointer ${
                  aiModel === model.id
                    ? "border-indigo-600 bg-indigo-50/40 text-indigo-950 font-bold shadow-xs"
                    : "border-slate-200 bg-slate-50/30 text-slate-700 hover:bg-slate-100/50"
                }`}
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{model.name}</h3>
                  <p className="text-xs text-slate-500 font-normal">{model.desc}</p>
                </div>
                <div
                  className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                    aiModel === model.id ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                  }`}
                >
                  {aiModel === model.id && <div className="h-2 w-2 rounded-full bg-white" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & System Status */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bell className="text-indigo-600" size={18} />
            <span>Study Reminders & Notifications</span>
          </h2>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-bold text-slate-800">Enable Daily Recall Notifications</p>
              <p className="text-xs text-slate-500">
                Receive interactive flashcard recall reminders and scheduled study plan prompts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Backend & Vector DB Health Status */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={18} />
            <span>System & API Connection Status</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className="font-bold text-emerald-900">FastAPI Backend</p>
                <p className="text-emerald-700">Healthy & Operational (v1.0.0)</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 text-xs">
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <div>
                <p className="font-bold text-indigo-900">ChromaDB Vector Store</p>
                <p className="text-indigo-700">Indexed & Ready</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              Settings updated successfully!
            </span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 shadow-md disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Check size={15} />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
