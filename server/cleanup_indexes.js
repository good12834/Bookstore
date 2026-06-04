const { sequelize } = require("./models");

async function cleanupIndexes() {
  try {
    console.log("Cleaning up duplicate indexes...");

    // Get all current indexes
    const [indexes] = await sequelize.query("SHOW INDEXES FROM Books");

    // Identify duplicate indexes (keeping only the first occurrence of each column)
    const uniqueIndexes = {};
    const duplicates = [];

    for (const index of indexes) {
      if (index.Key_name === "PRIMARY") continue;

      const column = index.Column_name;
      if (!uniqueIndexes[column]) {
        uniqueIndexes[column] = index.Key_name;
      } else {
        // This is a duplicate
        if (index.Key_name !== uniqueIndexes[column]) {
          duplicates.push(index.Key_name);
        }
      }
    }

    console.log(`Found ${duplicates.length} duplicate indexes to remove`);

    // Remove duplicate indexes
    for (const indexName of duplicates) {
      try {
        await sequelize.query(`ALTER TABLE Books DROP INDEX \`${indexName}\``);
        console.log(`Removed duplicate index: ${indexName}`);
      } catch (error) {
        console.error(`Error removing index ${indexName}:`, error.message);
      }
    }

    // Verify cleanup
    const [newIndexes] = await sequelize.query("SHOW INDEXES FROM Books");
    console.log(`Indexes after cleanup: ${newIndexes.length}`);
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await sequelize.close();
  }
}

cleanupIndexes();
