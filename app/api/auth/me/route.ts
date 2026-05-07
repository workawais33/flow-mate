import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { getUserIdFromCookie } from "@/lib/auth";
import { checkAccess } from "@/lib/checkAccess";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const userId = await getUserIdFromCookie();

    if (!userId) {
      return NextResponse.json(
        { message: "No token", access: false },
        { status: 401 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { message: "User not found", access: false },
        { status: 404 }
      );
    }

    const plan = user.subscriptionPlan || user.plan || "none";

    const access = checkAccess({
      plan: plan,
      subscriptionEndsAt: user.subscriptionEndsAt,
      trialEndsAt: user.trialEndsAt,
      isPaid: user.isPaid,
      isBlocked: user.isBlocked,
    });

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        plan: plan,
        isPaid: user.isPaid,
        isBlocked: user.isBlocked,
      },
      access: access,
      plan: plan,
    });

  } catch (error) {
    console.error("API /me error:", (error as Error).message);
    return NextResponse.json(
      { message: "Server error", access: false },
      { status: 500 }
    );
  }
}