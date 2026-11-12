import mongoose from "mongoose";
import { isJsonDbActive, getDatabase } from "./json-db";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quanlytaichinh";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Kết nối Cơ Sở Dữ Liệu:
 * - Hỗ trợ chế độ JSON Database Cục Bộ siêu tốc (Zero External Dependencies) khi test
 * - Hỗ trợ kết nối MongoDB Atlas Connection Pool khi triển khai Production
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Nếu đang ở chế độ JSON Database
  if (isJsonDbActive()) {
    getDatabase(); // Khởi tạo và nạp dữ liệu từ data/db.json vào RAM
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 25,
      minPoolSize: 5,
      socketTimeoutMS: 20000,
      serverSelectionTimeoutMS: 4000,
      family: 4,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("❌ Lỗi kết nối MongoDB:", err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
