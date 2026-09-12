import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

/**
 * 이 경계가 필요했던 이유는 실제 사고에서 나왔다.
 * 설정 화면이 컴포넌트를 import 없이 써서, 조회가 실패하는 순간
 * ReferenceError 가 나고 React 가 트리 전체를 언마운트했다 — 흰 화면(D-22).
 *
 * 원인은 고쳤지만 같은 종류의 실수는 또 날 수 있다.
 * 그때 고장 범위가 화면 하나로 묶이는지를 여기서 고정한다.
 *
 * React 는 잡힌 에러도 콘솔에 찍는다. 테스트 출력이 에러로 뒤덮이면
 * 진짜 실패를 못 알아보므로 이 파일에서만 조용히 시킨다.
 */
const silenceReactErrorLog = () =>
  vi.spyOn(console, "error").mockImplementation(() => {});

afterEach(() => {
  vi.restoreAllMocks();
});

const Boom = ({ message }: { message: string }) => {
  throw new Error(message);
};

describe("ErrorBoundary", () => {
  it("에러가 없으면 자식을 그대로 보여준다", () => {
    render(
      <ErrorBoundary>
        <p>정상 화면</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText("정상 화면")).toBeInTheDocument();
    expect(screen.queryByTestId("error-boundary")).not.toBeInTheDocument();
  });

  it("자식이 렌더 중 던지면 흰 화면 대신 안내를 보여준다", () => {
    silenceReactErrorLog();
    render(
      <ErrorBoundary>
        <Boom message="QueryErrorNotice is not defined" />
      </ErrorBoundary>,
    );

    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    expect(screen.getByText("화면을 표시하지 못했습니다")).toBeInTheDocument();
    // 재시도 경로가 없으면 사용자는 갇힌다.
    expect(screen.getByTestId("error-boundary-reload")).toBeInTheDocument();
  });

  it("원인 메시지를 화면에 남긴다 — 조용히 삼키면 추적이 불가능하다", () => {
    silenceReactErrorLog();
    render(
      <ErrorBoundary>
        <Boom message="lastVisit is not a function" />
      </ErrorBoundary>,
    );
    expect(screen.getByText("lastVisit is not a function")).toBeInTheDocument();
  });

  it("스크린리더가 알 수 있도록 role=alert 로 알린다", () => {
    silenceReactErrorLog();
    render(
      <ErrorBoundary>
        <Boom message="boom" />
      </ErrorBoundary>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
