"use client";

import { useState, useCallback } from "react";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Implement login API call
      console.log("Login:", email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Implement signup API call
        console.log("Signup:", name, email, password);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Signup failed");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    // TODO: Implement logout
  }, []);

  return { login, signup, logout, isLoading, error };
}
