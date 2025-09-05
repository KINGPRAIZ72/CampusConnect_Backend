import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/authMiddleware.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import nodemailer from "nodemailer";

const router = express.Router();

// ================= REGISTER =================
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      registration_number,
      phone_number,
      gender,
      department,
      level,
      password,
      role
    } = req.body;

    // check if email or reg number already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { registration_number }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: existingUser.email === email
          ? "Email already exists"
          : "Registration number already exists"
      });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create user
    const user = new User({
      name,
      email,
      registration_number,
      phone_number,
      gender,
      department,
      level,
      password_hash: hashed,
      role: role || "user"   // default role = user
    });

    await user.save();

    res.json({ message: "✅ User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(400).json({ message: err.message || "Failed to register user" });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "✅ Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ================= PROFILE =================
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password_hash");
    res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update password
router.put("/update-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: "Both current and new password are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Compare old password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Current password is incorrect" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ msg: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// --- SEND RESET CODE ---
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: "If account exists, email will be sent" });
    }

    // Generate 6-digit OTP
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = Date.now() + 60 * 1000; // 1 min expiry

    user.resetCode = resetCode;
    user.resetCodeExpiry = resetExpiry;
    await user.save();

    // Setup mailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Password Reset Code",
      text: `Your verification code is: ${resetCode}. It will expire in 1 minute.`,
    });

    res.json({ success: true, message: "Reset code sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// --- VERIFY RESET CODE ---
router.post("/verify-code", async (req, res) => {
  try {
    const { code } = req.body;

    const user = await User.findOne({
      resetCode: code,
      resetCodeExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    // Mark verified
    user.resetVerified = true;
    await user.save();

    res.json({ success: true, message: "Code verified" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- SET NEW PASSWORD ---
router.post("/set-new-password", async (req, res) => {
  try {
    const { newPassword, email } = req.body;

    const user = await User.findOne({ email, resetVerified: true });
    if (!user) {
      return res.status(400).json({ success: false, message: "Unauthorized or expired request" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;

    // clear reset fields
    user.resetCode = undefined;
    user.resetCodeExpiry = undefined;
    user.resetVerified = false;

    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;