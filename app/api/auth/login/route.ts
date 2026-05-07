import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 400 }
      );
    }

    const now = new Date();
    let hasAccess = false;
    let plan = user.subscriptionPlan || user.plan || "none";

    if (plan === "basic") {
      hasAccess = true;
    }
    else if (plan === "monthly") {
      if (user.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > now) {
        hasAccess = true;
      } else if (!user.subscriptionEndsAt) {
        hasAccess = true;
      }
    }
    else if (plan === "yearly") {
      if (user.subscriptionEndsAt && new Date(user.subscriptionEndsAt) > now) {
        hasAccess = true;
      } else if (!user.subscriptionEndsAt) {
        hasAccess = true;
      }
    }
    else if (plan === "trial") {
      if (user.trialEndsAt && new Date(user.trialEndsAt) > now) {
        hasAccess = true;
      }
    }

    if (!hasAccess && user.isPaid === true && user.isBlocked === false) {
      hasAccess = true;
    }

    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        hasAccess: hasAccess,
        plan: plan
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Login success",
      userId: user._id.toString(),
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      hasAccess: hasAccess,
      plan: plan,
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
    console.error("Login error:", (error as Error).message);
    
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}