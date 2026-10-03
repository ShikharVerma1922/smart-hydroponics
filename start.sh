#!/bin/bash

# Stop everything when Ctrl+C is pressed
trap 'kill 0' EXIT

echo "Starting infrastructure..."
docker compose up -d

echo "Starting Node.js backend..."
(
  cd backend
  npm run dev
) &

echo "Starting ML service..."
(
  cd ml-service
  uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
) &

echo "Starting Next.js frontend..."
(
  cd frontend
  npm run dev
) &

echo ""
echo "================================="
echo " Smart Hydroponics is starting..."
echo "================================="
echo " PostgreSQL  : localhost:5433"
echo " InfluxDB    : localhost:8086"
echo " MQTT        : localhost:1883"
echo " Backend     : localhost:3000"
echo " ML Service  : localhost:8000"
echo " Frontend    : localhost:3001"
echo ""

wait