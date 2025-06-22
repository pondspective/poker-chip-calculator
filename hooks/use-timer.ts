import { useState, useEffect, useRef, useCallback } from "react"
import { TimerState, TournamentConfig } from "@/lib/types"

export const useTimer = (currentConfig: TournamentConfig) => {
  const [timer, setTimer] = useState<TimerState>({
    isRunning: false,
    timeRemaining: currentConfig.blindStructure[0]?.duration * 60 || 1200,
    currentLevel: 1,
    autoAdvance: true,
    soundEnabled: true,
    manualMode: false,
  })

  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentBlindLevel =
    currentConfig.blindStructure.find((level) => level.level === timer.currentLevel) || 
    currentConfig.blindStructure[0]

  const playWarningSound = useCallback(() => {
    if (timer.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      })
    }
  }, [timer.soundEnabled])

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

  const updateTimerSettings = (settings: Partial<TimerState>) => {
    setTimer((prev) => ({ ...prev, ...settings }))
  }

  const resetToConfig = (config: TournamentConfig) => {
    setTimer((prev) => ({
      ...prev,
      currentLevel: 1,
      timeRemaining: config.blindStructure[0]?.duration * 60 || 1200,
      isRunning: false,
    }))
  }

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

  return {
    timer,
    currentBlindLevel,
    audioRef,
    startTimer,
    pauseTimer,
    resetTimer,
    nextLevel,
    updateTimerSettings,
    resetToConfig,
  }
}