"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import InteractiveBackground from "./InteractiveBackground";

export default function Login() {
  const { signIn } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await signIn();
    } catch (err: any) {
      console.error(err);
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col text-white relative overflow-hidden" style={{ backgroundColor: "#080808" }}>
      {/* Background SVG Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80rem] h-[80rem] max-w-none pointer-events-none z-[0] flex items-center justify-center select-none">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="50%"
            y="50%"
            dominantBaseline="central"
            textAnchor="middle"
            fill="#060606"
            fontSize="80"
            fontWeight="bold"
            fontFamily="serif"
          >
            S
          </text>
        </svg>
      </div>

      {/* Interactive Background */}
      <InteractiveBackground />

      {/* Centered Card Wrapper - This is the key to centering */}
      <div className="flex flex-1 items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-sm space-y-8 rounded-xl border border-white/10 bg-zinc-950 p-10 text-center shadow-2xl">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">Sanctuary Agents</h1>
            <p className="text-sm text-zinc-500">Authorized Personnel Only</p>
          </div>

          <div className="space-y-4">
            {/* Microsoft Login Button */}
            <Button
              onClick={handleLogin}
              className="w-full bg-[#2F2F2F] text-white hover:bg-[#3F3F3F] font-semibold transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              {/* Simple Microsoft Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23"><path fill="#f35325" d="M1 1h10v10H1z" /><path fill="#81bc06" d="M12 1h10v10H12z" /><path fill="#05a6f0" d="M1 12h10v10H1z" /><path fill="#ffba08" d="M12 12h10v10H12z" /></svg>
              {loading ? "Connecting..." : "Sign in with Microsoft"}
            </Button>

            {error && <p className="text-xs text-red-500 font-mono text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
