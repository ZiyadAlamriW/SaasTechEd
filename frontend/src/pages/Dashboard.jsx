import { useState, useEffect } from 'react';
import { Users, Calendar, BookOpen, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { studentService } from '../services/studentService';
import { attendanceService } from '../services/attendanceService';
import { gradeService } from '../services/gradeService';
import { quizService } from '../services/quizService';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    attendanceRate: 0,
    averageGrade: 0,
    quizzes: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all stats in parallel
      const [studentsRes, attendanceRes, gradesRes, quizzesRes] = await Promise.all([
        studentService.getStudents(1, 1), // Just get count
        attendanceService.getStats(),
        gradeService.getStats(),
        quizService.getQuizzes(1, 1), // Just get count
      ]);

      // Calculate attendance rate
      let attendanceRate = 0;
      if (attendanceRes.success && attendanceRes.data.attendance_summary) {
        const summary = attendanceRes.data.attendance_summary;
        const total = summary.present + summary.absent + summary.late;
        if (total > 0) {
          attendanceRate = Math.round((summary.present / total) * 100);
        }
      }

      // Calculate average grade
      let averageGrade = 0;
      if (gradesRes.success && gradesRes.data.overall) {
        averageGrade = Math.round(gradesRes.data.overall.average || 0);
      }

      setStats({
        students: studentsRes.success ? studentsRes.data.pagination.total : 0,
        attendanceRate,
        averageGrade,
        quizzes: quizzesRes.success ? quizzesRes.data.pagination.total : 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'إجمالي الطلاب',
      value: stats.students,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'نسبة الحضور',
      value: `${stats.attendanceRate}%`,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive',
    },
    {
      title: 'متوسط الدرجات',
      value: stats.averageGrade,
      icon: BookOpen,
      color: 'bg-yellow-500',
      change: '+2%',
      changeType: 'positive',
    },
    {
      title: 'الاختبارات',
      value: stats.quizzes,
      icon: FileText,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive',
    },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-gray-500">
          نظرة عامة على إحصائيات المدرسة
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="card-content">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mr-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.title}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        <div className={`mr-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.changeType === 'positive' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          <span className="mr-1">{stat.change}</span>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">الإجراءات السريعة</h3>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Users className="h-5 w-5 ml-2" />
              إضافة طالب جديد
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Calendar className="h-5 w-5 ml-2" />
              إنشاء جلسة حضور
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <BookOpen className="h-5 w-5 ml-2" />
              إضافة درجات
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <FileText className="h-5 w-5 ml-2" />
              إنشاء اختبار
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">النشاط الأخير</h3>
        </div>
        <div className="card-content">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">تم إضافة طالب جديد</p>
                <p className="text-sm text-gray-500">منذ ساعتين</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">تم إنشاء جلسة حضور جديدة</p>
                <p className="text-sm text-gray-500">منذ 4 ساعات</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">تم إضافة درجات جديدة</p>
                <p className="text-sm text-gray-500">منذ 6 ساعات</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
