/* ═══════════════════════════════════════════════════
   v6.1.6 (2026-11-26) — 하단 단추 통일 — 공통 원본 MM-FAB v1.0 주입(오른쪽 아래 안내 · 초기화 · 앱 설치 · 건물개요 단추를 한 기둥으로 — 단추 72×76 · 건물개요 72×28 · 간격 8px · z-index 1200 · 숨은 단추는 자리 없음 · 설치 뒤 · 앱 실행 중 설치 단추 숨김 · 설치 띠가 뜨면 기둥을 그 위로 · 휴대폰 가로 60×60) — 계산 불변 · 인쇄는 설치 · 업데이트 띠만 숨김 · MIN 「권장안대로 승인」 · 캐시명 v6.1.6 (종전 v6.1.5)
   v6.1.5 (2026-11-25) — 헤더 고정 — 공통 원본 MM-HEADER v1.1 주입(태블릿 · 데스크톱만 — 폭 768px · 높이 600px 이상, 휴대폰은 고정 없음 · 머리+탭 sticky · 내리면 제목 한 줄+탭으로 접힘 · 다른 sticky 패널 top 보정) — 계산 · 인쇄 불변 · MIN 「추천안대로 승인」 · 「추천안대로 진행해줘」(모바일 제외) · 캐시명 v6.1.5 (종전 v6.1.4)
   v6.1.4 (2026-11-22) — Claude × Gemini 교차검증 반영(MIN 「2건 모두 반영」): ① 70% 미만 안내(카드 · 결과 · A4)에 지침 제63조제4호 단서 「공동주택은 해당 대상 중 100분의 30 내외에서 평가」 ② 기계 · 기구손료율이 고시값(별표 25 제5호)과 다르면 힌트를 붉게 「고시값 ○%와 다름 — 협의 근거 필요」 — 계산 불변 · 캐시명 v6.1.4 (종전 v6.1.3)
   v6.1.3 (2026-11-20) — 「노임 적용연도」(엔지니어링 노임단가 건설부문 2022~2026) · 「시중노임 반기」(대한건설협회 1003 특별인부 2022 상반기~2026 하반기) 선택칸 — 고르면 고급기술자 · 특별인부 입력칸이 채워짐(칸을 고치면 「직접 입력」), A4 「적용 법령 및 기준」 노임 두 줄을 「○○년 엔지니어링 노임단가 — 협회 공표일 · 적용일, 건설부문 고급기술자 ○원/일」 · 「○○년 ○반기 건설업 시중노임단가 — 대한건설협회 공표일 · 적용일, 직종번호 1003 특별인부 ○원/일」로, 총괄표 노임단가 칸 · 꼬리말에 연도(MIN 「권장 안으로 진행해줘」 2026-11-20) · 캐시명 v6.1.3 (종전 v6.1.2)
   v6.1.2 (2026-11-12) — html2canvas 1.4.1 머리 태그 SRI(integrity sha384 · crossorigin) · 공통 인쇄 원본 MM-PRINT v1.0 → v1.1(지연 로더도 SRI)(정밀검토 B8 · html2canvas SRI) — 화면 · 계산 · 인쇄 불변 · 작업지시서 §25-6-87 · 캐시명 v6.1.2 (종전 v6.1.1)
   v6.1.1 (2026-11-12) — Pretendard CSS SRI(integrity · crossorigin)(정밀검토 C2) — 화면 · 계산 · 인쇄 불변 · 작업지시서 §25-6-82 · 캐시명 v6.1.1 (종전 v6.1.0)
   v6.1.0 (2026-11-12) — 검색 설명 메타(description) 추가(정밀검토 B15 · 작업지시서 §25-6-75) · 판 6.1 · 캐시명 v6.1.0 (종전 sifee-v1.0.4)
   안전점검등 대가 산출기 (건축물)  MANMIN Ver-6.1
   Service Worker — 오프라인 캐시 + 버전 업데이트
   ARCHITECT KIM MANMIN

   v1.0.0 (2026-11-09) — 신규. 해체감리 v5.0.17 sw 구조(문서 Network-first · 자기 접두어 캐시만 조회 ·
   allSettled 프리캐시 · R25 opaque 가드)를 그대로 쓰고 접두어만 'sifee-' 로 바꿨다.
   ⛔ navigate 분기를 제거하지 말 것. 제거하면 배포가 화면에 반영되지 않는다.
═══════════════════════════════════════════════════ */
const PREFIX = 'sifee-';
/* ═ R25 (2026-09-04) — SW 캐시 origin 오염 차단 (S10 · 지시서 §21-1 R25)
   전역 caches 의 match 는 origin 전체를 검색한다. manminkim-eng.github.io 는 34종이 한 origin 이라
   다른 도구 캐시의 opaque 응답이 <script crossorigin>(cors) 요청에 돌아가 스크립트가 폐기됐다
   (30 #root 빈 화면 · 40 html2canvas undefined). 자기 접두어 캐시만 조회하고, cross-origin
   프리캐시는 cors 로 받으며, opaque↔cors 불일치 시 캐시를 쓰지 않는다. */
const MM_EXCLUDE = [];   /* 내 접두어로 시작하지만 남의 캐시인 이름 (§17-1 충돌) */
const mmOwn   = (k) => k.indexOf(PREFIX) === 0 && !MM_EXCLUDE.some((x) => k.indexOf(x) === 0);
const mmReq   = (u) => (typeof u === 'string' && u.indexOf('http') === 0) ? new Request(u, { mode: 'cors' }) : u;
const mmMatch = (req, opt) => caches.keys()
  .then((ks) => ks.filter(mmOwn))
  .then((ks) => ks.reduce((p, k) => p.then((r) => r || caches.open(k).then((c) => c.match(req, opt))), Promise.resolve(undefined)))
  .then((r) => (r && r.type === 'opaque' && req && req.mode === 'cors') ? undefined : r);

const CACHE  = 'sifee-v6.1.6';   /* 2026-11-09 사용자 매뉴얼 연결 — 탭 막대 📘 매뉴얼(매뉴얼은 프리캐시 안 함) (종전 v1.0.3 인쇄 서명란 최하단) */
const ORPHAN = [];
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './icons/brand-icon.jpg',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/favicon-16.png',
  /* v5.0 — 로컬 폴백 폰트. CDN 차단·오프라인 시 한글 깨짐 방지 (§3-7) */
  './assets/fonts/manmin-fonts.css',
  './assets/fonts/NotoSansKR-var.woff2',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', e => {
  console.log('[SW] Install:', CACHE);
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(
        ASSETS.map(u => c.add(mmReq(u)).catch(err => console.warn('[SW] precache skip:', u, err)))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  console.log('[SW] Activate:', CACHE);
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        /* ⛔ 자기 접두어(+ORPHAN)만 지운다. caches.keys() 는 origin 전체를 반환하므로
           manminkim-eng.github.io 를 39종이 공유하는 이 구조에서 무조건 지우면
           나머지 38종의 캐시를 통째로 날린다(§17-1 · §18-7). */
        keys.filter(k => k !== CACHE && (mmOwn(k) || ORPHAN.indexOf(k) !== -1))
            .map(k => { console.log('[SW] 구버전 캐시 삭제:', k); return caches.delete(k); })
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  /* ══ ⛔ 핵심 ══ HTML 문서는 Network-first.
     네트워크가 되면 항상 최신을 보여주고, 끊겼을 때만 캐시로 떨어진다. */
  if (e.request.mode === 'navigate' || e.request.destination === 'document') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => mmMatch(e.request).then(c => c || mmMatch('./index.html')))
    );
    return;
  }

  /* ══ 정적 자산: Cache-First + 백그라운드 갱신 ══ */
  e.respondWith(
    mmMatch(e.request).then(cached => {
      if (cached) {
        fetch(e.request).then(res => {
          if (res && res.status === 200) {
            caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => Response.error());   /* R19 (2026-09-04): 정적 자산 실패 시 index.html 을 돌려주면 SyntaxError 빈 화면 (§20-10) */
    })
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data && e.data.type === 'GET_VERSION' && e.ports[0]) {
    e.ports[0].postMessage({ version: CACHE });
  }
});

console.log('[SW] loaded:', CACHE);
