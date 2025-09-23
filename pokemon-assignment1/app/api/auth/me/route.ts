import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/db"
import {User} from "@/models/User"
import {Profile} from "@/models/Profile"

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(decoded.userId).select("-password")
    const profile = await Profile.findOne({ userId: decoded.userId })

    if (!user || !profile) {
        console.log(decoded)
        console.log(user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      _id: user._id,
      email: user.email,
      profile: {
        _id: profile._id,
        fullName: profile.fullName,
        profileType: profile.profileType,
        balance: profile.balance,
      },
    })
  } catch (err) {
    console.error("GET /api/auth/me error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
