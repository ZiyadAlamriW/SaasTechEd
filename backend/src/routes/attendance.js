const express = require('express');
const { 
  createAttendanceSession,
  getAttendanceSessions,
  getAttendanceSessionById,
  markAttendance,
  bulkMarkAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Attendance session routes
router.post('/sessions', createAttendanceSession);
router.get('/sessions', getAttendanceSessions);
router.get('/sessions/:id', getAttendanceSessionById);

// Attendance marking routes
router.post('/mark', markAttendance);
router.post('/bulk-mark', bulkMarkAttendance);

// Statistics
router.get('/stats', getAttendanceStats);

module.exports = router;
