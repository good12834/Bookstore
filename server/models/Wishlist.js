const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Wishlist = sequelize.define(
  "Wishlist",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "books",
        key: "id",
      },
    },
  },
  {
    tableName: "wishlists",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "bookId"],
      },
    ],
  }
);

module.exports = Wishlist;
