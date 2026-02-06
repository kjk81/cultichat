
function getActOutlinerPrompt() {
    // receives player info, world description, current status
}

function getWorldIntegratorPrompt() {
    // receives player info, items, relationships, factions, world factions 

    // ensures act outline matches world info, revising where necessary for world accuracy
}

function getActEmotionifierPrompt() {
    // receives player info, relationships
    // revises act outline for perceived emotional growth for all characters, finalizes into JSON format
}

function getSceneGeneratorPrompt() {
    // receives currentScene (title, text, context)
    
}

export {getActOutlinerPrompt, getWorldIntegratorPrompt, getActEmotionifierPrompt, getSceneGeneratorPrompt}