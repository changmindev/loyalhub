import { Users, UserCheck, Ticket, TrendingUp, ArrowRight } from "lucide-react";
import StatCard from "@/components/StatCard";
import QueryErrorNotice from "@/components/QueryErrorNotice";
import GradeBadge from "@/components/GradeBadge";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCouponHistory, fetchCustomers } from "@/lib/supabaseApi";
import { useAuth } from "@/contexts/AuthContext";
import { daysSince, formatKoreanDate, getRiskLevel } from "@/lib/analytics";
import { DashboardTopBanner } from "@/components/DashboardTopBanner";
import { CampaignImpactCards } from "@/components/CampaignImpactCards";
import { DailyTip } from "@/components/DailyTip";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    data: customers,
    isError: isCustomersError,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });
  const { data: couponHistory, isError: isCouponsError } = useQuery({
    queryKey: ["couponHistory"],
    queryFn: fetchCouponHistory,
  });

  const todayStr = new Date().toISOString().slice(0, 10);

  const todayVisitors =
    customers?.filter((c) => c.lastVisit?.startsWith(todayStr)).length ?? 0;
  const totalCustomers = customers?.length ?? 0;
  const vipCount =
    customers?.filter((c) => c.grade === "VIP").length ?? 0;
  const latestCoupon = couponHistory?.[0];

  const recentCustomers =
    customers
      ?.slice()
      .sort((a, b) => b.lastVisit.localeCompare(a.lastVisit))
      .slice(0, 5) ?? [];

  const ownerName = user?.name ? `${user.name}님` : "사장님";

  // 오늘 할 일: 간단한 규칙 기반 세그먼트
  //
  // ⚠️ stale7 은 "7일 이상"이 아니라 **7~30일** 구간이다. 30일을 넘기면
  // dangerCustomers(이탈 위험)로 넘어간다. 라벨을 `7일 이상 안 온 손님`으로
  // 달아 두었더니 `7일 이상 0명 / 이탈 위험 8명` 이 같이 떠서 모순으로 읽혔다.
  // (docs/DEFECTS.md D-07)
  const stale7 =
    customers?.filter((c) => {
      const d = daysSince(c.lastVisit);
      return d != null && d >= 7 && d <= 30;
    }).length ?? 0;

  const dangerCustomers =
    customers?.filter((c) => getRiskLevel(daysSince(c.lastVisit)) === "danger")
      .length ?? 0;

  const hasCustomers = (customers?.length ?? 0) > 0;
  const hasCoupons = (couponHistory?.length ?? 0) > 0;
  const onboardingSteps = [
    hasCustomers,
    hasCoupons,
    Boolean(user?.storeName),
  ];
  const completedSteps = onboardingSteps.filter(Boolean).length;

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      {(isCustomersError || isCouponsError) && (
        <QueryErrorNotice onRetry={() => refetchCustomers()} />
      )}
      <div className="mb-6">
        <p className="font-display text-xs font-bold uppercase tracking-widest text-accent-strong">
          {formatKoreanDate(todayStr)}
        </p>
        <h1 className="font-display text-2xl font-extrabold mt-1 leading-snug">
          안녕하세요,
          <br />
          <span className="text-accent-strong">{ownerName}</span> ☕
        </h1>
      </div>

      <DashboardTopBanner targetCount={stale7} />

      {/* 온보딩 진행률 */}
      <div className="rounded-2xl border bg-card p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold">첫 세팅 진행 상황</p>
          <span className="text-[11px] text-muted-foreground">
            {completedSteps}/3 완료
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(completedSteps / 3) * 100}%` }}
          />
        </div>
        <ul className="text-[11px] text-muted-foreground space-y-0.5">
          {[
            { done: onboardingSteps[2], label: "매장 정보 등록" },
            { done: onboardingSteps[0], label: "고객 데이터 등록" },
            { done: onboardingSteps[1], label: "첫 쿠폰·공지 발송" },
          ].map((step) => (
            <li
              key={step.label}
              className={
                step.done ? "text-muted-foreground" : "font-medium text-foreground"
              }
            >
              <span className="inline-block w-4">{step.done ? "✓" : "•"}</span>
              {step.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 오늘 할 일 섹션 */}
      <div className="rounded-2xl border bg-card p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold">오늘 하면 좋은 일</h2>
        </div>
        <ul className="space-y-2 text-xs">
          <li className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">
                7~30일 미방문 <span data-testid="segment-stale7">{stale7}</span>명
              </p>
              <p className="text-[11px] text-muted-foreground">
                조용히 한 번 더 초대해 보세요.
              </p>
            </div>
            <button
              onClick={() => navigate("/coupon")}
              className="shrink-0 whitespace-nowrap min-w-[104px] text-center text-[11px] rounded-full px-3 py-1.5 bg-primary text-primary-foreground font-semibold"
            >
              쿠폰 보내기
            </button>
          </li>
          <li className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">
                이탈 위험 고객 <span data-testid="segment-danger">{dangerCustomers}</span>명
              </p>
              <p className="text-[11px] text-muted-foreground">
                한 번만 더 챙기면 단골로 이어질 수 있어요.
              </p>
            </div>
            <button
              // 라벨이 "이탈 위험 고객"이므로 그 세그먼트로 연다.
              onClick={() => navigate("/customers?seg=churn")}
              className="shrink-0 whitespace-nowrap min-w-[104px] text-center text-[11px] rounded-full px-3 py-1.5 bg-secondary text-secondary-foreground font-semibold"
            >
              고객 리스트 보기
            </button>
          </li>
          <li className="flex items-center justify-between gap-3 opacity-70">
            <div>
              <p className="font-medium">생일/기념일 고객</p>
              <p className="text-[11px] text-muted-foreground">
                고객 생일 정보를 연결하면 자동으로 추천해 드릴게요. (데모 범위 밖)
              </p>
            </div>
          </li>
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard icon={UserCheck} label="오늘 방문" value={todayVisitors} sub="명" testId="stat-today-visitors" variant="highlight" />
        <StatCard icon={Users} label="전체 단골" value={totalCustomers} sub="명" testId="stat-total-customers" />
        <StatCard icon={TrendingUp} label="VIP 고객" value={vipCount} sub="명" testId="stat-vip" />
        <StatCard icon={Ticket} label="최근 쿠폰" value={latestCoupon?.sentCount || 0} sub="명 발송" testId="stat-recent-coupon" />
      </div>

      {latestCoupon && (
        <button
          type="button"
          onClick={() => navigate("/coupon")}
          className="w-full text-left rounded-2xl bg-banner text-banner-foreground p-4 mb-5 flex items-center justify-between gap-3 active:opacity-90 transition-opacity"
        >
          <div className="min-w-0">
            <h2 className="text-xs font-semibold text-banner-foreground/70 mb-1">최근 발송 쿠폰</h2>
            <p className="font-display text-base font-bold truncate">{latestCoupon.title}</p>
            <p className="text-xs text-banner-foreground/70 mt-1">
              {formatKoreanDate(latestCoupon.sentAt)} · {latestCoupon.targetGrade} 대상 · {latestCoupon.sentCount}명
            </p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-highlight text-highlight-foreground px-3.5 py-2 text-xs font-semibold">
            관리하기 <ArrowRight className="h-3 w-3" />
          </span>
        </button>
      )}

      <CampaignImpactCards campaigns={couponHistory || []} />

      <div className="rounded-2xl border bg-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">최근 방문 고객</h2>
          <button
            onClick={() => navigate('/customers')}
            className="text-xs text-primary font-medium flex items-center gap-0.5"
          >
            전체보기 <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <ul className="space-y-2">
          {recentCustomers.map(c => (
            <li
              key={c.id}
              onClick={() => navigate(`/customers/${c.id}`)}
              className="flex items-center justify-between cursor-pointer hover:bg-secondary/50 -mx-2 px-2 py-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-sm font-semibold text-primary">
                  {c.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">방문 {c.visitCount}회</p>
                </div>
              </div>
              <GradeBadge grade={c.grade} />
            </li>
          ))}
        </ul>
      </div>

      <DailyTip />
    </div>
  );
};

export default Dashboard;
