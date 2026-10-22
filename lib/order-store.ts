import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Order } from "./types";
import { isSupabaseConfigured, supabase } from "./supabase";

interface OrderState {
  orders: Order[];
  isLoading: boolean;
  addOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: Order["payment_status"]
  ) => Promise<void>;
  fetchOrdersFromSupabase: () => Promise<void>;
}

// Initial seed order for immediate testing
const INITIAL_ORDERS: Order[] = [
  {
    id: "d1000000-0000-0000-0000-000000000001",
    order_id: "HRM-20261022-948123",
    customer_name: "Andi Musisi",
    customer_phone: "081234567890",
    customer_address: "Jl. Senopati No. 18, Kebayoran Baru, Jakarta Selatan",
    payment_method: "Midtrans Snap (QRIS / Virtual Account)",
    payment_status: "settlement",
    total_amount: 3890000,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    items: [
      {
        id: "oi-1",
        product_id: "b1000000-0000-0000-0000-000000000002",
        product_name: "Gitar Akustik Yamaha FGX800C Solid Top Cutaway",
        price: 3890000,
        quantity: 1,
        image_url:
          "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80",
      },
    ],
  },
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: INITIAL_ORDERS,
      isLoading: false,

      addOrder: async (order: Order) => {
        // 1. Simpan di local state/localStorage (selalu berfungsi langsung)
        set((state) => ({
          orders: [order, ...state.orders.filter((o) => o.order_id !== order.order_id)],
        }));

        // 2. Jika Supabase terkonfigurasi, simpan juga ke database cloud
        if (isSupabaseConfigured()) {
          try {
            const { data: orderData, error: orderErr } = await supabase
              .from("orders")
              .insert([
                {
                  order_id: order.order_id,
                  customer_name: order.customer_name,
                  customer_phone: order.customer_phone,
                  customer_address: order.customer_address,
                  payment_method: order.payment_method,
                  payment_status: order.payment_status,
                  total_amount: order.total_amount,
                  snap_token: order.snap_token || null,
                  snap_redirect_url: order.snap_redirect_url || null,
                },
              ])
              .select()
              .single();

            if (!orderErr && orderData && order.items.length > 0) {
              const orderItemsPayload = order.items.map((item) => ({
                order_id: orderData.id,
                product_id: (item.product_id && item.product_id.includes("-")) ? item.product_id : null,
                product_name: item.product_name,
                price: item.price,
                quantity: item.quantity,
                image_url: item.image_url,
              }));

              await supabase.from("order_items").insert(orderItemsPayload);
            }
          } catch (err) {
            console.warn("Gagal menyimpan order ke Supabase:", err);
          }
        }
      },

      updateOrderStatus: async (orderId: string, status: Order["payment_status"]) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.order_id === orderId ? { ...o, payment_status: status } : o
          ),
        }));

        if (isSupabaseConfigured()) {
          try {
            await supabase
              .from("orders")
              .update({ payment_status: status })
              .eq("order_id", orderId);
          } catch (err) {
            console.warn("Gagal update status di Supabase:", err);
          }
        }
      },

      fetchOrdersFromSupabase: async () => {
        if (!isSupabaseConfigured()) return;

        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("*, items:order_items(*)")
            .order("created_at", { ascending: false });

          if (!error && data && data.length > 0) {
            const mappedOrders: Order[] = data.map((o: any) => ({
              id: o.id,
              order_id: o.order_id,
              customer_name: o.customer_name,
              customer_phone: o.customer_phone,
              customer_address: o.customer_address,
              payment_method: o.payment_method,
              payment_status: o.payment_status,
              total_amount: Number(o.total_amount),
              snap_token: o.snap_token,
              snap_redirect_url: o.snap_redirect_url,
              created_at: o.created_at,
              items: (o.items || []).map((it: any) => ({
                id: it.id,
                product_id: it.product_id,
                product_name: it.product_name,
                price: Number(it.price),
                quantity: it.quantity,
                image_url: it.image_url,
              })),
            }));

            set({ orders: mappedOrders });
          }
        } catch (err) {
          console.warn("Error fetching orders from Supabase:", err);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "harmonistore-orders-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
