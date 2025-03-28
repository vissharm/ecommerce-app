const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

router.post('/create', async (req, res) => {
  const { name, description, price, stock } = req.body;
  const product = new Product({ name, description, price, stock });
  await product.save();
  res.status(201).send(product);
});

router.get('/products', async (req, res) => {
  const products = await Product.find();
  res.status(200).send(products);
});

module.exports = router;