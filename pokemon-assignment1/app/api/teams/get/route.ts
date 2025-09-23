import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/db"
import { verifyToken } from "@/lib/auth"
import { PokemonTeam } from "@/models/PokemonTeam"
import mongoose from "mongoose"

// const teamSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Types.ObjectId, required: true },
//     name: { type: String, required: true },
//     pokemons: { type: Array, default: [] },
//   },
//   { collection: "pokemonteams" }
// )

// const PokemonTeam = mongoose.models.PokemonTeam || mongoose.model("PokemonTeam", teamSchema)

export async function GET(req: NextRequest) {
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

    const teams = await PokemonTeam.find({ userId: decoded.userId })

    return NextResponse.json({ teams })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
