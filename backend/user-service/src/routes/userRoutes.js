const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const user = new User({ name, email, password });
  await user.save();
  res.status(201).send(user);
});

router.get('/users', async (req, res) => {
  const users = await User.find();
  res.status(200).send(users);
});

module.exports = router;