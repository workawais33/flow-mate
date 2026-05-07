import { stripe } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";
import Stripe from "stripe";

interface VerifyBody {
  sessionId: string;
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const { sessionId }: VerifyBody = await req.json();

    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing sessionId" 
      }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing userId in session metadata" 
      }, { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: "User not found" 
      }, { status: 404 });
    }

    if (session.payment_status !== "paid") {
      return NextResponse.json({ 
        success: false, 
        error: "Payment not completed" 
      }, { status: 400 });
    }

    const now = new Date();

    if (plan === "basic") {
      user.isPaid = true;
      user.subscriptionPlan = "basic";
      user.subscriptionStatus = "basic";
      user.isBlocked = false;
      user.trialEndsAt = null;
    } 
    else if (plan === "monthly") {
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(now.getMonth() + 1);
      
      user.isPaid = true;
      user.subscriptionPlan = "monthly";
      user.subscriptionStatus = "active";
      user.subscriptionEndsAt = subscriptionEnd;
      user.isBlocked = false;
      user.trialEndsAt = null;
    } 
    else if (plan === "yearly") {
      const subscriptionEnd = new Date();
      subscriptionEnd.setFullYear(now.getFullYear() + 1);
      
      user.isPaid = true;
      user.subscriptionPlan = "yearly";
      user.subscriptionStatus = "active";
      user.subscriptionEndsAt = subscriptionEnd;
      user.isBlocked = false;
      user.trialEndsAt = null;
    }

    if (session.customer && !user.stripeCustomerId) {
      user.stripeCustomerId = session.customer as string;
    }

    await user.save();

    console.log(` Verify-payment: ${user.email} updated to ${plan} plan`);

    return NextResponse.json({ 
      success: true, 
      plan: plan,
      redirectUrl: "/dashboard"
    });

  } catch (error) {
    console.error("Verify-payment error:", (error as Error).message);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}