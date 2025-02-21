import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SlotMachineProps {
  isSpinning: boolean;
  finalName: string;
  allSpeakers: string[]; // Full list for spinning animation
}

export const SlotMachine = ({ isSpinning, finalName, allSpeakers }: SlotMachineProps) => {
  const [displayedName, setDisplayedName] = useState<string>("");

  useEffect(() => {
    if (isSpinning) {
      const interval = setInterval(() => {
        const randomName = allSpeakers[Math.floor(Math.random() * allSpeakers.length)];
        setDisplayedName(randomName);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setDisplayedName(finalName);
    }
  }, [isSpinning, finalName, allSpeakers]);

  return (
    <div className="relative h-20 w-full max-w-md mx-auto overflow-hidden rounded-lg bg-orange-100/20 dark:bg-orange-900/20 border border-orange-300 dark:border-orange-700">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={isSpinning ? { y: [0, -20, 0] } : { y: 0 }}
        transition={isSpinning ? { repeat: Infinity, duration: 0.3, ease: "linear" } : { duration: 0.5 }}
      >
        <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-orange-600 dark:text-orange-300 text-center px-4">
          {displayedName || "Spin to pick a speaker!"}
        </div>
      </motion.div>
    </div>
  );
};