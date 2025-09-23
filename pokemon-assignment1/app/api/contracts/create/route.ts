import { connectDB } from "@/lib/db"
import {Contract} from "@/models/Contract"
import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    await connectDB()
    const token = req.headers.get("authorization")?.split(" ")[1]
    const user = verifyToken(token!)
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { contractorId, title, description, amount } = await req.json()

    const newContract = await Contract.create({
      clientId: user.userId,
      contractorId,
      title,
      description,
      amount,
    })

    return NextResponse.json({ success: true, contract: newContract })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
