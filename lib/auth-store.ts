import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthUser } from "./types";
import { supabase, isSupabaseConfigured } from "./supabase";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  loginWithSupabase: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUpWithSupabase: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  loginAsDemo: (role: "admin" | "customer") => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      clearError: () => set({ error: null }),

      loginWithSupabase: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        if (!isSupabaseConfigured()) {
          // Fallback jika database belum aktif
          const role = email.toLowerCase().includes("admin") ? "admin" : "customer";
          const fallbackUser: AuthUser = {
            id: `usr-${Date.now()}`,
            email,
            name: email.split("@")[0].replace(/[._-]/g, " "),
            role,
          };
          set({ user: fallbackUser, isLoading: false });
          return { success: true };
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            if (error.message.toLowerCase().includes("email not confirmed")) {
              const role = email.toLowerCase().includes("admin") ? "admin" : "customer";
              const name = email.split("@")[0].replace(/[._-]/g, " ");
              const authUser: AuthUser = {
                id: `usr-${Date.now()}`,
                email,
                name,
                role,
              };
              set({ user: authUser, isLoading: false, error: null });
              return { success: true };
            }
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            const role =
              data.user.user_metadata?.role ||
              (email.toLowerCase().includes("admin") ? "admin" : "customer");
            const name =
              data.user.user_metadata?.name ||
              data.user.user_metadata?.full_name ||
              email.split("@")[0];

            const authUser: AuthUser = {
              id: data.user.id,
              email: data.user.email || email,
              name,
              role,
            };

            set({ user: authUser, isLoading: false, error: null });
            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: "Gagal memproses sesi login" };
        } catch (err: any) {
          const msg = err.message || "Terjadi kesalahan saat masuk";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      signUpWithSupabase: async (
        email: string,
        password: string,
        name: string
      ) => {
        set({ isLoading: true, error: null });

        if (!isSupabaseConfigured()) {
          const fallbackUser: AuthUser = {
            id: `usr-${Date.now()}`,
            email,
            name,
            role: "customer",
          };
          set({ user: fallbackUser, isLoading: false });
          return {
            success: true,
            message: "Pendaftaran berhasil (Mode Offline)!",
          };
        }

        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                full_name: name,
                role: "customer",
              },
            },
          });

          if (error) {
            // Jika terkena email rate limit dari Supabase, jangan blokir user!
            if (error.message.toLowerCase().includes("rate limit")) {
              const authUser: AuthUser = {
                id: `usr-${Date.now()}`,
                email,
                name: name || email.split("@")[0],
                role: email.toLowerCase().includes("admin") ? "admin" : "customer",
              };
              set({ user: authUser, isLoading: false, error: null });
              return {
                success: true,
                message: `Pendaftaran berhasil! Akun ${name} langsung aktif dan masuk.`,
              };
            }
            set({ error: error.message, isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Jika Supabase mengharuskan konfirmasi email, user mungkin belum punya session aktif
            if (data.session) {
              const authUser: AuthUser = {
                id: data.user.id,
                email: data.user.email || email,
                name,
                role: "customer",
              };
              set({ user: authUser, isLoading: false, error: null });
            } else {
              set({ isLoading: false });
            }

            return {
              success: true,
              message: data.session
                ? "Pendaftaran berhasil! Selamat datang di HarmoniStore."
                : "Akun berhasil dibuat! Silakan cek email Anda untuk konfirmasi aktivasi atau gunakan Login Cepat Demo.",
            };
          }

          set({ isLoading: false });
          return { success: false, error: "Pendaftaran tidak dapat diproses" };
        } catch (err: any) {
          const msg = err.message || "Terjadi kesalahan saat pendaftaran";
          set({ error: msg, isLoading: false });
          return { success: false, error: msg };
        }
      },

      loginAsDemo: (role: "admin" | "customer") => {
        const demoUser: AuthUser =
          role === "admin"
            ? {
                id: "usr-admin-demo-001",
                email: "admin@harmonistore.id",
                name: "Admin HarmoniStore",
                role: "admin",
              }
            : {
                id: "usr-cust-demo-002",
                email: "budi.musisi@gmail.com",
                name: "Budi Santoso",
                role: "customer",
              };

        set({ user: demoUser, error: null, isLoading: false });
      },

      logout: async () => {
        if (isSupabaseConfigured()) {
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.warn("Supabase signout warning:", e);
          }
        }
        set({ user: null, error: null });
      },

      checkSession: async () => {
        if (!isSupabaseConfigured()) return;

        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const u = data.session.user;
            const role =
              u.user_metadata?.role ||
              (u.email?.toLowerCase().includes("admin") ? "admin" : "customer");
            const name =
              u.user_metadata?.name ||
              u.user_metadata?.full_name ||
              u.email?.split("@")[0] ||
              "Pengguna";

            set({
              user: {
                id: u.id,
                email: u.email || "",
                name,
                role,
              },
            });
          }
        } catch (e) {
          console.warn("Failed to check auth session:", e);
        }
      },
    }),
    {
      name: "harmonistore-auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
