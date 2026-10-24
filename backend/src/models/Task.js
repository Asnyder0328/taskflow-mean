const mongoose = require('mongoose');
const taskSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 140 },
  description: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: ['todo','in-progress','done'], default: 'todo', index: true },
  priority: { type: String, enum: ['low','medium','high','urgent'], default: 'medium', index: true },
  dueDate: { type: Date },
  tags: [{ type: String, trim: true, lowercase: true }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  completedAt: { type: Date }
}, { timestamps: true });
taskSchema.pre('save', function(next){ if(this.isModified('status')) this.completedAt = this.status==='done' ? new Date() : null; next(); });
module.exports = mongoose.model('Task', taskSchema);
