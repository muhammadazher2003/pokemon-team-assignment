import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {generateToken} from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { cookies } from "next/headers";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { email, password, fullName, profileType } = await req.json();

    if (!email || !password || !fullName || !profileType) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    const token = generateToken({ userId: user._id })
            const cookieStore = await cookies();
            cookieStore.set("auth_token", token,
                {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
            }
            );
    const profile = await Profile.create({
      userId: user._id,
      fullName,
      email,
      profileType,
      balance: 100,
    });

    return NextResponse.json({ token, user, profile });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
