import { useState, useCallback } from "react"
import { GameInterface } from "@/components/GameInterface"
import { processPlayerTurn, createNewGame } from "@/lib/engine"
import { saveGame, loadGame } from "@/lib/api"
import useWebLLM from "@/components/hooks/webengine"
import type { FullGameState, EngineStatus } from "@/lib/types"

function App() {
  const { progress, message, engine } = useWebLLM()
  const [gameState, setGameState] = useState<FullGameState>(createNewGame)
  const [engineStatus, setEngineStatus] = useState<EngineStatus>("idle")

  const handlePlayerInput = useCallback(async (input: string) => {
    if (!engine || engineStatus !== "idle") return

    try {
      const newState = await processPlayerTurn(
        engine,
        gameState,
        input,
        setEngineStatus
      )
      setGameState(newState)

      // Auto-save if game has been saved before
      if (newState.gameId) {
        setEngineStatus("saving")
        await saveGame(newState).catch(console.error)
        setEngineStatus("idle")
      }
    } catch (error) {
      console.error("Engine error:", error)
      setEngineStatus("idle")
    }
  }, [engine, engineStatus, gameState])

  const handleSave = useCallback(async () => {
    setEngineStatus("saving")
    try {
      const savedState = await saveGame(gameState)
      setGameState(savedState)
    } catch (error) {
      console.error("Save error:", error)
    }
    setEngineStatus("idle")
  }, [gameState])

  const handleLoad = useCallback(async () => {
    const gameId = prompt("Enter your game ID:")
    if (!gameId) return
    setEngineStatus("saving")
    try {
      const loaded = await loadGame(gameId)
      if (loaded) setGameState(loaded)
    } catch (error) {
      console.error("Load error:", error)
    }
    setEngineStatus("idle")
  }, [])

  return (
    <GameInterface
      gameState={gameState}
      engineStatus={engineStatus}
      modelProgress={progress}
      modelMessage={message}
      onPlayerInput={handlePlayerInput}
      onSave={handleSave}
      onLoad={handleLoad}
    />
  )
}

export default App
