const { Book, sequelize } = require('./models');

async function debug() {
    try {
        await sequelize.authenticate();
        console.log('DB Connected.');

        const count = await Book.count();
        console.log(`Total Books: ${count}`);

        const freeCount = await Book.count({ where: { isFree: true } });
        console.log(`Free Books: ${freeCount}`);

        const sherlock = await Book.findOne({ where: { title: { [require('sequelize').Op.like]: '%Sherlock%' } } });
        if (sherlock) {
            console.log('Sherlock Book:', JSON.stringify(sherlock.toJSON(), null, 2));
        }

        const sample = await Book.findOne();
        if (sample) {
            console.log('Sample Book:', JSON.stringify(sample.toJSON(), null, 2));
        }

        // Try creating one
        try {
            const test = await Book.create({
                title: "Debug Free Book",
                author: "Debug Author",
                price: 0,
                isFree: true,
                featured: false
            });
            console.log("Created debug book:", test.id);
        } catch (e) {
            console.error("Create failed:", e.message);
        }

    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

debug();
