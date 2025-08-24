const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  preferences: {
    vegetarian: { type: Boolean, default: false },
    vegan: { type: Boolean, default: false },
    spicy: { type: Boolean, default: false },
    sweet: { type: Boolean, default: false },
    glutenFree: { type: Boolean, default: false },
    dairyFree: { type: Boolean, default: false }
  },
  tasteHistory: [{
    ingredients: [String],
    prediction: String,
    confidence: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  savedRecipes: [{
    name: String,
    ingredients: [String],
    instructions: [String],
    prepTime: String,
    cookTime: String,
    serves: Number,
    savedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash password before saving - FIXED VERSION
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash the password with bcrypt
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method - FIXED VERSION
userSchema.methods.correctPassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
