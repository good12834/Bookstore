const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Book extends Model {}

// Initialize the Book model with all fields and unique indexes
// This is database-agnostic - works with both MySQL and PostgreSQL
Book.init(
  {
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
      unique: true,
    },
    gutendexId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      unique: true,
    },
    openLibraryId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
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
  },
  {
    sequelize,
    modelName: "Book",
    tableName: "Books",
    indexes: [
      {
        name: "books_googleBooksId",
        unique: true,
        fields: ["googleBooksId"],
      },
      {
        name: "books_gutendexId",
        unique: true,
        fields: ["gutendexId"],
      },
      {
        name: "books_openLibraryId",
        unique: true,
        fields: ["openLibraryId"],
      },
    ],
  }
);

module.exports = Book;
