# YK Collection - Neon Database Setup Guide

## Getting Started with Neon

### 1. Create a Neon Account
- Visit [neon.tech](https://neon.tech)
- Sign up with your email
- Create a new project

### 2. Get Your Connection String
After creating a project:
1. Go to **Dashboard** → Your Project
2. Click on **Connection string**
3. Copy the **PostgreSQL** connection string
4. It should look like: `postgresql://user:password@ep-xxxx-xxxx.neon.tech/database?sslmode=require`

### 3. Setup Environment Variables

**Local Development:**
1. Copy `.env.example` to `.env`
2. Replace the `DATABASE_URL` with your Neon connection string
3. Set a strong `JWT_SECRET` (for admin authentication)
4. Set `ADMIN_PASSWORD` to your preferred admin password

```bash
DATABASE_URL=postgresql://user:password@ep-xxxx-xxxx.neon.tech/yk_collection?sslmode=require
JWT_SECRET=your-super-secret-key-change-this
ADMIN_PASSWORD=your-admin-password
PORT=3000
NODE_ENV=development
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Your server should now be running at `http://localhost:3000`

---

## Database Schema

The following tables are automatically created:

### Products
- Stores product information
- Supports categories, pricing, images, descriptions

### Reviews
- Customer reviews and ratings
- Linked to products

### Orders
- Complete order records
- Tracks customer info and status

### Order Items
- Individual items within an order
- Tracks quantity, size, and price

### Feedback
- Customer complaints, suggestions, and compliments

### Contact Messages
- Messages from the contact form

### Users
- Reserved for future user authentication

---

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products?category=clothing-male` - Filter by category
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Add product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Reviews
- `GET /api/products/:id/reviews` - Get reviews for product
- `POST /api/products/:id/reviews` - Add review

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (admin only)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (admin only)

### Feedback
- `POST /api/feedback` - Submit feedback
- `GET /api/feedback` - Get all feedback (admin only)

### Contact
- `POST /api/contact` - Submit contact message
- `GET /api/contact` - Get all messages (admin only)

### Admin
- `POST /api/admin/login` - Get JWT token

---

## Frontend Integration

Update your `script.js` to use the API endpoints:

```javascript
// Example: Fetch products
async function fetchProducts(category = null) {
  const url = category 
    ? `/api/products?category=${category}`
    : '/api/products';
  
  const response = await fetch(url);
  return await response.json();
}

// Example: Submit order
async function submitOrder(orderData) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  return await response.json();
}

// Example: Submit feedback
async function submitFeedback(feedbackData) {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedbackData)
  });
  return await response.json();
}
```

---

## Deployment to Vercel

### 1. Create GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/yk-collection.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project" → Import GitHub repository
3. Select your repository
4. Add environment variables:
   - `DATABASE_URL` (your Neon connection string)
   - `JWT_SECRET` (strong random string)
   - `ADMIN_PASSWORD` (your admin password)
5. Click "Deploy"

### 3. Configure Neon for Vercel
In Neon dashboard:
1. Go to **Project Settings** → **Connection Pooling**
2. Enable connection pooling
3. Use the pooling connection string (better for serverless)

---

## Security Checklist

- [ ] Create `.env` file locally (never commit it)
- [ ] Use a strong JWT_SECRET
- [ ] Use a strong ADMIN_PASSWORD
- [ ] Enable SSL/TLS in Neon (default)
- [ ] Never expose DATABASE_URL in frontend code
- [ ] Use environment variables for all sensitive data
- [ ] Consider using bcrypt for admin password hashing in production

---

## Troubleshooting

### Connection Error: "could not translate host name"
- Check your `DATABASE_URL` is correct
- Ensure Neon project is active
- Test connection in Neon dashboard

### Timeout Errors
- Enable connection pooling in Neon
- Reduce query timeouts
- Check Neon query analytics

### Admin Login Not Working
- Verify `ADMIN_PASSWORD` matches in `.env`
- Check JWT_SECRET is set
- Look at server logs for errors

---

## Next Steps

1. Integrate API calls in your frontend JavaScript
2. Test all endpoints locally
3. Add error handling and validation
4. Set up admin dashboard for product management
5. Deploy to Vercel
6. Monitor performance in Neon dashboard
