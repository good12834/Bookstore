const { User } = require("./models");
const bcrypt = require("bcrypt");

async function checkAdminStatus() {
  try {
    console.log("🔍 Checking admin user status...\n");

    // Check if admin exists
    const adminEmail = "admin@bookstore.com";
    const adminUser = await User.findOne({ where: { email: adminEmail } });

    if (adminUser) {
      console.log("✅ Admin user found in database:");
      console.log(`   - ID: ${adminUser.id}`);
      console.log(`   - Email: ${adminUser.email}`);
      console.log(`   - Username: ${adminUser.username}`);
      console.log(`   - isAdmin: ${adminUser.isAdmin}`);
      console.log(`   - Created: ${adminUser.createdAt}`);

      if (!adminUser.isAdmin) {
        console.log("\n⚠️  WARNING: Admin user exists but isAdmin is false!");
        console.log("   Run 'node createAdmin.js' to fix this.");
      } else {
        console.log("\n✅ Admin user is properly configured.");
      }
    } else {
      console.log("❌ Admin user not found in database.");
      console.log("   Run 'node createAdmin.js' to create the admin user.");
    }

    // List all users
    console.log("\n📋 All users in database:");
    const allUsers = await User.findAll({
      attributes: ["id", "email", "username", "isAdmin"],
    });

    if (allUsers.length === 0) {
      console.log("   No users found.");
    } else {
      allUsers.forEach((user) => {
        console.log(
          `   - [${user.isAdmin ? "ADMIN" : "USER"}] ${user.email} (ID: ${
            user.id
          })`
        );
      });
    }

    console.log("\n💡 To grant admin privileges to a user:");
    console.log(
      "   1. Update the user's isAdmin field to true in the database"
    );
    console.log("   OR");
    console.log("   2. Use the admin dashboard to update user roles");
    console.log("   OR");
    console.log(
      "   3. Run 'node createAdmin.js' to create/update the default admin"
    );
  } catch (error) {
    console.error("❌ Error checking admin status:", error.message);
  }

  process.exit(0);
}

checkAdminStatus();
