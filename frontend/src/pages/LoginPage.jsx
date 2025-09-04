import { useState } from 'react';

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          onLogin(data.user);
        } else {
          setError('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن.');
          setIsLogin(true);
        }
      } else {
        setError(data.error || 'حدث خطأ');
      }
    } catch (err) {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      padding: '20px'
    },
    formContainer: {
      maxWidth: '400px',
      width: '100%',
      backgroundColor: 'white',
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    title: {
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      marginBottom: '30px',
      color: '#1f2937'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      marginBottom: '16px',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      marginBottom: '16px'
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed'
    },
    link: {
      textAlign: 'center',
      color: '#3b82f6',
      cursor: 'pointer',
      textDecoration: 'none'
    },
    error: {
      color: '#ef4444',
      fontSize: '14px',
      marginBottom: '16px',
      textAlign: 'center'
    },
    success: {
      color: '#10b981',
      fontSize: '14px',
      marginBottom: '16px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>
          {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              name="name"
              type="text"
              placeholder="الاسم"
              required={!isLogin}
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
            />
          )}
          
          <input
            name="email"
            type="email"
            placeholder="البريد الإلكتروني"
            required
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          
          <input
            name="password"
            type="password"
            placeholder="كلمة المرور"
            required
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
          />

          {error && (
            <div style={error.includes('نجح') ? styles.success : styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? 'جاري التحميل...' : (isLogin ? 'تسجيل الدخول' : 'إنشاء حساب')}
          </button>

          <div style={styles.link}>
            <span
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ name: '', email: '', password: '' });
              }}
            >
              {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;