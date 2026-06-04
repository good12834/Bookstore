const Sequelize = require("sequelize");
const sequelize = require("../config/database");

const User = require("./User");
const Book = require("./Book");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const Review = require("./Review");
const PriceHistory = require("./PriceHistory");

// Import Wishlist after sequelize is defined to avoid circular dependency
const Wishlist = require("./Wishlist");

// User - Order
User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

// Order - OrderItem
Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

// Book - OrderItem
Book.hasMany(OrderItem, { foreignKey: "bookId" });
OrderItem.belongsTo(Book, { foreignKey: "bookId" });

// User - Review
User.hasMany(Review, { foreignKey: "userId" });
Review.belongsTo(User, { foreignKey: "userId" });

// Book - Review
Book.hasMany(Review, { foreignKey: "bookId" });
Review.belongsTo(Book, { foreignKey: "bookId" });

// User - Wishlist
User.hasMany(Wishlist, { foreignKey: "userId" });
Wishlist.belongsTo(User, { foreignKey: "userId" });

// Book - Wishlist
Book.hasMany(Wishlist, { foreignKey: "bookId" });
Wishlist.belongsTo(Book, { foreignKey: "bookId" });

// Book - PriceHistory
Book.hasMany(PriceHistory, { foreignKey: "bookId" });
PriceHistory.belongsTo(Book, { foreignKey: "bookId" });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Book,
  Order,
  OrderItem,
  Review,
  Wishlist,
  PriceHistory,
};
