import { useState, useEffect } from "react"
import { PlayerStack, ChipStack, ChipConfig } from "@/lib/types"
import { createInitialChips, calculateTotal } from "@/lib/poker-utils"

export const usePlayers = (chipConfigs: ChipConfig[], bigBlind: number) => {
  const [activePlayer, setActivePlayer] = useState("player1")
  
  const [players, setPlayers] = useState<Record<string, PlayerStack>>(() => {
    const initialChips = createInitialChips(chipConfigs)
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
    const initialChips = createInitialChips(chipConfigs)
    updatePlayer(playerId, initialChips)
  }

  const resetAllPlayers = (newChipConfigs: ChipConfig[]) => {
    const initialChips = createInitialChips(newChipConfigs)
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

  // Recalculate all players when blind level changes
  useEffect(() => {
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

  return {
    players,
    activePlayer,
    setActivePlayer,
    updateChipCount,
    setChipCount,
    clearStack,
    resetAllPlayers,
  }
}