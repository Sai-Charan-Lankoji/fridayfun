import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface LuckyPeopleProps {
  luckyPeople: string[];
}

export const LuckyPeople = ({ luckyPeople }: LuckyPeopleProps) => {
  if (!luckyPeople.length) return null;

  return (
    <div className="mt-8 animate-fadeIn">
      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-orange-700 dark:text-orange-300 mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6" />
        Lucky People (Next Round)
      </h3>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } } }}
      >
        {luckyPeople.map((person, index) => (
          <motion.div
            key={index}
            variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
            className="p-4 bg-gradient-to-r from-orange-200 to-amber-100 dark:from-orange-800/50 dark:to-amber-700/30 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <div className="text-sm sm:text-base text-orange-600 dark:text-orange-300 font-medium">{person}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};