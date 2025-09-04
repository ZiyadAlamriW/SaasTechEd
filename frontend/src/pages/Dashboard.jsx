import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    studentsCount: 0,
    attendanceSessionsCount: 0,
    quizzesCount: 0,
    gradesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    },
    title: {
      fontSize: '32px',
      fontWeight: 'bold',
      marginBottom: '30px',
      color: '#1f2937'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px',
      marginBottom: '30px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center'
    },
    statIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: '15px',
      fontSize: '20px'
    },
    statContent: {
      flex: 1
    },
    statLabel: {
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '5px'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#1f2937'
    },
    actionsCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    actionsTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '20px',
      color: '#1f2937'
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px'
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '15px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      backgroundColor: 'white',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      color: '#374151',
      textDecoration: 'none'
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
      <h1 style={styles.title}>لوحة التحكم</h1>
      
      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: '#3b82f6'}}>👥</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>عدد الطلاب</div>
            <div style={styles.statValue}>{stats.studentsCount}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: '#10b981'}}>📅</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>جلسات الحضور</div>
            <div style={styles.statValue}>{stats.attendanceSessionsCount}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: '#f59e0b'}}>📝</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>الاختبارات</div>
            <div style={styles.statValue}>{stats.quizzesCount}</div>
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{...styles.statIcon, backgroundColor: '#8b5cf6'}}>📊</div>
          <div style={styles.statContent}>
            <div style={styles.statLabel}>الدرجات</div>
            <div style={styles.statValue}>{stats.gradesCount}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={styles.actionsCard}>
        <h2 style={styles.actionsTitle}>الإجراءات السريعة</h2>
        <div style={styles.actionsGrid}>
          <button
            onClick={() => navigate('/students')}
            style={styles.actionButton}
          >
            <span style={{marginLeft: '8px'}}>👥</span>
            إدارة الطلاب
          </button>
          
          <button
            onClick={() => navigate('/attendance')}
            style={styles.actionButton}
          >
            <span style={{marginLeft: '8px'}}>📅</span>
            إدارة الحضور
          </button>
          
          <button
            onClick={() => navigate('/grades')}
            style={styles.actionButton}
          >
            <span style={{marginLeft: '8px'}}>📊</span>
            إدارة الدرجات
          </button>
          
          <button
            onClick={() => navigate('/quizzes')}
            style={styles.actionButton}
          >
            <span style={{marginLeft: '8px'}}>📝</span>
            إدارة الاختبارات
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;