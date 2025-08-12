// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@orphiq.com" },
    update: {},
    create: {
      email: "admin@orphiq.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      isActive: true,
      emailVerified: true,
    },
  });

  console.log("👤 Admin user created:", adminUser.email);

  // Create test users
  const testUsers = [
    {
      email: "john.doe@example.com",
      password: await bcrypt.hash("password123", 12),
      firstName: "John",
      lastName: "Doe",
      isActive: true,
      emailVerified: true,
    },
    {
      email: "jane.smith@example.com",
      password: await bcrypt.hash("password123", 12),
      firstName: "Jane",
      lastName: "Smith",
      isActive: true,
      emailVerified: false,
    },
    {
      email: "test.user@example.com",
      password: await bcrypt.hash("password123", 12),
      firstName: "Test",
      lastName: "User",
      isActive: true,
      emailVerified: true,
    },
  ];

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });
    console.log("👤 Test user created:", user.email);
  }

  console.log("✅ Database seeding completed!");

  // Display seeded data summary
  const userCount = await prisma.user.count();
  const activeUsers = await prisma.user.count({ where: { isActive: true } });
  const verifiedUsers = await prisma.user.count({
    where: { emailVerified: true },
  });

  console.log("\n📊 Database Summary:");
  console.log(`   • Total Users: ${userCount}`);
  console.log(`   • Active Users: ${activeUsers}`);
  console.log(`   • Verified Users: ${verifiedUsers}`);

  console.log("\n🔐 Test Credentials:");
  console.log("   • Admin: admin@orphiq.com / admin123");
  console.log("   • Test User 1: john.doe@example.com / password123");
  console.log("   • Test User 2: jane.smith@example.com / password123");
  console.log("   • Test User 3: test.user@example.com / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error during seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
