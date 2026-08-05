"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";


const navLinks = [
  {
    name: "Features",
    href: "#features",
  },
  {
    name: "How it Works",
    href: "#how-it-works",
  },
  {
    name: "Testimonials",
    href: "#testimonials",
  },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 30);
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{
          opacity: 0,
          y: -80,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className={`fixed left-1/2 top-4 z-50 -translate-x-1/2 transition-all duration-500

        ${
          scrolled
            ? "w-[94%] lg:w-[82%] bg-black/45 backdrop-blur-3xl border border-white/10 shadow-[0_10px_60px_rgba(0,0,0,.45)] py-3"
            : "w-[96%] lg:w-[88%] bg-white/[0.04] backdrop-blur-xl border border-white/5 py-4"
        }

        rounded-2xl`}
      >
        <div className="mx-auto flex h-14 items-center justify-between px-7">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <motion.div
              whileHover={{
                rotate: 10,
                scale: 1.08,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
              }}
              className="
              flex
              h-12
              w-12
              items-center
              justify-center

              rounded-2xl

              bg-gradient-to-br
              from-indigo-500
              via-violet-500
              to-cyan-500

              shadow-[0_0_35px_rgba(99,102,241,.45)]
              "
            >
              <GraduationCap className="h-6 w-6 text-white" />
            </motion.div>

            <div className="hidden sm:block">
              <h1 className="font-bold tracking-tight">
                StudySphere AI
              </h1>

              <p className="text-xs text-slate-500">
                Your Personal AI Study OS
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}

          <nav className="hidden lg:flex items-center gap-10">

            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="
                group
                relative
                text-sm
                font-medium
                text-slate-700
                transition

                hover:text-indigo-600
                "
              >
                {item.name}

                <span
                  className="
                  absolute
                  -bottom-2
                  left-0

                  h-[2px]
                  w-0

                  bg-gradient-to-r
                  from-indigo-500
                  to-cyan-400

                  transition-all
                  duration-300

                  group-hover:w-full
                  "
                />
              </Link>
            ))}
          </nav>

          {/* Desktop Buttons */}

          <div className="hidden lg:flex items-center gap-3">

            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-full px-5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition"
            >
              Login
            </Link>

            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-xl clay-primary px-7 text-sm font-medium text-white shadow transition"
            >
              Get Started
            </Link>

          </div>

          {/* Mobile Button */}

          <motion.button
            whileTap={{
              scale: 0.9,
            }}
            onClick={() => setOpen(!open)}
            aria-label="Toggle Menu"
            className="
            rounded-xl

            border
            border-white/10

            bg-white/5

            p-2

            backdrop-blur-xl

            lg:hidden
            "
          >
            {open ? (
              <X className="h-5 w-5 text-slate-800" />
            ) : (
              <Menu className="h-5 w-5 text-slate-800" />
            )}
          </motion.button>

        </div>
      </motion.header>

      {/* Mobile Drawer */}

      <AnimatePresence>

        {open && (

          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.25,
            }}
            className="
            fixed
            top-24
            left-1/2
            z-40

            w-[94%]

            -translate-x-1/2

            rounded-2xl

            border
            border-slate-200/50

            bg-slate-900/90

            backdrop-blur-3xl

            p-6

            shadow-2xl

            lg:hidden
            "
          >
            <div className="flex flex-col gap-4">

              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="
                  text-slate-200
                  transition
                  hover:text-white
                  font-medium
                  py-2
                  px-3
                  rounded-xl
                  hover:bg-white/10
                  "
                >
                  {item.name}
                </Link>
              ))}

              <div className="h-px w-full bg-white/10 my-1" />

              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center h-11 text-slate-100 hover:text-white bg-white/10 hover:bg-white/20 text-base font-medium rounded-xl transition"
              >
                Login
              </Link>

              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center h-11 clay-primary text-white text-base font-medium rounded-xl shadow transition"
              >
                Get Started
              </Link>

            </div>
          </motion.div>

        )}

      </AnimatePresence>
    </>
  );
}