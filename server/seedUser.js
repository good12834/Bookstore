const { User, sequelize } = require('./models');
const bcrypt = require('bcrypt');

async function seedUser() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const existingUser = await User.findOne({ where: { email: 'test@example.com' } });
        if (existingUser) {
            console.log('Test user already exists.');
            return;
        }

        const hashedPassword = await bcrypt.hash('password123', 10);
        const user = await User.create({
            username: 'Test User',
            email: 'test@example.com',
            password: hashedPassword,
            isAdmin: true
        });

        console.log('Test user created:', user.email);
        console.log('ID:', user.id);
    } catch (error) {
        console.error('Error seeding user:', error);
    } finally {
        process.exit();
    }
}

seedUser();
