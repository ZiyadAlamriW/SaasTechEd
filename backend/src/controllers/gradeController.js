const { PrismaClient } = require('@prisma/client');
const { validateGrade } = require('../utils/validation');
const { successResponse, errorResponse, validationErrorResponse, notFoundResponse } = require('../utils/response');

const prisma = new PrismaClient();

const getAllGrades = async (req, res) => {
  try {
    const { page = 1, limit = 10, student_id, subject } = req.query;
    const userId = req.user.id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      student: {
        user_id: userId
      }
    };

    // Add filters
    if (student_id) {
      where.student_id = student_id;
    }

    if (subject) {
      where.subject = {
        contains: subject,
        mode: 'insensitive'
      };
    }

    const [grades, total] = await Promise.all([
      prisma.grade.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.grade.count({ where })
    ]);

    return successResponse(res, {
      grades,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Grades retrieved successfully');

  } catch (error) {
    console.error('Get grades error:', error);
    return errorResponse(res, 'Failed to retrieve grades', 500);
  }
};

const getGradeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const grade = await prisma.grade.findFirst({
      where: {
        id,
        student: {
          user_id: userId
        }
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!grade) {
      return notFoundResponse(res, 'Grade');
    }

    return successResponse(res, grade, 'Grade retrieved successfully');

  } catch (error) {
    console.error('Get grade error:', error);
    return errorResponse(res, 'Failed to retrieve grade', 500);
  }
};

const createGrade = async (req, res) => {
  try {
    const { student_id, subject, score, max_score } = req.body;
    const userId = req.user.id;

    // Validate input
    const validationErrors = validateGrade({ student_id, subject, score, max_score });
    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    // Verify student belongs to user
    const student = await prisma.student.findFirst({
      where: {
        id: student_id,
        user_id: userId
      }
    });

    if (!student) {
      return notFoundResponse(res, 'Student');
    }

    const grade = await prisma.grade.create({
      data: {
        student_id,
        subject: subject.trim(),
        score: parseFloat(score),
        max_score: parseFloat(max_score)
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return successResponse(res, grade, 'Grade created successfully', 201);

  } catch (error) {
    console.error('Create grade error:', error);
    return errorResponse(res, 'Failed to create grade', 500);
  }
};

const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, score, max_score } = req.body;
    const userId = req.user.id;

    // Check if grade exists and belongs to user's student
    const existingGrade = await prisma.grade.findFirst({
      where: {
        id,
        student: {
          user_id: userId
        }
      }
    });

    if (!existingGrade) {
      return notFoundResponse(res, 'Grade');
    }

    // Validate input
    const validationErrors = validateGrade({ 
      student_id: existingGrade.student_id, 
      subject: subject || existingGrade.subject, 
      score: score !== undefined ? score : existingGrade.score, 
      max_score: max_score !== undefined ? max_score : existingGrade.max_score 
    });
    
    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    const updateData = {};
    if (subject !== undefined) updateData.subject = subject.trim();
    if (score !== undefined) updateData.score = parseFloat(score);
    if (max_score !== undefined) updateData.max_score = parseFloat(max_score);

    const updatedGrade = await prisma.grade.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return successResponse(res, updatedGrade, 'Grade updated successfully');

  } catch (error) {
    console.error('Update grade error:', error);
    return errorResponse(res, 'Failed to update grade', 500);
  }
};

const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if grade exists and belongs to user's student
    const grade = await prisma.grade.findFirst({
      where: {
        id,
        student: {
          user_id: userId
        }
      }
    });

    if (!grade) {
      return notFoundResponse(res, 'Grade');
    }

    await prisma.grade.delete({
      where: { id }
    });

    return successResponse(res, null, 'Grade deleted successfully');

  } catch (error) {
    console.error('Delete grade error:', error);
    return errorResponse(res, 'Failed to delete grade', 500);
  }
};

const bulkCreateGrades = async (req, res) => {
  try {
    const { grades_data } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!grades_data || !Array.isArray(grades_data)) {
      return validationErrorResponse(res, ['Grades data must be an array']);
    }

    if (grades_data.length === 0) {
      return validationErrorResponse(res, ['Grades data cannot be empty']);
    }

    // Validate each grade
    for (const gradeData of grades_data) {
      const validationErrors = validateGrade(gradeData);
      if (validationErrors.length > 0) {
        return validationErrorResponse(res, validationErrors);
      }
    }

    // Get all student IDs for this user
    const studentIds = await prisma.student.findMany({
      where: { user_id: userId },
      select: { id: true }
    });

    const validStudentIds = studentIds.map(s => s.id);

    // Validate all student IDs belong to user
    for (const gradeData of grades_data) {
      if (!validStudentIds.includes(gradeData.student_id)) {
        return errorResponse(res, `Student ${gradeData.student_id} not found or doesn't belong to user`, 400);
      }
    }

    // Create grades in transaction
    const createdGrades = await prisma.$transaction(async (tx) => {
      const grades = [];
      
      for (const gradeData of grades_data) {
        const grade = await tx.grade.create({
          data: {
            student_id: gradeData.student_id,
            subject: gradeData.subject.trim(),
            score: parseFloat(gradeData.score),
            max_score: parseFloat(gradeData.max_score)
          },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
        grades.push(grade);
      }
      
      return grades;
    });

    return successResponse(res, createdGrades, 'Grades created successfully', 201);

  } catch (error) {
    console.error('Bulk create grades error:', error);
    return errorResponse(res, 'Failed to create grades', 500);
  }
};

const getGradeStats = async (req, res) => {
  try {
    const { student_id, subject } = req.query;
    const userId = req.user.id;

    const where = {
      student: {
        user_id: userId
      }
    };

    if (student_id) {
      where.student_id = student_id;
    }

    if (subject) {
      where.subject = {
        contains: subject,
        mode: 'insensitive'
      };
    }

    const [gradeStats, subjectStats, studentStats] = await Promise.all([
      // Overall grade statistics
      prisma.grade.aggregate({
        where,
        _avg: { score: true },
        _max: { score: true },
        _min: { score: true },
        _count: { id: true }
      }),

      // Statistics by subject
      prisma.grade.groupBy({
        by: ['subject'],
        where,
        _avg: { score: true },
        _count: { id: true },
        orderBy: { subject: 'asc' }
      }),

      // Statistics by student
      prisma.grade.groupBy({
        by: ['student_id'],
        where,
        _avg: { score: true },
        _count: { id: true }
      })
    ]);

    // Get student names for student stats
    const studentIds = studentStats.map(stat => stat.student_id);
    const students = await prisma.student.findMany({
      where: {
        id: { in: studentIds },
        user_id: userId
      },
      select: {
        id: true,
        name: true
      }
    });

    const studentMap = students.reduce((acc, student) => {
      acc[student.id] = student.name;
      return acc;
    }, {});

    const stats = {
      overall: {
        average: gradeStats._avg.score || 0,
        highest: gradeStats._max.score || 0,
        lowest: gradeStats._min.score || 0,
        total: gradeStats._count.id || 0
      },
      by_subject: subjectStats.map(stat => ({
        subject: stat.subject,
        average: stat._avg.score || 0,
        count: stat._count.id || 0
      })),
      by_student: studentStats.map(stat => ({
        student_id: stat.student_id,
        student_name: studentMap[stat.student_id] || 'Unknown',
        average: stat._avg.score || 0,
        count: stat._count.id || 0
      }))
    };

    return successResponse(res, stats, 'Grade statistics retrieved successfully');

  } catch (error) {
    console.error('Get grade stats error:', error);
    return errorResponse(res, 'Failed to retrieve grade statistics', 500);
  }
};

const getStudentGrades = async (req, res) => {
  try {
    const { student_id } = req.params;
    const { page = 1, limit = 10, subject } = req.query;
    const userId = req.user.id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify student belongs to user
    const student = await prisma.student.findFirst({
      where: {
        id: student_id,
        user_id: userId
      }
    });

    if (!student) {
      return notFoundResponse(res, 'Student');
    }

    const where = {
      student_id
    };

    if (subject) {
      where.subject = {
        contains: subject,
        mode: 'insensitive'
      };
    }

    const [grades, total] = await Promise.all([
      prisma.grade.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' }
      }),
      prisma.grade.count({ where })
    ]);

    // Calculate student's average
    const averageResult = await prisma.grade.aggregate({
      where: { student_id },
      _avg: { score: true }
    });

    return successResponse(res, {
      student: {
        id: student.id,
        name: student.name,
        email: student.email
      },
      grades,
      average: averageResult._avg.score || 0,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Student grades retrieved successfully');

  } catch (error) {
    console.error('Get student grades error:', error);
    return errorResponse(res, 'Failed to retrieve student grades', 500);
  }
};

module.exports = {
  getAllGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  bulkCreateGrades,
  getGradeStats,
  getStudentGrades
};
