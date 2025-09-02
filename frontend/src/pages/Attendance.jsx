import { useState, useEffect } from 'react';
import { Plus, Calendar, QrCode, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import { studentService } from '../services/studentService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import QRCodeGenerator from '../components/QRCodeGenerator';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchSessions();
    fetchStudents();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await attendanceService.getSessions(1, 20);
      
      if (response.success) {
        setSessions(response.data.sessions);
      } else {
        toast.error('فشل في تحميل جلسات الحضور');
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

  const handleCreateSession = async (e) => {
    e.preventDefault();
    
    try {
      const response = await attendanceService.createSession(formData.date);
      
      if (response.success) {
        toast.success('تم إنشاء جلسة الحضور بنجاح');
        setIsModalOpen(false);
        setFormData({ date: new Date().toISOString().split('T')[0] });
        fetchSessions();
      } else {
        toast.error(response.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    }
  };

  const handleMarkAttendance = async (sessionId, studentId, status) => {
    try {
      const response = await attendanceService.markAttendance(sessionId, studentId, status);
      
      if (response.success) {
        toast.success('تم تسجيل الحضور بنجاح');
        fetchSessions();
      } else {
        toast.error(response.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    }
  };

  const handleBulkMarkAttendance = async (sessionId, attendanceData) => {
    try {
      const response = await attendanceService.bulkMarkAttendance(sessionId, attendanceData);
      
      if (response.success) {
        toast.success('تم تسجيل الحضور الجماعي بنجاح');
        fetchSessions();
      } else {
        toast.error(response.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'حاضر';
      case 'absent':
        return 'غائب';
      case 'late':
        return 'متأخر';
      default:
        return 'غير محدد';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الحضور</h1>
          <p className="mt-1 text-sm text-gray-500">
            إنشاء جلسات الحضور وتسجيل حضور الطلاب
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary btn-md flex items-center"
        >
          <Plus className="h-4 w-4 ml-2" />
          إنشاء جلسة حضور
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد جلسات حضور</h3>
            <p className="mt-1 text-sm text-gray-500">
              ابدأ بإنشاء جلسة حضور جديدة
            </p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="card">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        جلسة الحضور - {new Date(session.date).toLocaleDateString('ar-SA')}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {session.attendance_logs?.length || 0} طالب مسجل
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => {
                        setCurrentSession(session);
                        setIsQRModalOpen(true);
                      }}
                      className="btn-outline btn-sm flex items-center"
                    >
                      <QrCode className="h-4 w-4 ml-1" />
                      QR Code
                    </button>
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="btn-primary btn-sm flex items-center"
                    >
                      <Users className="h-4 w-4 ml-1" />
                      تسجيل الحضور
                    </button>
                  </div>
                </div>

                {/* Attendance Logs */}
                {session.attendance_logs && session.attendance_logs.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">سجل الحضور:</h4>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {session.attendance_logs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <span className="text-sm text-gray-900">{log.student.name}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            {getStatusIcon(log.status)}
                            <span className="mr-1">{getStatusText(log.status)}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Session Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إنشاء جلسة حضور جديدة"
      >
        <form onSubmit={handleCreateSession} className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              تاريخ الجلسة
            </label>
            <input
              type="date"
              id="date"
              name="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input mt-1"
            />
          </div>

          <div className="flex justify-end space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary btn-md"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary btn-md"
            >
              إنشاء الجلسة
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="رمز QR للحضور"
        size="sm"
      >
        {currentSession && (
          <div className="text-center">
            <QRCodeGenerator
              data={{
                sessionId: currentSession.id,
                date: currentSession.date,
                type: 'attendance'
              }}
              size={200}
              className="mx-auto"
            />
            <p className="mt-4 text-sm text-gray-600">
              يمكن للطلاب مسح هذا الرمز لتسجيل الحضور
            </p>
          </div>
        )}
      </Modal>

      {/* Attendance Marking Modal */}
      <Modal
        isOpen={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        title={`تسجيل الحضور - ${selectedSession ? new Date(selectedSession.date).toLocaleDateString('ar-SA') : ''}`}
        size="lg"
      >
        {selectedSession && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {students.map((student) => {
                const existingLog = selectedSession.attendance_logs?.find(
                  log => log.student_id === student.id
                );
                
                return (
                  <div key={student.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                    <span className="text-sm font-medium text-gray-900">{student.name}</span>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      {existingLog ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(existingLog.status)}`}>
                          {getStatusIcon(existingLog.status)}
                          <span className="mr-1">{getStatusText(existingLog.status)}</span>
                        </span>
                      ) : (
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <button
                            onClick={() => handleMarkAttendance(selectedSession.id, student.id, 'present')}
                            className="btn-sm bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            حاضر
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(selectedSession.id, student.id, 'absent')}
                            className="btn-sm bg-red-100 text-red-800 hover:bg-red-200"
                          >
                            غائب
                          </button>
                          <button
                            onClick={() => handleMarkAttendance(selectedSession.id, student.id, 'late')}
                            className="btn-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                          >
                            متأخر
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Attendance;
