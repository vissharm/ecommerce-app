const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  quantity: Number,
  status: String,
});

module.exports = mongoose.model('Order', OrderSchema);