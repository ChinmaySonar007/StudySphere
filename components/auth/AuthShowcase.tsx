"use client";

import { motion } from "framer-motion";
import { BrainCircuit, FileText, Sparkles } from "lucide-react";

const cards = [
  {
    icon: BrainCircuit,
    title: "AI Tutor",
    desc: "Chat with your notes using RAG.",
  },
  {
    icon: FileText,
    title: "Smart Notes",
    desc: "Generate summaries instantly.",
  },
  {
    icon: Sparkles,
    title: "Flashcards",
    desc: "Revise faster with AI.",
  },
];

export default function AuthShowcase() {
  return (
    <section className="hidden lg:flex flex-1 items-center justify-center px-20">
      <div className="max-w-xl">

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-extrabold leading-tight"
        >
          Learn Smarter with
          <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            StudySphere AI
          </span>
        </motion.h1>

        <p className="mt-8 text-lg text-slate-400">
          Upload your notes, chat with AI,
          generate quizzes, flashcards,
          mind maps and revision plans.
        </p>

        <div className="mt-12 space-y-5">

          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-2xl"
            >
              <div className="flex items-center gap-4">

                <div className="rounded-xl bg-indigo-500/20 p-3">
                  <card.icon className="h-6 w-6 text-indigo-400" />
                </div>

                <div>
                  <h3 className="font-semibold">
                    {card.title}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {card.desc}
                  </p>
                </div>

              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}