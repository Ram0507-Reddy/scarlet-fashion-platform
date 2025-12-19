import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    SHOP_ID: process.env.SHOP_ID || 'unknown_shop',
    API_KEY: process.env.API_KEY || '',
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:4000/api',
    E4U_EXPORT_DIR: process.env.E4U_EXPORT_DIR || './e4u_exports',
    POLL_INTERVAL_MS: parseInt(process.env.POLL_INTERVAL_MS || '30000'),
    DB_PATH: path.join(process.cwd(), 'agent.db')
};
