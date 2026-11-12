"use client";

import { format } from "date-fns";
import { History, PlusCircle, MinusCircle, Calendar, Target } from "lucide-react";
import { formatCurrencyVND } from "@/lib/utils";
import { type SavingsTransactionDto } from "@/services/savings.service";

interface SavingsTransactionHistoryProps {
  transactions: SavingsTransactionDto[];
}

export function SavingsTransactionHistory({ transactions }: SavingsTransactionHistoryProps) {
  return (
    <div className="p-6 rounded-2xl bg-[#090e17] border border-white/[0.08] shadow-md">
      <div className="flex items-center gap-2 pb-4 border-b border-white/[0.06]">
        <History className="w-5 h-5 text-blue-400" />
        <h3 className="font-bold text-sm text-white uppercase tracking-wider font-mono">
          LỊCH SỬ BIẾN ĐỘNG NẠP / RÚT TÍCH LŨY
        </h3>
      </div>

      {transactions.length === 0 ? (
        <div className="py-10 text-center text-slate-400 text-xs">
          <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <span>Chưa có giao dịch nạp hoặc rút tiền nào được ghi nhận.</span>
        </div>
      ) : (
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-3 font-semibold">Thời gian</th>
                <th className="py-3 px-3 font-semibold">Mục tiêu</th>
                <th className="py-3 px-3 font-semibold">Loại giao dịch</th>
                <th className="py-3 px-3 font-semibold">Diễn giải</th>
                <th className="py-3 px-3 font-semibold text-right">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {transactions.map((tx) => {
                const dateObj = new Date(tx.date);
                const formattedDate = format(dateObj, "dd/MM/yyyy");
                const isDeposit = tx.type === "deposit";

                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{formattedDate}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-white font-medium">
                        <Target className="w-3.5 h-3.5 text-blue-400" />
                        <span>{tx.goalName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      {isDeposit ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                          <PlusCircle className="w-3 h-3" /> NẠP TIỀN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[10px]">
                          <MinusCircle className="w-3 h-3" /> RÚT TIỀN
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                      {tx.note || <span className="text-slate-600 italic">Không có ghi chú</span>}
                    </td>

                    <td
                      className={`py-3 px-3 text-right whitespace-nowrap font-bold font-mono tabular-nums text-sm ${
                        isDeposit ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isDeposit ? "+" : "-"}
                      {formatCurrencyVND(tx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

