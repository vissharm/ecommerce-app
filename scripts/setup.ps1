# Create required directories if they don't exist
Write-Host "Creating directory structure..." -ForegroundColor Green
$directories = @(
    "backend",
    "backend/user-service",
    "backend/product-service",
    "backend/order-service",
    "backend/notification-service",
    "backend/shared",
    "frontend",
    "api-gateway"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        Write-Host "Creating directory: $dir" -ForegroundColor Yellow
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

# Initialize and update submodules
Write-Host "`nSetting up submodules..." -ForegroundColor Green

# Initialize git repository if not already initialized
if (!(Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to initialize git repository" -ForegroundColor Red
        exit 1
    }
}

# Function to get branch name from .gitmodules file
function Get-SubmoduleBranch {
    param (
        [string]$submodulePath
    )
    
    $branch = git config -f .gitmodules --get "submodule.$submodulePath.branch"
    if ([string]::IsNullOrEmpty($branch)) {
        return "main"  # default to main if branch is not specified
    }
    return $branch
}sta

# Define submodules with their repositories
$submodules = @{
    "backend/user-service" = "https://github.com/vissharm/ecommerce-app-user-service.git"
    "backend/product-service" = "https://github.com/vissharm/ecommerce-app-product-service.git"
    "backend/order-service" = "https://github.com/vissharm/ecommerce-app-order-service.git"
    "backend/notification-service" = "https://github.com/vissharm/ecommerce-app-notification-service.git"
    "backend/shared" = "https://github.com/vissharm/ecommerce-app-shared.git"
    "frontend" = "https://github.com/vissharm/ecommerce-app-frontend.git"
    "api-gateway" = "https://github.com/vissharm/ecommerce-app-api-gateway.git"
}

foreach ($submodule in $submodules.GetEnumerator()) {
    $path = $submodule.Key
    $url = $submodule.Value
    $branch = Get-SubmoduleBranch $path
    
    if (Test-Path "$path/.git") {
        # Directory exists and is a git repository - update it
        Write-Host "Updating existing repository at $path (branch: $branch)..." -ForegroundColor Yellow
        Push-Location $path
        git fetch origin
        git checkout $branch
        git reset --hard origin/$branch
        git clean -fd
        Pop-Location
    } else {
        # Directory doesn't exist or is not a git repository - clone it
        Write-Host "Adding submodule for $path (branch: $branch)..." -ForegroundColor Yellow
        if (Test-Path $path) {
            Remove-Item -Path $path -Recurse -Force
        }
        git submodule add -b $branch $url $path
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Failed to add submodule for $path" -ForegroundColor Red
            exit 1
        }
    }
}

# Initialize and update all submodules
Write-Host "Initializing and updating all submodules..." -ForegroundColor Yellow
git submodule init
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to initialize submodules" -ForegroundColor Red
    exit 1
}

git submodule update --recursive --remote --force
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to update submodules" -ForegroundColor Red
    exit 1
}

# Ensure all submodules are on their specified branches
foreach ($submodule in $submodules.GetEnumerator()) {
    $path = $submodule.Key
    $branch = Get-SubmoduleBranch $path
    Push-Location $path
    Write-Host "Checking out latest version for $path (branch: $branch)..." -ForegroundColor Yellow
    git checkout $branch
    git pull origin $branch
    Pop-Location
}

# Install root level dependencies
Write-Host "`nInstalling root level dependencies..." -ForegroundColor Green
npm install

# Install scripts dependencies
Write-Host "`nInstalling scripts dependencies..." -ForegroundColor Green
Push-Location scripts
npm install
Pop-Location

# Install dependencies for shared library
Write-Host "`nSetting up shared library..." -ForegroundColor Green
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
    Write-Host "`nInstalling dependencies for backend/$service..." -ForegroundColor Green
    Push-Location backend/$service
    npm install
    Pop-Location
}

# Install API Gateway dependencies
Write-Host "`nInstalling API Gateway dependencies..." -ForegroundColor Green
Push-Location api-gateway
npm install
Pop-Location

# Install Frontend dependencies
Write-Host "`nInstalling Frontend dependencies..." -ForegroundColor Green
Push-Location frontend
npm install
Pop-Location

# Setup MongoDB
Write-Host "`nSetting up MongoDB..." -ForegroundColor Green
node scripts/setup.js

Write-Host "`n✅ Setup completed successfully!" -ForegroundColor Green









