/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * ==========================================
 */

const mongoose = require('mongoose');

/**
 * Schema for an individual activity within a day's itinerary.
 */
const activitySchema = new mongoose.Schema({
  time: { type: String, default: '' },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  estimatedCost: { type: String, default: '' },
});

/**
 * Schema for a single day in the travel itinerary.
 * Contains multiple activities for that specific day.
 */
const daySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  title: { type: String, default: '' },
  activities: [activitySchema],
});

/**
 * Schema for the estimated travel budget breakdown.
 */
const budgetSchema = new mongoose.Schema({
  flights: { type: String, default: '$0' },
  accommodation: { type: String, default: '$0' },
  food: { type: String, default: '$0' },
  activities: { type: String, default: '$0' },
  transportation: { type: String, default: '$0' },
  miscellaneous: { type: String, default: '$0' },
  total: { type: String, default: '$0' },
});

/**
 * Schema for suggested hotels/accommodations.
 */
const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: '' },      // Budget, Mid-Range, Luxury
  priceRange: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  description: { type: String, default: '' },
  amenities: [{ type: String }],
});

/**
 * Schema for an individual item in the smart packing list.
 */
const packingItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  category: { type: String, default: 'General' }, // Essentials, Clothing, Electronics, etc.
  packed: { type: Boolean, default: false },
});

/**
 * Main Trip Schema representing a complete travel plan.
 * Contains user preferences and the AI-generated dynamic sub-documents
 * (itinerary, budget, hotels, packing list).
 */
const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: {
      type: String,
      required: [true, 'Please provide a destination'],
      trim: true,
    },
    days: {
      type: Number,
      required: [true, 'Please provide the number of days'],
      min: [1, 'Trip must be at least 1 day'],
      max: [30, 'Trip cannot exceed 30 days'],
    },
    budgetType: {
      type: String,
      required: [true, 'Please select a budget type'],
    },
    interests: [
      {
        type: String,
        trim: true,
      },
    ],
    itinerary: [daySchema],
    budget: budgetSchema,
    hotels: [hotelSchema],
    packingList: [packingItemSchema],
    status: {
      type: String,
      enum: ['draft', 'generated', 'modified'],
      default: 'draft',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Trip', tripSchema);
