const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, orderController.createOrder);
router.get('/me', authMiddleware, orderController.getMyOrders);
router.get('/', authMiddleware, orderController.getAllOrders); // Admin only ideally

module.exports = router;
