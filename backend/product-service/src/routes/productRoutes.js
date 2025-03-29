const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../../../shared/middleware/auth');

// Get all products
router.get('/', auth(), async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products' });
  }
});

// Create new product
router.post('/', auth(), async (req, res) => {
  try {
    const { name, description, price, stock } = req.body;
    const product = new Product({
      name,
      description,
      price,
      stock
    });
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product' });
  }
});

module.exports = router;
