import { connectDB } from "@/lib/db"
import {Contract} from "@/models/Contract"
import { verifyToken } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    await connectDB()
    const token = req.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token!)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const contracts = await Contract.find({
      $or: [{ clientId: user.userId }, { contractorId: user.userId }],
    }).populate("clientId contractorId")

    return NextResponse.json({ contracts })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
