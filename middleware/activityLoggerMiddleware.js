import { logActivity } from "../middleware/activityLogger.js";

// Middleware to log activity
export const logAdminActivity = (action, status = "success") => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        await logActivity({
          user: req.user.name || req.user.email,
          role: req.user.role || "admin",
          action,
          status,
        });
      }
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
    next();
  };
};