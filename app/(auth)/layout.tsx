import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-100/90 dark:bg-[#030712] text-slate-900 dark:text-slate-100 relative overflow-hidden select-none transition-colors">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-[350px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Pure Center Content - Only the Login Frame */}
      <main className="relative z-10 w-full flex items-center justify-center">
        {children}
      </main>
    </div>
  );
}
