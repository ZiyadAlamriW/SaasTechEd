import { useState, useEffect } from 'react';
import { Plus, FileText, Edit, Trash2, Play, BarChart3, Clock } from 'lucide-react';
import { quizService } from '../services/quizService';
import { studentService } from '../services/studentService';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    deadline: '',
  });
  const [questionData, setQuestionData] = useState({
    question: '',
    correct_answer: '',
  });

  useEffect(() => {
    fetchQuizzes();
    fetchStudents();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setIsLoading(true);
      const response = await quizService.getQuizzes(1, 50);
      
      if (response.success) {
        setQuizzes(response.data.quizzes);
      } else {
        toast.error('فشل في تحميل الاختبارات');
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

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    
    try {
      const response = await quizService.createQuiz(
        formData.title,
        formData.deadline || null
      );
      
      if (response.success) {
        toast.success('تم إنشاء الاختبار بنجاح');
        setIsModalOpen(false);
        setFormData({ title: '', deadline: '' });
        fetchQuizzes();
      } else {
        toast.error(response.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    
    if (!selectedQuiz) return;
    
    try {
      const response = await quizService.addQuestion(
        selectedQuiz.id,
        questionData.question,
        questionData.correct_answer
      );
      
      if (response.success) {
        toast.success('تم إضافة السؤال بنجاح');
        setIsQuestionModalOpen(false);
        setQuestionData({ question: '', correct_answer: '' });
        setSelectedQuiz(null);
        fetchQuizzes();
      } else {
        toast.error(response.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الاختبار؟')) {
      try {
        const response = await quizService.deleteQuiz(quizId);
        if (response.success) {
          toast.success('تم حذف الاختبار بنجاح');
          fetchQuizzes();
        } else {
          toast.error(response.error || 'حدث خطأ');
        }
      } catch (error) {
        toast.error('حدث خطأ في الاتصال');
      }
    }
  };

  const handleViewResults = async (quiz) => {
    try {
      const response = await quizService.getResults(quiz.id);
      if (response.success) {
        setQuizResults(response.data);
        setIsResultsModalOpen(true);
      } else {
        toast.error(response.error || 'حدث خطأ');
      }
    } catch (error) {
      toast.error('حدث خطأ في الاتصال');
    }
  };

  const isQuizExpired = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const getQuizStatus = (quiz) => {
    if (isQuizExpired(quiz.deadline)) {
      return { text: 'منتهي الصلاحية', color: 'bg-red-100 text-red-800' };
    }
    if (quiz.deadline) {
      return { text: 'نشط', color: 'bg-green-100 text-green-800' };
    }
    return { text: 'مفتوح', color: 'bg-blue-100 text-blue-800' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الاختبارات</h1>
          <p className="mt-1 text-sm text-gray-500">
            إنشاء وإدارة الاختبارات والتصحيح التلقائي
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary btn-md flex items-center"
        >
          <Plus className="h-4 w-4 ml-2" />
          إنشاء اختبار جديد
        </button>
      </div>

      {/* Quizzes List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد اختبارات</h3>
            <p className="mt-1 text-sm text-gray-500">
              ابدأ بإنشاء اختبار جديد
            </p>
          </div>
        ) : (
          quizzes.map((quiz) => {
            const status = getQuizStatus(quiz);
            return (
              <div key={quiz.id} className="card">
                <div className="card-content">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {quiz.title}
                        </h3>
                        <div className="flex items-center space-x-4 space-x-reverse mt-1">
                          <span className="text-sm text-gray-500">
                            {quiz.questions?.length || 0} أسئلة
                          </span>
                          {quiz.deadline && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 ml-1" />
                              {new Date(quiz.deadline).toLocaleDateString('ar-SA')}
                            </div>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleViewResults(quiz)}
                        className="btn-outline btn-sm flex items-center"
                      >
                        <BarChart3 className="h-4 w-4 ml-1" />
                        النتائج
                      </button>
                      <button
                        onClick={() => {
                          setSelectedQuiz(quiz);
                          setIsQuestionModalOpen(true);
                        }}
                        className="btn-outline btn-sm flex items-center"
                      >
                        <Plus className="h-4 w-4 ml-1" />
                        إضافة سؤال
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Questions List */}
                  {quiz.questions && quiz.questions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">الأسئلة:</h4>
                      <div className="space-y-2">
                        {quiz.questions.map((question, index) => (
                          <div key={question.id} className="p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-900">
                              {index + 1}. {question.question}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              الإجابة الصحيحة: {question.correct_answer}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Quiz Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إنشاء اختبار جديد"
      >
        <form onSubmit={handleCreateQuiz} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              عنوان الاختبار
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input mt-1"
              placeholder="أدخل عنوان الاختبار"
            />
          </div>
          
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              تاريخ الانتهاء (اختياري)
            </label>
            <input
              type="datetime-local"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
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
              إنشاء الاختبار
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Question Modal */}
      <Modal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setSelectedQuiz(null);
          setQuestionData({ question: '', correct_answer: '' });
        }}
        title={`إضافة سؤال - ${selectedQuiz?.title}`}
      >
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700">
              السؤال
            </label>
            <textarea
              id="question"
              name="question"
              required
              rows={3}
              value={questionData.question}
              onChange={(e) => setQuestionData({ ...questionData, question: e.target.value })}
              className="input mt-1"
              placeholder="أدخل السؤال"
            />
          </div>
          
          <div>
            <label htmlFor="correct_answer" className="block text-sm font-medium text-gray-700">
              الإجابة الصحيحة
            </label>
            <input
              type="text"
              id="correct_answer"
              name="correct_answer"
              required
              value={questionData.correct_answer}
              onChange={(e) => setQuestionData({ ...questionData, correct_answer: e.target.value })}
              className="input mt-1"
              placeholder="أدخل الإجابة الصحيحة"
            />
          </div>

          <div className="flex justify-end space-x-3 space-x-reverse">
            <button
              type="button"
              onClick={() => {
                setIsQuestionModalOpen(false);
                setSelectedQuiz(null);
                setQuestionData({ question: '', correct_answer: '' });
              }}
              className="btn-secondary btn-md"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="btn-primary btn-md"
            >
              إضافة السؤال
            </button>
          </div>
        </form>
      </Modal>

      {/* Results Modal */}
      <Modal
        isOpen={isResultsModalOpen}
        onClose={() => {
          setIsResultsModalOpen(false);
          setQuizResults(null);
        }}
        title="نتائج الاختبار"
        size="lg"
      >
        {quizResults && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium text-gray-900">{quizResults.quiz.title}</h3>
              <p className="text-sm text-gray-500">
                إجمالي الأسئلة: {quizResults.statistics.total_questions}
              </p>
              <p className="text-sm text-gray-500">
                إجمالي المشاركين: {Object.keys(quizResults.statistics.student_results).length}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-md font-medium text-gray-900">نتائج الطلاب:</h4>
              {Object.values(quizResults.statistics.student_results).map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{result.student.name}</p>
                    <p className="text-xs text-gray-500">{result.student.email}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-900">
                      {result.correct} / {result.total}
                    </p>
                    <p className="text-xs text-gray-500">
                      {result.percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Quizzes;
