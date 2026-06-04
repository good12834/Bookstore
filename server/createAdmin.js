const { User } = require("./models");
const bcrypt = require("bcrypt");

async function createAdmin() {
  try {
    console.log("Creating admin user...");

    // Try to find existing user or create new one
    let adminUser;
    const adminEmail = "admin@bookstore.com";

    const adminPassword = "password123";
    const adminUsername = "Admin";

    // Check if admin already exists
    adminUser = await User.findOne({ where: { email: adminEmail } });

    if (adminUser) {
      console.log("Admin user already exists, updating to admin...");
      adminUser.isAdmin = true;
      await adminUser.save();
    } else {
      console.log("Creating new admin user...");
      adminUser = await User.create({
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        isAdmin: true,
      });
    }

    console.log("✅ Admin user created/updated successfully!");
    console.log("Admin credentials:");
    console.log("Email:", adminEmail);
    console.log("Password:", adminPassword);
    console.log(
      "⚠️  IMPORTANT: Please change this password immediately after first login!"
    );
    console.log(
      "You can now login with these credentials to access the admin dashboard."
    );
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
  }

  process.exit(0);
}

createAdmin();
