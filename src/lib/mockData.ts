/**
 * 데모 시드 데이터.
 *
 * 🔴 날짜는 **고정값이 아니라 실행 시점 기준 상대값**이다.
 *
 * 예전에는 `2026-02-24` 같은 고정 날짜였다. 그러면 시간이 지날수록 전원이
 * "이탈 위험" 한 칸으로 몰리고, 대시보드의 다섯 세그먼트 중 네 개가 항상 0이 된다.
 * 실제로 그 상태에서 `오늘 방문 0 · 7~30일 미방문 0 · 이탈 위험 8` 이 나왔고,
 * 자동화가 검증할 수 있는 구간이 사실상 하나뿐이었다.
 *
 * 그래서 각 버킷에 최소 1명씩 항상 존재하도록 상대 날짜로 생성한다.
 * 테스트는 **날짜가 아니라 버킷(몇 명이 어느 구간인가)** 을 검증한다.
 *
 * 🔴 전화번호는 **실제로 쓰이지 않는 `010-0000-XXXX` 대역**만 쓴다.
 *
 * `010-1234-5678` 처럼 그럴듯한 연속 번호는 실존 가입자의 번호일 수 있다.
 * 공개 저장소에 올라가는 데모 데이터에 남의 번호를 박아 두면 안 되고,
 * 혹시라도 발송 경로가 열리는 날 그 번호로 문자가 나간다.
 * 가운데 자리 `0000` 은 이동통신 가입자 번호로 할당되지 않는다.
 *
 * ⚠️ `daysAgo` 는 UTC 기준이다. 대시보드의 '오늘 방문' 판정이
 * `new Date().toISOString().slice(0, 10)`(UTC)이라 기준을 맞춰야
 * `daysAgo(0)` 이 항상 '오늘'로 잡힌다. 기준이 어긋나면 KST 오전 9시 이전에만
 * 틀리는 종류의 버그가 된다.
 */

export type CustomerGrade = '일반' | '단골' | 'VIP';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  visitCount: number;
  lastVisit: string;
  grade: CustomerGrade;
  memo: string;
  visits: { date: string; note: string }[];
}

export interface CouponHistory {
  id: string;
  title: string;
  sentAt: string;
  targetGrade: CustomerGrade | '전체';
  sentCount: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** n일 전 날짜를 `YYYY-MM-DD` 로. 기준은 UTC(위 주석 참고). */
export function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY_MS).toISOString().slice(0, 10);
}

/**
 * 검증 버킷 — 이 표가 곧 E2E 가 기대하는 값이다.
 * 판정 기준은 analytics.ts 의 getRiskLevel(≤14 안정 / ≤30 주의 / 초과 위험).
 *
 * | 버킷            | 경과일   | 인원 |
 * |-----------------|---------|------|
 * | 오늘 방문        | 0       | 1    |
 * | 이번 주(≤7일)    | 0·1·3·5 | 4    |
 * | 7~30일 미방문    | 9·21    | 2    |
 * | 이탈 위험(>30일) | 38·64·120 | 3  |
 * | 방문 이력 없음   | —       | 1    |
 */
export const customers: Customer[] = [
  {
    id: '1', name: '김민수', phone: '010-0000-0001', visitCount: 42,
    lastVisit: daysAgo(0), grade: 'VIP', memo: '아메리카노 좋아함, 얼음 많이',
    visits: [
      { date: daysAgo(0), note: '아메리카노 2잔' },
      { date: daysAgo(4), note: '카페라떼 1잔' },
      { date: daysAgo(11), note: '아메리카노 1잔, 크로와상' },
    ],
  },
  {
    id: '2', name: '윤하람', phone: '010-0000-0002', visitCount: 33,
    lastVisit: daysAgo(1), grade: 'VIP', memo: '라떼에 시럽 추가',
    visits: [
      { date: daysAgo(1), note: '바닐라라떼' },
      { date: daysAgo(6), note: '카페모카' },
    ],
  },
  {
    id: '3', name: '이서연', phone: '010-0000-0003', visitCount: 28,
    lastVisit: daysAgo(3), grade: 'VIP', memo: '디카페인 선호',
    visits: [
      { date: daysAgo(3), note: '디카페인 라떼' },
      { date: daysAgo(8), note: '녹차라떼' },
    ],
  },
  {
    // 메모가 빈 값인 케이스 — 널 처리와 레이아웃 확인용
    id: '4', name: '박준혁', phone: '010-0000-0004', visitCount: 15,
    lastVisit: daysAgo(5), grade: '단골', memo: '',
    visits: [{ date: daysAgo(5), note: '아메리카노' }],
  },
  {
    id: '5', name: '최유진', phone: '010-0000-0005', visitCount: 12,
    lastVisit: daysAgo(9), grade: '단골', memo: '오후 2시쯤 자주 옴',
    visits: [{ date: daysAgo(9), note: '아이스티' }],
  },
  {
    // 전화번호에 하이픈이 없는 케이스 — 검색·표시 처리 확인용
    id: '6', name: '정다은', phone: '01000000006', visitCount: 9,
    lastVisit: daysAgo(21), grade: '단골', memo: '샌드위치 세트 자주 주문',
    visits: [{ date: daysAgo(21), note: '샌드위치 세트' }],
  },
  {
    id: '7', name: '한지우', phone: '010-0000-0007', visitCount: 5,
    lastVisit: daysAgo(38), grade: '일반', memo: '개인 텀블러 지참',
    visits: [{ date: daysAgo(38), note: '아메리카노' }],
  },
  {
    id: '8', name: '오세훈', phone: '010-0000-0008', visitCount: 3,
    lastVisit: daysAgo(64), grade: '일반', memo: '',
    visits: [{ date: daysAgo(64), note: '카페라떼' }],
  },
  {
    // 이름이 긴 케이스(복성) — 목록·상세 레이아웃 확인용
    id: '9', name: '남궁민서', phone: '010-0000-0009', visitCount: 2,
    lastVisit: daysAgo(120), grade: '일반', memo: '조용한 자리 선호',
    visits: [{ date: daysAgo(120), note: '아메리카노' }],
  },
  {
    // 🔴 방문 이력이 없는 케이스. daysSince() 가 null 을 돌려주는 유일한 경로다.
    // 이 사람이 없으면 getRiskLevel(null) 분기를 아무도 밟지 않는다.
    id: '10', name: '서지호', phone: '010-0000-0010', visitCount: 0,
    lastVisit: '', grade: '일반', memo: '예약만 남기고 아직 방문 전',
    visits: [],
  },
];

export const couponHistory: CouponHistory[] = [
  { id: 'c1', title: '이번 주 음료 1잔 무료 쿠폰', sentAt: daysAgo(0), targetGrade: 'VIP', sentCount: 3 },
  { id: 'c2', title: '가을 신메뉴 안내', sentAt: daysAgo(3), targetGrade: '전체', sentCount: 10 },
  { id: 'c3', title: '단골 고객 감사 이벤트', sentAt: daysAgo(10), targetGrade: '단골', sentCount: 3 },
  { id: 'c4', title: '첫 방문 감사 쿠폰', sentAt: daysAgo(24), targetGrade: '일반', sentCount: 4 },
  { id: 'c5', title: '겨울 시즌 10% 할인', sentAt: daysAgo(40), targetGrade: '전체', sentCount: 8 },
];
