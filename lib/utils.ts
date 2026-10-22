/**
 * Format angka ke format mata uang Rupiah Indonesia (Rp)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate slug URL-friendly dari teks
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Ganti spasi dengan -
    .replace(/[^\w\-]+/g, "") // Hapus karakter non-alphanumeric
    .replace(/\-\-+/g, "-") // Ganti multiple - dengan single -
    .replace(/^-+/, "") // Potong - di awal
    .replace(/-+$/, ""); // Potong - di akhir
}
