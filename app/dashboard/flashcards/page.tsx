"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Layers,
  Sparkles,
  Plus,
  RotateCw,
  CheckCircle2,
  XCircle,
  Trash2,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Loader2,
  X,
  Award,
} from "lucide-react";

interface DocumentItem {
  id: number;
  original_filename: string;
  status: string;
}

interface Flashcard {
  id: number;
  deck_id: number;
  front: string;
  back: string;
  is_mastered: boolean;
}

interface FlashcardDeck {
  id: number;
  user_id: number;
  title: string;
  description: string;
  document_id?: number | null;
  created_at: string;
  cards: Flashcard[];
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Study Session State
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Create Deck Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // Add Card Modal
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");

  // AI Generation Modal
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiDocId, setAiDocId] = useState<number | null>(null);
  const [aiCount, setAiCount] = useState(5);
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const [decksRes, docsRes] = await Promise.all([
        api.get<FlashcardDeck[]>("/flashcards/decks"),
        api.get<DocumentItem[]>("/documents/"),
      ]);
      setDecks(decksRes || []);
      setDocuments(docsRes || []);
    } catch (err) {
      console.error("Failed to load flashcard data:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await api.post<FlashcardDeck>("/flashcards/decks", {
        title: newTitle,
        description: newDesc,
        cards: [],
      });
      setDecks((prev) => [created, ...prev]);
      setIsCreateOpen(false);
      setNewTitle("");
      setNewDesc("");
    } catch (err: any) {
      alert(err.message || "Failed to create deck.");
    }
  };

  const handleDeleteDeck = async (deckId: number) => {
    if (!confirm("Are you sure you want to delete this flashcard deck?")) return;
    try {
      await api.delete(`/flashcards/decks/${deckId}`);
      setDecks((prev) => prev.filter((d) => d.id !== deckId));
      if (activeDeck?.id === deckId) setActiveDeck(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete deck.");
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDeck || !cardFront.trim() || !cardBack.trim()) return;

    try {
      const newCard = await api.post<Flashcard>(`/flashcards/decks/${activeDeck.id}/cards`, {
        front: cardFront,
        back: cardBack,
        is_mastered: false,
      });

      const updatedDeck = {
        ...activeDeck,
        cards: [...activeDeck.cards, newCard],
      };

      setActiveDeck(updatedDeck);
      setDecks((prev) => prev.map((d) => (d.id === updatedDeck.id ? updatedDeck : d)));
      setIsAddCardOpen(false);
      setCardFront("");
      setCardBack("");
    } catch (err: any) {
      alert(err.message || "Failed to add card.");
    }
  };

  const handleToggleMastery = async (card: Flashcard) => {
    if (!activeDeck) return;
    try {
      const updatedCard = await api.patch<Flashcard>(`/flashcards/cards/${card.id}/toggle-mastery`);
      const updatedCards = activeDeck.cards.map((c) => (c.id === card.id ? updatedCard : c));
      const updatedDeck = { ...activeDeck, cards: updatedCards };
      
      setActiveDeck(updatedDeck);
      setDecks((prev) => prev.map((d) => (d.id === updatedDeck.id ? updatedDeck : d)));
    } catch (err: any) {
      console.error("Failed to update mastery status:", err);
    }
  };

  const handleGenerateAiDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiDocId) return;

    try {
      setGeneratingAi(true);
      const generated = await api.post<FlashcardDeck>("/flashcards/generate", {
        document_id: aiDocId,
        count: aiCount,
      });
      setDecks((prev) => [generated, ...prev]);
      setIsAiModalOpen(false);
      setActiveDeck(generated);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      alert(err.message || "Failed to generate flashcards.");
    } finally {
      setGeneratingAi(false);
    }
  };

  // Study view rendering
  if (activeDeck) {
    const currentCard = activeDeck.cards[currentCardIndex];
    const totalCards = activeDeck.cards.length;
    const masteredCount = activeDeck.cards.filter((c) => c.is_mastered).length;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setActiveDeck(null);
              setIsFlipped(false);
            }}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft size={16} />
            <span>Back to Decks</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddCardOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <Plus size={14} />
              <span>Add Card</span>
            </button>
            <button
              onClick={() => handleDeleteDeck(activeDeck.id)}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Title & Progress */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{activeDeck.title}</h1>
              {activeDeck.description && (
                <p className="text-xs text-slate-500 mt-1">{activeDeck.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600">
              <Award size={16} />
              <span>{masteredCount} / {totalCards} Mastered</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{
                width: `${totalCards > 0 ? (masteredCount / totalCards) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* 3D Flip Card Container */}
        {totalCards === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-8">
            <Layers size={40} className="text-indigo-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No flashcards in this deck</h3>
            <p className="text-xs text-slate-500 mt-1">Add your first card manually or auto-generate with AI.</p>
            <button
              onClick={() => setIsAddCardOpen(true)}
              className="mt-4 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
            >
              <Plus size={14} />
              <span>Add Card</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="perspective-1000 w-full cursor-pointer"
            >
              <div
                className={`relative w-full min-h-[320px] rounded-3xl transition-transform duration-500 transform-style-3d shadow-xl border border-slate-200 bg-white ${
                  isFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front Side */}
                <div className="absolute inset-0 backface-hidden p-8 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                    <span className="uppercase tracking-wider">Front Question</span>
                    <span>Click card to flip</span>
                  </div>

                  <div className="my-auto text-center px-6">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-relaxed">
                      {currentCard?.front}
                    </h2>
                  </div>

                  <div className="flex justify-center text-xs text-indigo-600 font-semibold items-center gap-1">
                    <RotateCw size={14} />
                    <span>Flip for answer</span>
                  </div>
                </div>

                {/* Back Side */}
                <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
                  <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold">
                    <span className="uppercase tracking-wider">Back Answer</span>
                    <span>Answer details</span>
                  </div>

                  <div className="my-auto text-center px-6">
                    <p className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed whitespace-pre-line">
                      {currentCard?.back}
                    </p>
                  </div>

                  <div className="flex justify-center text-xs text-indigo-300 font-semibold items-center gap-1">
                    <RotateCw size={14} />
                    <span>Flip to question</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation & Mastery Controls */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev > 0 ? prev - 1 : totalCards - 1));
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft size={16} />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => currentCard && handleToggleMastery(currentCard)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                    currentCard?.is_mastered
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>{currentCard?.is_mastered ? "Mastered!" : "Mark as Mastered"}</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setIsFlipped(false);
                  setCurrentCardIndex((prev) => (prev < totalCards - 1 ? prev + 1 : 0));
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Add Card Modal */}
        {isAddCardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900">Add New Card</h3>
                <button onClick={() => setIsAddCardOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Front (Question / Prompt)</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter question or term..."
                    value={cardFront}
                    onChange={(e) => setCardFront(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Back (Answer / Definition)</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter answer or detailed explanation..."
                    value={cardBack}
                    onChange={(e) => setCardBack(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCardOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
                  >
                    Add Card
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Decks list view
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 p-8 text-white shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-purple-100 backdrop-blur-md">
            <Layers size={14} className="text-yellow-300" />
            <span>Interactive Active Recall</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Flashcard Decks</h1>
          <p className="text-purple-100 text-sm max-w-xl">
            Test your knowledge with 3D flip flashcards. Track mastery and generate study decks instantly using AI.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md px-5 py-3 text-sm font-semibold transition border border-white/20 shadow-md"
          >
            <Sparkles size={18} className="text-yellow-300" />
            <span>AI Deck Builder</span>
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white text-indigo-800 hover:bg-indigo-50 px-5 py-3 text-sm font-bold shadow-lg transition"
          >
            <Plus size={18} />
            <span>New Deck</span>
          </button>
        </div>
      </div>

      {/* Decks Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 shadow-inner">
            <Layers size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No flashcard decks yet</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md">
            Build custom flashcard study decks or auto-generate Q&A decks from uploaded documents.
          </p>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
          >
            <Sparkles size={14} />
            <span>Generate AI Flashcard Deck</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => {
            const cardCount = deck.cards.length;
            const masteredCount = deck.cards.filter((c) => c.is_mastered).length;
            const percentage = cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0;

            return (
              <div
                key={deck.id}
                onClick={() => {
                  setActiveDeck(deck);
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-200 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                      <Layers size={20} />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDeck(deck.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition">
                    {deck.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                    {deck.description || "Interactive Q&A study deck"}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">{cardCount} Cards</span>
                    <span className="text-indigo-600">{percentage}% Mastered</span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Deck Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Create Flashcard Deck</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deck Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Organic Chemistry Terms"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="Short summary of deck..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md hover:bg-indigo-700"
                >
                  Create Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Deck Generator Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <Sparkles size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">AI Flashcard Generator</h2>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerateAiDeck} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Document *
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
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  Number of Cards to Generate
                </label>
                <input
                  type="number"
                  min={3}
                  max={15}
                  value={aiCount}
                  onChange={(e) => setAiCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-xs font-bold text-white hover:from-purple-700 hover:to-indigo-700 shadow-md disabled:opacity-50"
                >
                  {generatingAi ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Generating Cards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      <span>Build Flashcard Deck</span>
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
