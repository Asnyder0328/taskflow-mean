const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
  password: { type: String, required: true, minlength: 6, select: false },
  avatarColor: { type: String, default: () => ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6'][Math.floor(Math.random()*5)] }
}, { timestamps: true });
userSchema.pre('save', async function(next){ if(!this.isModified('password')) return next(); this.password = await bcrypt.hash(this.password, 12); next(); });
userSchema.methods.comparePassword = function(c){ return bcrypt.compare(c, this.password); };
module.exports = mongoose.model('User', userSchema);
