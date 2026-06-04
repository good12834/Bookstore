const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log(`Registering user: ${email}`);
        const user = await User.create({ username, email, password });
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration Error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Email already in use' });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for: ${email}`);
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log('Login failed: User not found');
            return res.status(401).json({ message: 'Login Failed: User email not found in database.' });
        }
        const isValid = await user.validPassword(password);
        if (!isValid) {
            console.log('Login failed: Password mismatch');
            return res.status(401).json({ message: 'Login Failed: Password does not match.' });
        }
        const token = jwt.sign({ id: user.id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
