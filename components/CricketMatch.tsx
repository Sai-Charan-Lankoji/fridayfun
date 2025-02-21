"use client"

import { motion } from "framer-motion"
import { Trophy, Shield, Star, Users } from "lucide-react"

interface CricketMatchProps {
  match: { team1: string[]; team2: string[] }
  reserves: string[]
}

export const CricketMatch = ({ match, reserves }: CricketMatchProps) => {
  const midPoint = Math.ceil(reserves.length / 2)
  const reservesTeam1 = reserves.slice(0, midPoint)
  const reservesTeam2 = reserves.slice(midPoint)

  // Enhanced animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const teamVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  }

  const playerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(255, 255, 255, 0.15)",
      transition: { duration: 0.2 },
    },
  }

  return (
    <div className="mt-8 w-full max-w-6xl mx-auto px-4">
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Team 1 */}
        <motion.div
          variants={teamVariants}
          className="relative p-6 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/50 dark:to-amber-900/30 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800"
        >
          <div className="absolute top-3 right-3">
            <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-orange-800 dark:text-orange-200 flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            Team 1 XI
          </h3>
          <div className="space-y-2.5">
            {match.team1.map((player, index) => (
              <motion.div
                key={index}
                variants={playerVariants}
                whileHover="hover"
                className="text-sm sm:text-base text-orange-600 dark:text-orange-300 bg-white/50 dark:bg-black/20 p-3 rounded-lg backdrop-blur-sm flex items-center gap-3 transition-colors"
              >
                <span className="flex items-center justify-center w-6 h-6 bg-orange-500/20 rounded-full text-orange-700 dark:text-orange-300 font-semibold text-sm">
                  {index + 1}
                </span>
                {player}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team 2 */}
        <motion.div
          variants={teamVariants}
          className="relative p-6 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/50 dark:to-amber-900/30 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800"
        >
          <div className="absolute top-3 right-3">
            <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-orange-800 dark:text-orange-200 flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            Team 2 XI
          </h3>
          <div className="space-y-2.5">
            {match.team2.map((player, index) => (
              <motion.div
                key={index}
                variants={playerVariants}
                whileHover="hover"
                className="text-sm sm:text-base text-orange-600 dark:text-orange-300 bg-white/50 dark:bg-black/20 p-3 rounded-lg backdrop-blur-sm flex items-center gap-3 transition-colors"
              >
                <span className="flex items-center justify-center w-6 h-6 bg-orange-500/20 rounded-full text-orange-700 dark:text-orange-300 font-semibold text-sm">
                  {index + 1}
                </span>
                {player}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Reserves */}
      {reserves.length > 0 && (
        <motion.div
          className="mt-8 p-6 bg-gradient-to-r from-orange-200 to-amber-100 dark:from-orange-800/50 dark:to-amber-700/30 rounded-xl shadow-lg border border-orange-200 dark:border-orange-800"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h3 className="text-xl sm:text-2xl font-bold text-orange-800 dark:text-orange-200 mb-6 flex items-center gap-3">
            <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            Reserved Players
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h4 className="text-base font-semibold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                Team 1 Reserves
              </h4>
              <div className="space-y-2">
                {reservesTeam1.map((player, index) => (
                  <motion.div
                    key={index}
                    variants={playerVariants}
                    whileHover="hover"
                    className="text-sm sm:text-base text-orange-600 dark:text-orange-300 p-3 bg-white/50 dark:bg-black/20 rounded-lg backdrop-blur-sm"
                  >
                    {player}
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-base font-semibold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                Team 2 Reserves
              </h4>
              <div className="space-y-2">
                {reservesTeam2.map((player, index) => (
                  <motion.div
                    key={index}
                    variants={playerVariants}
                    whileHover="hover"
                    className="text-sm sm:text-base text-orange-600 dark:text-orange-300 p-3 bg-white/50 dark:bg-black/20 rounded-lg backdrop-blur-sm"
                  >
                    {player}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}