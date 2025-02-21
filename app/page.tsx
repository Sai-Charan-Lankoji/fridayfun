"use client";

import { useState, useCallback } from "react";
import { Sparkles, Users, PartyPopper, RefreshCcw, UserPlus, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { speakers,chessPlayers, carromPlayers, badmintonPlayers } from "./players";
import { SlotMachine } from "../components/SlotMachine";
import { GameMatches } from "../components/GameMatches";
import { LuckyPeople } from "../components/LuckyPeople";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useGameGenerator } from "../hooks/useGameGenerator";

const excludedSpeakers = [""];
const initialEligibleSpeakers = speakers.filter((speaker) => !excludedSpeakers.includes(speaker));

type GameMatch = { team1: string[]; team2: string[] };
type GameMode = "1v1" | "2v2";
type GameState = { matches: GameMatch[]; luckyPeople: string[]; usedPlayers: Set<string>; isGenerating: boolean; gameMode: GameMode };

export default function Home() {
  
  const [selectedSpeaker, setSelectedSpeaker] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [pickedSpeakers, setPickedSpeakers] = useState<string[]>([]);
  const [eligibleSpeakers, setEligibleSpeakers] = useState<string[]>(initialEligibleSpeakers);
  const [pairSize, setPairSize] = useState<number | null>(2);
  const [pairs, setPairs] = useState<string[][]>([]);
  const [generalLuckyPeople, setGeneralLuckyPeople] = useState<string[]>([]);
  const [generalUsedPlayers, setGeneralUsedPlayers] = useState<Set<string>>(new Set());
  const [selectedGame, setSelectedGame] = useState("general");
  const [isGeneralGenerating, setIsGeneralGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("speaker");

  const [gameStates, setGameStates] = useState<Record<string, GameState>>({
    chess: { matches: [], luckyPeople: [], usedPlayers: new Set(), isGenerating: false, gameMode: "1v1" },
    carrom: { matches: [], luckyPeople: [], usedPlayers: new Set(), isGenerating: false, gameMode: "2v2" },
    badminton: { matches: [], luckyPeople: [], usedPlayers: new Set(), isGenerating: false, gameMode: "2v2" },
  });

  const setGameState = useCallback((game: string, newState: Partial<GameState>) => {
    setGameStates((prev) => ({ ...prev, [game]: { ...prev[game], ...newState } }));
  }, []);

  const { generatePairs } = useGameGenerator(
    selectedGame,
    gameStates,
    setGameState,
    pairSize,
    setPairs,
    setGeneralLuckyPeople,
    setGeneralUsedPlayers,
    setIsGeneralGenerating
  );

  const pickRandomSpeaker = useCallback(() => {
    if (eligibleSpeakers.length === 0) {
      toast.error("No more eligible speakers available!");
      return;
    }
    setIsSpinning(true);
    setSelectedSpeaker("");
    setTimeout(() => {
      const winnerIndex = Math.floor(Math.random() * eligibleSpeakers.length);
      const winner = eligibleSpeakers[winnerIndex];
      setSelectedSpeaker(winner);
      setPickedSpeakers((prev) => [...prev, winner]);
      setEligibleSpeakers((prev) => prev.filter((_, i) => i !== winnerIndex));
      setIsSpinning(false);
      toast.success("🎯 Speaker selected!", {
        description: `${winner} is ready to shine! ✨`,
        style: { background: "linear-gradient(to right, #ff8a00, #ff5f00)", color: "white" },
      });
    }, 2000);
  }, [eligibleSpeakers]);

  const removePickedSpeaker = useCallback((speaker: string) => {
    setPickedSpeakers((prev) => prev.filter((s) => s !== speaker));
    setEligibleSpeakers((prev) => [...prev, speaker]);
    toast.success(`${speaker} is back in the pool!`);
  }, []);

  const resetAll = useCallback(() => {
    setPairs([]);
    setGeneralLuckyPeople([]);
    setGeneralUsedPlayers(new Set());
    setGameStates({
      chess: { matches: [], luckyPeople: [], usedPlayers: new Set(), isGenerating: false, gameMode: "1v1" },
      carrom: { matches: [], luckyPeople: [], usedPlayers: new Set(), isGenerating: false, gameMode: "2v2" },
      badminton: { matches: [], luckyPeople: [], usedPlayers: new Set(), isGenerating: false, gameMode: "2v2" },
    });
    toast.success("All matches reset!");
  }, []);

  const downloadAsPDF = useCallback(() => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${selectedGame.charAt(0).toUpperCase() + selectedGame.slice(1)} Matches`, 10, 10);

    let y = 20;
    if (selectedGame === "general") {
      pairs.forEach((pair, index) => {
        doc.text(`Group ${index + 1}:`, 10, y);
        y += 10;
        pair.forEach((person) => {
          doc.text(`- ${person}`, 20, y);
          y += 10;
        });
      });
      if (generalLuckyPeople.length) {
        y += 10;
        doc.text("Lucky People (Next Round):", 10, y);
        y += 10;
        generalLuckyPeople.forEach((person) => {
          doc.text(`- ${person}`, 20, y);
          y += 10;
        });
      }
    } else {
      gameStates[selectedGame].matches.forEach((match, index) => {
        doc.text(`Match ${index + 1}:`, 10, y);
        y += 10;
        doc.text(`Team 1: ${match.team1.join(", ")}`, 20, y);
        y += 10;
        doc.text(`Team 2: ${match.team2.join(", ")}`, 20, y);
        y += 10;
      });
      if (gameStates[selectedGame].luckyPeople.length) {
        y += 10;
        doc.text("Lucky People (Next Round):", 10, y);
        y += 10;
        gameStates[selectedGame].luckyPeople.forEach((person) => {
          doc.text(`- ${person}`, 20, y);
          y += 10;
        });
      }
    }

    doc.save(`${selectedGame}-matches.pdf`);
  }, [selectedGame, pairs, generalLuckyPeople, gameStates]);

  const getParticipantCount = () => {
    if (activeTab === "speaker") return speakers.length;
    switch (selectedGame) {
      case "chess":
        return chessPlayers.length;
      case "carrom":
        return carromPlayers.length;
      case "badminton":
        return badmintonPlayers.length;
      case "general":
      default:
        return speakers.length;
    }
  };

  const isCurrentGameGenerating = selectedGame === "general" ? isGeneralGenerating : gameStates[selectedGame].isGenerating;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-4 flex items-center justify-center gap-2">
            <PartyPopper className="h-8 w-8 animate-bounce" />
            Team Activities Manager
            <PartyPopper className="h-8 w-8 animate-bounce" />
          </h1>
        </div>

        <Tabs defaultValue="speaker" onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full max-w-md mx-auto bg-orange-100 dark:bg-orange-900/30 p-1 rounded-xl overflow-x-auto flex-nowrap">
            <TabsTrigger value="speaker" className="w-1/2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <Users className="w-5 h-5 mr-2" />
              Friday Speaker
            </TabsTrigger>
            <TabsTrigger value="pairs" className="w-1/2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              <UserPlus className="w-5 h-5 mr-2" />
              Game Matches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speaker">
            <Card className="p-4 sm:p-6 lg:p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-orange-800 dark:text-orange-200">
                  Today's Lucky Speaker
                </h2>
              </div>
              <SlotMachine isSpinning={isSpinning} finalName={selectedSpeaker} allSpeakers={speakers} />
              {pickedSpeakers.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-orange-700 dark:text-orange-300 mb-2">
                    Previously Picked Speakers:
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {pickedSpeakers.map((speaker) => (
                      <div
                        key={speaker}
                        className="flex items-center justify-between p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"
                      >
                        <span className="text-sm sm:text-base text-orange-600 dark:text-orange-300">{speaker}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePickedSpeaker(speaker)}
                          className="text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                          aria-label={`Remove ${speaker} from picked list`}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
            <div className="mt-8 text-center">
              <Button
                size="lg"
                onClick={pickRandomSpeaker}
                disabled={isSpinning || eligibleSpeakers.length === 0}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-6 px-8 sm:px-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base disabled:opacity-70"
                aria-label="Pick today's speaker"
              >
                {isSpinning ? <LoadingSpinner /> : <><RefreshCcw className="mr-3 h-5 w-5" /> Pick Today's Speaker!</>}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pairs">
            <Card className="p-4 sm:p-6 lg:p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-6">
                <UserPlus className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-orange-800 dark:text-orange-200">
                  Game Matches Generator
                </h2>
              </div>

              <Tabs value={selectedGame} onValueChange={setSelectedGame} className="w-full">
                <TabsList className="w-full bg-orange-100/50 dark:bg-orange-900/20 p-1 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <TabsTrigger value="general" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    <UserPlus className="w-4 h-4 mr-2" /> General
                  </TabsTrigger>
                  <TabsTrigger value="chess" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Chess
                  </TabsTrigger>
                  <TabsTrigger value="carrom" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Carrom
                  </TabsTrigger>
                  <TabsTrigger value="badminton" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    <RefreshCcw className="w-4 h-4 mr-2" /> Badminton
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 w-full sm:w-auto">
                      <label className="block text-sm sm:text-base font-medium text-orange-700 dark:text-orange-300 mb-2">
                        People per group:
                      </label>
                      <Input
                        type="number"
                        min="2"
                        value={pairSize === null ? "" : pairSize}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") setPairSize(null);
                          else {
                            const num = Number.parseInt(value);
                            if (!isNaN(num) && num >= 2) setPairSize(num);
                          }
                        }}
                        onBlur={() => { if (pairSize === null || pairSize < 2) setPairSize(2); }}
                        className="border-orange-200 dark:border-orange-800 text-sm sm:text-base"
                      />
                    </div>
                    <Button
                      onClick={() => generatePairs()}
                      disabled={isGeneralGenerating}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 h-[42px] text-sm sm:text-base"
                      aria-label="Generate general groups"
                    >
                      <RefreshCcw className={`mr-2 h-5 w-5 ${isGeneralGenerating ? "animate-spin" : ""}`} />
                      Generate Groups
                    </Button>
                  </div>
                  {pairs.length > 0 && (
                    <div className="mt-6 space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-orange-700 dark:text-orange-300">Generated Groups:</h3>
                        <Button
                          onClick={downloadAsPDF}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-sm sm:text-base"
                          aria-label="Download groups as PDF"
                        >
                          <Download className="mr-2 h-5 w-5" /> Download PDF
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {pairs.map((pair, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/50 dark:to-amber-900/30 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                          >
                            <div className="font-medium text-orange-800 dark:text-orange-200 flex items-center gap-2 mb-3">
                              <UserPlus className="w-5 h-5" /> Group {index + 1}
                            </div>
                            <div className="space-y-2">
                              {pair.map((person, pIndex) => (
                                <div key={pIndex} className="text-sm sm:text-base text-orange-600 dark:text-orange-300 bg-white/50 dark:bg-black/20 p-2 rounded-md">
                                  {person}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {["chess", "carrom", "badminton"].map((game) => (
  <TabsContent key={game} value={game} className="mt-6">
    <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
      <div className="flex items-center gap-4">
        <span className="text-sm sm:text-base font-medium text-orange-700 dark:text-orange-300">Game Mode:</span>
        {game === "chess" ? (
          <span className="text-sm sm:text-base text-orange-600 dark:text-orange-300">1v1</span>
        ) : (
          <div className="flex rounded-lg overflow-hidden border border-orange-200 dark:border-orange-800">
            <Button
              variant={gameStates[game].gameMode === "1v1" ? "default" : "ghost"}
              size="sm"
              onClick={() => setGameState(game, { gameMode: "1v1", matches: [], luckyPeople: [], usedPlayers: new Set() })}
              className={`rounded-none ${gameStates[game].gameMode === "1v1" ? "bg-orange-500 text-white hover:bg-orange-600" : "hover:bg-orange-100 dark:hover:bg-orange-900/30"}`}
            >
              1v1
            </Button>
            <Button
              variant={gameStates[game].gameMode === "2v2" ? "default" : "ghost"}
              size="sm"
              onClick={() => setGameState(game, { gameMode: "2v2", matches: [], luckyPeople: [], usedPlayers: new Set() })}
              className={`rounded-none ${gameStates[game].gameMode === "2v2" ? "bg-orange-500 text-white hover:bg-orange-600" : "hover:bg-orange-100 dark:hover:bg-orange-900/30"}`}
            >
              2v2
            </Button>
          </div>
        )}
      </div>
      <Button
        onClick={() => generatePairs()}
        disabled={gameStates[game].isGenerating}
        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-sm sm:text-base"
        aria-label={`Generate ${game} matches`}
      >
        <RefreshCcw className={`mr-2 h-5 w-5 ${gameStates[game].isGenerating ? "animate-spin" : ""}`} />
        Generate {game.charAt(0).toUpperCase() + game.slice(1)} Matches
      </Button>
    </div>
    {gameStates[game].matches.length > 0 && (
      <div className="mt-6 flex justify-end">
        <Button
          onClick={downloadAsPDF}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-sm sm:text-base"
          aria-label={`Download ${game} matches as PDF`}
        >
          <Download className="mr-2 h-5 w-5" /> Download PDF
        </Button>
      </div>
    )}
  </TabsContent>
))}
              </Tabs>

              <GameMatches game={selectedGame} matches={gameStates[selectedGame]?.matches || []} />
              <LuckyPeople luckyPeople={selectedGame === "general" ? generalLuckyPeople : gameStates[selectedGame].luckyPeople} />

              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  onClick={resetAll}
                  className="border-orange-500 text-orange-500 hover:bg-orange-100 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900/30"
                  aria-label="Reset all matches"
                >
                  <RefreshCcw className="mr-2 h-5 w-5" /> Reset All
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <p className="text-sm sm:text-base text-orange-700 dark:text-orange-300 font-medium">
            Total Participants: {getParticipantCount()} amazing people! 🌟
          </p>
        </div>
      </div>

      {isCurrentGameGenerating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}