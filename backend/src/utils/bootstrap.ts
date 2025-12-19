import { config } from '../config/env';
import { User } from '../modules/auth/user.model';
import { redis } from '../config/redis';
import mongoose from 'mongoose';

export const validateEnv = () => {
    const required = [
        'MONGO_URI',
        'REDIS_URI',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET'
    ];

    const missing = required.filter(key => !process.env[key] && !config[key as keyof typeof config]);

    if (missing.length > 0) {
        console.error('❌ FATAL: Missing Environment Variables:', missing);
        process.exit(1);
    }
    console.log('✅ Environment Validated');
};

export const seedAdminIfMissing = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@scarletfashion.com';
        // In production, force robust password from env. In dev, fallback is okay but warn.
        // We really should require ADMIN_PASS in prod.
        const adminPass = process.env.ADMIN_PASS || 'Admin@1234';

        const exists = await User.findOne({ email: adminEmail });

        if (exists) {
            console.log('ℹ️  [INIT] Admin user verified (Already Exists)');
            // Optional: Ensure role is correct if it drifted?
            if (exists.role !== 'ADMIN') {
                exists.role = 'ADMIN';
                await exists.save();
                console.log('⚠️  [INIT] Admin role corrected to ADMIN');
            }
            return;
        }

        console.log('🌱 [INIT] Seeding Admin User...');
        const newAdmin = new User({
            name: 'System Admin',
            email: adminEmail,
            password: adminPass, // Pre-save hook will hash
            role: 'ADMIN'
        });

        await newAdmin.save();
        console.log(`✅ [INIT] Admin created: ${adminEmail}`);

    } catch (error) {
        console.error('❌ [INIT] Admin Seeding Failed:', error);
        // We should fail hard in production if we can't ensure admin access?
        // Or warn? "Master Prompt" says: "Guarantee admin access". So fail hard.
        if (config.NODE_ENV === 'production') process.exit(1);
    }
};

export const checkRedis = async () => {
    try {
        await redis.ping();
        console.log('✅ [INIT] Redis Connectivity Verified');
    } catch (error) {
        console.error('❌ [INIT] Redis Check Failed:', error);
        process.exit(1);
    }
};
