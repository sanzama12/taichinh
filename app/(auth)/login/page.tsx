import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Đăng Nhập | Tài Chính ProMax",
  description: "Đăng nhập hệ thống quản lý tài chính cá nhân",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md h-[450px] rounded-3xl bg-card/60 backdrop-blur-xl border border-white/10 animate-pulse" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
