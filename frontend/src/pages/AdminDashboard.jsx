import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>👨‍💼 Admin Panel</h2>
        <nav style={styles.nav}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === 'orders' ? '#ff6b6b' : 'transparent',
            }}
          >
            📋 Orders
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === 'menu' ? '#ff6b6b' : 'transparent',
            }}
          >
            🍽️ Menu
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === 'queue' ? '#ff6b6b' : 'transparent',
            }}
          >
            📊 Queue
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              ...styles.navButton,
              backgroundColor: activeTab === 'analytics' ? '#ff6b6b' : 'transparent',
            }}
          >
            📈 Analytics
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            style={styles.logoutButton}
          >
            🚪 Logout
          </button>
        </nav>
      </div>

      <div style={styles.content}>
        <h1 style={styles.pageTitle}>
          {activeTab === 'orders' && '📋 Live Orders'}
          {activeTab === 'menu' && '🍽️ Manage Menu'}
          {activeTab === 'queue' && '📊 Queue Management'}
          {activeTab === 'analytics' && '📈 Analytics'}
        </h1>

        <div style={styles.placeholder}>
          <p>🚀 Admin panel components will be implemented here</p>
          <p>Real-time order management, inventory control, and analytics</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#1a1a1a',
    color: 'white',
    padding: '20px',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
  },
  logo: {
    margin: '0 0 30px 0',
    fontSize: '20px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  navButton: {
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  },
  logoutButton: {
    padding: '12px',
    backgroundColor: '#ff6b6b',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '30px',
  },
  content: {
    flex: 1,
    padding: '30px',
    overflowY: 'auto',
  },
  pageTitle: {
    fontSize: '28px',
    marginTop: 0,
    marginBottom: '30px',
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    padding: '40px',
    borderRadius: '8px',
    textAlign: 'center',
  },
};

export default AdminDashboard;
