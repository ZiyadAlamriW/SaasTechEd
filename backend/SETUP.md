# إعداد المشروع - دليل سريع

## الخطوات المطلوبة لتشغيل المشروع

### 1. تثبيت Dependencies
```bash
npm install
```

### 2. إعداد قاعدة البيانات
1. أنشئ مشروع جديد في Supabase
2. احصل على DATABASE_URL من Supabase
3. حدث ملف `.env`:
```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

### 3. تطبيق Migrations
```bash
# توليد Prisma Client
npm run db:generate

# تطبيق migrations على قاعدة البيانات
npm run db:push
```

### 4. تشغيل الخادم
```bash
# وضع التطوير
npm run dev

# وضع الإنتاج
npm start
```

## اختبار API

### تسجيل مستخدم جديد
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أحمد محمد",
    "email": "ahmed@example.com",
    "password": "Password123"
  }'
```

### تسجيل الدخول
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "Password123"
  }'
```

### إضافة طالب جديد (يتطلب JWT token)
```bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "سارة أحمد",
    "email": "sara@example.com"
  }'
```

## نصائح مهمة

1. **تأكد من تحديث DATABASE_URL** في ملف `.env` قبل تشغيل المشروع
2. **استخدم JWT_SECRET قوي** في الإنتاج
3. **تحقق من Health Check**: `GET http://localhost:3000/health`
4. **استخدم Prisma Studio** لعرض البيانات: `npm run db:studio`

## استكشاف الأخطاء

- إذا واجهت مشكلة في الاتصال بقاعدة البيانات، تأكد من صحة DATABASE_URL
- تأكد من أن جميع dependencies مثبتة: `npm install`
- تحقق من logs الخادم للأخطاء
