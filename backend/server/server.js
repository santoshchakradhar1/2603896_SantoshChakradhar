require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { sequelize, User, Supplier } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

// Ensure uploads folder exists dynamically for host environments
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

const PORT = process.env.PORT || 5000;

// Sync database, seed initial data, and start server
sequelize.sync({ force: false }).then(async () => {
  console.log('Database synced successfully.');

  // Seed Default Admin User
  const adminExists = await User.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashedPassword });
    console.log('Default Admin Created: admin / admin123');
  }

  // Seed Default Suppliers
  const supplierCount = await Supplier.count();
  if (supplierCount === 0) {
    await Supplier.bulkCreate([
      { name: 'Tech Supplies Ltd', contactEmail: 'contact@techsupplies.com', phone: '1234567890' },
      { name: 'Global Logistics', contactEmail: 'info@globallogistics.com', phone: '0987654321' }
    ]);
    console.log('Default suppliers seeded');
  }

  // Single app.listen bound to 0.0.0.0 for cloud hosting platforms
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
});