const { User, Book, Order, OrderItem, sequelize } = require("../models");
const {
  sendOrderShipped,
  sendPromotionalEmail,
} = require("../services/emailService");
const { Op } = require("sequelize");

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalBooks = await Book.count();
    const totalOrders = await Order.count();

    // Calculate total sales
    const totalSalesResult = await Order.findAll({
      attributes: [
        [sequelize.fn("sum", sequelize.col("totalAmount")), "totalSales"],
      ],
    });
    const totalSales = totalSalesResult[0].dataValues.totalSales || 0;

    res.json({
      totalUsers,
      totalBooks,
      totalOrders,
      totalSales,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users with pagination
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      limit,
      offset,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalUsers: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Convert role string to boolean for isAdmin field
    user.isAdmin = role === "admin";
    await user.save();

    res.json({
      message: "User role updated successfully",
      user: { ...user.toJSON(), password: undefined },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders with details
exports.getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      limit,
      offset,
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: OrderItem,
          include: [
            {
              model: Book,
              attributes: ["id", "title", "price"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalOrders: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get advanced analytics
exports.getAnalytics = async (req, res) => {
  try {
    // Sales data for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const salesData = await Order.findAll({
      attributes: [
        [
          sequelize.fn("date_trunc", "month", sequelize.col("createdAt")),
          "month",
        ],
        [sequelize.fn("sum", sequelize.col("totalAmount")), "totalSales"],
        [sequelize.fn("count", sequelize.col("id")), "orderCount"],
      ],
      where: {
        createdAt: {
          [Op.gte]: twelveMonthsAgo,
        },
      },
      group: [sequelize.fn("date_trunc", "month", sequelize.col("createdAt"))],
      order: [
        [
          sequelize.fn("date_trunc", "month", sequelize.col("createdAt")),
          "ASC",
        ],
      ],
    });

    // Top selling books
    const topBooks = await OrderItem.findAll({
      attributes: [
        "bookId",
        [sequelize.fn("sum", sequelize.col("quantity")), "totalSold"],
        [sequelize.fn("sum", sequelize.col("price")), "totalRevenue"],
      ],
      include: [
        {
          model: Book,
          attributes: ["title", "author"],
        },
      ],
      group: ["bookId"],
      order: [[sequelize.fn("sum", sequelize.col("quantity")), "DESC"]],
      limit: 10,
    });

    // Category sales
    const categorySales = await Book.findAll({
      attributes: [
        "category",
        [sequelize.fn("count", sequelize.col("Book.id")), "bookCount"],
        [sequelize.fn("sum", sequelize.col("stock")), "totalStock"],
      ],
      group: ["category"],
    });

    // Recent orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["name", "email"],
        },
      ],
    });

    res.json({
      salesData,
      topBooks,
      categorySales,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send order shipped email
exports.sendOrderShippedEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          attributes: [
            "id",
            "email",
            "firstName",
            "lastName",
            "emailPreferences",
          ],
        },
        {
          model: OrderItem,
          include: [Book],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update order status to shipped if not already
    if (order.status !== "Shipped") {
      order.status = "Shipped";
      order.trackingNumber = req.body.trackingNumber || `TRK${Date.now()}`;
      order.shippedAt = new Date();
      await order.save();
    }

    const emailSent = await sendOrderShipped(order, order.User);

    if (emailSent) {
      res.json({ message: "Order shipped email sent successfully" });
    } else {
      res.status(500).json({ error: "Failed to send order shipped email" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get email statistics
exports.getEmailStatistics = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const usersWithPreferences = await User.count({
      where: {
        emailPreferences: { [Op.ne]: null },
      },
    });

    const promotionalSubscribers = await User.count({
      where: {
        [Op.or]: [
          { emailPreferences: null },
          { "emailPreferences.promotionalEmails": { [Op.ne]: false } },
        ],
      },
    });

    const orderEmailSubscribers = await User.count({
      where: {
        [Op.or]: [
          { emailPreferences: null },
          { "emailPreferences.orderConfirmations": { [Op.ne]: false } },
        ],
      },
    });

    const newsletterSubscribers = await User.count({
      where: {
        [Op.or]: [
          { emailPreferences: null },
          { "emailPreferences.newsletter": { [Op.ne]: false } },
        ],
      },
    });

    res.json({
      totalUsers,
      usersWithPreferences,
      promotionalSubscribers,
      orderEmailSubscribers,
      newsletterSubscribers,
      promotionalSubscriptionRate: (
        (promotionalSubscribers / totalUsers) *
        100
      ).toFixed(2),
      orderEmailSubscriptionRate: (
        (orderEmailSubscribers / totalUsers) *
        100
      ).toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send promotional email to all users
exports.sendPromotionalEmailToAll = async (req, res) => {
  try {
    const { content, subject } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Email content is required" });
    }

    // Get all users who haven't unsubscribed from promotional emails
    const users = await User.findAll({
      where: {
        [Op.or]: [
          { emailPreferences: null },
          { "emailPreferences.promotionalEmails": { [Op.ne]: false } },
        ],
      },
      attributes: ["id", "email", "firstName", "lastName", "emailPreferences"],
    });

    if (users.length === 0) {
      return res
        .status(200)
        .json({ message: "No users to send promotional emails to" });
    }

    const results = await sendPromotionalEmail(users, content);

    const successful = results.filter(
      (result) => result.status === "sent"
    ).length;
    const failed = results.filter(
      (result) => result.status === "failed"
    ).length;

    res.status(200).json({
      message: `Promotional emails sent to ${successful} users`,
      total: users.length,
      successful,
      failed,
      results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send promotional email to specific users
exports.sendPromotionalEmailToUsers = async (req, res) => {
  try {
    const { userIds, content } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "User IDs array is required" });
    }

    if (!content) {
      return res.status(400).json({ error: "Email content is required" });
    }

    const users = await User.findAll({
      where: { id: { [Op.in]: userIds } },
      attributes: ["id", "email", "firstName", "lastName", "emailPreferences"],
    });

    if (users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    const results = await sendPromotionalEmail(users, content);

    const successful = results.filter(
      (result) => result.status === "sent"
    ).length;
    const failed = results.filter(
      (result) => result.status === "failed"
    ).length;

    res.status(200).json({
      message: `Promotional emails sent to ${successful} users`,
      total: users.length,
      successful,
      failed,
      results,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
