"use client";

import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
} from "lucide-react";

import AuroraBackground from "@/components/effects/AuroraBackground";
import AnimatedGrid from "@/components/effects/AnimatedGrid";
import MouseGlow from "@/components/effects/MouseGlow";
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
  CountUp,
} from "@/components/effects/ScrollReveal";

import Navbar from "@/components/landing/Navbar";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: FileText,
    title: "Smart Document Upload",
    description:
      "Upload PDFs, PPTs, DOCX, lecture notes and organize everything in one place.",
  },
  {
    icon: MessageSquare,
    title: "AI RAG Chat",
    description:
      "Ask questions and receive answers grounded only in your uploaded study material.",
  },
  {
    icon: Sparkles,
    title: "AI Notes",
    description:
      "Generate summaries, bullet notes and revision sheets in seconds.",
  },
  {
    icon: GraduationCap,
    title: "Flashcards & Quiz",
    description:
      "Create MCQs and flashcards automatically for faster revision.",
  },
  {
    icon: BrainCircuit,
    title: "Mind Maps",
    description:
      "Visualize complex concepts with AI-generated interactive mind maps.",
  },
  {
    icon: LayoutDashboard,
    title: "Study Planner",
    description:
      "Build personalized revision plans based on your exam schedule.",
  },
];

export default function Home() {
  return (
    <AuroraBackground>
      <AnimatedGrid />
      <MouseGlow />

      <main className="relative z-10 min-h-screen text-slate-900">
        <Navbar />

        {/* HERO */}
        <section className="relative overflow-hidden pt-40 pb-32">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <ScrollReveal variant="fade-down" duration={0.8}>
              <span
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  border border-indigo-200
                  bg-white/70
                  px-5 py-2
                  text-sm font-medium
                  text-indigo-700
                  shadow-sm
                  backdrop-blur-xl
                "
              >
                🚀 AI Powered Learning Platform
              </span>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.15} duration={0.9}>
              <h1 className="mx-auto mt-8 max-w-5xl text-5xl font-extrabold tracking-tight md:text-7xl">
                Your Personal
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-500 bg-clip-text text-transparent">
                  AI Study OS
                </span>
              </h1>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.3} duration={0.9}>
              <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-600">
                Upload your notes, chat with them using AI, generate quizzes,
                flashcards, summaries, mind maps and personalized study plans —
                all in one beautiful platform.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="fade-up" delay={0.45} duration={0.8}>
              <div className="mt-12 flex flex-wrap justify-center gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="clay-primary px-8 text-white"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="clay-outline px-8 text-slate-700"
                  >
                    Live Demo
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            {/* STATS */}
            <StaggerContainer
              stagger={0.15}
              delay={0.2}
              className="mt-24 grid gap-6 md:grid-cols-4"
            >
              {[
                ["1000+", "Students"],
                ["5000+", "Documents"],
                ["100000+", "Questions Answered"],
                ["99%", "Accuracy"],
              ].map(([value, label]) => (
                <StaggerItem key={label} variant="fade-up">
                  <Card
                    className="
                      rounded-3xl
                      border
                      border-white/60
                      bg-white/70
                      p-6
                      shadow-lg
                      backdrop-blur-2xl
                      transition-all
                      duration-300
                      hover:-translate-y-2
                      hover:shadow-2xl
                    "
                  >
                    <h2 className="text-3xl font-bold text-slate-900">
                      <CountUp value={value} />
                    </h2>

                    <p className="mt-2 text-slate-500">{label}</p>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="mx-auto max-w-7xl px-6 py-28">
          <ScrollReveal variant="fade-up">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-slate-900">
                Everything You Need To Study Smarter
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                StudySphere combines Retrieval-Augmented Generation with modern AI
                tools to create an intelligent learning experience.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer
            stagger={0.1}
            delay={0.1}
            className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <StaggerItem key={feature.title} variant="fade-up">
                <Card
                  className="
                    group
                    h-full
                    rounded-3xl
                    border
                    border-white/60
                    bg-white/70
                    p-8
                    shadow-lg
                    backdrop-blur-2xl
                    transition-all
                    duration-300
                    hover:-translate-y-2
                    hover:shadow-2xl
                  "
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 transition-colors group-hover:bg-indigo-600">
                    <feature.icon className="h-7 w-7 text-indigo-600 transition-colors group-hover:text-white" />
                  </div>

                  <h3 className="text-xl font-semibold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-4 leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="border-y border-slate-200/80 bg-white/40 py-28 backdrop-blur-xl"
        >
          <div className="mx-auto max-w-6xl px-6">
            <ScrollReveal variant="fade-up">
              <h2 className="text-center text-4xl font-bold text-slate-900">
                How It Works
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-center text-slate-600">
                Start learning in three simple steps.
              </p>
            </ScrollReveal>

            <StaggerContainer
              stagger={0.18}
              delay={0.15}
              className="mt-16 grid gap-8 md:grid-cols-3"
            >
              {[
                {
                  step: "01",
                  title: "Upload Documents",
                  desc: "Import PDFs, PPTs, DOCX, lecture notes or handwritten notes.",
                },
                {
                  step: "02",
                  title: "AI Understands",
                  desc: "Our RAG engine indexes your content using vector embeddings for accurate responses.",
                },
                {
                  step: "03",
                  title: "Study Faster",
                  desc: "Generate quizzes, summaries, flashcards and chat with your notes.",
                },
              ].map((item) => (
                <StaggerItem key={item.step} variant="fade-up">
                  <Card
                    className="
                      rounded-3xl
                      border
                      border-white/60
                      bg-white/70
                      p-8
                      shadow-lg
                      backdrop-blur-2xl
                      transition-all
                      duration-300
                      hover:-translate-y-2
                      hover:shadow-2xl
                    "
                  >
                    <span className="text-5xl font-extrabold text-indigo-600">
                      {item.step}
                    </span>

                    <h3 className="mt-6 text-2xl font-semibold text-slate-900">
                      {item.title}
                    </h3>

                    <p className="mt-4 leading-7 text-slate-600">
                      {item.desc}
                    </p>
                  </Card>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <ScrollReveal variant="zoom" duration={0.8}>
              <div className="rounded-[32px] border border-white/60 bg-white/70 p-14 shadow-xl backdrop-blur-2xl">
                <h2 className="text-5xl font-bold tracking-tight text-slate-900">
                  Ready to Learn Smarter?
                </h2>

                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  Join thousands of students using AI to save time, revise faster
                  and score better.
                </p>

                <Link href="/signup">
                  <Button
                    size="lg"
                    className="clay-primary mt-10 px-10 text-white"
                  >
                    Start Learning Free
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* FOOTER */}
        <ScrollReveal variant="fade-up" duration={0.6}>
          <footer className="border-t border-slate-200 py-10">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
              <p className="text-slate-500">
                © 2026 StudySphere AI. All rights reserved.
              </p>

              <div className="flex gap-6 text-slate-600">
                <a
                  href="#"
                  className="transition-colors hover:text-indigo-600"
                >
                  GitHub
                </a>

                <a
                  href="#"
                  className="transition-colors hover:text-indigo-600"
                >
                  Docs
                </a>

                <a
                  href="#"
                  className="transition-colors hover:text-indigo-600"
                >
                  Privacy
                </a>

                <a
                  href="#"
                  className="transition-colors hover:text-indigo-600"
                >
                  Contact
                </a>
              </div>
            </div>
          </footer>
        </ScrollReveal>
      </main>
    </AuroraBackground>
  );
}