import { motion } from "framer-motion";
import { MdExpandMore } from "react-icons/md";

export default function ShowMoreButton({ hasMore, onLoadMore, total, shown }) {
  if (!hasMore) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center gap-2 pt-4"
    >
      <p className="text-xs dark:text-zinc-500 text-gray-400">
        يُعرض {shown} من {total}
      </p>
      <button
        onClick={onLoadMore}
        className="flex items-center gap-2 dark:bg-zinc-800 bg-gray-100 hover:bg-gold-500/10 dark:hover:bg-gold-500/10 border dark:border-zinc-700 border-gray-200 hover:border-gold-500/30 dark:text-zinc-300 text-gray-600 hover:text-gold-500 font-medium px-6 py-2.5 rounded-xl transition-all text-sm"
      >
        <MdExpandMore className="text-xl" />
        عرض المزيد
      </button>
    </motion.div>
  );
}
