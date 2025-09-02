import api from '../utils/api';

export const studentService = {
  // Get all students with pagination and search
  getStudents: async (page = 1, limit = 10, search = '') => {
    const params = { page, limit };
    if (search) params.search = search;
    return api.get('/students', { params });
  },

  // Get student by ID
  getStudent: async (id) => {
    return api.get(`/students/${id}`);
  },

  // Create new student
  createStudent: async (name, email) => {
    return api.post('/students', { name, email });
  },

  // Update student
  updateStudent: async (id, name, email) => {
    return api.put(`/students/${id}`, { name, email });
  },

  // Delete student
  deleteStudent: async (id) => {
    return api.delete(`/students/${id}`);
  },

  // Get student statistics
  getStudentStats: async (id) => {
    return api.get(`/students/${id}/stats`);
  },
};
