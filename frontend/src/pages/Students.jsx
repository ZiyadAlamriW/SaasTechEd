import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User } from 'lucide-react';
import { studentService } from '../services/studentService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    fetchStudents();
  }, [currentPage, searchTerm]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await studentService.getStudents(currentPage, 10, searchTerm);
      
      if (response.success) {
        setStudents(response.data.students);
        setTotalPages(response.data.pagination.pages);
      } else {
        toast.error('فشل في تحميل الطلاب');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let response;
      if (editingStudent) {
        response = await studentService.updateStudent(
          editingStudent.id,
          formData.name,
          formData.email
        );
      } else {
        response = await studentService.createStudent(
          formData.name,
          formData.email
        );
      }

      if (response.success) {
        toast.success(editingStudent ? 'تم تحديث الطالب بنجاح' : 'تم إضافة الطالب بنجاح');
        setIsModalOpen(false);
        setFormData({ name: '', email: '' });
        setEditingStudent(null);
        fetchStudents();
      } else {
        toast.error(response.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (studentId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      try {
        const response = await studentService.deleteStudent(studentId);
        if (response.success) {
          toast.success('تم حذف الطالب بنجاح');
          fetchStudents();
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
    setEditingStudent(null);
    setFormData({ name: '', email: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الطلاب</h1>
          <p className="mt-1 text-sm text-gray-500">
            إضافة وتعديل وحذف بيانات الطلاب
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary btn-md flex items-center"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة طالب جديد
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="البحث عن الطلاب..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pr-10"
        />
      </div>

      {/* Students Table */}
      <div className="card">
        <div className="card-content p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner />
            </div>
          ) : students.length === 0 ? (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">لا يوجد طلاب</h3>
              <p className="mt-1 text-sm text-gray-500">
                ابدأ بإضافة طالب جديد
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
                      البريد الإلكتروني
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
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary-600" />
                            </div>
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.created_at).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-outline btn-sm"
            >
              السابق
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn-outline btn-sm"
            >
              التالي
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                صفحة <span className="font-medium">{currentPage}</span> من{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  التالي
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={editingStudent ? 'تعديل الطالب' : 'إضافة طالب جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              اسم الطالب
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input mt-1"
              placeholder="أدخل اسم الطالب"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input mt-1"
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>

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
              {editingStudent ? 'تحديث' : 'إضافة'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Students;
