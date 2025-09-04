const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database migration...');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Create tables using raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "password_hash" TEXT NOT NULL,
        "plan" TEXT NOT NULL DEFAULT 'free',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL
      );
    `;
    console.log('✅ Users table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "students" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    console.log('✅ Students table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "attendance_sessions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "date" TIMESTAMP(3) NOT NULL,
        "user_id" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    console.log('✅ Attendance sessions table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "attendance_logs" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "student_id" TEXT NOT NULL,
        "session_id" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("session_id") REFERENCES "attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE("student_id", "session_id")
      );
    `;
    console.log('✅ Attendance logs table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "grades" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "student_id" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "score" DOUBLE PRECISION NOT NULL,
        "max_score" DOUBLE PRECISION NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    console.log('✅ Grades table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "quizzes" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "user_id" TEXT NOT NULL,
        "deadline" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    console.log('✅ Quizzes table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "quiz_questions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "quiz_id" TEXT NOT NULL,
        "question" TEXT NOT NULL,
        "correct_answer" TEXT NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    console.log('✅ Quiz questions table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "quiz_answers" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "student_id" TEXT NOT NULL,
        "question_id" TEXT NOT NULL,
        "student_answer" TEXT NOT NULL,
        "is_correct" BOOLEAN NOT NULL,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY ("question_id") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        UNIQUE("student_id", "question_id")
      );
    `;
    console.log('✅ Quiz answers table created');
    
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "user_id" TEXT NOT NULL,
        "plan" TEXT NOT NULL,
        "start_date" TIMESTAMP(3) NOT NULL,
        "end_date" TIMESTAMP(3),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;
    console.log('✅ Subscriptions table created');
    
    console.log('🎉 Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
