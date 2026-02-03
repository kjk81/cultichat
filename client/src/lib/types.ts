// Types for the game state
export interface Technique {
  name: string
  level: number
}

export interface GameState {
  characterName: string
  cultivationLevel: string
  happiness: string
  currentAct: number
  actName: string
  techniques: Technique[]
  lastSceneContext: string
  situationText: string
}

export interface GameInterfaceProps {
  gameState?: GameState
  onPlayerInput?: (input: string) => void
}

export const placeholderGameState: GameState = {
  characterName: "Li Wei",
  cultivationLevel: "Foundation Establishment (Stage 3)",
  happiness: "Content",
  currentAct: 3,
  actName: "The Crimson Lotus Sect",
  techniques: [
    { name: "Frost Bite", level: 3 },
    { name: "Iron Body", level: 2 },
    { name: "Spirit Sight", level: 1 },
  ],
  lastSceneContext:
    "You have just entered the inner sanctum of the sect after passing the disciple trials.",
  situationText: `The grand hall stretches before you, its ceiling lost in shadow. Pillars of dark jade line the walkway, each carved with <span class="text-yellow-400">ancient cultivation mantras</span> that seem to pulse with inner light.

Elder Shen stands at the far end, his robes billowing despite the still air. His eyes, sharp as broken glass, fix upon you.

<span class="text-red-500">"You dare enter uninvited?"</span> His voice echoes through the chamber like distant thunder.

The pressure of his cultivation base presses down upon you—a mountain of spiritual force that makes each breath a labor. Your <span class="text-yellow-400">Frost Bite technique</span> stirs instinctively, cold qi gathering at your fingertips.

<span class="text-blue-400">[System: Elder Shen's cultivation is at least two major realms above yours. Direct confrontation is not advised.]</span>

To your left, a servant's passage leads deeper into the sect. To your right, the main doors remain slightly ajar—your path of retreat.`,
}