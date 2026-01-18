// Navigation toggle (mobile)
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

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  document.documentElement.classList.add('motion-ready');
}

// Dynamic year
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

// Countdown (data-datetime attribute)
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

// Smooth scroll for anchor links
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

// Hero entrance animation
(function heroIntro() {
  if (prefersReducedMotion || !(window.gsap && typeof gsap.timeline === 'function')) return;
  const hero = document.querySelector('.cover-inner');
  if (!hero) return;

  const tl = gsap.timeline({ defaults: { duration: 0.9, ease: 'power3.out', opacity: 0 } });
  const eyebrow = hero.querySelector('.eyebrow');
  const names = hero.querySelector('.names');
  const date = hero.querySelector('.date');
  const countdownItems = hero.querySelectorAll('.countdown .cd-item');
  const ctas = hero.querySelectorAll('.actions .btn');

  if (eyebrow) tl.from(eyebrow, { y: 18 });
  if (names) tl.from(names, { y: 16 }, '-=0.5');
  if (date) tl.from(date, { y: 14 }, '-=0.45');
  if (countdownItems.length) tl.from(countdownItems, { y: 14, stagger: 0.08 }, '-=0.4');
  if (ctas.length) tl.from(ctas, { y: 12, stagger: 0.06 }, '-=0.38');
})();

// Section/card reveal on scroll (details excluded)
(function revealOnScroll() {
  if (prefersReducedMotion) return;

  const items = [];
  document.querySelectorAll('.section').forEach((section) => {
    if (section.id === 'details') return;
    section.dataset.reveal = '';
    items.push(section);
    section.querySelectorAll('.container, h2, h3, .card, .actions, .gallery, .map-embed').forEach((child, idx) => {
      child.dataset.reveal = '';
      child.style.setProperty('--reveal-delay', `${idx * 0.08}s`);
      items.push(child);
    });
  });

  const footer = document.querySelector('.site-footer');
  if (footer) {
    footer.dataset.reveal = '';
    items.push(footer);
  }

  if (!items.length) return;

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  items.forEach((el) => io.observe(el));
})();

// Petals + wind animation
(function petals() {
  if (prefersReducedMotion) return;

  const layer = document.getElementById('petals') || (function createLayer() {
    const el = document.createElement('div');
    el.id = 'petals';
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
    return el;
  })();

  if (!(window.gsap && typeof gsap.to === 'function')) return;

  const rnd = gsap.utils.random;
  const PETAL_COUNT = 22;

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
    // Fall + drift
    gsap.to(p, {
      y: '120vh',
      x: `+=${rnd(-80, 80)}`,
      rotation: `+=${rnd(-90, 90)}`,
      duration: dur,
      ease: 'sine.in',
      delay: rnd(0, 6),
      repeat: -1
    });
    // Breeze sway
    gsap.to(p, {
      x: `+=${rnd(-60, 60)}`,
      duration: rnd(4, 7),
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1
    });
  }

  // Gentle gusts for the whole layer
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

// Story carousel (swipe/click/keys)
(async function storyGallery() {
  const root = document.getElementById('story-gallery');
  if (!root) return;

  function parseList(input) {
    return (input || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let list = parseList(root.dataset.images);

  // Prefer manifest.json so new photos show up automatically; fall back to data-images
  try {
    const res = await fetch('image/manifest.json', { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length) {
        list = data.map((s) => String(s)).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn('Unable to load gallery manifest:', err);
  }

  if (!list.length) return;

  const viewport = root.querySelector('.gallery-viewport');
  const track = root.querySelector('.gallery-track');
  const btnPrev = root.querySelector('.gallery-nav.prev');
  const btnNext = root.querySelector('.gallery-nav.next');
  const dots = root.querySelector('.gallery-dots');

  // Build slides + dots
  list.forEach((name, idx) => {
    const item = document.createElement('figure');
    item.className = 'slide';
    item.setAttribute('role', 'listitem');
    const img = document.createElement('img');
    img.src = `image/${name}`; // Images expected in image/ directory
    img.alt = `story ${idx + 1}`;
    item.appendChild(img);
    track.appendChild(item);

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Slide ${idx + 1}`);
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

  // Keyboard arrows when gallery is in view
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

  // Touch/drag swipe
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
    const threshold = viewport.clientWidth * 0.15; // 15% swipe threshold
    if (currentX < -threshold) next();
    else if (currentX > threshold) prev();
    else update();
    currentX = 0;
  }

  viewport.addEventListener('touchstart', onTouchStart, { passive: true });
  viewport.addEventListener('touchmove', onTouchMove, { passive: true });
  viewport.addEventListener('touchend', onTouchEnd);
  // Mouse drag (optional)
  viewport.addEventListener('mousedown', onTouchStart);
  window.addEventListener('mousemove', onTouchMove);
  window.addEventListener('mouseup', onTouchEnd);

  update();
})();
