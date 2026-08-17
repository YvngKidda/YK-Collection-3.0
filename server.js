import dotenv from 'dotenv';

// Load environment variables FIRST before anything else
dotenv.config();

console.log('🔧 Environment loaded. DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');

import express from 'express';
import cors from 'cors';
import pool from './server/db.js';
import { initializeDatabase } from './server/schema.js';
import * as queries from './server/queries.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('./.vscode'));

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Initialize database on startup
app.listen(PORT, async () => {
  try {
    await initializeDatabase();
    console.log(`✓ Connected to Neon PostgreSQL Database`);
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Visit http://localhost:${PORT} to see your store`);
  } catch (error) {
    console.warn('⚠️  Database connection failed:', error.message);
    console.log(`✓ Server starting anyway on port ${PORT} (frontend only)`);
    console.log(`✓ Visit http://localhost:${PORT} to see your store`);
    console.log(`✓ API endpoints will fail until database is connected`);
  }
});

// ===== PRODUCTS API =====

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const category = req.query.category;
    const products = await queries.getProducts(category);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await queries.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add product (admin only)
app.post('/api/products', verifyAdmin, async (req, res) => {
  try {
    const product = await queries.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product (admin only)
app.put('/api/products/:id', verifyAdmin, async (req, res) => {
  try {
    const product = await queries.updateProduct(req.params.id, req.body);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', verifyAdmin, async (req, res) => {
  try {
    await queries.deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== REVIEWS API =====

// Get reviews for a product
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const reviews = await queries.getProductReviews(req.params.id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add review
app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const review = await queries.addReview(req.params.id, req.body);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ORDERS API =====

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const order = await queries.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all orders (admin only)
app.get('/api/orders', verifyAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const orders = await queries.getOrders(limit, offset);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await queries.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (admin only)
app.put('/api/orders/:id', verifyAdmin, async (req, res) => {
  try {
    const order = await queries.updateOrderStatus(req.params.id, req.body.status);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== FEEDBACK API =====

// Add feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const feedback = await queries.addFeedback(req.body);
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all feedback (admin only)
app.get('/api/feedback', verifyAdmin, async (req, res) => {
  try {
    const feedback = await queries.getAllFeedback();
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CONTACT API =====

// Add contact message
app.post('/api/contact', async (req, res) => {
  try {
    const message = await queries.addContactMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all contact messages (admin only)
app.get('/api/contact', verifyAdmin, async (req, res) => {
  try {
    const messages = await queries.getAllContactMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ADMIN AUTH =====

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { password } = req.body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  
  try {
    if (password === ADMIN_PASSWORD) {
      const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, success: true });
    } else {
      res.status(401).json({ error: 'Invalid password' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

export default app;
