/**
 * ==========================================
 * Developed by Arpit Singh
 * Project: TripCraft AI - Travel Planner
 * ==========================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Main schema for authenticating users.
 * Stores basic profile information and securely hashed passwords.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Mongoose pre-save hook to hash the user's password before saving to the DB.
 * Only runs if the password field has been modified (or is new).
 * Uses bcryptjs to salt and hash the password for security.
 */
// Hash password before saving (Mongoose 9+ async hooks — no next() needed)
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance method to compare an incoming plaintext password
 * against the hashed password saved in the database.
 * 
 * @param {String} candidatePassword - The plaintext password to verify
 * @returns {Boolean} - True if passwords match, false otherwise
 */
// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
