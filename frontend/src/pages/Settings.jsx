import { useState, useEffect } from 'react';
import { User, Mail, Save, Key, Bell, Shield } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const result = await updateProfile(formData.name, formData.email);
      
      if (result.success) {
        toast.success('تم تحديث الملف الشخصي بنجاح');
      } else {
        toast.error(result.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
        <p className="mt-1 text-sm text-gray-500">
          إدارة إعدادات حسابك وتفضيلاتك
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Settings */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 ml-2" />
                <h3 className="card-title">الملف الشخصي</h3>
              </div>
            </div>
            <div className="card-content">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    الاسم
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input pr-10"
                      placeholder="أدخل اسمك"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    البريد الإلكتروني
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="input pr-10"
                      placeholder="أدخل بريدك الإلكتروني"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary btn-md flex items-center"
                  >
                    {isSaving ? (
                      <LoadingSpinner size="sm" className="ml-2" />
                    ) : (
                      <Save className="h-4 w-4 ml-2" />
                    )}
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 ml-2" />
                <h3 className="card-title">معلومات الحساب</h3>
              </div>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  نوع الحساب
                </label>
                <p className="mt-1 text-sm text-gray-900 capitalize">
                  {user?.plan || 'free'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  تاريخ الإنشاء
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  آخر تحديث
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.updated_at ? new Date(user.updated_at).toLocaleDateString('ar-SA') : 'غير محدد'}
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-400 ml-2" />
                <h3 className="card-title">الإشعارات</h3>
              </div>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    إشعارات البريد الإلكتروني
                  </label>
                  <p className="text-xs text-gray-500">
                    تلقي إشعارات على البريد الإلكتروني
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    إشعارات الحضور
                  </label>
                  <p className="text-xs text-gray-500">
                    إشعارات حول جلسات الحضور
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    إشعارات الدرجات
                  </label>
                  <p className="text-xs text-gray-500">
                    إشعارات عند إضافة درجات جديدة
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="flex items-center">
                <Key className="h-5 w-5 text-gray-400 ml-2" />
                <h3 className="card-title">الأمان</h3>
              </div>
            </div>
            <div className="card-content space-y-4">
              <button className="w-full btn-outline btn-md">
                تغيير كلمة المرور
              </button>
              
              <button className="w-full btn-outline btn-md">
                تفعيل المصادقة الثنائية
              </button>
              
              <button className="w-full text-red-600 hover:text-red-700 text-sm">
                حذف الحساب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
