"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import {
  Minus,
  Plus,
  RotateCcw,
  Settings,
  Save,
  Download,
  Upload,
  Play,
  Pause,
  SkipForward,
  TimerResetIcon as Reset,
  Clock,
  Volume2,
} from "lucide-react"

interface ChipConfig {
  denomination: number
  color: string
  textColor: string
}

interface BlindLevel {
  level: number
  smallBlind: number
  bigBlind: number
  ante?: number
  duration: number // minutes
}

interface TournamentConfig {
  name: string
  chips: ChipConfig[]
  blindStructure: BlindLevel[]
}

interface ChipStack {
  [key: number]: number
}

interface PlayerStack {
  name: string
  chips: ChipStack
  total: number
  bigBlinds: number
}

interface TimerState {
  isRunning: boolean
  timeRemaining: number // seconds
  currentLevel: number
  autoAdvance: boolean
  soundEnabled: boolean
  manualMode: boolean // Add this new field
}

const defaultConfigs: TournamentConfig[] = [
  {
    name: "Standard Tournament",
    chips: [
      { denomination: 25, color: "#22c55e", textColor: "#ffffff" },
      { denomination: 100, color: "#000000", textColor: "#ffffff" },
      { denomination: 500, color: "#dc2626", textColor: "#ffffff" },
      { denomination: 1000, color: "#3b82f6", textColor: "#ffffff" },
      { denomination: 5000, color: "#8b5cf6", textColor: "#ffffff" },
      { denomination: 10000, color: "#f59e0b", textColor: "#000000" },
      { denomination: 25000, color: "#ec4899", textColor: "#ffffff" },
    ],
    blindStructure: [
      { level: 1, smallBlind: 25, bigBlind: 50, duration: 20 },
      { level: 2, smallBlind: 50, bigBlind: 100, duration: 20 },
      { level: 3, smallBlind: 75, bigBlind: 150, duration: 20 },
      { level: 4, smallBlind: 100, bigBlind: 200, duration: 20 },
      { level: 5, smallBlind: 150, bigBlind: 300, duration: 20 },
      { level: 6, smallBlind: 200, bigBlind: 400, duration: 20 },
      { level: 7, smallBlind: 300, bigBlind: 600, duration: 20 },
      { level: 8, smallBlind: 400, bigBlind: 800, duration: 20 },
      { level: 9, smallBlind: 600, bigBlind: 1200, duration: 20 },
      { level: 10, smallBlind: 800, bigBlind: 1600, duration: 20 },
    ],
  },
  {
    name: "Turbo Tournament",
    chips: [
      { denomination: 25, color: "#22c55e", textColor: "#ffffff" },
      { denomination: 100, color: "#000000", textColor: "#ffffff" },
      { denomination: 500, color: "#dc2626", textColor: "#ffffff" },
      { denomination: 1000, color: "#3b82f6", textColor: "#ffffff" },
      { denomination: 5000, color: "#8b5cf6", textColor: "#ffffff" },
    ],
    blindStructure: [
      { level: 1, smallBlind: 25, bigBlind: 50, duration: 10 },
      { level: 2, smallBlind: 50, bigBlind: 100, duration: 10 },
      { level: 3, smallBlind: 75, bigBlind: 150, duration: 10 },
      { level: 4, smallBlind: 100, bigBlind: 200, duration: 10 },
      { level: 5, smallBlind: 150, bigBlind: 300, duration: 10 },
      { level: 6, smallBlind: 200, bigBlind: 400, duration: 10 },
    ],
  },
]

export default function Component() {
  const [currentConfig, setCurrentConfig] = useState<TournamentConfig>(defaultConfigs[0])
  const [savedConfigs, setSavedConfigs] = useState<TournamentConfig[]>(defaultConfigs)
  const [activePlayer, setActivePlayer] = useState("player1")
  const [showSettings, setShowSettings] = useState(false)

  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    timeRemaining: defaultConfigs[0].blindStructure[0].duration * 60,
    currentLevel: 1,
    autoAdvance: true,
    soundEnabled: true,
    manualMode: false, // Add this line
  })

  const timerRef = useRef<NodeJS.Timeout>()
  const audioRef = useRef<HTMLAudioElement>()

  const currentBlindLevel =
    currentConfig.blindStructure.find((level) => level.level === timer.currentLevel) || currentConfig.blindStructure[0]
  const bigBlind = currentBlindLevel?.bigBlind || 100

  const createInitialChips = (chipConfigs: ChipConfig[]): ChipStack => {
    const chips: ChipStack = {}
    chipConfigs.forEach((config) => {
      chips[config.denomination] = 0
    })
    return chips
  }

  const sortChipsByDenomination = (chips: ChipConfig[]): ChipConfig[] => {
    return [...chips].sort((a, b) => a.denomination - b.denomination)
  }

  const [players, setPlayers] = useState<Record<string, PlayerStack>>(() => {
    const initialChips = createInitialChips(currentConfig.chips)
    return {
      player1: {
        name: "My Stack",
        chips: { ...initialChips },
        total: 0,
        bigBlinds: 0,
      },
      player2: {
        name: "Opponent 1",
        chips: { ...initialChips },
        total: 0,
        bigBlinds: 0,
      },
      player3: {
        name: "Opponent 2",
        chips: { ...initialChips },
        total: 0,
        bigBlinds: 0,
      },
    }
  })

  // Timer functions
  const startTimer = () => {
    setTimer((prev) => ({ ...prev, isRunning: true }))
  }

  const pauseTimer = () => {
    setTimer((prev) => ({ ...prev, isRunning: false }))
  }

  const resetTimer = () => {
    setTimer((prev) => ({
      ...prev,
      isRunning: false,
      timeRemaining: currentBlindLevel.duration * 60,
    }))
  }

  const nextLevel = () => {
    const nextLevelData = currentConfig.blindStructure.find((level) => level.level === timer.currentLevel + 1)
    if (nextLevelData) {
      setTimer((prev) => ({
        ...prev,
        currentLevel: prev.currentLevel + 1,
        timeRemaining: nextLevelData.duration * 60,
        isRunning: false,
      }))
    }
  }

  const playWarningSound = useCallback(() => {
    if (timer.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      })
    }
  }, [timer.soundEnabled])

  // Timer effect
  useEffect(() => {
    if (timer.isRunning && timer.timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimer((prev) => {
          const newTime = prev.timeRemaining - 1

          // Warning sounds
          if (newTime === 60 || newTime === 30 || newTime === 10) {
            playWarningSound()
          }

          // Auto advance to next level
          if (newTime <= 0 && prev.autoAdvance) {
            const nextLevelData = currentConfig.blindStructure.find((level) => level.level === prev.currentLevel + 1)
            if (nextLevelData) {
              playWarningSound()
              return {
                ...prev,
                currentLevel: prev.currentLevel + 1,
                timeRemaining: nextLevelData.duration * 60,
                isRunning: true,
              }
            } else {
              return { ...prev, timeRemaining: 0, isRunning: false }
            }
          }

          return { ...prev, timeRemaining: Math.max(0, newTime) }
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [
    timer.isRunning,
    timer.timeRemaining,
    timer.autoAdvance,
    timer.currentLevel,
    currentConfig.blindStructure,
    playWarningSound,
  ])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getTimerColor = (): string => {
    const totalTime = currentBlindLevel.duration * 60
    const percentage = (timer.timeRemaining / totalTime) * 100

    if (percentage <= 10) return "text-red-600 bg-red-50 border-red-200"
    if (percentage <= 25) return "text-orange-600 bg-orange-50 border-orange-200"
    return "text-blue-600 bg-blue-50 border-blue-200"
  }

  const calculateTotal = (chips: ChipStack): number => {
    return Object.entries(chips).reduce((total, [denom, count]) => {
      return total + Number.parseInt(denom) * count
    }, 0)
  }

  const updatePlayer = (playerId: string, chips: ChipStack) => {
    const total = calculateTotal(chips)
    const bigBlinds = bigBlind > 0 ? total / bigBlind : 0

    setPlayers((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        chips,
        total,
        bigBlinds,
      },
    }))
  }

  const updateChipCount = (playerId: string, denomination: number, change: number) => {
    const currentChips = players[playerId].chips
    const newCount = Math.max(0, (currentChips[denomination] || 0) + change)
    const newChips = {
      ...currentChips,
      [denomination]: newCount,
    }
    updatePlayer(playerId, newChips)
  }

  const setChipCount = (playerId: string, denomination: number, count: number) => {
    const currentChips = players[playerId].chips
    const newChips = {
      ...currentChips,
      [denomination]: Math.max(0, count),
    }
    updatePlayer(playerId, newChips)
  }

  const clearStack = (playerId: string) => {
    const initialChips = createInitialChips(currentConfig.chips)
    updatePlayer(playerId, initialChips)
  }

  const getStackColor = (bigBlinds: number): string => {
    if (bigBlinds < 20) return "text-red-600 bg-red-50 border-red-200"
    if (bigBlinds < 40) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-green-600 bg-green-50 border-green-200"
  }

  const getStackStatus = (bigBlinds: number): string => {
    if (bigBlinds < 20) return "Short Stack"
    if (bigBlinds < 40) return "Medium Stack"
    return "Healthy Stack"
  }

  const switchConfig = (configName: string) => {
    const config = savedConfigs.find((c) => c.name === configName)
    if (config) {
      setCurrentConfig(config)
      setTimer((prev) => ({
        ...prev,
        currentLevel: 1,
        timeRemaining: config.blindStructure[0].duration * 60,
        isRunning: false,
      }))
      // Reset all player stacks
      const initialChips = createInitialChips(config.chips)
      setPlayers((prev) => {
        const newPlayers = { ...prev }
        Object.keys(newPlayers).forEach((playerId) => {
          newPlayers[playerId] = {
            ...newPlayers[playerId],
            chips: { ...initialChips },
            total: 0,
            bigBlinds: 0,
          }
        })
        return newPlayers
      })
    }
  }

  const saveConfig = (config: TournamentConfig) => {
    setSavedConfigs((prev) => {
      const existing = prev.findIndex((c) => c.name === config.name)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = config
        return updated
      }
      return [...prev, config]
    })
  }

  const exportConfig = () => {
    const dataStr = JSON.stringify(currentConfig, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${currentConfig.name.replace(/\s+/g, "_")}_config.json`
    link.click()
  }

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string)
          saveConfig(config)
          setCurrentConfig(config)
        } catch (error) {
          alert("Invalid configuration file")
        }
      }
      reader.readAsText(file)
    }
  }

  useEffect(() => {
    // Recalculate all players when blind level changes
    Object.keys(players).forEach((playerId) => {
      const player = players[playerId]
      const bigBlinds = bigBlind > 0 ? player.total / bigBlind : 0
      setPlayers((prev) => ({
        ...prev,
        [playerId]: {
          ...prev[playerId],
          bigBlinds,
        },
      }))
    })
  }, [bigBlind])

  const currentPlayer = players[activePlayer]

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 bg-background min-h-screen">
      {/* Hidden audio element for timer sounds */}
      <audio ref={audioRef} preload="auto">
        <source
          src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
          type="audio/wav"
        />
      </audio>

      <div className="text-center flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Poker Calculator</h1>
          <p className="text-xs text-muted-foreground">{currentConfig.name}</p>
        </div>
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tournament Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Select Configuration</Label>
                <Select value={currentConfig.name} onValueChange={switchConfig}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {savedConfigs.map((config) => (
                      <SelectItem key={config.name} value={config.name}>
                        {config.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={exportConfig} className="flex-1">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <label>
                    <Upload className="h-4 w-4 mr-1" />
                    Import
                    <input type="file" accept=".json" onChange={importConfig} className="hidden" />
                  </label>
                </Button>
              </div>

              <div>
                <Label>Timer Settings</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-advance" className="text-sm">
                      Auto-advance levels
                    </Label>
                    <Switch
                      id="auto-advance"
                      checked={timer.autoAdvance}
                      onCheckedChange={(checked) => setTimer((prev) => ({ ...prev, autoAdvance: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-enabled" className="text-sm">
                      Sound alerts
                    </Label>
                    <Switch
                      id="sound-enabled"
                      checked={timer.soundEnabled}
                      onCheckedChange={(checked) => setTimer((prev) => ({ ...prev, soundEnabled: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="manual-mode" className="text-sm">
                      Manual blind input
                    </Label>
                    <Switch
                      id="manual-mode"
                      checked={timer.manualMode}
                      onCheckedChange={(checked) => setTimer((prev) => ({ ...prev, manualMode: checked }))}
                    />
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Manual mode allows direct blind input without timer progression
              </div>

              <div>
                <Label>Chip Denominations</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {sortChipsByDenomination(currentConfig.chips).map((chip) => {
                    const index = currentConfig.chips.findIndex((c) => c.denomination === chip.denomination)
                    return (
                      <div key={chip.denomination} className="space-y-1 p-2 border rounded">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ backgroundColor: chip.color, color: chip.textColor }}
                            >
                              {chip.denomination >= 1000 ? `${chip.denomination / 1000}K` : chip.denomination}
                            </div>
                            <span className="text-sm font-medium">{chip.denomination.toLocaleString()}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newChips = currentConfig.chips.filter((_, i) => i !== index)
                              setCurrentConfig({ ...currentConfig, chips: newChips })
                            }}
                            className="h-6 w-6 p-0 text-xs"
                          >
                            ×
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs">Value</Label>
                            <Input
                              type="number"
                              value={chip.denomination}
                              onChange={(e) => {
                                const newChips = [...currentConfig.chips]
                                const value = e.target.value
                                newChips[index] = {
                                  ...chip,
                                  denomination: value === "" ? 1 : Number.parseInt(value) || 1,
                                }
                                // Sort chips after modification
                                const sortedChips = sortChipsByDenomination(newChips)
                                setCurrentConfig({ ...currentConfig, chips: sortedChips })
                              }}
                              onFocus={(e) => e.target.select()} // Select all text when focused
                              onKeyDown={(e) => {
                                // Allow clearing with Delete/Backspace
                                if (e.key === "Delete" || e.key === "Backspace") {
                                  e.stopPropagation()
                                }
                              }}
                              className="h-7 text-xs text-center"
                              min="1"
                              placeholder="Enter value"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Color</Label>
                            <input
                              type="color"
                              value={chip.color}
                              onChange={(e) => {
                                const newChips = [...currentConfig.chips]
                                newChips[index] = { ...chip, color: e.target.value }
                                setCurrentConfig({ ...currentConfig, chips: newChips })
                              }}
                              className="w-full h-7 rounded border"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newChip: ChipConfig = {
                        denomination: 1,
                        color: "#000000",
                        textColor: "#ffffff",
                      }
                      setCurrentConfig({
                        ...currentConfig,
                        chips: [...currentConfig.chips, newChip],
                      })
                    }}
                    className="flex-1"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Chip
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-1 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const standardChips: ChipConfig[] = [
                        { denomination: 25, color: "#22c55e", textColor: "#ffffff" },
                        { denomination: 100, color: "#000000", textColor: "#ffffff" },
                        { denomination: 500, color: "#dc2626", textColor: "#ffffff" },
                        { denomination: 1000, color: "#3b82f6", textColor: "#ffffff" },
                        { denomination: 5000, color: "#8b5cf6", textColor: "#ffffff" },
                      ]
                      setCurrentConfig({ ...currentConfig, chips: standardChips })
                    }}
                    className="text-xs h-7"
                  >
                    Standard
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const cashChips: ChipConfig[] = [
                        { denomination: 1, color: "#ffffff", textColor: "#000000" },
                        { denomination: 5, color: "#dc2626", textColor: "#ffffff" },
                        { denomination: 25, color: "#22c55e", textColor: "#ffffff" },
                        { denomination: 100, color: "#000000", textColor: "#ffffff" },
                        { denomination: 500, color: "#8b5cf6", textColor: "#ffffff" },
                      ]
                      setCurrentConfig({ ...currentConfig, chips: cashChips })
                    }}
                    className="text-xs h-7"
                  >
                    Cash Game
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const highRollerChips: ChipConfig[] = [
                        { denomination: 100, color: "#000000", textColor: "#ffffff" },
                        { denomination: 500, color: "#dc2626", textColor: "#ffffff" },
                        { denomination: 1000, color: "#3b82f6", textColor: "#ffffff" },
                        { denomination: 5000, color: "#8b5cf6", textColor: "#ffffff" },
                        { denomination: 25000, color: "#ec4899", textColor: "#ffffff" },
                        { denomination: 100000, color: "#f59e0b", textColor: "#000000" },
                      ]
                      setCurrentConfig({ ...currentConfig, chips: highRollerChips })
                    }}
                    className="text-xs h-7"
                  >
                    High Roller
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const casinoChips: ChipConfig[] = [
                        { denomination: 1, color: "#ffffff", textColor: "#000000" },
                        { denomination: 5, color: "#dc2626", textColor: "#ffffff" },
                        { denomination: 10, color: "#3b82f6", textColor: "#ffffff" },
                        { denomination: 25, color: "#22c55e", textColor: "#ffffff" },
                        { denomination: 100, color: "#000000", textColor: "#ffffff" },
                        { denomination: 500, color: "#8b5cf6", textColor: "#ffffff" },
                        { denomination: 1000, color: "#f59e0b", textColor: "#000000" },
                      ]
                      setCurrentConfig({ ...currentConfig, chips: casinoChips })
                    }}
                    className="text-xs h-7"
                  >
                    Casino
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const homeGameChips: ChipConfig[] = [
                        { denomination: 5, color: "#dc2626", textColor: "#ffffff" },
                        { denomination: 10, color: "#3b82f6", textColor: "#ffffff" },
                        { denomination: 25, color: "#22c55e", textColor: "#ffffff" },
                        { denomination: 50, color: "#f59e0b", textColor: "#000000" },
                        { denomination: 100, color: "#000000", textColor: "#ffffff" },
                      ]
                      setCurrentConfig({ ...currentConfig, chips: homeGameChips })
                    }}
                    className="text-xs h-7"
                  >
                    Home Game
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const wsopChips: ChipConfig[] = [
                        { denomination: 25, color: "#22c55e", textColor: "#000000" },
                        { denomination: 100, color: "#000000", textColor: "#ffffff" },
                        { denomination: 500, color: "#3b82f6", textColor: "#ffffff" },
                        { denomination: 1000, color: "#f59e0b", textColor: "#000000" },
                        { denomination: 5000, color: "#8b5cf6", textColor: "#ffffff" },
                        { denomination: 25000, color: "#ec4899", textColor: "#ffffff" },
                      ]
                      setCurrentConfig({ ...currentConfig, chips: wsopChips })
                    }}
                    className="text-xs h-7"
                  >
                    WSOP Style
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const euroChips: ChipConfig[] = [
                        { denomination: 1, color: "#ffffff", textColor: "#000000" },
                        { denomination: 5, color: "#dc2626", textColor: "#ffffff" },
                        { denomination: 10, color: "#3b82f6", textColor: "#ffffff" },
                        { denomination: 20, color: "#22c55e", textColor: "#ffffff" },
                        { denomination: 50, color: "#8b5cf6", textColor: "#ffffff" },
                        { denomination: 100, color: "#000000", textColor: "#ffffff" },
                        { denomination: 500, color: "#f59e0b", textColor: "#000000" },
                      ]
                      setCurrentConfig({ ...currentConfig, chips: euroChips })
                    }}
                    className="text-xs h-7"
                  >
                    European
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const microChips: ChipConfig[] = [
                        { denomination: 1, color: "#ffffff", textColor: "#000000" },
                        { denomination: 2, color: "#dc2626", textColor: "#ffffff" },
                        { denomination: 5, color: "#22c55e", textColor: "#ffffff" },
                        { denomination: 10, color: "#3b82f6", textColor: "#ffffff" },
                        { denomination: 20, color: "#8b5cf6", textColor: "#ffffff" },
                      ]
                      setCurrentConfig({ ...currentConfig, chips: microChips })
                    }}
                    className="text-xs h-7"
                  >
                    Micro Stakes
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                  Choose from popular chip color schemes used in different poker formats and venues
                </div>
              </div>

              <div>
                <Label>Blind Structure</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {currentConfig.blindStructure.map((level, index) => (
                    <div key={level.level} className="space-y-1 p-2 border rounded">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Level {level.level}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newStructure = currentConfig.blindStructure.filter((_, i) => i !== index)
                            setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                          }}
                          className="h-6 w-6 p-0 text-xs"
                        >
                          ×
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 gap-1 items-center">
                        <div className="space-y-1">
                          <Label className="text-xs">SB</Label>
                          <Input
                            type="number"
                            value={level.smallBlind}
                            onChange={(e) => {
                              const newStructure = [...currentConfig.blindStructure]
                              newStructure[index] = { ...level, smallBlind: Number.parseInt(e.target.value) || 0 }
                              setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                            }}
                            className="h-7 text-xs text-center"
                            min="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">BB</Label>
                          <Input
                            type="number"
                            value={level.bigBlind}
                            onChange={(e) => {
                              const newStructure = [...currentConfig.blindStructure]
                              newStructure[index] = { ...level, bigBlind: Number.parseInt(e.target.value) || 0 }
                              setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                            }}
                            className="h-7 text-xs text-center"
                            min="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Ante</Label>
                          <Input
                            type="number"
                            value={level.ante || 0}
                            onChange={(e) => {
                              const newStructure = [...currentConfig.blindStructure]
                              const ante = Number.parseInt(e.target.value) || 0
                              newStructure[index] = { ...level, ante: ante > 0 ? ante : undefined }
                              setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                            }}
                            className="h-7 text-xs text-center"
                            min="0"
                            placeholder="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Min</Label>
                          <Input
                            type="number"
                            value={level.duration}
                            onChange={(e) => {
                              const newStructure = [...currentConfig.blindStructure]
                              newStructure[index] = { ...level, duration: Number.parseInt(e.target.value) || 1 }
                              setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                            }}
                            className="h-7 text-xs text-center"
                            min="1"
                            max="120"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const lastLevel = currentConfig.blindStructure[currentConfig.blindStructure.length - 1]
                      const newLevel: BlindLevel = {
                        level: lastLevel.level + 1,
                        smallBlind: lastLevel.bigBlind,
                        bigBlind: lastLevel.bigBlind * 2,
                        duration: lastLevel.duration,
                      }
                      setCurrentConfig({
                        ...currentConfig,
                        blindStructure: [...currentConfig.blindStructure, newLevel],
                      })
                    }}
                    className="flex-1"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Level
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground mt-1">
                  Edit small blind, big blind, ante, and duration for each level
                </div>
              </div>

              <div>
                <Label>Quick Duration Presets</Label>
                <div className="grid grid-cols-4 gap-1 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newStructure = currentConfig.blindStructure.map((level) => ({ ...level, duration: 10 }))
                      setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                    }}
                    className="text-xs h-7"
                  >
                    10m
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newStructure = currentConfig.blindStructure.map((level) => ({ ...level, duration: 15 }))
                      setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                    }}
                    className="text-xs h-7"
                  >
                    15m
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newStructure = currentConfig.blindStructure.map((level) => ({ ...level, duration: 20 }))
                      setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                    }}
                    className="text-xs h-7"
                  >
                    20m
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newStructure = currentConfig.blindStructure.map((level) => ({ ...level, duration: 30 }))
                      setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                    }}
                    className="text-xs h-7"
                  >
                    30m
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Set all levels to same duration</div>
              </div>

              <Button variant="outline" size="sm" onClick={() => saveConfig(currentConfig)} className="w-full">
                <Save className="h-4 w-4 mr-1" />
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timer Display */}
      {timer.manualMode ? (
        <Card>
          <CardContent className="pt-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Manual Blind Input</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Small Blind</Label>
                  <Input
                    type="number"
                    value={currentBlindLevel.smallBlind}
                    onChange={(e) => {
                      const newValue = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                      const newStructure = [...currentConfig.blindStructure]
                      const levelIndex = newStructure.findIndex((l) => l.level === timer.currentLevel)
                      if (levelIndex >= 0) {
                        newStructure[levelIndex] = { ...newStructure[levelIndex], smallBlind: newValue }
                        setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="h-8 text-center text-sm"
                    min="0"
                    placeholder="SB"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Big Blind</Label>
                  <Input
                    type="number"
                    value={currentBlindLevel.bigBlind}
                    onChange={(e) => {
                      const newValue = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                      const newStructure = [...currentConfig.blindStructure]
                      const levelIndex = newStructure.findIndex((l) => l.level === timer.currentLevel)
                      if (levelIndex >= 0) {
                        newStructure[levelIndex] = { ...newStructure[levelIndex], bigBlind: newValue }
                        setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="h-8 text-center text-sm"
                    min="0"
                    placeholder="BB"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Ante</Label>
                  <Input
                    type="number"
                    value={currentBlindLevel.ante || 0}
                    onChange={(e) => {
                      const newValue = e.target.value === "" ? 0 : Number.parseInt(e.target.value) || 0
                      const newStructure = [...currentConfig.blindStructure]
                      const levelIndex = newStructure.findIndex((l) => l.level === timer.currentLevel)
                      if (levelIndex >= 0) {
                        newStructure[levelIndex] = {
                          ...newStructure[levelIndex],
                          ante: newValue > 0 ? newValue : undefined,
                        }
                        setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
                      }
                    }}
                    onFocus={(e) => e.target.select()}
                    className="h-8 text-center text-sm"
                    min="0"
                    placeholder="Ante"
                  />
                </div>
              </div>
              <div className="text-lg font-semibold">
                {currentBlindLevel.smallBlind}/{currentBlindLevel.bigBlind}
                {currentBlindLevel.ante && ` (A${currentBlindLevel.ante})`}
              </div>
              <div className="text-xs text-muted-foreground">
                Edit blinds directly - calculations update in real-time
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className={`border-2 ${getTimerColor()}`}>
          <CardContent className="pt-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">Level {timer.currentLevel}</span>
              </div>
              <div className="text-3xl font-bold font-mono">{formatTime(timer.timeRemaining)}</div>
              <div className="text-sm">
                {currentBlindLevel.smallBlind}/{currentBlindLevel.bigBlind}
                {currentBlindLevel.ante && ` (A${currentBlindLevel.ante})`}
              </div>
              <Progress value={(timer.timeRemaining / (currentBlindLevel.duration * 60)) * 100} className="h-2" />
              <div className="flex gap-1 justify-center">
                <Button variant="outline" size="sm" onClick={timer.isRunning ? pauseTimer : startTimer} className="h-8">
                  {timer.isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button variant="outline" size="sm" onClick={resetTimer} className="h-8">
                  <Reset className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" onClick={nextLevel} className="h-8">
                  <SkipForward className="h-3 w-3" />
                </Button>
                {timer.soundEnabled && (
                  <Button variant="outline" size="sm" className="h-8">
                    <Volume2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Player Tabs */}
      <Tabs value={activePlayer} onValueChange={setActivePlayer}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="player1" className="text-xs">
            My Stack
          </TabsTrigger>
          <TabsTrigger value="player2" className="text-xs">
            Opp 1
          </TabsTrigger>
          <TabsTrigger value="player3" className="text-xs">
            Opp 2
          </TabsTrigger>
        </TabsList>

        {Object.entries(players).map(([playerId, player]) => (
          <TabsContent key={playerId} value={playerId} className="space-y-3">
            {/* Results Display */}
            <Card className={`border-2 ${getStackColor(player.bigBlinds)}`}>
              <CardContent className="pt-4">
                <div className="text-center space-y-1">
                  <div className="text-2xl font-bold">{player.bigBlinds.toFixed(1)} BB</div>
                  <div className="text-sm text-muted-foreground">{player.total.toLocaleString()} chips</div>
                  <Badge variant="outline" className={getStackColor(player.bigBlinds)}>
                    {getStackStatus(player.bigBlinds)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Chip Input */}
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">{player.name}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => clearStack(playerId)} className="h-7 w-7 p-0">
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {sortChipsByDenomination(currentConfig.chips).map((chipConfig) => {
                  const count = player.chips[chipConfig.denomination] || 0
                  return (
                    <div key={chipConfig.denomination} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: chipConfig.color, color: chipConfig.textColor }}
                          >
                            {chipConfig.denomination >= 1000
                              ? `${chipConfig.denomination / 1000}K`
                              : chipConfig.denomination}
                          </div>
                          <span className="text-sm font-medium">{chipConfig.denomination.toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {(chipConfig.denomination * count).toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        {/* Quick subtract buttons */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateChipCount(playerId, chipConfig.denomination, -10)}
                          className="h-7 w-8 p-0 text-xs"
                          disabled={count < 10}
                        >
                          -10
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateChipCount(playerId, chipConfig.denomination, -5)}
                          className="h-7 w-7 p-0 text-xs"
                          disabled={count < 5}
                        >
                          -5
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateChipCount(playerId, chipConfig.denomination, -1)}
                          className="h-7 w-7 p-0"
                          disabled={count === 0}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        {/* Count input */}
                        <Input
                          type="number"
                          value={count}
                          onChange={(e) =>
                            setChipCount(playerId, chipConfig.denomination, Number.parseInt(e.target.value) || 0)
                          }
                          className="w-14 text-center text-sm h-7"
                          min="0"
                        />

                        {/* Quick add buttons */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateChipCount(playerId, chipConfig.denomination, 1)}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateChipCount(playerId, chipConfig.denomination, 5)}
                          className="h-7 w-7 p-0 text-xs"
                        >
                          +5
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateChipCount(playerId, chipConfig.denomination, 10)}
                          className="h-7 w-8 p-0 text-xs"
                        >
                          +10
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Stack Comparison */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Stack Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {Object.entries(players).map(([playerId, player]) => (
              <div key={playerId} className="flex justify-between items-center">
                <span className="text-sm font-medium">{player.name}:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{player.bigBlinds.toFixed(1)} BB</span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      player.bigBlinds < 20 ? "bg-red-500" : player.bigBlinds < 40 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
