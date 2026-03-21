import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}

const StatCard = ({ icon: Icon, label, value, sub, className = '' }: StatCardProps) => (
  <div className={`rounded-2xl border bg-card p-4 ${className}`}>
    <div className="flex items-center gap-2 text-muted-foreground mb-2">
      <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
    <p className="text-2xl font-bold tracking-tight">{value}<span className="text-sm font-normal text-muted-foreground ml-0.5">{sub}</span></p>
  </div>
);

export default StatCard;
