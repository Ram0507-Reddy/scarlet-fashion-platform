import mongoose from 'mongoose';
import { User } from './src/modules/auth/user.model';
// import { config } from './src/config/env';

const MONGO_URI = 'mongodb://localhost:27017/scarlet-fashion'; // Hardcoded for debug

const seedAdmin = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const adminEmail = 'admin@scarletfashion.com';
        const adminPass = 'Admin@1234';

        console.log('Checking for admin...');
        const exists = await User.findOne({ email: adminEmail });
        if (exists) {
            console.log('Admin already exists. Updating...');
            exists.password = adminPass;
            exists.role = 'ADMIN';
            await exists.save();
            console.log('Admin Updated');
        } else {
            console.log('Creating new admin...');
            const newAdmin = new User({
                name: 'Super Admin',
                email: adminEmail,
                password: adminPass,
                role: 'ADMIN'
            });
            await newAdmin.save();
            console.log('Admin Created');
        }

        process.exit(0);
    } catch (e: any) {
        console.error('SEED ERROR:', JSON.stringify(e, null, 2));
        console.error(e.stack);
        process.exit(1);
    }
};

seedAdmin();
