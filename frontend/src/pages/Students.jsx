import { useState, useEffect } from 'react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ name: '', email: '' });
        setShowForm(false);
        fetchStudents();
      }
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '30px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    button: {
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px'
    },
    formCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    },
    formTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '20px',
      color: '#1f2937'
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '20px'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      boxSizing: 'border-box'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '5px'
    },
    submitButton: {
      backgroundColor: '#10b981',
      color: 'white',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px'
    },
    tableCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    tableHeader: {
      padding: '20px',
      borderBottom: '1px solid #e5e7eb'
    },
    tableTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#1f2937'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      padding: '12px',
      textAlign: 'right',
      fontSize: '12px',
      fontWeight: '500',
      color: '#6b7280',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #e5e7eb'
    },
    emptyState: {
      textAlign: 'center',
      padding: '40px',
      color: '#6b7280'
    },
    loading: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px'
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        جاري التحميل...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>إدارة الطلاب</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.button}
        >
          {showForm ? 'إلغاء' : 'إضافة طالب جديد'}
        </button>
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>إضافة طالب جديد</h2>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGrid}>
              <div>
                <label style={styles.label}>اسم الطالب</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.label}>البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>
            <button type="submit" style={styles.submitButton}>
              إضافة الطالب
            </button>
          </form>
        </div>
      )}

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>قائمة الطلاب</h2>
        </div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>الاسم</th>
              <th style={styles.th}>البريد الإلكتروني</th>
              <th style={styles.th}>تاريخ الإضافة</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td style={styles.td}>{student.name}</td>
                <td style={styles.td}>{student.email || 'غير محدد'}</td>
                <td style={styles.td}>
                  {new Date(student.created_at).toLocaleDateString('ar-SA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div style={styles.emptyState}>
            لا يوجد طلاب مسجلين بعد
          </div>
        )}
      </div>
    </div>
  );
};

export default Students;