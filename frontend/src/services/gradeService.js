import api from '../utils/api';

export const gradeService = {
  // Get all grades with pagination and filters
  getGrades: async (page = 1, limit = 10, studentId = '', subject = '') => {
    const params = { page, limit };
    if (studentId) params.student_id = studentId;
    if (subject) params.subject = subject;
    return api.get('/grades', { params });
  },

  // Get grade by ID
  getGrade: async (id) => {
    return api.get(`/grades/${id}`);
  },

  // Create new grade
  createGrade: async (studentId, subject, score, maxScore) => {
    return api.post('/grades', {
      student_id: studentId,
      subject,
      score,
      max_score: maxScore,
    });
  },

  // Update grade
  updateGrade: async (id, subject, score, maxScore) => {
    return api.put(`/grades/${id}`, {
      subject,
      score,
      max_score: maxScore,
    });
  },

  // Delete grade
  deleteGrade: async (id) => {
    return api.delete(`/grades/${id}`);
  },

  // Bulk create grades
  bulkCreateGrades: async (gradesData) => {
    return api.post('/grades/bulk', { grades_data: gradesData });
  },

  // Get grade statistics
  getStats: async (studentId = '', subject = '') => {
    const params = {};
    if (studentId) params.student_id = studentId;
    if (subject) params.subject = subject;
    return api.get('/grades/stats', { params });
  },

  // Get student grades
  getStudentGrades: async (studentId, page = 1, limit = 10, subject = '') => {
    const params = { page, limit };
    if (subject) params.subject = subject;
    return api.get(`/grades/student/${studentId}`, { params });
  },
};
