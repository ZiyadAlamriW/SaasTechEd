const express = require('express');
const { 
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  bulkCreateGrades,
  getGradeStats,
  getStudentGrades
} = require('../controllers/gradeController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Grade CRUD routes
router.get('/', getAllGrades);
router.get('/stats', getGradeStats);
router.get('/:id', getGradeById);
router.post('/', createGrade);
router.post('/bulk', bulkCreateGrades);
router.put('/:id', updateGrade);
router.delete('/:id', deleteGrade);

// Student-specific grades
router.get('/student/:student_id', getStudentGrades);

module.exports = router;
