import api from '../utils/api';

export const attendanceService = {
  // Create attendance session
  createSession: async (date) => {
    return api.post('/attendance/sessions', { date });
  },

  // Get attendance sessions
  getSessions: async (page = 1, limit = 10, startDate = '', endDate = '') => {
    const params = { page, limit };
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return api.get('/attendance/sessions', { params });
  },

  // Get session by ID
  getSession: async (id) => {
    return api.get(`/attendance/sessions/${id}`);
  },

  // Mark attendance for single student
  markAttendance: async (sessionId, studentId, status) => {
    return api.post('/attendance/mark', {
      session_id: sessionId,
      student_id: studentId,
      status,
    });
  },

  // Bulk mark attendance
  bulkMarkAttendance: async (sessionId, attendanceData) => {
    return api.post('/attendance/bulk-mark', {
      session_id: sessionId,
      attendance_data: attendanceData,
    });
  },

  // Get attendance statistics
  getStats: async (studentId = '', startDate = '', endDate = '') => {
    const params = {};
    if (studentId) params.student_id = studentId;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    return api.get('/attendance/stats', { params });
  },
};
