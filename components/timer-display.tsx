import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Play, Pause, SkipForward, TimerResetIcon as Reset, Clock, Volume2 } from "lucide-react"
import { BlindLevel, TimerState } from "@/lib/types"
import { formatTime, getTimerColor } from "@/lib/poker-utils"

interface TimerDisplayProps {
  timer: TimerState
  currentBlindLevel: BlindLevel
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onNext: () => void
  onBlindUpdate: (field: 'smallBlind' | 'bigBlind' | 'ante', value: number) => void
  audioRef: React.RefObject<HTMLAudioElement | null>
}

export function TimerDisplay({
  timer,
  currentBlindLevel,
  onStart,
  onPause,
  onReset,
  onNext,
  onBlindUpdate,
  audioRef,
}: TimerDisplayProps) {
  if (timer.manualMode) {
    return (
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
                    onBlindUpdate('smallBlind', newValue)
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
                    onBlindUpdate('bigBlind', newValue)
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
                    onBlindUpdate('ante', newValue)
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
    )
  }

  return (
    <>
      <audio ref={audioRef} preload="auto">
        <source
          src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT"
          type="audio/wav"
        />
      </audio>

      <Card className={`border-2 ${getTimerColor(timer.timeRemaining, currentBlindLevel.duration * 60)}`}>
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
              <Button variant="outline" size="sm" onClick={timer.isRunning ? onPause : onStart} className="h-8">
                {timer.isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button variant="outline" size="sm" onClick={onReset} className="h-8">
                <Reset className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={onNext} className="h-8">
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
    </>
  )
}