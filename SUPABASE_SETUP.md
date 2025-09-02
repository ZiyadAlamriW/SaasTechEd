# دليل إعداد Supabase

## الخطوات المطلوبة لإعداد قاعدة البيانات

### 1. إنشاء مشروع Supabase

1. اذهب إلى [Supabase](https://supabase.com)
2. سجل دخول أو أنشئ حساب جديد
3. انقر على "New Project"
4. اختر اسم للمشروع (مثل: `saas-school-management`)
5. اختر كلمة مرور قوية لقاعدة البيانات
6. اختر المنطقة الأقرب إليك
7. انقر على "Create new project"

### 2. الحصول على معلومات الاتصال

1. بعد إنشاء المشروع، اذهب إلى **Settings** > **Database**
2. ابحث عن **Connection string** في قسم **Connection parameters**
3. انسخ **URI** (سيكون مثل: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`)

### 3. تحديث متغيرات البيئة

#### للبيئة المحلية (Development):
```bash
# في ملف backend/.env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key-here"
NODE_ENV=development
PORT=3000
```

#### للبيئة الإنتاجية (Production):
```bash
# في Render أو أي منصة نشر
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key-here"
NODE_ENV=production
PORT=10000
```

### 4. تطبيق Migration

```bash
# في مجلد backend
npm run db:push
```

أو

```bash
# إذا كنت تستخدم migrations
npm run db:migrate
```

### 5. التحقق من الاتصال

```bash
# تشغيل الخادم
npm run dev

# التحقق من health endpoint
curl http://localhost:3000/health
```

## إعدادات إضافية في Supabase

### 1. Row Level Security (RLS)

في Supabase Dashboard، اذهب إلى **Authentication** > **Policies** وقم بإنشاء policies للأمان:

```sql
-- مثال: السماح للمستخدمين بقراءة بياناتهم فقط
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- مثال: السماح للمستخدمين بتحديث بياناتهم فقط
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);
```

### 2. إعدادات CORS

في **Settings** > **API**، تأكد من إعداد CORS origins بشكل صحيح:

```
http://localhost:3000
http://localhost:3001
https://your-app.onrender.com
```

### 3. إعدادات Authentication

في **Authentication** > **Settings**:
- فعّل **Enable email confirmations** إذا كنت تريد تأكيد البريد الإلكتروني
- اضبط **Site URL** على عنوان تطبيقك
- اضبط **Redirect URLs** للصفحات المطلوبة

## استكشاف الأخطاء

### 1. مشاكل الاتصال
```
Error: connect ECONNREFUSED
```
**الحل**: تحقق من صحة `DATABASE_URL` وتأكد من أن المشروع نشط في Supabase

### 2. مشاكل المصادقة
```
Error: Invalid JWT token
```
**الحل**: تحقق من `JWT_SECRET` وتأكد من أنه متطابق في جميع البيئات

### 3. مشاكل CORS
```
Error: CORS policy
```
**الحل**: تأكد من إضافة عنوان التطبيق في CORS origins في Supabase

### 4. مشاكل Migration
```
Error: Migration failed
```
**الحل**: 
- تأكد من أن قاعدة البيانات فارغة أو تحتوي على البيانات المطلوبة
- تحقق من صحة schema في `prisma/schema.prisma`
- استخدم `npm run db:push` بدلاً من `npm run db:migrate` إذا واجهت مشاكل

## نصائح مهمة

1. **لا تشارك معلومات الاتصال**: احتفظ بـ `DATABASE_URL` و `JWT_SECRET` سرية
2. **استخدم بيئات منفصلة**: أنشئ مشاريع منفصلة للـ development و production
3. **راقب الاستخدام**: Supabase يوفر خطة مجانية مع حدود، راقب الاستخدام
4. **النسخ الاحتياطي**: قم بعمل نسخ احتياطية دورية من قاعدة البيانات
5. **الأمان**: فعّل Row Level Security و Authentication في Supabase

## الخطوات التالية

1. ✅ إنشاء مشروع Supabase
2. ✅ الحصول على connection string
3. ✅ تحديث متغيرات البيئة
4. ✅ تطبيق schema
5. ✅ اختبار الاتصال
6. ✅ نشر التطبيق على Render

## الدعم

إذا واجهت مشاكل:
1. تحقق من [Supabase Documentation](https://supabase.com/docs)
2. تحقق من [Prisma Documentation](https://www.prisma.io/docs)
3. تحقق من logs في Supabase Dashboard
4. تحقق من console logs في التطبيق
