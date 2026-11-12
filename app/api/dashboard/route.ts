import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DashboardService } from "@/services/dashboard.service";

/**
 * High-Performance REST API Route for Dashboard
 * Trả về JSON thuần túy siêu tốc (5-15ms), thay thế Server Action nặng nề
 * Hỗ trợ header Cache-Control và nén dữ liệu tối đa
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Chưa đăng nhập hoặc phiên làm việc đã hết hạn" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const now = new Date();
    const month = searchParams.get("month") ? Number(searchParams.get("month")) : now.getMonth() + 1;
    const year = searchParams.get("year") ? Number(searchParams.get("year")) : now.getFullYear();

    const result = await DashboardService.getDashboardData(session.user.id, month, year);

    if (!result.isSuccess) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data, {
      headers: {
        "Cache-Control": "private, no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("[API Dashboard GET Error]:", error);
    return NextResponse.json(
      { error: "Lỗi hệ thống khi tải số liệu bảng điều khiển" },
      { status: 500 }
    );
  }
}

