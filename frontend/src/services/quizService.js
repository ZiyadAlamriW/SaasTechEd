import api from '../utils/api';

export const quizService = {
  // Get all quizzes with pagination and search
  getQuizzes: async (page = 1, limit = 10, search = '') => {
    const params = { page, limit };
    if (search) params.search = search;
    return api.get('/quizzes', { params });
  },

  // Get quiz by ID
  getQuiz: async (id) => {
    return api.get(`/quizzes/${id}`);
  },

  // Create new quiz
  createQuiz: async (title, deadline = null, questions = []) => {
    return api.post('/quizzes', {
      title,
      deadline,
      questions,
    });
  },

  // Update quiz
  updateQuiz: async (id, title, deadline = null) => {
    return api.put(`/quizzes/${id}`, {
      title,
      deadline,
    });
  },

  // Delete quiz
  deleteQuiz: async (id) => {
    return api.delete(`/quizzes/${id}`);
  },

  // Add question to quiz
  addQuestion: async (quizId, question, correctAnswer) => {
    return api.post(`/quizzes/${quizId}/questions`, {
      question,
      correct_answer: correctAnswer,
    });
  },

  // Update question
  updateQuestion: async (quizId, questionId, question, correctAnswer) => {
    return api.put(`/quizzes/${quizId}/questions/${questionId}`, {
      question,
      correct_answer: correctAnswer,
    });
  },

  // Delete question
  deleteQuestion: async (quizId, questionId) => {
    return api.delete(`/quizzes/${quizId}/questions/${questionId}`);
  },

  // Submit quiz answers
  submitAnswers: async (studentId, answers) => {
    return api.post('/quizzes/submit', {
      student_id: studentId,
      answers,
    });
  },

  // Get quiz results
  getResults: async (quizId, studentId = '') => {
    const params = {};
    if (studentId) params.student_id = studentId;
    return api.get(`/quizzes/${quizId}/results`, { params });
  },
};
