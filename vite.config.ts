import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    // 🔴 예전에는 "::" 였다 — 모든 네트워크 인터페이스에 열린다는 뜻이다.
    //
    // 개발 서버에는 고칠 수 없는 알려진 취약점이 있다. esbuild 는 어떤
    // 웹사이트든 개발 서버로 요청을 보내 응답을 읽게 하고(GHSA-67mh-4wv8-2f99),
    // vite 5 에는 최적화 의존성 경로 순회 문제가 있다. 둘 다 각 메이저의
    // 최신 패치에서도 남아 있어, 올리려면 메이저 업그레이드가 필요하다.
    //
    // 노출면은 지금 줄일 수 있다. 루프백에만 묶으면 같은 Wi-Fi 에 있는
    // 누구나가 아니라 이 기기에서만 닿는다. 카페·코워킹에서 npm run dev 를
    // 켜두는 것과 같은 네트워크에 파일을 열어두는 것은 다른 이야기다.
    //
    // 다른 기기에서 확인해야 하면 그때만 `npm run dev -- --host` 로 연다.
    host: "127.0.0.1",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
