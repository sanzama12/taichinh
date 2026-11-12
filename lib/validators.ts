import { z } from "zod";

/**
 * Schema đăng nhập bằng Mã Khóa Truy Cập (Access Key) do Admin cấp
 * Hỗ trợ tùy chọn ghi nhớ phiên đăng nhập: 1 ngày hoặc 30 ngày
 */
export const AccessKeyLoginSchema = z.object({
  key: z
    .string()
    .trim()
    .min(3, "Vui lòng nhập Mã khóa truy cập hợp lệ (tối thiểu 3 ký tự)")
    .toUpperCase(),
  rememberDays: z.coerce.number().default(30),
});
export type AccessKeyLoginInput = z.infer<typeof AccessKeyLoginSchema>;

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  email: z.string().trim().email("Email không hợp lệ").toLowerCase(),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().trim().email("Email không hợp lệ").toLowerCase().optional(),
  password: z.string().optional(),
  key: z.string().optional(),
  rememberDays: z.coerce.number().optional().default(30),
});
export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Regex kiểm tra số điện thoại:
 * Bắt buộc đúng 10 chữ số và bắt đầu bằng số 0 (Ví dụ: 0912345678, 0388889999).
 */
export const STRICT_PHONE_10_DIGITS_REGEX = /^0[0-9]{9}$/;
export const VIETNAM_PHONE_REGEX = STRICT_PHONE_10_DIGITS_REGEX;

export const UserProfileSchema = z.object({
  name: z.string().trim().min(2, "Họ tên phải có ít nhất 2 ký tự").max(60, "Họ tên tối đa 60 ký tự"),
  birthYear: z.coerce
    .number()
    .int("Năm sinh phải là số nguyên")
    .min(1900, "Năm sinh không hợp lệ")
    .max(new Date().getFullYear(), "Năm sinh không thể lớn hơn năm hiện tại")
    .optional(),
  age: z.coerce
    .number()
    .int("Tuổi phải là số nguyên")
    .min(1, "Tuổi phải từ 1 trở lên")
    .max(120, "Tuổi không hợp lệ")
    .optional(),
  avatar: z.string().trim().optional(),
  address: z.string().trim().min(2, "Vui lòng nhập nơi ở / địa chỉ hợp lệ").max(200, "Địa chỉ tối đa 200 ký tự").optional(),
  phone: z
    .string()
    .trim()
    .regex(STRICT_PHONE_10_DIGITS_REGEX, "Số điện thoại bắt buộc phải có đúng 10 chữ số và bắt đầu bằng số 0 (Ví dụ: 0912345678)"),
  email: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  savingsRatePercent: z.coerce.number().min(0).max(100).default(20),
  remindDaysBefore: z.coerce.number().min(1).max(30).default(3),
  emailReminder: z.boolean().default(true),
});
export type UserProfileInput = z.infer<typeof UserProfileSchema>;

export const UserSettingsSchema = z.object({
  savingsRatePercent: z.number().min(0).max(100).default(20),
  remindDaysBefore: z.number().min(1).max(30).default(3),
  emailReminder: z.boolean().default(true),
  currency: z.literal("VND").default("VND"),
});
export type UserSettingsInput = z.infer<typeof UserSettingsSchema>;

export const IncomeSchema = z.object({
  name: z.string().trim().min(1, "Tên nguồn thu không được để trống"),
  amount: z.coerce.number().int("Số tiền phải là số nguyên").positive("Số tiền phải lớn hơn 0"),
  type: z.enum(["monthly", "oneTime"]).default("monthly"),
  dayOfMonth: z.coerce.number().int().min(1).max(31).default(1),
  date: z.coerce.date().optional(),
  note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự").optional(),
});
export type IncomeInput = z.infer<typeof IncomeSchema>;

export const BillSchema = z.object({
  name: z.string().trim().min(1, "Tên khoản phải trả không được để trống"),
  amount: z.coerce.number().int("Số tiền phải là số nguyên").positive("Số tiền phải lớn hơn 0"),
  dueDay: z.coerce.number().int().min(1).max(31, "Ngày đến hạn từ 1 đến 31"),
  category: z.string().trim().min(1, "Danh mục không được để trống").default("Hóa đơn"),
  note: z.string().trim().max(500).optional(),
  isActive: z.boolean().default(true),
});
export type BillInput = z.infer<typeof BillSchema>;

export const ExpenseSchema = z.object({
  date: z.coerce.date({ required_error: "Vui lòng chọn ngày chi tiêu" }),
  amount: z.coerce.number().int("Số tiền phải là số nguyên").positive("Số tiền phải lớn hơn 0"),
  category: z.string().trim().min(1, "Vui lòng chọn danh mục chi tiêu"),
  note: z.string().trim().max(500).optional(),
});
export type ExpenseInput = z.infer<typeof ExpenseSchema>;

export const BudgetSchema = z.object({
  category: z.string().trim().min(1, "Vui lòng nhập tên danh mục"),
  monthlyLimit: z.coerce.number().int().positive("Hạn mức phải lớn hơn 0"),
});
export type BudgetInput = z.infer<typeof BudgetSchema>;

export const SavingsGoalSchema = z.object({
  name: z.string().trim().min(1, "Tên mục tiêu không được để trống"),
  targetAmount: z.coerce.number().int().positive("Số tiền mục tiêu phải lớn hơn 0"),
  dailyTarget: z.coerce.number().int().min(0).optional().default(0),
  currentAmount: z.coerce.number().int().min(0, "Số tiền hiện tại không được âm").default(0),
  deadline: z.coerce.date({ required_error: "Vui lòng chọn hạn chót" }),
});
export type SavingsGoalInput = z.infer<typeof SavingsGoalSchema>;

export const SavingsTransactionSchema = z.object({
  goalId: z.string().min(1, "Mục tiêu không hợp lệ"),
  type: z.enum(["deposit", "withdraw"]),
  amount: z.coerce.number().int().positive("Số tiền giao dịch phải lớn hơn 0"),
  date: z.coerce.date().default(() => new Date()),
  note: z.string().trim().max(500).optional(),
});
export type SavingsTransactionInput = z.infer<typeof SavingsTransactionSchema>;

export const BeeOrderSchema = z.object({
  orderCode: z.string().trim().min(1, "Mã đơn không được để trống"),
  serviceType: z
    .enum([
      "beBike",
      "beDeliveryExpress",
      "beDeliveryEconomy",
      "beDeliveryCorporate",
      "beDelivery",
      "beCar",
      "beFood",
    ])
    .default("beBike"),
  customerFare: z.coerce.number().int().min(0, "Cước khách trả không được âm"),
  platformFee: z.coerce.number().int().min(0, "Phí sàn không được âm").default(0),
  taxTncn: z.coerce.number().int().min(0, "Thuế TNCN không được âm").default(0),
  driverEarnings: z.coerce.number().int().min(0, "Thu nhập tài xế không được âm"),
  tip: z.coerce.number().int().min(0, "Tiền boa không được âm").default(0),
  tripCount: z.coerce.number().int().min(1, "Số cuốc tối thiểu là 1").default(1),
  distanceKm: z.coerce.number().min(0).default(0),
  orderDate: z.coerce.date().default(() => new Date()),
  tripTime: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
  note: z.string().trim().max(500).optional(),
});
export type BeeOrderInput = z.infer<typeof BeeOrderSchema>;

export const FuelLogSchema = z.object({
  amount: z.coerce.number().int().positive("Số tiền đổ xăng phải lớn hơn 0"),
  liters: z.coerce.number().positive("Số lít xăng phải lớn hơn 0"),
  pricePerLiter: z.coerce.number().min(0).optional().default(0),
  odoKm: z.coerce.number().min(0).optional().default(0),
  fuelType: z.enum(["RON 95", "E5 RON 92", "Dầu DO"]).default("RON 95"),
  gasStation: z.string().trim().optional(),
  date: z.coerce.date().default(() => new Date()),
  note: z.string().trim().max(500).optional(),
});
export type FuelLogInput = z.infer<typeof FuelLogSchema>;

export const BonusLogSchema = z.object({
  title: z.string().trim().min(1, "Tên chương trình thưởng không được để trống"),
  amount: z.coerce.number().int().positive("Số tiền thưởng phải lớn hơn 0"),
  bonusType: z.enum(["milestone", "weekly", "peakHour", "weather", "other"]).default("milestone"),
  date: z.coerce.date().default(() => new Date()),
  status: z.enum(["received", "pending"]).default("received"),
  targetTrips: z.coerce.number().int().min(0).optional().default(0),
  note: z.string().trim().max(500).optional(),
});
export type BonusLogInput = z.infer<typeof BonusLogSchema>;

export const DebtSchema = z.object({
  title: z.string().trim().min(1, "Tên khoản nợ / chủ nợ không được để trống"),
  totalAmount: z.coerce.number().int().positive("Tổng số nợ phải lớn hơn 0"),
  paidAmount: z.coerce.number().int().min(0).default(0),
  monthlyPayment: z.coerce.number().int().min(0).default(0),
  dueDay: z.coerce.number().int().min(1).max(31).default(1),
  nextDueDate: z.coerce.date().optional(),
  interestRate: z.coerce.number().min(0).optional().default(0),
  category: z.enum([
    "vehicle_installment",
    "app_advance",
    "bank_loan",
    "personal_loan",
    "credit_card",
    "other",
  ]).default("vehicle_installment"),
  note: z.string().trim().max(500).optional(),
});
export type DebtInput = z.infer<typeof DebtSchema>;

export const DebtPaymentSchema = z.object({
  debtId: z.string().min(1, "Khoản nợ không hợp lệ"),
  amount: z.coerce.number().int().positive("Số tiền trả phải lớn hơn 0"),
  date: z.coerce.date().default(() => new Date()),
  note: z.string().trim().max(500).optional(),
});
export type DebtPaymentInput = z.infer<typeof DebtPaymentSchema>;

export const TicketSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề phải có ít nhất 3 ký tự").max(120),
  category: z.enum(["order", "income", "debt", "wallet", "other"]),
  message: z.string().trim().min(10, "Nội dung phải có ít nhất 10 ký tự").max(2_000),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});
export type TicketInput = z.infer<typeof TicketSchema>;

const AdminUserBaseSchema = z.object({
  name: z.string().trim().min(2, "Tên thành viên phải có ít nhất 2 ký tự").max(80),
  key: z
    .string()
    .trim()
    .min(3, "Mã khóa phải có ít nhất 3 ký tự")
    .max(64)
    .regex(/^[A-Za-z0-9-]+$/, "Mã khóa chỉ được chứa chữ, số và dấu gạch ngang")
    .transform((value) => value.toUpperCase()),
  role: z.enum(["admin", "user"]),
  phone: z
    .string()
    .trim()
    .refine((value) => value === "" || STRICT_PHONE_10_DIGITS_REGEX.test(value), {
      message: "Số điện thoại phải có đúng 10 chữ số và bắt đầu bằng 0",
    })
    .optional(),
  email: z.string().trim().email("Email không hợp lệ").or(z.literal("")).optional(),
  balance: z.coerce.number().int().min(0, "Số dư ví không được âm").max(Number.MAX_SAFE_INTEGER),
  permissions: z.record(z.boolean()).optional(),
});

export const AdminCreateUserSchema = AdminUserBaseSchema.omit({ email: true });
export type AdminCreateUserInput = z.infer<typeof AdminCreateUserSchema>;

export const AdminUpdateUserSchema = AdminUserBaseSchema.extend({
  isActive: z.boolean(),
});
export type AdminUpdateUserInput = z.infer<typeof AdminUpdateUserSchema>;
