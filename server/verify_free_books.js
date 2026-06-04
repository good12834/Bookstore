const axios = require('axios');
const { Book, sequelize } = require('./models');

const API_URL = 'http://localhost:5000/api';

async function verifyFreeBooks() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Check DB for free books
        const freeBookCount = await Book.count({ where: { isFree: true } });
        console.log(`Free Books in DB: ${freeBookCount}`);

        if (freeBookCount === 0) {
            console.log('❌ No free books found in DB. Seed script might have failed.');
        } else {
            console.log('✅ Free books found in DB.');
        }

        // 2. Test API endpoint
        console.log('Testing /books/free API...');
        try {
            const res = await axios.get(`${API_URL}/books/free`);
            console.log(`API returned ${res.data.length} free books.`);
            if (res.data.length > 0) {
                console.log('✅ API endpoint working.');
                console.log(`Sample: ${res.data[0].title}`);
            } else {
                console.log('❌ API endpoint returned empty array.');
            }
        } catch (e) {
            console.error('API Error:', e.message);
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        process.exit();
    }
}

verifyFreeBooks();
