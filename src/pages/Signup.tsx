import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const categories = ["카페", "음식점", "미용", "헬스", "기타"];

const Signup = () => {
  const { isReady, isLoggedIn, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [shopName, setShopName] = useState("");
  const [category, setCategory] = useState(categories[0]);
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
    if (password !== confirmPassword) return;
    setIsSubmitting(true);

    // 데모: 로컬에 프로필 저장 후 로그인 처리
    setTimeout(() => {
      const profile = {
        email,
        name: "",
        phone: "",
        storeName: shopName || "",
        category: category || "",
      };
      login(profile);
      navigate("/", { replace: true });
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-lg border">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold mb-1 tracking-tight">회원가입</h1>
          <p className="text-xs text-muted-foreground">
            사장님 정보와 매장 정보를 등록해 주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              비밀번호 확인
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="********"
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] text-destructive mt-1">
                비밀번호가 일치하지 않습니다.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              매장명 <span className="text-muted-foreground">(선택)</span>
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="매장명"
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5">
              매장 분야 <span className="text-muted-foreground">(선택)</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (!!confirmPassword && password !== confirmPassword)}
            className="mt-1 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground active:opacity-90 transition-opacity"
          >
            {isSubmitting ? "가입 중..." : "회원가입 완료"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>이미 계정이 있으신가요?</span>
          <Link
            to="/login"
            className="text-primary font-semibold hover:underline"
          >
            로그인 하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;

