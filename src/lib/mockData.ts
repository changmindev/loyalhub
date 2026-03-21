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

export const customers: Customer[] = [
  {
    id: '1', name: '김민수', phone: '010-1234-5678', visitCount: 42, lastVisit: '2026-02-24',
    grade: 'VIP', memo: '아메리카노 좋아함, 얼음 많이',
    visits: [
      { date: '2026-02-24', note: '아메리카노 2잔' },
      { date: '2026-02-22', note: '카페라떼 1잔' },
      { date: '2026-02-20', note: '아메리카노 1잔, 크로와상' },
      { date: '2026-02-18', note: '바닐라라떼 1잔' },
    ],
  },
  {
    id: '2', name: '이서연', phone: '010-2345-6789', visitCount: 28, lastVisit: '2026-02-23',
    grade: 'VIP', memo: '디카페인 선호',
    visits: [
      { date: '2026-02-23', note: '디카페인 라떼' },
      { date: '2026-02-21', note: '디카페인 아메리카노' },
      { date: '2026-02-19', note: '녹차라떼' },
    ],
  },
  {
    id: '3', name: '박준혁', phone: '010-3456-7890', visitCount: 15, lastVisit: '2026-02-22',
    grade: '단골', memo: '',
    visits: [
      { date: '2026-02-22', note: '카푸치노' },
      { date: '2026-02-18', note: '아메리카노' },
    ],
  },
  {
    id: '4', name: '최유진', phone: '010-4567-8901', visitCount: 12, lastVisit: '2026-02-21',
    grade: '단골', memo: '우유 알레르기 주의',
    visits: [
      { date: '2026-02-21', note: '블랙티' },
      { date: '2026-02-15', note: '아메리카노' },
    ],
  },
  {
    id: '5', name: '정하늘', phone: '010-5678-9012', visitCount: 8, lastVisit: '2026-02-20',
    grade: '단골', memo: '',
    visits: [{ date: '2026-02-20', note: '카페모카' }],
  },
  {
    id: '6', name: '한소희', phone: '010-6789-0123', visitCount: 3, lastVisit: '2026-02-19',
    grade: '일반', memo: '신규 고객',
    visits: [{ date: '2026-02-19', note: '아이스티' }],
  },
  {
    id: '7', name: '오민재', phone: '010-7890-1234', visitCount: 2, lastVisit: '2026-02-17',
    grade: '일반', memo: '',
    visits: [{ date: '2026-02-17', note: '에스프레소' }],
  },
  {
    id: '8', name: '윤지아', phone: '010-8901-2345', visitCount: 1, lastVisit: '2026-02-15',
    grade: '일반', memo: '첫 방문',
    visits: [{ date: '2026-02-15', note: '카페라떼' }],
  },
];

export const couponHistory: CouponHistory[] = [
  { id: '1', title: '2월 감사 쿠폰 - 음료 1잔 무료', sentAt: '2026-02-20', targetGrade: 'VIP', sentCount: 2 },
  { id: '2', title: '겨울 시즌 10% 할인', sentAt: '2026-02-15', targetGrade: '전체', sentCount: 8 },
  { id: '3', title: '단골 고객 감사 이벤트', sentAt: '2026-02-10', targetGrade: '단골', sentCount: 3 },
];
