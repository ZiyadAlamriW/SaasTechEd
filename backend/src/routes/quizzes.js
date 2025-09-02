const express = require('express');
const { 
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestionToQuiz,
  updateQuestion,
  deleteQuestion,
  submitQuizAnswers,
  getQuizResults
} = require('../controllers/quizController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Quiz CRUD routes
router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);
router.get('/:id/results', getQuizResults);
router.post('/', createQuiz);
router.put('/:id', updateQuiz);
router.delete('/:id', deleteQuiz);

// Question management routes
router.post('/:id/questions', addQuestionToQuiz);
router.put('/:id/questions/:questionId', updateQuestion);
router.delete('/:id/questions/:questionId', deleteQuestion);

// Quiz submission routes
router.post('/submit', submitQuizAnswers);

module.exports = router;
