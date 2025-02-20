"use client"

import { useState } from "react"
import { Sparkles, Users, PartyPopper, RefreshCcw, UserPlus, Users2, Swords, Target, Gamepad2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { speakers, chessPlayers, carromPlayers, badmintonPlayers } from "./players"

const excludedSpeakers = [""]
const eligibleSpeakers = speakers.filter((speaker) => !excludedSpeakers.includes(speaker))

type GameMatch = {
  team1: string[]
  team2: string[]
}

type GameState = {
  matches: GameMatch[]
  luckyPeople: string[]
  usedPlayers: Set<string>
  isGenerating: boolean
}

function shuffleArray(array: string[]) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function getPlayersForGame(game: string): string[] {
  switch (game) {
    case "chess":
      return shuffleArray([...chessPlayers]) // 1v1
    case "carrom":
    case "badminton":
      // Ensure even number of players for 2v2 games
      const players = game === "carrom" ? [...carromPlayers] : [...badmintonPlayers]
      return shuffleArray(players)
    default:
      return shuffleArray([...eligibleSpeakers])
  }
}

export default function Home() {
  const [selectedSpeaker, setSelectedSpeaker] = useState("")
  const [isSpinning, setIsSpinning] = useState(false)
  const [pairSize, setPairSize] = useState(2)
  const [pairs, setPairs] = useState<string[][]>([])
  const [generalLuckyPeople, setGeneralLuckyPeople] = useState<string[]>([])
  const [generalUsedPlayers, setGeneralUsedPlayers] = useState<Set<string>>(new Set())
  const [selectedGame, setSelectedGame] = useState("general")
  const [isGeneralGenerating, setIsGeneralGenerating] = useState(false)
  
  // Separate state for each game type
  const [gameStates, setGameStates] = useState<Record<string, GameState>>({
    chess: { matches: [], luckyPeople: [], usedPlayers: new Set(), isGenerating: false },
    carrom: { matches: [], luckyPeople: [], usedPlayers: new Set(), isGenerating: false },
    badminton: { matches: [], luckyPeople: [], usedPlayers: new Set(), isGenerating: false },
  })

  const setGameState = (game: string, newState: Partial<GameState>) => {
    setGameStates(prev => ({
      ...prev,
      [game]: {
        ...prev[game],
        ...newState
      }
    }))
  }

  const generateGameMatches = (game: string, availablePlayers: string[]) => {
    const matches: GameMatch[] = []
    const used = new Set<string>()
    const players = [...availablePlayers]

    const is2v2 = game === "carrom" || game === "badminton"

    while (players.length >= (is2v2 ? 4 : 2)) {
      if (is2v2) {
        // Handle 2v2 matches
        const team1 = [players.shift(), players.shift()].filter(Boolean) as string[]
        const team2 = [players.shift(), players.shift()].filter(Boolean) as string[]

        if (team1.length === 2 && team2.length === 2) {
          matches.push({ team1, team2 })
          team1.forEach((p) => used.add(p))
          team2.forEach((p) => used.add(p))
        } else {
          // Add remaining players back to be handled as lucky players
          ;[...team1, ...team2].forEach((p) => players.push(p))
          break
        }
      } else {
        // Handle 1v1 matches (chess)
        const player1 = players.shift()
        const player2 = players.shift()

        if (player1 && player2) {
          matches.push({
            team1: [player1],
            team2: [player2],
          })
          used.add(player1)
          used.add(player2)
        }
      }
    }

    return { matches, luckyPeople: players, usedPlayers: used }
  }

  const generatePairs = (game = "general") => {
    if (game === "general") {
      setIsGeneralGenerating(true)
      setPairs([])
      setGeneralLuckyPeople([])
      setGeneralUsedPlayers(new Set())
    } else {
      setGameState(game, { isGenerating: true })
    }

    setTimeout(() => {
      const availablePlayers = getPlayersForGame(game)

      if (game === "general") {
        const newPairs: string[][] = []
        const used = new Set<string>()
        const remaining: string[] = []

        for (let i = 0; i < availablePlayers.length; i++) {
          if (!used.has(availablePlayers[i])) {
            const currentGroup: string[] = [availablePlayers[i]]
            used.add(availablePlayers[i])

            let filled = 1
            for (let j = i + 1; j < availablePlayers.length && filled < pairSize; j++) {
              if (!used.has(availablePlayers[j])) {
                currentGroup.push(availablePlayers[j])
                used.add(availablePlayers[j])
                filled++
              }
            }

            if (currentGroup.length === pairSize) {
              newPairs.push(currentGroup)
            } else {
              remaining.push(...currentGroup)
            }
          }
        }

        setPairs(newPairs)
        setGeneralLuckyPeople(remaining)
        setGeneralUsedPlayers(used)
        setIsGeneralGenerating(false)
      } else {
        const result = generateGameMatches(game, availablePlayers)
        setGameState(game, { 
          matches: result.matches, 
          luckyPeople: result.luckyPeople, 
          usedPlayers: result.usedPlayers,
          isGenerating: false
        })
      }

      const luckyCount = game === "general" ? generalLuckyPeople.length : gameStates[game].luckyPeople.length
      
      toast.success(`🎮 ${game.charAt(0).toUpperCase() + game.slice(1)} matches generated!`, {
        description: luckyCount ? "Some players get a break this round! 🌟" : "Perfect matching achieved! ✨",
        style: {
          background: "linear-gradient(to right, #ff8a00, #ff5f00)",
          color: "white",
        },
      })
    }, 1000)
  }

  const GameIcon = ({ game }: { game: string }) => {
    switch (game) {
      case "chess":
        return <Swords className="w-6 h-6" />
      case "carrom":
        return <Target className="w-6 h-6" />
      case "badminton":
        return <Gamepad2 className="w-6 h-6" />
      default:
        return <Users2 className="w-6 h-6" />
    }
  }

  const renderGameMatches = () => {
    if (selectedGame === "general" || !gameStates[selectedGame].matches.length) return null

    const currentGame = selectedGame
    const { matches } = gameStates[currentGame]

    return (
      <div className="mt-8 space-y-6">
        <h3 className="text-xl font-semibold text-orange-700 dark:text-orange-300 flex items-center gap-2">
          <GameIcon game={currentGame} />
          {currentGame.charAt(0).toUpperCase() + currentGame.slice(1)} Matches
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match, index) => (
            <div
              key={index}
              className="p-4 sm:p-6 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/50 dark:to-amber-900/30 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-orange-800 dark:text-orange-200">
                  <span className="text-sm sm:text-base font-semibold">Match {index + 1}</span>
                  <GameIcon game={currentGame} />
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
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderLuckyPeople = () => {
    const luckyPeople = selectedGame === "general" 
      ? generalLuckyPeople 
      : gameStates[selectedGame].luckyPeople;
    
    if (!luckyPeople.length) return null;
    
    return (
      <div className="mt-8 animate-fadeIn">
        <h3 className="text-xl font-semibold text-orange-700 dark:text-orange-300 mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Lucky People (Next Round)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {luckyPeople.map((person, index) => (
            <div
              key={index}
              className="p-4 bg-gradient-to-r from-orange-200 to-amber-100 dark:from-orange-800/50 dark:to-amber-700/30 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeIn"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="text-orange-600 dark:text-orange-300 font-medium">{person}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const pickRandomSpeaker = () => {
    setIsSpinning(true)
    setSelectedSpeaker("")

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * eligibleSpeakers.length)
      setSelectedSpeaker(eligibleSpeakers[randomIndex])
      setIsSpinning(false)

      toast.success("🎯 Speaker selected!", {
        description: "Time to shine! ✨",
        style: {
          background: "linear-gradient(to right, #ff8a00, #ff5f00)",
          color: "white",
        },
      })
    }, 1500)
  }

  const isCurrentGameGenerating = selectedGame === "general" 
    ? isGeneralGenerating 
    : gameStates[selectedGame].isGenerating;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-4 flex items-center justify-center gap-2">
            <PartyPopper className="h-8 w-8 animate-bounce" />
            Team Activities Manager
            <PartyPopper className="h-8 w-8 animate-bounce" />
          </h1>
        </div>

        <Tabs defaultValue="speaker" className="space-y-6">
          <TabsList className="w-full max-w-md mx-auto bg-orange-100 dark:bg-orange-900/30 p-1 rounded-xl overflow-x-auto flex-nowrap">
            <TabsTrigger
              value="speaker"
              className="w-1/2 data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600 transition-all duration-300"
            >
              <Users className="w-5 h-5 mr-2" />
              Friday Speaker
            </TabsTrigger>
            <TabsTrigger
              value="pairs"
              className="w-1/2 data-[state=active]:bg-orange-500 data-[state=active]:text-white dark:data-[state=active]:bg-orange-600 transition-all duration-300"
            >
              <Users2 className="w-5 h-5 mr-2" />
              Game Matches
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speaker">
            <Card className="p-4 sm:p-6 lg:p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                <h2 className="text-xl sm:text-2xl font-semibold text-orange-800 dark:text-orange-200">
                  Today's Lucky Speaker
                </h2>
              </div>
              <div
                className={`min-h-[120px] flex items-center justify-center text-2xl font-medium text-orange-600 dark:text-orange-300 ${
                  isSpinning ? "animate-pulse scale-105 transition-transform" : ""
                }`}
              >
                {selectedSpeaker || "Click the button to pick a speaker!"}
              </div>
            </Card>

            <div className="mt-8 text-center">
              <Button
                size="lg"
                onClick={pickRandomSpeaker}
                disabled={isSpinning}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-8 px-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              >
                <RefreshCcw className={`mr-3 h-6 w-6 ${isSpinning ? "animate-spin" : ""}`} />
                Pick Today's Speaker!
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pairs">
            <Card className="p-4 sm:p-6 lg:p-8 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl border-2 border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 mb-6">
                <UserPlus className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                <h2 className="text-xl sm:text-2xl font-semibold text-orange-800 dark:text-orange-200">
                  Game Matches Generator
                </h2>
              </div>

              <div className="space-y-6">
                <Tabs value={selectedGame} onValueChange={setSelectedGame} className="w-full">
                  <TabsList className="w-full bg-orange-100/50 dark:bg-orange-900/20 p-1 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <TabsTrigger
                      value="general"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                    >
                      <Users2 className="w-4 h-4 mr-2" />
                      General
                    </TabsTrigger>
                    <TabsTrigger
                      value="chess"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                    >
                      <Swords className="w-4 h-4 mr-2" />
                      Chess
                    </TabsTrigger>
                    <TabsTrigger
                      value="carrom"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Carrom
                    </TabsTrigger>
                    <TabsTrigger
                      value="badminton"
                      className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
                    >
                      <Gamepad2 className="w-4 h-4 mr-2" />
                      Badminton
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="mt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                          People per group:
                        </label>
                        <Input
                          type="number"
                          min="2"
                          value={pairSize}
                          onChange={(e) => setPairSize(Math.max(2, Number.parseInt(e.target.value) || 2))}
                          className="border-orange-200 dark:border-orange-800"
                        />
                      </div>
                      <Button
                        onClick={() => generatePairs("general")}
                        disabled={isGeneralGenerating}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 h-[42px]"
                      >
                        <RefreshCcw className={`mr-2 h-5 w-5 ${isGeneralGenerating ? "animate-spin" : ""}`} />
                        Generate Groups
                      </Button>
                    </div>
                  </TabsContent>

                  {["chess", "carrom", "badminton"].map((game) => (
                    <TabsContent key={game} value={game} className="mt-6">
                      <div className="flex justify-end">
                        <Button
                          onClick={() => generatePairs(game)}
                          disabled={gameStates[game].isGenerating}
                          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                        >
                          <RefreshCcw className={`mr-2 h-5 w-5 ${gameStates[game].isGenerating ? "animate-spin" : ""}`} />
                          Generate {game.charAt(0).toUpperCase() + game.slice(1)} Matches
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                {selectedGame === "general" && pairs.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-semibold text-orange-700 dark:text-orange-300">Generated Groups:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pairs.map((pair, index) => (
                        <div
                          key={index}
                          className="group p-4 bg-gradient-to-br from-orange-100 to-amber-50 dark:from-orange-900/50 dark:to-amber-900/30 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fadeIn"
                          style={{
                            animationDelay: `${index * 100}ms`,
                          }}
                        >
                          <div className="font-medium text-orange-800 dark:text-orange-200 flex items-center gap-2 mb-3">
                            <Users2 className="w-5 h-5" />
                            <span>Group {index + 1}</span>
                          </div>
                          <div className="space-y-2">
                            {pair.map((person, pIndex) => (
                              <div
                                key={pIndex}
                                className="text-orange-600 dark:text-orange-300 bg-white/50 dark:bg-black/20 p-2 rounded-md group-hover:translate-x-1 transition-transform"
                                style={{
                                  transitionDelay: `${pIndex * 50}ms`,
                                }}
                              >
                                {person}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {renderGameMatches()}
                {renderLuckyPeople()}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-12 text-center">
          <p className="text-orange-700 dark:text-orange-300 font-medium">
            Total Participants: {speakers.length} amazing people! 🌟
          </p>
        </div>
      </div>
    </div>
  )
}