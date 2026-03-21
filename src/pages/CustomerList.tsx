import { useState } from "react";
import { Search, Plus, X } from "lucide-react";
import type { CustomerGrade } from "@/lib/mockData";
import GradeBadge from "@/components/GradeBadge";
import { RiskBadge } from "@/components/RiskBadge";
import { CustomersSegmentsTabs, type CustomerSegmentKey } from "@/components/CustomersSegmentsTabs";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCustomer, fetchCustomers } from "@/lib/supabaseApi";
import { daysSince, formatKoreanDate, getRiskLevel } from "@/lib/analytics";

const grades: (CustomerGrade | "전체")[] = ["전체", "VIP", "단골", "일반"];

const CustomerList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [filterGrade, setFilterGrade] = useState<CustomerGrade | "전체">("전체");
  const [segment, setSegment] = useState<CustomerSegmentKey>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const {
    data: customers,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const addCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("새 고객이 등록되었습니다");
      setShowAddModal(false);
      setNewName("");
      setNewPhone("");
    },
    onError: () => {
      toast.error("고객 등록 중 오류가 발생했습니다");
    },
  });

  const filtered =
    customers?.filter((c) => {
      const matchSearch =
        c.name.includes(search) || c.phone.includes(search);
      const matchGrade = filterGrade === "전체" || c.grade === filterGrade;

      const d = daysSince(c.lastVisit);
      const isVipSeg = segment === "vip" ? c.grade === "VIP" : true;
      const isChurnSeg =
        segment === "churn"
          ? d != null && getRiskLevel(d) === "danger"
          : true;
      const isThisWeekSeg =
        segment === "this-week"
          ? d != null && d <= 7
          : true;

      return matchSearch && matchGrade && isVipSeg && isChurnSeg && isThisWeekSeg;
    }) ?? [];

  const handleAddCustomer = () => {
    if (!newName.trim() || !newPhone.trim()) {
      toast.error("이름과 전화번호를 모두 입력해주세요");
      return;
    }

    addCustomerMutation.mutate({
      name: newName.trim(),
      phone: newPhone.trim(),
    });
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">단골 목록</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold shadow-sm active:opacity-90 transition-opacity"
        >
          <Plus className="h-3.5 w-3.5" /> 새 고객
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="이름 또는 전화번호 검색"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full rounded-xl border bg-card pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <CustomersSegmentsTabs value={segment} onChange={setSegment} />

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {grades.map(g => (
          <button
            key={g}
            onClick={() => setFilterGrade(g)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
              filterGrade === g
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-2">
        {isLoading
          ? "불러오는 중..."
          : isError
            ? "불러오기에 실패했습니다"
            : `${filtered.length}명`}
      </p>

      <ul className="space-y-2">
        {filtered.map((c) => {
          const days = daysSince(c.lastVisit);
          const risk = getRiskLevel(days);
          return (
            <li
              key={c.id}
              onClick={() => navigate(`/customers/${c.id}`)}
              className="flex items-center justify-between rounded-2xl border bg-card p-4 cursor-pointer hover:shadow-sm active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-sm font-semibold text-primary">
                  {c.name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    방문 {c.visitCount}회 · 마지막 방문{" "}
                    {formatKoreanDate(c.lastVisit)}
                    {days != null && (
                      <> · {days}일 전</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <GradeBadge grade={c.grade} />
                <RiskBadge level={risk} />
              </div>
            </li>
          );
        })}
      </ul>

      {/* 새 고객 등록 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-lg bg-card rounded-t-2xl sm:rounded-2xl p-6 border shadow-lg animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">새 고객 등록</h2>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">이름</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="고객 이름"
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1 block">전화번호</label>
                <input
                  type="tel"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <button
              onClick={handleAddCustomer}
              className="mt-5 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground active:opacity-90 transition-opacity"
            >
              등록하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
