import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, X, Heart, Ruler, Eye, Sparkles, Edit2, Check, Trash2 } from 'lucide-react';
import type { Player, Gender, RelationshipStatus } from '@/types/game';

interface PlayerCardProps {
  player: Player;
  onRemove?: (id: string) => void;
  onUpdate?: (player: Player) => void;
  isActive?: boolean;
  showDetails?: boolean;
}

const genderIcons: Record<string, string> = { male: '♂️', female: '♀️', 'non-binary': '⚧', other: '🧑' };
const relationshipColors: Record<string, string> = {
  single: 'bg-green-500/20 text-green-400 border-green-500/30',
  dating: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  married: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  open: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  complicated: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'prefer-not-say': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

export function PlayerCard({ player, onRemove, onUpdate, isActive = false, showDetails = true }: PlayerCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: player.name, gender: player.gender, relationshipStatus: player.relationshipStatus,
    height: player.physicalFeatures.height || '', build: player.physicalFeatures.build || '',
    hairColor: player.physicalFeatures.hairColor || '', eyeColor: player.physicalFeatures.eyeColor || '',
    distinguishingFeatures: player.physicalFeatures.distinguishingFeatures || '', notes: player.notes,
  });

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({ ...player, name: editData.name.trim(), gender: editData.gender, relationshipStatus: editData.relationshipStatus,
        physicalFeatures: { height: editData.height || undefined, build: editData.build || undefined, hairColor: editData.hairColor || undefined, eyeColor: editData.eyeColor || undefined, distinguishingFeatures: editData.distinguishingFeatures || undefined },
        notes: editData.notes.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ name: player.name, gender: player.gender, relationshipStatus: player.relationshipStatus,
      height: player.physicalFeatures.height || '', build: player.physicalFeatures.build || '',
      hairColor: player.physicalFeatures.hairColor || '', eyeColor: player.physicalFeatures.eyeColor || '',
      distinguishingFeatures: player.physicalFeatures.distinguishingFeatures || '', notes: player.notes,
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="border-purple-500/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg shadow-purple-500/10">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white">Edit Player</h3>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={handleSave} className="text-green-400 hover:text-green-300 hover:bg-green-500/10"><Check className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={handleCancel} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></Button>
            </div>
          </div>
          <div className="space-y-3">
            <div><Label className="text-slate-300 text-xs">Name</Label><Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="bg-slate-800 border-slate-600 text-white text-sm" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-slate-300 text-xs">Gender</Label><Select value={editData.gender} onValueChange={(v) => setEditData({ ...editData, gender: v as Gender })}><SelectTrigger className="bg-slate-800 border-slate-600 text-white text-sm"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-800 border-slate-600"><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="non-binary">Non-binary</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
              <div><Label className="text-slate-300 text-xs">Relationship</Label><Select value={editData.relationshipStatus} onValueChange={(v) => setEditData({ ...editData, relationshipStatus: v as RelationshipStatus })}><SelectTrigger className="bg-slate-800 border-slate-600 text-white text-sm"><SelectValue /></SelectTrigger><SelectContent className="bg-slate-800 border-slate-600"><SelectItem value="single">Single</SelectItem><SelectItem value="dating">Dating</SelectItem><SelectItem value="married">Married</SelectItem><SelectItem value="open">Open</SelectItem><SelectItem value="complicated">Complicated</SelectItem><SelectItem value="prefer-not-say">Prefer not to say</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-slate-300 text-xs">Height</Label><Input value={editData.height} onChange={(e) => setEditData({ ...editData, height: e.target.value })} placeholder="e.g., 5'10" className="bg-slate-800 border-slate-600 text-white text-sm" /></div>
              <div><Label className="text-slate-300 text-xs">Build</Label><Input value={editData.build} onChange={(e) => setEditData({ ...editData, build: e.target.value })} placeholder="e.g., Athletic" className="bg-slate-800 border-slate-600 text-white text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-slate-300 text-xs">Hair Color</Label><Input value={editData.hairColor} onChange={(e) => setEditData({ ...editData, hairColor: e.target.value })} placeholder="e.g., Brown" className="bg-slate-800 border-slate-600 text-white text-sm" /></div>
              <div><Label className="text-slate-300 text-xs">Eye Color</Label><Input value={editData.eyeColor} onChange={(e) => setEditData({ ...editData, eyeColor: e.target.value })} placeholder="e.g., Blue" className="bg-slate-800 border-slate-600 text-white text-sm" /></div>
            </div>
            <div><Label className="text-slate-300 text-xs">Distinguishing Features</Label><Input value={editData.distinguishingFeatures} onChange={(e) => setEditData({ ...editData, distinguishingFeatures: e.target.value })} placeholder="e.g., Tattoos, scars" className="bg-slate-800 border-slate-600 text-white text-sm" /></div>
            <div><Label className="text-slate-300 text-xs">Notes / Kinks / Preferences</Label><Textarea value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} placeholder="Enter notes, kinks, turn-ons..." className="bg-slate-800 border-slate-600 text-white text-sm min-h-[60px]" /></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${isActive ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/20 scale-105' : 'hover:shadow-md hover:shadow-purple-500/10'} bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700`}>
      {isActive && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />}
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">{genderIcons[player.gender] || '🧑'}</div>
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">{player.name}</h3>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                <Badge variant="outline" className={`text-xs ${relationshipColors[player.relationshipStatus]}`}><Heart className="w-3 h-3 mr-1" />{player.relationshipStatus.replace('-', ' ')}</Badge>
                <Badge variant="outline" className="text-xs bg-slate-700/50 text-slate-300 border-slate-600 capitalize">{player.gender}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-0.5 sm:gap-1">
            {onUpdate && <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10"><Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></Button>}
            {onRemove && <Button variant="ghost" size="icon" onClick={() => onRemove(player.id)} className="h-8 w-8 sm:h-9 sm:w-9 text-slate-500 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></Button>}
          </div>
        </div>
        {showDetails && (
          <div className="mt-4 space-y-3">
            {(player.physicalFeatures.height || player.physicalFeatures.build || player.physicalFeatures.hairColor || player.physicalFeatures.eyeColor) && (
              <div className="flex flex-wrap gap-2">
                {player.physicalFeatures.height && <span className="inline-flex items-center text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded"><Ruler className="w-3 h-3 mr-1" />{player.physicalFeatures.height}</span>}
                {player.physicalFeatures.build && <span className="inline-flex items-center text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded"><User className="w-3 h-3 mr-1" />{player.physicalFeatures.build}</span>}
                {player.physicalFeatures.hairColor && <span className="inline-flex items-center text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">💇 {player.physicalFeatures.hairColor}</span>}
                {player.physicalFeatures.eyeColor && <span className="inline-flex items-center text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded"><Eye className="w-3 h-3 mr-1" />{player.physicalFeatures.eyeColor}</span>}
              </div>
            )}
            {player.physicalFeatures.distinguishingFeatures && <p className="text-xs text-slate-500"><Sparkles className="w-3 h-3 inline mr-1" />{player.physicalFeatures.distinguishingFeatures}</p>}
            {player.notes && <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700/50"><p className="text-xs text-slate-400 italic line-clamp-2">"{player.notes}"</p></div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
