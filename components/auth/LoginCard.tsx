"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

import { api } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import type { AuthResponse } from "@/types/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginCard() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (typeof window === "undefined") return;

      // Handle Google OAuth hash callback
      if (window.location.hash.includes("access_token=") || window.location.hash.includes("id_token=")) {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const token = params.get("id_token") || params.get("access_token");
        if (token) {
          try {
            setLoading(true);
            const res = await api.post<AuthResponse>("/auth/google", {
              token: token,
            });
            saveToken(res.access_token);
            router.push("/dashboard");
          } catch (err: any) {
            setError(err.message || "Google authentication failed.");
          } finally {
            setLoading(false);
          }
        }
      }


      // Handle GitHub OAuth search params code callback
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      if (code) {
        try {
          setLoading(true);
          const res = await api.post<AuthResponse>("/auth/github", {
            code,
          });
          saveToken(res.access_token);
          router.push("/dashboard");
        } catch (err: any) {
          setError(err.message || "GitHub authentication failed.");
        } finally {
          setLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, [router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });

      saveToken(response.access_token);

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setLoading(true);
    setError("");

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "1091089553777-2jhcgt3fkrm1vf8aa3853a6j8li8mm6m.apps.googleusercontent.com";

    const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=studysphere_${Date.now()}`;
    window.location.href = googleAuthUrl;

  };


  const handleGitHubAuth = () => {
    setLoading(true);
    setError("");

    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

    if (clientId && typeof window !== "undefined") {
      const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
      window.location.href = githubAuthUrl;
    } else {
      window.location.href = "https://github.com/login";
    }
  };

  return (
    <section className="flex w-full items-center justify-center p-4 sm:p-8 lg:w-[500px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 backdrop-blur-3xl"
      >
        <h2 className="text-4xl font-bold">
          Welcome Back
        </h2>

        <p className="mt-2 text-slate-400">
          Sign in to continue your learning.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="mt-10 space-y-5"
        >
          <Input
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="h-12 bg-white/5 text-base"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <Input
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            className="h-12 bg-white/5 text-base"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <div className="flex justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded" />
              Remember me
            </label>

            <Link href="/forgot-password" className="hover:underline">
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 font-semibold text-base shadow-lg active:scale-[0.98] transition"
          >
            {loading
              ? "Signing In..."
              : "Login"}
          </Button>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="h-12 w-full justify-center gap-3 bg-white/5"
          >
            <FcGoogle size={22} />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            onClick={handleGitHubAuth}
            disabled={loading}
            className="h-12 w-full justify-center gap-3 bg-white/5"
          >
            <FaGithub size={20} />
            Continue with GitHub
          </Button>


          <p className="text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-indigo-400"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </section>
  );
}