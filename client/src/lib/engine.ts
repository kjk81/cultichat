import type {WebWorkerMLCEngine} from "@mlc-ai/web-llm"
import type {EntityId, Entity} from "./types"
import { getActOutlinerPrompt } from "./prompts"

function buildAct(engine: WebWorkerMLCEngine, gameInfo: Entity): string {
    const roughOutline =  getActOutlinerPrompt();
}

function buildActOutlinerPrompt() {
    // pull one 

}

function generateActOutline(): string {
    
}

function getPlayerInfo() {
    // receives player info from game state
}

function getRelationshipInfo(entity: EntityId) {
    // polls db
}