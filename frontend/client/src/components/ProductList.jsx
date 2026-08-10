import React from 'react';

export default function ProductList({ products, onEdit, onDelete }) {
  return (
    <div className="card">
      <h3>Product Inventory</h3>
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Supplier</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => {
            const isLowStock = p.quantity < 5;
            return (
              <tr key={p.id} className={isLowStock ? 'low-stock' : ''}>
                <td>
                  {p.image ? (
                    <img src={`http://localhost:5000${p.image}`} alt={p.name} width="50" height="50" style={{ objectFit: 'cover', borderRadius: '4px' }} />
                  ) : 'No Image'}
                </td>
                <td>{p.name} {isLowStock && <span style={{ fontSize: '0.8em', color: 'red' }}>(LOW STOCK)</span>}</td>
                <td>{p.Supplier ? p.Supplier.name : 'N/A'}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.quantity}</td>
                <td>
                  <button onClick={() => onEdit(p)}>Edit</button>
                  <button onClick={() => onDelete(p.id)} className="danger">Delete</button>
                </td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan="6">No products found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}