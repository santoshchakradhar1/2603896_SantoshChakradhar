const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const auth = require('../middleware/authMiddleware');

router.get('/', supplierController.getSuppliers);
router.post('/', auth, supplierController.createSupplier);

module.exports = router;