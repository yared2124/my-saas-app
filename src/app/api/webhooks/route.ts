import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // Example: handle Stripe webhook, etc.
  console.log("Webhook received:", body);

  // You can use the server client with service role key if needed
  // const supabase = createClient(true); // see server.ts below

  return NextResponse.json({ received: true });
}
