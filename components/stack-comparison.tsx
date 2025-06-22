import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayerStack } from "@/lib/types"

interface StackComparisonProps {
  players: Record<string, PlayerStack>
}

export function StackComparison({ players }: StackComparisonProps) {
  return (
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
  )
}