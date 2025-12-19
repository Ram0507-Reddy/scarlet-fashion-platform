import axios from 'axios';


const API_URL = 'http://localhost:4000/api';

// Colors for console
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    bold: "\x1b[1m"
};

const log = (msg: string, color: string = colors.reset) => console.log(`${color}${msg}${colors.reset}`);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// State
let userToken = '';
let adminToken = '';
let createdProductId = '';
let testUserEmail = `qa_user_${Date.now()}@scarlet.com`;
const adminEmail = 'admin@scarletfashion.com';
const adminPass = 'Admin@1234';

const client = axios.create({
    baseURL: API_URL,
    validateStatus: () => true // Handle errors manually
});

const setAuth = (token: string) => ({
    headers: { Authorization: `Bearer ${token}` }
});

const runAudit = async () => {
    log('\n🚀 STARTING AUTONOMOUS API AUDIT\n', colors.bold + colors.blue);

    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, msg: string) => {
        if (condition) {
            log(`  ✅ PASS: ${msg}`, colors.green);
            passed++;
        } else {
            log(`  ❌ FAIL: ${msg}`, colors.red);
            failed++;
            // throw new Error(msg); // Optional: Stop on fail
        }
    };

    try {
        // --- 1. USER REGISTRATION ---
        log('[1] User Registration & Auth', colors.yellow);
        const regRes = await client.post('/auth/register', {
            name: 'QA Tester',
            email: testUserEmail,
            password: 'Test@1234'
        });
        assert(regRes.status === 201 || regRes.status === 200, `Registration Status: ${regRes.status}`);

        const loginRes = await client.post('/auth/login', {
            email: testUserEmail,
            password: 'Test@1234'
        });
        assert(loginRes.status === 200, `Login Status: ${loginRes.status}`);

        userToken = loginRes.data.token || loginRes.headers['set-cookie']?.find((c: string) => c.startsWith('accessToken='))?.split(';')[0].split('=')[1];
        assert(!!userToken, 'User Token Captured');

        // --- 2. PRODUCT BROWSING ---
        log('\n[2] Product Catalog', colors.yellow);
        const prodRes = await client.get('/products');
        assert(prodRes.status === 200, `Fetch Products: ${prodRes.status}`);

        let targetProduct = prodRes.data[0];
        if (!targetProduct) {
            log('  ⚠️ No products found. Skipping Add to Cart.', colors.yellow);
        } else {
            log(`  ℹ️ Target Product: ${targetProduct.name} (${targetProduct._id})`);
        }

        // --- 3. CART OPERATIONS ---
        if (targetProduct) {
            log('\n[3] Cart Operations', colors.yellow);
            // Add to Cart
            const addCartRes = await client.post('/cart/add', {
                productId: targetProduct._id,
                quantity: 1,
                size: targetProduct.variants?.[0]?.size || 'M'
            }, setAuth(userToken));
            assert(addCartRes.status === 200, `Add to Cart: ${addCartRes.status}`);

            // Verify Cart
            const getCartRes = await client.get('/cart', setAuth(userToken));
            const cartItem = getCartRes.data.items?.find((i: any) => i.product._id === targetProduct._id);
            assert(!!cartItem, 'Product found in Cart');
        }

        // --- 4. ORDER / CHECKOUT ---
        log('\n[4] Checkout Flow (COD)', colors.yellow);
        const orderRes = await client.post('/orders', {
            paymentMethod: 'COD',
            shippingAddress: {
                fullName: 'QA Tester',
                phone: '9999999999',
                line1: '123 QA Lane',
                city: 'Test City',
                postalCode: '10001',
                country: 'India'
            }
        }, setAuth(userToken));

        if (orderRes.status === 200 || orderRes.status === 201) {
            assert(true, `Order Placed: ${orderRes.data.order?.orderNumber}`);

            // Verify Cart Cleared (Strict Check)
            const afterOrderCart = await client.get('/cart', setAuth(userToken));
            if (afterOrderCart.data.items && afterOrderCart.data.items.length === 0) {
                assert(true, 'Redis Cart Cleared after Order');
            } else {
                assert(false, `Cart NOT Cleared! Items: ${afterOrderCart.data.items?.length}`);
            }
        } else {
            console.log(orderRes.data);
            assert(false, `Order Failed: ${orderRes.status}`);
        }

        // --- 5. ADMIN AUTH & OPERATIONS ---
        log('\n[5] Admin Operations', colors.yellow);

        // Login Admin
        const adminLoginRes = await client.post('/auth/login', {
            email: adminEmail,
            password: adminPass
        });

        if (adminLoginRes.status === 200) {
            adminToken = adminLoginRes.data.token;
            assert(true, 'Admin Login Successful');

            // Create Product
            const newProdRes = await client.post('/admin/products', {
                name: `QA Auto Dress ${Date.now()}`,
                description: 'Generated by QA Audit',
                price: 1999,
                category: 'Dresses',
                images: ['https://placehold.co/600x400'],
                variants: [{ size: 'M', stock: 100 }, { size: 'L', stock: 50 }]
            }, setAuth(adminToken));

            if (newProdRes.status === 201 || newProdRes.status === 200) {
                createdProductId = newProdRes.data.product?._id;
                assert(true, `Admin Created Product: ${createdProductId}`);
            } else {
                assert(false, `Admin Create Product Failed: ${newProdRes.status}`);
            }

            // Edit Product
            //  if (createdProductId) {
            //     const editRes = await client.put(`/admin/products/${createdProductId}`, {
            //         price: 2500
            //     }, setAuth(adminToken));
            //     assert(editRes.status === 200, 'Admin Edited Product Price');
            //  }

        } else {
            const fs = require('fs');
            log('  ⚠️ API Admin Login Failed. Skipping Admin Write tests.', colors.red);
            log(`  ℹ️ Response: ${JSON.stringify(adminLoginRes.data)}`);
            fs.writeFileSync('admin_error.json', JSON.stringify(adminLoginRes.data, null, 2));
            // Attempt to seed admin?
        }

        // --- 6. SECURITY CHECKS ---
        log('\n[6] Security Checks', colors.yellow);
        // User accessing Admin route
        const secRes = await client.get('/admin/stats', setAuth(userToken));
        assert(secRes.status === 403 || secRes.status === 401, `User accessing Admin Route blocked (Status: ${secRes.status})`);

    } catch (e: any) {
        log(`\n❌ CRITICAL EXCEPTION: ${e.message}`, colors.red);
        console.error(e);
    } finally {
        log(`\n📊 AUDIT SUMMARY: ${passed} Passed, ${failed} Failed`, colors.bold);
    }
};

runAudit();
