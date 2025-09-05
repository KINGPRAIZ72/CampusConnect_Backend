import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  picture: String,
  event_name: String,
  date: Date,
  time: String,
  location: String,
  description: String,
  category: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  archived_by_users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

eventSchema.virtual("upcoming_or_past").get(function () {
  return this.date >= new Date() ? "upcoming" : "past";
});

export default mongoose.model("Event", eventSchema);