# QUY CHUẨN DỰ ÁN QUẢN LÝ TÀI CHÍNH (PROMAX MVC STANDARDS)

Dự án **Quản Lý Tài Chính Cá Nhân** bắt buộc tuân thủ 3 bộ tiêu chuẩn cốt lõi cao nhất:

---

## 1. Kiến Trúc MVC + Service Layer Chuẩn Mực (`@skill:mvc-architecture`)
Hệ thống tuân thủ mô hình phân tầng chặt chẽ (Separation of Concerns):

```text
[ Client / View ] (components/ & app/)
        │
        ▼ (Zod DTO Validation & Session Extraction)
[ Controller ]   (actions/ & app/api/) ──► Skinny Controllers (<25 dòng)
        │
        ▼ (Pure Business Logic & Calculations)
  [ Service ]    (services/)           ──► Xử lý dòng tiền, số dư, hạn chót
        │
        ▼ (ORM Schema & Data Persistence)
   [ Model ]     (models/)             ──► Mongoose Schemas & Typed Documents
        │
        ▼
  [ Database ]   (MongoDB Atlas)
```

- **Model (`models/`)**: Định nghĩa Schema, Type, Index, validation cơ bản của Mongoose. **CẤM** gọi HTTP, render UI hay truy cập session.
- **Service (`services/`)**: Nơi tập trung 100% nghiệp vụ (Business Rules). Tính toán thu chi, hạn mức ngân sách, cảnh báo dòng tiền, quỹ khẩn cấp.
- **Controller (`actions/` & `app/api/`)**: "Skinny Controller" – chỉ làm 3 việc: (1) Validate Zod Input, (2) Lấy `userId` từ session, (3) Gọi Service tương ứng và trả về `Result<T>`.
- **View (`components/` & `app/`)**: Giao diện thuần túy. Chỉ nhận dữ liệu đã được Service chuẩn hóa và render theo tiêu chuẩn ProMax.

---

## 2. Tiêu Chuẩn Kỹ Thuật: Viết Code Chuẩn ProMax (`@skill:viet-code-chuan`)
- **Triết lý cốt lõi**: Boy Scout Rule, KISS, DRY, YAGNI, Principle of Least Astonishment.
- **Đặt tên**: Tự giải thích ý đồ (Intention-Revealing), boolean bắt buộc có tiền tố (`is`, `has`, `can`, `should`), hàm dùng động từ rõ nghĩa.
- **Thiết kế hàm**: Tối đa 20–30 dòng, 1 trách nhiệm duy nhất (Single Responsibility), triệt tiêu Pyramid of Doom bằng **Guard Clauses / Early Return**.
- **Type Safety**: Tuyệt đối **CẤM dùng `any`**. Mọi ranh giới I/O (API, Form, LocalStorage) đều phải validate chặt chẽ bằng **Zod Schema**.
- **Xử lý lỗi**: Sử dụng Result Pattern (`{ isSuccess: true, data } | { isSuccess: false, error }`), không nuốt lỗi (No Empty Catch), phân loại Domain Exceptions và Structured Logging.
- **Độ tin cậy**: Toàn bộ nghiệp vụ tính tiền sử dụng số nguyên (VND không có phần lẻ), sẵn sàng cho Unit Testing theo mẫu Arrange - Act - Assert (AAA).

---

## 3. Tiêu Chuẩn Giao Diện: Frontend Siêu Đẹp ProMax (`@skill:frontend-sieu-dep-promax`)
- **Triết lý thẩm mỹ**: Boutique Studio Design, loại bỏ hoàn toàn các mẫu mã AI rập khuôn ("AI Slop").
- **Màu sắc & Chiều sâu**: Dark Luxury Theme (Deep Slate `#090D16`, Midnight Onyx `#030712`, viền kim loại Hairline `rgba(255,255,255,0.08)`) và Crisp Light Theme; điểm nhấn Accent tài chính tinh tế (Emerald cho thu nhập/tăng trưởng, Rose cho chi phí, Indigo cho hành động chính).
- **Bố cục**: Asymmetric Bento Grid, bề mặt liên tục, hiệu ứng Spotlight chuột phản quang trên thẻ số liệu.
- **Typography**: Phân cấp rõ rệt, font hiện đại (`Plus Jakarta Sans` / `Outfit`), số liệu tài chính bắt buộc có định dạng chuẩn tiền tệ và thuộc tính `tabular-nums` (VD: `15.000.000 ₫`).
- **Chuyển động**: 60 FPS Framer Motion (Spring physics), Stagger animation khi hiển thị danh sách giao dịch, phản hồi tức thì khi tương tác.
- **Tiêu chuẩn UI/UX**: Tối thiểu 44px vùng bấm, focus-visible rõ nét, Skeleton loading mượt mà, không giật layout (CLS = 0).
