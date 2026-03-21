import type { CustomerGrade } from '@/lib/mockData';

const gradeStyles: Record<CustomerGrade, string> = {
  'VIP': 'bg-vip text-vip-foreground',
  '단골': 'bg-regular text-regular-foreground',
  '일반': 'bg-normal text-normal-foreground',
};

const GradeBadge = ({ grade }: { grade: CustomerGrade }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${gradeStyles[grade]}`}>
    {grade}
  </span>
);

export default GradeBadge;
