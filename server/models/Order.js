const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'Pending' // Pending, Completed, Cancelled
    },
    paymentMethod: {
        type: DataTypes.STRING,
        defaultValue: 'Stripe'
    },
    shippingAddress: {
        type: DataTypes.TEXT
    }
});

module.exports = Order;
