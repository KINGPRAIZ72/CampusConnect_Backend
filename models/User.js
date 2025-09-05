import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  registration_number: { type: String, unique: true, required: true },
  phone_number: String,
  gender: String,
  department: String,
  level: String,
  password_hash: { type: String, required: true },
   status: { type: String, enum: ["active", "inactive"], default: "inactive" },
  lastLogin: Date,
  // reset password details
   resetCode: String,
  resetCodeExpiry: Date,
  resetVerified: { type: Boolean, default: false },
  role: { type: String, enum: ["admin", "user"], default: "user" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);