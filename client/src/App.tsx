import { GameInterface } from "@/components/GameInterface"

function App() {
  const handlePlayerInput = (input: string) => {
    console.log("Player input:", input)
    // WebLLM integration will be added here
  }

  return <GameInterface onPlayerInput={handlePlayerInput} />
}

export default App
