import { useState } from 'react';
import { useGame } from '@/hooks/useGameStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Zap, SkipForward, CheckCircle2, Flame, Sparkles, History, BookOpen, ChevronDown, ChevronUp, Info, Brain } from 'lucide-react';
import { generateQuestion } from '@/services/questionGenerator';
import { generateAIQuestion } from '@/services/aiGenerator';
import type { QuestionType } from '@/types/game';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

export function GamePlay() {
  const { state, getCurrentPlayer, nextPlayer, setCurrentQuestion, addToHistory, nextRound } = useGame();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
  const [useAIFallback, setUseAIFallback] = useState(false);
  const currentPlayer = getCurrentPlayer();
  const { currentQuestion, questionHistory, settings } = state;

  const handleGenerate = async (type: QuestionType) => {
    if (!currentPlayer) return;
    setIsGenerating(true);
    setSelectedType(type);
    setUseAIFallback(false);

    const eligiblePlayers = state.players.filter(p => {
      if (p.id === currentPlayer.id) return false;
      if (p.gender === currentPlayer.gender && !settings.includeSameGenderDares) return false;
      if (p.gender !== currentPlayer.gender && !settings.includeCrossGenderDares) return false;
      return true;
    });

    const targetPlayer = eligiblePlayers.length > 0 ? eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)] : state.players.find(p => p.id !== currentPlayer.id);

    if (!targetPlayer) {
      toast.error('No eligible target player found');
      setIsGenerating(false);
      return;
    }

    if (settings.useAI) {
      try {
        const question = await generateAIQuestion(currentPlayer, targetPlayer, state.players, type, settings);
        setCurrentQuestion(question);
        setShowInstructions(true);
        setIsGenerating(false);
        return;
      } catch (error) {
        console.error('AI generation failed:', error);
        setUseAIFallback(true);
        toast.warning('AI generation failed, using templates instead');
      }
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const question = generateQuestion(currentPlayer, state.players, type, settings);
      setCurrentQuestion(question);
      setShowInstructions(true);
    } catch (error) {
      console.error('Template generation failed:', error);
      toast.error('Failed to generate question');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    if (currentQuestion) addToHistory(currentQuestion);
    setCurrentQuestion(null);
    setSelectedType(null);
    setUseAIFallback(false);
    nextPlayer();
    if (state.currentPlayerIndex === state.players.length - 1) nextRound();
  };

  const handleSkip = () => {
    setCurrentQuestion(null);
    setSelectedType(null);
    setUseAIFallback(false);
    nextPlayer();
    if (state.currentPlayerIndex === state.players.length - 1) nextRound();
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'extreme': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'hot': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-pink-400 bg-pink-500/20 border-pink-500/30';
      default: return 'text-green-400 bg-green-500/20 border-green-500/30';
    }
  };

  const getTypeIcon = (type: QuestionType) => type === 'truth' ? <HelpCircle className="w-6 h-6 text-blue-400" /> : <Zap className="w-6 h-6 text-yellow-400" />;
  const getTargetPlayerName = (id: string) => state.players.find(p => p.id === id)?.name || 'Unknown';

  if (!currentPlayer) {
    return <Card className="border-red-500/30 bg-gradient-to-br from-slate-900 to-slate-800"><CardContent className="p-8 text-center"><p className="text-slate-400">No active player found</p></CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><p className="text-sm text-slate-400 mb-1">Current Player</p><h2 className="text-2xl font-bold text-white">{currentPlayer.name}'s Turn</h2></div>
        <div className="text-right"><p className="text-sm text-slate-400 mb-1">Round</p><Badge variant="outline" className="text-lg bg-purple-500/20 text-purple-400 border-purple-500/30">#{round}</Badge></div>
      </div>
      {settings.useAI && (
        <div className="flex items-center justify-center">
          <Badge variant="outline" className={useAIFallback ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}>
            <Brain className="w-3 h-3 mr-1" /> {useAIFallback ? 'AI Unavailable - Using Templates' : 'AI Powered'}
          </Badge>
        </div>
      )}
      {currentQuestion ? (
        <Card className="border-purple-500/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl shadow-purple-500/10">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">{getTypeIcon(currentQuestion.type)}<Badge variant="outline" className={`capitalize ${getIntensityColor(currentQuestion.intensity)}`}><Flame className="w-3 h-3 mr-1" />{currentQuestion.intensity}</Badge></div>
              <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600 capitalize">{currentQuestion.category}</Badge>
            </div>
            <div className="mb-4"><Badge variant="outline" className="bg-pink-500/10 text-pink-400 border-pink-500/30">Target: {getTargetPlayerName(currentQuestion.targetPlayerId)}</Badge></div>
            <div className="text-center py-6">
              <p className="text-xl md:text-2xl font-semibold text-white leading-relaxed">
                {currentQuestion.type === 'dare' && <span className="text-purple-400">Dare: </span>}
                {currentQuestion.type === 'truth' && <span className="text-blue-400">Truth: </span>}
                {currentQuestion.content}
              </p>
            </div>
            {currentQuestion.instructions && (
              <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full mb-4 border-amber-500/30 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 hover:text-amber-300">
                    <BookOpen className="w-4 h-4 mr-2" /> {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
                    {showInstructions ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-400 mb-1">How to complete this {currentQuestion.type}:</p>
                        <p className="text-sm text-amber-300 leading-relaxed">{currentQuestion.instructions}</p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={handleSkip} className="border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700"><SkipForward className="w-4 h-4 mr-2" /> Skip</Button>
              <Button onClick={handleComplete} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8"><CheckCircle2 className="w-4 h-4 mr-2" /> Completed</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardContent className="p-8">
            <p className="text-center text-slate-400 mb-8">Choose your fate, {currentPlayer.name}...</p>
            <div className="grid grid-cols-2 gap-6">
              <Button onClick={() => handleGenerate('truth')} disabled={isGenerating} className="h-32 text-xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transition-all hover:scale-105">
                {isGenerating && selectedType === 'truth' ? <Sparkles className="w-8 h-8 animate-pulse" /> : <><HelpCircle className="w-8 h-8 mr-3" /> TRUTH</>}
              </Button>
              <Button onClick={() => handleGenerate('dare')} disabled={isGenerating} className="h-32 text-xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white transition-all hover:scale-105">
                {isGenerating && selectedType === 'dare' ? <Sparkles className="w-8 h-8 animate-pulse" /> : <><Zap className="w-8 h-8 mr-3" /> DARE</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex justify-center">
        <Button variant="ghost" onClick={() => setShowHistory(true)} className="text-slate-400 hover:text-white"><History className="w-4 h-4 mr-2" /> View History ({questionHistory.length})</Button>
      </div>
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-700">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><History className="w-5 h-5 text-purple-400" /> Question History</DialogTitle></DialogHeader>
          {questionHistory.length === 0 ? <p className="text-slate-500 text-center py-8">No questions asked yet</p> : (
            <div className="space-y-3">
              {questionHistory.map((q, index) => (
                <Card key={q.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">{getTypeIcon(q.type)}<Badge variant="outline" className={`text-xs ${getIntensityColor(q.intensity)}`}>{q.intensity}</Badge></div>
                      <span className="text-xs text-slate-500">#{questionHistory.length - index}</span>
                    </div>
                    <p className="mt-2 text-slate-300">{q.content}</p>
                    {q.instructions && <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded"><p className="text-xs text-amber-400"><Info className="w-3 h-3 inline mr-1" />{q.instructions}</p></div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
