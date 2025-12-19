# Scarlet Fashion Platform

A full-stack retail ecommerce system with offline billing synchronization.

## Architecture
- Frontend: Next.js 14, TypeScript, TailwindCSS
- Backend: Node.js, Express, MongoDB, Redis
- Sync Agent: Node.js, SQLite, Offline-first

## Repository Structure
/frontend      → Consumer Web App  
/backend       → REST API & Admin Backend  
/sync-agent    → Shop PC Billing Sync Agent  

## Features
- User & Admin Authentication
- Product & Inventory Management
- Cart & Order Concurrency Protection
- Offline Billing Sync with Legacy Systems
- Role-Based Access Control

## Environment Setup
Each service uses its own `.env` file.
Refer to `/docs/client_handover.md`.

## Status
Production Ready (v1.0.0)
