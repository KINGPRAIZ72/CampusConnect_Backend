import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  user: String,
  role: String,
  action: String,
  status: String,
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("Activity", activitySchema);