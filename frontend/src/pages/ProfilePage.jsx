import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const ProfilePage = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [token]);

  const loadProfile = async () => {
    try {
      const data = await api.getProfile(token);
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.container}><p>Loading profile...</p></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>👤 My Profile</h1>

        {profile && (
          <div style={styles.form}>
            <div style={styles.field}>
              <label>Name</label>
              <input type="text" value={profile.name} disabled style={styles.input} />
            </div>

            <div style={styles.field}>
              <label>Email</label>
              <input type="email" value={profile.email} disabled style={styles.input} />
            </div>

            <div style={styles.field}>
              <label>Role</label>
              <input
                type="text"
                value={profile.role.toUpperCase()}
                disabled
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label>Wallet Balance</label>
              <div style={styles.walletBox}>
                <span style={styles.walletAmount}>₹{profile.walletBalance.toFixed(2)}</span>
              </div>
            </div>

            <div style={styles.field}>
              <label>Preferences</label>
              <div style={styles.preferences}>
                <label>
                  <input
                    type="checkbox"
                    defaultChecked={profile.preferences?.notificationsEnabled}
                    disabled
                  />
                  Notifications Enabled
                </label>
                <label>
                  <input
                    type="checkbox"
                    defaultChecked={profile.preferences?.soundAlert}
                    disabled
                  />
                  Sound Alerts
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '28px',
    marginTop: 0,
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#f9f9f9',
  },
  walletBox: {
    padding: '15px',
    backgroundColor: '#e8f4f8',
    borderRadius: '6px',
  },
  walletAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#4ecdc4',
  },
  preferences: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
};

export default ProfilePage;
