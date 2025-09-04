const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Render
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database('./dev.db');

// Create tables
try {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Students table
  db.exec(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Attendance sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATETIME NOT NULL,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Attendance logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      session_id INTEGER,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Grades table
  db.exec(`
    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      subject TEXT NOT NULL,
      score REAL NOT NULL,
      max_score REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Quizzes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      user_id INTEGER,
      deadline DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database tables created successfully!');
} catch (error) {
  console.error('❌ Database error:', error);
}

// Serve static files from frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend')));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Simple auth routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Simple password hash (in production, use bcrypt)
  const password_hash = Buffer.from(password).toString('base64');

  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, password_hash);
    
    res.json({ 
      message: 'User registered successfully',
      userId: result.lastInsertRowid 
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    return res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const password_hash = Buffer.from(password).toString('base64');

  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ? AND password_hash = ?');
    const user = stmt.get(email, password_hash);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    res.json({ 
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Students routes
app.get('/api/students', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM students');
    const students = stmt.all();
    res.json(students);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.post('/api/students', (req, res) => {
  const { name, email } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  try {
    const stmt = db.prepare('INSERT INTO students (name, email) VALUES (?, ?)');
    const result = stmt.run(name, email);
    
    res.json({ 
      message: 'Student created successfully',
      studentId: result.lastInsertRowid 
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create student' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const studentsStmt = db.prepare('SELECT COUNT(*) as count FROM students');
    const attendanceStmt = db.prepare('SELECT COUNT(*) as count FROM attendance_sessions');
    const quizzesStmt = db.prepare('SELECT COUNT(*) as count FROM quizzes');
    const gradesStmt = db.prepare('SELECT COUNT(*) as count FROM grades');
    
    const stats = {
      studentsCount: studentsStmt.get().count,
      attendanceSessionsCount: attendanceStmt.get().count,
      quizzesCount: quizzesStmt.get().count,
      gradesCount: gradesStmt.get().count
    };
    
    res.json(stats);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Catch all handler for React app
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;