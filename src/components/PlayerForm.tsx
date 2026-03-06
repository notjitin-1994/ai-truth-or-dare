import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, X } from 'lucide-react';
import type { Gender, RelationshipStatus } from '@/types/game';

interface PlayerFormProps {
  onSubmit: (player: {
    name: string;
    gender: Gender;
    relationshipStatus: RelationshipStatus;
    physicalFeatures: { height?: string; build?: string; hairColor?: string; eyeColor?: string; distinguishingFeatures?: string };
    notes: string;
  }) => void;
  onCancel?: () => void;
}

export function PlayerForm({ onSubmit, onCancel }: PlayerFormProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('other');
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus>('single');
  const [height, setHeight] = useState('');
  const [build, setBuild] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      gender,
      relationshipStatus,
      physicalFeatures: {
        height: height || undefined,
        build: build || undefined,
        hairColor: hairColor || undefined,
        eyeColor: eyeColor || undefined,
        distinguishingFeatures: distinguishingFeatures || undefined,
      },
      notes: notes.trim(),
    });
    setName(''); setGender('other'); setRelationshipStatus('single');
    setHeight(''); setBuild(''); setHairColor(''); setEyeColor('');
    setDistinguishingFeatures(''); setNotes('');
  };

  return (
    <Card className="w-full max-w-md mx-auto border-purple-500/30 bg-gradient-to-br from-slate-900 to-slate-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-purple-400" /> Add New Player
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="icon" onClick={onCancel} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter player name" className="bg-slate-800 border-slate-600 text-white" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Gender</Label>
              <Select value={gender} onValueChange={(v) => setGender(v as Gender)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Relationship</Label>
              <Select value={relationshipStatus} onValueChange={(v) => setRelationshipStatus(v as RelationshipStatus)}>
                <SelectTrigger className="bg-slate-800 border-slate-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="dating">Dating</SelectItem>
                  <SelectItem value="married">Married</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="complicated">Complicated</SelectItem>
                  <SelectItem value="prefer-not-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-4">
            <p className="text-sm text-slate-400 mb-3">Physical Features (Optional)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Height</Label>
                <Input value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g., 5'10" className="bg-slate-800 border-slate-600 text-white text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Build</Label>
                <Input value={build} onChange={(e) => setBuild(e.target.value)} placeholder="e.g., Athletic" className="bg-slate-800 border-slate-600 text-white text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Hair Color</Label>
                <Input value={hairColor} onChange={(e) => setHairColor(e.target.value)} placeholder="e.g., Brown" className="bg-slate-800 border-slate-600 text-white text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300 text-xs">Eye Color</Label>
                <Input value={eyeColor} onChange={(e) => setEyeColor(e.target.value)} placeholder="e.g., Blue" className="bg-slate-800 border-slate-600 text-white text-sm" />
              </div>
            </div>
            <div className="space-y-2 mt-3">
              <Label className="text-slate-300 text-xs">Distinguishing Features</Label>
              <Input value={distinguishingFeatures} onChange={(e) => setDistinguishingFeatures(e.target.value)} placeholder="e.g., Tattoos, scars, birthmarks" className="bg-slate-800 border-slate-600 text-white text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-300">Notes / Kinks / Preferences</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter any notes, kinks, turn-ons, or preferences..." className="bg-slate-800 border-slate-600 text-white min-h-[80px]" />
            <p className="text-xs text-slate-500">These notes help generate personalized truths and dares.</p>
          </div>
          <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
            <UserPlus className="w-4 h-4 mr-2" /> Add Player
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
