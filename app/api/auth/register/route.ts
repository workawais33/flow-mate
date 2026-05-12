import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const { name, email, password }: RegisterBody = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Please provide all fields" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const now = new Date();
    const trialEndsAt = new Date();
    trialEndsAt.setDate(now.getDate() + 7);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isPaid: false,
      isBlocked: false,
      subscriptionPlan: "trial",
      subscriptionStatus: "trial",
      trialStart: now,
      trialEndsAt: trialEndsAt,
      emailVerified: false,
      verificationToken: verificationToken,
      verificationTokenExpires: verificationTokenExpires,
    });

    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      userId: user._id.toString(),
      token: verificationToken,
    });

    const response = NextResponse.json({
      message: "Registration successful! Please check your email to verify your account.",
      userId: user._id.toString(),
    });

    return response;

  } catch (error) {
    console.error("Register error:", (error as Error).message);
    return NextResponse.json(
      {
        message: "Error creating user",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}