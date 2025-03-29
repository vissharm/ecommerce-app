# E-Commerce Microservices Application

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Apache Kafka (v2.13-2.6.0 or higher)
- Apache ZooKeeper (v3.4.6 or higher)
- Windows Terminal (for running services)

## Initial Setup

1. **Install Dependencies and Setup Database**
   ```bash
   # Install dependencies and run database setup
   npm install
   npm run setup
   ```
   This will:
   - Install all required dependencies
   - Create necessary database schemas
   - Initialize default data including:
     - Users (john@example.com, jane@example.com with password: password123)
     - Products (Laptop, Smartphone)
     - Sample orders and notifications

2. **Setup Kafka and ZooKeeper**

   Option 1 - Using Docker:
   ```bash
   # Start Kafka and ZooKeeper using Docker Compose
   docker-compose up -d
   ```

   Option 2 - Manual Setup:
   - Download and extract Apache ZooKeeper:
     - Place in `C:\apache-zookeeper-3.7.2-bin`
     - Configure `zoo.cfg` in the `conf` directory
   
   - Download and extract Apache Kafka:
     - Place in `C:\kafka_2.13-3.6.1`
     - Configure `server.properties` in the `config` directory

## Running the Application

### Start All Services
Run the provided batch script to start all services in separate terminal windows:
```bash
start-services.bat
```

This script will start the following services in order:
1. ZooKeeper (Port: 2181)
2. Kafka (Port: 9092)
3. Order Service (Port: 3002)
4. Product Service (Port: 3004)
5. User Service (Port: 3001)
6. Notification Service (Port: 3003)
7. Frontend Application
8. API Gateway

### Service URLs
- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080
- User Service: http://localhost:3001
- Order Service: http://localhost:3002
- Notification Service: http://localhost:3003
- Product Service: http://localhost:3004

### Microservices Architecture
```
┌─────────────┐     ┌─────────────┐
│   Frontend  │ ←── │ API Gateway │
└─────────────┘     └─────────────┘
                          ↓
┌────────────────────────────────────────┐
│              Kafka Bus                 │
└────────────────────────────────────────┘
     ↓            ↓           ↓          ↓
┌─────────┐  ┌─────────┐ ┌─────────┐ ┌─────────┐
│  User   │  │  Order  │ │ Product │ │ Notif.  │
│ Service │  │ Service │ │ Service │ │ Service │
└─────────┘  └─────────┘ └─────────┘ └─────────┘
     ↓            ↓           ↓          ↓
┌────────────────────────────────────────┐
│              MongoDB                   │
└────────────────────────────────────────┘
```

### Default Data
- **Users**:
  - Email: john@example.com, Password: password123
  - Email: jane@example.com, Password: password123

- **Products**:
  - Laptop ($999.99)
  - Smartphone ($699.99)

## Troubleshooting

1. **Kafka Connection Issues**
   - Ensure ZooKeeper is running before starting Kafka
   - Verify Kafka broker is running on localhost:9092
   - Check Kafka logs for connection errors

2. **MongoDB Connection Issues**
   - Verify MongoDB is running on localhost:27017
   - Check if the service can connect to its respective database

3. **Service Start-up Issues**
   - Ensure all required ports are available
   - Check if all dependencies are installed correctly
   - Verify environment variables in .env files

## Additional Commands

```bash
# Stop Docker containers (if using Docker)
docker-compose down

# View Docker container logs
docker-compose logs -f

# Restart individual services
cd backend/<service-name>
npm run start

# Clean installation
npm run clean  # Removes node_modules and package-lock.json
npm install    # Fresh installation
```