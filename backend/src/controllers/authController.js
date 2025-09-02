const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validateUserRegistration } = require('../utils/validation');
const { successResponse, errorResponse, validationErrorResponse, unauthorizedResponse } = require('../utils/response');

const prisma = new PrismaClient();

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    const validationErrors = validateUserRegistration({ name, email, password });
    if (validationErrors.length > 0) {
      return validationErrorResponse(res, validationErrors);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 409);
    }

    // Hash password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password_hash,
        plan: 'free'
      },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        created_at: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return successResponse(res, {
      user,
      token
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'Registration failed', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return validationErrorResponse(res, ['Email and password are required']);
    }

    if (!email.includes('@')) {
      return validationErrorResponse(res, ['Invalid email format']);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return unauthorizedResponse(res, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return unauthorizedResponse(res, 'Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data without password
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      created_at: user.created_at
    };

    return successResponse(res, {
      user: userData,
      token
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        created_at: true,
        updated_at: true,
        _count: {
          select: {
            students: true,
            quizzes: true,
            attendance_sessions: true
          }
        }
      }
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'Profile retrieved successfully');

  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Failed to retrieve profile', 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name && !email) {
      return validationErrorResponse(res, ['At least one field (name or email) is required']);
    }

    const updateData = {};
    
    if (name) {
      if (name.trim().length < 2) {
        return validationErrorResponse(res, ['Name must be at least 2 characters']);
      }
      updateData.name = name.trim();
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return validationErrorResponse(res, ['Invalid email format']);
      }

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          id: { not: userId }
        }
      });

      if (existingUser) {
        return errorResponse(res, 'Email is already taken', 409);
      }

      updateData.email = email.toLowerCase();
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        updated_at: true
      }
    });

    return successResponse(res, updatedUser, 'Profile updated successfully');

  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
};
