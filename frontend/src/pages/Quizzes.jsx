const Quizzes = () => {
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
    card: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '20px',
      color: '#1f2937'
    },
    text: {
      color: '#6b7280'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>إدارة الاختبارات</h1>
      
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>الاختبارات</h2>
        <p style={styles.text}>هذه الصفحة قيد التطوير...</p>
      </div>
    </div>
  );
};

export default Quizzes;