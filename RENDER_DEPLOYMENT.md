# دليل نشر التطبيق على Render

## الخطوات المطلوبة للنشر

### 1. إعداد GitHub Repository

1. ادفع الكود إلى GitHub repository
2. تأكد من أن جميع الملفات موجودة:
   - `backend/` - مجلد Backend
   - `frontend/` - مجلد Frontend
   - `render.yaml` - ملف إعداد Render
   - `SUPABASE_SETUP.md` - دليل إعداد Supabase

### 2. إنشاء حساب Render

1. اذهب إلى [Render](https://render.com)
2. سجل دخول باستخدام GitHub
3. اربط حساب GitHub مع Render

### 3. إنشاء Web Service

1. في Render Dashboard، انقر على **New** > **Web Service**
2. اختر **Build and deploy from a Git repository**
3. اختر الـ repository الخاص بك
4. املأ المعلومات التالية:

```
Name: saas-school-management
Environment: Node
Region: Oregon (US West) أو أقرب منطقة
Branch: main
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

### 4. إعداد Environment Variables

في قسم **Environment Variables**، أضف:

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-here
PORT=10000
```

### 5. إعدادات إضافية

#### Auto-Deploy:
- فعّل **Auto-Deploy** إذا كنت تريد النشر التلقائي عند push

#### Health Check:
- **Health Check Path**: `/health`

#### Advanced Settings:
- **Dockerfile Path**: (اتركه فارغ)
- **Docker Context**: (اتركه فارغ)

### 6. النشر

1. انقر على **Create Web Service**
2. انتظر حتى يكتمل البناء (قد يستغرق 5-10 دقائق)
3. تحقق من logs للتأكد من عدم وجود أخطاء

## إعداد قاعدة البيانات (اختياري)

إذا كنت تريد استخدام قاعدة بيانات Render بدلاً من Supabase:

### 1. إنشاء PostgreSQL Database

1. في Render Dashboard، انقر على **New** > **PostgreSQL**
2. اختر:
   ```
   Name: saas-database
   Database: saas_db
   User: saas_user
   Region: Oregon (US West)
   ```
3. انقر على **Create Database**

### 2. تحديث Environment Variables

```
DATABASE_URL=[Connection string من Render Database]
```

## اختبار النشر

### 1. التحقق من Health Check

```bash
curl https://your-app.onrender.com/health
```

يجب أن تحصل على:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 2. اختبار API Endpoints

```bash
# اختبار تسجيل الدخول
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3. اختبار Frontend

1. اذهب إلى `https://your-app.onrender.com`
2. يجب أن ترى صفحة تسجيل الدخول
3. جرب إنشاء حساب جديد
4. جرب تسجيل الدخول

## استكشاف الأخطاء

### 1. مشاكل البناء

**خطأ**: `Build failed`
**الحل**: 
- تحقق من logs في Render Dashboard
- تأكد من أن جميع dependencies موجودة
- تحقق من صحة scripts في `package.json`

### 2. مشاكل قاعدة البيانات

**خطأ**: `Database connection failed`
**الحل**:
- تحقق من `DATABASE_URL` في Environment Variables
- تأكد من أن Supabase project نشط
- تحقق من إعدادات CORS في Supabase

### 3. مشاكل Frontend

**خطأ**: `404 Not Found` للصفحات
**الحل**:
- تأكد من أن `build` script يعمل بشكل صحيح
- تحقق من أن `dist` folder موجود في `frontend/`
- تأكد من إعداد static files في `server.js`

### 4. مشاكل CORS

**خطأ**: `CORS policy`
**الحل**:
- أضف عنوان Render في CORS origins في Supabase
- تحقق من إعدادات CORS في `server.js`

## تحسين الأداء

### 1. إعدادات Render

- **Plan**: ابدأ بـ Free plan، ثم انتقل إلى Starter إذا احتجت
- **Region**: اختر المنطقة الأقرب لمستخدميك
- **Auto-Deploy**: فعّله للـ main branch فقط

### 2. تحسين قاعدة البيانات

- استخدم **Connection Pooling** في Supabase
- فعّل **Row Level Security**
- استخدم **Indexes** للاستعلامات المتكررة

### 3. تحسين Frontend

- استخدم **Code Splitting**
- فعّل **Gzip Compression**
- استخدم **CDN** للـ static files

## مراقبة التطبيق

### 1. Render Dashboard

- راقب **Metrics** للأداء
- تحقق من **Logs** للأخطاء
- راقب **Uptime** للتطبيق

### 2. Supabase Dashboard

- راقب **Database** usage
- تحقق من **API** requests
- راقب **Authentication** events

## النسخ الاحتياطي

### 1. قاعدة البيانات

```bash
# في Supabase Dashboard
# اذهب إلى Settings > Database > Backups
# فعّل Automated Backups
```

### 2. الكود

- استخدم Git للنسخ الاحتياطي
- أنشئ tags للإصدارات المهمة
- استخدم branches للميزات الجديدة

## التحديثات

### 1. تحديث الكود

```bash
# في local machine
git add .
git commit -m "Update feature"
git push origin main

# Render سيقوم بالنشر التلقائي
```

### 2. تحديث قاعدة البيانات

```bash
# في local machine
npm run db:push

# أو استخدام migrations
npm run db:migrate
```

## الدعم

إذا واجهت مشاكل:

1. **Render Support**: [Render Documentation](https://render.com/docs)
2. **Supabase Support**: [Supabase Documentation](https://supabase.com/docs)
3. **Community**: [Render Community](https://community.render.com)

## التكلفة

### Render Free Plan:
- **Web Service**: 750 ساعة/شهر
- **Database**: 1GB storage
- **Bandwidth**: 100GB/شهر

### Render Starter Plan ($7/شهر):
- **Web Service**: Unlimited
- **Database**: 1GB storage
- **Bandwidth**: 100GB/شهر

### Supabase Free Plan:
- **Database**: 500MB storage
- **API Requests**: 50,000/شهر
- **Authentication**: 50,000 users

## الخلاصة

✅ **تم إعداد**:
- Build scripts للـ frontend
- Express static serving للـ production
- Render deployment configuration
- Supabase database setup
- Environment configuration

🚀 **التطبيق جاهز للنشر على Render!**
