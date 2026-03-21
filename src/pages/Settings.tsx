import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  fetchSettings,
  saveSettings,
  type AppSettings,
} from "@/lib/supabaseApi";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AVERAGE_TICKET_STORAGE_KEY } from "@/lib/analytics";

const Settings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const [form, setForm] = useState<AppSettings>({
    naverApiKey: "",
    kakaoChannelId: "",
  });
  const [averageTicket, setAverageTicket] = useState<string>("");

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(AVERAGE_TICKET_STORAGE_KEY);
    if (stored) {
      setAverageTicket(stored);
    }
  }, []);

  const saveMutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      toast.success("설정이 저장되었습니다");
    },
    onError: () => {
      toast.error("설정 저장 중 오류가 발생했습니다");
    },
  });

  const handleChange =
    (field: keyof AppSettings) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && averageTicket) {
      window.localStorage.setItem(AVERAGE_TICKET_STORAGE_KEY, averageTicket);
    }
    saveMutation.mutate(form);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">설정</h1>
          <p className="text-xs text-muted-foreground mt-1">
            가게용 Admin 설정 화면입니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/", { replace: true })}
            className="text-[11px] text-muted-foreground underline hover:text-foreground"
          >
            나중에 할게
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-muted-foreground underline hover:text-foreground"
          >
            로그아웃
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-card p-4 space-y-4"
        >
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold">네이버 예약 연동</label>
            <Badge
              variant="outline"
              className="text-[10px] border-yellow-300 bg-yellow-50 text-yellow-800"
            >
              준비중
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">
            네이버 예약센터에서 발급한 키를 저장해두면, 나중에 예약 정보를
            자동으로 가져올 수 있습니다. (현재는 표시만, 연동 준비중)
          </p>
          <input
            type="text"
            value={form.naverApiKey}
            onChange={handleChange("naverApiKey")}
            placeholder="NAVER_RESERVED_API_KEY"
            className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={isLoading || saveMutation.isPending}
          />

          <div className="h-px bg-border my-2" />

          <div className="mb-2">
            <label className="text-sm font-semibold mb-1 block">
              매장 평균 객단가
            </label>
            <p className="text-[11px] text-muted-foreground mb-2">
              한 번 방문했을 때 손님이 대략 얼마나 쓰는지 금액을 적어주세요.
              고객 가치(예상 매출)을 계산할 때 사용됩니다.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={averageTicket}
                onChange={(e) => setAverageTicket(e.target.value)}
                placeholder="예: 12000"
                className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="text-xs text-muted-foreground">원</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold">카카오 채널 연동</label>
            <Badge
              variant="outline"
              className="text-[10px] border-yellow-300 bg-yellow-50 text-yellow-800"
            >
              준비중
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">
            카카오톡 채널 관리자센터의 채널 ID를 저장해두면, 향후 알림톡/친구톡
            발송 기능과 연동할 수 있습니다.
          </p>
          <input
            type="text"
            value={form.kakaoChannelId}
            onChange={handleChange("kakaoChannelId")}
            placeholder="@your_channel_id"
            className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={isLoading || saveMutation.isPending}
          />

          <button
            type="submit"
            disabled={isLoading || saveMutation.isPending}
            className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground active:opacity-90 transition-opacity"
          >
            {saveMutation.isPending ? "저장 중..." : "설정 저장하기"}
          </button>
        </form>

        <div className="rounded-2xl border bg-card p-4 text-[11px] text-muted-foreground space-y-1.5">
          <p className="font-semibold text-xs text-foreground">
            B2C SaaS 판매용 기본 구조
          </p>
          <p>
            - 이 화면은 로그인 후 진입하는 Admin 설정 페이지입니다.
          </p>
          <p>
            - 네이버 예약 / 카카오 채널 값은 Supabase{" "}
            <code className="px-1 py-0.5 rounded bg-muted text-[10px]">
              settings
            </code>{" "}
            테이블에 저장됩니다.
          </p>
          <p>- 실제 외부 API 연동은 추후에 붙일 수 있도록 설계되어 있습니다.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;

