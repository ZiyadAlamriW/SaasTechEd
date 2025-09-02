# نظام إدارة المدرسة - Frontend

واجهة المستخدم الأمامية لنظام إدارة المدرسة باستخدام React و TailwindCSS.

## الميزات

- **لوحة تحكم شاملة** - عرض إحصائيات الطلاب والحضور والدرجات
- **إدارة الطلاب** - إضافة وتعديل وحذف بيانات الطلاب
- **نظام الحضور** - إنشاء جلسات الحضور مع QR Code
- **إدارة الدرجات** - تسجيل وتتبع درجات الطلاب
- **نظام الاختبارات** - إنشاء اختبارات مع تصحيح تلقائي
- **إعدادات المستخدم** - إدارة الملف الشخصي والإعدادات

## التقنيات المستخدمة

- **React 18** - مكتبة واجهة المستخدم
- **Vite** - أداة البناء السريعة
- **TailwindCSS** - إطار عمل CSS
- **React Router** - توجيه الصفحات
- **Zustand** - إدارة الحالة
- **Axios** - طلبات HTTP
- **React QR Code** - توليد رموز QR
- **Lucide React** - أيقونات
- **React Hot Toast** - إشعارات

## هيكل المشروع

```
frontend/
├── src/
│   ├── components/          # مكونات قابلة لإعادة الاستخدام
│   │   ├── Layout.jsx       # تخطيط التطبيق
│   │   ├── ProtectedRoute.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── Modal.jsx
│   │   └── QRCodeGenerator.jsx
│   ├── pages/               # صفحات التطبيق
│   │   ├── LoginPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Students.jsx
│   │   ├── Attendance.jsx
│   │   ├── Grades.jsx
│   │   ├── Quizzes.jsx
│   │   └── Settings.jsx
│   ├── services/            # خدمات API
│   │   ├── authService.js
│   │   ├── studentService.js
│   │   ├── attendanceService.js
│   │   ├── gradeService.js
│   │   └── quizService.js
│   ├── stores/              # إدارة الحالة
│   │   └── authStore.js
│   ├── utils/               # دوال مساعدة
│   │   └── api.js
│   ├── App.jsx              # المكون الرئيسي
│   ├── main.jsx             # نقطة الدخول
│   └── index.css            # الأنماط العامة
├── public/                  # الملفات العامة
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## التثبيت والتشغيل

### 1. تثبيت Dependencies

```bash
cd frontend
npm install
```

### 2. تشغيل التطبيق في وضع التطوير

```bash
npm run dev
```

سيتم تشغيل التطبيق على `http://localhost:3001`

### 3. بناء التطبيق للإنتاج

```bash
npm run build
```

### 4. معاينة البناء

```bash
npm run preview
```

## الإعداد

### متغيرات البيئة

1. انسخ ملف `.env.example` إلى `.env`:
```bash
cp .env.example .env
```

2. قم بتعديل ملف `.env` ليشمل عنوان Backend الصحيح:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### الاتصال بـ Backend

التطبيق يستخدم Axios للاتصال بـ Backend مع:
- **JWT Token** محفوظ في Zustand state
- **Authorization Header** تلقائي في جميع الطلبات
- **معالجة الأخطاء** التلقائية (401 redirect to login)

يمكن تخصيص عنوان Backend في `src/config.js`:

```javascript
export const config = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
};
```

## الصفحات والميزات

### 1. صفحة تسجيل الدخول
- تسجيل دخول المستخدمين
- إنشاء حسابات جديدة
- التحقق من صحة البيانات

### 2. لوحة التحكم
- إحصائيات شاملة
- عدد الطلاب
- نسبة الحضور
- متوسط الدرجات
- عدد الاختبارات

### 3. إدارة الطلاب
- عرض قائمة الطلاب
- إضافة طالب جديد
- تعديل بيانات الطالب
- حذف الطالب
- البحث والتصفية

### 4. نظام الحضور
- إنشاء جلسات الحضور
- توليد QR Code للحضور
- تسجيل الحضور الفردي والجماعي
- عرض سجل الحضور

### 5. إدارة الدرجات
- إضافة درجات جديدة
- تعديل الدرجات
- حذف الدرجات
- تصفية حسب الطالب أو المادة
- حساب النسب المئوية

### 6. نظام الاختبارات
- إنشاء اختبارات جديدة
- إضافة أسئلة للاختبار
- عرض نتائج الاختبارات
- التصحيح التلقائي

### 7. الإعدادات
- تحديث الملف الشخصي
- إعدادات الإشعارات
- إعدادات الأمان

## المكونات

### Layout
تخطيط التطبيق الرئيسي مع:
- شريط جانبي للتنقل
- شريط علوي مع معلومات المستخدم
- منطقة المحتوى الرئيسية

### ProtectedRoute
حماية الصفحات التي تتطلب تسجيل دخول

### Modal
مكون نافذة منبثقة قابلة لإعادة الاستخدام

### QRCodeGenerator
توليد رموز QR للجلسات

## الخدمات

### authService
خدمات المصادقة:
- تسجيل الدخول
- إنشاء حساب
- تحديث الملف الشخصي

### studentService
خدمات إدارة الطلاب:
- CRUD operations للطلاب
- إحصائيات الطلاب

### attendanceService
خدمات الحضور:
- إدارة جلسات الحضور
- تسجيل الحضور
- إحصائيات الحضور

### gradeService
خدمات الدرجات:
- إدارة الدرجات
- إحصائيات الدرجات

### quizService
خدمات الاختبارات:
- إدارة الاختبارات والأسئلة
- عرض النتائج

## إدارة الحالة

يستخدم التطبيق Zustand لإدارة حالة المصادقة:

```javascript
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async (email, password) => { /* ... */ },
  logout: () => { /* ... */ },
  // ...
}));
```

## التصميم

- **Responsive Design** - يعمل على جميع الأجهزة
- **RTL Support** - دعم اللغة العربية
- **Dark/Light Mode** - (قابل للتطوير)
- **Accessibility** - دعم إمكانية الوصول

## التطوير

### إضافة صفحة جديدة

1. إنشاء مكون الصفحة في `src/pages/`
2. إضافة المسار في `App.jsx`
3. إضافة رابط في `Layout.jsx`

### إضافة خدمة جديدة

1. إنشاء ملف الخدمة في `src/services/`
2. استخدام `apiClient` للطلبات
3. إضافة معالجة الأخطاء

### إضافة مكون جديد

1. إنشاء المكون في `src/components/`
2. تصدير المكون
3. استخدامه في الصفحات المطلوبة

## الاختبار

```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع التغطية
npm run test:coverage
```

## النشر

### Netlify
```bash
npm run build
# رفع مجلد dist إلى Netlify
```

### Vercel
```bash
npm run build
# رفع إلى Vercel
```

## المساهمة

1. Fork المشروع
2. إنشاء فرع للميزة الجديدة
3. Commit التغييرات
4. Push إلى الفرع
5. إنشاء Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT.
