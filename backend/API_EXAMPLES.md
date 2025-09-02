# أمثلة على استخدام API

## Authentication Endpoints

### 1. تسجيل مستخدم جديد

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "password": "Password123"
}
```

### 2. تسجيل الدخول

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "Password123"
}
```

### 3. الحصول على الملف الشخصي

```bash
GET /api/auth/profile
Authorization: Bearer YOUR_JWT_TOKEN
```

## Student Management

### 1. إضافة طالب جديد

```bash
POST /api/students
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "سارة أحمد",
  "email": "sara@example.com"
}
```

### 2. الحصول على جميع الطلاب

```bash
GET /api/students?page=1&limit=10&search=سارة
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. الحصول على طالب محدد

```bash
GET /api/students/STUDENT_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

### 4. تحديث بيانات طالب

```bash
PUT /api/students/STUDENT_ID
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "سارة أحمد محمد",
  "email": "sara.ahmed@example.com"
}
```

## Attendance Management

### 1. إنشاء جلسة حضور

```bash
POST /api/attendance/sessions
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "date": "2024-01-15T09:00:00Z"
}
```

### 2. تسجيل حضور طالب

```bash
POST /api/attendance/mark
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "session_id": "SESSION_ID",
  "student_id": "STUDENT_ID",
  "status": "present"
}
```

### 3. تسجيل حضور جماعي

```bash
POST /api/attendance/bulk-mark
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "session_id": "SESSION_ID",
  "attendance_data": [
    {
      "student_id": "STUDENT_ID_1",
      "status": "present"
    },
    {
      "student_id": "STUDENT_ID_2",
      "status": "absent"
    }
  ]
}
```

## Grade Management

### 1. إضافة درجة جديدة

```bash
POST /api/grades
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "student_id": "STUDENT_ID",
  "subject": "الرياضيات",
  "score": 85,
  "max_score": 100
}
```

### 2. إضافة درجات متعددة

```bash
POST /api/grades/bulk
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "grades_data": [
    {
      "student_id": "STUDENT_ID_1",
      "subject": "الرياضيات",
      "score": 85,
      "max_score": 100
    },
    {
      "student_id": "STUDENT_ID_2",
      "subject": "العلوم",
      "score": 92,
      "max_score": 100
    }
  ]
}
```

### 3. الحصول على درجات طالب محدد

```bash
GET /api/grades/student/STUDENT_ID?page=1&limit=10
Authorization: Bearer YOUR_JWT_TOKEN
```

## Quiz Management

### 1. إنشاء اختبار جديد

```bash
POST /api/quizzes
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "اختبار الرياضيات - الفصل الأول",
  "deadline": "2024-01-20T23:59:59Z",
  "questions": [
    {
      "question": "ما هو ناتج 5 × 3؟",
      "correct_answer": "15"
    },
    {
      "question": "ما هو ناتج 10 ÷ 2؟",
      "correct_answer": "5"
    }
  ]
}
```

### 2. إضافة سؤال لاختبار موجود

```bash
POST /api/quizzes/QUIZ_ID/questions
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "question": "ما هو ناتج 7 × 8؟",
  "correct_answer": "56"
}
```

### 3. تقديم إجابات الاختبار

```bash
POST /api/quizzes/submit
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "student_id": "STUDENT_ID",
  "answers": [
    {
      "question_id": "QUESTION_ID_1",
      "student_answer": "15"
    },
    {
      "question_id": "QUESTION_ID_2",
      "student_answer": "5"
    }
  ]
}
```

### 4. الحصول على نتائج الاختبار

```bash
GET /api/quizzes/QUIZ_ID/results?student_id=STUDENT_ID
Authorization: Bearer YOUR_JWT_TOKEN
```

## Statistics Endpoints

### 1. إحصائيات الطالب

```bash
GET /api/students/STUDENT_ID/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

### 2. إحصائيات الدرجات

```bash
GET /api/grades/stats?student_id=STUDENT_ID&subject=الرياضيات
Authorization: Bearer YOUR_JWT_TOKEN
```

### 3. إحصائيات الحضور

```bash
GET /api/attendance/stats?student_id=STUDENT_ID&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format

جميع الاستجابات تتبع نفس التنسيق:

### Success Response

```json
{
  "success": true,
  "message": "تم إنشاء الطالب بنجاح",
  "data": {
    "id": "student_id",
    "name": "سارة أحمد",
    "email": "sara@example.com"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response

```json
{
  "success": false,
  "message": "فشل في التحقق من صحة البيانات",
  "errors": ["البريد الإلكتروني مطلوب", "الاسم يجب أن يكون على الأقل حرفين"],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Status Codes

- `200` - نجح الطلب
- `201` - تم إنشاء المورد بنجاح
- `400` - خطأ في البيانات المرسلة
- `401` - غير مصرح (JWT token مطلوب)
- `403` - ممنوع (صلاحيات غير كافية)
- `404` - المورد غير موجود
- `409` - تعارض (مثل البريد الإلكتروني المكرر)
- `500` - خطأ في الخادم
