import { connectDB } from './src/config/database';
import { seedAdminIfMissing } from './src/utils/bootstrap';
import { seedCategories } from './seed_categories';
import { seedProducts } from './seed_sample_products';
import mongoose from 'mongoose';

const runSeed = async () => {
    console.log('🚀 Starting Database Seed...');
    await connectDB();

    await seedAdminIfMissing();
    await seedCategories();
    await seedProducts();

    console.log('✅ Database Seeding Complete');
    process.exit(0);
};

runSeed();
