import { TournamentConfig } from "./types"

export const defaultConfigs: TournamentConfig[] = [
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