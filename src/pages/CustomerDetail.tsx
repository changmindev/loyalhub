import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Calendar,
  MessageSquare,
  Send,
  ChevronRight,
  Star,
} from "lucide-react";
import type { CustomerGrade } from "@/lib/mockData";
import GradeBadge from "@/components/GradeBadge";
import { CustomerMemoPresets } from "@/components/CustomerMemoPresets";
import { RiskBadge } from "@/components/RiskBadge";
import {
  daysSince,
  estimateCustomerValue,
  formatKoreanDate,
  getRiskLevel,
} from "@/lib/analytics";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCustomerById,
  updateCustomerProfile,
  updateCustomerVisit,
} from "@/lib/supabaseApi";

const allGrades: CustomerGrade[] = ["일반", "단골", "VIP"];

const gradeDescriptions: Record<CustomerGrade, string> = {
  일반: "신규 · 가끔 방문",
  단골: "정기적으로 방문",
  VIP: "최우수 고객",
};

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: customer,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => fetchCustomerById(id || ""),
    enabled: !!id,
  });

  const [grade, setGrade] = useState<CustomerGrade>("일반");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    if (customer) {
      setGrade(customer.grade);
      setMemo(customer.memo);
    }
  }, [customer]);

  const saveProfileMutation = useMutation({
    mutationFn: updateCustomerProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customer", id] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("저장되었습니다");
    },
    onError: () => {
      toast.error("저장 중 오류가 발생했습니다");
    },
  });

  const addVisitMutation = useMutation({
    mutationFn: updateCustomerVisit,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["customer", id] });
      await queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("방문 기록이 추가되었습니다");
    },
    onError: () => {
      toast.error("방문 기록 추가 중 오류가 발생했습니다");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">고객을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handleSave = () => {
    if (!id) return;
    saveProfileMutation.mutate({
      id,
      grade,
      memo,
    });
  };

  const handleAddVisit = () => {
    if (!id) return;
    addVisitMutation.mutate(id);
  };

  const days = daysSince(customer.lastVisit);
  const risk = getRiskLevel(days);
  const value = estimateCustomerValue(customer.visitCount);

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> 뒤로가기
      </button>

      {/* 프로필 헤더 */}
      <div className="rounded-2xl border bg-card p-6 mb-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="relative">
          <div className="h-18 w-18 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold text-primary mx-auto mb-3 h-[72px] w-[72px]">
            {customer.name[0]}
          </div>
          <h1 className="text-lg font-bold">{customer.name}</h1>
          <div className="flex items-center justify-center gap-2 mt-1 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {customer.phone}
          </div>
          <div className="mt-3 flex items-center justify-center gap-2">
            <GradeBadge grade={grade} />
            <RiskBadge level={risk} />
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          type="button"
          onClick={handleAddVisit}
          className="rounded-2xl border bg-card p-4 text-center active:scale-[0.99] transition-transform"
        >
          <p className="text-3xl font-bold text-primary">{customer.visitCount}</p>
          <p className="text-xs text-muted-foreground mt-1">총 방문 (탭하여 +1)</p>
        </button>
        <div className="rounded-2xl border bg-card p-4 text-center">
          <p className="text-sm font-semibold">
            {formatKoreanDate(customer.lastVisit)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            마지막 방문
            {days != null && ` · ${days}일 전`}
          </p>
        </div>
      </div>

      {/* 고객 가치 (매출 관점) */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">예상 누적 매출</p>
          <p className="text-lg font-bold">
            {value.totalRevenue.toLocaleString()}원
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            방문 횟수 x 평균 객단가
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-1">최근 90일 추정 매출</p>
          <p className="text-lg font-bold">
            {value.recent90Days.toLocaleString()}원
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            전체 매출의 약 40% 기준 (추정)
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4 col-span-2">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">방문당 평균 매출</p>
              <p className="text-base font-semibold">
                {Math.round(value.averagePerVisit).toLocaleString()}원
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground mb-1">
                매장 설정 평균 객단가
              </p>
              <p className="text-xs font-medium">
                {value.averageTicket.toLocaleString()}원
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 쿠폰 발송 바로가기 */}
      <button
        onClick={() => navigate('/coupon')}
        className="w-full rounded-2xl border bg-card p-4 mb-4 flex items-center justify-between hover:shadow-sm transition-shadow group"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Send className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">쿠폰 발송하기</p>
            <p className="text-xs text-muted-foreground">이 고객에게 쿠폰/공지를 보내세요</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </button>

      {/* 등급 변경 */}
      <div className="rounded-2xl border bg-card p-4 mb-4">
        <label className="text-sm font-semibold mb-3 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-primary" /> 등급 변경
        </label>
        <div className="flex gap-2">
          {allGrades.map(g => (
            <button
              key={g}
              onClick={() => setGrade(g)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-medium transition-all ${
                grade === g
                  ? 'bg-primary text-primary-foreground shadow-sm scale-[1.02]'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              <span className="block">{g}</span>
              <span className={`block text-[10px] mt-0.5 ${grade === g ? 'opacity-80' : 'opacity-60'}`}>
                {gradeDescriptions[g]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 메모 */}
      <div className="rounded-2xl border bg-card p-4 mb-4">
        <label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-primary" /> 메모
        </label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="고객에 대한 메모를 남겨보세요"
          rows={3}
          className="w-full rounded-xl border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <CustomerMemoPresets
          onInsert={(text) => {
            const separator = memo && !memo.endsWith("\n") ? "\n" : "";
            setMemo(`${memo}${separator}${text}: `);
          }}
        />
        <button
          onClick={handleSave}
          className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground active:opacity-90 transition-opacity"
        >
          저장
        </button>
      </div>

      {/* 방문 이력 타임라인 (DB에는 단일 last_visit만 있으므로 간단한 안내만 표시) */}
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-primary" /> 방문 이력
        </h2>
        <p className="text-xs text-muted-foreground">
          현재 버전에서는 총 방문 수와 마지막 방문 시간만 관리합니다.
        </p>
      </div>
    </div>
  );
};

export default CustomerDetail;
