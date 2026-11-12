# QUẢN LÝ TÀI CHÍNH DOANH NGHIỆP & CÁ NHÂN PROMAX
> **Hệ Thống Quản Trị Dòng Tiền, Ngân Sách, Công Nợ & Tích Lũy Doanh Nghiệp Cấp Cao**  
> Xây dựng trên nền tảng **Next.js 14 (App Router) + TypeScript + MongoDB (Mongoose) + Tailwind CSS + shadcn/ui tokens + Recharts**.  
> Tuân thủ chuẩn mực **Kiến trúc MVC + Service Layer Phân Tầng Chặt Chẽ**, thẩm mỹ **Corporate Dark Luxury** và tốc độ phản hồi siêu tốc.

---

## 🏢 CƠ CHẾ ĐĂNG NHẬP: MÃ KHÓA DOANH NGHIỆP (ACCESS KEY GATEWAY)
Hệ thống **không sử dụng đăng ký đại trà hay landing page công cộng**. Truy cập được bảo vệ bởi **Mã Khóa Bản Quyền Doanh Nghiệp (Access Key)** do Ban Quản Trị (Admin) cấp phát:

| Mã Khóa Truy Cập | Đối Tượng / Chủ Sở Hữu | Vai Trò Quyền Hạn | Thời Lượng Phiên Làm Việc |
| :--- | :--- | :--- | :--- |
| `PROMAX-CORP-9999` | **Tập Đoàn Tài Chính Quốc Tế ProMax** | **Ban Quản Trị Cấp Cao (CEO)** | Tùy chọn 1 Ngày hoặc 30 Ngày |
| `ENTERPRISE-CFO-8888` | **Văn Phòng Giám Đốc Tài Chính (CFO)** | **Giám Đốc Tài Chính (CFO)** | Tùy chọn 1 Ngày hoặc 30 Ngày |
| `PROMAX-VIP-8888` | **Khách Hàng Doanh Nghiệp VIP** | **Hội Viên Cấp Cao (VIP)** | Tùy chọn 1 Ngày hoặc 30 Ngày |

> **Chế độ lưu phiên làm việc**:
> - **Ca làm việc tiêu chuẩn (1 Ngày)**: Tự động đăng xuất sau 24 giờ để đảm bảo an toàn tại máy làm việc công cộng hoặc máy mượn.
> - **Máy trạm chuyên dụng (30 Ngày)**: Duy trì phiên đăng nhập 30 ngày dành cho máy tính cá nhân hoặc máy trạm văn phòng.

---

## 🏛️ KIẾN TRÚC HỆ THỐNG: MVC + SERVICE LAYER CHUẨN MỰC
Dự án được phân tầng nghiêm ngặt theo tiêu chuẩn phần mềm quốc tế:

```text
[ Client / View ]      (app/ & components/)
        │
        ▼ (Zod DTO Validation & Session Extraction)
[ Controller Layer ]  (actions/ & app/api/)  ──► Skinny Controllers (<25 dòng)
        │
        ▼ (Pure Business Logic & Real-time Calculations)
[ Service Layer ]     (services/)            ──► DashboardService, BillService, ExpenseService, SavingsService, ReportService
        │
        ▼ (ORM Typed Schemas & Compound Indexes)
[ Model Layer ]       (models/)              ──► Mongoose Models (User, AccessKey, Income, Bill, Expense, Budget, Savings)
        │
        ▼
[ Database ]          (MongoDB Atlas / Local)
```

- **Mọi bản ghi đều gắn `userId`**: Đảm bảo phân tách dữ liệu tuyệt đối giữa các đơn vị doanh nghiệp / người dùng.
- **Tính toán tiền tệ số nguyên**: Toàn bộ nghiệp vụ tính tiền sử dụng số nguyên (VND không có phần lẻ, định dạng `15.000.000 ₫`, `tabular-nums`).
- **Xử lý ngày đến hạn thông minh**: Tự động quy đổi ngày 29–31 cho các tháng ngắn (Ví dụ: hóa đơn ngày 31 trong tháng 2 sẽ tự động tính là ngày 28 hoặc 29).

---

## 🚀 CÁC PHÂN HỆ CHỨC NĂNG CHÍNH

### 1. Bảng Điều Khiển Tổng Quan (`/dashboard`)
- **4 Thẻ Chỉ Số Bento Grid**: Doanh thu/Thu nhập tháng, Tổng chi phí vận hành, Dòng tiền ròng còn lại, Quỹ tích lũy & Tỷ lệ tiết kiệm thực tế.
- **Khối "Khoản Sắp Đến Hạn (7 Ngày Tới)"**: Nhận diện nghĩa vụ thanh toán với 3 cấp màu cảnh báo:
  - 🔴 **Đỏ**: Quá hạn hoặc $\le 3$ ngày (Cần giải ngân khẩn cấp).
  - 🟡 **Vàng**: $\le 7$ ngày (Sắp đến hạn thanh toán).
  - 🟢 **Xanh lá**: Đã thanh toán hoặc còn xa.
- **Khối "Thu Nhập Kế Tiếp"**: Đếm ngược kỳ nhận doanh thu/lương tiếp theo kèm khuyến nghị thanh khoản.
- **Biểu Đồ Tài Chính Recharts**:
  - Biểu đồ cột 12 tháng: So sánh Thu nhập vs Chi phí & Dòng tiền ròng.
  - Biểu đồ Donut: Phân tích cơ cấu danh mục chi phí vận hành.
- **Cảnh Báo Tài Chính Thông Minh (AI Smart Alerts)**: Cảnh báo chi vượt thu, nguy cơ thiếu hụt dòng tiền trước kỳ lương, cảnh báo tỷ lệ tiết kiệm dưới chuẩn.

### 2. Doanh Thu & Thu Nhập (`/income`)
- Quản lý các nguồn thu định kỳ hàng tháng (Monthly Recurring Revenue - MRR) và thu nhập phát sinh một lần.
- Tự động lặp lại hàng tháng đối với thu nhập cố định.
- Thẻ tổng kết: Cố định hàng tháng, Phát sinh tháng này, Tổng doanh thu tháng và Ước tính doanh thu năm (ARR).

### 3. Công Nợ & Hóa Đơn Vận Hành (`/bills`)
- Quản lý toàn bộ nghĩa vụ tài chính định kỳ: thuê mặt bằng, điện toán đám mây, viễn thông, phí bản quyền.
- Nút toggle **"Đã trả" / "Chưa trả"** độc lập theo từng tháng (lưu vết trong bảng `BillPayment`).
- Sắp xếp tự động theo ngày đến hạn gần nhất và lọc theo trạng thái (Tất cả / Chưa trả / Đã trả).

### 4. Chi Phí Hàng Ngày & Ngân Sách Danh Mục (`/expenses`)
- Ghi nhận chi tiêu thực tế hàng ngày kèm danh mục, ngày chi, ghi chú và số tiền VND.
- **Hạn Mức Ngân Sách Từng Danh Mục**:
  - 🟢 **Bình thường**: Chi tiêu $< 80\%$ hạn mức.
  - 🟡 **Báo Vàng**: Chi tiêu $\ge 80\%$ hạn mức.
  - 🔴 **Báo Đỏ**: Vượt quá $100\%$ hạn mức danh mục (Cảnh báo khẩn cấp).

### 5. Quỹ Tích Lũy & Quỹ Khẩn Cấp (`/savings`)
- Thiết lập nhiều mục tiêu tiết kiệm song song với hạn chót (Deadline) cụ thể.
- **Thuật toán tự động**: Tự động tính toán `"Cần tiết kiệm X ₫/tháng để đạt đúng hạn"`.
- **Quỹ Khẩn Cấp Chuẩn Doanh Nghiệp**: Mặc định đề xuất = 6 tháng chi phí vận hành bình quân.
- Hỗ trợ Nạp tiền (`+ Nạp tích lũy`) và Rút tiền (`- Rút vốn`) có kiểm tra số dư và lưu lịch sử giao dịch.

### 6. Báo Cáo Tài Chính Tổng Hợp (`/reports`)
- Bảng cân đối tài chính ma trận 12 tháng: Thu nhập, Chi cố định, Chi linh hoạt, Tổng chi phí, Tích lũy, Còn lại, Tỷ lệ tiết kiệm %.
- Dòng **Tổng cộng cả năm** và dòng **Trung bình tháng**.
- **Xuất file CSV kế toán**: Mã hóa chuẩn UTF-8 có BOM tương thích 100% với Microsoft Excel tiếng Việt.

### 7. Hệ Thống Thông Báo Đến Hạn & Cron Job
- **Chuông thông báo trên Header**: Huy hiệu đếm số khoản cần chú ý, mở dropdown xem nhanh các khoản cấp bách.
- **Banner cảnh báo đỏ trên Dashboard**: Xuất hiện ngay khi có nghĩa vụ đến hạn hôm nay hoặc quá hạn.
- **Cron Job Tự Động (`/api/cron/reminders`)**:
  - Bảo vệ bởi `Authorization: Bearer <CRON_SECRET>`.
  - Quét các hóa đơn chưa trả sắp đến hạn trong `remindDaysBefore` ngày.
  - Gửi email tổng hợp (Resend REST API) kèm ngày nhận lương tiếp theo.

### 8. Cấu Hình Tài Khoản & Quản Trị Hệ Thống (`/settings`)
- Điều chỉnh tỷ lệ tiết kiệm mục tiêu (1–90%) và số ngày nhắc trước (1–30 ngày).
- Bật/tắt email nhắc nhở tự động.
- **Quản trị Mã Khóa**: Ban Quản Trị có quyền tạo mã khóa mới hoặc vô hiệu hóa mã khóa của nhân sự.
- **Sao lưu & Bảo mật**: Tải toàn bộ dữ liệu tài chính dạng file JSON hoặc đặt lại dữ liệu an toàn.

---

## 🛠️ HƯỚNG DẪN CÀI ĐẶT & CHẠY LOCAL

### 1. Yêu cầu môi trường
- Node.js 18.17+ hoặc 20+
- Trình quản lý gói `npm` hoặc `pnpm`
- Cơ sở dữ liệu MongoDB (MongoDB Atlas trên Cloud hoặc MongoDB Community Server cục bộ)

### 2. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` tại thư mục gốc:
```env
# MongoDB Atlas Connection URI
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/quanlytaichinh?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=supersecretrandomstringmin32charslong!finance123

# Resend API Key (Tùy chọn: dùng cho gửi email nhắc nợ tự động)
RESEND_API_KEY=re_your_api_key_here

# Cron Secret (Bảo vệ API route /api/cron/reminders)
CRON_SECRET=super_secret_cron_token_2026
```

### 4. Khởi tạo dữ liệu mẫu (Seed Data)
Chạy lệnh sau để nạp bộ dữ liệu tài chính doanh nghiệp mẫu hoàn chỉnh:
```bash
npm run seed
```

### 5. Chạy ứng dụng trên môi trường Development
```bash
npm run dev
```
Mở trình duyệt tại: **`http://localhost:3000`**  
Đăng nhập ngay bằng mã khóa: **`PROMAX-CORP-9999`**

---

## ☁️ HƯỚNG DẪN DEPLOY LÊN VERCEL

1. **Đẩy mã nguồn lên GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: promax enterprise financial management suite"
   git remote add origin https://github.com/your-username/quan-ly-tai-chinh.git
   git push -u origin main
   ```

2. **Import Dự Án trên Vercel**:
   - Truy cập [vercel.com](https://vercel.com) -> New Project -> Chọn repository vừa push.
   - Thêm các Environment Variables trong phần **Settings -> Environment Variables**:
     - `MONGODB_URI`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL` (ví dụ: `https://ten-du-an.vercel.app`)
     - `RESEND_API_KEY` (lấy từ resend.com)
     - `CRON_SECRET`

3. **Cấu hình Vercel Cron Job**:
   Dự án đã có sẵn cấu hình trong `vercel.json` để chạy tự động lúc 08:00 AM (giờ Việt Nam, tương đương 01:00 UTC):
   ```json
   {
     "crons": [
       {
         "path": "/api/cron/reminders",
         "schedule": "0 1 * * *"
       }
     ]
   }
   ```

4. **Deploy**: Bấm nút **Deploy**. Ứng dụng sẽ tự động biên dịch và sẵn sàng phục vụ.

