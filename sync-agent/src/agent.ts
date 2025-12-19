import { config } from './config/env';
import * as db from './database/db';
import * as cloud from './services/cloud.service';
import * as e4u from './services/local.service';
import cron from 'node-cron';

import { logger } from './config/logger';

const run = async () => {
    logger.info('--- Sync Agent Tick ---');

    // 1. Poll Cloud for New Orders
    try {
        const newOrders = await cloud.fetchPendingOrders();
        if (newOrders && newOrders.length > 0) {
            logger.info(`[Cloud] Received ${newOrders.length} pending orders`);
            for (const order of newOrders) {
                db.addOrder(order);
                logger.info(`[DB] Queued Order ${order.orderNumber}`);
            }
        }
    } catch (err: any) {
        logger.error(`[Cloud] Poll failed: ${err.message}`);
    }

    // 2. Process Pending Orders (Export to E4U)
    const pending: any[] = db.getPendingTasks();
    for (const task of pending) {
        try {
            await e4u.exportToE4U(task);
            db.updateStatus(task.id, 'PROCESSED');
            // PROCESSED means "Sent to Billing PC", waiting for confirmation
        } catch (err: any) {
            logger.error(`[E4U] Export failed for ${task.orderNumber}: ${err.message}`);
        }
    }

    // 3. Check for Billing Confirmations (File System -> DB)
    const processedTasks: any[] = db.getProcessedTasks();
    for (const task of processedTasks) {
        const invoiceNumber = e4u.checkForBillingConfirmation(task.orderNumber);
        if (invoiceNumber) {
            logger.info(`[Agent] Found Invoice ${invoiceNumber} for ${task.orderNumber}`);
            db.updateStatus(task.id, 'BILLED', invoiceNumber);
        }
    }

    // 4. Push Confirmations to Cloud (The 'BILLED' ones)
    const unsynced: any[] = db.getUnsyncedTasks(); // Status='BILLED'
    for (const task of unsynced) {
        try {
            await cloud.pushBillingConfirmation({
                orderId: task.id,
                success: true,
                error: ''
            });
            db.updateStatus(task.id, 'SYNCED');
            logger.info(`[Cloud] Synced Invoice ${task.invoiceNumber} for Order ${task.orderNumber}`);
        } catch (err: any) {
            logger.error(`[Cloud] Sync failed for ${task.orderNumber}: ${err.message}`);
        }
    }
};

// Start Polling Loop
logger.info(`[Agent] Starting Shop Agent (${config.SHOP_ID})...`);
setInterval(run, config.POLL_INTERVAL_MS);
run(); // Initial run

// Mock E4U "Human" Simulator
// In a real deployment this wouldn't exist. 
// But for "Fully working Sync Agent" verification we need it.
import fs from 'fs';
import path from 'path';

const simulateHumanBilling = () => {
    // Look for IMPORT_ORDER_*.csv
    const files = fs.readdirSync(config.E4U_EXPORT_DIR).filter(f => f.startsWith('IMPORT_ORDER_') && f.endsWith('.csv'));

    for (const file of files) {
        // Extract Order Number
        const orderNumber = file.replace('IMPORT_ORDER_', '').replace('.csv', '');

        // Random "Human" delay simulation (10% chance to bill per tick?)
        if (Math.random() > 0.5) {
            const invoiceNum = `INV-${Math.floor(Math.random() * 100000)}`;
            const billFile = path.join(config.E4U_EXPORT_DIR, `BILLED_${orderNumber}.txt`);
            fs.writeFileSync(billFile, invoiceNum);
            logger.info(`[Sim] Human billed ${orderNumber} -> ${invoiceNum}`);

            // Remove import file (consumed)
            fs.unlinkSync(path.join(config.E4U_EXPORT_DIR, file));
        }
    }


    // SCAN Loop handled in main `run` loop via `getProcessedTasks` and `checkForBillingConfirmation`
};
