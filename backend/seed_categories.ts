import { connectDB } from './src/config/database';
import mongoose from 'mongoose';

// Minimal Category Schema if not imported
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    isActive: { type: Boolean, default: true }
});
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

const categories = [
    { name: 'Dresses', slug: 'dresses', description: 'Elegant dresses for all occasions' },
    { name: 'Tops', slug: 'tops', description: 'Casual and formal tops' },
    { name: 'Bottoms', slug: 'bottoms', description: 'Skirts, pants, and shorts' },
    { name: 'Accessories', slug: 'accessories', description: 'Bags, jewelry, and more' },
    { name: 'Footwear', slug: 'footwear', description: 'Stylish shoes and sandals' }
];

export const seedCategories = async () => {
    try {
        console.log('🌱 Seeding Categories...');
        await Category.deleteMany({}); // Clear existing? Or use upsert? Prompt says "Seed Data", usually implies fresh start or safe upsert. I'll use Upsert for safety.

        for (const cat of categories) {
            await Category.findOneAndUpdate(
                { slug: cat.slug },
                cat,
                { upsert: true, new: true }
            );
        }
        console.log('✅ Categories Seeded');
    } catch (error) {
        console.error('❌ Category Seeding Failed:', error);
    }
};

if (require.main === module) {
    (async () => {
        await connectDB();
        await seedCategories();
        process.exit();
    })();
}
