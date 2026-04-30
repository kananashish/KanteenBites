import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';

const MenuPage = () => {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { addItem, cart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadMenu();
    loadCategories();
  }, []);

  const loadMenu = async () => {
    try {
      const data = await api.getMenu();
      setMenu(data);
    } catch (error) {
      console.error('Failed to load menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const filteredMenu = selectedCategory
    ? menu.filter((item) => item.category === selectedCategory)
    : menu;

  const handleAddToCart = (item) => {
    addItem({
      itemId: item._id,
      name: item.name,
      price: item.price,
      prepTime: item.prepTime,
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🍽️ Order Your Meal</h1>
        <button
          onClick={() => navigate('/cart')}
          style={{
            ...styles.cartButton,
            backgroundColor: cart.length > 0 ? '#ff6b6b' : '#ccc',
          }}
        >
          🛒 Cart ({cart.length})
        </button>
      </div>

      <div style={styles.categoryContainer}>
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            ...styles.categoryButton,
            backgroundColor: selectedCategory === null ? '#4ecdc4' : '#ddd',
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              ...styles.categoryButton,
              backgroundColor: selectedCategory === cat ? '#4ecdc4' : '#ddd',
            }}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading menu...</p>
      ) : (
        <div style={styles.menuGrid}>
          {filteredMenu.map((item) => (
            <div key={item._id} style={styles.menuItem}>
              <div style={styles.itemHeader}>
                <h3 style={styles.itemName}>{item.name}</h3>
                {!item.isAvailable && <span style={styles.soldOut}>OUT OF STOCK</span>}
              </div>
              <p style={styles.itemDesc}>{item.description}</p>
              <div style={styles.itemFooter}>
                <span style={styles.price}>₹{item.price}</span>
                <span style={styles.prepTime}>⏱️ {item.prepTime}m</span>
              </div>
              <button
                onClick={() => handleAddToCart(item)}
                disabled={!item.isAvailable}
                style={{
                  ...styles.addButton,
                  opacity: item.isAvailable ? 1 : 0.5,
                  cursor: item.isAvailable ? 'pointer' : 'not-allowed',
                }}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    margin: 0,
  },
  cartButton: {
    padding: '12px 24px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
  },
  categoryContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '30px',
    overflowX: 'auto',
    paddingBottom: '10px',
  },
  categoryButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '20px',
  },
  menuItem: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  itemName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
  },
  soldOut: {
    backgroundColor: '#ff6b6b',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
  },
  itemDesc: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#666',
  },
  itemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  price: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ff6b6b',
  },
  prepTime: {
    fontSize: '14px',
    color: '#666',
  },
  addButton: {
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

export default MenuPage;
