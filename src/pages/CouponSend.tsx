import { useState } from "react";
import { Send, CheckCircle, Clock, CalendarClock } from "lucide-react";
import type { CustomerGrade } from "@/lib/mockData";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCouponLog,
  fetchCouponHistory,
  fetchCustomers,
} from "@/lib/supabaseApi";
import { sendSmsToCustomers } from "@/lib/sms";
import { couponTemplates } from "@/lib/couponTemplates";
import { useAuth } from "@/contexts/AuthContext";

const targetOptions: (CustomerGrade | "전체")[] = ["전체", "VIP", "단골", "일반"];

const CouponSend = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [target, setTarget] = useState<CustomerGrade | "전체">("전체");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("18:00");

  const { data: customers, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["customers"],
    queryFn: fetchCustomers,
  });

  const { data: couponHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["couponHistory"],
    queryFn: fetchCouponHistory,
  });

  const targetCount =
    target === "전체"
      ? customers?.length ?? 0
      : (customers ?? []).filter((c) => c.grade === target).length;

  const sendMutation = useMutation({
    mutationFn: createCouponLog,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["couponHistory"] });
      setSent(true);
      setTimeout(() => {
        setSent(false);
        setMessage("");
        setIsScheduled(false);
        setScheduleDate("");
      }, 2000);
    },
    onError: () => {
      toast.error("쿠폰 발송 기록 저장 중 오류가 발생했습니다");
    },
  });

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("메시지를 입력해주세요");
      return;
    }
    if (isScheduled && !scheduleDate) {
      toast.error("예약 날짜를 선택해주세요");
      return;
    }

    const scheduledAt = isScheduled
      ? new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
      : null;

    const targetCustomers =
      customers?.filter((c) => target === "전체" || c.grade === target) ?? [];

    try {
      await sendSmsToCustomers({
        text: message.trim(),
        customers: targetCustomers.map((c) => ({
          name: c.name,
          phone: c.phone,
        })),
      });
    } catch (error) {
      toast.error("SMS 발송 중 오류가 발생했습니다");
      return;
    }

    sendMutation.mutate({
      message: message.trim(),
      target,
      sentCount: targetCount,
      scheduledAt,
    });

    if (isScheduled) {
      toast.success(`${scheduleDate} ${scheduleTime}에 ${targetCount}명에게 예약 발송됩니다!`);
    } else {
      toast.success(`${targetCount}명에게 발송 완료!`);
    }
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-1">쿠폰 / 공지 발송</h1>
      <p className="text-xs text-muted-foreground mb-4">
        간단한 템플릿을 골라 바로 문자를 보내보세요.
      </p>

      {/* 발송 대상 */}
      <div className="rounded-2xl border bg-card p-4 mb-3">
        <label className="text-sm font-semibold mb-2 block">발송 대상</label>
        <div className="flex gap-2 flex-wrap">
          {targetOptions.map((t) => (
            <button
              key={t}
              onClick={() => setTarget(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                target === t
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          대상 고객:{" "}
          <span className="font-semibold text-foreground">
            {isLoadingCustomers ? "계산 중..." : `${targetCount}명`}
          </span>
        </p>
      </div>

      {/* 템플릿 + 메시지 */}
      <div className="grid gap-3 mb-3">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold">추천 문구 템플릿</label>
            <span className="text-[10px] text-muted-foreground">
              클릭하면 내용이 자동으로 입력돼요
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {couponTemplates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() =>
                  setMessage(
                    tpl.message.replace(
                      "{매장명}",
                      user?.storeName || "우리 매장",
                    ),
                  )
                }
                className="min-w-[120px] rounded-xl border bg-background px-3 py-2 text-left hover:border-primary/60 active:scale-[0.99] transition-all"
              >
                <p className="text-xs font-semibold mb-0.5">{tpl.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {tpl.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <label className="text-sm font-semibold mb-2 block">메시지 내용</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="예: 이번 주 방문 시 음료 1잔 무료!"
            rows={4}
            className="w-full rounded-xl border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <div className="mt-3 rounded-xl bg-muted/70 p-3">
            <p className="text-[11px] font-semibold mb-1">문자 미리보기</p>
            <div className="rounded-2xl bg-background border px-3 py-2 text-[12px] leading-snug">
              <span className="block text-[10px] text-muted-foreground mb-0.5">
                수신자 {target === "전체" ? "전체 고객" : target} ·{" "}
                {targetCount}명
              </span>
              <p>{message || "여기에 입력한 문자가 이렇게 보여요."}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 예약 발송 */}
      <div className="rounded-2xl border bg-card p-4 mb-4">
        <button
          onClick={() => setIsScheduled(!isScheduled)}
          className="flex items-center justify-between w-full"
        >
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">예약 발송</span>
          </div>
          <div
            className={`h-6 w-11 rounded-full transition-colors relative ${
              isScheduled ? "bg-primary" : "bg-secondary"
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${
                isScheduled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>

        {isScheduled && (
          <div className="mt-3 pt-3 border-t space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                날짜
              </label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                시간
              </label>
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                {scheduleDate
                  ? `${scheduleDate} ${scheduleTime}에 자동 발송됩니다`
                  : "날짜를 선택해주세요"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 발송 버튼 */}
      <button
        onClick={handleSend}
        disabled={sent}
        className={`w-full rounded-2xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
          sent
            ? "bg-success text-success-foreground"
            : "bg-primary text-primary-foreground active:opacity-90 shadow-sm"
        }`}
      >
        {sent ? (
          <>
            <CheckCircle className="h-4 w-4" />{" "}
            {isScheduled ? "예약 완료!" : "발송 완료!"}
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            {isScheduled
              ? `${targetCount}명에게 예약 발송`
              : `${targetCount}명에게 발송하기`}
          </>
        )}
      </button>

      {/* 발송 이력 */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold mb-3">발송 이력</h2>
        <ul className="space-y-2">
          {isLoadingHistory && (
            <li className="text-xs text-muted-foreground">불러오는 중...</li>
          )}
          {couponHistory?.map((c) => (
            <li key={c.id} className="rounded-2xl border bg-card p-3.5">
              <p className="text-sm font-medium">{c.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {c.sentAt} · {c.targetGrade} · {c.sentCount}명
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CouponSend;
