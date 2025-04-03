#!/bin/bash

echo "Waiting 15 seconds for Zookeeper to be ready..."
sleep 30

echo "Starting Kafka..."
exec /opt/bitnami/scripts/kafka/entrypoint.sh /opt/bitnami/scripts/kafka/run.sh