import { useGame } from '@/hooks/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings2, Flame, Users, AlertTriangle } from 'lucide-react';
import { INTENSITY_LABELS, getIntensityDescription } from '@/services/questionGenerator';
import { AISettings } from './AISettings';
import type { IntensityLevel } from '@/types/game';

const intensityLevels: IntensityLevel[] = ['mild', 'medium', 'hot', 'extreme'];

export function GameSettingsPanel() {
  const { state, updateSettings } = useGame();
  const { settings } = state;
  const currentIntensityIndex = intensityLevels.indexOf(settings.intensityLevel);

  const handleIntensityChange = (value: number[]) => {
    updateSettings({ intensityLevel: intensityLevels[value[0]] });
  };

  const handleToggleAI = (useAI: boolean) => {
    updateSettings({ useAI });
  };

  return (
    <div className="space-y-6">
      <Card className="w-full border-purple-500/30 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-purple-400" /> Game Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300 flex items-center gap-2"><Flame className="w-4 h-4 text-orange-400" /> Intensity Level</Label>
              <Badge variant="outline" className={`text-sm font-semibold ${
                settings.intensityLevel === 'extreme' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                settings.intensityLevel === 'hot' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' :
                settings.intensityLevel === 'medium' ? 'bg-pink-500/20 text-pink-400 border-pink-500/50' :
                'bg-green-500/20 text-green-400 border-green-500/50'
              }`}>{INTENSITY_LABELS[settings.intensityLevel]}</Badge>
            </div>
            <Slider value={[currentIntensityIndex]} onValueChange={handleIntensityChange} max={3} step={1} className="w-full" />
            <div className="flex justify-between text-xs text-slate-500"><span>Mild</span><span>Medium</span><span>Hot</span><span>Extreme</span></div>
            <p className="text-sm text-slate-400">{getIntensityDescription(settings.intensityLevel)}</p>
            {settings.intensityLevel === 'extreme' && (
              <div className="flex items-center gap-2 text-amber-400 text-sm bg-amber-500/10 p-2 rounded border border-amber-500/30">
                <AlertTriangle className="w-4 h-4" /><span>Extreme mode includes highly explicit content. Only for consenting adults.</span>
              </div>
            )}
          </div>
          <div className="space-y-4 border-t border-slate-700 pt-4">
            <Label className="text-slate-300 flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Player Interactions</Label>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label className="text-sm text-slate-300">Same Gender Dares</Label><p className="text-xs text-slate-500">Allow dares between players of the same gender</p></div>
              <Switch checked={settings.includeSameGenderDares} onCheckedChange={(checked) => updateSettings({ includeSameGenderDares: checked })} className="data-[state=checked]:bg-purple-600" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label className="text-sm text-slate-300">Cross Gender Dares</Label><p className="text-xs text-slate-500">Allow dares between players of different genders</p></div>
              <Switch checked={settings.includeCrossGenderDares} onCheckedChange={(checked) => updateSettings({ includeCrossGenderDares: checked })} className="data-[state=checked]:bg-purple-600" />
            </div>
          </div>
          <div className="space-y-4 border-t border-slate-700 pt-4">
            <Label className="text-slate-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-pink-400" /> Content Settings</Label>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5"><Label className="text-sm text-slate-300">Adult Content</Label><p className="text-xs text-slate-500">Enable sexual and explicit content</p></div>
              <Switch checked={settings.allowAdultContent} onCheckedChange={(checked) => updateSettings({ allowAdultContent: checked })} className="data-[state=checked]:bg-pink-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      <AISettings useAI={settings.useAI} onToggleAI={handleToggleAI} />
    </div>
  );
}
