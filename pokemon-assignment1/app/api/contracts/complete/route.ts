import { connectDB } from "@/lib/db"
import {Contract} from "@/models/Contract"
import {Profile} from "@/models/Profile"
import { verifyToken } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = verifyToken(token)
    if (!user) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const { contractId } = await request.json()
    if (!contractId) return NextResponse.json({ error: "Missing contract ID" }, { status: 400 })

    await connectDB()

    const contract = await Contract.findById(contractId)
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 })

    if (contract.contractorId.toString() !== user.userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    if (contract.status !== "active") {
      return NextResponse.json({ error: "Contract is not active" }, { status: 400 })
    }

    // Deduct amount from client balance
    const clientProfile = await Profile.findOne({ userId: contract.clientId })
    if (!clientProfile || clientProfile.balance < contract.amount) {
      return NextResponse.json({ error: "Client has insufficient balance" }, { status: 400 })
    }

    await clientProfile.save()

    // Update contract status
    contract.status = "completed"
    await contract.save()

    const contractorProfile = await Profile.findOne({ userId: contract.contractorId })

    contractorProfile.balance += contract.amount
    clientProfile.balance -= contract.amount

    await contractorProfile.save()
    await clientProfile.save()

    return NextResponse.json({ success: true, contract })
  } catch (error) {
    console.error("Error completing contract:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
