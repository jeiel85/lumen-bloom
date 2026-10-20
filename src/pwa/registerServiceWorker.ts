// 설치형 PWA: 배포 빌드에서만 서비스워커를 등록한다(개발 서버의 HMR 요청을 가로채지 않도록).
// 랜딩(index.html)과 게임(play.html) 양쪽에서 불러온다. scope는 BASE_URL(/lumen-bloom/)이다.
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;
  const register = () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error: unknown) => {
      console.warn("[PWA] Service worker registration failed", error);
    });
  };
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}

registerServiceWorker();
