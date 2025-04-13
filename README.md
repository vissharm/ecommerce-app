# E-Commerce Microservices Application
### This is created for assignment and learning purpose [Scalable services - WILP , BITS PILANI]

**FEATURE/SUBMODULES** - This branch should be referred for evaluation. master is initial started approach with monolyth and then broken into microservices and containerization code under feature branch. Feature branch is final work achieving all objectives of assignment.

# FOR COURSE STUDENTS: CAUTION: REPO IS MADE PUBLIC FOR EVALUATION, SO DO NOT COPY, ALREADY SUBMITTED AND SENT TO PROFESSOR. FEEL FREE TO LEARN FROM IT AND APPLY CONCEPTS. ALWAYS APPRECIATE KNOWLEDGE SHARING.

# Github URL: https://github.com/vissharm/ecommerce-app/tree/feature/submodules
# Demo video: https://drive.google.com/file/d/1nrV_Jwk2QDcnzVpjbdjJCRxSF97TYh4R/view?usp=drive_link

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

# Application screenshots
![image](https://github.com/user-attachments/assets/d41745c1-54ac-4106-a56f-a8969df414f5) 
![image](https://github.com/user-attachments/assets/26158665-bd1c-47ba-9794-107853ba3f6a)    ![image](https://github.com/user-attachments/assets/d23ddff2-2d96-43f4-a75a-24eef81b859f)
![image](https://github.com/user-attachments/assets/5841db62-f7a7-4fdb-ba0a-6cfa6784be44)
![image](https://github.com/user-attachments/assets/fecffb82-02e7-470c-9eaa-0ad77b09322a)    ![image](https://github.com/user-attachments/assets/f7cae3ce-386e-445e-b4a6-393a42e567f0)
![image](https://github.com/user-attachments/assets/9c0b4b31-cad7-4684-a5fd-0df7515d254e)
![image](https://github.com/user-attachments/assets/91852003-2c74-43cb-8540-5c15edccee98)
![image](https://github.com/user-attachments/assets/34debbb3-7bee-4f23-838f-ecc3395d201e)
![image](https://github.com/user-attachments/assets/61588bd5-4fd6-4993-b570-eb75b39c3b98)
![image](https://github.com/user-attachments/assets/1d2bff1b-8cac-40c4-a427-c08f7ecefbf3)
![image](https://github.com/user-attachments/assets/6bf8ab52-12d6-435d-9a97-700bcda67d00)
![image](https://github.com/user-attachments/assets/11522d7f-8b5f-4b69-9740-84a4412c5b04)
![image](https://github.com/user-attachments/assets/422b3e8b-d5bf-4716-a289-8c2865205c4a)
![image](https://github.com/user-attachments/assets/853d3c8c-55c7-4a6a-b4a3-2edc06f0adbf)
![image](https://github.com/user-attachments/assets/99be9e89-7698-402c-af48-c94bc4aabd6d)
![image](https://github.com/user-attachments/assets/0823d89c-298f-4d27-9baa-a39dbc9448e2)
![image](https://github.com/user-attachments/assets/91237d1b-6d4c-4369-8c67-4af1b57f6fff)
![image](https://github.com/user-attachments/assets/bea98586-d69d-4b34-b07a-f856fd5e7e8a)


















