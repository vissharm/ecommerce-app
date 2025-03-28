const mongoose = require('mongoose');
require('dotenv').config();

// Define schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId: String,
  productId: String,
  quantity: Number,
  status: String,
  orderDate: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
});

const notificationSchema = new mongoose.Schema({
  userId: String,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  orderId: String,
  orderDate: Date
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
  createdAt: { type: Date, default: Date.now }
});

// Function to connect and create database if not exists
async function connectToDb(dbUrl) {
  try {
    // Extract database name from URL
    const dbName = dbUrl.split('/').pop();
    
    // First connect to admin database
    await mongoose.connect('mongodb://127.0.0.1:27017/admin', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    // Create database if it doesn't exist
    await mongoose.connection.db.admin().listDatabases();
    await mongoose.connection.close();

    // Connect to the specific database
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log(`✅ Connected to database: ${dbName}`);
  } catch (err) {
    console.error(`❌ Failed to connect to database: ${dbUrl}`, err);
    throw err;
  }
}

// Function to close database connection
async function closeConnection() {
  try {
    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error closing database connection:', err);
    throw err;
  }
}

// Function to create collections if they don't exist
async function ensureCollections(db, collections) {
  const existingCollections = await db.listCollections().toArray();
  const existingCollectionNames = existingCollections.map(col => col.name);

  for (const collection of collections) {
    if (!existingCollectionNames.includes(collection)) {
      await db.createCollection(collection);
      console.log(`Created collection: ${collection}`);
    }
  }
}

async function createData() {
  const services = [
    {
      name: 'user-service',
      model: 'User',
      schema: userSchema,
      data: [
        { 
          name: 'John Doe', 
          email: 'john@example.com', 
          password: 'password123',
          createdAt: new Date()
        },
        { 
          name: 'Jane Smith', 
          email: 'jane@example.com', 
          password: 'password456',
          createdAt: new Date()
        }
      ]
    },
    {
      name: 'product-service',
      model: 'Product',
      schema: productSchema,
      data: [
        {
          name: 'Laptop',
          description: 'High-performance laptop',
          price: 999.99,
          stock: 50,
          createdAt: new Date()
        },
        {
          name: 'Smartphone',
          description: 'Latest smartphone model',
          price: 699.99,
          stock: 100,
          createdAt: new Date()
        }
      ]
    },
    {
      name: 'order-service',
      model: 'Order',
      schema: orderSchema,
      data: [
        {
          userId: '1',
          productId: '1',
          quantity: 2,
          status: 'Pending',
          orderDate: new Date(),
          lastUpdated: new Date()
        }
      ]
    },
    {
      name: 'notification-service',
      model: 'Notification',
      schema: notificationSchema,
      data: [
        {
          userId: '1',
          message: 'Your order has been placed.',
          read: false,
          createdAt: new Date(),
          orderId: '1',
          orderDate: new Date()
        }
      ]
    }
  ];

  try {
    for (const service of services) {
      const dbUrl = `mongodb://127.0.0.1:27017/${service.name}`;
      
      console.log(`\n📦 Setting up ${service.name}...`);
      
      // Connect to database (creates if not exists)
      await connectToDb(dbUrl);

      // Ensure collections exist
      await ensureCollections(mongoose.connection.db, [service.model.toLowerCase() + 's']);

      // Create model and insert data
      const Model = mongoose.model(service.model, service.schema);
      await Model.deleteMany({}); // Clear existing data
      await Model.create(service.data);
      
      console.log(`✅ Sample data created for ${service.name}`);
      
      await closeConnection();
    }

    console.log('\n🎉 All databases and collections created successfully with sample data!');
  } catch (error) {
    console.error('\n❌ Error during setup:', error);
    process.exit(1);
  }
}

// Run the setup
console.log('🚀 Starting database setup...');
createData();
