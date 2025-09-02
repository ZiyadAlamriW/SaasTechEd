const { PrismaClient } = require('@prisma/client');
const { validateQuiz, validateQuizQuestion } = require('../utils/validation');
const { successResponse, errorResponse, validationErrorResponse, notFoundResponse } = require('../utils/response');

const prisma = new PrismaClient();

const getAllQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const userId = req.user.id;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const where = {
      user_id: userId
    };

    // Add search functionality
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive'
      };
    }

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          _count: {
            select: {
              questions: true
            }
          }
        }
      }),
      prisma.quiz.count({ where })
    ]);

    return successResponse(res, {
      quizzes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Quizzes retrieved successfully');

  } catch (error) {
    console.error('Get quizzes error:', error);
    return errorResponse(res, 'Failed to retrieve quizzes', 500);
  }
};

const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        user_id: userId
      },
      include: {
        questions: {
          include: {
            _count: {
              select: {
                answers: true
              }
            }
          },
          orderBy: { created_at: 'asc' }
        }
      }
    });

    if (!quiz) {
      return notFoundResponse(res, 'Quiz');
    }

    return successResponse(res, quiz, 'Quiz retrieved successfully');

  } catch (error) {
    console.error('Get quiz error:', error);
    return errorResponse(res, 'Failed to retrieve quiz', 500);
  }
};

const createQuiz = async (req, res) => {
  try {
    const { title, deadline, questions } = req.body;
    const userId = req.user.id;

    // Validate input
    const validationErrors = validateQuiz({ title, deadline });
    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    // Validate questions if provided
    if (questions && Array.isArray(questions)) {
      for (const question of questions) {
        const questionErrors = validateQuizQuestion(question);
        if (questionErrors.length > 0) {
          return validationErrorResponse(res, questionErrors);
        }
      }
    }

    // Create quiz with questions in transaction
    const quiz = await prisma.$transaction(async (tx) => {
      const newQuiz = await tx.quiz.create({
        data: {
          title: title.trim(),
          deadline: deadline ? new Date(deadline) : null,
          user_id: userId
        }
      });

      // Create questions if provided
      if (questions && questions.length > 0) {
        const questionData = questions.map(q => ({
          quiz_id: newQuiz.id,
          question: q.question.trim(),
          correct_answer: q.correct_answer.trim()
        }));

        await tx.quizQuestion.createMany({
          data: questionData
        });
      }

      return newQuiz;
    });

    // Fetch the complete quiz with questions
    const completeQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: {
        questions: {
          orderBy: { created_at: 'asc' }
        }
      }
    });

    return successResponse(res, completeQuiz, 'Quiz created successfully', 201);

  } catch (error) {
    console.error('Create quiz error:', error);
    return errorResponse(res, 'Failed to create quiz', 500);
  }
};

const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, deadline } = req.body;
    const userId = req.user.id;

    // Check if quiz exists and belongs to user
    const existingQuiz = await prisma.quiz.findFirst({
      where: {
        id,
        user_id: userId
      }
    });

    if (!existingQuiz) {
      return notFoundResponse(res, 'Quiz');
    }

    // Validate input
    const validationErrors = validateQuiz({ 
      title: title || existingQuiz.title, 
      deadline: deadline !== undefined ? deadline : existingQuiz.deadline 
    });
    
    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: updateData,
      include: {
        questions: {
          orderBy: { created_at: 'asc' }
        }
      }
    });

    return successResponse(res, updatedQuiz, 'Quiz updated successfully');

  } catch (error) {
    console.error('Update quiz error:', error);
    return errorResponse(res, 'Failed to update quiz', 500);
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if quiz exists and belongs to user
    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        user_id: userId
      }
    });

    if (!quiz) {
      return notFoundResponse(res, 'Quiz');
    }

    await prisma.quiz.delete({
      where: { id }
    });

    return successResponse(res, null, 'Quiz deleted successfully');

  } catch (error) {
    console.error('Delete quiz error:', error);
    return errorResponse(res, 'Failed to delete quiz', 500);
  }
};

const addQuestionToQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, correct_answer } = req.body;
    const userId = req.user.id;

    // Check if quiz exists and belongs to user
    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        user_id: userId
      }
    });

    if (!quiz) {
      return notFoundResponse(res, 'Quiz');
    }

    // Validate input
    const validationErrors = validateQuizQuestion({ question, correct_answer });
    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    const quizQuestion = await prisma.quizQuestion.create({
      data: {
        quiz_id: id,
        question: question.trim(),
        correct_answer: correct_answer.trim()
      }
    });

    return successResponse(res, quizQuestion, 'Question added to quiz successfully', 201);

  } catch (error) {
    console.error('Add question error:', error);
    return errorResponse(res, 'Failed to add question to quiz', 500);
  }
};

const updateQuestion = async (req, res) => {
  try {
    const { id, questionId } = req.params;
    const { question, correct_answer } = req.body;
    const userId = req.user.id;

    // Check if quiz exists and belongs to user
    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        user_id: userId
      }
    });

    if (!quiz) {
      return notFoundResponse(res, 'Quiz');
    }

    // Check if question exists and belongs to quiz
    const existingQuestion = await prisma.quizQuestion.findFirst({
      where: {
        id: questionId,
        quiz_id: id
      }
    });

    if (!existingQuestion) {
      return notFoundResponse(res, 'Question');
    }

    // Validate input
    const validationErrors = validateQuizQuestion({ 
      question: question || existingQuestion.question, 
      correct_answer: correct_answer || existingQuestion.correct_answer 
    });
    
    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    const updateData = {};
    if (question !== undefined) updateData.question = question.trim();
    if (correct_answer !== undefined) updateData.correct_answer = correct_answer.trim();

    const updatedQuestion = await prisma.quizQuestion.update({
      where: { id: questionId },
      data: updateData
    });

    return successResponse(res, updatedQuestion, 'Question updated successfully');

  } catch (error) {
    console.error('Update question error:', error);
    return errorResponse(res, 'Failed to update question', 500);
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { id, questionId } = req.params;
    const userId = req.user.id;

    // Check if quiz exists and belongs to user
    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        user_id: userId
      }
    });

    if (!quiz) {
      return notFoundResponse(res, 'Quiz');
    }

    // Check if question exists and belongs to quiz
    const question = await prisma.quizQuestion.findFirst({
      where: {
        id: questionId,
        quiz_id: id
      }
    });

    if (!question) {
      return notFoundResponse(res, 'Question');
    }

    await prisma.quizQuestion.delete({
      where: { id: questionId }
    });

    return successResponse(res, null, 'Question deleted successfully');

  } catch (error) {
    console.error('Delete question error:', error);
    return errorResponse(res, 'Failed to delete question', 500);
  }
};

const submitQuizAnswers = async (req, res) => {
  try {
    const { student_id, answers } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!student_id) {
      return validationErrorResponse(res, ['Student ID is required']);
    }

    if (!answers || !Array.isArray(answers)) {
      return validationErrorResponse(res, ['Answers must be an array']);
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

    // Validate answers
    for (const answer of answers) {
      if (!answer.question_id || !answer.student_answer) {
        return validationErrorResponse(res, ['Each answer must have question_id and student_answer']);
      }
    }

    // Get all question IDs and verify they belong to user's quizzes
    const questionIds = answers.map(a => a.question_id);
    const questions = await prisma.quizQuestion.findMany({
      where: {
        id: { in: questionIds },
        quiz: {
          user_id: userId
        }
      },
      include: {
        quiz: true
      }
    });

    if (questions.length !== questionIds.length) {
      return errorResponse(res, 'Some questions not found or do not belong to user', 400);
    }

    // Check if quiz is still active (not past deadline)
    const activeQuizzes = questions.filter(q => 
      !q.quiz.deadline || new Date(q.quiz.deadline) > new Date()
    );

    if (activeQuizzes.length !== questions.length) {
      return errorResponse(res, 'Some quizzes have passed their deadline', 400);
    }

    // Process answers in transaction
    const results = await prisma.$transaction(async (tx) => {
      const submittedAnswers = [];

      for (const answer of answers) {
        const question = questions.find(q => q.id === answer.question_id);
        const isCorrect = answer.student_answer.trim().toLowerCase() === 
                         question.correct_answer.trim().toLowerCase();

        // Check if answer already exists
        const existingAnswer = await tx.quizAnswer.findUnique({
          where: {
            student_id_question_id: {
              student_id,
              question_id: answer.question_id
            }
          }
        });

        let quizAnswer;
        if (existingAnswer) {
          // Update existing answer
          quizAnswer = await tx.quizAnswer.update({
            where: {
              student_id_question_id: {
                student_id,
                question_id: answer.question_id
              }
            },
            data: {
              student_answer: answer.student_answer.trim(),
              is_correct: isCorrect
            }
          });
        } else {
          // Create new answer
          quizAnswer = await tx.quizAnswer.create({
            data: {
              student_id,
              question_id: answer.question_id,
              student_answer: answer.student_answer.trim(),
              is_correct: isCorrect
            }
          });
        }

        submittedAnswers.push({
          ...quizAnswer,
          question: {
            id: question.id,
            question: question.question,
            correct_answer: question.correct_answer
          }
        });
      }

      return submittedAnswers;
    });

    return successResponse(res, results, 'Quiz answers submitted successfully');

  } catch (error) {
    console.error('Submit quiz answers error:', error);
    return errorResponse(res, 'Failed to submit quiz answers', 500);
  }
};

const getQuizResults = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_id } = req.query;
    const userId = req.user.id;

    // Check if quiz exists and belongs to user
    const quiz = await prisma.quiz.findFirst({
      where: {
        id,
        user_id: userId
      }
    });

    if (!quiz) {
      return notFoundResponse(res, 'Quiz');
    }

    const where = {
      question: {
        quiz_id: id
      }
    };

    if (student_id) {
      where.student_id = student_id;
    }

    const answers = await prisma.quizAnswer.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        question: {
          select: {
            id: true,
            question: true,
            correct_answer: true
          }
        }
      },
      orderBy: [
        { student: { name: 'asc' } },
        { question: { created_at: 'asc' } }
      ]
    });

    // Calculate statistics
    const stats = {
      total_questions: await prisma.quizQuestion.count({
        where: { quiz_id: id }
      }),
      total_submissions: await prisma.quizAnswer.count({
        where: {
          question: { quiz_id: id }
        }
      }),
      student_results: {}
    };

    answers.forEach(answer => {
      const studentId = answer.student_id;
      if (!stats.student_results[studentId]) {
        stats.student_results[studentId] = {
          student: answer.student,
          correct: 0,
          total: 0,
          percentage: 0
        };
      }

      stats.student_results[studentId].total++;
      if (answer.is_correct) {
        stats.student_results[studentId].correct++;
      }
    });

    // Calculate percentages
    Object.values(stats.student_results).forEach(result => {
      result.percentage = result.total > 0 ? (result.correct / result.total) * 100 : 0;
    });

    return successResponse(res, {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        deadline: quiz.deadline
      },
      answers,
      statistics: stats
    }, 'Quiz results retrieved successfully');

  } catch (error) {
    console.error('Get quiz results error:', error);
    return errorResponse(res, 'Failed to retrieve quiz results', 500);
  }
};

module.exports = {
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
};
