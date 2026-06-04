const { sequelize } = require("./models");

async function checkIndexes() {
  try {
    const [results] = await sequelize.query("SHOW INDEXES FROM Books");
    console.log("Current indexes on Books table:");
    console.log(results);
    console.log(`Total indexes: ${results.length}`);
  } catch (error) {
    console.error("Error checking indexes:", error);
  } finally {
    await sequelize.close();
  }
}

checkIndexes();
