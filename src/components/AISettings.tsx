import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Brain, Sparkles, AlertTriangle, RefreshCw, Check } from 'lucide-react';
import { testApiConnection } from '@/services/aiGenerator';
import { toast } from 'sonner';

interface AISettingsProps {
  useAI: boolean;
  onToggleAI: (useAI: boolean) => void;
}

export function AISettings({ useAI, onToggleAI }: AISettingsProps) {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleToggleAI = async (checked: boolean) => {
    if (checked) {
      setIsTesting(true);
      const result = await testApiConnection();
      setTestResult(result);
      setIsTesting(false);
      if (result.success) {
        onToggleAI(true);
        toast.success('AI generation enabled!');
      } else {
        toast.error(result.message);
      }
    } else {
      onToggleAI(false);
      toast.info('AI generation disabled - using templates');
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const result = await testApiConnection();
    setTestResult(result);
    setIsTesting(false);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <Card className="w-full border-purple-500/30 bg-gradient-to-br from-slate-900 to-slate-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" /> AI Generation Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" /><span className="text-white font-medium">Enable AI Generation</span></div>
            <p className="text-sm text-slate-400">Use Kimi AI to generate unique, personalized truths and dares</p>
          </div>
          <Switch checked={useAI} onCheckedChange={handleToggleAI} className="data-[state=checked]:bg-purple-600" />
        </div>
        <Button variant="outline" onClick={handleTestConnection} disabled={isTesting} className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
          <RefreshCw className={`w-4 h-4 mr-2 ${isTesting ? 'animate-spin' : ''}`} /> {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
        {testResult && (
          <div className={`p-3 rounded-lg border ${testResult.success ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-start gap-2">
              {testResult.success ? <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />}
              <p className={`text-sm ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>{testResult.message}</p>
            </div>
          </div>
        )}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm text-amber-400 font-medium">About AI Generation</p>
              <ul className="text-sm text-amber-300 space-y-1">
                <li>• Generates truly unique content tailored to each player</li>
                <li>• Considers kinks, physical features, and relationship dynamics</li>
                <li>• Requires KIMI_API_KEY environment variable on server</li>
                <li>• Falls back to templates if AI is unavailable</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
          <span className="text-sm text-slate-400">Current Mode</span>
          <Badge variant="outline" className={useAI ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-slate-600/20 text-slate-400 border-slate-600/30'}>
            {useAI ? <><Sparkles className="w-3 h-3 mr-1" /> AI Powered</> : 'Template Based'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
