const fs = require('fs');
const util = require('util');
const logFile = fs.createWriteStream('verify_output.txt', { flags: 'w' });
const logStdout = process.stdout;

console.log = function (d) { //
    logFile.write(util.format(d) + '\n');
    logStdout.write(util.format(d) + '\n');
};

const axios = require('axios');
const { Book, sequelize } = require('./models');

const API_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        console.log('Syncing database...');
        await sequelize.sync({ alter: true });
        console.log('Database synced.');

        // 1. Check if 'featured' column exists and set one book as featured
        const book = await Book.findOne();
        if (book) {
            console.log(`Found book: ${book.title}`);
            await book.update({ featured: true });
            console.log('Updated book to featured: true');
        } else {
            console.log('No books found in DB to update.');
        }

        // 2. Test Featured API
        console.log('Testing /books/featured...');
        try {
            const featuredRes = await axios.get(`${API_URL}/books/featured`);
            console.log(`Featured Books Count: ${featuredRes.data.length}`);
            if (featuredRes.data.length > 0) {
                console.log('✅ Featured endpoint working');
            } else {
                console.log('❌ Featured endpoint returned empty (might be expected if no books)');
            }
        } catch (e) { console.log('Error fetching featured: ' + e.message); }

        // 3. Test Trending API
        console.log('Testing /books/trending...');
        try {
            const trendingRes = await axios.get(`${API_URL}/books/trending`);
            console.log(`Trending Books Count: ${trendingRes.data.length}`);
            console.log('✅ Trending endpoint working');
        } catch (e) { console.log('Error fetching trending: ' + e.message); }

        // 4. Test Bestsellers API
        console.log('Testing /books/bestsellers...');
        try {
            const bestsellersRes = await axios.get(`${API_URL}/books/bestsellers`);
            console.log(`Bestsellers Books Count: ${bestsellersRes.data.length}`);
            console.log('✅ Bestsellers endpoint working');
        } catch (e) { console.log('Error fetching bestsellers: ' + e.message); }

    } catch (error) {
        console.log('Verification failed: ' + error.message);
    } finally {
        console.log('Done');
        process.exit();
    }
}

verify();
