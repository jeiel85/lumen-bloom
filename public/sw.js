/* Lumen Bloom 서비스워커 (scope: 이 파일이 있는 /lumen-bloom/ 디렉터리)
 * - 내비게이션: network-first, 실패 시 캐시된 같은 페이지 → index.html (오프라인 실행)
 * - 그 밖의 같은 출처 정적 자산(GET): stale-while-revalidate
 * - 배포 구조가 바뀌면 CACHE_VERSION 을 올려 이전 캐시를 정리한다.
 */
const CACHE_VERSION = "v1";
const CACHE_PREFIX = "lumen-bloom-";
const CACHE_NAME = CACHE_PREFIX + CACHE_VERSION;
const PRECACHE = [
  "./",
  "./index.html",
  "./play.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function putInCache(request, response) {
  if (!response || !response.ok) return;
  const copy = response.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() =>
          caches
            .match(request, { ignoreSearch: true })
            .then((cached) => cached || caches.match("./index.html"))
            .then((cached) => cached || Response.error()),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() => cached || Response.error());
      return cached || network;
    }),
  );
});
