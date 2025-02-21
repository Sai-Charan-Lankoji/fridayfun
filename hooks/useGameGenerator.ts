import { useCallback } from "react";
import { toast } from "sonner";
import { shuffleArray } from "../lib/utils";
import { speakers, chessPlayers, carromPlayers, badmintonPlayers } from "../app/players";

type GameMatch = { team1: string[]; team2: string[] };
type GameMode = "1v1" | "2v2";
type GameState = { matches: GameMatch[]; luckyPeople: string[]; usedPlayers: Set<string>; isGenerating: boolean; gameMode: GameMode };

const excludedSpeakers = [""];
const eligibleSpeakers = speakers.filter((speaker) => !excludedSpeakers.includes(speaker));

export const useGameGenerator = (
  game: string,
  gameStates: Record<string, GameState>,
  setGameState: (game: string, newState: Partial<GameState>) => void,
  pairSize: number | null,
  setPairs: (pairs: string[][]) => void,
  setGeneralLuckyPeople: (people: string[]) => void,
  setGeneralUsedPlayers: (used: Set<string>) => void,
  setIsGeneralGenerating: (isGenerating: boolean) => void
) => {
  const getPlayersForGame = useCallback((game: string): string[] => {
    switch (game) {
      case "chess":
        return shuffleArray([...chessPlayers]);
      case "carrom":
      case "badminton":
        return shuffleArray(game === "carrom" ? [...carromPlayers] : [...badmintonPlayers]);
      default:
        return shuffleArray([...eligibleSpeakers]);
    }
  }, []);

  const generateGameMatches = useCallback((game: string, availablePlayers: string[]) => {
    const matches: GameMatch[] = [];
    const used = new Set<string>();
    const players = [...availablePlayers];
    const gameMode = gameStates[game].gameMode;
    const playersPerMatch = gameMode === "2v2" ? 4 : 2;

    while (players.length >= playersPerMatch) {
      if (gameMode === "2v2") {
        const team1 = [players.shift(), players.shift()].filter(Boolean) as string[];
        const team2 = [players.shift(), players.shift()].filter(Boolean) as string[];
        if (team1.length === 2 && team2.length === 2) {
          matches.push({ team1, team2 });
          team1.forEach((p) => used.add(p));
          team2.forEach((p) => used.add(p));
        } else {
          [...team1, ...team2].forEach((p) => players.push(p));
          break;
        }
      } else {
        const player1 = players.shift();
        const player2 = players.shift();
        if (player1 && player2) {
          matches.push({ team1: [player1], team2: [player2] });
          used.add(player1);
          used.add(player2);
        }
      }
    }
    return { matches, luckyPeople: players, usedPlayers: used };
  }, [gameStates]);

  const generatePairs = useCallback(() => {
    if (!pairSize && game === "general") {
      toast.error("Please set a valid group size!");
      return;
    }

    if (game === "general") setIsGeneralGenerating(true);
    else setGameState(game, { isGenerating: true });

    setTimeout(() => {
      const availablePlayers = getPlayersForGame(game);
      if (availablePlayers.length === 0) {
        toast.error("No players available for this game!");
        return;
      }

      let newPairs: string[][] = [];
      let luckyPeople: string[] = [];
      let usedPlayers = new Set<string>();

      if (game === "general") {
        const remaining: string[] = [];
        const used = new Set<string>();
        const size = pairSize || 2;

        for (let i = 0; i < availablePlayers.length; i++) {
          if (!used.has(availablePlayers[i])) {
            const currentGroup: string[] = [availablePlayers[i]];
            used.add(availablePlayers[i]);
            let filled = 1;
            for (let j = i + 1; j < availablePlayers.length && filled < size; j++) {
              if (!used.has(availablePlayers[j])) {
                currentGroup.push(availablePlayers[j]);
                used.add(availablePlayers[j]);
                filled++;
              }
            }
            if (currentGroup.length === size) newPairs.push(currentGroup);
            else remaining.push(...currentGroup);
          }
        }

        newPairs = newPairs; // Assign to outer scope
        luckyPeople = remaining;
        usedPlayers = used;

        setPairs(newPairs);
        setGeneralLuckyPeople(remaining);
        setGeneralUsedPlayers(used);
        setIsGeneralGenerating(false);
      } else {
        const result = generateGameMatches(game, availablePlayers);
        newPairs = result.matches.map((m) => [...m.team1, ...m.team2]); // For PDF purposes
        luckyPeople = result.luckyPeople;
        usedPlayers = result.usedPlayers;

        setGameState(game, {
          matches: result.matches,
          luckyPeople: result.luckyPeople,
          usedPlayers: result.usedPlayers,
          isGenerating: false,
        });
      }

      const luckyCount = game === "general" ? luckyPeople.length : gameStates[game].luckyPeople.length;
      toast.success(`🎮 ${game.charAt(0).toUpperCase() + game.slice(1)} matches generated!`, {
        description: luckyCount ? "Some players get a break this round! 🌟" : "Perfect matching achieved! ✨",
        style: { background: "linear-gradient(to right, #ff8a00, #ff5f00)", color: "white" },
      });

      return { newPairs, luckyPeople }; // Return for PDF generation
    }, 1000);
  }, [
    game,
    pairSize,
    gameStates,
    setGameState,
    setPairs,
    setGeneralLuckyPeople,
    setGeneralUsedPlayers,
    setIsGeneralGenerating,
    getPlayersForGame,
    generateGameMatches,
  ]);

  return { generatePairs };
};