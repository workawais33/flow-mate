import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

interface CheckoutBody {
  userId: string;
  plan: "basic" | "monthly" | "yearly";
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    console.log(" RAW REQUEST BODY:", rawBody);
    
    const { userId, plan }: CheckoutBody = JSON.parse(rawBody);
    console.log("PARSED userId:", userId, "plan:", plan);

    if (!userId || !plan) {
      console.log(" Missing userId or plan. userId:", userId, "plan:", plan);
      return NextResponse.json(
        { error: "Missing userId or plan" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let priceId: string | undefined;
    let mode: "payment" | "subscription" = "payment";

    if (plan === "basic") {
      priceId = process.env.STRIPE_BASIC_PRICE as string;
      mode = "payment";
      
      if (!priceId) {
        throw new Error("STRIPE_BASIC_PRICE is not configured");
      }
    } 
    else if (plan === "monthly") {
      priceId = process.env.STRIPE_MONTHLY_PRICE as string;
      mode = "subscription";
      
      if (!priceId) {
        throw new Error("STRIPE_MONTHLY_PRICE is not configured");
      }
    } 
    else if (plan === "yearly") {
      priceId = process.env.STRIPE_YEARLY_PRICE as string;
      mode = "subscription";
      
      if (!priceId) {
        throw new Error("STRIPE_YEARLY_PRICE is not configured");
      }
    } 
    else {
      return NextResponse.json(
        { error: "Invalid plan selected. Use: basic, monthly, or yearly" },
        { status: 400 }
      );
    }

    const sessionParams: any = {
      payment_method_types: ["card"],
      mode,
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user._id.toString(),
        plan,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    };

    if (mode === "payment") {
      sessionParams.invoice_creation = {
        enabled: true,
      };
    }

    console.log(`Creating Stripe checkout session for user: ${userId}, plan: ${plan}, mode: ${mode}`);

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`Session created successfully: ${session.id}`);

    return NextResponse.json({ url: session.url });

  } catch (error) {
    const err = error as Error & { type?: string; statusCode?: number };
    
    console.error("Stripe checkout error details:", {
      message: err.message,
      stack: err.stack,
      type: err.type,
      statusCode: err.statusCode,
    });

    let errorMessage = "Failed to create checkout session";
    let statusCode = 500;

    if (err.message.includes("No such price")) {
      errorMessage = "Invalid price ID. Please check your Stripe configuration.";
      statusCode = 400;
    } else if (err.message.includes("timeout")) {
      errorMessage = "Request timed out. Please try again.";
      statusCode = 504;
    } else if (err.message.includes("Missing userId")) {
      errorMessage = err.message;
      statusCode = 400;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}