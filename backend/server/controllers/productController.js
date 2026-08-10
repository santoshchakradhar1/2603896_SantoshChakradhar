const { Product, Supplier } = require('../models');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Supplier, attributes: ['name'] }]
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, quantity, price, supplierId } = req.body;
    
    if (!name || quantity === undefined || price === undefined || !supplierId) {
      return res.status(400).json({ message: 'All fields (name, quantity, price, supplier) are required' });
    }
    if (quantity < 0 || price < 0) {
      return res.status(400).json({ message: 'Quantity and price cannot be negative' });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    const product = await Product.create({
      name,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      supplierId: parseInt(supplierId),
      image: imagePath
    });

    const newProd = await Product.findByPk(product.id, { include: [Supplier] });
    res.status(201).json(newProd);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, price, supplierId } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (quantity < 0 || price < 0) {
      return res.status(400).json({ message: 'Quantity and price cannot be negative' });
    }

    product.name = name || product.name;
    product.quantity = quantity !== undefined ? parseInt(quantity) : product.quantity;
    product.price = price !== undefined ? parseFloat(price) : product.price;
    product.supplierId = supplierId !== undefined ? parseInt(supplierId) : product.supplierId;
    
    if (req.file) {
      product.image = `/uploads/${req.file.filename}`;
    }

    await product.save();
    const updatedProd = await Product.findByPk(product.id, { include: [Supplier] });
    res.json(updatedProd);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};