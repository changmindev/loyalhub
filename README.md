# 🏪 LoyalHub

소상공인용 **고객 관리 + 쿠폰 발송** 데모 앱.

**▶ 라이브 데모 — https://loyalhub-demo.vercel.app**
(로그인은 아무 이메일·비밀번호로 통과합니다)

초기 화면·스캐폴딩은 AI 빌더([Lovable.dev](https://lovable.dev))로 세우고,
**결함을 찾아 고치고 · 테스트를 붙이고 · 자동화 가능한 상태로 정비하는 작업은 직접** 했습니다.

```bash
git clone https://github.com/changmindev/sideproject.git && cd sideproject
npm install
npm run dev          # → http://localhost:8080
```

**환경변수 없이 바로 뜹니다.** Supabase 설정이 없으면 데모 모드로 실행되며,
고객 10명과 쿠폰 이력 5건이 채워진 상태로 모든 화면이 동작합니다.

---

## 이 저장소에서 볼 것

| 문서 | 내용 |
|---|---|
| **[docs/DEFECTS.md](docs/DEFECTS.md)** | 직접 발견한 **결함 24건** — 재현 절차 · 기대/실제 · 원인 · 처리 |
| **[docs/SECURITY.md](docs/SECURITY.md)** | 보안 점검 — 응답 헤더 · 개발 서버 노출 · **고치지 않기로 한 것과 그 이유** |
| **[docs/E2E.md](docs/E2E.md)** | 자동화 기준 — localStorage 계약 · 검증 버킷 · 셀렉터 · 실패 주입법 |
| `src/lib/analytics.test.ts` | 분석 로직 단위 테스트 26케이스 (경계값 · 예외 입력 · 폴백) |
| `src/components/ErrorBoundary.test.tsx` | 렌더 에러가 흰 화면이 되지 않는지 4케이스 |

---

## 데모 범위 / 범위 밖

어디까지 실제로 동작하고 어디부터 형식인지 먼저 밝힙니다.

| 동작함 | 범위 밖 |
|---|---|
| 고객 등록·조회·수정, 등급·방문 이력 | **문자·알림톡 실제 발송** (건당 비용 + 발신번호 사전등록) |
| 방문 최신도 기반 세그먼트·위험도 판정 | **실제 인증** (localStorage 데모 로그인) |
| 쿠폰 대상 산정·미리보기·발송 이력 | 네이버 예약 · 카카오 채널 연동 |
| 객단가 기반 고객 가치·캠페인 효과 추정 | 결제 · 생일 자동 추천 · 고객 삭제 |

🔴 **문자는 발송되지 않습니다.** `sms-server.cjs` 는 참고 구현이고 의존성이 없어 실행되지 않습니다.
데모 모드에서는 프런트엔드가 **네트워크 요청 자체를 만들지 않으므로**, 실수로 문자가 나갈 경로가 없습니다.

---

## 품질 관리

AI 빌더가 만든 코드에는 테스트도 CI도, 잘못된 상태를 잡아줄 장치도 없었습니다.

**단위 테스트** — 검증할 값이 있는 계산 로직을 화면에서 `lib/` 으로 분리한 뒤 관점을 나눠 설계했습니다.

| 관점 | 케이스 |
|---|---|
| 경계값 | 이탈 위험 판정의 `14일 = 안정` / `15일 = 주의` 임계값 위·아래 고정 |
| 예외 입력 | `null` · 파싱 불가 날짜 · 미래 날짜(음수 방지 클램프) |
| 설정값 폴백 | localStorage 값이 없거나 깨졌을 때 기본값 복귀 |

**CI** — `.github/workflows/ci.yml` 에서 push·PR 마다 `lint → typecheck → test → build`.

`typecheck` 가 따로 있는 이유는, `vite build` 가 esbuild 로 **타입을 벗겨내기만 하고
검사하지 않기** 때문입니다. 실제로 import 가 빠진 컴포넌트가 lint·test·build 를
전부 통과해 배포까지 간 적이 있습니다(D-22).

**자동화 준비** — 셀렉터(`data-testid`) · 결정적 시드 · 실패 주입 경로를 갖춰 두었습니다.
E2E 테스트 작성은 아직 **미착수**이며, 기준은 [docs/E2E.md](docs/E2E.md) 에 있습니다.

### 찾아서 고친 것 (대표 5건)

- **에러를 알려주려던 컴포넌트가 오히려 화면을 지움** — 설정 화면이 `QueryErrorNotice` 를
  import 없이 써서, 조회가 실패하는 순간 `ReferenceError` 로 앱 전체가 흰 화면이 됐습니다.
  하필 E2E 가 검증하려는 실패 주입 경로입니다. import 를 고치고, 같은 실수가 반복돼도
  고장 범위가 화면 하나로 묶이도록 `ErrorBoundary` 를 뒀습니다

- **`.env` 없이 클론하면 흰 화면** — import 시점에 `throw` 했습니다. 데모 모드로 전환해 해결
- **실행 불가능한 SMS 서버를 주요 기능으로 안내** — 의존성이 없어 `node sms-server.cjs` 가 즉시 죽습니다. 기능을 만드는 대신 **경계를 명시**
- **고정 날짜 시드** — 시간이 지나며 전원이 한 세그먼트로 몰려 대시보드 다섯 칸 중 넷이 항상 0. 상대 날짜로 전환
- **세그먼트 URL 파라미터가 죽어 있음** — 탭이 쓰기만 하고 아무도 읽지 않아 `?seg=churn` 딥링크가 무효

전체 24건은 [docs/DEFECTS.md](docs/DEFECTS.md) 참고 (22건 수정 · 1건 부분 대응 · 1건 미수정).

이 중 7건(D-18~D-24)은 **1차 수정이 배포본에서 실제로 도는지 확인하다가** 나왔습니다.
로컬에서 `lint · test · build` 가 전부 초록인데도 나왔다는 게 요점입니다.

---

## 기술 스택

```
React 18 · TypeScript · Vite          shadcn/ui · Radix · Tailwind
TanStack Query · React Router v6      Supabase (선택 — 없으면 데모 모드)
Vitest · Testing Library              GitHub Actions (lint·test·build)
```

---

## 실제 데이터로 연결하기 (선택)

```bash
cp .env.example .env   # VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
```

⚠️ **데모 모드는 "환경변수가 없다" 하나만 가리킵니다.** 환경변수가 있는데 요청이 실패하면
데모 데이터로 덮지 않고 에러를 드러냅니다 — 실패를 가짜 값으로 가리면
운영에서 DB가 죽어도 화면이 멀쩡해 보이기 때문입니다.

---

## 기타

**인증** — `loyalhub:isLoggedIn` · `loyalhub:user` 기반 데모 인증.
미로그인 시 보호 라우트는 `/login` 으로 리다이렉트하며, `isReady` 플래그로 hydration 깜빡임을 막습니다.

**배포** — Vercel · https://loyalhub-demo.vercel.app
`vercel.json` 에 SPA 리라이트와 보안 헤더(CSP · 클릭재킹 차단 등)가 있고,
데모 모드 덕분에 환경변수 없이 그대로 배포됩니다.

**스크립트** — `dev` · `build` · `preview` · `lint` · `typecheck` · `test` · `test:watch`

⚠️ `npm run dev` 는 `127.0.0.1` 에만 바인딩합니다. 다른 기기에서 확인하려면
`npm run dev -- --host` 로 여세요 — 이유는 [SECURITY.md](docs/SECURITY.md) 에 있습니다.
