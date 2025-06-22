import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Settings, Download, Upload, Save, Plus } from "lucide-react"
import { TournamentConfig, TimerState, ChipConfig, BlindLevel } from "@/lib/types"
import { sortChipsByDenomination } from "@/lib/poker-utils"
import React from "react"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentConfig: TournamentConfig
  savedConfigs: TournamentConfig[]
  timer: TimerState
  onConfigChange: (config: TournamentConfig) => void
  onConfigSwitch: (configName: string) => void
  onTimerSettingsChange: (settings: Partial<TimerState>) => void
  onExport: () => void
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSave: () => void
}

export function SettingsDialog({
  open,
  onOpenChange,
  currentConfig,
  savedConfigs,
  timer,
  onConfigChange,
  onConfigSwitch,
  onTimerSettingsChange,
  onExport,
  onImport,
  onSave,
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Select value={currentConfig.name} onValueChange={onConfigSwitch}>
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
            <Button variant="outline" size="sm" onClick={onExport} className="flex-1">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1">
              <label>
                <Upload className="h-4 w-4 mr-1" />
                Import
                <input type="file" accept=".json" onChange={onImport} className="hidden" />
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
                  onCheckedChange={(checked) => onTimerSettingsChange({ autoAdvance: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled" className="text-sm">
                  Sound alerts
                </Label>
                <Switch
                  id="sound-enabled"
                  checked={timer.soundEnabled}
                  onCheckedChange={(checked) => onTimerSettingsChange({ soundEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="manual-mode" className="text-sm">
                  Manual blind input
                </Label>
                <Switch
                  id="manual-mode"
                  checked={timer.manualMode}
                  onCheckedChange={(checked) => onTimerSettingsChange({ manualMode: checked })}
                />
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Manual mode allows direct blind input without timer progression
          </div>

          {/* Chip Denominations Section */}
          <ChipDenominationSettings 
            currentConfig={currentConfig}
            onConfigChange={onConfigChange}
          />

          {/* Blind Structure Section */}
          <BlindStructureSettings 
            currentConfig={currentConfig}
            onConfigChange={onConfigChange}
          />

          <Button variant="outline" size="sm" onClick={onSave} className="w-full">
            <Save className="h-4 w-4 mr-1" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ChipDenominationSettings({ 
  currentConfig, 
  onConfigChange 
}: { 
  currentConfig: TournamentConfig
  onConfigChange: (config: TournamentConfig) => void 
}) {
  const chipPresets = {
    standard: [
      { denomination: 25, color: "#22c55e", textColor: "#ffffff" },
      { denomination: 100, color: "#000000", textColor: "#ffffff" },
      { denomination: 500, color: "#dc2626", textColor: "#ffffff" },
      { denomination: 1000, color: "#3b82f6", textColor: "#ffffff" },
      { denomination: 5000, color: "#8b5cf6", textColor: "#ffffff" },
    ],
    cashGame: [
      { denomination: 1, color: "#ffffff", textColor: "#000000" },
      { denomination: 5, color: "#dc2626", textColor: "#ffffff" },
      { denomination: 25, color: "#22c55e", textColor: "#ffffff" },
      { denomination: 100, color: "#000000", textColor: "#ffffff" },
      { denomination: 500, color: "#8b5cf6", textColor: "#ffffff" },
    ],
  }

  return (
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
                    onConfigChange({ ...currentConfig, chips: newChips })
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
                      const sortedChips = sortChipsByDenomination(newChips)
                      onConfigChange({ ...currentConfig, chips: sortedChips })
                    }}
                    onFocus={(e) => e.target.select()}
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
                      onConfigChange({ ...currentConfig, chips: newChips })
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
            onConfigChange({
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
          onClick={() => onConfigChange({ ...currentConfig, chips: chipPresets.standard })}
          className="text-xs h-7"
        >
          Standard
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onConfigChange({ ...currentConfig, chips: chipPresets.cashGame })}
          className="text-xs h-7"
        >
          Cash Game
        </Button>
      </div>
    </div>
  )
}

function BlindStructureSettings({ 
  currentConfig, 
  onConfigChange 
}: { 
  currentConfig: TournamentConfig
  onConfigChange: (config: TournamentConfig) => void 
}) {
  return (
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
                  onConfigChange({ ...currentConfig, blindStructure: newStructure })
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
                    onConfigChange({ ...currentConfig, blindStructure: newStructure })
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
                    onConfigChange({ ...currentConfig, blindStructure: newStructure })
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
                    onConfigChange({ ...currentConfig, blindStructure: newStructure })
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
                    onConfigChange({ ...currentConfig, blindStructure: newStructure })
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
            onConfigChange({
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
    </div>
  )
}