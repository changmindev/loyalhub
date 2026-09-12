import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import CustomerList from "./pages/CustomerList";
import CouponSend from "./pages/CouponSend";
import CustomerDetail from "./pages/CustomerDetail";
import BottomNav from "./components/BottomNav";
import DemoBanner from "./components/DemoBanner";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollRestoration from "./components/ScrollRestoration";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 기본값 3회 재시도 + 지수 백오프면 실패가 화면에 드러나기까지 10초가 넘는다.
      // 그동안 화면은 계속 "불러오는 중..." 이다 — 사용자는 멈춘 줄 알고,
      // 자동화는 로딩과 실패를 구분하지 못한다. 1회로 줄여 빨리 드러낸다.
      retry: 1,
      // 창 포커스가 바뀔 때마다 다시 불러오면 E2E 도중 예고 없이 상태가 바뀐다.
      refetchOnWindowFocus: false,
    },
  },
});

const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const { isReady, isLoggedIn } = useAuth();
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <ScrollRestoration />
          <DemoBanner />
          {/* 경계를 Routes 바깥이 아니라 안쪽에 두는 이유:
              화면 하나가 죽어도 하단 네비게이션은 살아 있어야
              사용자가 다른 화면으로 빠져나갈 수 있다. */}
          <ErrorBoundary>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/customers"
                element={
                  <RequireAuth>
                    <CustomerList />
                  </RequireAuth>
                }
              />
              <Route
                path="/customers/:id"
                element={
                  <RequireAuth>
                    <CustomerDetail />
                  </RequireAuth>
                }
              />
              <Route
                path="/coupon"
                element={
                  <RequireAuth>
                    <CouponSend />
                  </RequireAuth>
                }
              />
              <Route
                path="/settings"
                element={
                  <RequireAuth>
                    <Settings />
                  </RequireAuth>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
          <BottomNav />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
