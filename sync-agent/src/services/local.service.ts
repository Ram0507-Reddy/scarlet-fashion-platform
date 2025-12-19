import fs from 'fs';
import path from 'path';
import { config } from '../config/env';
import { stringify } from 'csv-stringify/sync';

export const exportToE4U = async (order: any) => {
    // E4U Format (Simulated): ORDER_ID, NAME, SIZE, PRICE, QTY
    const rows = JSON.parse(order.items).map((item: any) => ({
        order_ref: order.orderNumber,
        product: item.name,
        size: item.size,
        price: item.price,
        qty: item.qty
    }));

    const csvContent = stringify(rows, { header: true });

    // Write to export directory
    // Filename: IMPORT_ORDER_{ORDER_NUMBER}.csv
    const filename = `IMPORT_ORDER_${order.orderNumber}.csv`;
    const filePath = path.join(config.E4U_EXPORT_DIR, filename);

    fs.writeFileSync(filePath, csvContent);
    console.log(`[E4U] Exported Order ${order.orderNumber} to ${filePath}`);
};

export const checkForBillingConfirmation = (orderNumber: string): string | null => {
    // Simulation: Check for a file named "BILLED_{ORDER_NUMBER}.txt"
    // Content of file is the Invoice Number
    const filename = `BILLED_${orderNumber}.txt`;
    const filePath = path.join(config.E4U_EXPORT_DIR, filename);

    if (fs.existsSync(filePath)) {
        const invoiceNumber = fs.readFileSync(filePath, 'utf-8').trim();
        // Remove the confirmation file to avoid re-processing? 
        // Or keep it for audit. We'll rename it to .processed
        fs.renameSync(filePath, filePath + '.processed');
        return invoiceNumber;
    }
    return null;
};
