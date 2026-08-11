import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'https://inventory-api-backend-o7f7.onrender.com/api';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    supplier: ''
  });
  const [editingId, setEditingId] = useState(null);

  // Auth Header Helper
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/products`, getAuthHeaders());
      setProducts(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE}/products/${editingId}`,
          formData,
          getAuthHeaders()
        );
        setEditingId(null);
      } else {
        await axios.post(
          `${API_BASE}/products`,
          formData,
          getAuthHeaders()
        );
      }
      
      setFormData({ name: '', price: '', quantity: '', supplier: '' });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed. Check authentication.');
    }
  };

  const handleEdit = (product) => {
    const id = product.id || product._id;
    setEditingId(id);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      quantity: product.quantity ?? product.stock ?? '',
      supplier: product.supplier || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`${API_BASE}/products/${id}`, getAuthHeaders());
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', quantity: '', supplier: '' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Dashboard Stats
  const totalProducts = products.length;
  const lowStockCount = products.filter(p => (p.quantity ?? p.stock ?? 0) < 10).length;
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity ?? p.stock) || 0), 0);

  // Search Filter
  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h2>Inventory Dashboard</h2>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Summary Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.card}>
          <h3>Total Products</h3>
          <p style={styles.cardValue}>{totalProducts}</p>
        </div>
        <div style={styles.card}>
          <h3>Total Value</h3>
          <p style={styles.cardValue}>${totalValue.toFixed(2)}</p>
        </div>
        <div style={{ ...styles.card, borderColor: lowStockCount > 0 ? '#e74c3c' : '#2ecc71' }}>
          <h3>Low Stock Alerts</h3>
          <p style={{ ...styles.cardValue, color: lowStockCount > 0 ? '#e74c3c' : '#2ecc71' }}>
            {lowStockCount}
          </p>
        </div>
      </div>

      {/* Product Form */}
      <div style={styles.formCard}>
        <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
          <input
            type="number"
            name="price"
            placeholder="Price ($)"
            value={formData.price}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
          <input
            type="number"
            name="quantity"
            placeholder="Quantity / Stock"
            value={formData.quantity}
            onChange={handleInputChange}
            required
            style={styles.input}
          />
          <input
            type="text"
            name="supplier"
            placeholder="Supplier"
            value={formData.supplier}
            onChange={handleInputChange}
            style={styles.input}
          />

          <div style={styles.btnGroup}>
            <button type="submit" style={styles.submitBtn}>
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} style={styles.cancelBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Controls & Search */}
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Products Table */}
      {loading ? (
        <p>Loading inventory...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Supplier</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" style={styles.tdCenter}>No products found.</td>
              </tr>
            ) : (
              filteredProducts.map((prod) => {
                const prodId = prod.id || prod._id;
                const qty = prod.quantity ?? prod.stock ?? 0;
                const isLowStock = qty < 10;

                return (
                  <tr key={prodId} style={styles.tableRow}>
                    <td style={styles.td}><strong>{prod.name}</strong></td>
                    <td style={styles.td}>${Number(prod.price).toFixed(2)}</td>
                    <td style={{ ...styles.td, color: isLowStock ? '#e74c3c' : 'inherit', fontWeight: isLowStock ? 'bold' : 'normal' }}>
                      {qty} {isLowStock && '(Low)'}
                    </td>
                    <td style={styles.td}>{prod.supplier || 'N/A'}</td>
                    <td style={styles.td}>
                      <button onClick={() => handleEdit(prod)} style={styles.editBtn}>Edit</button>
                      <button onClick={() => handleDelete(prodId)} style={styles.deleteBtn}>Delete</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' },
  logoutBtn: { backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  errorBox: { backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' },
  statsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' },
  card: { backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', borderLeft: '5px solid #3498db', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  cardValue: { fontSize: '24px', fontWeight: 'bold', margin: '10px 0 0 0' },
  formCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '25px' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' },
  input: { padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '14px' },
  btnGroup: { gridColumn: '1 / -1', display: 'flex', gap: '10px', marginTop: '10px' },
  submitBtn: { backgroundColor: '#2ecc71', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { backgroundColor: '#7f8c8d', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' },
  controls: { marginBottom: '15px' },
  searchInput: { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
  tableHeader: { backgroundColor: '#f4f4f4' },
  th: { padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' },
  td: { padding: '10px 12px', borderBottom: '1px solid #eee' },
  tdCenter: { padding: '20px', textAlign: 'center', color: '#777' },
  tableRow: { transition: 'background-color 0.2s' },
  editBtn: { backgroundColor: '#3498db', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', marginRight: '5px', cursor: 'pointer' },
  deleteBtn: { backgroundColor: '#e74c3c', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }
};