export interface ChipConfig {
  denomination: number
  color: string
  textColor: string
}

export interface BlindLevel {
  level: number
  smallBlind: number
  bigBlind: number
  ante?: number
  duration: number // minutes
}

export interface TournamentConfig {
  name: string
  chips: ChipConfig[]
  blindStructure: BlindLevel[]
}

export interface ChipStack {
  [key: number]: number
}

export interface PlayerStack {
  name: string
  chips: ChipStack
  total: number
  bigBlinds: number
}

export interface TimerState {
  isRunning: boolean
  timeRemaining: number // seconds
  currentLevel: number
  autoAdvance: boolean
  soundEnabled: boolean
  manualMode: boolean
}