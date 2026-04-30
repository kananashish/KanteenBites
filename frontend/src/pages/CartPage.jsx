import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';

const CartPage = () => {
  const { cart, removeItem, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderType, setOrderType] = useState('takeaway');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const navigate = useNavigate();

  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError('Cart is empty');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cart.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
        orderType,
        paymentMethod,
      };

      const response = await api.createOrder(orderData, token);

      if (response.error) {
        setError(response.error);
      } else {
        const orderId = response.orderId;
        
        // For cash payment, skip Razorpay and confirm directly
        if (paymentMethod === 'cash') {
          await api.confirmOrder(orderId, token);
          clearCart();
          navigate(`/order/${orderId}`);
          return;
        }

        // For Razorpay/Wallet payments, initiate payment
        const paymentResponse = await api.initiatePayment(orderId, token);
        if (paymentResponse.razorpayOrderId) {
          // Open Razorpay payment
          const options = {
            key: paymentResponse.razorpayKeyId,
            amount: paymentResponse.amount,
            currency: 'INR',
            order_id: paymentResponse.razorpayOrderId,
            handler: async (response) => {
              try {
                // Verify payment
                await api.verifyPayment(
                  {
                    orderId,
                    razorpayOrderId: paymentResponse.razorpayOrderId,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  },
                  token
                );
                
                // Confirm order
                await api.confirmOrder(orderId, token);
                
                clearCart();
                navigate(`/order/${orderId}`);
              } catch (err) {
                setError('Payment verification failed');
              }
            },
            prefill: {
              email: 'user@example.com',
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          setError('Payment initiation failed. Please try again.');
        }
      }
    } catch (err) {
      setError('Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🛒 Your Cart</h1>

      {error && <div style={styles.error}>{error}</div>}

      {cart.length === 0 ? (
        <div style={styles.emptyCart}>
          <p>Your cart is empty</p>
          <button
            onClick={() => navigate('/menu')}
            style={styles.continueButton}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div style={styles.cartContent}>
          <div style={styles.items}>
            {cart.map((item) => (
              <div key={item.itemId} style={styles.cartItem}>
                <div style={styles.itemInfo}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <p style={styles.itemPrice}>₹{item.price}</p>
                </div>
                <div style={styles.quantityControl}>
                  <button
                    onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                    style={styles.quantityButton}
                  >
                    −
                  </button>
                  <span style={styles.quantity}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                    style={styles.quantityButton}
                  >
                    +
                  </button>
                </div>
                <div style={styles.itemTotal}>
                  ₹{(item.price * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeItem(item.itemId)}
                  style={styles.removeButton}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={styles.summary}>
            <h2 style={styles.summaryTitle}>Order Summary</h2>
            
            <div style={styles.orderType}>
              <label>
                <input
                  type="radio"
                  value="takeaway"
                  checked={orderType === 'takeaway'}
                  onChange={(e) => setOrderType(e.target.value)}
                />
                Takeaway
              </label>
              <label>
                <input
                  type="radio"
                  value="dine-in"
                  checked={orderType === 'dine-in'}
                  onChange={(e) => setOrderType(e.target.value)}
                />
                Dine-in
              </label>
            </div>

            <div style={styles.paymentMethod}>
              <h3 style={{ margin: '15px 0 10px', fontSize: '14px' }}>Payment Method:</h3>
              <label>
                <input
                  type="radio"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Card/UPI (Razorpay)
              </label>
              <label>
                <input
                  type="radio"
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Wallet
              </label>
              <label>
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Pay at Counter
              </label>
            </div>

            <div style={styles.totalRow}>
              <span>Subtotal:</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Total:</span>
              <span style={styles.totalAmount}>₹{totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                ...styles.checkoutButton,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>

            <button
              onClick={() => navigate('/menu')}
              style={styles.continueButton}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  title: {
    fontSize: '32px',
    marginBottom: '20px',
  },
  error: {
    backgroundColor: '#ffe0e0',
    color: '#c92a2a',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '60px 20px',
  },
  cartContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 350px',
    gap: '30px',
  },
  items: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  cartItem: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto auto auto',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  itemName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
  },
  itemPrice: {
    margin: 0,
    color: '#666',
    fontSize: '14px',
  },
  quantityControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '4px',
  },
  quantityButton: {
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '16px',
    width: '24px',
  },
  quantity: {
    minWidth: '30px',
    textAlign: 'center',
  },
  itemTotal: {
    fontWeight: 'bold',
    minWidth: '80px',
    textAlign: 'right',
  },
  removeButton: {
    border: 'none',
    background: 'transparent',
    color: '#ff6b6b',
    cursor: 'pointer',
    fontSize: '18px',
  },
  summary: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    height: 'fit-content',
  },
  summaryTitle: {
    margin: '0 0 20px 0',
    fontSize: '18px',
  },
  orderType: {
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '14px',
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#ff6b6b',
  },
  checkoutButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#ff6b6b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
  },
  continueButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default CartPage;
