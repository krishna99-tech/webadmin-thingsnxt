"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api";

type User = Record<string, unknown> & {
  username?: string;
  full_name?: string;
  access_right?: string;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      console.log("📡 Attempting login for:", username);
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const response = await authApi.login(params);
      const { access_token, user: userData } = response.data as {
        access_token: string;
        user: User;
      };

      localStorage.setItem("token", access_token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      console.log("✅ Login successful");
      return { success: true };
    } catch (error: any) {
      console.error("❌ Login error:", error);
      const detail = error.response?.data?.detail;
      const message = typeof detail === "string" ? detail : (error.message || "Authentication failed");
      return {
        success: false,
        message: message,
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#0F1117] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,217,255,0.05),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse shadow-[0_0_40px_-5px_hsl(var(--primary)/0.3)]">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
            {/* Pulsing Outer Rings */}
            <div className="absolute -inset-4 border border-primary/5 rounded-[2rem] animate-[ping_3s_infinite]" />
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-black italic text-white tracking-widest uppercase">
              Things<span className="text-primary not-italic">NXT</span>
            </h1>
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-4 bg-primary/40 rounded-full" />
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">
                Initializing_Terminal
              </p>
              <div className="h-[2px] w-4 bg-primary/40 rounded-full" />
            </div>
          </div>
        </div>

        {/* Console-style bottom text */}
        <div className="absolute bottom-12 left-0 w-full px-12 flex justify-between items-center bg-transparent border-none">
          <p className="font-mono text-[9px] text-default-400/50 uppercase tracking-widest">
            Module: <span className="text-primary/40">AUTH_ORCHESTRATOR_V4</span>
          </p>
          <p className="font-mono text-[9px] text-default-400/50 uppercase tracking-widest">
            Status: <span className="text-primary/40">FETCHING_REGISTRY_STATE</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
