const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        console.log('Auth Middleware: No token provided');
        return res.status(401).json({ message: 'Access Denied' });
    }

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        console.log('Auth Middleware: Invalid Token');
        res.status(400).json({ message: 'Invalid Token' });
    }
};

module.exports = authMiddleware;
