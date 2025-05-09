@echo off

REM Open Windows Terminal with multiple tabs
wt --title "Services Info" cmd /k "cd /d %~dp0 && echo Installing root level dependencies... && npm install && cd backend/shared && echo Installing shared dependencies... && npm install && cd ../.. && echo Starting all services... && echo Starting order: Zookeeper, Kafka, Microservices, Frontend, API Gateway" ^
; new-tab --title "Zookeeper" cmd /k "cd /d C:\apache-zookeeper-3.7.2-bin\bin && zkServer.cmd" ^
; new-tab --title "Kafka" cmd /k "cd /d C:\kafka_2.13-3.6.1 && timeout /t 15 /nobreak && echo Starting Kafka... && .\bin\windows\kafka-server-start.bat .\config\server.properties" ^
; new-tab --title "Order Service" cmd /k "cd /d %~dp0backend\order-service && npm install && npm run start" ^
; new-tab --title "Product Service" cmd /k "cd /d %~dp0backend\product-service && npm install && npm run start" ^
; new-tab --title "User Service" cmd /k "cd /d %~dp0backend\user-service && npm install && npm run start" ^
; new-tab --title "Notification Service" cmd /k "cd /d %~dp0backend\notification-service && npm install && npm run start" ^
; new-tab --title "Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run build" ^
; new-tab --title "API Gateway" cmd /k "cd /d %~dp0api-gateway && npm install && node index.js"






