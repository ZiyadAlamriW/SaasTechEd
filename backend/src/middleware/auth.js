const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, plan: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

const requirePlan = (requiredPlan) => {
  const planHierarchy = {
    'free': 0,
    'basic': 1,
    'premium': 2,
    'enterprise': 3
  };

  return (req, res, next) => {
    const userPlan = planHierarchy[req.user.plan] || 0;
    const required = planHierarchy[requiredPlan] || 0;

    if (userPlan < required) {
      return res.status(403).json({ 
        error: 'Insufficient plan',
        required: requiredPlan,
        current: req.user.plan
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requirePlan
};
