import "server-only";
import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey) {
  throw new Error("Missing STRIPE_SECRET_KEY. Add it to .env.local — see .env.local.example.");
}

export const stripe = new Stripe(apiKey);
