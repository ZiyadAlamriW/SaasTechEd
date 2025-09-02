const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse, validationErrorResponse, notFoundResponse } = require('../utils/response');

const prisma = new PrismaClient();

const createAttendanceSession = async (req, res) => {
  try {
    const { date } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!date) {
      return validationErrorResponse(res, ['Date is required']);
    }

    const sessionDate = new Date(date);
    if (isNaN(sessionDate.getTime())) {
      return validationErrorResponse(res, ['Invalid date format']);
    }

    // Check if session already exists for this date and user
    const existingSession = await prisma.attendanceSession.findFirst({
      where: {
        user_id: userId,
        date: {
          gte: new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate()),
          lt: new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate() + 1)
        }
      }
    });

    if (existingSession) {
      return errorResponse(res, 'Attendance session already exists for this date', 409);
    }

    const session = await prisma.attendanceSession.create({
      data: {
        date: sessionDate,
        user_id: userId
      },
      include: {
        attendance_logs: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    return successResponse(res, session, 'Attendance session created successfully', 201);

  } catch (error) {
    console.error('Create attendance session error:', error);
    return errorResponse(res, 'Failed to create attendance session', 500);
  }
};

const getAttendanceSessions = async (req, res) => {
  try {
    const { page = 1, limit = 10, start_date, end_date } = req.query;
    const userId = req.user.id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      user_id: userId
    };

    // Add date range filter
    if (start_date || end_date) {
      where.date = {};
      if (start_date) where.date.gte = new Date(start_date);
      if (end_date) where.date.lte = new Date(end_date);
    }

    const [sessions, total] = await Promise.all([
      prisma.attendanceSession.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' },
        include: {
          _count: {
            select: {
              attendance_logs: true
            }
          },
          attendance_logs: {
            include: {
              student: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.attendanceSession.count({ where })
    ]);

    return successResponse(res, {
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Attendance sessions retrieved successfully');

  } catch (error) {
    console.error('Get attendance sessions error:', error);
    return errorResponse(res, 'Failed to retrieve attendance sessions', 500);
  }
};

const getAttendanceSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const session = await prisma.attendanceSession.findFirst({
      where: {
        id,
        user_id: userId
      },
      include: {
        attendance_logs: {
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      return notFoundResponse(res, 'Attendance session');
    }

    return successResponse(res, session, 'Attendance session retrieved successfully');

  } catch (error) {
    console.error('Get attendance session error:', error);
    return errorResponse(res, 'Failed to retrieve attendance session', 500);
  }
};

const markAttendance = async (req, res) => {
  try {
    const { session_id, student_id, status } = req.body;
    const userId = req.user.id;

    // Validate input
    const validationErrors = [];
    if (!session_id) validationErrors.push('Session ID is required');
    if (!student_id) validationErrors.push('Student ID is required');
    if (!status) validationErrors.push('Status is required');
    
    if (status && !['present', 'absent', 'late'].includes(status)) {
      validationErrors.push('Status must be present, absent, or late');
    }

    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    // Verify session belongs to user
    const session = await prisma.attendanceSession.findFirst({
      where: {
        id: session_id,
        user_id: userId
      }
    });

    if (!session) {
      return notFoundResponse(res, 'Attendance session');
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

    // Check if attendance already exists
    const existingAttendance = await prisma.attendanceLog.findUnique({
      where: {
        student_id_session_id: {
          student_id,
          session_id
        }
      }
    });

    let attendanceLog;
    if (existingAttendance) {
      // Update existing attendance
      attendanceLog = await prisma.attendanceLog.update({
        where: {
          student_id_session_id: {
            student_id,
            session_id
          }
        },
        data: { status },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          session: true
        }
      });
    } else {
      // Create new attendance
      attendanceLog = await prisma.attendanceLog.create({
        data: {
          student_id,
          session_id,
          status
        },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          session: true
        }
      });
    }

    return successResponse(res, attendanceLog, 'Attendance marked successfully');

  } catch (error) {
    console.error('Mark attendance error:', error);
    return errorResponse(res, 'Failed to mark attendance', 500);
  }
};

const bulkMarkAttendance = async (req, res) => {
  try {
    const { session_id, attendance_data } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!session_id) {
      return validationErrorResponse(res, ['Session ID is required']);
    }

    if (!attendance_data || !Array.isArray(attendance_data)) {
      return validationErrorResponse(res, ['Attendance data must be an array']);
    }

    // Verify session belongs to user
    const session = await prisma.attendanceSession.findFirst({
      where: {
        id: session_id,
        user_id: userId
      }
    });

    if (!session) {
      return notFoundResponse(res, 'Attendance session');
    }

    // Validate attendance data
    for (const item of attendance_data) {
      if (!item.student_id || !item.status) {
        return validationErrorResponse(res, ['Each attendance item must have student_id and status']);
      }
      if (!['present', 'absent', 'late'].includes(item.status)) {
        return validationErrorResponse(res, ['Status must be present, absent, or late']);
      }
    }

    // Get all student IDs for this user
    const studentIds = await prisma.student.findMany({
      where: { user_id: userId },
      select: { id: true }
    });

    const validStudentIds = studentIds.map(s => s.id);

    // Validate all student IDs belong to user
    for (const item of attendance_data) {
      if (!validStudentIds.includes(item.student_id)) {
        return errorResponse(res, `Student ${item.student_id} not found or doesn't belong to user`, 400);
      }
    }

    // Process attendance in transaction
    const results = await prisma.$transaction(async (tx) => {
      const attendanceLogs = [];

      for (const item of attendance_data) {
        const existingAttendance = await tx.attendanceLog.findUnique({
          where: {
            student_id_session_id: {
              student_id: item.student_id,
              session_id
            }
          }
        });

        let attendanceLog;
        if (existingAttendance) {
          attendanceLog = await tx.attendanceLog.update({
            where: {
              student_id_session_id: {
                student_id: item.student_id,
                session_id
              }
            },
            data: { status: item.status },
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
        } else {
          attendanceLog = await tx.attendanceLog.create({
            data: {
              student_id: item.student_id,
              session_id,
              status: item.status
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
        }

        attendanceLogs.push(attendanceLog);
      }

      return attendanceLogs;
    });

    return successResponse(res, results, 'Bulk attendance marked successfully');

  } catch (error) {
    console.error('Bulk mark attendance error:', error);
    return errorResponse(res, 'Failed to mark bulk attendance', 500);
  }
};

const getAttendanceStats = async (req, res) => {
  try {
    const { student_id, start_date, end_date } = req.query;
    const userId = req.user.id;

    const where = {
      user_id: userId
    };

    if (student_id) {
      where.students = {
        some: {
          id: student_id
        }
      };
    }

    if (start_date || end_date) {
      where.date = {};
      if (start_date) where.date.gte = new Date(start_date);
      if (end_date) where.date.lte = new Date(end_date);
    }

    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: {
        attendance_logs: {
          include: {
            student: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Calculate statistics
    const stats = {
      total_sessions: sessions.length,
      attendance_summary: {
        present: 0,
        absent: 0,
        late: 0
      },
      student_stats: {}
    };

    sessions.forEach(session => {
      session.attendance_logs.forEach(log => {
        const studentId = log.student.id;
        if (!stats.student_stats[studentId]) {
          stats.student_stats[studentId] = {
            name: log.student.name,
            present: 0,
            absent: 0,
            late: 0,
            total: 0
          };
        }

        stats.student_stats[studentId][log.status]++;
        stats.student_stats[studentId].total++;
        stats.attendance_summary[log.status]++;
      });
    });

    return successResponse(res, stats, 'Attendance statistics retrieved successfully');

  } catch (error) {
    console.error('Get attendance stats error:', error);
    return errorResponse(res, 'Failed to retrieve attendance statistics', 500);
  }
};

module.exports = {
  createAttendanceSession,
  getAttendanceSessions,
  getAttendanceSessionById,
  markAttendance,
  bulkMarkAttendance,
  getAttendanceStats
};
