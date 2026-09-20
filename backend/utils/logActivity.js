import ActivityLog from '../models/ActivityLog.js';

/**
 * Helper function to log user activity.
 * Designed to fail silently (logs to console) if database insert fails,
 * so it doesn't break the main request flow.
 *
 * @param {Object} req - Express request object (must contain req.user from auth middleware)
 * @param {String} action - The action type (e.g., 'CREATE_PATIENT', 'LOGIN')
 * @param {String} description - Human-readable description of the action
 * @param {String} [targetType] - Type of target entity (e.g., 'Patient', 'Booking')
 * @param {String} [targetId] - ID of the target entity
 */
export const logActivity = async (req, action, description, targetType = null, targetId = null) => {
  try {
    if (!req || !req.user) {
      console.warn('logActivity: Missing req.user, cannot log action:', action);
      return;
    }

    await ActivityLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action,
      description,
      targetType,
      targetId,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};
