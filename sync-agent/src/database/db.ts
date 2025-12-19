import Database from 'better-sqlite3';
import { config } from '../config/env';
import path from 'path';

const db = new Database(config.DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS pending_orders (
    id TEXT PRIMARY KEY,
    orderNumber TEXT NOT NULL,
    items TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, PROCESSED, BILLED, SYNCED
    invoiceNumber TEXT,
    retryCount INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

export const getPendingTasks = () => {
    return db.prepare("SELECT * FROM pending_orders WHERE status = 'PENDING'").all();
};

export const getUnsyncedTasks = () => {
    return db.prepare("SELECT * FROM pending_orders WHERE status = 'BILLED'").all();
};

export const addOrder = (order: any) => {
    const stmt = db.prepare(`
        INSERT OR IGNORE INTO pending_orders (id, orderNumber, items, totalAmount)
        VALUES (?, ?, ?, ?)
    `);
    stmt.run(order._id, order.orderNumber, JSON.stringify(order.items), order.totalAmount);
};

// Helper to find by Order Number used in file scanning
export const getOrderByOrderNumber = (orderNumber: string) => {
    return db.prepare("SELECT * FROM pending_orders WHERE orderNumber = ?").get(orderNumber);
};

export const getProcessedTasks = () => {
    return db.prepare("SELECT * FROM pending_orders WHERE status = 'PROCESSED'").all();
};

export const updateStatus = (id: string, status: string, invoiceNumber?: string) => {
    let sql = "UPDATE pending_orders SET status = ?, updatedAt = CURRENT_TIMESTAMP";
    const params: any[] = [status];

    if (invoiceNumber) {
        sql += ", invoiceNumber = ?";
        params.push(invoiceNumber);
    }

    sql += " WHERE id = ?";
    params.push(id);

    db.prepare(sql).run(...params);
};

export const getOrderById = (id: string) => {
    return db.prepare("SELECT * FROM pending_orders WHERE id = ?").get(id);
};
