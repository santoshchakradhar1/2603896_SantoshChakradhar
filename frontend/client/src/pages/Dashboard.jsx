import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import ProductList from '../components/ProductList';
import ProductForm from '../components/ProductForm';

export default function Dashboard({ token, onLogout }) {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [error, setError] = useState('');

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchData = async () => {
    try {
      const [prodRes, suppRes] = await Promise.all([
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/suppliers')
      ]);
      setProducts(prodRes.data);
      setSuppliers(suppRes.data);
    } catch (err) {
      setError('Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFormSubmit = async (formData) => {
    try {
      if (editingProduct) {
        await axios.put(`http://localhost:5000/api/products/${editingProduct.id}`, formData, authHeader);
        setEditingProduct(null);
      } else {
        await axios.post('http://localhost:5000/api/products', formData, authHeader);
      }
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${id}`, authHeader);
        fetchData();
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesSupplier = supplierFilter === '' || p.supplierId === Number(supplierFilter);
    return matchesSearch && matchesSupplier;
  });

  return (
    <div>
      <Navbar onLogout={onLogout} />
      <div className="container">
        {error && <div className="error-msg">{error}</div>}

        <div className="card filters">
          <input
            type="text"
            placeholder="Search products by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
            <option value="">All Suppliers</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <ProductForm
          onSubmit={handleFormSubmit}
          editingProduct={editingProduct}
          suppliers={suppliers}
          onCancel={() => setEditingProduct(null)}
        />

        <ProductList
          products={filteredProducts}
          onEdit={(prod) => setEditingProduct(prod)}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}