const express = require('express');
const { 
  getAllStudents, 
  getStudentById, 
  createStudent, 
  updateStudent, 
  deleteStudent,
  getStudentStats 
} = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Student CRUD routes
router.get('/', getAllStudents);
router.get('/:id', getStudentById);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

// Student statistics
router.get('/:id/stats', getStudentStats);

module.exports = router;
