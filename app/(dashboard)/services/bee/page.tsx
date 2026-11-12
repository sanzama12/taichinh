"use client";

import * as React from "react";
import {
  PlusCircle,
  RefreshCw,
  Trash2,
  TrendingUp,
  Receipt,
  Gift,
  Car,
  Package,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Bike,
  Layers,
  Zap,
  Building2,
  Clock,
  Calendar,
  Camera,
  Image as ImageIcon,
  UploadCloud,
  Eye,
  Download,
  List,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { formatCurrencyVND } from "@/lib/utils";
import {
  getBeePageDataAction,
  createBeeOrderAction,
  deleteBeeOrderAction,
} from "@/actions/bee";
import {
  type BeeOrderDto,
  type BeeSummaryDto,
  type UserIncomeWalletDto,
} from "@/services/bee.service";
import { type BeeServiceType } from "@/models/BeeOrder";
import { toast } from "sonner";
import { triggerRealtimeSync, useRealtimeSync } from "@/lib/realtime-sync";
import { UserIncomeWalletCard } from "@/components/wallet/UserIncomeWalletCard";
import {
  BeeIconSvg,
  BeBikeIcon,
  BeExpressIcon,
  BeEconomyIcon,
  BeCorporateIcon,
} from "@/components/icons/BeeLogo";

function BeeOrdersSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      <div className="h-10 bg-slate-200 dark:bg-white/5 rounded-2xl w-1/4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-200 dark:bg-white/5 rounded-3xl" />
        ))}
      </div>
      <div className="h-96 bg-slate-200 dark:bg-white/5 rounded-2xl" />
    </div>
  );
}

interface ImageLightboxData {
  url: string;
  orderCode: string;
  orderDate: string;
  tripTime?: string;
  serviceType: string;
  driverEarnings: number;
}

interface DayGroup {
  dateKey: string;
  displayDate: string;
  orders: BeeOrderDto[];
  totalEarnings: number;
  totalCustomerFare: number;
  totalPlatformFee: number;
  totalTaxTncn: number;
  totalTip: number;
  tripCount: number;
}

function BeeOrdersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramType = searchParams.get("type");

  const now = new Date();
  const [month, setMonth] = React.useState(now.getMonth() + 1);
  const [year, setYear] = React.useState(now.getFullYear());

  const [orders, setOrders] = React.useState<BeeOrderDto[]>([]);
  const [summary, setSummary] = React.useState<BeeSummaryDto>({
    totalEarnings: 0,
    totalCustomerFare: 0,
    totalPlatformFee: 0,
    totalTaxTncn: 0,
    totalTip: 0,
    totalTrips: 0,
    avgFeePercent: 0,
    netPerHourEstimate: 0,
  });

  const [selectedTab, setSelectedTab] = React.useState<string>("all");
  const [wallet, setWallet] = React.useState<UserIncomeWalletDto | null>(null);
  const [viewMode, setViewMode] = React.useState<"timeline" | "table">("timeline");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Lightbox Modal phóng to ảnh cuốc xe
  const [lightboxData, setLightboxData] = React.useState<ImageLightboxData | null>(null);

  // Form states
  const [orderCode, setOrderCode] = React.useState("");
  const [serviceType, setServiceType] = React.useState<BeeServiceType>("beBike");
  const [customerFare, setCustomerFare] = React.useState<string>("");
  const [platformFee, setPlatformFee] = React.useState<string>("");
  const [taxTncn, setTaxTncn] = React.useState<string>("");
  const [driverEarnings, setDriverEarnings] = React.useState<string>("");
  const [tip, setTip] = React.useState<string>("0");
  const [tripCount, setTripCount] = React.useState<string>("1");
  const [distanceKm, setDistanceKm] = React.useState<string>("");
  const [orderDate, setOrderDate] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [tripTime, setTripTime] = React.useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [imageUrl, setImageUrl] = React.useState<string>("");
  const [note, setNote] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Đồng bộ URL query param ?type= vào selectedTab
  React.useEffect(() => {
    if (paramType) {
      setSelectedTab(paramType);
      if (
        [
          "beBike",
          "beDeliveryExpress",
          "beDeliveryEconomy",
          "beDeliveryCorporate",
        ].includes(paramType)
      ) {
        setServiceType(paramType as BeeServiceType);
      }
    } else {
      setSelectedTab("all");
    }
  }, [paramType]);

  const loadData = React.useCallback(async (m: number, y: number) => {
    try {
      setIsLoading(true);
      const res = await getBeePageDataAction(m, y);
      if (res.isSuccess) {
        setOrders(res.data.orders);
        setSummary(res.data.summary);
        if (res.data.wallet) {
          setWallet(res.data.wallet);
        }
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData(month, year);
  }, [month, year, loadData]);

  useRealtimeSync(() => loadData(month, year), 20000);

  const bikeOrders = orders.filter((o) => o.serviceType === "beBike");
  const expressOrders = orders.filter((o) => o.serviceType === "beDeliveryExpress");
  const economyOrders = orders.filter((o) => o.serviceType === "beDeliveryEconomy");
  const corporateOrders = orders.filter((o) => o.serviceType === "beDeliveryCorporate");

  const displayOrders = React.useMemo(() => {
    if (selectedTab === "all") return orders;
    return orders.filter((o) => o.serviceType === selectedTab);
  }, [orders, selectedTab]);

  // Gom nhóm cuốc xe theo ngày
  const dailyGroups = React.useMemo<DayGroup[]>(() => {
    const map = new Map<string, BeeOrderDto[]>();

    displayOrders.forEach((order) => {
      const d = new Date(order.orderDate);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateKey = `${yyyy}-${mm}-${dd}`;

      const existing = map.get(dateKey) || [];
      existing.push(order);
      map.set(dateKey, existing);
    });

    const groups: DayGroup[] = [];

    map.forEach((dayOrders, dateKey) => {
      dayOrders.sort((a, b) => {
        const timeA = a.tripTime || "00:00";
        const timeB = b.tripTime || "00:00";
        return timeB.localeCompare(timeA);
      });

      const totalEarnings = dayOrders.reduce((s, o) => s + o.driverEarnings, 0);
      const totalCustomerFare = dayOrders.reduce((s, o) => s + o.customerFare, 0);
      const totalPlatformFee = dayOrders.reduce((s, o) => s + o.platformFee, 0);
      const totalTaxTncn = dayOrders.reduce((s, o) => s + (o.taxTncn || 0), 0);
      const totalTip = dayOrders.reduce((s, o) => s + o.tip, 0);
      const tripCount = dayOrders.reduce((s, o) => s + o.tripCount, 0);

      const [yStr, mStr, dStr] = dateKey.split("-");
      const parsedDate = new Date(Number(yStr), Number(mStr) - 1, Number(dStr));
      const dayOfWeek = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"][
        parsedDate.getDay()
      ];
      const displayDate = `${dayOfWeek}, ${dStr}/${mStr}/${yStr}`;

      groups.push({
        dateKey,
        displayDate,
        orders: dayOrders,
        totalEarnings,
        totalCustomerFare,
        totalPlatformFee,
        totalTaxTncn,
        totalTip,
        tripCount,
      });
    });

    groups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
    return groups;
  }, [displayOrders]);

  const displaySummary = React.useMemo(() => {
    if (selectedTab === "all") return summary;
    const filtered = displayOrders;
    const totalEarnings = filtered.reduce((s, o) => s + o.driverEarnings, 0);
    const totalCustomerFare = filtered.reduce((s, o) => s + o.customerFare, 0);
    const totalPlatformFee = filtered.reduce((s, o) => s + o.platformFee, 0);
    const totalTaxTncn = filtered.reduce((s, o) => s + (o.taxTncn || 0), 0);
    const totalTip = filtered.reduce((s, o) => s + o.tip, 0);
    const totalTrips = filtered.reduce((s, o) => s + o.tripCount, 0);
    const avgFeePercent =
      totalCustomerFare > 0
        ? Math.round((totalPlatformFee / totalCustomerFare) * 100)
        : 0;
    const netPerHourEstimate =
      totalTrips > 0 ? Math.round(totalEarnings / totalTrips) : 0;

    return {
      totalEarnings,
      totalCustomerFare,
      totalPlatformFee,
      totalTaxTncn,
      totalTip,
      totalTrips,
      avgFeePercent,
      netPerHourEstimate,
    };
  }, [orders, summary, selectedTab, displayOrders]);

  const handleTabChange = (tabId: string) => {
    setSelectedTab(tabId);
    if (
      [
        "beBike",
        "beDeliveryExpress",
        "beDeliveryEconomy",
        "beDeliveryCorporate",
      ].includes(tabId)
    ) {
      setServiceType(tabId as BeeServiceType);
      router.replace(`/services/bee?type=${tabId}`, { scroll: false });
    } else {
      router.replace("/services/bee", { scroll: false });
    }
  };

  const recalculateEarnings = (fareStr: string, feeStr: string, taxStr: string) => {
    const fareNum = parseInt(fareStr.replace(/\D/g, ""), 10) || 0;
    const feeNum = parseInt(feeStr.replace(/\D/g, ""), 10) || 0;
    const taxNum = parseInt(taxStr.replace(/\D/g, ""), 10) || 0;
    const net = Math.max(0, fareNum - feeNum - taxNum);
    setDriverEarnings(net > 0 ? String(net) : "");
  };

  const handleCustomerFareChange = (val: string) => {
    setCustomerFare(val);
    const fareNum = parseInt(val.replace(/\D/g, ""), 10) || 0;
    const estimatedFee = Math.round(fareNum * 0.262);
    setPlatformFee(estimatedFee > 0 ? String(estimatedFee) : "");
    // Thuế TNCN Be: 1.5% doanh thu
    const estimatedTax = Math.round(fareNum * 0.015);
    setTaxTncn(estimatedTax > 0 ? String(estimatedTax) : "");
    const estimatedNet = Math.max(0, fareNum - estimatedFee - estimatedTax);
    setDriverEarnings(estimatedNet > 0 ? String(estimatedNet) : "");
  };

  const handlePlatformFeeChange = (val: string) => {
    setPlatformFee(val);
    recalculateEarnings(customerFare, val, taxTncn);
  };

  const handleTaxTncnChange = (val: string) => {
    setTaxTncn(val);
    recalculateEarnings(customerFare, platformFee, val);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp ảnh");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxDimension = 1000;
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          setImageUrl(canvas.toDataURL("image/jpeg", 0.82));
          toast.success("Đã chọn ảnh cuốc xe");
        } else {
          setImageUrl(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const fareNum = parseInt(customerFare.replace(/\D/g, ""), 10);
    if (!fareNum || fareNum <= 0) {
      toast.error("Vui lòng nhập cước phí");
      return;
    }

    const feeNum = parseInt(platformFee.replace(/\D/g, ""), 10) || 0;
    const taxNum = parseInt(taxTncn.replace(/\D/g, ""), 10) || 0;
    const earningsNum =
      parseInt(driverEarnings.replace(/\D/g, ""), 10) ||
      Math.max(0, fareNum - feeNum - taxNum);
    const tipNum = parseInt(tip.replace(/\D/g, ""), 10) || 0;
    const tripsNum = parseInt(tripCount, 10) || 1;
    const distanceNum = parseFloat(distanceKm) || 0;

    const generatedCode =
      orderCode.trim() || `BE-${Date.now().toString().slice(-6)}`;

    try {
      setIsSubmitting(true);
      const res = await createBeeOrderAction({
        orderCode: generatedCode,
        serviceType,
        customerFare: fareNum,
        platformFee: feeNum,
        taxTncn: taxNum,
        driverEarnings: earningsNum,
        tip: tipNum,
        tripCount: tripsNum,
        distanceKm: distanceNum,
        orderDate: new Date(orderDate),
        tripTime: tripTime || undefined,
        imageUrl: imageUrl || undefined,
        note: note.trim() || undefined,
      });

      if (res.isSuccess) {
        toast.success(`Đã thêm cuốc [${generatedCode}]`);
        setIsModalOpen(false);
        setOrderCode("");
        setCustomerFare("");
        setPlatformFee("");
        setTaxTncn("");
        setDriverEarnings("");
        setTip("0");
        setDistanceKm("");
        setImageUrl("");
        setNote("");
        loadData(month, year);
        triggerRealtimeSync("bee_order_created");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi tạo đơn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Xóa cuốc [${code}]?`)) return;
    try {
      const res = await deleteBeeOrderAction(id);
      if (res.isSuccess) {
        toast.success(`Đã xóa cuốc ${code}`);
        loadData(month, year);
        triggerRealtimeSync("bee_order_deleted");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("Lỗi khi xóa");
    }
  };

  const getServiceBadge = (type: string) => {
    switch (type) {
      case "beBike":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold bg-[#FFC700]/20 text-[#854D0E] dark:text-[#FDE047] border border-[#FFC700]/40">
            <BeBikeIcon size={13} />
            <span>beBike</span>
          </span>
        );
      case "beDeliveryExpress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
            <BeExpressIcon size={13} />
            <span>be Siêu Tốc</span>
          </span>
        );
      case "beDeliveryEconomy":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
            <BeEconomyIcon size={13} />
            <span>be Tiết Kiệm</span>
          </span>
        );
      case "beDeliveryCorporate":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
            <BeCorporateIcon size={13} />
            <span>be Doanh Nghiệp</span>
          </span>
        );
      case "beDelivery":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200">
            <Package className="w-3 h-3 text-emerald-600" />
            <span>beDelivery</span>
          </span>
        );
      case "beCar":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200">
            <Car className="w-3 h-3 text-blue-600" />
            <span>beCar</span>
          </span>
        );
      case "beFood":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300 border border-orange-200">
            <Utensils className="w-3 h-3 text-orange-600" />
            <span>beFood</span>
          </span>
        );
      default:
        return <span>{type}</span>;
    }
  };

  const serviceTabs = [
    {
      id: "all",
      label: "Tất Cả",
      count: orders.length,
      icon: <Layers className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />,
      activeClass:
        "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs font-bold",
    },
    {
      id: "beBike",
      label: "beBike",
      count: bikeOrders.length,
      icon: <BeBikeIcon size={15} />,
      activeClass:
        "bg-[#FFC700] text-[#111827] border-[#FFC700] font-bold shadow-xs",
    },
    {
      id: "beDeliveryExpress",
      label: "be Siêu Tốc",
      count: expressOrders.length,
      icon: <BeExpressIcon size={15} />,
      activeClass:
        "bg-rose-500 text-white border-rose-600 font-bold shadow-xs",
    },
    {
      id: "beDeliveryEconomy",
      label: "be Tiết Kiệm",
      count: economyOrders.length,
      icon: <BeEconomyIcon size={15} />,
      activeClass:
        "bg-emerald-600 text-white border-emerald-700 font-bold shadow-xs",
    },
    {
      id: "beDeliveryCorporate",
      label: "be Doanh Nghiệp",
      count: corporateOrders.length,
      icon: <BeCorporateIcon size={15} />,
      activeClass:
        "bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs",
    },
  ];

  return (
    <div className="space-y-5 pb-12">
      {/* 1. Header tinh gọn */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <div className="rounded-xl overflow-hidden shrink-0 border border-amber-300 dark:border-amber-400/30">
            <BeeIconSvg size={36} variant="badge" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Thu Nhập Be
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Báo cáo cuốc xe và dòng tiền thực nhận
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const d = new Date();
            setTripTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFC700] hover:bg-[#FBBF24] text-[#111827] font-bold text-xs shadow-xs transition-all cursor-pointer border border-amber-400"
        >
          <PlusCircle className="w-4 h-4 stroke-[2.5]" />
          <span>+ Thêm Cuốc</span>
        </button>
      </div>

      {/* 1.5. Thẻ Ví Thu Nhập Riêng Của User */}
      {wallet && <UserIncomeWalletCard wallet={wallet} />}

      {/* 2. Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (month === 1) {
                setMonth(12);
                setYear((y) => y - 1);
              } else setMonth((m) => m - 1);
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-3 py-1 rounded-lg bg-[#FFC700]/10 border border-[#FFC700]/30 font-mono font-bold text-xs text-amber-900 dark:text-amber-300">
            Tháng {month}/{year}
          </span>
          <button
            onClick={() => {
              if (month === 12) {
                setMonth(1);
                setYear((y) => y + 1);
              } else setMonth((m) => m + 1);
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút chuyển đổi View Mode */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "timeline"
                  ? "bg-white dark:bg-[#0c121e] text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
              <span>Báo Cáo Ngày</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-white dark:bg-[#0c121e] text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <List className="w-3.5 h-3.5 text-blue-500" />
              <span>Bảng</span>
            </button>
          </div>

          <button
            onClick={() => loadData(month, year)}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* 2.5 Thanh Tab lọc dịch vụ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {serviceTabs.map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all cursor-pointer shrink-0 ${
                isActive
                  ? tab.activeClass
                  : "bg-white dark:bg-[#0c121e] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold bg-black/10 dark:bg-white/10">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Bento Cards tóm tắt ngắn gọn */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Thực Nhận */}
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-500/10 border-2 border-[#FFC700] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
            <span>THỰC NHẬN</span>
            <BeeIconSvg size={18} variant="square" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#B45309] dark:text-[#FBBF24] tabular-nums">
            {formatCurrencyVND(displaySummary.totalEarnings)}
          </div>
          <div className="text-[11px] text-amber-800 dark:text-amber-300/80">
            Chiết khấu: {displaySummary.avgFeePercent}%
          </div>
        </div>

        {/* Card 2: Cước Khách */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>CƯỚC KHÁCH</span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {formatCurrencyVND(displaySummary.totalCustomerFare)}
          </div>
          <div className="text-[11px] font-mono space-y-0.5">
            <div className="text-rose-500">Phí sàn: -{formatCurrencyVND(displaySummary.totalPlatformFee)}</div>
            {displaySummary.totalTaxTncn > 0 && (
              <div className="text-amber-600 dark:text-amber-400">Thuế TNCN: -{formatCurrencyVND(displaySummary.totalTaxTncn)}</div>
            )}
          </div>
        </div>

        {/* Card 3: Tiền Tip */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>TIỀN TIP</span>
            <Gift className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{formatCurrencyVND(displaySummary.totalTip)}
          </div>
          <div className="text-[11px] text-slate-400">
            100% tài xế
          </div>
        </div>

        {/* Card 4: Số Cuốc */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>SỐ CUỐC</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
            {displaySummary.totalTrips} cuốc
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            TB: {formatCurrencyVND(displaySummary.netPerHourEstimate)}/cuốc
          </div>
        </div>
      </div>

      {/* 4. Danh sách cuốc xe */}
      {viewMode === "timeline" ? (
        <div className="space-y-4">
          {dailyGroups.length === 0 ? (
            <div className="p-10 text-center space-y-2 rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10">
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Chưa có cuốc xe nào trong tháng {month}/{year}
              </div>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#FFC700] hover:bg-[#FBBF24] text-[#111827] font-bold text-xs shadow-xs cursor-pointer"
              >
                + Thêm Cuốc Ngay
              </button>
            </div>
          ) : (
            dailyGroups.map((group) => (
              <div
                key={group.dateKey}
                className="rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 overflow-hidden shadow-xs"
              >
                {/* Header ngày */}
                <div className="px-4 py-3 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white capitalize">
                      {group.displayDate}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.2 rounded-md bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                      {group.tripCount} cuốc
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatCurrencyVND(group.totalEarnings)}
                    </span>
                    {group.totalTip > 0 && (
                      <span className="text-[10px] text-amber-600 font-mono ml-1.5">
                        (Tip +{formatCurrencyVND(group.totalTip)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Danh sách cuốc */}
                <div className="divide-y divide-slate-100 dark:divide-white/5">
                  {group.orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Trái: Giờ, Mã, Badge, Km */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg shrink-0">
                          {order.tripTime || "--:--"}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                              {order.orderCode}
                            </span>
                            {selectedTab === "all" && getServiceBadge(order.serviceType)}
                            {order.distanceKm > 0 && (
                              <span className="text-[10px] font-mono text-slate-400">
                                {order.distanceKm}km
                              </span>
                            )}
                          </div>
                          {order.note && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {order.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Phải: Thực nhận, Khách/Sàn, Ảnh, Xóa */}
                      <div className="flex items-center gap-2.5 shrink-0">
                        <div className="text-right">
                          <div className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                            +{formatCurrencyVND(order.driverEarnings)}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {formatCurrencyVND(order.customerFare)}
                            {order.taxTncn > 0 && (
                              <span className="text-rose-500 ml-1">Thuế: -{formatCurrencyVND(order.taxTncn)}</span>
                            )}
                            {order.tip > 0 && (
                              <span className="text-amber-600 ml-1">+{formatCurrencyVND(order.tip)}</span>
                            )}
                          </div>
                        </div>

                        {order.imageUrl && (
                          <button
                            type="button"
                            onClick={() =>
                              setLightboxData({
                                url: order.imageUrl || "",
                                orderCode: order.orderCode,
                                orderDate: new Date(order.orderDate).toLocaleDateString("vi-VN"),
                                tripTime: order.tripTime,
                                serviceType: order.serviceType,
                                driverEarnings: order.driverEarnings,
                              })
                            }
                            className="w-9 h-9 rounded-lg overflow-hidden border border-amber-400 cursor-pointer shrink-0"
                            title="Xem ảnh cuốc"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={order.imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(order.id, order.orderCode)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* View Bảng ngắn gọn */
        <div className="rounded-2xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 font-mono text-[10px] border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Giờ / Ngày</th>
                  <th className="py-2.5 px-3">Mã Cuốc</th>
                  {selectedTab === "all" && <th className="py-2.5 px-3">Dịch Vụ</th>}
                  <th className="py-2.5 px-3 text-center">Ảnh</th>
                  <th className="py-2.5 px-3 text-right">Cước Khách</th>
                  <th className="py-2.5 px-3 text-right">Phí Sàn</th>
                  <th className="py-2.5 px-3 text-right">Thuế TNCN</th>
                  <th className="py-2.5 px-3 text-right">Thực Nhận</th>
                  <th className="py-2.5 px-3 text-right">Tip</th>
                  <th className="py-2.5 px-3 text-center">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 font-mono">
                      <span className="font-bold">{order.tripTime || "--:--"}</span>
                      <span className="text-slate-400 text-[10px] ml-1">
                        {new Date(order.orderDate).toLocaleDateString("vi-VN")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      {order.orderCode}
                    </td>
                    {selectedTab === "all" && (
                      <td className="py-2.5 px-3">{getServiceBadge(order.serviceType)}</td>
                    )}
                    <td className="py-2.5 px-3 text-center">
                      {order.imageUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setLightboxData({
                              url: order.imageUrl || "",
                              orderCode: order.orderCode,
                              orderDate: new Date(order.orderDate).toLocaleDateString("vi-VN"),
                              tripTime: order.tripTime,
                              serviceType: order.serviceType,
                              driverEarnings: order.driverEarnings,
                            })
                          }
                          className="w-7 h-7 rounded-md overflow-hidden border border-amber-400 inline-block cursor-pointer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={order.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      {formatCurrencyVND(order.customerFare)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-500">
                      -{formatCurrencyVND(order.platformFee)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-500">
                      {order.taxTncn ? `-${formatCurrencyVND(order.taxTncn)}` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      +{formatCurrencyVND(order.driverEarnings)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-amber-600">
                      {order.tip > 0 ? `+${formatCurrencyVND(order.tip)}` : "-"}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleDelete(order.id, order.orderCode)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Lightbox Modal xem ảnh */}
      {lightboxData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative max-w-xl w-full bg-white dark:bg-[#0c121e] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/20 shadow-2xl space-y-3">
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-white/10">
              <div className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                Cuốc {lightboxData.orderCode} • {lightboxData.tripTime || ""} {lightboxData.orderDate}
              </div>
              <button
                onClick={() => setLightboxData(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-2 flex items-center justify-center bg-black max-h-[65vh] overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightboxData.url}
                alt=""
                className="max-h-[60vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="p-3 bg-slate-50 dark:bg-white/[0.03] border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
              <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">
                +{formatCurrencyVND(lightboxData.driverEarnings)}
              </span>

              <a
                href={lightboxData.url}
                download={`cuoc-be-${lightboxData.orderCode}.jpg`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Thêm Cuốc (Ngắn gọn, rõ ràng) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0c121e] border-2 border-slate-900 dark:border-white/20 p-5 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <BeeIconSvg size={22} variant="badge" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Thêm Cuốc {selectedTab !== "all" ? serviceTabs.find((t) => t.id === selectedTab)?.label : "Be"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 flex items-center justify-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3">
              {/* Chỉ hiển thị chọn dịch vụ khi ở tab Tất Cả, khi đã ở tab cụ thể thì ẩn hoàn toàn */}
              {selectedTab === "all" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Dịch vụ
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as BeeServiceType)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-semibold focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="beBike">🛵 beBike</option>
                    <option value="beDeliveryExpress">⚡ be Siêu Tốc</option>
                    <option value="beDeliveryEconomy">📦 be Tiết Kiệm</option>
                    <option value="beDeliveryCorporate">🏢 be Doanh Nghiệp</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã cuốc
                  </label>
                  <input
                    type="text"
                    placeholder="Tự động"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Giờ chạy *
                  </label>
                  <input
                    type="time"
                    required
                    value={tripTime}
                    onChange={(e) => setTripTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-400/40 bg-amber-50/20 dark:bg-amber-500/5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày *
                  </label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cước khách (₫) *
                  </label>
                  <input
                    type="text"
                    placeholder="55000"
                    required
                    value={customerFare}
                    onChange={(e) => handleCustomerFareChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 dark:border-amber-400/40 bg-amber-50/30 dark:bg-amber-500/5 text-xs font-mono font-bold focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phí sàn (₫)
                  </label>
                  <input
                    type="text"
                    placeholder="14500"
                    value={platformFee}
                    onChange={(e) => handlePlatformFeeChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono text-rose-600 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thuế TNCN (₫)
                  </label>
                  <input
                    type="text"
                    placeholder="1.5% cước"
                    value={taxTncn}
                    onChange={(e) => handleTaxTncnChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono text-rose-600 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tiền tip (₫)
                  </label>
                  <input
                    type="text"
                    placeholder="0"
                    value={tip}
                    onChange={(e) => setTip(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono text-amber-600 focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>Thực nhận (₫)</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    = Cước - Sàn - Thuế TNCN
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Tự động tính"
                  value={driverEarnings}
                  onChange={(e) => setDriverEarnings(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-500/5 text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 focus:border-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Tải ảnh cuốc */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ảnh cuốc xe / Biên lai
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                {imageUrl ? (
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover border border-amber-400 shrink-0"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex-1 truncate">
                      Đã đính kèm ảnh
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="px-2 py-1 rounded-md bg-rose-100 text-rose-700 text-xs font-bold"
                    >
                      Bỏ ảnh
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-amber-400 flex items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4 text-amber-500" />
                    <span>Tải ảnh cuốc</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Quãng đường (km)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="4.8"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs font-mono focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ghi chú
                  </label>
                  <input
                    type="text"
                    placeholder="Tùy chọn"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#FFC700] hover:bg-[#FBBF24] text-[#111827] font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-amber-400"
                >
                  <BeeIconSvg size={16} variant="square" />
                  <span>{isSubmitting ? "Đang lưu..." : "Lưu Cuốc Xe"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BeeOrdersPage() {
  return (
    <React.Suspense fallback={<BeeOrdersSkeleton />}>
      <BeeOrdersPageContent />
    </React.Suspense>
  );
}
