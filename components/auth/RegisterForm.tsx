"use client";

import Link from "next/link";
import { KeyRound, ArrowRight, ShieldAlert } from "lucide-react";

export function RegisterForm() {
  return (
    <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-card/85 backdrop-blur-2xl border border-white/10 dark:border-white/[0.08] shadow-2xl text-center">
      <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-4">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Hệ Thống Khóa Riêng Tư
      </h1>
      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
        Ứng dụng quản lý tài chính cá nhân không mở đăng ký tự do để đảm bảo an toàn dữ liệu tối đa.
        Vui lòng liên hệ <span className="font-semibold text-foreground">Quản Trị Viên (Admin)</span> để được cấp Mã Khóa Truy Cập (Access Key).
      </p>

      <div className="mt-8">
        <Link
          href="/login"
          className="w-full h-12 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-105 active:scale-95"
        >
          <KeyRound className="w-4 h-4" />
          <span>Nhập Mã Khóa Để Vào Hệ Thống</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
