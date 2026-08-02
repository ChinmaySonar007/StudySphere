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

            <Button
              variant="ghost"
              className="
              rounded-full

              text-slate-700
              font-medium

              hover:bg-slate-100
              hover:text-slate-900
              "
            >
              <Link href="/login">Login</Link>
            </Button>

            <Button
              className="clay-primary px-7 text-white"
            >
              Get Started
            </Button>

          </div>

          {/* Mobile Button */}

          <motion.button
            whileTap={{
              scale: 0.9,
            }}
            onClick={() => setOpen(!open)}
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
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
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
            border-white/10

            bg-black/40

            backdrop-blur-3xl

            p-6

            lg:hidden
            "
          >
            <div className="flex flex-col gap-6">

              {navLinks.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="
                  text-slate-300
                  transition
                  hover:text-white
                  "
                >
                  {item.name}
                </Link>
              ))}

              <Button
                variant="ghost"
              >
                Login
              </Button>

              <Button
                className="clay-primary text-white"
              >
                Get Started
              </Button>

            </div>
          </motion.div>

        )}

      </AnimatePresence>
    </>
  );
}