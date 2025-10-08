// 導航選單切換（手機）
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// 年分自動更新
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

// 倒數計時（依據 data-datetime）
function startCountdown(root) {
  const iso = root.getAttribute('data-datetime');
  const target = iso ? new Date(iso) : null;
  if (!target || Number.isNaN(target.getTime())) return;

  const dd = root.querySelector('.dd');
  const hh = root.querySelector('.hh');
  const mm = root.querySelector('.mm');
  const ss = root.querySelector('.ss');

  function tick() {
    const now = new Date();
    let ms = target.getTime() - now.getTime();
    if (ms < 0) ms = 0;
    const sec = Math.floor(ms / 1000);
    const d = Math.floor(sec / 86400);
    const h = Math.floor((sec % 86400) / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (dd) dd.textContent = String(d).padStart(2, '0');
    if (hh) hh.textContent = String(h).padStart(2, '0');
    if (mm) mm.textContent = String(m).padStart(2, '0');
    if (ss) ss.textContent = String(s).padStart(2, '0');
  }
  tick();
  return setInterval(tick, 1000);
}

document.querySelectorAll('[data-countdown]').forEach((el) => startCountdown(el));

// 平滑捲動
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id) return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// 櫻花花瓣 + 風吹效果
(function petals() {
  const layer = document.getElementById('petals') || (function() {
    const el = document.createElement('div');
    el.id = 'petals';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  })();

  if (!(window.gsap && typeof gsap.to === 'function')) return;

  const rnd = gsap.utils.random;
  const PETAL_COUNT = 22; // 可調整數量

  for (let i = 0; i < PETAL_COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'petal';
    p.style.position = 'absolute';
    p.style.width = `${rnd(10, 18)}px`;
    p.style.height = `${rnd(6, 12)}px`;
    p.style.left = `${rnd(0, 100)}%`;
    p.style.top = `${rnd(-20, -5)}%`;
    p.style.background = 'radial-gradient(circle at 30% 30%, #ffd7e6 0%, #f5b8cb 60%, #eaa1ba 100%)';
    p.style.borderRadius = '60% 60% 60% 60% / 70% 70% 40% 40%';
    p.style.filter = 'drop-shadow(0 2px 4px rgba(200,120,120,.25))';
    p.style.transform = `rotate(${rnd(-30, 30)}deg)`;
    layer.appendChild(p);

    const dur = rnd(6, 11);
    // 直向落下 + 隨機偏移
    gsap.to(p, {
      y: '120vh',
      x: `+=${rnd(-80, 80)}`,
      rotation: `+=${rnd(-90, 90)}`,
      duration: dur,
      ease: 'sine.in',
      delay: rnd(0, 6),
      repeat: -1
    });
    // 左右搖曳（微風）
    gsap.to(p, {
      x: `+=${rnd(-60, 60)}`,
      duration: rnd(4, 7),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  // 陣風：讓整個花瓣圖層左右帶一點位移，形成風吹感
  (function windGusts(el) {
    function gust() {
      const dir = Math.random() > 0.5 ? 1 : -1;
      const strength = rnd(20, 80) * dir;
      const t = rnd(2.5, 4.5);
      const pause = rnd(2, 5) * 1000;
      gsap.to(el, {
        x: `+=${strength}`,
        duration: t,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
        onComplete: () => setTimeout(gust, pause)
      });
    }
    gust();
  })(layer);
})();

// 我們的故事：相片廊（左右滑動 / 點選圓點 / 左右鍵）
(function storyGallery() {
  const root = document.getElementById('story-gallery');
  if (!root) return;

  const list = (root.dataset.images || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (!list.length) return;

  const viewport = root.querySelector('.gallery-viewport');
  const track = root.querySelector('.gallery-track');
  const btnPrev = root.querySelector('.gallery-nav.prev');
  const btnNext = root.querySelector('.gallery-nav.next');
  const dots = root.querySelector('.gallery-dots');

  // 建立 slides 與 dots
  list.forEach((name, idx) => {
    const item = document.createElement('figure');
    item.className = 'slide';
    item.setAttribute('role', 'listitem');
    const img = document.createElement('jpg');
    img.src = `image/${name}`; // 將照片放在 image/ 資料夾
    img.alt = `我們的照片 ${idx + 1}`;
    item.appendChild(img);
    track.appendChild(item);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `第 ${idx + 1} 張`);
    dot.addEventListener('click', () => goTo(idx));
    dots.appendChild(dot);
  });

  let index = 0;
  const count = list.length;

  function update() {
    track.style.transition = 'transform .35s ease';
    track.style.transform = `translateX(-${index * 100}%)`;
    Array.from(dots.children).forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
  }
  function goTo(i) { index = (i + count) % count; update(); }
  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  if (btnPrev) btnPrev.addEventListener('click', prev);
  if (btnNext) btnNext.addEventListener('click', next);

  // 鍵盤左右鍵（當相簿在視窗中）
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        window.addEventListener('keydown', onKey);
      } else {
        window.removeEventListener('keydown', onKey);
      }
    });
  }, { threshold: 0.2 });
  io.observe(root);

  function onKey(ev) {
    if (ev.key === 'ArrowRight') next();
    if (ev.key === 'ArrowLeft') prev();
  }

  // 觸控滑動（簡易）
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  function onTouchStart(e) {
    dragging = true;
    track.style.transition = 'none';
    startX = e.touches ? e.touches[0].clientX : e.clientX;
  }
  function onTouchMove(e) {
    if (!dragging) return;
    currentX = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
    const offsetPercent = (currentX / viewport.clientWidth) * 100;
    track.style.transform = `translateX(calc(-${index * 100}% + ${offsetPercent}%))`;
  }
  function onTouchEnd() {
    if (!dragging) return;
    dragging = false;
    const threshold = viewport.clientWidth * 0.15; // 滑過 15% 視為切換
    if (currentX < -threshold) next();
    else if (currentX > threshold) prev();
    else update();
    currentX = 0;
  }

  viewport.addEventListener('touchstart', onTouchStart, { passive: true });
  viewport.addEventListener('touchmove', onTouchMove, { passive: true });
  viewport.addEventListener('touchend', onTouchEnd);
  // 滑鼠拖曳（可選）
  viewport.addEventListener('mousedown', onTouchStart);
  window.addEventListener('mousemove', onTouchMove);
  window.addEventListener('mouseup', onTouchEnd);

  update();
})();
