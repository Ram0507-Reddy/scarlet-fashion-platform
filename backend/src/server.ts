import app from './app';
import { config } from './config/env';
import { connectDB } from './config/database';
import { validateEnv, seedAdminIfMissing, checkRedis } from './utils/bootstrap';

const startServer = async () => {
    console.log('🚀 Starting Scarlet Fashion Server...');

    // 1. Validate Environment
    validateEnv();

    // 2. Connect to Database
    await connectDB();

    // 3. Check Redis
    await checkRedis();

    // 4. Seed Admin
    await seedAdminIfMissing();

    app.listen(config.PORT, () => {
        console.log(`✅ Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });
};

startServer();
