import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { PokemonTeam } from '@/models/PokemonTeam'
import mongoose from "mongoose"

// const teamSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Types.ObjectId, required: true },
//     name: { type: String, required: true },
//     pokemons: { type: Array, default: [] },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
//   },
//   { collection: "pokemonteams" }
// )

// const PokemonTeam = mongoose.models.PokemonTeam || mongoose.model("PokemonTeam", teamSchema)

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.slice(7)
    const decoded = verifyToken(token)
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 })
    }

    const { teams } = await req.json() // now expecting: { teams: [{ name, pokemons }, ...] }

    if (!Array.isArray(teams)) {
      return NextResponse.json({ error: "Invalid team list" }, { status: 400 })
    }

    // Clear old teams
    await PokemonTeam.deleteMany({ userId: decoded.userId })

    // Insert new teams
    const newTeams = teams.map((team) => ({
      userId: new mongoose.Types.ObjectId(decoded.userId),
      name: team.name,
      pokemons: team.pokemons,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    await PokemonTeam.insertMany(newTeams)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
