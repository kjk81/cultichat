import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
}));
app.use(express.json({ limit: "5mb" }));

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// POST /api/new - Create a new game
app.post("/api/new", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { gameState } = req.body;
    const { data, error } = await supabase
      .from("games")
      .insert({ game_state: gameState })
      .select("id")
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ id: data.id });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/save - Update existing game
app.post("/api/save", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { gameId, gameState } = req.body;
    if (!gameId) {
      res.status(400).json({ error: "gameId is required" });
      return;
    }
    const { error } = await supabase
      .from("games")
      .update({ game_state: gameState, updated_at: new Date().toISOString() })
      .eq("id", gameId);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ id: gameId, success: true });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/load/:id - Load a game
app.get("/api/load/:id", async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from("games")
      .select("id, game_state, created_at, updated_at")
      .eq("id", id)
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Game not found" });
      return;
    }
    res.json({ id: data.id, gameState: data.game_state });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check
app.get("/api/health", (_req: express.Request, res: express.Response) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
