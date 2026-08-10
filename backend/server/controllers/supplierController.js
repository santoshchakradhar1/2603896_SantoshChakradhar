const { Supplier } = require('../models');

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name, contactEmail, phone } = req.body;
    if (!name) return res.status(400).json({ message: 'Supplier name is required' });
    const supplier = await Supplier.create({ name, contactEmail, phone });
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};