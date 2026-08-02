"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  HelpCircle,
  Sparkles,
  Plus,
  Award,
  CheckCircle2,
  XCircle,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Clock,
  Loader2,
  X,
  RotateCcw,
} from "lucide-react";

interface DocumentItem {
  id: number;
  original_filename: string;
  status: string;
}

interface QuizQuestion {
  id: number;
  quiz_id: number;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Quiz {
  id: number;
  user_id: number;
  title: string;
  document_id?: number | null;
  total_questions: number;
  high_score: number;
  created_at: string;
  questions: QuizQuestion[];
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // AI Generator Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiDocId, setAiDocId] = useState<number | null>(null);
  const [aiNumQs, setAiNumQs] = useState(5);
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [quizzesRes, docsRes] = await Promise.all([
        api.get<Quiz[]>("/quizzes/"),
        api.get<DocumentItem[]>("/documents/"),
      ]);
      setQuizzes(quizzesRes || []);
      setDocuments(docsRes || []);
    } catch (err) {
      console.error("Failed to load quiz data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteQuiz = async (quizId: number) => {
    if (!confirm("Are you sure you want to delete this quiz?")) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      if (activeQuiz?.id === quizId) setActiveQuiz(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete quiz.");
    }
  };

  const handleSelectAnswer = (qIndex: number, option: string) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    let score = 0;
    activeQuiz.questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx] || "";
      if (
        chosen === q.correct_answer ||
        chosen.startsWith(q.correct_answer) ||
        q.correct_answer.startsWith(chosen)
      ) {
        score += 1;
      }
    });

    setQuizScore(score);
    setIsSubmitted(true);

    try {
      const updated = await api.post<Quiz>(`/quizzes/${activeQuiz.id}/submit`, { score });
      setQuizzes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    } catch (err) {
      console.error("Failed to save score:", err);
    }
  };

  const handleGenerateAiQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiDocId) return;

    try {
      setGeneratingAi(true);
      const newQuiz = await api.post<Quiz>("/quizzes/generate", {
        document_id: aiDocId,
        num_questions: aiNumQs,
      });
      setQuizzes((prev) => [newQuiz, ...prev]);
      setIsAiModalOpen(false);
      setActiveQuiz(newQuiz);
      setCurrentQIndex(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
    } catch (err: any) {
      alert(err.message || "Failed to generate quiz.");
    } finally {
      setGeneratingAi(false);
    }
  };

  // Active Quiz View
  if (activeQuiz) {
    const currentQ = activeQuiz.questions[currentQIndex];
    const totalQs = activeQuiz.questions.length;
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setActiveQuiz(null);
              setIsSubmitted(false);
              setSelectedAnswers({});
            }}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={16} />
            <span>Back to Quizzes</span>
          </button>

          <button
            onClick={() => handleDeleteQuiz(activeQuiz.id)}
            className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Title Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{activeQuiz.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Question {currentQIndex + 1} of {totalQs}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700">
            <Award size={16} />
            <span>High Score: {activeQuiz.high_score} / {totalQs}</span>
          </div>
        </div>

        {/* Quiz Submission Result Report */}
        {isSubmitted ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-inner">
              <Award size={40} />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-slate-900">Quiz Complete!</h2>
              <p className="text-slate-500 text-sm">
                You scored <span className="font-bold text-indigo-600">{quizScore}</span> out of{" "}
                <span className="font-bold text-slate-800">{totalQs}</span> (
                {Math.round((quizScore / totalQs) * 100)}%)
              </p>
            </div>

            {/* Answer Breakdown */}
            <div className="text-left space-y-4 pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Question Breakdown & Explanations:</h3>
              {activeQuiz.questions.map((q, idx) => {
                const userChoice = selectedAnswers[idx] || "Unanswered";
                const isCorrect =
                  userChoice === q.correct_answer ||
                  userChoice.startsWith(q.correct_answer) ||
                  q.correct_answer.startsWith(userChoice);

                return (
                  <div
                    key={q.id || idx}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      isCorrect ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-2 font-bold text-slate-800">
                      {isCorrect ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                      )}
                      <span>
                        Q{idx + 1}: {q.question}
                      </span>
                    </div>

                    <div className="pl-6 space-y-1 text-slate-600">
                      <p>
                        Your Answer: <span className="font-semibold">{userChoice}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-emerald-700 font-semibold">
                          Correct Answer: {q.correct_answer}
                        </p>
                      )}
                      {q.explanation && (
                        <p className="text-slate-500 italic mt-1 bg-white p-2 rounded-lg border border-slate-200/60">
                          Explanation: {q.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setSelectedAnswers({});
                setCurrentQIndex(0);
              }}
              className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-md hover:bg-indigo-700"
            >
              <RotateCcw size={16} />
              <span>Retake Quiz</span>
            </button>
          </div>
        ) : (
          /* Active Question Card */
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold">
                Question {currentQIndex + 1}
              </span>
              <h2 className="text-xl font-bold text-slate-900 leading-relaxed">
                {currentQ?.question}
              </h2>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ?.options.map((opt, oIdx) => {
                const isSelected = selectedAnswers[currentQIndex] === opt;
                return (
                  <div
                    key={oIdx}
                    onClick={() => handleSelectAnswer(currentQIndex, opt)}
                    className={`flex items-center justify-between p-4 rounded-2xl border text-sm font-medium transition cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 shadow-sm"
                        : "border-slate-200 bg-slate-50/30 text-slate-700 hover:bg-slate-100/60"
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
                      }`}
                    >
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation & Submit Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                <ArrowLeft size={16} />
                <span>Previous</span>
              </button>

              {currentQIndex === totalQs - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                >
                  <CheckCircle2 size={16} />
                  <span>Submit Quiz</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentQIndex((prev) => Math.min(totalQs - 1, prev + 1))}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
                >
                  <span>Next</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Quiz Hub View
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100 backdrop-blur-md">
            <HelpCircle size={14} className="text-yellow-300" />
            <span>AI Knowledge Assessment</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Practice Quizzes</h1>
          <p className="text-emerald-100 text-sm max-w-xl">
            Test comprehension, track accuracy scores, and generate custom multiple-choice quizzes directly from document materials.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-3 text-sm font-semibold transition border border-white/20 shadow-md"
          >
            <Sparkles size={18} className="text-yellow-300" />
            <span>Generate AI Quiz</span>
          </button>
        </div>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 shadow-inner">
            <HelpCircle size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No quizzes generated yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            Select an uploaded study document and let AI create a practice quiz for you.
          </p>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
          >
            <Sparkles size={14} />
            <span>Generate Quiz with AI</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => {
            const qCount = quiz.questions.length;
            return (
              <div
                key={quiz.id}
                onClick={() => {
                  setActiveQuiz(quiz);
                  setCurrentQIndex(0);
                  setSelectedAnswers({});
                  setIsSubmitted(false);
                }}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                      <HelpCircle size={20} />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuiz(quiz.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition">
                    {quiz.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {qCount} Questions • Multiple Choice
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
                    <Award size={14} />
                    <span>Best: {quiz.high_score} / {qCount}</span>
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Quiz Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">AI Quiz Generator</h2>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateAiQuiz} className="space-y-4">
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  Number of Questions
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={aiNumQs}
                  onChange={(e) => setAiNumQs(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-xs font-bold text-white hover:from-emerald-700 hover:to-teal-700 shadow-md disabled:opacity-50"
                >
                  {generatingAi ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Generating Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Build Quiz</span>
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
