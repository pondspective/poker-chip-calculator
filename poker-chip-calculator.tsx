"use client"

import type React from "react"
import { useState } from "react"
import { TournamentConfig } from "@/lib/types"
import { defaultConfigs } from "@/lib/tournament-configs"
import { useTimer } from "@/hooks/use-timer"
import { usePlayers } from "@/hooks/use-players"
import { TimerDisplay } from "@/components/timer-display"
import { SettingsDialog } from "@/components/settings-dialog"
import { PlayerTabs } from "@/components/player-tabs"
import { StackComparison } from "@/components/stack-comparison"


export default function Component() {
  const [currentConfig, setCurrentConfig] = useState<TournamentConfig>(defaultConfigs[0])
  const [savedConfigs, setSavedConfigs] = useState<TournamentConfig[]>(defaultConfigs)
  const [showSettings, setShowSettings] = useState(false)

  const {
    timer,
    currentBlindLevel,
    audioRef,
    startTimer,
    pauseTimer,
    resetTimer,
    nextLevel,
    updateTimerSettings,
    resetToConfig,
  } = useTimer(currentConfig)

  const bigBlind = currentBlindLevel?.bigBlind || 100

  const {
    players,
    activePlayer,
    setActivePlayer,
    updateChipCount,
    setChipCount,
    clearStack,
    resetAllPlayers,
  } = usePlayers(currentConfig.chips, bigBlind)



  const switchConfig = (configName: string) => {
    const config = savedConfigs.find((c) => c.name === configName)
    if (config) {
      setCurrentConfig(config)
      resetToConfig(config)
      resetAllPlayers(config.chips)
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

  const handleBlindUpdate = (field: 'smallBlind' | 'bigBlind' | 'ante', value: number) => {
    const newStructure = [...currentConfig.blindStructure]
    const levelIndex = newStructure.findIndex((l) => l.level === timer.currentLevel)
    if (levelIndex >= 0) {
      if (field === 'ante') {
        newStructure[levelIndex] = {
          ...newStructure[levelIndex],
          ante: value > 0 ? value : undefined,
        }
      } else {
        newStructure[levelIndex] = { ...newStructure[levelIndex], [field]: value }
      }
      setCurrentConfig({ ...currentConfig, blindStructure: newStructure })
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 bg-background min-h-screen">
      <div className="text-center flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Poker Calculator</h1>
          <p className="text-xs text-muted-foreground">{currentConfig.name}</p>
        </div>
        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          currentConfig={currentConfig}
          savedConfigs={savedConfigs}
          timer={timer}
          onConfigChange={(config) => {
            setCurrentConfig(config)
            resetAllPlayers(config.chips)
          }}
          onConfigSwitch={switchConfig}
          onTimerSettingsChange={updateTimerSettings}
          onExport={exportConfig}
          onImport={importConfig}
          onSave={() => saveConfig(currentConfig)}
        />
      </div>

      <TimerDisplay
        timer={timer}
        currentBlindLevel={currentBlindLevel}
        onStart={startTimer}
        onPause={pauseTimer}
        onReset={resetTimer}
        onNext={nextLevel}
        onBlindUpdate={handleBlindUpdate}
        audioRef={audioRef}
      />

      <PlayerTabs
        players={players}
        activePlayer={activePlayer}
        onActivePlayerChange={setActivePlayer}
        chipConfigs={currentConfig.chips}
        onUpdateChipCount={updateChipCount}
        onSetChipCount={setChipCount}
        onClearStack={clearStack}
      />

      <StackComparison players={players} />
    </div>
  )
}
