import ActivityLog from '../models/ActivityLog.js';

// @desc    Get activity logs
// @route   GET /api/activity-logs
// @access  Private/Admin
export const getActivityLogs = async (req, res) => {
  try {
    const { page = 1, limit = 30, action, userId, startDate, endDate } = req.query;
    const query = {};

    if (action) {
      query.action = action;
    }

    if (userId) {
      query.user = userId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalCount = await ActivityLog.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Activity logs retrieved successfully',
      data: {
        logs,
        totalCount,
        page: Number(page),
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get Activity Logs Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while retrieving activity logs'
    });
  }
};
