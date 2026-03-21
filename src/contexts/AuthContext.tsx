import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type UserProfile = {
  email: string;
  name: string;
  phone: string;
  storeName: string;
  category: string;
};

type AuthContextValue = {
  isReady: boolean;
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (profile?: UserProfile) => void;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "loyalhub:isLoggedIn";
const STORAGE_PROFILE_KEY = "loyalhub:user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const storedProfile = window.localStorage.getItem(STORAGE_PROFILE_KEY);

    if (stored === "true") {
      setIsLoggedIn(true);
    }
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile) as UserProfile;
        setUser(parsed);
      } catch {
        // ignore parse error
      }
    }
    setIsReady(true);
  }, []);

  const persistProfile = (profile: UserProfile | null) => {
    if (profile) {
      window.localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    } else {
      window.localStorage.removeItem(STORAGE_PROFILE_KEY);
    }
  };

  const login = (profile?: UserProfile) => {
    setIsLoggedIn(true);
    window.localStorage.setItem(STORAGE_KEY, "true");
    if (profile) {
      setUser(profile);
      persistProfile(profile);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    persistProfile(null);
  };

  const updateProfile = (profile: UserProfile) => {
    setUser(profile);
    persistProfile(profile);
  };

  return (
    <AuthContext.Provider value={{ isReady, isLoggedIn, user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }
  return ctx;
};

