import { useState, useRef, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Send, Save, FolderOpen, Loader2 } from "lucide-react"
import { createNewGame } from "@/lib/engine"
import type { GameInterfaceProps, EngineStatus } from "@/lib/types"

function statusMessage(status: EngineStatus): string {
  switch (status) {
    case "parsing": return "Interpreting your action..."
    case "generating-scene": return "Writing the next scene..."
    case "generating-act": return "A new chapter unfolds..."
    case "saving": return "Preserving your journey..."
    default: return ""
  }
}

export function GameInterface({
  gameState = createNewGame(),
  engineStatus = "idle",
  modelProgress = 0,
  modelMessage = "",
  onPlayerInput,
  onSave,
  onLoad,
}: GameInterfaceProps) {
  const [playerInput, setPlayerInput] = useState("")
  const scrollEndRef = useRef<HTMLDivElement>(null)
  const player = gameState.entities[gameState.playerId]
  const isModelLoaded = modelProgress >= 1
  const isBusy = engineStatus !== "idle"

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [gameState.currentScene, gameState.narrativeHistory])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerInput.trim() && onPlayerInput && isModelLoaded && !isBusy) {
      onPlayerInput(playerInput.trim())
      setPlayerInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center p-4 md:p-8 lg:p-12">
      {/* Model Loading Overlay */}
      {!isModelLoaded && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-light text-white tracking-wide">
            Preparing the Cultivation World...
          </h1>
          <div className="w-80 h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${modelProgress * 100}%` }}
            />
          </div>
          <p className="text-zinc-500 text-sm max-w-md text-center">{modelMessage}</p>
        </div>
      )}

      {/* The Book Container */}
      <div className="w-full max-w-5xl h-full max-h-[900px] bg-zinc-950 rounded-sm shadow-2xl shadow-black/50 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Column: Character & State */}
        <div className="flex flex-col p-6 md:p-8 border-r border-zinc-900">
          {/* Character Name + Save/Load */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-light text-white tracking-wide">
              {player.name}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={onSave}
                disabled={isBusy}
                className="text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30"
                aria-label="Save Game"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={onLoad}
                disabled={isBusy}
                className="text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30"
                aria-label="Load Game"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Character Stats */}
          <div className="space-y-4 mb-8">
            <StatField label="Cultivation" value={`${player.cultivation.name} (Lv ${player.cultivation.level})`} />
            <StatField label="Health" value={`${player.health}/${player.maxHealth}`} />
            <StatField label="Energy" value={`${player.energy}/${player.maxEnergy}`} />
            <StatField label="Status" value={player.status} />
            <StatField label="Current Act" value={gameState.currentAct.name} />
          </div>

          {/* Techniques Section */}
          <div className="mb-8">
            <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
              Techniques
            </h2>
            <div className="space-y-2">
              {player.techniques.length === 0 && (
                <p className="text-zinc-600 text-sm italic">No techniques learned yet.</p>
              )}
              {player.techniques.map((technique, index) => (
                <div key={index} className="flex justify-between items-center text-zinc-200">
                  <span>{technique.name}</span>
                  <span className="text-zinc-500">Lv. {technique.masteryLevel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Last Scene Context */}
          <div className="mt-auto">
            <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-2">
              Scene Context
            </h2>
            <p className="text-zinc-500 text-sm leading-relaxed">
              {gameState.currentScene.context}
            </p>
          </div>
        </div>

        {/* Right Column: Narrative & Interaction */}
        <div className="flex flex-col h-full">
          {/* Act Header */}
          <div className="p-6 md:p-8 pb-4">
            <h1 className="text-xl md:text-2xl font-light text-white tracking-wide">
              {gameState.currentAct.name}
            </h1>
          </div>

          {/* Narrative ScrollArea */}
          <ScrollArea className="flex-1 px-6 md:px-8">
            <div>
              {/* Narrative History */}
              {gameState.narrativeHistory.map((entry, i) => (
                <div key={i} className="mb-6">
                  <p className="text-zinc-600 text-xs mb-2 italic">
                    &gt; {entry.playerInput}
                  </p>
                  <div
                    className="prose prose-invert prose-zinc max-w-none text-zinc-200 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: entry.text }}
                  />
                  <hr className="border-zinc-800 my-4" />
                </div>
              ))}

              {/* Current Scene */}
              <div
                className="prose prose-invert prose-zinc max-w-none text-zinc-200 leading-relaxed pb-6"
                dangerouslySetInnerHTML={{ __html: gameState.currentScene.text }}
              />

              {/* Loading indicator */}
              {isBusy && (
                <div className="flex items-center gap-2 text-zinc-500 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{statusMessage(engineStatus)}</span>
                </div>
              )}

              <div ref={scrollEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 md:p-6 pt-2">
            <div className="relative">
              <Textarea
                value={playerInput}
                onChange={(e) => setPlayerInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isModelLoaded ? "What do you do?" : "Model loading..."}
                disabled={!isModelLoaded || isBusy}
                className="w-full min-h-[60px] max-h-[120px] bg-zinc-900/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 resize-none pr-12 focus:border-zinc-700 focus:ring-zinc-700/50 disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={!isModelLoaded || isBusy}
                className="absolute right-3 bottom-3 text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30"
                aria-label="Send"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function StatField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-zinc-200">{value}</span>
    </div>
  )
}
