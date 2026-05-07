import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import Stripe from "stripe";

export async function POST(req: Request) {
  console.log(" Webhook received");
  try {
    await connectDB();
    const body = await req.text();
    
    const headersList = await headers();
    const sig = headersList.get("stripe-signature");

    if (!sig) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan;

      if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (plan === "basic") {
        user.subscriptionPlan = "basic";
        user.subscriptionStatus = "active";
        user.isPaid = true;
        user.isBlocked = false;
        user.trialEndsAt = null;
      } else if (plan === "monthly") {
        user.subscriptionPlan = "monthly";
        user.subscriptionStatus = "active";
        user.isPaid = true;
        user.isBlocked = false;
        user.trialEndsAt = null;
        user.subscriptionEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      } else if (plan === "yearly") {
        user.subscriptionPlan = "yearly";
        user.subscriptionStatus = "active";
        user.isPaid = true;
        user.isBlocked = false;
        user.trialEndsAt = null;
        user.subscriptionEndsAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      } else {
        console.log(`Unknown plan: ${plan}`);
      }

      // ✅ FIXED: session.customer can be object or string
      user.stripeCustomerId = typeof session.customer === 'string' ? session.customer : null;
      if (session.subscription) user.stripeSubscriptionId = session.subscription as string;

      await user.save();
      console.log(` Updated user ${user.email} to ${user.subscriptionPlan}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", (error as Error).message);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}