import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  status: { type: String, enum: ['active', 'draft'], default: 'active' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  schedule: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  archived_by_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });


export default mongoose.model("Announcement", announcementSchema);