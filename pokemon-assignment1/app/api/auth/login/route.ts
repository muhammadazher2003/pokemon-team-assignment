import { NextRequest, NextResponse } from "next/server";
// import jwt from "jsonwebtoken";
import {generateToken} from "@/lib/auth";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { cookies } from "next/headers";
import { User } from "@/models/User";
import { Profile } from "@/models/Profile";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

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
        const profile = await Profile.findOne({ userId: user._id });

        return NextResponse.json({ token, user, profile });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
