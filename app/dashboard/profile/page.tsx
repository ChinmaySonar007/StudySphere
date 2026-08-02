"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  User as UserIcon,
  Mail,
  Target,
  Award,
  BookOpen,
  FileText,
  Layers,
  HelpCircle,
  GitFork,
  Save,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";

interface UserProfile {
  id: number;
  full_name: string;
  email: string;
  bio: string;
  avatar_url: string;
  study_goal: string;
}

interface UserStats {
  total_notes: number;
  total_decks: number;
  total_cards: number;
  mastered_cards: number;
  total_quizzes: number;
  avg_quiz_score: number;
  total_mindmaps: number;
  total_documents: number;
}

const AVATAR_OPTIONS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [studyGoal, setStudyGoal] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, []);

  async function fetchProfileData() {
    try {
      setLoading(true);
      const [userRes, statsRes] = await Promise.all([
        api.get<UserProfile>("/users/me"),
        api.get<UserStats>("/users/stats"),
      ]);

      setProfile(userRes);
      setStats(statsRes);

      setFullName(userRes.full_name || "");
      setBio(userRes.bio || "");
      setStudyGoal(userRes.study_goal || "Master your subjects with AI");
      setAvatarUrl(userRes.avatar_url || AVATAR_OPTIONS[0]);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.put<UserProfile>("/users/profile", {
        full_name: fullName,
        bio,
        study_goal: studyGoal,
        avatar_url: avatarUrl,
      });

      setProfile(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update profile.");
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
    <div className="space-y-8 max-w-6xl mx-auto px-4 sm:px-6 py-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-800 p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={avatarUrl || AVATAR_OPTIONS[0]}
              alt="User Avatar"
              className="h-24 w-24 rounded-3xl object-cover border-4 border-white/20 shadow-xl"
            />
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white border-2 border-white shadow-sm">
              <Check size={14} />
            </div>
          </div>

          <div className="space-y-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold">{profile?.full_name}</h1>
            <p className="text-indigo-200 text-sm flex items-center justify-center sm:justify-start gap-1.5">
              <Mail size={14} />
              {profile?.email}
            </p>
            <p className="text-xs text-indigo-100/80 max-w-md mt-1 italic">
              "{studyGoal}"
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Study Activity Stats Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Award className="text-indigo-600" size={20} />
          <span>Study Performance & Activity</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stats?.total_notes || 0}</p>
              <p className="text-xs text-slate-500 font-medium">Notes Created</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
              <Layers size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stats?.mastered_cards || 0}</p>
              <p className="text-xs text-slate-500 font-medium">Cards Mastered</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <HelpCircle size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stats?.avg_quiz_score || 0}%</p>
              <p className="text-xs text-slate-500 font-medium">Avg Quiz Accuracy</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
              <BookOpen size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{stats?.total_documents || 0}</p>
              <p className="text-xs text-slate-500 font-medium">Indexed Docs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">Personal Information & Goals</h2>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
              Profile details updated successfully!
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          {/* Avatar Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">Choose Avatar</label>
            <div className="flex items-center gap-4">
              {AVATAR_OPTIONS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Avatar option ${idx}`}
                  onClick={() => setAvatarUrl(url)}
                  className={`h-14 w-14 rounded-2xl object-cover cursor-pointer border-2 transition ${
                    avatarUrl === url
                      ? "border-indigo-600 ring-4 ring-indigo-100 scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Study Goal / Focus</label>
              <input
                type="text"
                placeholder="e.g., Ace MCAT Biology exam"
                value={studyGoal}
                onChange={(e) => setStudyGoal(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Academic Notes</label>
            <textarea
              rows={4}
              placeholder="Tell us about your learning objectives..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 shadow-md disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Save Profile Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
