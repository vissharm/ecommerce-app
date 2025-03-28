const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  quantity: Number,
  status: String,
  orderDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Order', OrderSchema);