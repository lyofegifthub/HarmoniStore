export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  is_available: boolean;
  created_at?: string;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  product_id?: string;
  product_name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
}

export interface Order {
  id?: string;
  order_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  payment_method: string;
  payment_status: "settlement" | "pending" | "expire" | "cancel";
  total_amount: number;
  snap_token?: string;
  snap_redirect_url?: string;
  items: OrderItem[];
  created_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  avatar_url?: string;
}
