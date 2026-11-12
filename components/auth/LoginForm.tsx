"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Building2,
  KeyRound,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Check,
  X,
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [accessKey, setAccessKey] = React.useState("");
  const [rememberDays, setRememberDays] = React.useState<1 | 30>(30);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanKey = accessKey.trim().replace(/[\s\-\.]/g, "");
    if (!cleanKey || cleanKey.length < 3) {
      toast.error("Vui lòng nhập số điện thoại hoặc mã khóa hợp lệ");
      return;
    }

    try {
      setIsLoading(true);

      const res = await signIn("access-key", {
        key: cleanKey,
        rememberDays: rememberDays.toString(),
        redirect: false,
        callbackUrl,
      });

      if (!res || res.error) {
        toast.error("Xác thực thất bại", {
          description:
            res?.error || "Mã khóa không tồn tại hoặc đã hết hạn bản quyền.",
        });
        setIsLoading(false);
        return;
      }

      toast.success("Xác thực thành công", {
        description: `Quyền truy cập hợp lệ. Phiên làm việc được duy trì ${rememberDays} ngày.`,
      });

      router.push(callbackUrl);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Đã xảy ra lỗi kết nối máy chủ xác thực.");
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-[460px] p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#090e17]/95 border border-slate-200 dark:border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative transition-colors"
    >
      {/* Top Header: Brand & Security Badge */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[12px] font-bold tracking-wider uppercase text-slate-900 dark:text-white font-mono">
              PROMAX FINANCE
            </div>
            <div className="text-[9px] font-mono text-slate-500 tracking-wider">
              ROBOTO UI EDITION
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>GATEWAY ONLINE</span>
        </div>
      </div>

      {/* Main Title */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <span>Cổng Đăng Nhập Hệ Thống</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
          Nhập số điện thoại đã được Ban Quản Trị kích hoạt để mở khóa tài khoản và điều hành dòng tiền.
        </p>
      </div>

      {/* Form Đăng Nhập */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Số Điện Thoại */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold block">
            SỐ ĐIỆN THOẠI ĐĂNG NHẬP
          </label>

          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>

            <input
              type="text"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value.replace(/[\s\-\.]/g, ""))}
              placeholder="Nhập số điện thoại đăng nhập (VD: 09xxxxxxxx)..."
              required
              disabled={isLoading}
              autoFocus
              className="w-full h-12 pl-11 pr-10 rounded-xl bg-slate-50 dark:bg-[#05080f] border border-slate-300 dark:border-white/10 focus:bg-white dark:focus:bg-[#05080f] focus:border-blue-600 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-500/20 text-slate-900 dark:text-white font-mono text-sm tracking-wider font-bold transition-all outline-hidden placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal"
            />

            {accessKey && (
              <button
                type="button"
                onClick={() => setAccessKey("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                title="Xóa mã"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Chế độ thiết bị truy cập: 1 Ngày vs 30 Ngày */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-slate-400 block font-bold">
            THỜI GIAN DUY TRÌ PHIÊN
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRememberDays(1)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                rememberDays === 1
                  ? "bg-blue-50 border-blue-500 text-slate-900 dark:bg-blue-500/10 dark:border-blue-500 dark:text-white shadow-xs"
                  : "bg-slate-50 dark:bg-[#05080f] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold block">1 Ngày</span>
                {rememberDays === 1 && (
                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Ca làm việc / Máy chung
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRememberDays(30)}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                rememberDays === 30
                  ? "bg-blue-50 border-blue-500 text-slate-900 dark:bg-blue-500/10 dark:border-blue-500 dark:text-white shadow-xs"
                  : "bg-slate-50 dark:bg-[#05080f] border-slate-200 dark:border-white/[0.06] text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold block text-blue-600 dark:text-blue-400">
                  30 Ngày
                </span>
                {rememberDays === 30 && (
                  <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Máy trạm chuyên dụng
              </span>
            </button>
          </div>
        </div>

        {/* Nút Xác Thực Mở Khóa */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/25 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Đang xác thực quyền truy cập...</span>
            </>
          ) : (
            <>
              <span>Xác Thực & Mở Khóa Hệ Thống</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Micro-footer inside card */}
      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/[0.04] text-center text-[10px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>Bảo mật nội bộ • Chuẩn số liệu VND • Roboto Font</span>
      </div>
    </motion.div>
  );
}
