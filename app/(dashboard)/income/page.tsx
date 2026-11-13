"use client";

import * as React from "react";
import { Plus, RefreshCw, TrendingUp } from "lucide-react";
import { VietcombankLogo, MomoLogo } from "@/components/icons/BrandLogos";
import { IncomeSummaryCards } from "@/components/income/IncomeSummaryCards";
import { IncomeList } from "@/components/income/IncomeList";
import { IncomeFormModal } from "@/components/income/IncomeFormModal";
import { getIncomePageDataAction } from "@/actions/income";
import { type IncomeDto, type IncomeSummaryDto } from "@/services/income.service";
import { type UserIncomeWalletDto } from "@/services/bee.service";
import { UserIncomeWalletCard } from "@/components/wallet/UserIncomeWalletCard";

export default function IncomePage() {
  const [incomes, setIncomes] = React.useState<IncomeDto[]>([]);
  const [wallet, setWallet] = React.useState<UserIncomeWalletDto | null>(null);
  const [summary, setSummary] = React.useState<IncomeSummaryDto>({
    monthlyFixed: 0,
    oneTimeThisMonth: 0,
    totalThisMonth: 0,
    estimatedYearly: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingIncome, setEditingIncome] = React.useState<IncomeDto | null>(null);

  const loadData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getIncomePageDataAction();
      if (res.isSuccess) {
        setIncomes(res.data.incomes);
        setSummary(res.data.summary);
        if (res.data.wallet) {
          setWallet(res.data.wallet);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingIncome(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: IncomeDto) => {
    setEditingIncome(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Enterprise Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex items-center -space-x-2">
            <VietcombankLogo size={40} variant="square" />
            <MomoLogo size={40} variant="square" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Doanh Thu & Dòng Tiền Vào (Vietcombank & MoMo)
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#062817] text-[#7BBF34] border border-[#7BBF34]/30">
                VCB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi doanh thu cuốc xe Be, lương chuyển khoản Vietcombank và tiền về ví MoMo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            title="Đồng bộ dữ liệu"
            className="p-2.5 rounded-xl bg-[#090e17] border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi Nhận Khoản Thu Mới</span>
          </button>
        </div>
      </div>

      {/* Thẻ Ví Thu Nhập Riêng Của User & Rút Tiền */}
      {wallet && (
        <UserIncomeWalletCard
          wallet={wallet}
          onWalletUpdated={() => loadData()}
        />
      )}

      {/* 4 Cards Thống Kê Doanh Thu */}
      <IncomeSummaryCards summary={summary} />

      {/* Sổ cái nguồn thu */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
            SỔ THEO DÕI NGUỒN THU & DOANH THU ({incomes.length})
          </h3>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-[#090e17] border border-white/[0.08] animate-pulse" />
            ))}
          </div>
        ) : (
          <IncomeList
            incomes={incomes}
            onEdit={handleEdit}
            onRefresh={loadData}
            onAddNew={handleOpenAdd}
          />
        )}
      </div>

      {/* Form Modal Thêm/Sửa */}
      <IncomeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        editingIncome={editingIncome}
      />
    </div>
  );
}
