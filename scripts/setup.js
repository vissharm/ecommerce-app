const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Get command line arguments and set default value for isDevServer
const args = process.argv.slice(2);
const isDevServer = args.find(arg => arg.startsWith('--isDevServer='))?.split('=')[1] === 'true';

console.log('\nsetup.js received arguments:', args);
console.log('isDevServer value:', isDevServer);

// Function to get MongoDB URL based on environment
function getMongoDbUrl(serviceName) {
  const host = isDevServer ? '127.0.0.1' : 'mongodb';
  return `mongodb://${host}:27017/${serviceName}`;
}

// Define schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: Date },
  contact: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  orderDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  orderId: { type: String, required: true },
  type: { type: String, enum: ['ORDER', 'SYSTEM', 'USER'], default: 'ORDER' },
  status: { type: String, default: 'unread' }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Function to connect to database and create a new connection
async function connectToDb(url) {
  try {
    const connection = await mongoose.createConnection(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to database:', url);
    return connection;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}

// Function to safely drop collection if it exists
async function safeDropCollection(connection, collectionName) {
  try {
    // Check if the collection exists before attempting to drop it
    const collections = await connection.db.listCollections().toArray();
    const collectionExists = collections.some(col => col.name === collectionName);
    
    if (collectionExists) {
      await connection.db.collection(collectionName).drop();
      console.log(`Dropped collection: ${collectionName}`);
    }
  } catch (err) {
    console.log(`Collection ${collectionName} does not exist or could not be dropped`);
  }
}

// Function to close database connection
async function closeConnection(connection) {
  try {
    await connection.close();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error closing database connection:', err);
    throw err;
  }
}

async function createData() {
  const defaultPassword = await bcrypt.hash('password123', 10);

  const services = [
    {
      name: 'user-service',
      port: 3001,
      model: 'User',
      schema: userSchema,
      collection: 'users',
      data: [
        {
          name: 'John Doe',
          email: 'john@example.com',
          password: defaultPassword,
          dob: new Date('1990-01-01'),
          contact: '+1234567890'
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          password: defaultPassword,
          dob: new Date('1992-05-15'),
          contact: '+1987654321'
        }
      ]
    },
    {
      name: 'product-service',
      port: 3004,
      model: 'Product',
      schema: productSchema,
      collection: 'products',
      data: [
        {
          name: 'Laptop',
          description: 'High-performance laptop',
          price: 999.99,
          stock: 50
        },
        {
          name: 'Smartphone',
          description: 'Latest smartphone model',
          price: 699.99,
          stock: 100
        }
      ]
    },
    {
      name: 'order-service',
      port: 3002,
      model: 'Order',
      schema: orderSchema,
      collection: 'orders',
      data: [] // Will be populated after users and products are created
    },
    {
      name: 'notification-service',
      port: 3003,
      model: 'Notification',
      schema: notificationSchema,
      collection: 'notifications',
      data: [] // Will be populated after orders are created
    }
  ];

  let users, products, createdOrders;

  try {
    // First create users and products
    for (const service of services) {
      if (service.name === 'user-service' || service.name === 'product-service') {
        const dbUrl = getMongoDbUrl(service.name);
        console.log(`\n📦 Setting up ${service.name}...`);
        
        const connection = await connectToDb(dbUrl);
        
        // Safely drop collection if it exists
        await safeDropCollection(connection, service.collection);
        
        // Create model specific to this connection
        const Model = connection.model(service.model, service.schema);
        const created = await Model.create(service.data);
        console.log(`✅ Created ${created.length} ${service.model} records`);

        // Store created data for later use
        if (service.name === 'user-service') {
          users = created;
        } else if (service.name === 'product-service') {
          products = created;
        }
        
        await closeConnection(connection);
      }
    }

    // Now create orders
    const orderService = services.find(s => s.name === 'order-service');
    const dbUrl = getMongoDbUrl(orderService.name);
    console.log(`\n📦 Setting up ${orderService.name}...`);
    
    const orderConn = await connectToDb(dbUrl);
    await safeDropCollection(orderConn, 'orders');
    
    const OrderModel = orderConn.model('Order', orderSchema);
    
    const orderData = users.flatMap(user => 
      products.map(product => ({
        userId: user._id.toString(),
        userName: user.name,
        productId: product._id.toString(),
        productName: product.name,
        quantity: Math.floor(Math.random() * 3) + 1,
        status: 'Pending'
      }))
    );

    createdOrders = await OrderModel.create(orderData);
    console.log(`✅ Created ${createdOrders.length} Order records`);
    await closeConnection(orderConn);

    // Finally, create notifications
    const notificationService = services.find(s => s.name === 'notification-service');
    console.log(`\n📦 Setting up ${notificationService.name}...`);
    
    const notifConn = await connectToDb(getMongoDbUrl(notificationService.name));
    await safeDropCollection(notifConn, 'notifications');

    const NotificationModel = notifConn.model('Notification', notificationSchema);
    const notificationData = createdOrders.map(order => ({
      userId: order.userId,
      message: `New order created for ${order.productName}`,
      orderId: order._id.toString(),
      type: 'ORDER'
    }));

    const createdNotifications = await NotificationModel.create(notificationData);
    console.log(`✅ Created ${createdNotifications.length} Notification records`);
    await closeConnection(notifConn);

    console.log('\n🎉 All services setup completed successfully!');
  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    process.exit(1);
  }
}

// Run the setup
console.log('🚀 Starting services setup...');
createData();
