const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// User Schema and Model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model('User', userSchema);

// Order Schema and Model
const orderSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  quantity: Number,
  status: String,
});
const Order = mongoose.model('Order', orderSchema);

// Notification Schema and Model
const notificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  read: { type: Boolean, default: false },
});
const Notification = mongoose.model('Notification', notificationSchema);

// Product Schema and Model
const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
});
const Product = mongoose.model('Product', productSchema);

async function createData() {
  // User Service Database
  await mongoose.connect('mongodb://localhost:27017/user-service', { useNewUrlParser: true, useUnifiedTopology: true });
  await User.create({ name: 'John Doe', email: 'john@example.com', password: 'password123' });
  mongoose.connection.close();

  // Order Service Database
  await mongoose.connect('mongodb://localhost:27017/order-service', { useNewUrlParser: true, useUnifiedTopology: true });
  await Order.create({ userId: '1', productId: '1', quantity: 2, status: 'Pending' });
  mongoose.connection.close();

  // Notification Service Database
  await mongoose.connect('mongodb://localhost:27017/notification-service', { useNewUrlParser: true, useUnifiedTopology: true });
  await Notification.create({ userId: '1', message: 'Your order has been placed.' });
  mongoose.connection.close();

  // Product Service Database
  await mongoose.connect('mongodb://localhost:27017/product-service', { useNewUrlParser: true, useUnifiedTopology: true });
  await Product.create({ name: 'Product 1', description: 'Description of product 1', price: 100, stock: 50 });
  mongoose.connection.close();

  console.log('Data created successfully');
}

createData().catch(err => console.log(err));