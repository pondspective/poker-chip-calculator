import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, RotateCcw } from "lucide-react"
import { PlayerStack, ChipConfig } from "@/lib/types"
import { sortChipsByDenomination, getStackColor, getStackStatus } from "@/lib/poker-utils"

interface PlayerTabsProps {
  players: Record<string, PlayerStack>
  activePlayer: string
  onActivePlayerChange: (playerId: string) => void
  chipConfigs: ChipConfig[]
  onUpdateChipCount: (playerId: string, denomination: number, change: number) => void
  onSetChipCount: (playerId: string, denomination: number, count: number) => void
  onClearStack: (playerId: string) => void
}

export function PlayerTabs({
  players,
  activePlayer,
  onActivePlayerChange,
  chipConfigs,
  onUpdateChipCount,
  onSetChipCount,
  onClearStack,
}: PlayerTabsProps) {
  return (
    <Tabs value={activePlayer} onValueChange={onActivePlayerChange}>
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
              <Button variant="outline" size="sm" onClick={() => onClearStack(playerId)} className="h-7 w-7 p-0">
                <RotateCcw className="h-3 w-3" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {sortChipsByDenomination(chipConfigs).map((chipConfig) => {
                const count = player.chips[chipConfig.denomination] || 0
                return (
                  <ChipRow
                    key={chipConfig.denomination}
                    chipConfig={chipConfig}
                    count={count}
                    onUpdateCount={(change) => onUpdateChipCount(playerId, chipConfig.denomination, change)}
                    onSetCount={(count) => onSetChipCount(playerId, chipConfig.denomination, count)}
                  />
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  )
}

function ChipRow({
  chipConfig,
  count,
  onUpdateCount,
  onSetCount,
}: {
  chipConfig: ChipConfig
  count: number
  onUpdateCount: (change: number) => void
  onSetCount: (count: number) => void
}) {
  return (
    <div className="space-y-1">
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
          onClick={() => onUpdateCount(-10)}
          className="h-7 w-8 p-0 text-xs"
          disabled={count < 10}
        >
          -10
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateCount(-5)}
          className="h-7 w-7 p-0 text-xs"
          disabled={count < 5}
        >
          -5
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateCount(-1)}
          className="h-7 w-7 p-0"
          disabled={count === 0}
        >
          <Minus className="h-3 w-3" />
        </Button>

        {/* Count input */}
        <Input
          type="number"
          value={count}
          onChange={(e) => onSetCount(Number.parseInt(e.target.value) || 0)}
          className="w-14 text-center text-sm h-7"
          min="0"
        />

        {/* Quick add buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateCount(1)}
          className="h-7 w-7 p-0"
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateCount(5)}
          className="h-7 w-7 p-0 text-xs"
        >
          +5
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdateCount(10)}
          className="h-7 w-8 p-0 text-xs"
        >
          +10
        </Button>
      </div>
    </div>
  )
}