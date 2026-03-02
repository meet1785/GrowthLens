/**
 * Seed script – creates a demo user for local / staging testing.
 * Run with:  node scripts/seed.mjs
 */
import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/growthlens";

const DEMO_USERS = [
  {
    name: "Demo User",
    email: "demo@growthlens.app",
    password: "Demo@1234",
  },
  {
    name: "Test Admin",
    email: "admin@growthlens.app",
    password: "Admin@1234",
  },
];

async function seed() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db();
    const users = db.collection("users");

    for (const u of DEMO_USERS) {
      const existing = await users.findOne({ email: u.email });
      if (existing) {
        console.log(`⚠️  User already exists: ${u.email} – skipping`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(u.password, 12);
      await users.insertOne({
        name: u.name,
        email: u.email.toLowerCase(),
        password: hashedPassword,
        provider: "credentials",
        emailVerified: new Date(),
        analysisCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`✅ Created user: ${u.email}  password: ${u.password}`);
    }

    console.log("\n🎉 Seed complete. Demo credentials:");
    console.log("   Email   : demo@growthlens.app");
    console.log("   Password: Demo@1234");
    console.log("   ───────────────────────────────");
    console.log("   Email   : admin@growthlens.app");
    console.log("   Password: Admin@1234");
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
