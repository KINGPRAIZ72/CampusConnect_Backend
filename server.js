import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import userRoutes from "./routes/User.js";
import announcementRoutes  from "./routes/announcement.js";
import eventRoutes  from "./routes/event.js";
import bodyParser from 'body-parser';
import dashboardRoutes from "./routes/dashboard.js";
import activityRoutes from "./routes/activity.js";
import { verifyToken } from "./middleware/authMiddleware.js";
import { updatePassword } from "./controllers/authController.js";
import dotenv from 'dotenv';



dotenv.config();



const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ---------------- Middleware ----------------
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/announcements',announcementRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/auth/update-password", verifyToken, updatePassword);


app.listen(5000, () => console.log("Server running on port 5000"));













