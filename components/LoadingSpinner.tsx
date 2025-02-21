import { motion } from "framer-motion";

export const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full"
  />
);