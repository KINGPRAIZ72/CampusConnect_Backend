import Activity from "../models/Activity.js";

/**
 * Logs an activity to the database.
 * @param {Object} options
 * @param {String} options.user - Name of the user performing the action
 * @param {String} options.role - Role of the user (admin, user)
 * @param {String} options.action - Description of the action
 * @param {String} [options.status="success"] - Status of the action (success, failed, etc.)
 */

export const logActivity = async ({ user, role, action, status }) => {
  try {
    const activity = new Activity({
      user,
      role,
      action,
      status,
      timestamp: new Date()
    });
    await activity.save();
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};