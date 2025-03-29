# Initialize and update submodules
Write-Host "Initializing submodules..." -ForegroundColor Green
git submodule init
git submodule update --recursive --remote

# Install root level dependencies
npm install

# Install dependencies for shared library
Write-Host "Setting up shared library..." -ForegroundColor Green
Push-Location backend/shared
npm install
Pop-Location

# Install dependencies for backend services
$backendServices = @(
    "user-service",
    "product-service",
    "order-service",
    "notification-service"
)

foreach ($service in $backendServices) {
    Write-Host "Installing dependencies for backend/$service..." -ForegroundColor Green
    Push-Location backend/$service
    npm install
    Pop-Location
}

# Install API Gateway dependencies
Write-Host "Installing API Gateway dependencies..." -ForegroundColor Green
Push-Location api-gateway
npm install
Pop-Location

# Install Frontend dependencies
Write-Host "Installing Frontend dependencies..." -ForegroundColor Green
Push-Location frontend
npm install
Pop-Location

# Setup MongoDB
Write-Host "Setting up MongoDB..." -ForegroundColor Green
node scripts/setup.js