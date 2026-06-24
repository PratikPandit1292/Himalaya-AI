import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Lock, Mail, Sparkles } from "lucide-react";
import {
  authAPI,
  storeAuth,
  clearAuth,
  getStoredUser,
  getStoredToken,
  type AuthUser,
} from "@/services/authAPI";

interface Props {
  onAuthChange?: (user: AuthUser | null, token: string | null) => void;
}

export default function AuthModal({ onAuthChange }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredUser());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;
      if (mode === "register") {
        result = await authAPI.register(name, email, password);
      } else {
        result = await authAPI.login(email, password);
      }

      storeAuth(result.token, result.user);
      setCurrentUser(result.user);
      onAuthChange?.(result.user, result.token);
      setOpen(false);
      setEmail("");
      setPassword("");
      setName("");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setCurrentUser(null);
    onAuthChange?.(null, null);
  };

  return (
    <>
      {/* Trigger Button */}
      {currentUser ? (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {currentUser.name[0].toUpperCase()}
            </div>
            <span className="text-white text-sm font-medium">{currentUser.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <User size={14} />
          Sign In
        </button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="fixed inset-0 flex items-center justify-center z-[101] px-4"
            >
              <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 p-8 pb-6 border-b border-white/10">
                  <button
                    onClick={() => setOpen(false)}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                      <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-xl">
                        {mode === "login" ? "Welcome Back" : "Create Account"}
                      </h2>
                      <p className="text-white/50 text-sm">
                        {mode === "login"
                          ? "Sign in to save your itineraries"
                          : "Join to save & share your journeys"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                  {mode === "register" && (
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-3.5 text-white/40" />
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 transition-colors"
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-3.5 text-white/40" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3.5 text-white/40" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/15 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {loading
                      ? "Please wait..."
                      : mode === "login"
                      ? "Sign In"
                      : "Create Account"}
                  </button>

                  <p className="text-center text-white/40 text-sm">
                    {mode === "login" ? "New here?" : "Already have an account?"}{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === "login" ? "register" : "login");
                        setError("");
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                    >
                      {mode === "login" ? "Create account" : "Sign in"}
                    </button>
                  </p>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
