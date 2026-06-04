const { User } = require('../models');
const { sendOrderConfirmation, sendOrderShipped, sendPromotionalEmail } = require('../services/emailService');
const { Op } = require('sequelize');

// Send order confirmation email
const sendOrderConfirmationEmail = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { Order, Book } = require('../models');
        
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: Book,
                    attributes: ['id', 'title', 'author']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const user = await User.findByPk(order.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user wants order confirmation emails
        if (!user.emailPreferences?.orderConfirmations) {
            return res.status(200).json({ 
                message: 'Email not sent - user has disabled order confirmation emails',
                userPreference: false 
            });
        }

        const emailSent = await sendOrderConfirmation(order, user);
        
        if (emailSent) {
            res.status(200).json({ message: 'Order confirmation email sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send order confirmation email' });
        }
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Send order shipped email
const sendOrderShippedEmail = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { Order, Book } = require('../models');
        
        const order = await Order.findByPk(orderId, {
            include: [
                {
                    model: Book,
                    attributes: ['id', 'title', 'author']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const user = await User.findByPk(order.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user wants order update emails
        if (!user.emailPreferences?.orderUpdates) {
            return res.status(200).json({ 
                message: 'Email not sent - user has disabled order update emails',
                userPreference: false 
            });
        }

        const emailSent = await sendOrderShipped(order, user);
        
        if (emailSent) {
            res.status(200).json({ message: 'Order shipped email sent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to send order shipped email' });
        }
    } catch (error) {
        console.error('Error sending order shipped email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Send promotional email to all users
const sendPromotionalEmailToAll = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { content, subject } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Email content is required' });
        }

        // Get all users who haven't unsubscribed from promotional emails
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { emailPreferences: null },
                    { 'emailPreferences.promotionalEmails': { [Op.ne]: false } }
                ]
            },
            attributes: ['id', 'email', 'firstName', 'lastName', 'emailPreferences']
        });

        if (users.length === 0) {
            return res.status(200).json({ message: 'No users to send promotional emails to' });
        }

        const results = await sendPromotionalEmail(users, content);
        
        const successful = results.filter(result => result.status === 'sent').length;
        const failed = results.filter(result => result.status === 'failed').length;

        res.status(200).json({ 
            message: `Promotional emails sent to ${successful} users`,
            total: users.length,
            successful,
            failed,
            results 
        });
    } catch (error) {
        console.error('Error sending promotional emails:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Send promotional email to specific users
const sendPromotionalEmailToUsers = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const { userIds, content } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'User IDs array is required' });
        }

        if (!content) {
            return res.status(400).json({ message: 'Email content is required' });
        }

        const users = await User.findAll({
            where: { id: { [Op.in]: userIds } },
            attributes: ['id', 'email', 'firstName', 'lastName', 'emailPreferences']
        });

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        const results = await sendPromotionalEmail(users, content);
        
        const successful = results.filter(result => result.status === 'sent').length;
        const failed = results.filter(result => result.status === 'failed').length;

        res.status(200).json({ 
            message: `Promotional emails sent to ${successful} users`,
            total: users.length,
            successful,
            failed,
            results 
        });
    } catch (error) {
        console.error('Error sending promotional emails to specific users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update user email preferences
const updateEmailPreferences = async (req, res) => {
    try {
        const { preferences } = req.body;
        const userId = req.user.id;

        if (!preferences || typeof preferences !== 'object') {
            return res.status(400).json({ message: 'Valid preferences object is required' });
        }

        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Merge with existing preferences
        const updatedPreferences = {
            ...user.emailPreferences,
            ...preferences
        };

        user.emailPreferences = updatedPreferences;
        await user.save();

        res.status(200).json({ 
            message: 'Email preferences updated successfully',
            preferences: updatedPreferences 
        });
    } catch (error) {
        console.error('Error updating email preferences:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get user email preferences
const getEmailPreferences = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const user = await User.findByPk(userId, {
            attributes: ['emailPreferences']
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ 
            preferences: user.emailPreferences || {
                orderConfirmations: true,
                orderUpdates: true,
                promotionalEmails: true,
                newsletter: true
            }
        });
    } catch (error) {
        console.error('Error getting email preferences:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Unsubscribe user from promotional emails
const unsubscribe = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email parameter is required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update preferences to disable promotional emails
        const updatedPreferences = {
            ...user.emailPreferences,
            promotionalEmails: false
        };

        user.emailPreferences = updatedPreferences;
        await user.save();

        // Redirect to a thank you page or show a message
        res.send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1>✅ Successfully Unsubscribed</h1>
                    <p>You have been successfully unsubscribed from promotional emails.</p>
                    <p>You will no longer receive special offers and newsletters from us.</p>
                    <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}">Return to BookStore</a></p>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Error unsubscribing user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get email statistics for admin
const getEmailStatistics = async (req, res) => {
    try {
        // Check if user is admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }

        const totalUsers = await User.count();
        const usersWithPreferences = await User.count({
            where: {
                emailPreferences: { [Op.ne]: null }
            }
        });

        const promotionalSubscribers = await User.count({
            where: {
                [Op.or]: [
                    { emailPreferences: null },
                    { 'emailPreferences.promotionalEmails': { [Op.ne]: false } }
                ]
            }
        });

        const orderEmailSubscribers = await User.count({
            where: {
                [Op.or]: [
                    { emailPreferences: null },
                    { 'emailPreferences.orderConfirmations': { [Op.ne]: false } }
                ]
            }
        });

        res.status(200).json({
            totalUsers,
            usersWithPreferences,
            promotionalSubscribers,
            orderEmailSubscribers,
            subscriptionRate: ((promotionalSubscribers / totalUsers) * 100).toFixed(2)
        });
    } catch (error) {
        console.error('Error getting email statistics:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    sendOrderConfirmationEmail,
    sendOrderShippedEmail,
    sendPromotionalEmailToAll,
    sendPromotionalEmailToUsers,
    updateEmailPreferences,
    getEmailPreferences,
    unsubscribe,
    getEmailStatistics
};