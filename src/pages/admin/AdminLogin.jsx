import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdWarning,
} from "react-icons/md";
import { Helmet } from "react-helmet-async";
import { useRoleAuth, getAuthError } from "../../context/RoleAuthContext";
import { DEMO_MODE } from "../../services/firebase";

export default function AdminLogin() {
  const { login, currentUser, canAccessAdmin } = useRoleAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Already logged in → redirect
  if (currentUser && canAccessAdmin()) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("البريد الإلكتروني مطلوب");
      return;
    }
    if (!password.trim()) {
      setError("كلمة المرور مطلوبة");
      return;
    }

    setBusy(true);
    try {
      await login(email.trim(), password);
      // تأكد إن المستخدم عنده صلاحية admin فعلاً
      if (!canAccessAdmin()) {
        setError("ليس لديك صلاحية الدخول للوحة الإدارة");
        return;
      }
      navigate("/admin");
    } catch (err) {
      setError(getAuthError(err.code || err.message))
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>تسجيل الدخول — إدارة الحبايب</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm relative z-10"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gold-500 flex items-center justify-center text-black font-bold text-3xl mx-auto mb-4 shadow-lg shadow-gold-500/30">
              ح
            </div>
            <h1 className="text-2xl font-bold text-white">مطعم الحبايب</h1>
            <p className="text-zinc-500 text-sm mt-1">لوحة إدارة المطعم</p>
          </div>

          {/* Demo Mode Notice */}
          {DEMO_MODE && (
            <div className="mb-5 bg-gold-500/10 border border-gold-500/30 rounded-xl p-4 flex items-start gap-3">
              <MdWarning className="text-gold-400 text-xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gold-300 text-xs font-bold mb-1">
                  وضع التجربة (Demo Mode)
                </p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  البريد:{" "}
                  <span className="text-gold-400 font-mono">
                    admin@alhabayeb.com
                  </span>
                  <br />
                  كلمة المرور:{" "}
                  <span className="text-gold-400 font-mono">admin123456</span>
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
            <h2 className="font-bold text-white text-lg mb-6">تسجيل الدخول</h2>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <MdEmail className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@alhabayeb.com"
                    autoComplete="email"
                    dir="ltr"
                    className="w-full pr-10 pl-4 py-3 rounded-xl bg-zinc-800 border-2 border-zinc-700 focus:border-gold-500 text-white placeholder-zinc-600 outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-zinc-400 text-xs mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <MdLock className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg" />
                  <input
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    dir="ltr"
                    className="w-full pr-10 pl-10 py-3 rounded-xl bg-zinc-800 border-2 border-zinc-700 focus:border-gold-500 text-white placeholder-zinc-600 outline-none transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPwd ? (
                      <MdVisibilityOff className="text-lg" />
                    ) : (
                      <MdVisibility className="text-lg" />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={busy}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition-all mt-2"
              >
                {busy ? (
                  <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  "دخول"
                )}
              </motion.button>
            </form>
          </div>

          <p className="text-center text-zinc-700 text-xs mt-6">
            © {new Date().getFullYear()} مطعم الحبايب — لوحة الإدارة
          </p>
        </motion.div>
      </div>
    </>
  );
}
