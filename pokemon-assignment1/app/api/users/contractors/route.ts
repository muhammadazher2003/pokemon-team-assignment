// app/api/users/contractors/route.ts
import { connectDB } from "@/lib/db"
import {User} from "@/models/User"
import {Profile} from "@/models/Profile"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    await connectDB()

    const contractors = await Profile.find({ profileType: "contractor" }).populate("userId")

    return NextResponse.json({
      contractors: contractors.map((c) => ({
        id: c.userId._id,
        email: c.email,
        full_name: c.fullName,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch contractors:", error)
    return NextResponse.json({ error: "Failed to fetch contractors" }, { status: 500 })
  }
}
