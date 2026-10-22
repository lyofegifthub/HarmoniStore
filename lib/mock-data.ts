import { Category, Product } from "./types";

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "c1000000-0000-0000-0000-000000000001",
    name: "Gitar & Bass",
    slug: "gitar-bass",
    created_at: new Date().toISOString(),
  },
  {
    id: "c1000000-0000-0000-0000-000000000002",
    name: "Keyboard & Piano Digital",
    slug: "keyboard-piano",
    created_at: new Date().toISOString(),
  },
  {
    id: "c1000000-0000-0000-0000-000000000003",
    name: "Drum & Perkusi",
    slug: "drum-perkusi",
    created_at: new Date().toISOString(),
  },
  {
    id: "c1000000-0000-0000-0000-000000000004",
    name: "Audio Studio & Aksesoris",
    slug: "audio-aksesoris",
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "b1000000-0000-0000-0000-000000000001",
    category_id: "c1000000-0000-0000-0000-000000000001",
    name: "Gitar Elektrik Fender Player Stratocaster",
    slug: "fender-player-stratocaster",
    description:
      "Gitar elektrik legendaris dengan bodi alder pilihan, neck maple profil modern C, 3 pickup single-coil Player Series, tremolo 2-point, dan karakter tone vintage khas Fender yang jernih, renyah, dan serbaguna.",
    price: 11850000,
    stock: 8,
    image_url:
      "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    created_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[0],
  },
  {
    id: "b1000000-0000-0000-0000-000000000002",
    category_id: "c1000000-0000-0000-0000-000000000001",
    name: "Gitar Akustik Yamaha FGX800C Solid Top Cutaway",
    slug: "yamaha-fgx800c-solid-top",
    description:
      "Gitar akustik-elektrik solid spruce top dengan preamp System66 dan pickup under-saddle piezo Yamaha. Menghasilkan resonansi kayu alami yang kaya dan sustain panjang saat dicolokkan ke amplifier atau PA panggung.",
    price: 3890000,
    stock: 15,
    image_url:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    created_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[0],
  },
  {
    id: "b1000000-0000-0000-0000-000000000003",
    category_id: "c1000000-0000-0000-0000-000000000002",
    name: "Piano Digital Yamaha P-125B 88-Key Graded Hammer",
    slug: "yamaha-p125b-digital-piano",
    description:
      "Piano digital portabel 88 tuts berbobot Graded Hammer Standard (GHS) yang presisi menyerupai piano akustik konser, mesin suara Pure CF, polifoni 192 not, serta konektivitas USB audio & MIDI.",
    price: 8950000,
    stock: 6,
    image_url:
      "https://images.unsplash.com/photo-1552422535-c45813c61732?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    created_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[1],
  },
  {
    id: "b1000000-0000-0000-0000-000000000004",
    category_id: "c1000000-0000-0000-0000-000000000002",
    name: "Synthesizer Keyboard Roland JUNO-DS61",
    slug: "roland-juno-ds61-synthesizer",
    description:
      "Synthesizer panggung profesional dengan bobot ringan 61 tuts velocity-sensitive, lebih dari seribu suara instrumen berkualitas tinggi, slot ekspansi gelombang, 8 phrase pad, dan input mic dengan efek vokal bawaan.",
    price: 10450000,
    stock: 5,
    image_url:
      "/images/products/roland-juno-ds61.png",
    is_available: true,
    created_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[1],
  },
  {
    id: "b1000000-0000-0000-0000-000000000005",
    category_id: "c1000000-0000-0000-0000-000000000003",
    name: "Drum Elektrik Roland TD-07DMK V-Drums Set",
    slug: "roland-td-07dmk-electronic-drums",
    description:
      "Drum kit elektronik kompak dengan mesh-head snare dan tom legendaris Roland berperedam ganda, modul canggih TD-07 berisi 25 kit bawaan, Bluetooth audio, serta pantulan stik yang sangat realistis.",
    price: 11200000,
    stock: 4,
    image_url:
      "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    created_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[2],
  },
  {
    id: "b1000000-0000-0000-0000-000000000006",
    category_id: "c1000000-0000-0000-0000-000000000004",
    name: "Amplifier Gitar Marshall DSL40CR All-Tube Combo",
    slug: "marshall-dsl40cr-tube-amp",
    description:
      "Amplifier tabung panggung 40-watt bertenaga tabung EL34 dengan speaker Celestion V-Type 12 inci, 2 channel gain switchable, digital reverb studio-grade, serta fitur power reduction untuk latihan di studio maupun kamar.",
    price: 9900000,
    stock: 7,
    image_url:
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    created_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[3],
  },
  {
    id: "b1000000-0000-0000-0000-000000000007",
    category_id: "c1000000-0000-0000-0000-000000000004",
    name: "Mikrofon Vokal Dinamis Shure SM58-LC Original",
    slug: "shure-sm58-vocal-microphone",
    description:
      "Standar emas mikrofon vokal panggung dunia dengan pola kutub cardioid terfokus, filter pop bawaan, respons frekuensi vokal yang hangat dan tebal, serta durabilitas konstruksi baja tahan banting.",
    price: 1750000,
    stock: 25,
    image_url:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    created_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[3],
  },
  {
    id: "b1000000-0000-0000-0000-000000000008",
    category_id: "c1000000-0000-0000-0000-000000000001",
    name: "Gitar Bass Elektrik Ibanez SR300E 4-String",
    slug: "ibanez-sr300e-electric-bass",
    description:
      "Gitar bass 4 senar dengan bodi nyatoh berkontur ramping ergonomis, neck 5-piece maple/walnut yang sangat cepat, pickup PowerSpan Dual Coil, dan 3-band EQ aktif dengan saklar power tap.",
    price: 4600000,
    stock: 10,
    image_url:
      "https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    created_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[0],
  },
  {
    id: "b1000000-0000-0000-0000-000000000009",
    category_id: "c1000000-0000-0000-0000-000000000004",
    name: "Paket Aksesoris Musik: Senar DAddario, Tuner Digital & Stand Gitar",
    slug: "paket-aksesoris-senar-tuner-stand",
    description:
      "Paket komplit kebutuhan pemain gitar berisi senar gitar akustik DAddario EXP16 Phosphor Bronze anti-karat, tuner digital clip-on presisi tinggi dengan layar warna, dan stand gitar lipat dengan busa pelindung empuk.",
    price: 385000,
    stock: 40,
    image_url:
      "https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=800&auto=format&fit=crop&q=80",
    is_available: true,
    created_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[3],
  },
  {
    id: "b1000000-0000-0000-0000-000000000010",
    category_id: "c1000000-0000-0000-0000-000000000003",
    name: "Cajon Akustik Meinl Percussion Headliner Series",
    slug: "meinl-cajon-percussion-headliner",
    description:
      "Cajon akustik dari kayu birch solid berkualitas tinggi dengan kawat snare ganda internal yang responsif, sudut atas yang nyaman di tangan, dan respon bass yang bertenaga untuk pertunjukan akustik.",
    price: 1450000,
    stock: 12,
    image_url:
      "/images/products/cajon-meinl-headliner.png",
    is_available: true,
    created_at: new Date().toISOString(),
    category: INITIAL_CATEGORIES[2],
  },
];
