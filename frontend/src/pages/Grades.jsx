import { useState, useEffect } from 'react';
import { Plus, BookOpen, Edit, Trash2, TrendingUp } from 'lucide-react';
import { gradeService } from '../services/gradeService';
import { studentService } from '../services/studentService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState(null);
  const [formData, setFormData] = useState({
    student_id: '',
    subject: '',
    score: '',
    max_score: '',
  });
  const [filters, setFilters] = useState({
    student_id: '',
    subject: '',
  });

  useEffect(() => {
    fetchGrades();
    fetchStudents();
  }, [filters]);

  const fetchGrades = async () => {
    try {
      setIsLoading(true);
      const response = await gradeService.getGrades(1, 50, filters.student_id, filters.subject);
      
      if (response.success) {
        setGrades(response.data.grades);
      } else {
        toast.error('فشل في تحميل الدرجات');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentService.getStudents(1, 100);
      if (response.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      if (editingGrade) {
        response = await gradeService.updateGrade(
          editingGrade.id,
          formData.subject,
          parseFloat(formData.score),
          parseFloat(formData.max_score)
        );
      } else {
        response = await gradeService.createGrade(
          formData.student_id,
          formData.subject,
          parseFloat(formData.score),
          parseFloat(formData.max_score)
        );
      }

      if (response.success) {
        toast.success(editingGrade ? 'تم تحديث الدرجة بنجاح' : 'تم إضافة الدرجة بنجاح');
        setIsModalOpen(false);
        setFormData({ student_id: '', subject: '', score: '', max_score: '' });
        setEditingGrade(null);
        fetchGrades();
      } else {
        toast.error(response.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    }
  };

  const handleEdit = (grade) => {
    setEditingGrade(grade);
    setFormData({
      student_id: grade.student_id,
      subject: grade.subject,
      score: grade.score.toString(),
      max_score: grade.max_score.toString(),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (gradeId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدرجة؟')) {
      try {
        const response = await gradeService.deleteGrade(gradeId);
        if (response.success) {
          toast.success('تم حذف الدرجة بنجاح');
          fetchGrades();
        } else {
          toast.error(response.error || 'حدث خطأ');
        }
      } catch (error) {
        toast.error('حدث خطأ في الاتصال');
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingGrade(null);
    setFormData({ student_id: '', subject: '', score: '', max_score: '' });
  };

  const getGradeColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradePercentage = (score, maxScore) => {
    return Math.round((score / maxScore) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الدرجات</h1>
          <p className="mt-1 text-sm text-gray-500">
            إضافة وتعديل وحذف درجات الطلاب
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary btn-md flex items-center"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة درجة جديدة
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="student_filter" className="block text-sm font-medium text-gray-700">
                تصفية حسب الطالب
              </label>
              <select
                id="student_filter"
                value={filters.student_id}
                onChange={(e) => setFilters({ ...filters, student_id: e.target.value })}
                className="input mt-1"
              >
                <option value="">جميع الطلاب</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="subject_filter" className="block text-sm font-medium text-gray-700">
                تصفية حسب المادة
              </label>
              <input
                type="text"
                id="subject_filter"
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                className="input mt-1"
                placeholder="أدخل اسم المادة"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="card">
        <div className="card-content p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد درجات</h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ بإضافة درجة جديدة
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الطالب
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      المادة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الدرجة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      النسبة المئوية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      تاريخ الإضافة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade) => (
                    <tr key={grade.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {grade.student?.name || 'غير محدد'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {grade.student?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {grade.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${getGradeColor(grade.score, grade.max_score)}`}>
                            {grade.score} / {grade.max_score}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-gray-400 ml-1" />
                          <span className={`text-sm font-medium ${getGradeColor(grade.score, grade.max_score)}`}>
                            {getGradePercentage(grade.score, grade.max_score)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(grade.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEdit(grade)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(grade.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Grade Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingGrade ? 'تعديل الدرجة' : 'إضافة درجة جديدة'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
              الطالب
            </label>
            <select
              id="student_id"
              name="student_id"
              required
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="input mt-1"
              disabled={!!editingGrade}
            >
              <option value="">اختر الطالب</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              المادة
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="input mt-1"
              placeholder="أدخل اسم المادة"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="score" className="block text-sm font-medium text-gray-700">
                الدرجة المحققة
              </label>
              <input
                type="number"
                id="score"
                name="score"
                required
                min="0"
                step="0.1"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                className="input mt-1"
                placeholder="0"
              />
            </div>
            
            <div>
              <label htmlFor="max_score" className="block text-sm font-medium text-gray-700">
                الدرجة الكاملة
              </label>
              <input
                type="number"
                id="max_score"
                name="max_score"
                required
                min="0"
                step="0.1"
                value={formData.max_score}
                onChange={(e) => setFormData({ ...formData, max_score: e.target.value })}
                className="input mt-1"
                placeholder="100"
              />
            </div>
          </div>

          {formData.score && formData.max_score && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                النسبة المئوية: {getGradePercentage(parseFloat(formData.score), parseFloat(formData.max_score))}%
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={handleModalClose}
              className="btn-secondary btn-md"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary btn-md"
            >
              {editingGrade ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Grades;
