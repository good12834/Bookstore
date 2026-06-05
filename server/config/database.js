const { Sequelize } = require('sequelize');
require('dotenv').config();

// Support both MySQL and PostgreSQL
// Default to MySQL for backward compatibility
const dialect = (process.env.DB_DIALECT || 'mysql').toLowerCase();

let sequelize;

if (dialect === 'postgres' || dialect === 'postgresql') {
    // PostgreSQL configuration (recommended for Render)
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            dialectOptions: {
                ssl: process.env.DB_SSL === 'true' ? {
                    require: true,
                    rejectUnauthorized: false
                } : false
            },
            logging: false
        }
    );
} else {
    // MySQL configuration
    sequelize = new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASS,
        {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false
        }
    );
}

module.exports = sequelize;
module.exports.dialect = dialect;
