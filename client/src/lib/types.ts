// using relational id's to avoid circular dependencies (endless depth after JSON stringify)
// eexample of circular dependencies - linking Character in Faction and then Faction in Character
export type EntityId = number;
export type FactionId = number;

export interface Technique {
  name: string
  masteryLevel: number
  description: string
  energyCost: number
}

export interface CultivationLevel {
  name: string
  level: number
}

export interface Faction {
  name: string
  level: number
  description: string
  location: string
}

export interface Entity {
  id: EntityId
  name: string
  age: number
  maxAge: number
  energy: number
  maxEnergy: number
  health: number
  maxHealth: number
  cultivation: CultivationLevel
  physicalDescription: string // looks (e.g. human, tall, brown hair, wears black robes)
  techniques: Technique[]
  items: Item[]
  personality:  string
  satisfaction: number // 0 to 100
  goal: string
  conflict?: string
  status: string
  relationships: Relationship[]
  isPlayer: boolean
  factions?: FactionId[]
}

export interface Relationship {
  targetEntity: EntityId
  bond: number // 0 to 10
  description: string
}

export interface GameState {
  playerId: EntityId
  entities: Record<EntityId, Entity>
  factions?: Record<FactionId, Faction>
  worldDescription: string
  currentAct: Act
  currentScene: Scene
  worldData: {
    year: number
    month: number
    day: number
  }
}

export interface Scene {
  title: string
  text: string
  context: string
}

export interface Act {
  name: string
  outline: string
}

export interface Item {
  quantity: number
  strength: number // 1 - stick, 2 - sword in terms of lethality or potency in terms of pills
  physicalLooks: string
  type: 'Weapon' | 'Consumable' | 'Manual'
  description: string
}

export interface GameInterfaceProps {
  gameState?: GameState
  onPlayerInput?: (input: string) => void
}


export const placeholderGameState: GameState = {
  playerId: 1,
  entities: {
    1: {
      id: 1,
      name: "Li Wei",
      age: 18,
      maxAge: 150,
      energy: 100,
      maxEnergy: 100,
      health: 100,
      maxHealth: 100,
      cultivation: { name: "Foundation Establishment", level: 3 },
      physicalDescription: "A determined cultivator.",
      techniques: [
        { name: "Frost Bite", masteryLevel: 3, description: "Freezes opponents with qi.", energyCost: 10 },
        { name: "Iron Body", masteryLevel: 2, description: "Hardens skin like iron.", energyCost: 15 },
        { name: "Spirit Sight", masteryLevel: 1, description: "Detect spiritual fluctuations.", energyCost: 5 },
      ],
      items: [],
      personality: "Stoic",
      satisfaction: 60,
      goal: "Immortality",
      status: "Content",
      relationships: [],
      isPlayer: true,
    },
  },
  currentAct: { name: "The Crimson Lotus Sect", outline: "The protagonist enters the sect and faces challengers." },
  currentScene: {
    title: "Day One",
    context: "You have just entered the inner sanctum of the sect after passing the disciple trials.",
    text: `The grand hall stretches before you, its ceiling lost in shadow. Pillars of dark jade line the walkway, each carved with <span class="text-yellow-400">ancient cultivation mantras</span> that seem to pulse with inner light.

Elder Shen stands at the far end, his robes billowing despite the still air. His eyes, sharp as broken glass, fix upon you.

<span class="text-red-500">"You dare enter uninvited?"</span> His voice echoes through the chamber like distant thunder.

The pressure of his cultivation base presses down upon you—a mountain of spiritual force that makes each breath a labor. Your <span class="text-yellow-400">Frost Bite technique</span> stirs instinctively, cold qi gathering at your fingertips.

<span class="text-blue-400">[System: Elder Shen's cultivation is at least two major realms above yours. Direct confrontation is not advised.]</span>

To your left, a servant's passage leads deeper into the sect. To your right, the main doors remain slightly ajar—your path of retreat.`,
  },
  worldDescription: "The end and the beginning.",
  worldData: {
    year: 4024,
    month: 1,
    day: 1
  }
}