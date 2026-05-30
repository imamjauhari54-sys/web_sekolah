import { useState, useEffect, useCallback } from "react";

type AuthState = "loading" | "authenticated" | "unauthenticated";

export function useAdminAuth() {
  const [state, setState] = useState<AuthState>("loading");

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/check", { credentials: "include" });
      setState(res.ok ? "authenticated" : "unauthenticated");
    } catch {
      setState("unauthenticated");
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  const login = async (password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setState("authenticated");
        return { ok: true };
      }
      const data = (await res.json()) as { error?: string };
      return { ok: false, error: data.error ?? "Password salah." };
    } catch {
      return { ok: false, error: "Tidak dapat terhubung ke server." };
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    setState("unauthenticated");
  };

  return { state, login, logout };
}
