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

export default function SignupCard() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

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

  const handleSignup = async () => {
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill all fields.");
      return;
    }

    if (fullName.trim().length < 3) {
      setError("Full name must be at least 3 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.post<AuthResponse>(
        "/auth/register",
        {
          full_name: fullName,
          email,
          password,
        }
      );

      saveToken(response.access_token);

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message || "Registration failed."
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

    const redirectUri = encodeURIComponent(`${window.location.origin}/signup`);
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token%20id_token&scope=openid%20email%20profile&nonce=studysphere_${Date.now()}`;
    window.location.href = googleAuthUrl;

  };


  const handleGitHubAuth = () => {
    setLoading(true);
    setError("");

    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

    if (clientId && typeof window !== "undefined") {
      const redirectUri = encodeURIComponent(`${window.location.origin}/signup`);
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
      window.location.href = githubAuthUrl;
    } else {
      window.location.href = "https://github.com/login";
    }
  };




  return (
    <section className="flex w-full items-center justify-center lg:w-[460px]">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="
          w-full
          rounded-[32px]
          border
          border-white/60
          bg-white/70
          p-10
          shadow-2xl
          backdrop-blur-2xl
        "
      >
        <h2 className="text-4xl font-bold text-slate-900">
          Create Account
        </h2>

        <p className="mt-2 text-slate-600">
          Start your AI-powered learning journey.
        </p>

        <div className="mt-8 space-y-5">

          <Input
            type="text"
            placeholder="Full Name"
            className="h-12 rounded-xl border-slate-200 bg-white"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
          />

          <Input
            type="email"
            placeholder="Email Address"
            className="h-12 rounded-xl border-slate-200 bg-white"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          />

          <Input
            type="password"
            placeholder="Password"
            className="h-12 rounded-xl border-slate-200 bg-white"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <Input
            type="password"
            placeholder="Confirm Password"
            className="h-12 rounded-xl border-slate-200 bg-white"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
          />

          <label className="flex items-start gap-3 text-sm text-slate-600">
            <input
              type="checkbox"
              className="mt-1 rounded border-slate-300"
            />

            <span>
              I agree to the{" "}
              <Link
                href="#"
                className="font-medium text-indigo-600 hover:underline"
              >
                Terms
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="font-medium text-indigo-600 hover:underline"
              >
                Privacy Policy
              </Link>
            </span>
          </label>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <Button
            onClick={handleSignup}
            disabled={loading}
            className="
              h-12
              w-full
              rounded-xl
              bg-indigo-600
              text-white
              shadow-lg
              hover:bg-indigo-700
            "
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-sm text-slate-500">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="h-12 w-full justify-center gap-3 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
          >
            <FcGoogle size={22} />
            Continue with Google
          </Button>


          <Button
            variant="outline"
            onClick={handleGitHubAuth}
            disabled={loading}
            className="h-12 w-full justify-center gap-3 rounded-xl border-slate-200 bg-white hover:bg-slate-50"
          >
            <FaGithub size={20} />
            Continue with GitHub
          </Button>


          <p className="pt-3 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:underline"
            >
              Sign In
            </Link>
          </p>

        </div>
      </motion.div>
    </section>
  );
}