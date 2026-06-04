const nodemailer = require("nodemailer");

// Email configuration
const createTransporter = () => {
  // For development, we'll use a simple email service
  // In production, configure with actual SMTP credentials
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASSWORD || "your-app-password",
    },
  });
};

// Order confirmation email template
const orderConfirmationTemplate = (order, user) => {
  const itemsList = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">
        <strong>${item.book?.title || "Book Title"}</strong><br>
        <small>by ${item.book?.author || "Unknown Author"}</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">
        $${item.price.toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
        .footer { background: #34495e; color: white; padding: 20px; text-align: center; }
        table { width: 100%; border-collapse: collapse; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 BookStore Order Confirmation</h1>
        </div>
        
        <div class="content">
          <h2>Thank you for your order, ${user.firstName || "Customer"}!</h2>
          <p>We're pleased to confirm that your order has been successfully placed and is being processed.</p>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Order Number:</strong> #${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(
              order.createdAt
            ).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            
            <table>
              <thead>
                <tr style="background: #f0f0f0;">
                  <th style="padding: 10px; text-align: left;">Book</th>
                  <th style="padding: 10px; text-align: center;">Quantity</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsList}
              </tbody>
            </table>
            
            <div class="total">
              <p>Total Amount: $${order.totalAmount.toFixed(2)}</p>
            </div>
          </div>
          
          <p><strong>Shipping Address:</strong></p>
          <p>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
    order.shippingAddress.zipCode
  }<br>
            ${order.shippingAddress.country}
          </p>
          
          <p>You'll receive another email with tracking information once your order ships.</p>
          <p>If you have any questions about your order, please contact our customer service team.</p>
        </div>
        
        <div class="footer">
          <p>Thank you for shopping with BookStore!</p>
          <p><small>This is an automated message. Please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Order shipped email template
const orderShippedTemplate = (order, user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Shipped</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #27ae60; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #34495e; color: white; padding: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📦 Your Order Has Shipped!</h1>
        </div>
        
        <div class="content">
          <h2>Great news, ${user.firstName || "Customer"}!</h2>
          <p>Your order #${
            order.id
          } has been shipped and is on its way to you.</p>
          
          <div class="order-details">
            <h3>Shipping Information</h3>
            <p><strong>Tracking Number:</strong> ${
              order.trackingNumber || "TBD"
            }</p>
            <p><strong>Estimated Delivery:</strong> ${
              order.estimatedDelivery || "3-5 business days"
            }</p>
            
            <h4>Shipping Address:</h4>
            <p>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${
    order.shippingAddress.zipCode
  }<br>
              ${order.shippingAddress.country}
            </p>
          </div>
          
          <p>You can track your order using the tracking number provided above.</p>
          <p>We hope you enjoy your books!</p>
        </div>
        
        <div class="footer">
          <p>Thank you for shopping with BookStore!</p>
          <p><small>This is an automated message. Please do not reply to this email.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Promotional email template
const promotionalEmailTemplate = (content, user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Special Offer from BookStore</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e74c3c; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .promo-content { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { background: #34495e; color: white; padding: 20px; text-align: center; }
        .cta-button { background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📖 Special Offer Just for You!</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${user.firstName || "Valued Customer"},</h2>
          
          <div class="promo-content">
            ${content}
          </div>
          
          <div style="text-align: center;">
            <a href="${
              process.env.CLIENT_URL || "http://localhost:5173"
            }/shop" class="cta-button">
              Shop Now
            </a>
          </div>
          
          <p>This offer is exclusive to our subscribers. Don't miss out!</p>
        </div>
        
        <div class="footer">
          <p>BookStore - Your Literary Destination</p>
          <p><small>
            <a href="${
              process.env.CLIENT_URL || "http://localhost:5173"
            }/unsubscribe?email=${user.email}" style="color: #bdc3c7;">
              Unsubscribe from promotional emails
            </a>
          </small></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send order confirmation email
const sendOrderConfirmation = async (order, user) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || "BookStore <noreply@bookstore.com>",
      to: user.email,
      subject: `Order Confirmation - #${order.id}`,
      html: orderConfirmationTemplate(order, user),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    return false;
  }
};

// Send order shipped email
const sendOrderShipped = async (order, user) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || "BookStore <noreply@bookstore.com>",
      to: user.email,
      subject: `Your Order Has Shipped - #${order.id}`,
      html: orderShippedTemplate(order, user),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order shipped email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error("Error sending order shipped email:", error);
    return false;
  }
};

// Send promotional email
const sendPromotionalEmail = async (users, content) => {
  try {
    const transporter = createTransporter();
    const results = [];

    for (const user of users) {
      if (user.emailPreferences?.promotionalEmails !== false) {
        const mailOptions = {
          from: process.env.EMAIL_FROM || "BookStore <noreply@bookstore.com>",
          to: user.email,
          subject: "📖 Special Offer from BookStore",
          html: promotionalEmailTemplate(content, user),
        };

        try {
          await transporter.sendMail(mailOptions);
          results.push({ email: user.email, status: "sent" });
          console.log(`Promotional email sent to ${user.email}`);
        } catch (emailError) {
          results.push({
            email: user.email,
            status: "failed",
            error: emailError.message,
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error("Error sending promotional emails:", error);
    return [];
  }
};

module.exports = {
  sendOrderConfirmation,
  sendOrderShipped,
  sendPromotionalEmail,
};
