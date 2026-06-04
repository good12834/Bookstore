const { Order, OrderItem, Book, User, sequelize } = require("../models");
const { sendOrderConfirmation } = require("../services/emailService");

exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    // items: [{ bookId, quantity }]

    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const book = await Book.findByPk(item.bookId, { transaction: t });
      if (!book) throw new Error(`Book with ID ${item.bookId} not found`);
      if (book.stock < item.quantity)
        throw new Error(`Insufficient stock for book: ${book.title}`);

      const price = book.price;
      totalAmount += price * item.quantity;

      orderItemsData.push({
        bookId: book.id,
        quantity: item.quantity,
        price: price,
      });

      // Update stock
      await book.update(
        { stock: book.stock - item.quantity },
        { transaction: t }
      );
    }

    const order = await Order.create(
      {
        userId: req.user.id,
        totalAmount,
        shippingAddress,
        paymentMethod,
        status: "Pending",
      },
      { transaction: t }
    );

    for (const itemData of orderItemsData) {
      await OrderItem.create(
        { ...itemData, orderId: order.id },
        { transaction: t }
      );
    }

    await t.commit();

    // Send order confirmation email
    try {
      const user = await User.findByPk(req.user.id);
      const orderWithItems = await Order.findByPk(order.id, {
        include: [{ model: OrderItem, include: [Book] }],
      });

      if (user && orderWithItems) {
        await sendOrderConfirmation(orderWithItems, user);
        console.log("Order confirmation email sent successfully");
      }
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json(order);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, include: [Book] }],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: ["User", { model: OrderItem, include: [Book] }],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
