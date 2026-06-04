const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Book = sequelize.define("Book", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isbn: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.STRING,
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: "English",
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // API Integration fields
  googleBooksId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  gutendexId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  openLibraryId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Enhanced metadata
  pageCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  publisher: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  publishedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  averageRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    validate: { min: 0, max: 5 },
  },
  ratingsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  // Special book types
  isPublicDomain: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  downloadCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // API sync tracking
  lastApiSync: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  apiData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
});

// Add unique constraints manually to avoid duplicate index creation
Book.beforeSync(async () => {
  const queryInterface = sequelize.getQueryInterface();

  // Check if indexes already exist before creating them
  const [indexes] = await queryInterface.sequelize.query(
    'SHOW INDEXES FROM Books WHERE Column_name IN ("googleBooksId", "gutendexId", "openLibraryId")'
  );

  const existingIndexes = {};
  indexes.forEach((index) => {
    existingIndexes[index.Column_name] = true;
  });

  // Only add unique constraints if they don't already exist
  if (!existingIndexes.googleBooksId) {
    await queryInterface.addConstraint("Books", {
      fields: ["googleBooksId"],
      type: "unique",
      name: "googleBooksId",
    });
  }

  if (!existingIndexes.gutendexId) {
    await queryInterface.addConstraint("Books", {
      fields: ["gutendexId"],
      type: "unique",
      name: "gutendexId",
    });
  }

  if (!existingIndexes.openLibraryId) {
    await queryInterface.addConstraint("Books", {
      fields: ["openLibraryId"],
      type: "unique",
      name: "openLibraryId",
    });
  }
});

module.exports = Book;
