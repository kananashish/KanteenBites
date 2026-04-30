import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import io from 'socket.io-client';

const OrderTrackingPage = () => {
  const { orderId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    loadOrder();
    setupSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [orderId, token]);

  const loadOrder = async () => {
    try {
      const orderData = await api.getOrder(orderId, token);
      setOrder(orderData);

      if (orderData.tokenNumber) {
        const queueData = await api.getQueueStatus(orderId, token);
        setQueueInfo(queueData);
      }
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocket = () => {
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: { token },
    });

    newSocket.on('order_update', (data) => {
      if (data.orderId === orderId) {
        setOrder(data.order);
      }
    });

    newSocket.on('queue_update', (data) => {
      if (data.orderId === orderId) {
        setQueueInfo(data);
      }
    });

    setSocket(newSocket);
  };

  const getStatusColor = (status) => {
    const colors = {
      PAYMENT_PENDING: '#ffd93d',
      PAYMENT_SUCCESS: '#4ecdc4',
      ORDER_CONFIRMED: '#4ecdc4',
      PREPARING: '#4ecdc4',
      READY: '#51cf66',
      COMPLETED: '#51cf66',
      CANCELLED: '#ff6b6b',
    };
    return colors[status] || '#999';
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      PAYMENT_PENDING: '💳',
      PAYMENT_SUCCESS: '✅',
      ORDER_CONFIRMED: '📝',
      PREPARING: '👨‍🍳',
      READY: '🎉',
      COMPLETED: '✔️',
      CANCELLED: '❌',
    };
    return emojis[status] || '⏳';
  };

  if (loading) {
    return <div style={styles.container}><p>Loading order details...</p></div>;
  }

  if (!order) {
    return <div style={styles.container}><p>Order not found</p></div>;
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/menu')} style={styles.backButton}>
        ← Back to Menu
      </button>

      <div style={styles.card}>
        <h1 style={styles.title}>📋 Order Tracking</h1>

        <div style={{...styles.statusBox, borderColor: getStatusColor(order.status || 'PAYMENT_PENDING')}}>
          <div style={styles.statusEmoji}>{getStatusEmoji(order.status || 'PAYMENT_PENDING')}</div>
          <div>
            <p style={styles.statusLabel}>{(order.status || 'PAYMENT_PENDING').replace(/_/g, ' ')}</p>
            <p style={styles.statusTime}>
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {order.tokenNumber && (
          <div style={styles.tokenBox}>
            <div style={styles.tokenNumber}>{order.tokenNumber}</div>
            <p style={styles.tokenLabel}>Your Token</p>
          </div>
        )}

        {queueInfo && (
          <div style={styles.queueInfo}>
            <h3>Queue Status</h3>
            <div style={styles.queueRow}>
              <span>Orders Ahead:</span>
              <strong>{queueInfo.ordersAhead || 0}</strong>
            </div>
            <div style={styles.queueRow}>
              <span>Estimated Time:</span>
              <strong>{queueInfo.estimatedTime}</strong>
            </div>
          </div>
        )}

        <div style={styles.orderDetails}>
          <h3>Order Details</h3>
          <div style={styles.itemsList}>
            {order.items && order.items.map((item, index) => (
              <div key={index} style={styles.detailRow}>
                <span>{item.quantity}x {item.name}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div style={styles.totalRow}>
            <span>Total:</span>
            <strong>₹{(order.totalAmount || 0).toFixed(2)}</strong>
          </div>
        </div>

        {(order.status || 'PAYMENT_PENDING') === 'READY' && (
          <div style={styles.readyAlert}>
            <p style={{fontSize: '18px'}}>🎉 Your order is ready!</p>
            <p>Please collect from the counter using your token number</p>
          </div>
        )}

        {(order.status || 'PAYMENT_PENDING') !== 'COMPLETED' && (order.status || 'PAYMENT_PENDING') !== 'CANCELLED' && (
          <button
            onClick={() => navigate('/menu')}
            style={styles.continueButton}
          >
            Order More
          </button>
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
  backButton: {
    padding: '10px 20px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '14px',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    marginTop: 0,
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    border: '3px solid',
    marginBottom: '20px',
  },
  statusEmoji: {
    fontSize: '40px',
  },
  statusLabel: {
    margin: '0 0 5px 0',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  statusTime: {
    margin: '0',
    color: '#666',
    fontSize: '14px',
  },
  tokenBox: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f0f0f0',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  tokenNumber: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  tokenLabel: {
    margin: '10px 0 0 0',
    color: '#666',
  },
  queueInfo: {
    backgroundColor: '#e8f4f8',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  queueRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '16px',
  },
  orderDetails: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  itemsList: {
    marginBottom: '15px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  readyAlert: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  continueButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#4ecdc4',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default OrderTrackingPage;
