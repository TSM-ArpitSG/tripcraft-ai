/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * ==========================================
 */

const mongoose = require('mongoose');

/**
 * Initializes the connection to the MongoDB database using Mongoose.
 * Logs a success message if connected, or catches and logs connection errors.
 * Note: The server continues running even if the DB fails to connect,
 * allowing API endpoints to return graceful error messages instead of crashing.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    // Don't crash the server — let it start so we can show proper error responses
    console.error('Server running without database connection. Fix MONGO_URI and restart.');
  }
};

module.exports = connectDB;
