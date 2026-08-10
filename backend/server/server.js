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

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/products', require('./routes/productRoutes'));

const PORT = process.env.PORT || 5000;

sequelize.sync({ force: false }).then(async () => {
  console.log('Database synced successfully.');
  
  const adminExists = await User.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashedPassword });
    console.log('Default Admin Created: admin / admin123');
  }

  const supplierCount = await Supplier.count();
  if (supplierCount === 0) {
    await Supplier.bulkCreate([
      { name: 'Tech Supplies Ltd', contactEmail: 'contact@techsupplies.com', phone: '1234567890' },
      { name: 'Global Logistics', contactEmail: 'info@globallogistics.com', phone: '0987654321' }
    ]);
    console.log('Default suppliers seeded');
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});