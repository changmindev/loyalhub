import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * 렌더 중 던져진 예외를 잡아 화면에 남긴다.
 *
 * React 는 렌더 중 예외가 올라오면 **트리 전체를 언마운트한다.**
 * 경계가 없으면 결과가 흰 화면 하나뿐이라, 사용자는 앱이 죽은 건지
 * 네트워크가 느린 건지 구분할 수 없고 자동화도 아무것도 단언할 수 없다.
 *
 * 실제로 설정 화면에서 컴포넌트 import 가 빠져 있었고,
 * 조회가 실패하는 순간 ReferenceError 가 나면서 앱 전체가 사라졌다.
 * 그 import 는 고쳤지만, 같은 종류의 실수가 다시 나도
 * **고장 범위가 화면 하나로 묶이도록** 경계를 둔다.
 *
 * ⚠️ 이벤트 핸들러·비동기 콜백에서 던진 예외는 잡지 못한다(React 의 한계).
 * 데이터 조회 실패는 react-query 의 isError 로 따로 다룬다.
 */

type Props = { children: ReactNode };
type State = { error: Error | null };

class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 조용히 삼키면 원인을 추적할 수 없다. 콘솔에는 남긴다.
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div
        data-testid="error-boundary"
        role="alert"
        className="min-h-screen flex items-center justify-center bg-muted px-4"
      >
        <div className="w-full max-w-md rounded-2xl border bg-background p-6 text-center shadow-sm">
          <h1 className="text-base font-bold">화면을 표시하지 못했습니다</h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            예기치 못한 오류가 발생했습니다. 새로고침해도 같은 화면이 나오면
            문제가 남아 있는 것입니다.
          </p>
          <p className="mt-3 break-words rounded-xl bg-muted px-3 py-2 text-left text-[11px] font-mono text-muted-foreground">
            {error.message}
          </p>
          <button
            type="button"
            data-testid="error-boundary-reload"
            onClick={() => window.location.reload()}
            className="mt-4 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground active:opacity-90"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
