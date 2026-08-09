# 🏪 LoyalHub — 소상공인을 위한 고객 관리 & 쿠폰 발송 앱

> 소상공인용 고객 관리(CRM) 웹 서비스 사이드 프로젝트  
> 초기 화면·스캐폴딩은 AI 빌더([Lovable.dev](https://lovable.dev))로 빠르게 세우고,
> **분석 로직 분리 · 단위 테스트 설계 · CI 구성은 직접 작업했습니다.** ([품질 관리](#-품질-관리))

---

## 📌 프로젝트 소개

LoyalHub은 소규모 가게·매장을 운영하는 사장님을 위한 **고객 관리(CRM) + 쿠폰 발송 웹 앱**입니다.  
고객 목록을 한눈에 보고, 개별 고객 상세 정보를 확인하며, 쿠폰·문자를 손쉽게 보낼 수 있습니다.

### 주요 기능

| 기능 | 설명 |
|------|------|
| 🔐 회원가입 / 로그인 | 이메일+비밀번호 입력 폼, 가게 이름·카테고리 등록 (현재는 데모 인증 — 아래 [인증 흐름](#-인증-흐름) 참고) |
| 📊 대시보드 | 주요 지표 위젯, 차트(Recharts)로 현황 한눈에 파악 |
| 👥 고객 목록 | 전체 고객 리스트 조회, 검색·필터 |
| 👤 고객 상세 | 개별 고객 방문 이력, 포인트, 등급 등 상세 정보 |
| 🎫 쿠폰 발송 | 선택한 고객에게 쿠폰 생성 및 발송 |
| 📱 SMS 발송 | sms-server를 통한 문자 메시지 발송 |
| ⚙️ 설정 | 계정·가게 정보 관리 |

---

## 🛠 기술 스택

```
Frontend   React 18 + TypeScript + Vite
UI         shadcn/ui + Radix UI + Tailwind CSS
상태관리    TanStack React Query
라우팅     React Router DOM v6
백엔드     Supabase (Auth + DB + Storage)
폼         React Hook Form + Zod
차트       Recharts
SMS        sms-server.cjs (Node.js 로컬 서버)
배포       Vercel
테스트     Vitest + Testing Library
CI         GitHub Actions (lint · test · build)
```

---

## 🧪 품질 관리

AI 빌더로 생성된 초기 코드에는 테스트도 CI도 없었습니다.
QA 엔지니어로서 아래는 직접 설계하고 적용했습니다.

### 분석 로직 단위 테스트 — `src/lib/analytics.test.ts` (Vitest, 20케이스)

검증할 값이 있는 계산 로직을 화면에서 `lib/` 으로 분리한 뒤, 관점을 나눠 케이스를 설계했습니다.

| 관점 | 설계한 케이스 |
|------|--------------|
| **경계값 분석** | 이탈 위험도 판정에서 `14일 = ok` / `15일 = warn` 처럼 임계값 바로 위·아래를 각각 고정 |
| **예외 입력** | `null` · `undefined` · 파싱 불가능한 날짜 문자열 · 미래 날짜(음수가 나오지 않도록 0으로 클램프) |
| **설정값 폴백** | 객단가·전환율 설정이 localStorage 에 없거나 값이 깨졌을 때 기본값으로 되돌아오는 경로 |

### CI — `.github/workflows/ci.yml`

push·PR 마다 `lint → test → build` 를 자동 실행해, 검사가 깨진 코드가 `main` 에 남지 않도록 했습니다.

### 직접 발견·수정한 결함

- `Login.tsx` 에서 조건부 `return` **뒤에** `useState` 가 호출되던 React Hooks 규칙 위반
- lint 에러 정리 (`require` → `import`, 빈 interface, 사용되지 않는 `eslint-disable` 주석)
- 로그인이 실제 인증이 아닌 **데모 인증**임을 README·화면에 명시 (오해 소지 제거)

---

## 📁 폴더 구조

```
sideproject/
├── public/                  # 정적 파일 (favicon 등)
├── src/
│   ├── pages/               # 라우트별 화면 컴포넌트
│   │   ├── Login.tsx        # 로그인 페이지
│   │   ├── Signup.tsx       # 회원가입 페이지
│   │   ├── Dashboard.tsx    # 대시보드 메인
│   │   ├── CustomerList.tsx # 고객 목록
│   │   ├── CustomerDetail.tsx # 고객 상세
│   │   ├── CouponSend.tsx   # 쿠폰 발송
│   │   └── Settings.tsx     # 설정
│   ├── contexts/
│   │   └── AuthContext.tsx  # 전역 인증 상태 (localStorage 기반)
│   ├── components/
│   │   ├── ui/              # shadcn/ui 기반 재사용 UI 원자 컴포넌트
│   │   │                    # (Button, Input, Dialog, Table, Toast 등)
│   │   └── ...              # 대시보드 위젯, 하단 네비게이션, 카드 등
│   ├── lib/
│   │   ├── supabaseApi.ts   # Supabase 연동 API 함수
│   │   ├── analytics.ts     # 이탈 위험도·객단가·전환율 등 분석 로직
│   │   ├── analytics.test.ts # 분석 로직 단위 테스트 (경계값·예외·폴백)
│   │   ├── sms.ts           # SMS 발송 유틸
│   │   └── utils.ts         # 공통 유틸리티
│   ├── hooks/
│   │   ├── use-toast.ts     # 토스트 알림 훅
│   │   └── use-mobile.tsx   # 모바일 감지 훅
│   ├── test/
│   │   └── setup.ts         # 테스트 환경 설정 (jsdom · jest-dom)
│   └── App.tsx              # 라우터 및 전역 레이아웃
├── .github/workflows/ci.yml # lint · test · build 자동 실행
├── sms-server.cjs           # SMS 발송용 Node.js 로컬 서버
├── vercel.json              # Vercel 배포 설정
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 🚀 시작하기

### 사전 요구 사항

- Node.js 18 이상
- npm 또는 bun

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/changmindev/sideproject.git
cd sideproject

# 2. 의존성 설치
npm install
# 또는
bun install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### SMS 서버 실행 (선택)

문자 발송 기능을 사용하려면 별도로 SMS 서버를 실행합니다.

```bash
node sms-server.cjs
```

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### 테스트

```bash
npm run test
```

---

## 🔐 인증 흐름

앱은 **localStorage 기반 데모 인증**을 사용합니다.

- `loyalhub:isLoggedIn` — 로그인 여부 저장
- `loyalhub:user` — 사용자 프로필 저장

| 상태 | 동작 |
|------|------|
| 미로그인 상태로 보호 라우트 접근 | `/login` 으로 리다이렉트 |
| 로그인 상태로 `/login`, `/signup` 접근 | `/` (대시보드)로 리다이렉트 |
| 앱 새로고침 | localStorage에서 auth 상태 복원 후 라우팅 결정 |

> **isReady** 플래그를 통해 hydration 전 화면 깜빡임(flicker)을 방지합니다.

---

## ☁️ 배포

이 프로젝트는 **Vercel**로 배포됩니다.

```bash
# Lovable에서 배포
# Lovable 프로젝트 → Share → Publish 클릭
```

또는 Vercel CLI / GitHub 연동으로 자동 배포 가능합니다.

---

## 🧑‍💻 어떻게 만들었나

초기 구현은 AI 빌더([Lovable.dev](https://lovable.dev))로 진행했습니다. 원하는 기능을
자연어로 설명하면 코드가 생성되는 방식이라, 화면·라우팅처럼 정형화된 부분을
빠르게 세울 수 있었습니다.

```
초기 스캐폴딩 (AI 빌더)  →  분석 로직 분리 · 단위 테스트 · CI 구성 (직접)
```

다만 그렇게 나온 코드에는 **테스트도, CI도, Hooks 규칙 위반을 잡아줄 장치도
없었습니다.** 생성 결과를 그대로 두지 않고 검증할 값이 있는 로직을 `lib/` 으로
분리한 뒤, 경계값·예외 입력 중심으로 테스트를 붙이고 CI 에 태우는 작업을 직접
했습니다. 자세한 내용은 [품질 관리](#-품질-관리) 참고.

---

## 📝 개발 스크립트 정리

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 시작 |
| `npm run build` | 프로덕션 빌드 |
| `npm run build:dev` | 개발 모드 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | ESLint 검사 |
| `npm run test` | 테스트 1회 실행 |
| `npm run test:watch` | 테스트 watch 모드 |
