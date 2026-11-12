import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";
import fs from "fs";

async function startLocalMongo() {
  const dbPath = path.join(process.cwd(), "data", "mongodb-data");
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  console.log("==========================================================");
  console.log("🚀 ĐANG KHỞI CHẠY MONGODB SERVER CỤC BỘ TRÊN CỔNG 27017...");
  console.log("==========================================================");

  try {
    const mongod = await MongoMemoryServer.create({
      instance: {
        ip: "127.0.0.1",
        port: 27017,
        dbPath: dbPath,
        storageEngine: "wiredTiger",
        dbName: "quanlytaichinh",
      },
    });

    const uri = mongod.getUri();
    console.log("==========================================================");
    console.log(`✓ MONGODB SERVER ĐÃ SẴN SÀNG TẠI: mongodb://localhost:27017/quanlytaichinh`);
    console.log(`✓ Bạn có thể mở MongoDB Compass và kết nối ngay tới: mongodb://localhost:27017`);
    console.log("==========================================================");
    console.log("Giữ cửa sổ này mở để duy trì MongoDB Server hoạt động...");
    // Giữ event loop luôn chạy
    setInterval(() => {}, 1000 * 60 * 60);
  } catch (err: any) {
    if (err?.message?.includes("EADDRINUSE") || err?.code === "EADDRINUSE") {
      console.log("✓ Cổng 27017 đã có MongoDB Server đang chạy sẵn!");
    } else {
      console.error("Lỗi khi khởi động MongoDB Server:", err);
    }
  }
}

startLocalMongo();
