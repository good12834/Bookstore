const sequelize = require("./config/database");
const { User } = require("./models");
const bcrypt = require("bcrypt");

async function testAdminAccess() {
  console.log("🔐 Admin Access Diagnostic Tool\n");
  console.log("=".repeat(50));

  // Test database connection
  console.log("\n1. Testing database connection...");
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful!");
  } catch (error) {
    console.log("❌ Database connection failed:");
    console.log("   Error:", error.message);
    console.log(
      "\n💡 Make sure MySQL is running and credentials are correct in .env"
    );
    process.exit(1);
  }

  // Check if admin exists
  console.log("\n2. Checking for admin user...");
  const adminEmail = "admin@bookstore.com";

  let adminUser;
  try {
    adminUser = await User.findOne({ where: { email: adminEmail } });
  } catch (error) {
    console.log("❌ Error querying users:", error.message);
    process.exit(1);
  }

  if (adminUser) {
    console.log(`✅ Admin user found: ${adminUser.email}`);
    console.log(`   - ID: ${adminUser.id}`);
    console.log(`   - isAdmin: ${adminUser.isAdmin}`);

    if (!adminUser.isAdmin) {
      console.log("\n⚠️  Admin user exists but isAdmin is FALSE!");
      console.log("   Fixing admin status...");
      adminUser.isAdmin = true;
      await adminUser.save();
      console.log("✅ Admin status fixed!");
    }
  } else {
    console.log("❌ Admin user not found. Creating one...");

    const adminPassword = "admin123"; // Default password
    try {
      adminUser = await User.create({
        username: "Admin",
        email: adminEmail,
        password: adminPassword,
        isAdmin: true,
      });
      console.log("✅ Admin user created successfully!");
      console.log(`   - Email: ${adminEmail}`);
      console.log(`   - Password: ${adminPassword}`);
      console.log("   ⚠️  Change this password immediately after first login!");
    } catch (error) {
      console.log("❌ Failed to create admin:", error.message);
      process.exit(1);
    }
  }

  // Test admin login
  console.log("\n3. Testing admin login...");
  try {
    const testAdmin = await User.findOne({ where: { email: adminEmail } });
    const isValid = await testAdmin.validPassword("admin123");

    if (isValid) {
      console.log("✅ Admin login credentials valid!");
    } else {
      console.log("⚠️  Password mismatch - resetting password...");
      testAdmin.password = await bcrypt.hash("admin123", 10);
      await testAdmin.save();
      console.log("✅ Password reset to default 'admin123'");
    }
  } catch (error) {
    console.log("❌ Error testing login:", error.message);
  }

  // Generate test token
  console.log("\n4. Testing JWT token generation...");
  const jwt = require("jsonwebtoken");
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

  try {
    const adminToken = jwt.sign(
      { id: adminUser.id, isAdmin: adminUser.isAdmin },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log("✅ JWT token generated successfully!");
    console.log(`   Token: ${adminToken.substring(0, 50)}...`);

    // Verify token
    const decoded = jwt.verify(adminToken, JWT_SECRET);
    console.log(`   Decoded: id=${decoded.id}, isAdmin=${decoded.isAdmin}`);
  } catch (error) {
    console.log("❌ JWT error:", error.message);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📋 SUMMARY");
  console.log("=".repeat(50));
  console.log(`Admin Email: ${adminEmail}`);
  console.log(`Admin Password: admin123`);
  console.log(`Database: booknest`);
  console.log(`JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);

  console.log("\n✅ Admin access is now configured!");
  console.log("\n💡 Next steps:");
  console.log("   1. Start the server: cd server && npm start");
  console.log("   2. Login with admin@bookstore.com / admin123");
  console.log("   3. Access admin dashboard at /admin");
  console.log("   4. Change password after first login");

  await sequelize.close();
  process.exit(0);
}

testAdminAccess().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
