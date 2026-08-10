import React from 'react';

export default function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <h2>Inventory System</h2>
      <button onClick={onLogout} className="danger">Logout</button>
    </nav>
  );
}