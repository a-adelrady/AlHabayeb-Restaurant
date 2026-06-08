import { motion, AnimatePresence } from "framer-motion";
import { MdDownload, MdClose } from "react-icons/md";
import { useState, useEffect } from "react";
import { useInstallPrompt } from "../../hooks/useInstallPrompt";

export default function InstallBanner() {
  const { canInstall, showPrompt } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // مستنى 3 ثواني بعد فتح الصفحة عشان مش يزعج فوراً
    if (!canInstall || dismissed) return;
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, [canInstall, dismissed]);

  const handleInstall = async () => {
    await showPrompt();
    setShow(false);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    // متظهرش تاني لمدة يوم
    localStorage.setItem("install_dismissed", Date.now().toString());
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="bg-zinc-900 border border-gold-500/30 rounded-2xl p-4 shadow-2xl shadow-black/50 flex items-center gap-4">
            {/* Logo */}
            <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center text-black font-bold text-xl flex-shrink-0">
              ح
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">ثبّت تطبيق الحبايب</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                تجربة أسرع وأسهل على موبايلك
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-black font-bold px-3 py-2 rounded-xl text-xs transition-all"
              >
                <MdDownload className="text-base" />
                ثبّت
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                aria-label="إغلاق"
              >
                <MdClose className="text-lg" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
