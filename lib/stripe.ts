import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY as string;

if (!secretKey) {
  throw new Error("Please define STRIPE_SECRET_KEY in .env.local");
}

export const stripe = new Stripe(secretKey, {
  apiVersion: "2024-06-20",
});