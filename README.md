# 🏪 LoyalHub — 소상공인을 위한 고객 관리 & 쿠폰 발송 앱

> **바이브 코딩(Vibe Coding)** 으로 만든 웹 서비스 사이드 프로젝트  
> AI와 대화하듯 기획·개발을 진행하며 [Lovable.dev](https://lovable.dev) 를 활용해 빠르게 구축했습니다.

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
```

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
│   │   ├── sms.ts           # SMS 발송 유틸
│   │   └── utils.ts         # 공통 유틸리티
│   ├── hooks/
│   │   ├── use-toast.ts     # 토스트 알림 훅
│   │   └── use-mobile.tsx   # 모바일 감지 훅
│   ├── test/
│   │   ├── setup.ts         # 테스트 환경 설정
│   │   └── example.test.ts  # 예제 테스트
│   └── App.tsx              # 라우터 및 전역 레이아웃
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

## 🧑‍💻 바이브 코딩이란?

이 프로젝트는 **바이브 코딩(Vibe Coding)** 방식으로 만들었습니다.  
코드를 직접 한 줄씩 짜는 대신, AI에게 원하는 기능을 자연어로 설명하고  
[Lovable.dev](https://lovable.dev) 가 코드를 자동 생성·수정·커밋합니다.

```
기획 아이디어 → AI에게 프롬프트 → 코드 생성 → GitHub 자동 커밋 → 배포
```

덕분에 기획부터 배포까지 빠르게 프로토타입을 만들 수 있었습니다.

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
