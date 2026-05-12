import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId, token } = await req.json();

    if (!userId || !token) {
      return NextResponse.json(
        { message: "Missing userId or token" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 400 }
      );
    }

    if (user.verificationToken !== token) {
      return NextResponse.json(
        { message: "Invalid verification token" },
        { status: 400 }
      );
    }

    if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
      return NextResponse.json(
        { message: "Verification token expired. Please register again." },
        { status: 400 }
      );
    }

    // Mark email as verified
    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();

    // Create JWT token and login user
    const hasAccess = true; // Trial users have access
    const plan = "trial";
    
    const jwtToken = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        hasAccess: hasAccess,
        plan: plan
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Send welcome email
    await sendWelcomeEmail(user.email, user.name);

    const response = NextResponse.json({
      message: "Email verified successfully!",
      success: true,
    });

    response.cookies.set("token", jwtToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}