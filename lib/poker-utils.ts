import { ChipConfig, ChipStack } from "./types"

export const createInitialChips = (chipConfigs: ChipConfig[]): ChipStack => {
  const chips: ChipStack = {}
  chipConfigs.forEach((config) => {
    chips[config.denomination] = 0
  })
  return chips
}

export const sortChipsByDenomination = (chips: ChipConfig[]): ChipConfig[] => {
  return [...chips].sort((a, b) => a.denomination - b.denomination)
}

export const calculateTotal = (chips: ChipStack): number => {
  return Object.entries(chips).reduce((total, [denom, count]) => {
    return total + Number.parseInt(denom) * count
  }, 0)
}

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

export const getTimerColor = (timeRemaining: number, totalTime: number): string => {
  const percentage = (timeRemaining / totalTime) * 100

  if (percentage <= 10) return "text-red-600 bg-red-50 border-red-200"
  if (percentage <= 25) return "text-orange-600 bg-orange-50 border-orange-200"
  return "text-blue-600 bg-blue-50 border-blue-200"
}

export const getStackColor = (bigBlinds: number): string => {
  if (bigBlinds < 20) return "text-red-600 bg-red-50 border-red-200"
  if (bigBlinds < 40) return "text-yellow-600 bg-yellow-50 border-yellow-200"
  return "text-green-600 bg-green-50 border-green-200"
}

export const getStackStatus = (bigBlinds: number): string => {
  if (bigBlinds < 20) return "Short Stack"
  if (bigBlinds < 40) return "Medium Stack"
  return "Healthy Stack"
}