import { motion, AnimatePresence } from "framer-motion";
import { MdDownload, MdClose, MdIosShare } from "react-icons/md";
import { useState, useEffect } from "react";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

const DISMISS_KEY = "hab_install_dismissed";
const DISMISS_DAYS = 3; // مش يظهر تاني لمدة 3 أيام بعد الرفض

function wasDismissedRecently() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    const diff = Date.now() - parseInt(ts);
    return diff < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function InstallBanner() {
  const { canInstall, isIOS, showPrompt } = useInstallPrompt();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if ((!canInstall && !isIOS) || wasDismissedRecently()) return;
    // ظهر بعد 4 ثواني عشان مش يزعج فوراً
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, [canInstall, isIOS]);

  const handleInstall = async () => {
    if (isIOS) return; // iOS بس بيعرض التعليمات مش بيعمل install تلقائي
    const accepted = await showPrompt();
    if (accepted) setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch {
      // Ignore localStorage errors
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 280 }}
          className="fixed bottom-20 md:bottom-6 left-3 right-3 z-50 max-w-sm mx-auto"
        >
          <div className="bg-zinc-900 border border-gold-500/40 rounded-2xl p-4 shadow-2xl shadow-black/60">
            {/* iOS Instructions */}
            {isIOS && (
              <div className="mb-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-blue-300 text-xs text-center leading-relaxed">
                  اضغط على <MdIosShare className="inline text-base" /> ثم اختر
                  <strong className="text-white">
                    إضافة إلى الشاشة الرئيسية
                  </strong>
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center text-black font-bold text-xl flex-shrink-0">
                ح
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight">
                  ثبّت تطبيق الحبايب
                </p>
                <p className="text-zinc-400 text-xs mt-0.5">
                  {isIOS ? "اتبع التعليمات أعلاه" : "وصول أسرع وتجربة أفضل 🚀"}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {!isIOS && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleInstall}
                    className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-black font-bold px-3 py-2 rounded-xl text-xs transition-all whitespace-nowrap"
                  >
                    <MdDownload className="text-base" />
                    ثبّت
                  </motion.button>
                )}
                <button
                  onClick={handleDismiss}
                  aria-label="إغلاق"
                  className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors rounded-lg hover:bg-zinc-800"
                >
                  <MdClose className="text-lg" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
