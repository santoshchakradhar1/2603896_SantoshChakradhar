import React, { useState, useEffect } from 'react';

export default function ProductForm({ onSubmit, editingProduct, suppliers, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    price: '',
    supplierId: '',
    image: null
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        quantity: editingProduct.quantity,
        price: editingProduct.price,
        supplierId: editingProduct.supplierId,
        image: null
      });
    } else {
      setFormData({ name: '', quantity: '', price: '', supplierId: suppliers[0]?.id || '', image: null });
    }
  }, [editingProduct, suppliers]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Client-side validation
    if (!formData.name || formData.quantity === '' || formData.price === '' || !formData.supplierId) {
      setError('Please fill in all required fields.');
      return;
    }
    if (Number(formData.quantity) < 0 || Number(formData.price) < 0) {
      setError('Quantity and price cannot be negative.');
      return;
    }

    setError('');
    const data = new FormData();
    data.append('name', formData.name);
    data.append('quantity', formData.quantity);
    data.append('price', formData.price);
    data.append('supplierId', formData.supplierId);
    if (formData.image) data.append('image', formData.image);

    onSubmit(data);
  };

  return (
    <div className="card">
      <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
      {error && <div className="error-msg">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Quantity</label>
          <input type="number" name="quantity" min="0" value={formData.quantity} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Price ($)</label>
          <input type="number" step="0.01" name="price" min="0" value={formData.price} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Supplier</label>
          <select name="supplierId" value={formData.supplierId} onChange={handleChange} required>
            <option value="">Select Supplier</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Product Image</label>
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
        </div>
        <button type="submit">{editingProduct ? 'Update Product' : 'Add Product'}</button>
        {editingProduct && <button type="button" onClick={onCancel} style={{ marginLeft: '10px', background: '#7f8c8d' }}>Cancel</button>}
      </form>
    </div>
  );
}