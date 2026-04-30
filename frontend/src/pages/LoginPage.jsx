import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login({ email, password });
      if (data.error) {
        setError(data.error);
      } else {
        login(data.user, data.token);
        navigate('/menu');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🍽️ KanteenBites</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <h2 style={styles.heading}>Login</h2>
          {error && <div style={styles.error}>{error}</div>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p style={styles.text}>
            Don't have an account?{' '}
            <a href="/register" style={styles.link}>
              Register here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f0f0',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    textAlign: 'center',
    fontSize: '28px',
    marginBottom: '30px',
  },
  heading: {
    fontSize: '20px',
    marginBottom: '20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
  },
  button: {
    backgroundColor: '#ff6b6b',
    color: 'white',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
  },
  error: {
    backgroundColor: '#ffe0e0',
    color: '#c92a2a',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '14px',
  },
  text: {
    textAlign: 'center',
    fontSize: '14px',
    marginTop: '15px',
  },
  link: {
    color: '#ff6b6b',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};

export default LoginPage;
