import Booking from '../models/Booking.js';
import Test from '../models/Test.js';
import Patient from '../models/Patient.js';
import { format, subDays, subMonths, eachDayOfInterval, eachMonthOfInterval, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';

// @desc    Get Revenue Analytics
// @route   GET /api/analytics/revenue
// @access  Private/Admin
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = '30days' } = req.query;
    
    let startDate;
    const endDate = new Date();
    let isMonthly = false;

    if (period === '7days') {
      startDate = subDays(endDate, 6);
    } else if (period === '12months') {
      startDate = subMonths(endDate, 11);
      isMonthly = true;
    } else {
      // Default 30days
      startDate = subDays(endDate, 29);
    }

    startDate = isMonthly ? startOfMonth(startDate) : startOfDay(startDate);

    const matchStage = {
      createdAt: { $gte: startDate, $lte: endDate },
      paymentStatus: 'paid',
    };

    const groupFormat = isMonthly ? '%Y-%m' : '%Y-%m-%d';

    const aggregation = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing dates
    const dataMap = new Map(aggregation.map(item => [item._id, item.revenue]));
    const result = [];

    if (isMonthly) {
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      months.forEach(month => {
        const key = format(month, 'yyyy-MM');
        result.push({ date: key, revenue: dataMap.get(key) || 0 });
      });
    } else {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      days.forEach(day => {
        const key = format(day, 'yyyy-MM-dd');
        result.push({ date: key, revenue: dataMap.get(key) || 0 });
      });
    }

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Get Revenue Analytics Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Test Popularity
// @route   GET /api/analytics/test-popularity
// @access  Private/Admin
export const getTestPopularity = async (req, res) => {
  try {
    const aggregation = await Booking.aggregate([
      { $unwind: '$tests' },
      {
        $group: {
          _id: '$tests',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'tests', // Collection name
          localField: '_id',
          foreignField: '_id',
          as: 'testDetails',
        },
      },
      { $unwind: '$testDetails' },
      {
        $project: {
          testName: '$testDetails.testName',
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({ success: true, data: aggregation });
  } catch (error) {
    console.error('Get Test Popularity Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Bookings By Status
// @route   GET /api/analytics/bookings-by-status
// @access  Private/Admin
export const getBookingsByStatus = async (req, res) => {
  try {
    const aggregation = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    return res.status(200).json({ success: true, data: aggregation });
  } catch (error) {
    console.error('Get Bookings By Status Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Category Breakdown
// @route   GET /api/analytics/category-breakdown
// @access  Private/Admin
export const getCategoryBreakdown = async (req, res) => {
  try {
    const aggregation = await Booking.aggregate([
      { $unwind: '$tests' },
      {
        $lookup: {
          from: 'tests',
          localField: 'tests',
          foreignField: '_id',
          as: 'testDetails',
        },
      },
      { $unwind: '$testDetails' },
      {
        $group: {
          _id: '$testDetails.category',
          count: { $sum: 1 },
          revenue: { 
            $sum: { 
              $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$testDetails.price', 0] 
            } 
          },
        },
      },
      {
        $project: {
          category: { $ifNull: ['$_id', 'Uncategorized'] },
          count: 1,
          revenue: 1,
          _id: 0,
        },
      },
    ]);

    return res.status(200).json({ success: true, data: aggregation });
  } catch (error) {
    console.error('Get Category Breakdown Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Overview Stats
// @route   GET /api/analytics/overview
// @access  Private/Admin
export const getOverviewStats = async (req, res) => {
  try {
    const [totalBookings, totalPatients] = await Promise.all([
      Booking.countDocuments(),
      Patient.countDocuments(),
    ]);

    const revenueAggregation = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalRevenueAllTime = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;
    const averageBookingValue = totalBookings > 0 ? totalRevenueAllTime / totalBookings : 0;

    const now = new Date();
    const startOfThisMonth = startOfMonth(now);
    const endOfThisMonth = endOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));

    const [thisMonthAggregation, lastMonthAggregation] = await Promise.all([
      Booking.aggregate([
        { 
          $match: { 
            paymentStatus: 'paid',
            createdAt: { $gte: startOfThisMonth, $lte: endOfThisMonth }
          }
        },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Booking.aggregate([
        { 
          $match: { 
            paymentStatus: 'paid',
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
          }
        },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ])
    ]);

    const thisMonthRevenue = thisMonthAggregation.length > 0 ? thisMonthAggregation[0].totalRevenue : 0;
    const lastMonthRevenue = lastMonthAggregation.length > 0 ? lastMonthAggregation[0].totalRevenue : 0;

    let percentageChange = 0;
    if (lastMonthRevenue > 0) {
      percentageChange = ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    } else if (thisMonthRevenue > 0) {
      percentageChange = 100; // If last month was 0 and this month > 0
    }

    return res.status(200).json({
      success: true,
      data: {
        totalRevenueAllTime,
        totalBookingsAllTime: totalBookings,
        totalPatientsAllTime: totalPatients,
        averageBookingValue,
        thisMonthRevenue,
        lastMonthRevenue,
        percentageChange: parseFloat(percentageChange.toFixed(2)),
      }
    });
  } catch (error) {
    console.error('Get Overview Stats Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
