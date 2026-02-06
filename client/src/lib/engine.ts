import type { MLCEngineInterface } from "@mlc-ai/web-llm"
import type {
  FullGameState,
  ParseResult,
  StatChanges,
  Scene,
  Act,
  NarrativeEntry,
  EngineStatus,
} from "./types"
import {
  getPlayerParserPrompt,
  getSceneGeneratorPrompt,
  getActGeneratorPrompt,
} from "./prompts"

async function llmCall(
  engine: MLCEngineInterface,
  system: string,
  user: string
): Promise<string> {
  const response = await engine.chat.completions.create({
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
    max_tokens: 512,
  })
  return response.choices[0]?.message?.content ?? ""
}

// 3B models often wrap JSON in code blocks or add preamble text.
// Three fallback strategies to extract valid JSON.
function extractJSON<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch { /* noop */ }

  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim()) as T
    } catch { /* noop */ }
  }

  const firstBrace = raw.indexOf("{")
  const lastBrace = raw.lastIndexOf("}")
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(raw.substring(firstBrace, lastBrace + 1)) as T
    } catch { /* noop */ }
  }

  return null
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

function applyStatChanges(state: FullGameState, changes: StatChanges): FullGameState {
  const newState = structuredClone(state)
  const player = newState.entities[newState.playerId]

  if (changes.energy) {
    player.energy = clamp(player.energy + changes.energy, 0, player.maxEnergy)
  }
  if (changes.health) {
    player.health = clamp(player.health + changes.health, 0, player.maxHealth)
  }
  if (changes.satisfaction) {
    player.satisfaction = clamp(player.satisfaction + changes.satisfaction, 0, 100)
  }
  if (changes.cultivationProgress && changes.cultivationProgress > 0) {
    player.cultivation.level += changes.cultivationProgress
    const stageNames = [
      "Qi Condensation", "Foundation Establishment", "Core Formation",
      "Nascent Soul", "Spirit Severing", "Dao Seeking", "Immortal Ascension"
    ]
    const stageIndex = Math.min(Math.floor(player.cultivation.level / 10), stageNames.length - 1)
    player.cultivation.name = stageNames[stageIndex]
  }
  if (changes.newTechnique) {
    player.techniques.push(changes.newTechnique)
  }
  if (changes.relationshipChanges) {
    for (const rc of changes.relationshipChanges) {
      const rel = player.relationships.find(r => r.targetEntity === rc.targetId)
      if (rel) {
        rel.bond = clamp(rel.bond + rc.bondDelta, 0, 10)
      }
    }
  }

  return newState
}

function defaultParseResult(playerInput: string): ParseResult {
  return {
    intent: playerInput,
    statChanges: { energy: -2 },
    actEnded: false,
    nextSceneHint: `The player attempts to ${playerInput}.`,
  }
}

// Clamp stat deltas to prevent 3B model from outputting extreme values
function sanitizeStatChanges(changes: StatChanges): StatChanges {
  return {
    ...changes,
    energy: changes.energy ? clamp(changes.energy, -20, 20) : undefined,
    health: changes.health ? clamp(changes.health, -20, 20) : undefined,
    satisfaction: changes.satisfaction ? clamp(changes.satisfaction, -20, 20) : undefined,
    cultivationProgress: changes.cultivationProgress ? clamp(changes.cultivationProgress, 0, 5) : undefined,
  }
}

export async function processPlayerTurn(
  engine: MLCEngineInterface,
  state: FullGameState,
  playerInput: string,
  onStatusChange: (status: EngineStatus) => void
): Promise<FullGameState> {
  let currentState = structuredClone(state)

  // Step 1: Parse player action
  onStatusChange("parsing")
  const parserPrompt = getPlayerParserPrompt(currentState, playerInput)
  const parserRaw = await llmCall(engine, parserPrompt.system, parserPrompt.user)
  const rawResult = extractJSON<ParseResult>(parserRaw)
  const parseResult = rawResult
    ? { ...rawResult, statChanges: sanitizeStatChanges(rawResult.statChanges) }
    : defaultParseResult(playerInput)

  // Apply stat changes
  currentState = applyStatChanges(currentState, parseResult.statChanges)

  // Step 3 (conditional): Generate new act if act ended
  if (parseResult.actEnded) {
    onStatusChange("generating-act")
    const actPrompt = getActGeneratorPrompt(currentState)
    const actRaw = await llmCall(engine, actPrompt.system, actPrompt.user)
    const newAct = extractJSON<Act>(actRaw)
    if (newAct && newAct.name && newAct.outline) {
      currentState.currentAct = newAct
    }
  }

  // Step 2: Generate scene
  onStatusChange("generating-scene")
  const scenePrompt = getSceneGeneratorPrompt(currentState, {
    intent: parseResult.intent,
    nextSceneHint: parseResult.nextSceneHint,
  })
  const sceneRaw = await llmCall(engine, scenePrompt.system, scenePrompt.user)

  const newScene: Scene = {
    title: currentState.currentAct.name,
    text: sceneRaw.trim(),
    context: parseResult.nextSceneHint,
  }
  currentState.currentScene = newScene

  // Add to narrative history
  const entry: NarrativeEntry = {
    sceneTitle: newScene.title,
    text: newScene.text,
    playerInput,
    timestamp: Date.now(),
  }
  currentState.narrativeHistory = [...currentState.narrativeHistory, entry]

  // Advance world time
  currentState.worldData.day += 1
  if (currentState.worldData.day > 30) {
    currentState.worldData.day = 1
    currentState.worldData.month += 1
    if (currentState.worldData.month > 12) {
      currentState.worldData.month = 1
      currentState.worldData.year += 1
    }
  }

  onStatusChange("idle")
  return currentState
}

export function createNewGame(): FullGameState {
  return {
    playerId: 1,
    entities: {
      1: {
        id: 1,
        name: "Li Wei",
        age: 16,
        maxAge: 150,
        energy: 100,
        maxEnergy: 100,
        health: 100,
        maxHealth: 100,
        cultivation: { name: "Qi Condensation", level: 1 },
        physicalDescription: "A young man with sharp eyes and calloused hands from years of labor.",
        techniques: [],
        items: [],
        personality: "Determined and curious, with a hidden fierce streak.",
        satisfaction: 50,
        goal: "Rise beyond mortal limits and uncover the truth behind my parents' disappearance.",
        status: "Eager",
        relationships: [],
        isPlayer: true,
      },
    },
    worldDescription: "A world where cultivation determines one's fate. Sects war for resources, and the path to immortality is paved with tribulation.",
    currentAct: {
      name: "The Awakening",
      outline: "Li Wei discovers a fragment of a cultivation manual in a collapsed mine. He begins his journey by finding a sect willing to accept a commoner. He must pass an entrance trial while hiding his unusual affinity.",
    },
    currentScene: {
      title: "The Awakening",
      context: "You stand at the foot of Azure Peak, where the Crimson Lotus Sect accepts new disciples once a year.",
      text: `Dawn breaks over <span class="text-yellow-400">Azure Peak</span>, painting the mountain in shades of amber and gold. The path upward is carved from living stone, each step worn smooth by generations of hopeful cultivators.

You clutch the torn fragment of the manual you found in the mine collapse three days ago. The characters shimmer faintly when you focus, as if responding to something within you.

Ahead, a long line of young men and women stretches toward the sect gates. Some wear fine silks. Others, like you, wear the rough cloth of commoners. A disciple in crimson robes watches from above, her gaze sweeping the crowd like a hawk surveying prey.

<span class="text-blue-400">[The Crimson Lotus Sect entrance trials begin at noon. You have arrived early. The atmosphere is tense with ambition and fear.]</span>`,
    },
    worldData: { year: 4024, month: 3, day: 1 },
    narrativeHistory: [],
  }
}
