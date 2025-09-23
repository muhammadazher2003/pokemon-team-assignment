import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, required: true },
    name: { type: String, required: true },
    pokemons: { type: Array, default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "pokemonteams" }
);

export const PokemonTeam =
  mongoose.models.PokemonTeam || mongoose.model("PokemonTeam", teamSchema);