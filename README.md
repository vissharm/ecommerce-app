# E-Commerce Microservices Application

## Project Structure
```
ecommerce-app/
├── backend/
│   ├── user-service/        # Git submodule
│   ├── product-service/     # Git submodule
│   ├── order-service/       # Git submodule
│   ├── notification-service/# Git submodule
│   └── shared/             # Git submodule
├── frontend/               # Git submodule
├── api-gateway/           # Git submodule
├── scripts/
│   ├── setup.ps1
│   ├── start-services.ps1
│   └── setup.js
├── docker-compose.yml
└── package.json
```

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Apache Kafka (v2.13-2.6.0 or higher)
- Apache ZooKeeper (v3.4.6 or higher)
- Windows Terminal (for running services)

## Initial Setup

1. Clone the repository with submodules:
```bash
git clone --recursive https://github.com/your-org/ecommerce-app.git
cd ecommerce-app
```

2. Run setup script:
```bash
npm run setup
```

## Development

### Working with Submodules

#### Clone with submodules:
```bash
# Initial clone
git clone --recursive https://github.com/your-org/ecommerce-app.git

# Or if already cloned without submodules
git submodule init
git submodule update
```

#### Update all submodules to latest:
```bash
npm run update-submodules
```

#### Work on a specific service:
```bash
# Example for user-service
cd backend/user-service
git checkout main
# Make changes
git commit -m "Your changes"
git push
```

#### Add new changes from submodules to main repo:
```bash
# After submodule changes are pushed
git add backend/user-service
git commit -m "Update user-service submodule"
git push
```

## Running the Application

### Local Development
```bash
npm start
```

### Using Docker
```bash
npm run start:docker
```

## Service URLs
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
