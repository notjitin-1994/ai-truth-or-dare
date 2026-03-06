import { useState } from 'react';
import { GameProvider, useGame } from '@/hooks/useGameStore';
import { PlayerForm } from '@/components/PlayerForm';
import { PlayerCard } from '@/components/PlayerCard';
import { GameSettingsPanel } from '@/components/GameSettings';
import { GamePlay } from '@/components/GamePlay';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  Users, Settings2, Play, Plus, Gamepad2, Sparkles, AlertTriangle,
  RotateCcw, LogOut, Save, Trash2, Database
} from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function GameContent() {
  const { state, addPlayer, removePlayer, updatePlayer, startGame, endGame, canStartGame, clearAllData, hasSavedData } = useGame();
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { players, isGameActive, settings } = state;

  const handleAddPlayer = (playerData: Parameters<typeof addPlayer>[0]) => {
    addPlayer(playerData);
    setShowAddPlayer(false);
    toast.success(`${playerData.name} joined the game!`);
  };

  const handleRemovePlayer = (id: string) => {
    const player = players.find(p => p.id === id);
    removePlayer(id);
    if (player) toast.info(`${player.name} has been removed`);
  };

  const handleUpdatePlayer = (player: typeof players[0]) => {
    updatePlayer(player);
    toast.success(`${player.name}'s profile updated`);
  };

  const handleStartGame = () => {
    if (!canStartGame()) {
      toast.error('Need at least 2 players to start!');
      return;
    }
    startGame();
    toast.success('Game started! Let the fun begin...');
  };

  const handleExitGame = () => {
    endGame();
    setShowExitConfirm(false);
    toast.info('Game ended');
  };

  const handleClearAllData = () => {
    clearAllData();
    setShowClearConfirm(false);
    toast.info('All data cleared');
  };

  if (!settings.allowAdultContent && isGameActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500/50 bg-slate-900">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Adult Content Disabled</h2>
            <Button onClick={endGame} className="bg-purple-600 hover:bg-purple-700">Return to Setup</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <header className="border-b border-purple-500/20 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Truth or Dare</h1>
              <p className="text-xs text-slate-400">Adult Edition</p>
            </div>
          </div>
          {isGameActive ? (
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                {settings.intensityLevel.toUpperCase()}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setShowExitConfirm(true)} className="text-slate-400 hover:text-red-400">
                <LogOut className="w-4 h-4 mr-1" /> Exit
              </Button>
            </div>
          ) : hasSavedData() && (
            <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
              <Save className="w-3 h-3 mr-1" /> Auto-Saved
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {isGameActive ? (
          <div className="max-w-2xl mx-auto"><GamePlay /></div>
        ) : (
          <Tabs defaultValue="players" className="w-full">
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8 bg-slate-800">
              <TabsTrigger value="players" className="data-[state=active]:bg-purple-600">
                <Users className="w-4 h-4 mr-2" /> Players ({players.length})
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-purple-600">
                <Settings2 className="w-4 h-4 mr-2" /> Settings
              </TabsTrigger>
              <TabsTrigger value="data" className="data-[state=active]:bg-purple-600">
                <Database className="w-4 h-4 mr-2" /> Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="players" className="space-y-6">
              {!showAddPlayer && (
                <div className="flex justify-center">
                  <Button onClick={() => setShowAddPlayer(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Add Player
                  </Button>
                </div>
              )}
              {showAddPlayer && <PlayerForm onSubmit={handleAddPlayer} onCancel={() => setShowAddPlayer(false)} />}
              {players.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {players.map((player) => (
                    <PlayerCard key={player.id} player={player} onRemove={handleRemovePlayer} onUpdate={handleUpdatePlayer} />
                  ))}
                </div>
              ) : (
                <Card className="border-dashed border-slate-700 bg-slate-800/50">
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">No Players Yet</h3>
                    <p className="text-slate-500 mb-4">Add at least 2 players to start the game</p>
                    <Button onClick={() => setShowAddPlayer(true)} variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                      <Plus className="w-4 h-4 mr-2" /> Add Your First Player
                    </Button>
                  </CardContent>
                </Card>
              )}
              {players.length >= 2 && (
                <div className="flex justify-center pt-4">
                  <Button onClick={handleStartGame} size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg px-12 py-6">
                    <Play className="w-5 h-5 mr-2" /> START GAME
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <div className="max-w-md mx-auto"><GameSettingsPanel /></div>
            </TabsContent>

            <TabsContent value="data">
              <div className="max-w-md mx-auto">
                <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <Database className="w-6 h-6 text-purple-400" />
                      <div>
                        <h3 className="font-bold text-white">Data Management</h3>
                        <p className="text-sm text-slate-400">Manage your saved game data</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-300">Auto-Save Status</p>
                            <p className="text-xs text-slate-500">All data is saved automatically to your browser</p>
                          </div>
                          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                        </div>
                      </div>
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-sm text-slate-300">Saved Players</p>
                            <p className="text-xs text-slate-500">{players.length} player(s) in storage</p>
                          </div>
                          <span className="text-2xl font-bold text-white">{players.length}</span>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-700">
                        <p className="text-sm text-slate-400 mb-4">Danger Zone</p>
                        <Button variant="destructive" onClick={() => setShowClearConfirm(true)} className="w-full" disabled={players.length === 0}>
                          <Trash2 className="w-4 h-4 mr-2" /> Clear All Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" /> End Game?
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to end the current game? Your player data is saved, but game progress will be reset.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowExitConfirm(false)} className="border-slate-600 text-slate-300">Cancel</Button>
            <Button onClick={handleExitGame} className="bg-red-600 hover:bg-red-700 text-white">
              <RotateCcw className="w-4 h-4 mr-2" /> End Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Clear All Data?
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              This will permanently delete all saved players and settings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)} className="border-slate-600 text-slate-300">Cancel</Button>
            <Button onClick={handleClearAllData} variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" /> Delete Everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1e293b', color: '#fff', border: '1px solid rgba(168, 85, 247, 0.3)' },
      }} />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
}

export default App;
