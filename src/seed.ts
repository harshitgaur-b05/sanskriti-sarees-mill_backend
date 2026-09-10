import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// ── Schemas ─────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "USER" }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  price: Number,
  stock: { type: Number, default: 0 },
  image: String,
  category: String,
  isBestSeller: { type: Boolean, default: false }
}, { timestamps: true });

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String
}, { timestamps: true });

const heroSchema = new mongoose.Schema({
  imageUrl: String
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);
const Blog = mongoose.models.Blog || mongoose.model("Blog", blogSchema);
const HeroConfig = mongoose.models.HeroConfig || mongoose.model("HeroConfig", heroSchema);

// ── Data ─────────────────────────────────────────────────
const adminUser = {
  name: "Sanskriti Admin",
  email: "admin@sanskriti.com",
  password: "admin123",
  role: "ADMIN"
};

const products = [
  {
    name: "Royal Kanjivaram Silk Saree",
    slug: "royal-kanjivaram-silk-saree",
    description: "Exquisite handwoven Kanjivaram silk saree with intricate pure zari borders and rich pallu, perfect for weddings and grand festivities.",
    price: 14999,
    stock: 15,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    category: "Kanjivaram",
    isBestSeller: true
  },
  {
    name: "Banarasi Zari Work Saree",
    slug: "banarasi-zari-work-saree",
    description: "Traditional Banarasi brocade silk saree adorned with a floral jaal pattern and ornate golden thread work throughout.",
    price: 12499,
    stock: 20,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800",
    category: "Banarasi",
    isBestSeller: true
  },
  {
    name: "Handcrafted Chanderi Cotton Saree",
    slug: "handcrafted-chanderi-cotton-saree",
    description: "Lightweight and elegant Chanderi saree featuring traditional motifs and a shimmering silver border, ideal for summer soirées.",
    price: 4599,
    stock: 35,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
    category: "Chanderi",
    isBestSeller: false
  },
  {
    name: "Classic Bandhani Tie & Dye Saree",
    slug: "classic-bandhani-tie-dye-saree",
    description: "Vibrant Gujarati Bandhani saree crafted on pure georgette fabric with authentic handcrafted dot patterns.",
    price: 6800,
    stock: 18,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    category: "Bandhani",
    isBestSeller: true
  },
  {
    name: "Pure Organza Floral Printed Saree",
    slug: "pure-organza-floral-printed-saree",
    description: "Modern sheer organza saree with delicate pastel floral prints and a scalloped embroidery edge, perfect for daytime events.",
    price: 5299,
    stock: 25,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800",
    category: "Organza",
    isBestSeller: false
  },
  {
    name: "Heritage Tussar Silk Saree",
    slug: "heritage-tussar-silk-saree",
    description: "Rich textured Tussar silk saree with tribal hand-block prints and natural earthy tones, a true artisan's creation.",
    price: 8900,
    stock: 12,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
    category: "Tussar Silk",
    isBestSeller: false
  },
  {
    name: "Bridal Velvet Border Saree",
    slug: "bridal-velvet-border-saree",
    description: "Heavy designer bridal saree with deep red hues, a velvet contrast border, and intricate stone embroidery.",
    price: 18500,
    stock: 8,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    category: "Bridal Collection",
    isBestSeller: true
  },
  {
    name: "Patan Patola Silk Saree",
    slug: "patan-patola-silk-saree",
    description: "Double ikat weave Patan Patola saree showcasing geometric motifs and vibrant double-sided colour in the royal tradition.",
    price: 24000,
    stock: 5,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800",
    category: "Patola",
    isBestSeller: true
  },
  {
    name: "Soft Linen Casual Wear Saree",
    slug: "soft-linen-casual-wear-saree",
    description: "Breathable pure linen saree with a minimalist stripe border, designed for daily sophistication and comfort.",
    price: 3499,
    stock: 40,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
    category: "Linen",
    isBestSeller: false
  },
  {
    name: "Paithani Peacock Motif Saree",
    slug: "paithani-peacock-motif-saree",
    description: "Maharashtrian Paithani silk saree featuring the signature gold zari pallu decorated with intricate peacock and lotus motifs.",
    price: 16200,
    stock: 10,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    category: "Paithani",
    isBestSeller: true
  }
];

const blogs = [
  {
    title: "The Anatomy of a Kanjivaram: Understanding Korvai Weave",
    content: `Few textiles in the world carry the weight of history as beautifully as the Kanjivaram silk saree. Woven in the temple town of Kanchipuram, Tamil Nadu, these sarees are celebrated for their lustrous sheen, heavy silk body, and pure gold or silver zari work.\n\nThe defining characteristic of an authentic Kanjivaram is the "Korvai" technique — a weaving method where the body and the border are woven separately and then interlocked together. This creates a remarkably strong, defined border that does not fray or separate even after decades of use. The join is so seamless that even an experienced eye may struggle to identify it.\n\nTraditional motifs include the rudraksham (rudraksh beads), mango (paisley), checks, stripes, and temple-inspired geometric patterns. A single Kanjivaram saree can take anywhere from 2 weeks to 6 months to weave depending on the complexity of the design. The mulberry silk threads used are first dipped in rice water to add body, then sun-dried before weaving begins.\n\nAt Sanskriti Sarees Mill, we work directly with third-generation master weavers from the Devanga and Mudaliar weaving communities of Kanchipuram, ensuring every saree meets the highest standards of craftsmanship and is Silk Mark certified.`,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "Reviving the Kadhuwa Brocade: Banarasi Silk's Living Legacy",
    content: `In the narrow lanes of Varanasi, a quiet revival is underway. The Kadhuwa Brocade technique — once considered a dying art — is being meticulously brought back to life by a small community of dedicated Banaras weavers.\n\nKadhuwa, derived from the Hindi word "kadhna" meaning to extract or draw out, refers to a style of brocade weaving where each individual motif is hand-woven into the fabric using a shuttle technique. Unlike the Jangla or Tanchoi styles, Kadhuwa creates three-dimensional, slightly raised motifs that seem to emerge organically from the fabric itself.\n\nThe motifs most commonly used — the asharfi buta (coin motif), the flower jaal (floral lattice), and the shikargah (hunting scene) — date back to the Mughal era, when Banarasi weavers worked under royal patronage to create some of the most magnificent textiles ever produced.\n\nSanskriti Sarees Mill has partnered with master weaver Ramzan Ali's family workshop in Madanpura, Varanasi, to exclusively bring Kadhuwa Brocade sarees to our collection. Each piece comes with a certificate of authentic handloom origin.`,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200"
  },
  {
    title: "How to Style a Paithani Saree for a Modern Wedding",
    content: `The Paithani saree, born in the historic town of Paithan (Pratishthan) in Maharashtra, is perhaps India's most opulent regional textile tradition. With a silk body woven in the tapestry style and a pure zari pallu featuring the iconic peacock or lotus motifs, a Paithani is as much a work of fine art as it is a garment.\n\nBut how do you wear this heirloom weave to a modern wedding without looking too traditional? Here are our favourite contemporary styling tips:\n\n**1. The Nivi Drape with a Structured Blouse**: Instead of the traditional Maharashtra-style nine-yard drape, opt for the classic Nivi drape. Pair with a heavily embellished, structured blouse in a contrasting colour — a deep navy or forest green against a golden Paithani makes for a stunning combination.\n\n**2. Pre-stitched Saree Gowns**: For destination weddings or cocktail evenings, consider having your Paithani converted into a pre-stitched gown silhouette. The pallu becomes a dramatic trail, and the zari work is showcased beautifully.\n\n**3. Minimal Jewellery**: A Paithani is statement enough. Let it speak by choosing minimal, clean jewellery — a single strand of pearls or plain gold studs. Avoid heavy necklaces that will compete with the zari.\n\n**4. Contrast Blouse**: The Paithani body is usually a solid jewel tone — emerald, ruby, sapphire, or gold. Use the contrasting border colour for your blouse fabric to create a striking, coordinated look.\n\nAt Sanskriti Sarees, our bridal styling consultants can help you drape and style your Paithani perfectly for your special occasion. Book a consultation at our flagship store.`,
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=1200"
  }
];

const heroConfig = {
  imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1600"
};

// ── Seed Function ─────────────────────────────────────────
async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set in .env");

  console.log("🔗 Connecting to MongoDB Atlas...");
  await mongoose.connect(url);
  console.log("✅ Connected!\n");

  // ── Admin User ──────────────────────────────────────────
  const existing = await User.findOne({ email: adminUser.email });
  if (existing) {
    console.log("⚠️  Admin user already exists, skipping creation.");
  } else {
    const hashed = await bcrypt.hash(adminUser.password, 10);
    await User.create({ ...adminUser, password: hashed });
    console.log(`✅ Admin user created: ${adminUser.email} / admin123`);
  }

  // ── Products ────────────────────────────────────────────
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`✅ ${products.length} products seeded.`);

  // ── Blogs ───────────────────────────────────────────────
  await Blog.deleteMany({});
  await Blog.insertMany(blogs);
  console.log(`✅ ${blogs.length} blogs seeded.`);

  // ── Hero Config ─────────────────────────────────────────
  const existingHero = await HeroConfig.findOne();
  if (!existingHero) {
    await HeroConfig.create(heroConfig);
    console.log("✅ Hero config seeded.");
  } else {
    console.log("⚠️  Hero config already exists, skipping.");
  }

  console.log("\n🎉 Database seeding complete!");
  console.log(`   Admin: ${adminUser.email} / ${adminUser.password}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
