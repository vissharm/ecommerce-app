@echo off

REM Check for required directories
IF NOT EXIST "C:\apache-zookeeper-3.7.2-bin" (
    echo ERROR: Zookeeper directory not found at C:\apache-zookeeper-3.7.2-bin
    echo Please ensure apache-zookeeper-3.7.2-bin is extracted to C:\ drive
    echo The directory should contain a 'bin' folder with zkServer.cmd
    exit /b 1
)

IF NOT EXIST "C:\apache-zookeeper-3.7.2-bin\bin" (
    echo ERROR: Zookeeper bin directory not found at C:\apache-zookeeper-3.7.2-bin\bin
    echo Please ensure the Zookeeper installation is complete and contains the bin directory
    exit /b 1
)

IF NOT EXIST "C:\kafka_2.13-3.6.1" (
    echo ERROR: Kafka directory not found at C:\kafka_2.13-3.6.1
    echo Please ensure kafka_2.13-3.6.1 is extracted to C:\ drive
    echo The directory should contain a 'bin\windows' folder with kafka-server-start.bat
    exit /b 1
)

IF NOT EXIST "C:\kafka_2.13-3.6.1\bin\windows" (
    echo ERROR: Kafka bin directory not found at C:\kafka_2.13-3.6.1\bin\windows
    echo Please ensure the Kafka installation is complete and contains the bin\windows directory
    exit /b 1
)

REM If all checks pass, continue with the original script
REM Open Windows Terminal with multiple tabs
wt --title "Services Info" cmd /k "cd /d %~dp0 && echo Installing root level dependencies... && npm install && cd backend/shared && echo Installing shared library dependencies... && npm install && cd ../.. && echo Starting all services... && echo Starting order: Zookeeper, Kafka, Microservices, Frontend, API Gateway" ^
; new-tab --title "Zookeeper" cmd /k "cd /d C:\apache-zookeeper-3.7.2-bin\bin && zkServer.cmd" ^
; new-tab --title "Kafka" cmd /k "cd /d C:\kafka_2.13-3.6.1 && timeout /t 15 /nobreak && echo Starting Kafka... && .\bin\windows\kafka-server-start.bat .\config\server.properties" ^
; new-tab --title "Order Service" cmd /k "cd /d %~dp0backend\order-service && npm install && npm link shared && npm run start" ^
; new-tab --title "Product Service" cmd /k "cd /d %~dp0backend\product-service && npm install && npm link shared && npm run start" ^
; new-tab --title "User Service" cmd /k "cd /d %~dp0backend\user-service && npm install && npm link shared && npm run start" ^
; new-tab --title "Notification Service" cmd /k "cd /d %~dp0backend\notification-service && npm install && npm link shared && npm run start" ^
; new-tab --title "Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run build" ^
; new-tab --title "API Gateway" cmd /k "cd /d %~dp0api-gateway && npm install && npm link shared && node index.js"







@REM @echo off

@REM REM Open Windows Terminal with multiple tabs
@REM wt --title "Services Info" cmd /k "cd /d %~dp0 && echo Installing root level dependencies... && npm install && cd backend/shared && echo Installing shared library dependencies... && npm install && npm run build && cd ../.. && echo Starting all services... && echo Starting order: Zookeeper, Kafka, Microservices, Frontend, API Gateway" ^
@REM ; new-tab --title "Zookeeper" cmd /k "cd /d C:\apache-zookeeper-3.7.2-bin\bin && zkServer.cmd" ^
@REM ; new-tab --title "Kafka" cmd /k "cd /d C:\kafka_2.13-3.6.1 && timeout /t 15 /nobreak && echo Starting Kafka... && .\bin\windows\kafka-server-start.bat .\config\server.properties" ^
@REM ; new-tab --title "Order Service" cmd /k "cd /d %~dp0backend\order-service && npm install && npm install ../shared/shared-1.0.0.tgz && npm run start" ^
@REM ; new-tab --title "Product Service" cmd /k "cd /d %~dp0backend\product-service && npm install && npm install ../shared/shared-1.0.0.tgz && npm run start" ^
@REM ; new-tab --title "User Service" cmd /k "cd /d %~dp0backend\user-service && npm install && npm install ../shared/shared-1.0.0.tgz && npm run start" ^
@REM ; new-tab --title "Notification Service" cmd /k "cd /d %~dp0backend\notification-service && npm install && npm install ../shared/shared-1.0.0.tgz && npm run start" ^
@REM ; new-tab --title "Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run build" ^
@REM ; new-tab --title "API Gateway" cmd /k "cd /d %~dp0api-gateway && npm install && npm install ../backend/shared/shared-1.0.0.tgz && node index.js"


