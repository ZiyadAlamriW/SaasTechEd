# SaaS Backend API

Backend API for SaaS application built with Express.js, Prisma ORM, and Supabase PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with registration and login
- **Student Management**: CRUD operations for students
- **Attendance Tracking**: Create sessions and mark attendance
- **Grade Management**: Add and manage student grades
- **Quiz System**: Create quizzes, add questions, and track submissions
- **Statistics**: Comprehensive analytics for all modules

## Tech Stack

- **Node.js** with Express.js
- **Prisma ORM** for database operations
- **PostgreSQL** (Supabase)
- **JWT** for authentication
- **bcryptjs** for password hashing

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Business logic
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── utils/          # Utility functions
│   └── server.js       # Main server file
├── prisma/
│   └── schema.prisma   # Database schema
├── package.json
└── README.md
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Update the following variables in `.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@db.supabase.co:5432/postgres"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or create and run migrations
npm run db:migrate
```

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/:id/stats` - Get student statistics

### Attendance
- `POST /api/attendance/sessions` - Create attendance session
- `GET /api/attendance/sessions` - Get attendance sessions
- `GET /api/attendance/sessions/:id` - Get session by ID
- `POST /api/attendance/mark` - Mark attendance
- `POST /api/attendance/bulk-mark` - Bulk mark attendance
- `GET /api/attendance/stats` - Get attendance statistics

### Grades
- `GET /api/grades` - Get all grades
- `GET /api/grades/:id` - Get grade by ID
- `POST /api/grades` - Create new grade
- `POST /api/grades/bulk` - Bulk create grades
- `PUT /api/grades/:id` - Update grade
- `DELETE /api/grades/:id` - Delete grade
- `GET /api/grades/stats` - Get grade statistics
- `GET /api/grades/student/:student_id` - Get student grades

### Quizzes
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `GET /api/quizzes/:id/results` - Get quiz results
- `POST /api/quizzes` - Create new quiz
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz
- `POST /api/quizzes/:id/questions` - Add question to quiz
- `PUT /api/quizzes/:id/questions/:questionId` - Update question
- `DELETE /api/quizzes/:id/questions/:questionId` - Delete question
- `POST /api/quizzes/submit` - Submit quiz answers

## Database Schema

### Users
- id, name, email, password_hash, plan, created_at, updated_at

### Students
- id, name, email, user_id (FK), created_at, updated_at

### Attendance Sessions
- id, date, user_id (FK), created_at, updated_at

### Attendance Logs
- id, student_id (FK), session_id (FK), status, created_at, updated_at

### Grades
- id, student_id (FK), subject, score, max_score, created_at, updated_at

### Quizzes
- id, title, user_id (FK), deadline, created_at, updated_at

### Quiz Questions
- id, quiz_id (FK), question, correct_answer, created_at, updated_at

### Quiz Answers
- id, student_id (FK), question_id (FK), student_answer, is_correct, created_at, updated_at

### Subscriptions
- id, user_id (FK), plan, start_date, end_date, created_at, updated_at

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Validation error details"],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

### Health Check

The server provides a health check endpoint:

```
GET /health
```

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Helmet for security headers
- Input validation
- SQL injection protection via Prisma

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
