/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * api.js — Centralized HTTP client
 * All backend requests go through this module.
 * Automatically attaches JWT Bearer token from
 * localStorage and handles 401 token expiry.
 * ==========================================
 */

// Backend base URL — falls back to local dev server if env var is not set
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Core API helper with auth headers and error handling.
 * All public methods delegate to `request()` internally.
 */
const api = {
  /**
   * request(endpoint, options)
   * The single entry point for all HTTP calls.
   * - Reads the JWT from localStorage (client-side only).
   * - Merges it as an Authorization: Bearer header.
   * - Parses JSON and throws on non-2xx responses.
   * - On 401/unauthorized, clears the stale token and force-navigates to /login.
   */
  async request(endpoint, options = {}) {
    // Only access localStorage in the browser (not during SSR)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }), // Attach JWT if present
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        // Backend may return either { message: '...' } or { errors: [{ msg: '...' }] }
        const errMsg = data.message
          || (data.errors && data.errors[0]?.msg)
          || 'Something went wrong';
        throw new Error(errMsg);
      }

      return data;
    } catch (error) {
      // If token is expired/invalid, clear it and redirect to login
      if (error.message?.includes('Not authorized')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      throw error;
    }
  },

  // ==============================
  // Auth Endpoints (/auth/*)
  // ==============================

  /** Registers a new user account — returns { token, user } */
  async register(name, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  /** Authenticates an existing user — returns { token, user } */
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  /** Fetches the currently authenticated user's profile */
  async getMe() {
    return this.request('/auth/me');
  },

  // ==============================
  // Trip Endpoints (/trips/*)
  // ==============================

  /** Creates a new AI-generated trip document */
  async createTrip(tripData) {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    });
  },

  /** Returns all trips belonging to the authenticated user */
  async getTrips() {
    return this.request('/trips');
  },

  /** Returns a single trip document by its MongoDB ID */
  async getTrip(id) {
    return this.request(`/trips/${id}`);
  },

  /** Partially updates a trip (hotels, packing list, etc.) */
  async updateTrip(id, data) {
    return this.request(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /** Permanently deletes a trip document */
  async deleteTrip(id) {
    return this.request(`/trips/${id}`, {
      method: 'DELETE',
    });
  },

  // ==============================
  // AI Feature Endpoints
  // ==============================

  /**
   * Triggers the AI to regenerate a single day's itinerary.
   * Optional preference string guides the output tone/focus.
   */
  async regenerateDay(tripId, dayNumber, preference = '') {
    return this.request(`/trips/${tripId}/regenerate-day`, {
      method: 'POST',
      body: JSON.stringify({ dayNumber, preference }),
    });
  },

  /** Adds a custom activity object to a specific day in the itinerary */
  async addActivity(tripId, dayNumber, activity) {
    return this.request(`/trips/${tripId}/add-activity`, {
      method: 'POST',
      body: JSON.stringify({ dayNumber, activity }),
    });
  },

  /** Removes an activity from a specific day by its index */
  async removeActivity(tripId, dayNumber, activityIndex) {
    return this.request(`/trips/${tripId}/remove-activity`, {
      method: 'POST',
      body: JSON.stringify({ dayNumber, activityIndex }),
    });
  },

  /** Triggers AI to generate a smart packing list for the trip */
  async generatePackingList(tripId) {
    return this.request(`/trips/${tripId}/generate-packing-list`, {
      method: 'POST',
    });
  },
};

export default api;
