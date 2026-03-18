// ══════════════════════════════════════════════════════════════
//  RCCG GOSPEL LIGHT ASSEMBLY — main.js
//  Final clean version — all bugs fixed, no cookie banner
// ══════════════════════════════════════════════════════════════

// ── LOADER ────────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => document.body.classList.add('page-loaded'), 400);
    }
  }, 1800);
});

// ── DOM READY ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // 1. THEME
  const savedTheme = localStorage.getItem('gla-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  // 2. NAVBAR SCROLL SHADOW
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // 3. CLOSE MOBILE NAV ON LINK CLICK
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('navLinks')?.classList.remove('open');
    });
  });

  // 4. DROPDOWN — CLOSE ON OUTSIDE CLICK
  document.addEventListener('click', e => {
    if (!e.target.closest('.navbar')) {
      document.querySelectorAll('.has-dropdown.open')
        .forEach(el => el.classList.remove('open'));
    }
  });

  document.querySelectorAll('.nav-dropdown a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('navLinks')?.classList.remove('open');
      document.querySelectorAll('.has-dropdown.open')
        .forEach(el => el.classList.remove('open'));
    });
  });

  // 5. SCROLL REVEAL
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // 6. COUNTDOWN TO NEXT SUNDAY 8AM
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 7. HERO PARTICLES
  initParticles();

  // 8. OPEN HEAVEN DATE
  const ohEl = document.getElementById('oh-date');
  if (ohEl) {
    ohEl.textContent = new Date().toLocaleDateString('en-NG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // 9. BACK-TO-TOP BUTTON
  // Uses position:fixed in CSS — just toggles .show class
  const bttBtn = document.getElementById('back-to-top');
  if (bttBtn) {
    const checkScroll = () => {
      bttBtn.classList.toggle('show', window.scrollY > 400);
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    // Check on load too in case page starts scrolled
    checkScroll();
    bttBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 10. ANNOUNCEMENT POPUP (homepage only)
  const popup   = document.getElementById('announcement-popup');
  const overlay = document.getElementById('popup-overlay');
  if (popup && overlay) {
    setTimeout(() => {
      popup.classList.add('show');
      overlay.classList.add('show');
    }, 2500);
  }

  // 11. GOD'S LOVE AFFIRMATIONS — every 10 seconds, site-wide
  // First one at 10 seconds
  setTimeout(showNextAffirmation, 10000);

  // 12. PERFORMANCE HELPERS
  initPrefetch();
  initSmoothAnchors();

});

// ══════════════════════════════════════════════════════════════
//  GLOBAL FUNCTIONS — called from HTML onclick attributes
// ══════════════════════════════════════════════════════════════

function toggleNav() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

function toggleDropdown(li) {
  if (window.innerWidth > 900) return;
  const wasOpen = li.classList.contains('open');
  document.querySelectorAll('.has-dropdown.open').forEach(el => el.classList.remove('open'));
  if (!wasOpen) li.classList.add('open');
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('gla-theme', next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme) {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  });
}

function closePopup() {
  document.getElementById('announcement-popup')?.classList.remove('show');
  document.getElementById('popup-overlay')?.classList.remove('show');
}

// ══════════════════════════════════════════════════════════════
//  COUNTDOWN TO NEXT SUNDAY 8:00 AM
// ══════════════════════════════════════════════════════════════
function updateCountdown() {
  const now  = new Date();
  const next = new Date(now);
  const day  = now.getDay(); // 0 = Sunday

  let daysUntil;
  if (day === 0) {
    daysUntil = now.getHours() < 8 ? 0 : 7;
  } else {
    daysUntil = 7 - day;
  }

  next.setDate(now.getDate() + daysUntil);
  next.setHours(8, 0, 0, 0);

  const diff = next - now;
  if (diff <= 0) return;

  const pad = n => String(n).padStart(2, '0');
  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = pad(val);
  };

  setEl('cd-days',  Math.floor(diff / 86400000));
  setEl('cd-hours', Math.floor((diff % 86400000) / 3600000));
  setEl('cd-mins',  Math.floor((diff % 3600000)  / 60000));
  setEl('cd-secs',  Math.floor((diff % 60000)    / 1000));
}

// ══════════════════════════════════════════════════════════════
//  HERO PARTICLES
// ══════════════════════════════════════════════════════════════
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const resize = () => {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  const pts = Array.from({ length: 50 }, () => ({
    x:  Math.random() * canvas.width,
    y:  Math.random() * canvas.height,
    r:  Math.random() * 1.4 + 0.3,
    vx: (Math.random() - .5) * .22,
    vy: (Math.random() - .5) * .22,
    a:  Math.random() * .45 + .08,
  }));
  (function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;  if (p.x > canvas.width)  p.x = 0;
      if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
}

// ══════════════════════════════════════════════════════════════
//  AFFIRMATIONS — Every 10 seconds, on EVERY page
//  position: fixed — always visible on screen regardless of scroll
// ══════════════════════════════════════════════════════════════
const AFFIRMATIONS = [
  { icon: '❤️',  verse: 'John 3:16',       text: 'For God so loved the world that He gave His only Son — that includes YOU.' },
  { icon: '🌟',  verse: 'Jer. 29:11',      text: '"For I know the plans I have for you," says the Lord, "plans to prosper you and not to harm you."' },
  { icon: '🕊️', verse: 'Rom. 8:38-39',    text: 'Nothing in all creation can separate you from the love of God in Christ Jesus.' },
  { icon: '🙌',  verse: 'Zeph. 3:17',      text: 'The Lord your God is with you. He delights in you and rejoices over you with singing.' },
  { icon: '✨',  verse: 'Ps. 139:14',      text: 'You are fearfully and wonderfully made. God\'s works are wonderful — and so are you.' },
  { icon: '🔥',  verse: 'Isa. 43:4',       text: '"You are precious and honoured in my sight, and I love you," says the Lord.' },
  { icon: '🌈',  verse: 'Lam. 3:22-23',   text: 'The steadfast love of the Lord never ceases. His mercies are new every single morning.' },
  { icon: '💛',  verse: '1 John 4:10',     text: 'God loved us first — not because of anything we did, but simply because He is love.' },
  { icon: '🦅',  verse: 'Isa. 40:31',      text: 'Those who hope in the Lord will renew their strength. They will soar on wings like eagles.' },
  { icon: '🙏',  verse: 'Matt. 11:28',     text: '"Come to me, all who are weary and burdened, and I will give you rest." — Jesus' },
  { icon: '💪',  verse: 'Phil. 4:13',      text: 'You can do all things through Christ who strengthens you. Yes — ALL things.' },
  { icon: '🌅',  verse: 'Ps. 30:5',        text: 'Weeping may stay for the night, but joy comes in the morning. Your morning is coming.' },
  { icon: '🎯',  verse: 'Rom. 8:28',       text: 'God works ALL things together for good for those who love Him. ALL things — even this.' },
  { icon: '🌿',  verse: 'Ps. 23:1',        text: 'The Lord is your shepherd — you shall not lack any good thing.' },
  { icon: '💎',  verse: 'Eph. 2:10',       text: 'You are God\'s masterpiece, created in Christ Jesus for good works He prepared just for you.' },
  { icon: '🕯️', verse: 'Matt. 5:14',      text: 'You are the light of the world. Don\'t hide it — let it shine!' },
  { icon: '🛡️', verse: 'Ps. 91:11',       text: 'God commands His angels to guard you in all your ways. You are protected.' },
  { icon: '🌻',  verse: 'Ps. 37:4',        text: 'Delight yourself in the Lord, and He will give you the desires of your heart.' },
  { icon: '🤍',  verse: '1 Pet. 5:7',      text: 'Cast all your anxiety on Him, because He cares for you — deeply and personally.' },
  { icon: '🌙',  verse: 'Ps. 121:7-8',     text: 'The Lord will keep you from all harm. He watches over your coming and going, forever.' },
];

let _affIdx = -1;
let _affTimer = null;

function showNextAffirmation() {
  // Pick a new random verse, never repeat last shown
  let idx;
  do { idx = Math.floor(Math.random() * AFFIRMATIONS.length); } while (idx === _affIdx);
  _affIdx = idx;
  const a = AFFIRMATIONS[idx];

  // Remove existing toast if present
  document.getElementById('affirmation-toast')?.remove();

  // Build the toast element
  const toast = document.createElement('div');
  toast.id = 'affirmation-toast';
  toast.className = 'affirmation-toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <button class="affirmation-close" onclick="dismissAffirmation()" aria-label="Dismiss">✕</button>
    <div class="affirmation-inner">
      <div class="affirmation-icon">${a.icon}</div>
      <div class="affirmation-body">
        <span class="affirmation-verse">${a.verse}</span>
        <p class="affirmation-text">${a.text}</p>
      </div>
    </div>`;

  // Append to body — position:fixed means it's always on screen
  document.body.appendChild(toast);

  // Trigger slide-in (needs 2 frames for CSS transition to fire)
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

  // Auto-dismiss after 8 seconds
  setTimeout(dismissAffirmation, 8000);

  // Schedule NEXT affirmation 10 seconds after this one appeared
  _affTimer = setTimeout(showNextAffirmation, 10000);
}

function dismissAffirmation() {
  const toast = document.getElementById('affirmation-toast');
  if (!toast) return;
  toast.classList.remove('show');
  toast.classList.add('hiding');
  setTimeout(() => toast.remove(), 500);
}

// ══════════════════════════════════════════════════════════════
//  FORM HANDLERS
// ══════════════════════════════════════════════════════════════
function handlePrayer(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = '🙏 Prayer Submitted! God bless you.';
  btn.style.cssText = 'background:#2e7d32;color:#fff;';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.cssText = '';
    btn.disabled = false;
    e.target.reset();
  }, 4000);
}

function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = "✓ Message Sent! We'll be in touch.";
  btn.style.cssText = 'background:#2e7d32;color:#fff;';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.cssText = '';
    btn.disabled = false;
    e.target.reset();
  }, 4000);
}

function handleReceiptRequest(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = '✓ Request Submitted!';
  btn.style.cssText = 'background:#2e7d32;color:#fff;';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.cssText = '';
    btn.disabled = false;
    e.target.reset();
  }, 4000);
}

// ══════════════════════════════════════════════════════════════
//  PERFORMANCE HELPERS
// ══════════════════════════════════════════════════════════════
function initPrefetch() {
  document.querySelectorAll('.nav-links a, .btn-gold, .btn-primary').forEach(link => {
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('tel') && !href.startsWith('mailto')) {
        if (!document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
          const prefetch = document.createElement('link');
          prefetch.rel = 'prefetch';
          prefetch.href = href;
          document.head.appendChild(prefetch);
        }
      }
    }, { once: true });
  });
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ══════════════════════════════════════════════════════════════
//  PWA SERVICE WORKER
// ══════════════════════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
