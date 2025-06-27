import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    nameOfTeam: String,
    pokemons: [Object],
  },
  { timestamps: true }
);

export const PokemonTeam = mongoose.models.PokemonTeam || mongoose.model("PokemonTeam", teamSchema);
