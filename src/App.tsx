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
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

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
          <BottomNav />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
