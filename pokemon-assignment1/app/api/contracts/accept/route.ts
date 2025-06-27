// /app/api/contracts/accept/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {Contract} from "@/models/Contract";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { contractId } = body;

    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = verifyToken(token);
    const userId = decoded.userId;

    const contract = await Contract.findById(contractId);
    if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

    if (contract.status !== "pending") {
      return NextResponse.json({ error: "Contract already processed" }, { status: 400 });
    }

    if (contract.contractorId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden: Not your contract" }, { status: 403 });
    }

    contract.status = "active";
    await contract.save();

    return NextResponse.json({ success: true, contract });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
