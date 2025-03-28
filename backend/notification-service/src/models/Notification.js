const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  read: { type: Boolean, default: false },
});

module.exports = mongoose.model('Notification', NotificationSchema);