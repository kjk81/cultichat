import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import {placeholderGameState} from "@/lib/types.ts";
import type {GameInterfaceProps} from "@/lib/types.ts";
import useWebLLM from "@/components/hooks/webengine.ts";

export function GameInterface({
  gameState = placeholderGameState,
  onPlayerInput,
}: GameInterfaceProps) {
  const [progress, message, engine] = useWebLLM();
  const [playerInput, setPlayerInput] = useState("")
  const player = gameState.entities[gameState.playerId]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerInput.trim() && onPlayerInput) {
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
    <div className="h-screen w-full bg-black flex items-center justify-center p-4 md:p-8 lg:p-12">
      {/* The Book Container */}
      <div className="w-full max-w-5xl h-full max-h-[900px] bg-zinc-950 rounded-sm shadow-2xl shadow-black/50 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Column: Character & State */}
        <div className="flex flex-col p-6 md:p-8 border-r border-zinc-900">
          {/* Character Name */}
          <h1 className="text-2xl md:text-3xl font-light text-white tracking-wide mb-8">
            {player.name}
          </h1>

          {/* Character Stats */}
          <div className="space-y-4 mb-8">
            <StatField label="Cultivation" value={`${player.cultivation.name} (${player.cultivation.level})`} />
            <StatField label="Status" value={player.status} />
            <StatField
              label="Current Act"
              value={gameState.currentAct.name}
            />
          </div>

          {/* Techniques Section */}
          <div className="mb-8">
            <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-4">
              Techniques
            </h2>
            <div className="space-y-2">
              {player.techniques.map((technique, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-zinc-200"
                >
                  <span>{technique.name}</span>
                  <span className="text-zinc-500">Lv. {technique.masteryLevel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Last Scene Context - pushed to bottom */}
          <div className="mt-auto">
            <h2 className="text-sm uppercase tracking-widest text-zinc-500 mb-2">
              Last Scene
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
            <div
              className="prose prose-invert prose-zinc max-w-none text-zinc-200 leading-relaxed pb-6"
              dangerouslySetInnerHTML={{ __html: gameState.currentScene.text }}
            />
          </ScrollArea>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 md:p-6 pt-2">
            <div className="relative">
              <Textarea
                value={playerInput}
                onChange={(e) => setPlayerInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you do?"
                className="w-full min-h-[60px] max-h-[120px] bg-zinc-900/50 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 resize-none pr-12 focus:border-zinc-700 focus:ring-zinc-700/50"
              />
              <button
                type="submit"
                className="absolute right-3 bottom-3 text-zinc-500 hover:text-zinc-300 transition-colors"
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

// Helper component for stat fields
function StatField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="text-zinc-200">{value}</span>
    </div>
  )
}
