-- ========================================================
-- HARMONISTORE - DATABASE SCHEMA LENGKAP & SEED DATA
-- Framework: Next.js + Supabase + Midtrans Payment Gateway
-- File: schema.sql
-- ========================================================

-- 1. DROP EXISTING TABLES (IF ANY)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 2. CREATE TABLE: categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE TABLE: products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE TABLE: orders (Riwayat Belanja / Pesanan)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'midtrans',
    payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'settlement', 'expire', 'cancel'
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    snap_token TEXT,
    snap_redirect_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE TABLE: order_items (Detail Barang per Pesanan)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. CONFIGURE ROW LEVEL SECURITY (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy untuk categories
DROP POLICY IF EXISTS "Public full access to categories" ON categories;
CREATE POLICY "Public full access to categories" ON categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Policy untuk products
DROP POLICY IF EXISTS "Public full access to products" ON products;
CREATE POLICY "Public full access to products" ON products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Policy untuk orders
DROP POLICY IF EXISTS "Public full access to orders" ON orders;
CREATE POLICY "Public full access to orders" ON orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Policy untuk order_items
DROP POLICY IF EXISTS "Public full access to order_items" ON order_items;
CREATE POLICY "Public full access to order_items" ON order_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 7. SEED DATA DUMMY: KATEGORI ALAT MUSIK
INSERT INTO categories (id, name, slug) VALUES
('c1000000-0000-0000-0000-000000000001', 'Gitar & Bass', 'gitar-bass'),
('c1000000-0000-0000-0000-000000000002', 'Keyboard & Piano Digital', 'keyboard-piano'),
('c1000000-0000-0000-0000-000000000003', 'Drum & Perkusi', 'drum-perkusi'),
('c1000000-0000-0000-0000-000000000004', 'Audio Studio & Aksesoris', 'audio-aksesoris');

-- 8. SEED DATA DUMMY: PRODUK ALAT MUSIK RESMI
INSERT INTO products (id, category_id, name, slug, description, price, stock, image_url, is_available) VALUES
(
    'b1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Gitar Elektrik Fender Player Stratocaster',
    'fender-player-stratocaster',
    'Gitar elektrik legendaris dengan bodi alder pilihan, neck maple profil modern C, 3 pickup single-coil Player Series, tremolo 2-point, dan karakter tone vintage khas Fender yang jernih, renyah, dan serbaguna.',
    11850000,
    8,
    'https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format&fit=crop&q=80',
    true
),
(
    'b1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'Gitar Akustik Yamaha FGX800C Solid Top Cutaway',
    'yamaha-fgx800c-solid-top',
    'Gitar akustik-elektrik solid spruce top dengan preamp System66 dan pickup under-saddle piezo Yamaha. Menghasilkan resonansi kayu alami yang kaya dan sustain panjang saat dicolokkan ke amplifier atau PA panggung.',
    3890000,
    15,
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80',
    true
),
(
    'b1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000002',
    'Piano Digital Yamaha P-125B 88-Key Graded Hammer',
    'yamaha-p125b-digital-piano',
    'Piano digital portabel 88 tuts berbobot Graded Hammer Standard (GHS) yang presisi menyerupai piano akustik konser, mesin suara Pure CF, polifoni 192 not, serta konektivitas USB audio & MIDI.',
    8950000,
    6,
    'https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&auto=format&fit=crop&q=80',
    true
),
(
    'b1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000002',
    'Synthesizer Keyboard Roland JUNO-DS61',
    'roland-juno-ds61-synthesizer',
    'Synthesizer panggung profesional dengan bobot ringan 61 tuts velocity-sensitive, lebih dari seribu suara instrumen berkualitas tinggi, slot ekspansi gelombang, 8 phrase pad, dan input mic dengan efek vokal bawaan.',
    10450000,
    5,
    '/images/products/roland-juno-ds61.png',
    true
),
(
    'b1000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000003',
    'Drum Elektrik Roland TD-07DMK V-Drums Set',
    'roland-td-07dmk-electronic-drums',
    'Drum kit elektronik kompak dengan mesh-head snare dan tom legendaris Roland berperedam ganda, modul canggih TD-07 berisi 25 kit bawaan, Bluetooth audio, serta pantulan stik yang sangat realistis.',
    11200000,
    4,
    'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&auto=format&fit=crop&q=80',
    true
),
(
    'b1000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000004',
    'Amplifier Gitar Marshall DSL40CR All-Tube Combo',
    'marshall-dsl40cr-tube-amp',
    'Amplifier tabung panggung 40-watt bertenaga tabung EL34 dengan speaker Celestion V-Type 12 inci, 2 channel gain switchable, digital reverb studio-grade, serta fitur power reduction untuk latihan di studio maupun kamar.',
    9900000,
    7,
    'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&auto=format&fit=crop&q=80',
    true
),
(
    'b1000000-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000004',
    'Mikrofon Vokal Dinamis Shure SM58-LC Original',
    'shure-sm58-vocal-microphone',
    'Standar emas mikrofon vokal panggung dunia dengan pola kutub cardioid terfokus, filter pop bawaan, respons frekuensi vokal yang hangat dan tebal, serta durabilitas konstruksi baja tahan banting.',
    1750000,
    25,
    'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
    true
),
(
    'b1000000-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000001',
    'Gitar Bass Elektrik Ibanez SR300E 4-String',
    'ibanez-sr300e-electric-bass',
    'Gitar bass 4 senar dengan bodi nyatoh berkontur ramping ergonomis, neck 5-piece maple/walnut yang sangat cepat, pickup PowerSpan Dual Coil, dan 3-band EQ aktif dengan saklar power tap.',
    4600000,
    10,
    'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&auto=format&fit=crop&q=80',
    true
),
(
    'b1000000-0000-0000-0000-000000000009',
    'c1000000-0000-0000-0000-000000000004',
    'Paket Aksesoris Musik: Senar DAddario, Tuner Digital & Stand Gitar',
    'paket-aksesoris-senar-tuner-stand',
    'Paket komplit kebutuhan pemain gitar berisi senar gitar akustik DAddario EXP16 Phosphor Bronze anti-karat, tuner digital clip-on presisi tinggi dengan layar warna, dan stand gitar lipat dengan busa pelindung empuk.',
    385000,
    40,
    'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=800&auto=format&fit=crop&q=80',
    true
),
(
    'b1000000-0000-0000-0000-000000000010',
    'c1000000-0000-0000-0000-000000000003',
    'Cajon Akustik Meinl Percussion Headliner Series',
    'meinl-cajon-percussion-headliner',
    'Cajon akustik dari kayu birch solid berkualitas tinggi dengan kawat snare ganda internal yang responsif, sudut atas yang nyaman di tangan, dan respon bass yang bertenaga untuk pertunjukan akustik.',
    1450000,
    12,
    '/images/products/cajon-meinl-headliner.png',
    true
);

-- 9. SEED CONTOH RIWAYAT PESANAN (Contoh Order Selesai)
INSERT INTO orders (id, order_id, customer_name, customer_phone, customer_address, payment_method, payment_status, total_amount) VALUES
(
    'd1000000-0000-0000-0000-000000000001',
    'HRM-20261022-948123',
    'Andi Musisi',
    '081234567890',
    'Jl. Senopati No. 18, Kebayoran Baru, Jakarta Selatan',
    'Midtrans (QRIS / Virtual Account)',
    'settlement',
    3890000
);

INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image_url) VALUES
(
    'd1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'Gitar Akustik Yamaha FGX800C Solid Top Cutaway',
    3890000,
    1,
    'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80'
);

-- Selesai! Schema database HarmoniStore lengkap dengan Riwayat Pesanan & Midtrans.
