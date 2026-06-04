const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PriceHistory = sequelize.define('PriceHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  source: {
    type: DataTypes.ENUM('admin_update', 'bulk_import', 'manual_change', 'system'),
    defaultValue: 'admin_update'
  },
  changedBy: {
    type: DataTypes.INTEGER,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'price_histories',
  timestamps: true,
  indexes: [
    {
      fields: ['bookId', 'date']
    }
  ]
});

// Method to get price history for a book (static method)
PriceHistory.getPriceHistoryForBook = async function(bookId, limit = 50) {
  try {
    return await PriceHistory.findAll({
      where: { bookId },
      order: [['date', 'DESC']],
      limit: limit
    });
  } catch (error) {
    throw new Error(`Error fetching price history: ${error.message}`);
  }
};

// Method to get price trend (first vs last price)
PriceHistory.getPriceTrendForBook = async function(bookId) {
  try {
    const histories = await PriceHistory.findAll({
      where: { bookId },
      order: [['date', 'ASC']]
    });
    
    if (histories.length === 0) {
      return { trend: 'insufficient_data', change: 0, percentage: 0 };
    }
    
    const first = histories[0];
    const last = histories[histories.length - 1];
    
    const change = parseFloat(last.price) - parseFloat(first.price);
    const percentage = parseFloat(first.price) > 0 ? ((change / parseFloat(first.price)) * 100) : 0;
    
    let trend = 'stable';
    if (Math.abs(percentage) < 1) {
      trend = 'stable';
    } else if (percentage > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }
    
    return {
      trend,
      change,
      percentage: Math.round(percentage * 100) / 100,
      firstPrice: parseFloat(first.price),
      lastPrice: parseFloat(last.price),
      firstDate: first.date,
      lastDate: last.date
    };
  } catch (error) {
    throw new Error(`Error calculating price trend: ${error.message}`);
  }
};

module.exports = PriceHistory;