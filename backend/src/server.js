const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Render
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Simple JSON database
const dbFile = './data.json';
let data = {
  users: [],
  students: [],
  attendance_sessions: [],
  attendance_logs: [],
  grades: [],
  quizzes: []
};

// Load data from file
function loadData() {
  try {
    if (fs.existsSync(dbFile)) {
      const fileData = fs.readFileSync(dbFile, 'utf8');
      data = JSON.parse(fileData);
    } else {
      // Create initial data file
      saveData();
      console.log('✅ Created initial data file');
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Save data to file
function saveData() {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Initialize data
loadData();
console.log('✅ Database initialized successfully!');

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

  // Check if email already exists
  const existingUser = data.users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  // Simple password hash (in production, use bcrypt)
  const password_hash = Buffer.from(password).toString('base64');

  const newUser = {
    id: Date.now(),
    name,
    email,
    password_hash,
    created_at: new Date().toISOString()
  };

  data.users.push(newUser);
  saveData();

  res.json({ 
    message: 'User registered successfully',
    userId: newUser.id 
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const password_hash = Buffer.from(password).toString('base64');
  const user = data.users.find(u => u.email === email && u.password_hash === password_hash);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  res.json({ 
    message: 'Login successful',
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// Students routes
app.get('/api/students', (req, res) => {
  res.json(data.students);
});

app.post('/api/students', (req, res) => {
  const { name, email } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const newStudent = {
    id: Date.now(),
    name,
    email: email || '',
    created_at: new Date().toISOString()
  };

  data.students.push(newStudent);
  saveData();

  res.json({ 
    message: 'Student created successfully',
    studentId: newStudent.id 
  });
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  const stats = {
    studentsCount: data.students.length,
    attendanceSessionsCount: data.attendance_sessions.length,
    quizzesCount: data.quizzes.length,
    gradesCount: data.grades.length
  };
  
  res.json(stats);
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