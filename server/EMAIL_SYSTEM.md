# Email Notification System

This document describes the email notification system implemented in the BookStore application.

## Overview

The email system provides automated notifications and promotional email capabilities for the BookStore platform. It includes:

- **Order Confirmation Emails**: Automatically sent when customers place orders
- **Order Status Updates**: Emails sent when orders are shipped or delivered
- **Promotional Emails**: Admin-controlled marketing emails to subscribers
- **User Email Preferences**: Users can control what types of emails they receive
- **Unsubscribe Functionality**: Users can unsubscribe from promotional emails

## Features

### 1. Automatic Order Emails

- **Order Confirmation**: Sent automatically when an order is placed
- **Order Shipped**: Can be sent manually by admins when orders are shipped

### 2. Promotional Email System

- **Bulk Email Sending**: Send promotional content to all subscribers
- **Targeted Emails**: Send to specific user groups
- **Email Statistics**: Track subscriber numbers and engagement

### 3. User Preference Management

Users can control their email preferences through the `/email-preferences` page:

- Order confirmations
- Order updates (shipping, delivery)
- Promotional emails
- Newsletter subscriptions

## Email Templates

### Order Confirmation Email

- Professional HTML template with order details
- Includes shipping address and order summary
- Company branding and contact information

### Order Shipped Email

- Notification that order has shipped
- Tracking information (when available)
- Estimated delivery date

### Promotional Email

- Customizable HTML content
- Responsive design
- Unsubscribe link included
- Call-to-action buttons

## API Endpoints

### User Endpoints

- `GET /api/email/preferences` - Get user's email preferences
- `PUT /api/email/preferences` - Update user's email preferences
- `GET /api/email/unsubscribe?email=user@email.com` - Unsubscribe from promotional emails

### Admin Endpoints

- `GET /api/admin/email/statistics` - Get email subscription statistics
- `POST /api/admin/email/promotional/send-all` - Send promotional email to all subscribers
- `POST /api/admin/email/promotional/send-users` - Send promotional email to specific users
- `POST /api/admin/orders/:id/send-shipped-email` - Send order shipped email
- `POST /api/email/order-confirmation/:orderId` - Resend order confirmation
- `POST /api/email/order-shipped/:orderId` - Resend order shipped email

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=BookStore <noreply@bookstore.com>

# Client URL for email links
CLIENT_URL=http://localhost:5173
```

### Email Service Setup

#### Gmail Setup (Recommended for Development)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

#### Production Email Services

For production, consider using:

- **SendGrid**: Professional email service with API
- **Mailgun**: Reliable email API service
- **Amazon SES**: Scalable email service
- **Postmark**: Transactional email service

## Admin Dashboard

The admin dashboard includes an "Email Management" tab with:

### Email Statistics Dashboard

- Total registered users
- Promotional email subscribers
- Order email subscribers
- Newsletter subscribers
- Subscription rates

### Promotional Email Sender

- Rich text editor for email content
- HTML support for advanced formatting
- Send to all subscribers or specific users
- Preview and test functionality

### Order Email Management

- View orders ready for shipped notifications
- Send shipped emails individually
- Track email sending status
- Resend emails if needed

## User Interface

### Email Preferences Page (`/email-preferences`)

- Clean, intuitive interface
- Toggle switches for each email type
- Real-time preference updates
- Unsubscribe functionality

### Navigation Integration

- Email preferences link in user dropdown menu
- Easy access from any page

## Database Schema

### User Model Updates

The User model includes an `emailPreferences` JSON field:

```javascript
emailPreferences: {
  orderConfirmations: true,    // Order confirmation emails
  orderUpdates: true,          // Shipping and delivery updates
  promotionalEmails: true,     // Marketing and promotional content
  newsletter: true            // Regular newsletters
}
```

### Order Model Updates

Orders include additional fields for email tracking:

- `trackingNumber`: For shipped emails
- `estimatedDelivery`: Delivery estimates
- `shippedAt`: Timestamp for shipped orders

## Error Handling

- Email sending failures don't affect order processing
- Comprehensive error logging
- User-friendly error messages
- Retry mechanisms for failed emails

## Security Features

- Email validation
- Unsubscribe verification
- Admin-only access to bulk email features
- Rate limiting for email sending
- Secure email content sanitization

## Testing

### Manual Testing

1. Place a test order to verify confirmation emails
2. Update order status to test shipped emails
3. Test promotional email sending from admin panel
4. Verify unsubscribe functionality
5. Test email preference updates

### Development Testing

- Use Ethereal Email for testing: https://ethereal.email/
- Preview emails before sending
- Test with different email clients

## Deployment Considerations

### Production Email Setup

1. Use a professional email service provider
2. Set up proper DKIM and SPF records
3. Monitor email delivery rates
4. Implement bounce handling
5. Set up email analytics

### Monitoring

- Track email delivery rates
- Monitor bounce rates
- Log email sending errors
- Set up alerts for failed emails

## Best Practices

### Email Content

- Keep subject lines clear and concise
- Use responsive HTML templates
- Include clear unsubscribe links
- Maintain consistent branding
- Test emails across different clients

### User Experience

- Respect user preferences
- Provide value in promotional emails
- Don't send emails too frequently
- Make unsubscribe easy and immediate

### Technical

- Monitor email delivery rates
- Implement proper error handling
- Use email validation
- Cache email templates for performance
- Log all email activities

## Troubleshooting

### Common Issues

1. **Emails not sending**

   - Check email credentials in .env
   - Verify SMTP settings
   - Check firewall/network settings

2. **Emails going to spam**

   - Set up proper SPF/DKIM records
   - Use consistent sending domain
   - Avoid spam trigger words

3. **Template rendering issues**
   - Check HTML syntax
   - Test with different email clients
   - Verify data binding

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=email:*
```

## Future Enhancements

- Email template editor in admin panel
- A/B testing for promotional emails
- Email analytics and reporting
- Integration with email marketing platforms
- Automated email sequences
- Birthday and anniversary emails
- Cart abandonment emails
- Review request emails
