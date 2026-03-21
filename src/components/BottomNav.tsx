import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Send, } from 'lucide-react';

const navItems = [
  { path: '/', label: '대시보드', icon: LayoutDashboard },
  { path: '/customers', label: '단골 목록', icon: Users },
  { path: '/coupon', label: '쿠폰 발송', icon: Send },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card">
      <div className="mx-auto flex max-w-lg">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
