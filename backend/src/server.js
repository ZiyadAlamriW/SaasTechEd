const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Render
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./dev.db');

// Create tables
db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Students table
  db.run(`
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Attendance sessions table
  db.run(`
    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date DATETIME NOT NULL,
      user_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Attendance logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS attendance_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER,
      session_id INTEGER,
      status TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Grades table
  db.run(`
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
  db.run(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      user_id INTEGER,
      deadline DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Database tables created successfully!');
});

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

  db.run(
    'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
    [name, email, password_hash],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Registration failed' });
      }
      
      res.json({ 
        message: 'User registered successfully',
        userId: this.lastID 
      });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const password_hash = Buffer.from(password).toString('base64');

  db.get(
    'SELECT * FROM users WHERE email = ? AND password_hash = ?',
    [email, password_hash],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      res.json({ 
        message: 'Login successful',
        user: { id: user.id, name: user.name, email: user.email }
      });
    }
  );
});

// Students routes
app.get('/api/students', (req, res) => {
  db.all('SELECT * FROM students', (err, students) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch students' });
    }
    res.json(students);
  });
});

app.post('/api/students', (req, res) => {
  const { name, email } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.run(
    'INSERT INTO students (name, email) VALUES (?, ?)',
    [name, email],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create student' });
      }
      
      res.json({ 
        message: 'Student created successfully',
        studentId: this.lastID 
      });
    }
  );
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {};
  
  // Get students count
  db.get('SELECT COUNT(*) as count FROM students', (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to get stats' });
    
    stats.studentsCount = result.count;
    
    // Get attendance sessions count
    db.get('SELECT COUNT(*) as count FROM attendance_sessions', (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to get stats' });
      
      stats.attendanceSessionsCount = result.count;
      
      // Get quizzes count
      db.get('SELECT COUNT(*) as count FROM quizzes', (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to get stats' });
        
        stats.quizzesCount = result.count;
        
        // Get grades count
        db.get('SELECT COUNT(*) as count FROM grades', (err, result) => {
          if (err) return res.status(500).json({ error: 'Failed to get stats' });
          
          stats.gradesCount = result.count;
          
          res.json(stats);
        });
      });
    });
  });
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