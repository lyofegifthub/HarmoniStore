import { NextResponse } from "next/server";
// @ts-ignore - midtrans-client does not have strict ts types in some configs
import midtransClient from "midtrans-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, gross_amount, customer_details, item_details } = body;

    const serverKey = process.env.MIDTRANS_SERVER_KEY?.trim() || "";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY?.trim() || "";
    const isProduction =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";

    // Cek apakah kredensial Midtrans sudah diisi di .env.local
    const isConfigured = Boolean(
      serverKey &&
        clientKey &&
        !serverKey.includes("xxxxxx") &&
        serverKey.startsWith("SB-") || serverKey.startsWith("Mid-")
    );

    if (!isConfigured) {
      // Return simulasi token jika belum setup key Midtrans
      return NextResponse.json({
        success: true,
        token: `DEMO-SNAP-${Date.now()}`,
        redirect_url: null,
        isDemo: true,
        message:
          "Midtrans Server Key belum diisi di .env.local. Mode simulasi aktif.",
      });
    }

    // Inisialisasi Midtrans Snap SDK
    const snap = new midtransClient.Snap({
      isProduction,
      serverKey,
      clientKey,
    });

    const parameter = {
      transaction_details: {
        order_id,
        gross_amount: Math.round(Number(gross_amount)),
      },
      customer_details: {
        first_name: customer_details?.first_name || "Pelanggan",
        phone: customer_details?.phone || "",
        billing_address: {
          address: customer_details?.address || "",
        },
        shipping_address: {
          address: customer_details?.address || "",
        },
      },
      item_details: (item_details || []).map((it: any) => ({
        id: it.id?.toString().slice(0, 50) || "item-1",
        price: Math.round(Number(it.price)),
        quantity: Number(it.quantity) || 1,
        name: it.name?.toString().slice(0, 50) || "Produk",
      })),
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/orders`,
      },
    };

    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      token: transaction.token,
      redirect_url: transaction.redirect_url,
      isDemo: false,
    });
  } catch (error: any) {
    console.error("Midtrans Tokenizer Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gagal membuat transaksi Midtrans",
      },
      { status: 500 }
    );
  }
}
