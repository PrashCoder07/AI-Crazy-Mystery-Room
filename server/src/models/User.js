import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  _id: { type: String },
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.models.User || mongoose.model('User', userSchema);
