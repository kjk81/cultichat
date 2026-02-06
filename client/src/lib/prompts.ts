import type { Entity, GameState, FullGameState } from "./types"

// Compact state serializer - 3B model needs SHORT, structured context
function summarizePlayer(player: Entity): string {
  const techs = player.techniques.map(t => `${t.name}(Lv${t.masteryLevel})`).join(", ")
  return [
    `Name: ${player.name}`,
    `Cultivation: ${player.cultivation.name} Lv${player.cultivation.level}`,
    `HP: ${player.health}/${player.maxHealth} | Energy: ${player.energy}/${player.maxEnergy}`,
    `Mood: ${player.status} | Satisfaction: ${player.satisfaction}/100`,
    `Goal: ${player.goal}`,
    `Techniques: ${techs || "None"}`,
    `Personality: ${player.personality}`,
  ].join("\n")
}

function summarizeCompanions(state: GameState, playerId: number): string {
  const player = state.entities[playerId]
  if (!player.relationships || player.relationships.length === 0) return "No companions yet."
  return player.relationships.map(rel => {
    const entity = state.entities[rel.targetEntity]
    if (!entity) return ""
    return `- ${entity.name} (Bond: ${rel.bond}/10): ${rel.description}`
  }).filter(Boolean).join("\n")
}

// Agent 1: Player Parser + State Checker
function getPlayerParserPrompt(
  state: FullGameState,
  playerInput: string
): { system: string; user: string } {
  const player = state.entities[state.playerId]
  return {
    system: `You are the game engine for a cultivation/xianxia text adventure. Interpret the player's action and determine its effects.

CURRENT STATE:
${summarizePlayer(player)}

CURRENT ACT: "${state.currentAct.name}"
ACT OUTLINE: ${state.currentAct.outline}

CURRENT SCENE: ${state.currentScene.context}

COMPANIONS:
${summarizeCompanions(state, state.playerId)}

RULES:
- Stat changes are integers. Use small values (-5 to +5 for most, -20 to +20 for dramatic events).
- Set actEnded=true ONLY if the player's action resolves the main conflict of the current act.
- nextSceneHint should be 1-2 sentences describing what happens next.
- If the action is impossible given current stats, describe failure in intent.

Respond with ONLY valid JSON, no other text:
{"intent":"<what the player does>","statChanges":{"energy":<int>,"health":<int>,"satisfaction":<int>,"cultivationProgress":<int>},"actEnded":<bool>,"nextSceneHint":"<hint>"}`,
    user: `The player says: "${playerInput}"`
  }
}

// Agent 2: Scene Generator (with emotional depth baked in)
function getSceneGeneratorPrompt(
  state: FullGameState,
  parseResult: { intent: string; nextSceneHint: string }
): { system: string; user: string } {
  const player = state.entities[state.playerId]
  return {
    system: `You are a xianxia novel author writing scenes for a cultivation adventure game. Write immersive, emotionally resonant prose.

STYLE RULES:
- Write 2-4 paragraphs of vivid narrative prose.
- Use HTML: <span class="text-yellow-400"> for cultivation/qi effects, <span class="text-red-500"> for dialogue, <span class="text-blue-400"> for system messages.
- Show character emotions through actions, not just telling.
- End with a moment that invites the player to act next.
- Do NOT include JSON. Write only narrative HTML text.
- Keep it under 200 words.

CHARACTER:
${summarizePlayer(player)}

ACT: "${state.currentAct.name}" - ${state.currentAct.outline}`,
    user: `The player ${parseResult.intent}. ${parseResult.nextSceneHint}\n\nWrite the next scene.`
  }
}

// Agent 3: Act Generator (conditional - runs when act ends)
function getActGeneratorPrompt(
  state: FullGameState
): { system: string; user: string } {
  const player = state.entities[state.playerId]
  return {
    system: `You are a xianxia story architect. Generate the next story act for a cultivation adventure.

PLAYER STATE:
${summarizePlayer(player)}

COMPANIONS:
${summarizeCompanions(state, state.playerId)}

PREVIOUS ACT: "${state.currentAct.name}" - ${state.currentAct.outline}

RULES:
- Create a new act that advances the cultivation journey.
- Include a clear conflict, stakes, and 2-3 key events.
- Optionally introduce or develop a companion.
- Match the act to the player's current cultivation level.
- Keep the outline to 2-3 sentences.

Respond with ONLY valid JSON:
{"name":"<act name>","outline":"<2-3 sentence outline>"}`,
    user: `The previous act has ended. Generate the next act.`
  }
}

export { summarizePlayer, summarizeCompanions, getPlayerParserPrompt, getSceneGeneratorPrompt, getActGeneratorPrompt }
