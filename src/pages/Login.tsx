import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const { isReady, isLoggedIn, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 현재는 데모용 로컬 로그인 (실제 인증 연동은 준비중)
    setTimeout(() => {
      login();
      navigate("/", { replace: true });
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-lg border">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-1 tracking-tight">
            Loyal Customer Hub
          </h1>
          <p className="text-xs text-muted-foreground">
            사장님 전용 단골 관리 대시보드
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold mb-1.5">
              이메일
            </label>
            <input
              id="login-email"
              name="email"
              data-testid="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold mb-1.5">
              비밀번호
            </label>
            <input
              id="login-password"
              name="password"
              data-testid="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <button
            data-testid="login-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground active:opacity-90 transition-opacity"
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>아직 계정이 없으신가요?</span>
          <Link
            to="/signup"
            className="text-primary font-semibold hover:underline"
          >
            회원가입 하기
          </Link>
        </div>

        <div className="mt-4 rounded-xl border bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 text-yellow-900 px-2 py-0.5 text-[10px] font-semibold mr-1">
            데모 인증
          </span>
          실제 이메일/비밀번호 인증, 결제 연동은 나중에 붙일 수 있도록 설계된
          데모 로그인 화면입니다.
        </div>
      </div>
    </div>
  );
};

export default Login;

