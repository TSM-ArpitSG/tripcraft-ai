/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * ==========================================
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

/**
 * Global Middleware Configuration
 * - cors: Enables cross-origin requests from the frontend client.
 * - express.json: Parses incoming JSON payloads.
 */
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🌍 AI Travel Planner API is running!',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Route Mounting
 * - /api/auth: Handles user registration, login, and token verification.
 * - /api/trips: Handles CRUD operations and AI generations for travel itineraries.
 */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}\n`);
});
