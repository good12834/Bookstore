# Admin Privilege Review - Online Book Store

## Current Admin Setup Overview

### 1. Admin User Creation

**Default Admin Credentials:**

- Email: `admin@bookstore.com`
- Password: `admin123`
- Username: `Admin`

**Creation Script**: Located at `server/createAdmin.js`

- Automatically creates admin user if none exists
- Updates existing users to admin if email matches
- Password is hashed using bcrypt before storage

### 2. User Model & Admin Field

**Database Schema** (`server/models/User.js`):

```javascript
isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
}
```

**Key Features:**

- Boolean field to determine admin status
- Default value is `false` for regular users
- Admin status stored directly in user record

### 3. Authentication System

**JWT Token Structure** (`server/controllers/authController.js`):

```javascript
const token = jwt.sign(
  {
    id: user.id,
    isAdmin: user.isAdmin,
  },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);
```

**Token Payload Includes:**

- User ID
- Admin status (`isAdmin`)
- 1-day expiration

### 4. Admin Route Protection

**Current Implementation Issues:**

- Admin routes (`server/routes/adminRoutes.js`) only use `authMiddleware`
- **Missing**: Admin-specific middleware verification
- **Risk**: Any authenticated user can access admin routes if they have a valid token

**Routes That Should Be Admin-Only:**

- `/api/admin/stats` - Dashboard statistics
- `/api/admin/users` - User management
- `/api/admin/orders` - Order management
- `/api/admin/analytics` - Analytics data
- `/api/admin/email/*` - Email management

### 5. Client-Side Admin Verification

**Frontend Protection** (`client/src/pages/AdminDashboard.jsx`):

```javascript
useEffect(() => {
  if (user && user.isAdmin) {
    // Allow access to admin features
  } else {
    navigate("/"); // Redirect non-admin users
  }
}, [user, navigate]);
```

**Issues:**

- Client-side only protection (can be bypassed)
- No server-side admin verification in routes

### 6. Current Admin Capabilities

**Dashboard Statistics:**

- View total users, books, orders
- Monitor sales revenue
- Track stock alerts

**User Management:**

- View all users with pagination
- Update user roles (admin/user)
- Delete users

**Order Management:**

- View all orders with details
- Update order status (pending, processing, shipped, delivered, cancelled)
- Send order shipped emails

**Book Management:**

- Create, edit, delete books
- Manage categories
- Upload book images
- Stock management with alerts

**Email Management:**

- Send promotional emails to all users
- Send promotional emails to specific users
- Send order shipped notifications
- View email subscription statistics

**Analytics:**

- Sales data for last 12 months
- Top selling books
- Category sales analysis
- Recent orders

### 7. Security Vulnerabilities

#### Critical Issues:

1. **No Server-Side Admin Verification**

   - Admin routes don't check `isAdmin` status
   - Any authenticated user can access admin endpoints

2. **Weak Default Credentials**

   - Default admin password (`admin123`) is easily guessable
   - Should be changed immediately in production

3. **Client-Side Only Protection**
   - Admin access can be bypassed by modifying client-side code
   - No server-side enforcement

#### Medium Issues:

1. **Role Management Inconsistency**

   - User model has `isAdmin` field
   - Admin controller tries to update `role` field (doesn't exist)
   - Inconsistent role system

2. **No Admin Activity Logging**
   - No audit trail for admin actions
   - Difficult to track malicious admin activity

### 8. Email Controller Admin Verification

**Positive Example** (`server/controllers/emailController.js`):

```javascript
// Check if user is admin
if (!req.user.isAdmin) {
  return res.status(403).json({ message: "Access denied. Admin only." });
}
```

This pattern should be applied to all admin controllers.

## Recommendations

### Immediate Actions (High Priority):

1. **Add Admin Middleware**

   ```javascript
   const adminMiddleware = (req, res, next) => {
     if (!req.user.isAdmin) {
       return res.status(403).json({ message: "Access denied. Admin only." });
     }
     next();
   };
   ```

2. **Update Admin Routes**

   ```javascript
   router.get(
     "/stats",
     authMiddleware,
     adminMiddleware,
     adminController.getDashboardStats
   );
   ```

3. **Fix Role Management**

   - Decide between `isAdmin` boolean or `role` string
   - Update admin controller accordingly
   - Update client-side to match server implementation

4. **Change Default Admin Credentials**
   - Update `createAdmin.js` with secure random password
   - Document initial setup process

### Medium Priority:

1. **Add Activity Logging**

   - Log all admin actions with timestamps
   - Track who made changes and when

2. **Admin Audit Trail**

   - Create separate logging system
   - Monitor suspicious admin activity

3. **Enhanced Admin Features**
   - Admin role hierarchy
   - Temporary admin access
   - Admin session management

### Long-term Improvements:

1. **Multi-Factor Authentication**

   - Require 2FA for admin accounts
   - Enhanced security for sensitive operations

2. **Admin Permissions System**

   - Granular permissions (book management, user management, etc.)
   - Role-based access control (RBAC)

3. **Admin Dashboard Improvements**
   - Real-time notifications
   - Advanced analytics
   - Bulk operations

## Current Admin Access Process

1. **Login**: User logs in with admin credentials
2. **Token Generation**: Server generates JWT with admin status
3. **Client Verification**: Frontend checks `user.isAdmin`
4. **Dashboard Access**: Admin dashboard loads if client-side check passes
5. **API Calls**: Frontend makes requests with admin token

## Security Status: ⚠️ VULNERABLE

The current admin system has **critical security vulnerabilities** due to missing server-side admin verification. Any authenticated user can potentially access admin functionality by manipulating client-side code or API requests.

**Risk Level**: HIGH - Immediate action required
