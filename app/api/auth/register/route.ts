import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

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
    });

    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        hasAccess: true,
        plan: "trial"
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "User created successfully",
      userId: user._id.toString(),
      hasAccess: true,
      plan: "trial",
      trialEndsAt: trialEndsAt,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
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