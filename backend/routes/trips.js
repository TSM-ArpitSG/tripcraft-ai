/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * ==========================================
 */

const express = require('express');
const Trip = require('../models/Trip');
const { protect } = require('../middleware/auth');
const {
  generateItinerary,
  estimateBudget,
  suggestHotels,
  generatePackingList,
  regenerateDay,
  validateDestination,
} = require('../services/aiService');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/trips
 * @desc    Creates a new trip draft and generates AI content in parallel.
 *          Checks for duplicates before burning AI API quota.
 * @access  Private (Requires JWT)
 */
router.post('/', async (req, res) => {
  try {
    const { destination, days, budgetType, interests } = req.body;

    if (!destination || !days || !budgetType || !interests?.length) {
      return res.status(400).json({
        success: false,
        message: 'Wait a sec! You forgot to pack some essential details. We need destination, days, budget, and interests to chart your course.',
      });
    }

    // ==========================================
    // AI DESTINATION VALIDATION
    // Intercepts the request to ensure the user-provided destination actually exists,
    // leveraging the fast 'Flash Lite' model via aiService to save main quota.
    // ==========================================
    const isValidDest = await validateDestination(destination);
    if (!isValidDest) {
      return res.status(400).json({
        success: false,
        message: `Oops! We couldn't find "${destination}" on any of our maps. Please enter a valid city, country, or landmark to continue your journey!`,
      });
    }

    // Duplicate Check logic
    const existingTrips = await Trip.find({
      userId: req.user._id,
      destination: new RegExp(`^${destination}$`, 'i'), // Case-insensitive exact match
    });

    if (existingTrips.length > 0) {
      // Check for EXACT match
      const exactMatch = existingTrips.find(
        (t) =>
          t.days === days &&
          t.budgetType === budgetType &&
          JSON.stringify(t.interests.sort()) === JSON.stringify([...interests].sort())
      );

      if (exactMatch) {
         // Silently return the existing exact match instead of running AI
         return res.status(200).json({
           success: true,
           message: 'Deja vu! We found this exact itinerary already packed for you.',
           trip: exactMatch,
         });
      }

      // It's a partial match (Same destination, different days/budget/interests)
      return res.status(409).json({
        success: false,
        message: `Whoa traveler! You already have a trip brewing for ${destination}. How about checking your dashboard and modifying that one instead of overpacking your itinerary?`,
      });
    }

    // Create the trip first (draft)
    const trip = await Trip.create({
      userId: req.user._id,
      destination,
      days,
      budgetType,
      interests,
      status: 'draft',
    });

    // Generate all AI content in parallel
    try {
      const [itinerary, budget, hotels, packingList] = await Promise.all([
        generateItinerary(destination, days, interests, budgetType),
        estimateBudget(destination, days, budgetType),
        suggestHotels(destination, budgetType),
        generatePackingList(destination, days, interests, budgetType),
      ]);

      if (budget.error === 'BUDGET_TOO_LOW') {
        throw new Error(`BUDGET_TOO_LOW|${budget.minimumRequired}`);
      }

      trip.itinerary = itinerary;
      trip.budget = budget;
      trip.hotels = hotels;
      trip.packingList = packingList;
      trip.status = 'generated';
      await trip.save();
    } catch (aiError) {
      console.error('AI generation ultimate failure:', aiError);
      // Delete the empty dummy trip if generation truly failed
      await Trip.findByIdAndDelete(trip._id);
      throw aiError; // pass up to main error handler
    }

    res.status(201).json({
      success: true,
      trip,
    });
  } catch (error) {
    console.error('Create trip error:', error);
    
    // Check specific custom errors
    if (error.message.startsWith('BUDGET_TOO_LOW')) {
       const minReq = error.message.split('|')[1] || '$XXX';
       return res.status(400).json({
         success: false,
         message: `Whoops! Your budget is a bit too tight for this destination. You'll need at least ${minReq} to make this trip possible. Try increasing your budget!`,
       });
    }

    if (error.message.includes('429') || error.message.includes('quota')) {
       return res.status(429).json({
         success: false,
         message: "Hey, chill out. The AI engines are temporarily overwhelmed (Too Many Requests). Let's wait a minute and try again!",
       });
    }
    
    res.status(500).json({
      success: false,
      message: 'Yikes! A gremlin got into the engine room while packing your bags. Please try again later.',
    });
  }
});

/**
 * @route   GET /api/trips
 * @desc    Retrieves all trips belonging to the authenticated user.
 *          Sorted by creation date (newest first).
 * @access  Private
 */
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, trips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Our maps are tangled! We could not fetch your trips right now.' });
  }
});

/**
 * @route   GET /api/trips/:id
 * @desc    Retrieves a single trip by ID.
 *          Validates that the trip belongs to the authenticated user.
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Data isolation: check ownership
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this trip',
      });
    }

    res.json({ success: true, trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Our compass is spinning! We could not fetch that specific trip.' });
  }
});

/**
 * @route   PUT /api/trips/:id
 * @desc    Updates specific fields of the trip (like manual itinerary edits).
 * @access  Private
 */
router.put('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this trip',
      });
    }

    // Update allowed fields
    const { itinerary, packingList, hotels } = req.body;
    if (itinerary) trip.itinerary = itinerary;
    if (packingList) trip.packingList = packingList;
    if (hotels) trip.hotels = hotels;
    trip.status = 'modified';

    await trip.save();
    res.json({ success: true, trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to pencil in those modifications. Try again in a bit!' });
  }
});

/**
 * @route   DELETE /api/trips/:id
 * @desc    Deletes a trip from the database permanently.
 * @access  Private
 */
router.delete('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this trip',
      });
    }

    await Trip.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Trip deleted successfully. Packing list tossed!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ah! The shredder jammed. We couldn’t delete this trip.' });
  }
});

/**
 * @route   POST /api/trips/:id/regenerate-day
 * @desc    Calls the AI service to rewrite a single day of the itinerary.
 *          Accepts optional user preferences for the regeneration.
 * @access  Private
 */
router.post('/:id/regenerate-day', async (req, res) => {
  try {
    const { dayNumber, preference } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const newDay = await regenerateDay(
      trip.destination,
      dayNumber,
      trip.days,
      trip.interests,
      trip.budgetType,
      preference || ''
    );

    // Replace the day in itinerary
    const dayIndex = trip.itinerary.findIndex(
      (d) => d.dayNumber === dayNumber
    );
    if (dayIndex !== -1) {
      trip.itinerary[dayIndex] = newDay;
    } else {
      trip.itinerary.push(newDay);
    }

    trip.status = 'modified';
    await trip.save();

    res.json({ success: true, trip });
  } catch (error) {
    console.error('Regenerate day error:', error);
    res.status(500).json({
      success: false,
      message: 'Whoa there! The travel gods are busy right now. Please wait a minute before regenerating a day.',
    });
  }
});

/**
 * @route   POST /api/trips/:id/add-activity
 * @desc    Manually adds a user-defined activity to a specific day in the itinerary.
 * @access  Private
 */
router.post('/:id/add-activity', async (req, res) => {
  try {
    const { dayNumber, activity } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const day = trip.itinerary.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      return res.status(404).json({ success: false, message: 'Day not found in itinerary' });
    }

    // Map `title` to `name` if user passed `title` by accident
    const newActivity = {
      name: activity.name || activity.title,
      description: activity.description || '',
      time: activity.time || '',
      estimatedCost: activity.estimatedCost || '',
    };
    
    if (!newActivity.name) {
       return res.status(400).json({ success: false, message: 'You forgot to name the activity!' });
    }

    day.activities.push(newActivity);
    trip.markModified('itinerary');
    trip.status = 'modified';
    await trip.save();

    res.json({ success: true, trip });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Our clipboard broke! Failed to add that activity to your day.' });
  }
});

/**
 * @route   POST /api/trips/:id/remove-activity
 * @desc    Removes an activity from a specific day using its array index.
 * @access  Private
 */
router.post('/:id/remove-activity', async (req, res) => {
  try {
    const { dayNumber, activityIndex } = req.body;
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const day = trip.itinerary.find((d) => d.dayNumber === dayNumber);
    if (!day) {
      return res.status(404).json({ success: false, message: 'Day not found' });
    }

    day.activities.splice(activityIndex, 1);
    trip.markModified('itinerary');
    trip.status = 'modified';
    await trip.save();

    res.json({ success: true, trip });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cross that off your list. Make sure the activity exists!',
    });
  }
});

/**
 * @route   POST /api/trips/:id/generate-packing-list
 * @desc    Calls the AI service to independently regenerate the packing list.
 * @access  Private
 */
router.post('/:id/generate-packing-list', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const packingList = await generatePackingList(
      trip.destination,
      trip.days,
      trip.interests,
      trip.budgetType
    );

    trip.packingList = packingList;
    await trip.save();

    res.json({ success: true, trip });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Your suitcase is taking a breather! We’ve hit our generation limit—try again shortly.',
    });
  }
});

module.exports = router;
