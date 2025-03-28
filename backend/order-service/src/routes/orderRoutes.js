const express = require('express');
const Order = require('../models/Order');
const router = express.Router();
const kafka = require('kafka-node');
// const mongoose = require('mongoose');

// Kafka configuration
const client = new kafka.KafkaClient({kafkaHost: process.env.KAFKA_BROKER});
const producer = new kafka.Producer(client);

producer.on('ready', () => {
  console.log('Kafka Producer is connected and ready.');
});

producer.on('error', (err) => {
  console.error('Kafka Producer error:', err);
});

router.post('/create', async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;
    const order = new Order({ 
      userId, 
      productId, 
      quantity, 
      status: 'Pending' 
    });
    await order.save();

    // Send to Kafka
    const payloads = [{
      topic: 'order-created',
      messages: JSON.stringify({
        userId: order.userId,
        productId: order.productId,
        quantity: order.quantity,
        status: order.status,
        _id: order._id
      })
    }];

    producer.send(payloads, (err, data) => {
      if (err) {
        console.error('Failed to produce Kafka message:', err);
      } else {
        console.log('Order sent to Kafka:', data, JSON.stringify(payloads));
      }
    });

    res.status(201).send(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).send({ error: 'Failed to create order' });
  }
});

router.get('/orders', async (req, res) => {
  const orders = await Order.find();
  res.status(200).send(orders);
});

module.exports = router;