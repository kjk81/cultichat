import type { FullGameState } from "./types"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001"

export async function saveGame(state: FullGameState): Promise<FullGameState> {
  const endpoint = state.gameId
    ? `${API_BASE}/api/save`
    : `${API_BASE}/api/new`

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gameId: state.gameId, gameState: state }),
  })

  if (!res.ok) throw new Error(`Save failed: ${res.status}`)
  const data = await res.json()
  return { ...state, gameId: data.id }
}

export async function loadGame(gameId: string): Promise<FullGameState | null> {
  const res = await fetch(`${API_BASE}/api/load/${encodeURIComponent(gameId)}`)
  if (!res.ok) return null
  const data = await res.json()
  return data.gameState as FullGameState
}
