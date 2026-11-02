import mongoose from 'mongoose';

const mysterySchema = new mongoose.Schema({
  _id: { type: String },
  publicData: { type: mongoose.Schema.Types.Mixed, required: true },
  solution: { type: mongoose.Schema.Types.Mixed, required: true, select: false },
  notes: { type: [mongoose.Schema.Types.Mixed], default: [] },
  verdict: { type: mongoose.Schema.Types.Mixed, default: null },
  source: { type: String, default: 'gemini' },
  ownerId: { type: String, index: true },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.models.Mystery || mongoose.model('Mystery', mysterySchema);
