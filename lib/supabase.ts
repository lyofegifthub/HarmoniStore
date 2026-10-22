import { createClient } from "@supabase/supabase-js";
import { Category, Product } from "./types";
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from "./mock-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || "";

// Check if credentials look valid (not empty and not placeholder)
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.startsWith("http") &&
      !supabaseUrl.includes("your-project-id")
  );
};

// Initialize Supabase client if configured, otherwise create a dummy/null client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient("https://placeholder.supabase.co", "placeholder-anon-key");

// In-memory fallback state for testing before Supabase connection
let localCategories: Category[] = [...INITIAL_CATEGORIES];
let localProducts: Product[] = [...INITIAL_PRODUCTS];

// ----------------- SERVICE HELPER FUNCTIONS -----------------

export async function fetchCategories(): Promise<{
  data: Category[];
  isLive: boolean;
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.warn("Supabase fetchCategories error, using fallback:", error.message);
        return { data: localCategories, isLive: false, error: error.message };
      }
      return { data: (data as Category[]) || [], isLive: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { data: localCategories, isLive: false, error: msg };
    }
  }

  return { data: localCategories, isLive: false };
}

export async function fetchProducts(options?: {
  categorySlug?: string;
  searchQuery?: string;
}): Promise<{
  data: Product[];
  isLive: boolean;
  error?: string;
}> {
  const { categorySlug, searchQuery } = options || {};

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from("products")
        .select("*, category:categories(*)")
        .order("created_at", { ascending: false });

      if (searchQuery && searchQuery.trim()) {
        query = query.ilike("name", `%${searchQuery.trim()}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.warn("Supabase fetchProducts error, using fallback:", error.message);
        return filterLocalProducts(categorySlug, searchQuery, error.message);
      }

      let products = (data as Product[]) || [];
      if (categorySlug && categorySlug !== "all") {
        products = products.filter(
          (p) => p.category?.slug === categorySlug || p.category_id === categorySlug
        );
      }

      return { data: products, isLive: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return filterLocalProducts(categorySlug, searchQuery, msg);
    }
  }

  return filterLocalProducts(categorySlug, searchQuery);
}

function filterLocalProducts(
  categorySlug?: string,
  searchQuery?: string,
  errorMsg?: string
): { data: Product[]; isLive: boolean; error?: string } {
  let list = [...localProducts];

  if (categorySlug && categorySlug !== "all") {
    list = list.filter(
      (p) => p.category?.slug === categorySlug || p.category_id === categorySlug
    );
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  return { data: list, isLive: false, error: errorMsg };
}

export async function fetchProductBySlug(slug: string): Promise<{
  data: Product | null;
  isLive: boolean;
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("slug", slug)
        .single();

      if (error) {
        const local = localProducts.find((p) => p.slug === slug) || null;
        return { data: local, isLive: false, error: error.message };
      }
      return { data: data as Product, isLive: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const local = localProducts.find((p) => p.slug === slug) || null;
      return { data: local, isLive: false, error: msg };
    }
  }

  const local = localProducts.find((p) => p.slug === slug) || null;
  return { data: local, isLive: false };
}

// ----------------- ADMIN CRUD FUNCTIONS -----------------

export async function createProduct(productData: {
  name: string;
  slug: string;
  category_id: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  is_available: boolean;
}): Promise<{ success: boolean; data?: Product; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select("*, category:categories(*)")
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Product };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menambahkan produk ke Supabase",
      };
    }
  }

  // Fallback local addition
  const matchedCategory = localCategories.find((c) => c.id === productData.category_id);
  const newProduct: Product = {
    ...productData,
    id: `p-${Date.now()}`,
    created_at: new Date().toISOString(),
    category: matchedCategory,
  };
  localProducts = [newProduct, ...localProducts];
  return { success: true, data: newProduct };
}

export async function updateProduct(
  id: string,
  updates: Partial<Product>
): Promise<{ success: boolean; data?: Product; error?: string }> {
  // Clean up object so we don't send computed category object to supabase
  const cleanUpdates = { ...updates };
  delete cleanUpdates.category;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("products")
        .update(cleanUpdates)
        .eq("id", id)
        .select("*, category:categories(*)")
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Product };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal mengupdate produk di Supabase",
      };
    }
  }

  // Fallback local update
  const index = localProducts.findIndex((p) => p.id === id);
  if (index !== -1) {
    const category = updates.category_id
      ? localCategories.find((c) => c.id === updates.category_id)
      : localProducts[index].category;

    localProducts[index] = {
      ...localProducts[index],
      ...updates,
      category,
    };
    return { success: true, data: localProducts[index] };
  }
  return { success: false, error: "Produk tidak ditemukan" };
}

export async function deleteProduct(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menghapus produk dari Supabase",
      };
    }
  }

  localProducts = localProducts.filter((p) => p.id !== id);
  return { success: true };
}

export async function createCategory(categoryData: {
  name: string;
  slug: string;
}): Promise<{ success: boolean; data?: Category; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([categoryData])
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: data as Category };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menambahkan kategori",
      };
    }
  }

  const newCat: Category = {
    ...categoryData,
    id: `c-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  localCategories = [...localCategories, newCat];
  return { success: true, data: newCat };
}

export async function deleteCategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Gagal menghapus kategori",
      };
    }
  }

  localCategories = localCategories.filter((c) => c.id !== id);
  return { success: true };
}
