import { NextResponse } from "next/server";
// @ts-ignore
import midtransClient from "midtrans-client";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim() || "";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.trim() || "";
    const isProduction =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

    const snap = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey,
    });

    const statusResponse = await (snap as any).transaction.notification(body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    let orderStatus: "settlement" | "pending" | "expire" | "cancel" = "pending";

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        orderStatus = "settlement";
      }
    } else if (transactionStatus === "settlement") {
      orderStatus = "settlement";
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      orderStatus = transactionStatus === "expire" ? "expire" : "cancel";
    } else if (transactionStatus === "pending") {
      orderStatus = "pending";
    }

    // Update di database Supabase jika terhubung
    if (isSupabaseConfigured()) {
      await supabase
        .from("orders")
        .update({ payment_status: orderStatus })
        .eq("order_id", orderId);
    }

    return NextResponse.json({ status: "OK", orderStatus });
  } catch (error: any) {
    console.error("Midtrans Notification Error:", error);
    return NextResponse.json(
      { status: "ERROR", message: error.message },
      { status: 500 }
    );
  }
}
