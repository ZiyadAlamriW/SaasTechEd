const { PrismaClient } = require('@prisma/client');
const { validateStudent } = require('../utils/validation');
const { successResponse, errorResponse, validationErrorResponse, notFoundResponse } = require('../utils/response');

const prisma = new PrismaClient();

const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const userId = req.user.id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      user_id: userId
    };

    // Add search functionality
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: {
              attendance_logs: true,
              grades: true,
              quiz_answers: true
            }
          }
        }
      }),
      prisma.student.count({ where })
    ]);

    return successResponse(res, {
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Students retrieved successfully');

  } catch (error) {
    console.error('Get students error:', error);
    return errorResponse(res, 'Failed to retrieve students', 500);
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const student = await prisma.student.findFirst({
      where: {
        id,
        user_id: userId
      },
      include: {
        grades: {
          orderBy: { created_at: 'desc' }
        },
        attendance_logs: {
          include: {
            session: true
          },
          orderBy: { created_at: 'desc' }
        },
        quiz_answers: {
          include: {
            question: {
              include: {
                quiz: true
              }
            }
          },
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!student) {
      return notFoundResponse(res, 'Student');
    }

    return successResponse(res, student, 'Student retrieved successfully');

  } catch (error) {
    console.error('Get student error:', error);
    return errorResponse(res, 'Failed to retrieve student', 500);
  }
};

const createStudent = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Validate input
    const validationErrors = validateStudent({ name, email });
    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    // Check if student email already exists for this user
    const existingStudent = await prisma.student.findFirst({
      where: {
        email: email.toLowerCase(),
        user_id: userId
      }
    });

    if (existingStudent) {
      return errorResponse(res, 'Student with this email already exists', 409);
    }

    const student = await prisma.student.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        user_id: userId
      }
    });

    return successResponse(res, student, 'Student created successfully', 201);

  } catch (error) {
    console.error('Create student error:', error);
    return errorResponse(res, 'Failed to create student', 500);
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const userId = req.user.id;

    // Check if student exists and belongs to user
    const existingStudent = await prisma.student.findFirst({
      where: {
        id,
        user_id: userId
      }
    });

    if (!existingStudent) {
      return notFoundResponse(res, 'Student');
    }

    // Validate input
    const validationErrors = validateStudent({ name, email });
    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    // Check if email is already taken by another student of this user
    if (email && email.toLowerCase() !== existingStudent.email) {
      const emailTaken = await prisma.student.findFirst({
        where: {
          email: email.toLowerCase(),
          user_id: userId,
          id: { not: id }
        }
      });

      if (emailTaken) {
        return errorResponse(res, 'Student with this email already exists', 409);
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase();

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: updateData
    });

    return successResponse(res, updatedStudent, 'Student updated successfully');

  } catch (error) {
    console.error('Update student error:', error);
    return errorResponse(res, 'Failed to update student', 500);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if student exists and belongs to user
    const student = await prisma.student.findFirst({
      where: {
        id,
        user_id: userId
      }
    });

    if (!student) {
      return notFoundResponse(res, 'Student');
    }

    // Delete student (cascade will handle related records)
    await prisma.student.delete({
      where: { id }
    });

    return successResponse(res, null, 'Student deleted successfully');

  } catch (error) {
    console.error('Delete student error:', error);
    return errorResponse(res, 'Failed to delete student', 500);
  }
};

const getStudentStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if student exists and belongs to user
    const student = await prisma.student.findFirst({
      where: {
        id,
        user_id: userId
      }
    });

    if (!student) {
      return notFoundResponse(res, 'Student');
    }

    // Get statistics
    const [attendanceStats, gradeStats, quizStats] = await Promise.all([
      // Attendance statistics
      prisma.attendanceLog.groupBy({
        by: ['status'],
        where: { student_id: id },
        _count: { status: true }
      }),
      
      // Grade statistics
      prisma.grade.aggregate({
        where: { student_id: id },
        _avg: { score: true },
        _max: { score: true },
        _min: { score: true },
        _count: { id: true }
      }),
      
      // Quiz statistics
      prisma.quizAnswer.aggregate({
        where: { student_id: id },
        _count: { id: true },
        _avg: { is_correct: true }
      })
    ]);

    const stats = {
      attendance: {
        total: attendanceStats.reduce((sum, stat) => sum + stat._count.status, 0),
        breakdown: attendanceStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {})
      },
      grades: {
        average: gradeStats._avg.score || 0,
        highest: gradeStats._max.score || 0,
        lowest: gradeStats._min.score || 0,
        total: gradeStats._count.id || 0
      },
      quizzes: {
        total_attempts: quizStats._count.id || 0,
        accuracy: quizStats._avg.is_correct ? quizStats._avg.is_correct * 100 : 0
      }
    };

    return successResponse(res, stats, 'Student statistics retrieved successfully');

  } catch (error) {
    console.error('Get student stats error:', error);
    return errorResponse(res, 'Failed to retrieve student statistics', 500);
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats
};
