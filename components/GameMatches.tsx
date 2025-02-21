import { motion } from "framer-motion";
import { GameIcon } from "./GameIcon";

interface GameMatch {
  team1: string[];
  team2: string[];
}

interface GameMatchesProps {
  game: string;
  matches: GameMatch[];
}

export const GameMatches = ({ game, matches }: GameMatchesProps) => {
  if (!matches.length) return null;

  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
        <GameIcon game={game} />
        {game.charAt(0).toUpperCase() + game.slice(1)} Matches
      </h3>
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {matches.map((match, index) => (
          <motion.div
            key={index}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="p-4 sm:p-6 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/50 dark:to-amber-900/30 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-orange-800 dark:text-orange-200">
                <span className="text-sm sm:text-base font-semibold">Match {index + 1}</span>
                <GameIcon game={game} />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 bg-white/50 dark:bg-black/20 p-3 rounded-md space-y-2">
                  {match.team1.map((player, pIndex) => (
                    <div key={pIndex} className="text-sm sm:text-base text-orange-600 dark:text-orange-300 p-1">
                      {player}
                    </div>
                  ))}
                </div>
                <div className="text-orange-600 dark:text-orange-400 font-bold px-2">VS</div>
                <div className="flex-1 bg-white/50 dark:bg-black/20 p-3 rounded-md space-y-2">
                  {match.team2.map((player, pIndex) => (
                    <div key={pIndex} className="text-sm sm:text-base text-orange-600 dark:text-orange-300 p-1">
                      {player}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};