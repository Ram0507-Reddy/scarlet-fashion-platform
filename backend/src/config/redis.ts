import Redis from "ioredis";
import { config } from './env';

if (!config.REDIS_URI) {
    throw new Error("❌ REDIS_URI is missing in .env");
}

export const redis = new Redis(config.REDIS_URI, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
});

redis.on("connect", () => {
    console.log("🟥 Redis connected");
});

redis.on("error", (err) => {
    console.error("❌ Redis error:", err);
});
