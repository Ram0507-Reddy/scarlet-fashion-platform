import { connectDB } from './src/config/database';
import mongoose from 'mongoose';
// Using raw schema or imported model. Since I don't have easy access to Product Model exports right here without checking file structure again, I'll rely on mongoose.models check or define schema relative to DB.
// Actually, better to import if possible, but let's be safe and define schema if model missing.
// I saw product.model.ts earlier.

const productSchema = new mongoose.Schema({
    name: String, slug: String, description: String, price: Number,
    category: String, images: [String],
    variants: [{ size: String, color: String, stock: Number }],
    isActive: Boolean
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const sampleProducts = [
    {
        name: 'Scarlet Red Evening Gown',
        slug: 'scarlet-red-evening-gown',
        description: 'A stunning red gown for evening parties.',
        price: 12999,
        category: 'Dresses',
        images: ['https://placehold.co/600x800/red/white?text=Red+Gown'],
        variants: [{ size: 'S', stock: 10 }, { size: 'M', stock: 20 }, { size: 'L', stock: 15 }],
        isActive: true
    },
    {
        name: 'Classic White Blouse',
        slug: 'classic-white-blouse',
        description: 'Timeless white blouse for work or casual wear.',
        price: 2499,
        category: 'Tops',
        images: ['https://placehold.co/600x800/white/black?text=White+Blouse'],
        variants: [{ size: 'S', stock: 50 }, { size: 'M', stock: 50 }],
        isActive: true
    },
    {
        name: 'Denim High-Waist Jeans',
        slug: 'denim-high-waist-jeans',
        description: 'Comfortable and stylish high-waist jeans.',
        price: 3999,
        category: 'Bottoms',
        images: ['https://placehold.co/600x800/blue/white?text=Blue+Jeans'],
        variants: [{ size: '28', stock: 30 }, { size: '30', stock: 30 }, { size: '32', stock: 20 }],
        isActive: true
    }
];

export const seedProducts = async () => {
    try {
        console.log('🌱 Seeding Products...');
        // await Product.deleteMany({}); // Optional: clear
        for (const prod of sampleProducts) {
            await Product.findOneAndUpdate(
                { slug: prod.slug },
                prod,
                { upsert: true, new: true }
            );
        }
        console.log('✅ Sample Products Seeded');
    } catch (error) {
        console.error('❌ Product Seeding Failed:', error);
    }
};

if (require.main === module) {
    (async () => {
        await connectDB();
        await seedProducts();
        process.exit();
    })();
}
