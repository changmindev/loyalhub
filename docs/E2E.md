# E2E 자동화 기준

Playwright 테스트를 붙이기 위한 계약을 적는다. **테스트가 의존해도 되는 것**과
**의존하면 안 되는 것**을 여기서 가른다.

---

## 1. 전제 — 데모 모드로 돈다

Supabase 환경변수가 없으면 앱은 **데모 모드**로 뜬다(`src/supabaseClient.ts`).
데이터는 `src/lib/mockData.ts` 시드를 `src/lib/demoStore.ts` 가 localStorage 에 얹어 제공한다.

E2E 는 **항상 데모 모드에서 돈다.** 외부 의존이 0이라 결정적이고, 실수로 실서비스
데이터를 건드릴 일이 없다. `.env` 가 있으면 데모 모드가 풀리므로 CI 에서는 두지 않는다.

🔴 **문자 발송은 데모 모드에서 네트워크 요청 자체가 나가지 않는다**(`src/lib/sms.ts`).
테스트가 실제 발송 경로를 밟을 수 없다 — 이게 설계된 방어선이다.

---

## 2. localStorage 계약

앱이 읽고 쓰는 키. 테스트는 **페이지 로드 전에** `addInitScript` 로 심는다.
(`demoStore` 는 모듈 로드 시점에 한 번 읽으므로, 로드 후에 바꾸면 반영되지 않는다.)

| 키 | 값 | 용도 |
|---|---|---|
| `loyalhub:isLoggedIn` | `"true"` | 로그인 상태. 심어두면 로그인 화면을 건너뛴다 |
| `loyalhub:user` | `{"name","storeName",...}` JSON | 사장님 이름·매장명 |
| `loyalhub:demo` | `{customers,coupons,settings}` JSON | 데모 데이터. **지우면 시드로 복구된다** |
| `loyalhub:avgTicket` | 숫자 문자열 | 객단가 (고객 가치 계산) |
| `loyalhub:conversionRate` | 0~1 | 쿠폰 전환율 추정 |

```ts
// 각 테스트를 같은 상태에서 시작한다
await page.addInitScript(() => {
  window.localStorage.removeItem("loyalhub:demo");      // 시드로 복구
  window.localStorage.setItem("loyalhub:isLoggedIn", "true");  // 로그인 건너뛰기
});
```

> 앱 코드에 테스트 전용 전역 훅(`window.__test` 류)은 **넣지 않았다.**
> 제품에 테스트용 표면을 만들면 그게 곧 운영 코드가 된다. localStorage 계약만으로 충분하다.

---

## 3. 더미데이터 버킷 — 테스트가 기대하는 값

🔴 **날짜는 고정값이 아니라 실행 시점 기준 상대값이다.** 그래서 테스트는
**날짜가 아니라 버킷 인원수**를 검증한다. 고정 날짜였을 때는 시간이 지나며
전원이 "이탈 위험" 한 칸으로 몰려 세그먼트 다섯 중 넷이 항상 0이었다.

판정 기준은 `src/lib/analytics.ts` `getRiskLevel` — `≤14 안정 / ≤30 주의 / 초과 위험`.

| 버킷 | 경과일 | 인원 | 대상 화면 |
|---|---|---|---|
| 오늘 방문 | 0 | **1** | 대시보드 `stat-today-visitors` |
| 이번 주 (≤7일) | 0·1·3·5 | **4** | 목록 `segment-tab-this-week` |
| 7~30일 미방문 | 9·21 | **2** | 대시보드 `segment-stale7` |
| 이탈 위험 (>30일) | 38·64·120 | **3** | 목록 `segment-tab-churn`, 대시보드 `segment-danger` |
| 방문 이력 없음 | — | **1** | `daysSince(null)` 분기 (서지호) |
| 전체 | | **10** | 대시보드 `stat-total-customers` |
| VIP | | **3** | 대시보드 `stat-vip`, 목록 `segment-tab-vip` |

등급 분포: VIP 3 · 단골 3 · 일반 4. 쿠폰 이력 5건.

**의도적으로 넣은 엣지 케이스**

| 고객 | 케이스 | 확인할 것 |
|---|---|---|
| 박준혁 · 오세훈 | 메모가 빈 문자열 | 널 처리, 레이아웃 |
| 정다은 | 전화번호에 하이픈 없음 (`01056789012`) | 검색·표시 |
| 남궁민서 | 긴 이름(복성) | 목록·상세 레이아웃 |
| 서지호 | 방문 0회, `lastVisit` 빈 값 | 세그먼트 필터에서 **제외**되는가 (`d != null` 가드) |

⚠️ `daysAgo()` 는 **UTC 기준**이다(대시보드의 '오늘' 판정과 기준을 맞춤).
UTC 자정을 걸쳐 실행되면 '오늘 방문' 버킷이 흔들릴 수 있다 — 드물지만 알고 있을 것.

---

## 4. 셀렉터

테스트는 `data-testid` 만 쓴다. **문구·클래스·DOM 순서에 의존하지 않는다** —
전부 제품이 멀쩡한데 테스트만 깨지는 원인이다.

| 화면 | testid |
|---|---|
| 공통 | `demo-banner` · `query-error` · `query-error-retry` |
| 로그인 | `login-email` · `login-password` · `login-submit` |
| 회원가입 | `signup-email` · `signup-password` · `signup-password-confirm` · `signup-store-name` · `signup-category` · `signup-submit` |
| 대시보드 | `stat-today-visitors` · `stat-total-customers` · `stat-vip` · `stat-recent-coupon` · `segment-stale7` · `segment-danger` |
| 단골 목록 | `customer-count` · `customer-item`(+`data-customer-name`) · `grade-filter-{전체\|VIP\|단골\|일반}` · `segment-tab-{all\|vip\|churn\|this-week}` |
| 쿠폰 발송 | `sms-demo-notice` · `target-option-{전체\|VIP\|단골\|일반}` · `target-count` · `coupon-message` · `coupon-send` · `coupon-history-item` |

입력칸은 `<label for>` 로 연결돼 있어 `getByLabel("이메일")` 도 쓸 수 있다.

세그먼트는 **URL 이 단일 출처**다 — `/customers?seg={all|vip|churn|this-week}` 으로
바로 진입할 수 있어 탭을 클릭하지 않고 필터 상태를 만들 수 있다. (D-10 에서 고친 부분)

**실측 확인값** (2026-09-12, 위 시드 기준)

| 조건 | 인원 |
|---|---|
| `?seg=all` | 10 |
| `?seg=vip` | 3 |
| `?seg=churn` | 3 (한지우·오세훈·남궁민서) |
| `?seg=this-week` | 4 |
| `?seg=churn` × 등급 `일반` | 3 |

---

## 5. 실패를 일으켜 검증하는 법

연결 실패 UI(`query-error`)는 데모 모드에서는 나지 않는다(요청이 없으므로).
라우트 가로채기로 만든다:

```ts
await page.route("**/rest/v1/**", (route) => route.abort());
```

React Query 재시도는 **1회**로 낮춰 두었다(`src/App.tsx`). 기본값 3회 + 지수 백오프면
실패가 드러나기까지 10초가 넘어, 테스트가 로딩과 실패를 구분하지 못한다.

---

## 6. 검증해 볼 만한 시나리오

1. 로그인 성공 / 미입력 차단(`required`) → 대시보드 진입
2. 대시보드 지표 6종이 §3 버킷과 일치
3. 목록 세그먼트 × 등급 필터 조합 (이탈 위험 3 · 이번 주 4 · VIP 3)
4. 방문 이력 없는 고객이 세그먼트 필터에서 빠지는가
5. 고객 등록 → 목록 반영 → 새로고침 후 유지(localStorage)
6. 쿠폰 발송: 대상 수 산정 → 미리보기 → 발송 → **이력 기록** → 대시보드 `최근 쿠폰` 갱신
7. **실제 문자 요청이 나가지 않는가** (`page.route` 로 `/api/send-sms` 감시, 호출 0회)
8. 연결 실패 시 `query-error` 노출 + 재시도 동작
9. 로그아웃 후 보호 라우트 직접 진입 → `/login` 리다이렉트
