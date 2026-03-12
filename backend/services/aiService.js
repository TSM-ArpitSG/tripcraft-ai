/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * ==========================================
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Primary model for heavy operations like itinerary generation
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
// Lightweight, free-tier model strictly mapped for high-volume True/False boolean checks and as a fallback
const lightModel = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite-preview' });

/**
 * Generates a day-by-day travel itinerary using the Gemini 2.5 Flash model.
 * 
 * @param {String} destination - The travel destination (e.g., "Tokyo")
 * @param {Number} days - Total duration of the trip
 * @param {Array<String>} interests - User's selected interests (e.g., "culture", "food")
 * @param {String} budgetType - One of "Low", "Medium", "High"
 * @returns {Array<Object>} Parssed JSON array representing the day-by-day itinerary.
 */
const generateItinerary = async (destination, days, interests, budgetType) => {
  const prompt = `You are an expert travel planner. Generate a detailed ${days}-day travel itinerary for ${destination}.

Budget Level/Constraint: ${budgetType}
Interests: ${interests.join(', ')}

IMPORTANT: Budget constraint MUST BE STRICTLY ADHERED TO. If a custom dollar amount like "$5" or "$100" is provided, YOU MUST NOT exceed it across the ENTIRE TRIP. Suggest free or extremely cheap activities (e.g., walking tours, public parks, window shopping) if the budget is very low.

IMPORTANT: Return ONLY valid JSON, no markdown, no code fences, no extra text.

Return this exact JSON structure:
[
  {
    "dayNumber": 1,
    "title": "Day title (e.g. 'Exploring Old Town')",
    "activities": [
      {
        "time": "9:00 AM",
        "name": "Activity name",
        "description": "Brief description of the activity (2-3 sentences)",
        "estimatedCost": "$XX"
      }
    ]
  }
]

Each day should have 4-5 activities. Activities should match the ${budgetType} budget level and the traveler's interests (${interests.join(', ')}). Include specific real places, restaurants, and attractions in ${destination}. Make the itinerary practical and realistic.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const cleanJson = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn('AI Itinerary Generation: Primary model failed. Falling back to light model...', error.message);
    try {
      const fallbackResult = await lightModel.generateContent(prompt);
      const fallbackResponse = fallbackResult.response.text();
      const cleanFallbackJson = fallbackResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return JSON.parse(cleanFallbackJson);
    } catch (fallbackError) {
      console.error('AI Itinerary Generation Error (Fallback also failed):', fallbackError);
      throw new Error('Failed to generate itinerary. Please try again.');
    }
  }
};

/**
 * Validates if the given string is a real-world travel destination.
 * Uses the lighter Gemini Flash Lite model to save API costs & rate limits.
 * 
 * @param {String} destination - User raw input destination
 * @returns {Boolean} True if valid, False if nonsense
 */
const validateDestination = async (destination) => {
  // Strict prompt engineered to force a boolean YES/NO response
  const prompt = `Is "${destination}" a valid, real-world city, country, region, landmark, or geographical travel destination? 
Answer EXACTLY with ONLY the word YES or NO. Do not include any punctuation or extra text.`;
  
  try {
    const result = await lightModel.generateContent(prompt);
    const response = result.response.text().trim().toUpperCase();
    return response === 'YES';
  } catch (error) {
    console.error('AI Destination Validation Error:', error);
    // If validation fails due to quota, allow it through to let the main generation handle/fail gracefully
    return true; 
  }
};

/**
 * Estimates the travel budget broken down by categories.
 * 
 * @param {String} destination - The travel destination
 * @param {Number} days - Total duration
 * @param {String} budgetType - Overall budget level (Low/Medium/High)
 * @returns {Object} Parsed JSON object containing the estimated cost breakdown.
 */
const estimateBudget = async (destination, days, budgetType) => {
  const prompt = `You are a travel budget expert. Estimate the total travel budget for a ${days}-day trip to ${destination} with a ${budgetType} budget level.

IMPORTANT: Budget constraint MUST BE STRICTLY ADHERED TO. If a custom dollar amount like "$5" or "$100" is provided, the TOTAL cost across all categories MUST NOT exceed that amount. 

CRITICAL EXCEPTION RULE: If the budget is fundamentally impossible for the destination and duration (e.g., $5 for a 3-day trip anywhere), you MUST return the following exact JSON object instead of breaking down the budget:
{
  "error": "BUDGET_TOO_LOW",
  "minimumRequired": "$XXX"
}
Replace $XXX with a realistic minimum amount required.

IMPORTANT: Return ONLY valid JSON, no markdown, no code fences, no extra text.

Return this exact JSON structure (unless using the error rule above):
{
  "flights": "$XXX",
  "accommodation": "$XXX",
  "food": "$XXX",
  "activities": "$XXX",
  "transportation": "$XXX",
  "miscellaneous": "$XXX",
  "total": "$X,XXX"
}

Be realistic with prices. Consider typical costs for ${destination}. Budget levels:
- Low: Hostels, street food, free attractions, public transport
- Medium: 3-star hotels, casual restaurants, mix of paid/free attractions
- High: 4-5 star hotels, fine dining, premium attractions, private transport`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanJson = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn('AI Budget Estimation: Primary model failed. Falling back to light model...', error.message);
    try {
       const fallbackResult = await lightModel.generateContent(prompt);
       const fallbackResponse = fallbackResult.response.text();
       const cleanFallbackJson = fallbackResponse
         .replace(/```json\n?/g, '')
         .replace(/```\n?/g, '')
         .trim();
       return JSON.parse(cleanFallbackJson);
    } catch (fallbackError) {
       console.error('AI Budget Estimation Error (Fallback also failed):', fallbackError);
       throw new Error('Failed to estimate budget. Please try again.');
    }
  }
};

/**
 * Suggests accommodation based on destination and budget string.
 * Ensures a mix of Budget, Mid-Range, and Luxury options.
 * 
 * @param {String} destination - The travel destination
 * @param {String} budgetType - Base budget level
 * @returns {Array<Object>} Parsed JSON array of 6 suggested hotels.
 */
const suggestHotels = async (destination, budgetType) => {
  const prompt = `You are a hotel recommendation expert. Suggest 6 hotels in ${destination} for a ${budgetType} budget traveler.

IMPORTANT: Return ONLY valid JSON, no markdown, no code fences, no extra text.

Return this exact JSON structure:
[
  {
    "name": "Hotel name",
    "category": "Budget Friendly | Mid Range | Luxury",
    "priceRange": "$XX - $XXX per night",
    "rating": 4.5,
    "description": "Brief description (1-2 sentences)",
    "amenities": ["WiFi", "Pool", "Breakfast"]
  }
]

Include 2 budget, 2 mid-range, and 2 luxury options. Use real or realistic hotel names for ${destination}. Ratings should be between 3.0 and 5.0.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanJson = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn('AI Hotel Suggestion: Primary model failed. Falling back to light model...', error.message);
    try {
      const fallbackResult = await lightModel.generateContent(prompt);
      const fallbackResponse = fallbackResult.response.text();
      const cleanFallbackJson = fallbackResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return JSON.parse(cleanFallbackJson);
    } catch (fallbackError) {
      console.error('AI Hotel Suggestion Error (Fallback also failed):', fallbackError);
      throw new Error('Failed to suggest hotels. Please try again.');
    }
  }
};

/**
 * Generates a smart, contextual packing list based on the user's trip details.
 * Categorizes items into Essentials, Clothing, Electronics, etc.
 * 
 * @param {String} destination - Travel destination
 * @param {Number} days - Trip duration
 * @param {Array<String>} interests - Planned activities
 * @param {String} budgetType - Base budget level
 * @returns {Array<Object>} Parsed JSON array representing the packing checklist.
 */
const generatePackingList = async (destination, days, interests, budgetType) => {
  const prompt = `You are a travel packing expert. Generate a comprehensive, smart packing checklist for a ${days}-day trip to ${destination}.

Budget Level: ${budgetType}
Planned Activities/Interests: ${interests.join(', ')}

IMPORTANT: Return ONLY valid JSON, no markdown, no code fences, no extra text.

Return this exact JSON structure:
[
  {
    "item": "Item name",
    "category": "Essentials | Clothing | Electronics | Toiletries | Activity-Specific | Documents | Health & Safety",
    "packed": false
  }
]

Consider:
- Weather/climate of ${destination}
- Duration of ${days} days
- Activities: ${interests.join(', ')}
- Practical items travelers often forget
- Include 20-30 items total across categories
- Be specific (e.g., "Lightweight rain jacket" not just "jacket")`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanJson = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn('AI Packing List: Primary model failed. Falling back to light model...', error.message);
    try {
       const fallbackResult = await lightModel.generateContent(prompt);
       const fallbackResponse = fallbackResult.response.text();
       const cleanFallbackJson = fallbackResponse
         .replace(/```json\n?/g, '')
         .replace(/```\n?/g, '')
         .trim();
       return JSON.parse(cleanFallbackJson);
    } catch (fallbackError) {
       console.error('AI Packing List Error (Fallback also failed):', fallbackError);
       throw new Error('Failed to generate packing list. Please try again.');
    }
  }
};

/**
 * Regenerates the itinerary for a specific day, optionally factoring in
 * new preferences supplied by the user.
 * 
 * @param {String} destination - Travel destination
 * @param {Number} dayNumber - The specific day to regenerate
 * @param {Number} totalDays - The total length of the trip (for context)
 * @param {Array<String>} interests - Base interests
 * @param {String} budgetType - Overall budget level
 * @param {String} [preference=''] - Optional new constraints (e.g., "more museum time")
 * @returns {Object} Parsed JSON object of the single regenerated day.
 */
const regenerateDay = async (destination, dayNumber, totalDays, interests, budgetType, preference = '') => {
  const prefText = preference ? `User preference: "${preference}". ` : '';

  const prompt = `You are an expert travel planner. Regenerate Day ${dayNumber} of a ${totalDays}-day trip to ${destination}.

Budget Level: ${budgetType}
Interests: ${interests.join(', ')}
${prefText}

IMPORTANT: Return ONLY valid JSON, no markdown, no code fences, no extra text.

Return this exact JSON structure:
{
  "dayNumber": ${dayNumber},
  "title": "Day title",
  "activities": [
    {
      "time": "9:00 AM",
      "name": "Activity name",
      "description": "Brief description (2-3 sentences)",
      "estimatedCost": "$XX"
    }
  ]
}

Include 4-5 activities for the day. ${prefText}Use real places and attractions in ${destination}. Make activities match the ${budgetType} budget level.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanJson = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.warn('AI Day Regeneration: Primary model failed. Falling back to light model...', error.message);
    try {
      const fallbackResult = await lightModel.generateContent(prompt);
      const fallbackResponse = fallbackResult.response.text();
      const cleanFallbackJson = fallbackResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return JSON.parse(cleanFallbackJson);
    } catch (fallbackError) {
      console.error('AI Day Regeneration Error (Fallback also failed):', fallbackError);
      throw new Error('Failed to regenerate day. Please try again.');
    }
  }
};

module.exports = {
  validateDestination,
  generateItinerary,
  estimateBudget,
  suggestHotels,
  generatePackingList,
  regenerateDay,
};
