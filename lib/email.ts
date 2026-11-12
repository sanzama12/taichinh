/**
 * Email Service Provider: Tích hợp Resend REST API (Zero dependency)
 * Hỗ trợ template HTML đẹp chuẩn Corporate Dark Luxury
 */

export interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailPayload): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log(
      `[EmailService: Simulation Mode] RESEND_API_KEY chưa được cấu hình. Giả lập gửi email thành công tới ${to} với tiêu đề "${subject}"`
    );
    return { success: true };
  }

  try {
    const fromAddress = process.env.EMAIL_FROM || "Tài Chính Cá Nhân & Doanh Nghiệp <onboarding@resend.dev>";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("[EmailService] Resend API error:", errData);
      return { success: false, error: errData.message || "Lỗi gửi email từ nhà cung cấp Resend" };
    }

    return { success: true };
  } catch (error) {
    console.error("[EmailService] Network error:", error);
    return { success: false, error: "Lỗi kết nối khi gửi email" };
  }
}

/**
 * Tạo mẫu Email Nhắc Hạn Tài Chính Chuẩn HTML Luxury
 */
export function buildReminderEmailHtml({
  userName,
  upcomingBills,
  nextPayday,
}: {
  userName: string;
  upcomingBills: Array<{ name: string; amountStr: string; dueDateStr: string; daysRemaining: number }>;
  nextPayday?: { name: string; amountStr: string; dateStr: string; daysRemaining: number } | null;
}): string {
  const billsHtml = upcomingBills
    .map(
      (b) => `
      <tr style="border-bottom: 1px solid #1f2937;">
        <td style="padding: 12px 8px; color: #f3f4f6; font-weight: 600;">${b.name}</td>
        <td style="padding: 12px 8px; color: #ef4444; font-weight: bold; font-family: monospace;">${b.amountStr}</td>
        <td style="padding: 12px 8px; color: #9ca3af; font-family: monospace;">${b.dueDateStr}</td>
        <td style="padding: 12px 8px; color: ${b.daysRemaining <= 3 ? "#ef4444" : "#f59e0b"}; font-weight: bold;">
          ${b.daysRemaining <= 0 ? "Hôm nay / Quá hạn" : `Còn ${b.daysRemaining} ngày`}
        </td>
      </tr>`
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thông Báo Nghĩa Vụ Tài Chính Đến Hạn</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e5e7eb;">
    <div style="max-width: 600px; margin: 30px auto; background-color: #090e17; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
      
      <!-- Header -->
      <div style="background-color: #0f172a; padding: 24px 32px; border-bottom: 1px solid #1e293b;">
        <h2 style="margin: 0; color: #3b82f6; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
          TÀI CHÍNH DOANH NGHIỆP • CẢNH BÁO ĐẾN HẠN
        </h2>
        <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">
          Bản tin tổng hợp các khoản nghĩa vụ cần giải ngân và kế hoạch dòng tiền
        </p>
      </div>

      <!-- Content -->
      <div style="padding: 32px;">
        <p style="font-size: 15px; color: #f1f5f9; margin-top: 0;">
          Kính gửi <strong>${userName}</strong>,
        </p>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
          Hệ thống phát hiện bạn có <strong style="color: #ef4444;">${upcomingBills.length} khoản nghĩa vụ tài chính</strong> sắp đến hạn thanh toán trong thời gian tới:
        </p>

        <!-- Table -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 2px solid #374151; color: #9ca3af; text-align: left; text-transform: uppercase; font-size: 11px;">
              <th style="padding: 8px;">Khoản chi</th>
              <th style="padding: 8px;">Số tiền</th>
              <th style="padding: 8px;">Ngày đến hạn</th>
              <th style="padding: 8px;">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            ${billsHtml}
          </tbody>
        </table>

        <!-- Payday info -->
        ${
          nextPayday
            ? `
        <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 12px; color: #10b981; font-weight: bold; text-transform: uppercase;">
            ✦ Dòng Tiền Thu Nhập Kế Tiếp
          </p>
          <p style="margin: 6px 0 0; font-size: 14px; color: #e2e8f0;">
            Khoản thu <strong>${nextPayday.name}</strong> (${nextPayday.amountStr}) dự kiến về vào ngày <strong>${nextPayday.dateStr}</strong> (${
                nextPayday.daysRemaining <= 0 ? "Hôm nay" : `còn ${nextPayday.daysRemaining} ngày`
              }).
          </p>
        </div>`
            : ""
        }

        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
          Vui lòng kiểm tra số dư khả dụng và đăng nhập vào hệ thống để tiến hành giải ngân kịp thời, tránh phát sinh phí phạt hoặc quá hạn.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #030712; padding: 20px 32px; border-top: 1px solid #1e293b; text-align: center;">
        <p style="margin: 0; font-size: 11px; color: #475569; font-family: monospace;">
          Hệ Thống Quản Lý Tài Chính ProMax • Tự động gửi lúc 08:00 AM (GMT+7)
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

