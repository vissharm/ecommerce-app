# Function to wait for pod readiness
function Wait-ForPod {
    param(
        [string]$label,
        [string]$namespace,
        [int]$timeout = 90
    )
    Write-Host "Waiting for pod with label $label to be ready (timeout: ${timeout}s)..." -ForegroundColor Cyan
    
    $retries = 3
    $attempt = 1
    
    while ($attempt -le $retries) {
        Write-Host "`nAttempt $attempt of $retries" -ForegroundColor Yellow
        
        # Get pod name
        $podName = kubectl get pods -n $namespace -l app=$label -o jsonpath='{.items[0].metadata.name}'
        
        # Show pod status
        Write-Host "`nPod Status:" -ForegroundColor Cyan
        kubectl get pods -n $namespace -l app=$label -o wide
        
        # Check both readiness and liveness probe status
        Write-Host "`nProbe Status:" -ForegroundColor Cyan
        $probeStatus = kubectl describe pod $podName -n $namespace
        
        # Check Readiness Probe
        $readinessFailures = $probeStatus | Select-String -Pattern "Readiness probe failed:" -Context 2,2
        if ($readinessFailures) {
            Write-Host "`nReadiness Probe Failures:" -ForegroundColor Red
            $readinessFailures
        }
        
        # Check Liveness Probe
        $livenessFailures = $probeStatus | Select-String -Pattern "Liveness probe failed:" -Context 2,2
        if ($livenessFailures) {
            Write-Host "`nLiveness Probe Failures:" -ForegroundColor Red
            $livenessFailures
        }
        
        # Show last 10 lines of logs before each retry
        Write-Host "`nLast 10 lines of container logs for ${podName}:" -ForegroundColor Yellow
        kubectl logs $podName -n $namespace --tail=10
        
        try {
            kubectl wait --for=condition=ready pod -l app=$label -n $namespace --timeout=30s
            Write-Host "✅ Pod $label is ready" -ForegroundColor Green
            
            # Add detailed pod information after ready
            Write-Host "`nDetailed Pod Information:" -ForegroundColor Cyan
            Write-Host "------------------------" -ForegroundColor Cyan
            kubectl get pods -n $namespace -l app=$label -o wide
            
            Write-Host "`nPod Details:" -ForegroundColor Cyan
            Write-Host "------------------------" -ForegroundColor Cyan
            kubectl describe pod $podName -n $namespace | Select-String -Pattern "Name:|Status:|IP:|Node:|Start Time:|Ready:|Container ID:"
            
            Write-Host "`nContainer Logs:" -ForegroundColor Cyan
            Write-Host "------------------------" -ForegroundColor Cyan
            kubectl logs $podName -n $namespace --tail=20
            
            return
        } catch {
            Write-Host "`nProbe failures in recent events:" -ForegroundColor Red
            kubectl get events --field-selector involvedObject.name=$podName,reason=Unhealthy -n $namespace --sort-by='.lastTimestamp' | Select-Object -Last 5
            
            # Show probe configuration
            Write-Host "`nProbe Configuration:" -ForegroundColor Cyan
            kubectl describe pod $podName -n $namespace | Select-String -Pattern "Liveness:|Readiness:" -Context 0,4
            
            Write-Host "`nWaiting 30 seconds before next attempt..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
        }
        
        $attempt++
    }
    
    Write-Host "`n❌ Pod $label failed to become ready after $retries status checks" -ForegroundColor Red
    throw "Failed to start pod $label after $retries status check attempts"
}

# Function to check pod status and logs
function Get-PodStatus {
    param(
        [string]$label,
        [string]$namespace
    )
    Write-Host "`nDiagnosing pod status for $label..." -ForegroundColor Cyan
    
    # Get pod details
    $pods = kubectl get pods -l app=$label -n $namespace -o json | ConvertFrom-Json
    
    foreach ($pod in $pods.items) {
        $podName = $pod.metadata.name
        Write-Host "`nPod: $podName" -ForegroundColor Yellow
        Write-Host "Phase: $($pod.status.phase)"
        Write-Host "Conditions:" -ForegroundColor Cyan
        
        # Show all conditions
        foreach ($condition in $pod.status.conditions) {
            Write-Host "- $($condition.type): $($condition.status) (Reason: $($condition.reason))"
        }

        # Show container statuses
        Write-Host "`nContainer Statuses:" -ForegroundColor Cyan
        foreach ($containerStatus in $pod.status.containerStatuses) {
            Write-Host "Container: $($containerStatus.name)"
            Write-Host "- Ready: $($containerStatus.ready)"
            Write-Host "- Started: $($containerStatus.started)"
            Write-Host "- RestartCount: $($containerStatus.restartCount)"
            
            if ($containerStatus.state.waiting) {
                Write-Host "- Waiting: $($containerStatus.state.waiting.reason)" -ForegroundColor Red
                Write-Host "  Message: $($containerStatus.state.waiting.message)"
            }
            if ($containerStatus.state.running) {
                Write-Host "- Running since: $($containerStatus.state.running.startedAt)" -ForegroundColor Green
            }
            if ($containerStatus.lastState) {
                Write-Host "- Last State: $($containerStatus.lastState.terminated.reason)"
                Write-Host "  Exit Code: $($containerStatus.lastState.terminated.exitCode)"
            }
        }

        # Show recent events
        Write-Host "`nRecent Events:" -ForegroundColor Cyan
        kubectl get events --field-selector involvedObject.name=$podName -n $namespace

        # Show logs
        Write-Host "`nContainer Logs:" -ForegroundColor Cyan
        kubectl logs $podName -n $namespace --all-containers=true --tail=50

        # Show readiness probe details
        Write-Host "`nReadiness Probe Details:" -ForegroundColor Cyan
        kubectl describe pod $podName -n $namespace | Select-String -Pattern "Readiness|Liveness|Startup" -Context 2
    }
}

# Function to safely delete and recreate a StatefulSet
function Reset-StatefulSet {
    param(
        [string]$name,
        [string]$namespace,
        [string]$yamlPath
    )
    Write-Host "Resetting StatefulSet $name..."
    
    # Delete the StatefulSet if it exists
    kubectl delete statefulset $name -n $namespace --ignore-not-found
    # Wait for deletion to complete
    Start-Sleep -Seconds 10
    # Apply the new configuration
    kubectl apply -f $yamlPath
}

# Function to check if Docker image exists
function Test-DockerImage {
    param(
        [string]$tag
    )
    $image = docker images -q $tag
    return [bool]$image
}

# Function to build Docker image with error handling
function Build-DockerImage {
    param(
        [string]$tag,
        [string]$dockerfile,
        [string]$context,
        [switch]$skipCleanup
    )
    
    if ($skipCleanup -and (Test-DockerImage -tag $tag)) {
        Write-Host "Using existing Docker image: $tag" -ForegroundColor Cyan
        return
    }

    Write-Host "Building Docker image: $tag" -ForegroundColor Yellow
    docker build -t $tag -f $dockerfile $context
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error building Docker image $tag" -ForegroundColor Red
        Write-Host "Retrying with --no-cache option..." -ForegroundColor Yellow
        docker build --no-cache -t $tag -f $dockerfile $context
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to build Docker image $tag"
        }
    }
}

# Function to check and install Minikube
function Install-Minikube {
    if (-not (Get-Command "minikube" -ErrorAction SilentlyContinue)) {
        Write-Host "Minikube not found. Installing via Chocolatey..." -ForegroundColor Yellow
        if (-not (Get-Command "choco" -ErrorAction SilentlyContinue)) {
            Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
            Set-ExecutionPolicy Bypass -Scope Process -Force
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
            Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
        }
        choco install minikube -y
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install Minikube"
        }
        Write-Host "Minikube installed successfully" -ForegroundColor Green
    }
}

# Function to clean Minikube environment
function Reset-MinikubeEnvironment {
    Write-Host "Cleaning up Minikube environment..." -ForegroundColor Yellow
    
    # Force stop any running Minikube processes
    Write-Host "Stopping any running Minikube processes..." -ForegroundColor Yellow
    taskkill /F /IM "minikube.exe" /T 2>$null
    
    # Delete the Minikube cluster with force
    Write-Host "Deleting existing Minikube cluster..." -ForegroundColor Yellow
    minikube delete --all --purge
    
    # Clean Docker resources
    Write-Host "Cleaning Docker resources..." -ForegroundColor Yellow
    
    # Stop all running containers
    Write-Host "Stopping all Docker containers..." -ForegroundColor Yellow
    docker stop $(docker ps -aq) 2>$null
    
    # Remove all containers
    Write-Host "Removing all Docker containers..." -ForegroundColor Yellow
    docker rm $(docker ps -aq) -f 2>$null
    
    # Remove all images related to the project
    Write-Host "Removing project Docker images..." -ForegroundColor Yellow
    docker rmi $(docker images "shared-lib" -q) -f 2>$null
    docker rmi $(docker images "user-service" -q) -f 2>$null
    docker rmi $(docker images "product-service" -q) -f 2>$null
    docker rmi $(docker images "order-service" -q) -f 2>$null
    docker rmi $(docker images "notification-service" -q) -f 2>$null
    docker rmi $(docker images "api-gateway" -q) -f 2>$null
    
    # Clean all unused images, networks, and volumes
    Write-Host "Deep cleaning Docker system..." -ForegroundColor Yellow
    docker system prune -af --volumes
    
    # Start fresh Minikube instance
    Write-Host "Starting fresh Minikube instance..." -ForegroundColor Yellow
    minikube start --driver=docker
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to start Minikube cluster"
    }
    
    Write-Host "Minikube environment reset completed" -ForegroundColor Green
}

# Function to deploy a service
function Deploy-Service {
    param(
        [string]$name,
        [string]$yamlPath
    )
    Write-Host "Deploying $name..." -ForegroundColor Yellow
    
    # Delete existing deployment
    kubectl delete deployment $name -n ecommerce --ignore-not-found
    Start-Sleep -Seconds 5
    
    # Apply new deployment
    kubectl apply -f $yamlPath
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to deploy $name"
    }
    
    # Wait for pod readiness with increased timeout
    Wait-ForPod -label $name -namespace "ecommerce" -timeout 120
}

function Test-ServiceConnectivity {
    param(
        [string]$namespace
    )
    Write-Host "Testing service connectivity..." -ForegroundColor Yellow
    
    # Test Kafka connectivity
    Write-Host "`nTesting Kafka connectivity..." -ForegroundColor Cyan
    kubectl run kafka-test --rm -i --tty --image=edenhill/kafkacat:1.6.0 -n $namespace -- kafkacat -b kafka:9092 -L
    
    # Test MongoDB connectivity
    Write-Host "`nTesting MongoDB connectivity..." -ForegroundColor Cyan
    kubectl run mongodb-test --rm -i --tty --image=mongo:4.4.6 -n $namespace -- mongosh --host mongodb --eval "db.serverStatus()"
}

function Get-ServiceLogs {
    param(
        [string]$serviceName,
        [string]$namespace
    )
    Write-Host "`nGetting logs for $serviceName..." -ForegroundColor Yellow
    $pod = kubectl get pods -l app=$serviceName -n $namespace -o name | Select-Object -First 1
    if ($pod) {
        kubectl logs $pod -n $namespace --all-containers=true
        kubectl describe $pod -n $namespace
    }
}

function Debug-PodIssues {
    param(
        [string]$podName,
        [string]$namespace
    )
    Write-Host "`nDebugging pod $podName..." -ForegroundColor Cyan

    # Check if MongoDB is accessible
    Write-Host "Testing MongoDB connection..." -ForegroundColor Yellow
    kubectl exec $podName -n $namespace -- mongosh --eval "db.serverStatus()"

    # Check if Kafka is accessible
    Write-Host "`nTesting Kafka connection..." -ForegroundColor Yellow
    kubectl exec $podName -n $namespace -- nc -zv kafka-service 9092

    # Check Node.js process
    Write-Host "`nChecking Node.js process..." -ForegroundColor Yellow
    kubectl exec $podName -n $namespace -- ps aux | grep node

    # Check available memory
    Write-Host "`nChecking available memory..." -ForegroundColor Yellow
    kubectl exec $podName -n $namespace -- free -m

    # Check disk space
    Write-Host "`nChecking disk space..." -ForegroundColor Yellow
    kubectl exec $podName -n $namespace -- df -h
}

function Reset-ServiceDeployment {
    param(
        [string]$serviceName,
        [string]$namespace = "ecommerce"
    )
    
    Write-Host "Resetting deployment for $serviceName..." -ForegroundColor Yellow
    
    # Delete existing deployment
    kubectl delete deployment $serviceName -n $namespace --force --grace-period=0
    Start-Sleep -Seconds 5
    
    # Clean up any stuck pods
    $stuckPods = kubectl get pods -n $namespace -l app=$serviceName -o name
    foreach ($pod in $stuckPods) {
        kubectl delete $pod -n $namespace --force --grace-period=0
    }
    Start-Sleep -Seconds 5
    
    # Reapply deployment
    kubectl apply -f "k8s/$serviceName.yaml"
    Start-Sleep -Seconds 10
    
    # Get new pod name
    $podName = kubectl get pods -n $namespace -l app=$serviceName -o name | Select-Object -First 1
    if ($podName) {
        Debug-PodIssues -podName $podName.Replace("pod/","") -namespace $namespace
    }
}

function Test-KubernetesConnection {
    Write-Host "Testing Kubernetes connection..." -ForegroundColor Yellow
    
    # Check if minikube is running
    $minikubeStatus = minikube status
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Minikube is not running. Starting Minikube..." -ForegroundColor Red
        minikube start --driver=docker
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to start Minikube cluster"
        }
        # Wait for cluster to be ready
        Start-Sleep -Seconds 10
    }

    # Verify kubectl can connect
    $attempt = 1
    $maxAttempts = 3
    $connected = $false

    while ($attempt -le $maxAttempts -and -not $connected) {
        try {
            kubectl cluster-info
            if ($LASTEXITCODE -eq 0) {
                $connected = $true
                Write-Host "✅ Successfully connected to Kubernetes cluster" -ForegroundColor Green
            }
        } catch {
            Write-Host "Attempt $attempt of $maxAttempts Failed to connect to cluster" -ForegroundColor Yellow
            if ($attempt -lt $maxAttempts) {
                Write-Host "Waiting 10 seconds before retry..." -ForegroundColor Yellow
                Start-Sleep -Seconds 10
            }
        }
        $attempt++
    }

    if (-not $connected) {
        throw "Failed to connect to Kubernetes cluster after $maxAttempts attempts"
    }

    # Verify correct context
    $context = kubectl config current-context
    if ($context -ne "minikube") {
        Write-Host "Switching to minikube context..." -ForegroundColor Yellow
        kubectl config use-context minikube
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to switch to minikube context"
        }
    }
}

# Function to initialize MongoDB
function Initialize-MongoDB {
    Write-Host "Initializing MongoDB with sample data..." -ForegroundColor Yellow
    
    # Apply the MongoDB init ConfigMap
    kubectl apply -f k8s/mongo-init-configmap.yaml
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to apply MongoDB init ConfigMap"
    }
    
    # Create and run the initialization job
    $initJobYaml = @"
apiVersion: batch/v1
kind: Job
metadata:
  name: mongo-init-job
  namespace: ecommerce
spec:
  template:
    spec:
      containers:
      - name: mongo-init
        image: node:16
        command: ["/bin/sh", "-c"]
        args: 
        - |
          # Wait longer for MongoDB to be ready
          echo "Waiting for MongoDB to be ready..."
          sleep 30
          mkdir -p /tmp/init && cd /tmp/init &&
          cp /scripts/initialized_database.js . &&
          npm init -y &&
          npm install mongoose bcryptjs &&
          node initialized_database.js
        volumeMounts:
        - name: init-script
          mountPath: /scripts
          readOnly: true
      volumes:
      - name: init-script
        configMap:
          name: mongo-init-script
      restartPolicy: Never
  backoffLimit: 4
"@

    $initJobYaml | kubectl apply -f -
    
    # Wait for the job to complete
    Write-Host "Waiting for MongoDB initialization job to complete..." -ForegroundColor Cyan
    kubectl wait --for=condition=complete job/mongo-init-job -n ecommerce --timeout=120s
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "MongoDB initialization job logs:" -ForegroundColor Red
        kubectl logs job/mongo-init-job -n ecommerce
        throw "MongoDB initialization failed"
    }
    
    Write-Host "MongoDB initialization completed successfully" -ForegroundColor Green
    
    # Clean up the job
    kubectl delete job mongo-init-job -n ecommerce --ignore-not-found
}

# Get arguments
$SkipCleanup = $args[0] -eq "-SkipCleanup"

# Main deployment script
try {
    if (-not $SkipCleanup) {
        # Initial cleanup
        Write-Host "Starting fresh deployment with cleanup..." -ForegroundColor Yellow
        
        # Stop any running Minikube instance and clean up
        Reset-MinikubeEnvironment
    } else {
        Write-Host "Using existing Minikube instance and Docker images where possible..." -ForegroundColor Yellow
    }

    Install-Minikube
    
    # Check cluster connection
    Test-KubernetesConnection
    
    # Configure Docker to use Minikube's daemon
    Write-Host "Configuring Docker to use Minikube's daemon..." -ForegroundColor Yellow
    & minikube -p minikube docker-env | Invoke-Expression
    
    # Clean up namespace resources but keep the namespace
    Write-Host "Cleaning up existing deployments..." -ForegroundColor Yellow
    kubectl delete deployments,services,statefulsets,jobs --all -n ecommerce --ignore-not-found
    Start-Sleep -Seconds 5
    
    # Create namespace if it doesn't exist
    Write-Host "Ensuring namespace exists..." -ForegroundColor Yellow
    kubectl apply -f k8s/namespace.yaml
    
    # Apply ConfigMaps first
    Write-Host "Applying ConfigMaps..." -ForegroundColor Yellow
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/shared-config.yaml
    
    # Build and deploy services
    try {
        # Build shared library first
        Write-Host "Building shared library image..." -ForegroundColor Yellow
        Build-DockerImage -tag "shared-lib:latest" -dockerfile "backend/shared/Dockerfile" -context "./backend/shared" -skipCleanup $SkipCleanup
        
        # Build service images
        Write-Host "Building service images..." -ForegroundColor Yellow
        Build-DockerImage -tag "user-service:latest" -dockerfile "backend/user-service/Dockerfile" -context "./backend/user-service" -skipCleanup $SkipCleanup
        Build-DockerImage -tag "product-service:latest" -dockerfile "backend/product-service/Dockerfile" -context "./backend/product-service" -skipCleanup $SkipCleanup
        Build-DockerImage -tag "order-service:latest" -dockerfile "backend/order-service/Dockerfile" -context "./backend/order-service" -skipCleanup $SkipCleanup
        Build-DockerImage -tag "notification-service:latest" -dockerfile "backend/notification-service/Dockerfile" -context "./backend/notification-service" -skipCleanup $SkipCleanup
        Build-DockerImage -tag "api-gateway:latest" -dockerfile "api-gateway/Dockerfile" -context "." -skipCleanup $SkipCleanup
    } catch {
        Write-Host "Error during Docker build process: $_" -ForegroundColor Red
        throw
    }
    
    # Deploy StatefulSets
    Write-Host "Deploying StatefulSets..." -ForegroundColor Yellow
    Reset-StatefulSet -name "zookeeper" -namespace "ecommerce" -yamlPath "k8s/zookeeper.yaml"
    Wait-ForPod -label "zookeeper" -namespace "ecommerce" -timeout 120
    
    Start-Sleep -Seconds 30
    
    Reset-StatefulSet -name "kafka" -namespace "ecommerce" -yamlPath "k8s/kafka.yaml"
    Wait-ForPod -label "kafka" -namespace "ecommerce" -timeout 180
    
    Reset-StatefulSet -name "mongodb" -namespace "ecommerce" -yamlPath "k8s/mongodb.yaml"
    Wait-ForPod -label "mongodb" -namespace "ecommerce" -timeout 120
    
    # Initialize MongoDB with sample data
    Initialize-MongoDB
    
    # Deploy microservices
    Write-Host "Deploying microservices..." -ForegroundColor Yellow
    
    $services = @{
        "user-service" = "k8s/user-service.yaml"
        "product-service" = "k8s/product-service.yaml"
        "order-service" = "k8s/order-service.yaml"
        "notification-service" = "k8s/notification-service.yaml"
        "api-gateway" = "k8s/api-gateway.yaml"
    }
    
    foreach ($service in $services.GetEnumerator()) {
        Deploy-Service -name $service.Key -yamlPath $service.Value
    }

    # Show all pods in ecommerce namespace
    Write-Host "`nPods in ecommerce namespace:" -ForegroundColor Cyan
    Write-Host "------------------------" -ForegroundColor Cyan
    kubectl get pods -n ecommerce -o wide
    
    # Show additional pod details
    Write-Host "`nDetailed pod information:" -ForegroundColor Cyan
    Write-Host "------------------------" -ForegroundColor Cyan
    kubectl get pods -n ecommerce -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,READY:.status.containerStatuses[*].ready,RESTARTS:.status.containerStatuses[*].restartCount,AGE:.metadata.creationTimestamp
    
    # Test connectivity
    Test-ServiceConnectivity -namespace "ecommerce"
    
    # Get API Gateway URL
    Write-Host "Getting API Gateway URL..." -ForegroundColor Yellow
    $apiGatewayUrl = minikube service api-gateway -n ecommerce --url
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Deployment successful!" -ForegroundColor Green
        Write-Host "API Gateway is accessible at: $apiGatewayUrl" -ForegroundColor Green
    } else {
        Write-Host "⚠️ API Gateway URL not available. Checking status..." -ForegroundColor Yellow
        kubectl get services -n ecommerce
        kubectl get pods -n ecommerce
    }
    
} catch {
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    
    if (-not $SkipCleanup) {
        Write-Host "Attempting to recover..." -ForegroundColor Yellow
        try {
            Reset-MinikubeEnvironment
            Write-Host "Environment reset completed. Please try deploying again." -ForegroundColor Green
        } catch {
            Write-Host "Recovery failed. Please manually reset Minikube:" -ForegroundColor Red
            Write-Host "1. Run 'minikube delete --all'" -ForegroundColor Yellow
            Write-Host "2. Run 'minikube start --driver=docker'" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Deployment failed but keeping environment intact (SkipCleanup=true)" -ForegroundColor Yellow
        Write-Host "Current pod status:" -ForegroundColor Cyan
        kubectl get pods -n ecommerce
        Write-Host "`nTo debug, you can:"
        Write-Host "1. Check pod logs: kubectl logs <pod-name> -n ecommerce" -ForegroundColor Yellow
        Write-Host "2. Check pod details: kubectl describe pod <pod-name> -n ecommerce" -ForegroundColor Yellow
        Write-Host "3. Execute into pod: kubectl exec -it <pod-name> -n ecommerce -- /bin/bash" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Use the above URL to access your application"

















































