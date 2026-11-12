import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

interface RawWard {
  Id: string;
  Name: string;
  Level: string;
}

interface RawDistrict {
  Id: string;
  Name: string;
  Wards: RawWard[];
}

interface RawProvince {
  Id: string;
  Name: string;
  Districts: RawDistrict[];
}

// In-memory cache để truy vấn siêu tốc <1ms
let cachedData: RawProvince[] | null = null;

function getFullVietnamData(): RawProvince[] {
  if (cachedData) return cachedData;
  try {
    const filePath = path.join(process.cwd(), "data", "vietnam-address.json");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      cachedData = JSON.parse(content);
      return cachedData || [];
    }
  } catch (err) {
    console.error("Lỗi đọc vietnam-address.json:", err);
  }
  return [];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const provinceId = searchParams.get("provinceId");
    const districtId = searchParams.get("districtId");

    const data = getFullVietnamData();

    // 1. Trả về toàn bộ danh sách Quận/Huyện của 1 Tỉnh
    if (type === "districts") {
      if (!provinceId) {
        return NextResponse.json({ error: "Thiếu provinceId" }, { status: 400 });
      }
      const prov = data.find((p) => p.Id === provinceId);
      if (!prov) {
        return NextResponse.json([]);
      }
      const districts = prov.Districts.map((d) => ({
        id: d.Id,
        name: d.Name,
      }));
      return NextResponse.json(districts);
    }

    // 2. Trả về toàn bộ danh sách Phường/Xã của 1 Quận/Huyện
    if (type === "wards") {
      if (!provinceId || !districtId) {
        return NextResponse.json({ error: "Thiếu provinceId hoặc districtId" }, { status: 400 });
      }
      const prov = data.find((p) => p.Id === provinceId);
      const dist = prov?.Districts.find((d) => d.Id === districtId);
      if (!dist) {
        return NextResponse.json([]);
      }
      const wards = dist.Wards.map((w) => ({
        id: w.Id,
        name: w.Name,
        level: w.Level,
      }));
      return NextResponse.json(wards);
    }

    // 3. Mặc định: Trả về đầy đủ 63 Tỉnh/Thành phố Việt Nam
    const provinces = data.map((p) => ({
      id: p.Id,
      name: p.Name,
      totalDistricts: p.Districts.length,
    }));

    return NextResponse.json(provinces);
  } catch (error) {
    console.error("[Locations API Error]:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải địa giới hành chính Việt Nam" },
      { status: 500 }
    );
  }
}
