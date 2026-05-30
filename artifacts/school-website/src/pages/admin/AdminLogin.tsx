import { useState } from "react";
import { GraduationCap, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { useGetSchoolProfile } from "@workspace/api-client-react";

interface Props {
  onLogin: (password: string) => Promise<{ ok: boolean; error?: string }>;
}

export default function AdminLogin({ onLogin }: Props) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { data: profile } = useGetSchoolProfile();

  const name = profile?.name ?? "SMA Nusantara";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await onLogin(password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Password salah.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 items-center justify-center mb-4">
            {profile?.logoUrl ? (
              <img src={profile.logoUrl} alt={name} className="w-10 h-10 object-contain rounded-lg" />
            ) : (
              <GraduationCap className="w-8 h-8 text-primary" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white">{name}</h1>
          <p className="text-slate-400 text-sm mt-1">Panel Admin</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Masuk ke Panel Admin</span>
          </div>

          <form onSubmit={handleSubmit} data-testid="form-admin-login" className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  data-testid="input-admin-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password admin"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition"
                />
                <button
                  type="button"
                  data-testid="button-toggle-password"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                data-testid="admin-login-error"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              data-testid="button-admin-login-submit"
              disabled={loading || !password}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? "Memeriksa..." : "Masuk"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          &larr;{" "}
          <a href="/" className="hover:text-slate-400 transition-colors">
            Kembali ke website
          </a>
        </p>
      </motion.div>
    </div>
  );
}
