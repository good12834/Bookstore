const { Book, sequelize } = require('./models');

async function clear() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');
        await Book.destroy({ where: {}, truncate: false });
        console.log('All books deleted.');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

clear();
