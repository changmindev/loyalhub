import { useEffect, useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * 화면을 옮길 때 스크롤 위치를 정리한다.
 *
 * SPA 는 페이지를 다시 불러오지 않으므로 라우트가 바뀌어도 스크롤이 그대로 남는다.
 * 목록을 404px 내려서 고객을 누르면 상세 화면도 404px 지점에서 시작해,
 * 이름과 뒤로가기 버튼이 화면 밖에 있었다.
 *
 * 그렇다고 **모든** 이동에서 최상단으로 보내면 뒤로가기가 망가진다.
 * 목록으로 돌아왔을 때 맨 위로 튀면 보던 자리를 잃는다. 그래서 방향을 나눈다.
 *
 *   · 새로 들어가는 이동(PUSH/REPLACE) → 맨 위에서 시작
 *   · 뒤로/앞으로(POP)                 → 떠날 때의 위치로 복원
 */

const PREFIX = "loyalhub:scroll:";
/** 목록이 다 그려지기 전에는 그 높이까지 스크롤할 수 없다. 몇 프레임 다시 시도한다. */
const MAX_RESTORE_FRAMES = 10;

const ScrollRestoration = () => {
  const { pathname, key } = useLocation();
  const navigationType = useNavigationType();

  // 이 위치를 떠나기 직전의 스크롤을 저장해 둔다.
  useEffect(() => {
    const store = () =>
      sessionStorage.setItem(PREFIX + key, String(Math.round(window.scrollY)));
    window.addEventListener("pagehide", store);
    return () => {
      store();
      window.removeEventListener("pagehide", store);
    };
  }, [key]);

  useLayoutEffect(() => {
    if (navigationType === "POP") {
      const saved = Number(sessionStorage.getItem(PREFIX + key));
      if (Number.isFinite(saved) && saved > 0) {
        let frames = 0;
        const restore = () => {
          window.scrollTo(0, saved);
          // 아직 콘텐츠가 짧아 목표까지 못 갔으면 다음 프레임에 다시.
          if (window.scrollY < saved - 1 && frames++ < MAX_RESTORE_FRAMES) {
            requestAnimationFrame(restore);
          }
        };
        requestAnimationFrame(restore);
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, key, navigationType]);

  return null;
};

export default ScrollRestoration;
