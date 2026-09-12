import { AlertTriangle, RotateCw } from "lucide-react";

/**
 * 데이터를 못 불러왔을 때 화면이 그 사실을 말하게 한다.
 *
 * 예전에는 실패해도 `불러오는 중...` 이 계속 떠 있었다. 사용자는 영원히 기다리고,
 * 자동화는 로딩과 실패를 구분할 수 없다. "아무 말도 안 하는 화면"이 가장 나쁘다.
 *
 * ⚠️ 이건 **연결 실패**용이다. 데모 데이터로 덮지 않는다 —
 * 실패를 가짜 값으로 가리면 운영에서 DB가 죽어도 화면이 멀쩡해 보인다.
 */
const QueryErrorNotice = ({
  message = "데이터를 불러오지 못했습니다.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) => (
  <div
    role="alert"
    data-testid="query-error"
    className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
  >
    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
    <div className="flex-1">
      <p className="font-semibold">{message}</p>
      <p className="mt-0.5 text-destructive/80">
        네트워크 상태를 확인한 뒤 다시 시도해 주세요.
      </p>
    </div>
    {onRetry && (
      <button
        type="button"
        data-testid="query-error-retry"
        onClick={onRetry}
        className="flex items-center gap-1 rounded-lg border border-destructive/30 px-2 py-1 font-semibold hover:bg-destructive/10"
      >
        <RotateCw className="h-3 w-3" />
        재시도
      </button>
    )}
  </div>
);

export default QueryErrorNotice;
