const express = require('express');
const Notification = require('../models/Notification');
const router = express.Router();
const kafka = require('kafka-node');
const mongoose = require('mongoose');
const { getIo } = require('../socket');

// Create a separate connection to the order-service database
const orderServiceConnection = mongoose.createConnection(process.env.ORDER_SERVICE_MONGO_URI || 'mongodb://127.0.0.1:27017/order-service', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Define Order Schema on the order-service connection
const Order = orderServiceConnection.model('Order', new mongoose.Schema({
  userId: String,
  productId: String,
  quantity: Number,
  status: String,
  orderDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}));

// Kafka configuration
// Kafka configuration
const client = new kafka.KafkaClient({ 
  kafkaHost: 'localhost:9092',
  connectTimeout: 3000,
  requestTimeout: 30000
});
// const consumer = new kafka.Consumer(
//   client,
//   [{ topic: 'order-created', partition: 0 }],
//   { autoCommit: true }
// );

// Create consumer group instead of simple consumer
const consumerGroup = new kafka.ConsumerGroup(
  {
      kafkaHost: 'localhost:9092',
      groupId: 'notification-service-group',
      autoCommit: true,
      autoCommitIntervalMs: 5000,
      // Start reading from the beginning if no offset is found
      fromOffset: 'earliest',
      // Handle offset out of range by reading from earliest
      outOfRangeOffset: 'earliest'
  },
  ['order-created']
);

// // Add more consumer event listeners
// consumer.on('ready', () => {
//   console.log('Kafka consumer is ready');
// });

// Add consumer group event listeners
consumerGroup.on('ready', () => {
  console.log('Consumer group is ready');
});

consumerGroup.on('message', async (message) => {
  try {
    console.log('Raw Kafka message received:', message);
    const orderData = JSON.parse(message.value);
    const currentDate = new Date();
    
    // Create and save notification
    const notification = new Notification({
      userId: orderData.userId,
      message: `New order created for product: ${orderData.productId}`,
      read: false,
      createdAt: currentDate,
      orderId: orderData._id,
      orderDate: new Date(orderData.orderDate)
    });
    
    const savedNotification = await notification.save();

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderData._id,
      {
        status: 'Completed',
        lastUpdated: currentDate
      },
      { new: true }
    );

    if (!updatedOrder) {
      throw new Error('Order not found');
    }

    const notificationMessage = {
      orderId: orderData._id,
      notificationId: savedNotification._id,
      status: 'Completed',
      lastUpdated: currentDate.toISOString(),
      productId: orderData.productId
    };

    // Get the Socket.IO instance
    const io = getIo();
    
    // Emit notification event
    io.emit('notification', {
      message: JSON.stringify(notificationMessage)
    });

    // Emit order status update event
    io.emit('orderStatusUpdate', {
      orderId: orderData._id,
      status: 'Completed',
      lastUpdated: currentDate.toISOString()
    });

  } catch (err) {
    console.error('Error processing Kafka message:', err);
  }
});

consumerGroup.on('error', (err) => {
  console.error('Consumer Group error:', err);
});

consumerGroup.on('offsetOutOfRange', (err) => {
  console.error('Offset out of range, resetting to earliest:', err);
  // The consumer group will automatically handle offset reset based on configuration
});

// consumer.on('message', async (message) => {
//   try {
//     console.log("Message received from Kafka:", message.value);
//     const orderData = JSON.parse(message.value);
    
//     // Create and save notification
//     const notification = new Notification({
//       userId: orderData.userId,
//       message: `New order created for product: ${orderData.productId}`,
//       read: false
//     });
//     await notification.save();
//     console.log('Notification saved:', notification);

//     // Create order object for socket emission
//     const order = new Order(orderData);
//     console.log('Order creation notification received', order);
  
//     // Emit socket event
//     const io = getIo();
//     io.emit('notification', { 
//       type: 'order_created',
//       message: JSON.stringify({
//         orderId: order._id,
//         userId: order.userId,
//         productId: order.productId,
//         quantity: order.quantity,
//         status: order.status
//       })
//     });
//     console.log('Socket notification emitted');

//   } catch(err) {
//     console.error('Error processing Kafka message:', err);
//   }
// });

// consumer.on('error', (err) => {
//   console.error('Kafka Consumer error:', err);
// });

// MongoDB configuration
// mongoose.connect('mongodb://localhost:27017/order-service', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// TODO - process and save messages from order service only
// push order status completed post consuming from order service and read that and send message from here.
// const Order = mongoose.model('Order', new mongoose.Schema({
//   userId: String,
//   productId: String,
//   quantity: Number,
//   status: String,
// }));

router.post('/notify', async (req, res) => {
  const { userId, message } = req.body;
  const notification = new Notification({ userId, message });
  await notification.save();
  res.status(201).send(notification);
});

router.get('/notifications', async (req, res) => {
  const notifications = await Notification.find();
  res.status(200).send(notifications);
});

router.put('/markAsRead/:notificationId', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.status(200).json(notification);
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Handle socket connections
// io.on('connection', (socket) => {
//   console.log('A client connected');
//   socket.on('disconnect', () => {
//     console.log('A client disconnected');
//   });
// });


module.exports = router;
