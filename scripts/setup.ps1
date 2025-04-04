param(
    [Parameter()]
    [System.Boolean]$isDevServer = $false
)

# Log the received parameter value
Write-Host "`nReceived isDevServer parameter value: $isDevServer" -ForegroundColor Cyan

# Function to get branch for a submodule
function Get-SubmoduleBranch {
    param (
        [string]$path
    )
    
    # Default branch is master
    $branch = "master"
    
    # Check if .gitmodules exists
    if (Test-Path ".gitmodules") {
        $gitModules = Get-Content ".gitmodules" -Raw
        if ($gitModules -match "\[submodule `"$($path.Replace('\','/'))`"\][\s\S]*?branch = (?<branch>[\w-]+)") {
            $branch = $matches['branch']
        }
    }
    
    return $branch
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
        Write-Host "Updating existing repository at $path (branch: $branch)..." -ForegroundColor Yellow
        Push-Location $path
        git fetch origin
        git checkout $branch
        git reset --hard origin/$branch
        git clean -fd
        Pop-Location
    } else {
        Write-Host "Adding submodule for $path (branch: $branch)..." -ForegroundColor Yellow
        if (Test-Path $path) {
            Remove-Item -Path $path -Recurse -Force
        }
        git submodule add -b $branch $url $path
    }
}

# Initialize and update all submodules
Write-Host "Initializing and updating all submodules..." -ForegroundColor Yellow
git submodule init
git submodule update --recursive --remote --force

# Install root level dependencies
Write-Host "`nInstalling root level dependencies..." -ForegroundColor Green
npm install

# Install shared library dependencies
Write-Host "`nSetting up shared library..." -ForegroundColor Green
Push-Location backend/shared
npm install
npm run build  # This will create the .tgz file
npm link
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
    npm link shared
    Pop-Location
}

# Handle API Gateway
Write-Host "`nInstalling API Gateway dependencies..." -ForegroundColor Green
Push-Location api-gateway
npm install
npm link shared
Pop-Location

# Install Frontend dependencies
Write-Host "`nInstalling Frontend dependencies..." -ForegroundColor Green
Push-Location frontend
npm install
Pop-Location

# Setup MongoDB with the isDevServer flag
Write-Host "`nSetting up MongoDB..." -ForegroundColor Green
$devServerValue = if ([bool]$isDevServer) { "true" } else { "false" }
$devServerFlag = "--isDevServer=$devServerValue"
Write-Host "Passing flag to setup.js: $devServerFlag" -ForegroundColor Cyan
node scripts/setup.js $devServerFlag

Write-Host "`n✅ Setup completed successfully!" -ForegroundColor Green




