# Client Handover Grid: Scarlet Fashion Platform

**Date:** 2025-12-19
**Version:** 1.0.0 (Gold)

## 1. System Overview
The Scarlet Fashion Platform has been deployed with three core components:
1.  **Consumer Storefront**: Web/Mobile PWA for customers.
2.  **Product Cloud**: Centralized inventory & order management.
3.  **Retail Bridge**: Sync software for the Shop PC.

## 2. Key Credentials (Development)
| Service | URL / Host | Default Creds / Key | Notes |
| :--- | :--- | :--- | :--- |
| **Storefront** | `http://localhost:3000` | N/A | Public Facing |
| **Admin Panel** | `http://localhost:3000/admin` | `admin@scarlet.com` / `admin123` | **Change Password Immediately** |
| **Backend API** | `http://localhost:4000` | `x-api-key`: `local_agent_secret_key_789` | For Sync Agent |
| **Database** | MongoDB (Local) | `scarlet-fashion` | Port 27017 |
| **Cache** | Redis (Local) | N/A | Port 6379 |

## 3. Deployment Checklist

### A. Cloud Server (AWS/DigitalOcean)
1.  **Provision**: Ubuntu 22.04 LTS, 4GB RAM.
2.  **Dependencies**: Docker, Node.js 20, MongoDB Atlas (recommended), Redis Cloud.
3.  **Backend**:
    - Clone `scarlet-fashion-backend`.
    - Set Production `.env` (Secure Secrets).
    - Run with `pm2 start dist/server.js`.
4.  **Frontend**:
    - Clone `scarlet-fashion`.
    - Build: `npm run build`.
    - Start: `npm start`.

### B. Shop PC (Windows)
1.  **Prerequisites**: Node.js 20 LTS.
2.  **Install Agent**:
    - Copy `scarlet-fashion-sync-agent` folder.
    - Run `npm install` & `npm run build`.
3.  **Configure**:
    - Edit `.env`: Set `API_BASE_URL` to Cloud URL.
    - Set `E4U_EXPORT_DIR` to E4U's import folder path.
4.  **Auto-Start**:
    - Run `npx pm2 start ecosystem.config.js`.
    - Run `npx pm2 startup` and follow instructions.

## 4. Maintenance & Troubleshooting

### Q: Orders are not appearing in E4U?
- **Check Agent Logs**: `logs/agent.combined.log` in agent folder.
- **Check Network**: Ensure Shop PC has internet. Agent will auto-retry.
- **Check File Permissions**: Ensure Agent has Write access to `e4u_exports`.

### Q: Stock count is mismatching?
- **Admin**: Go to Inventory Dashboard -> "Force Sync".
- **Logs**: Check Backend logs for "Stock Reservation Failed".

### Q: How to update the site?
- **Code**: `git pull` on cloud server.
- **Restart**: `pm2 restart all`.

## 5. Support Contacts
- **System Architect**: Antigravity AI (Google Deepmind)
