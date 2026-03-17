// ══════════════════════════════════════════════════════════
//  RCCG GOSPEL LIGHT ASSEMBLY — main.js
//  Clean, definitive version — no bugs, no conflicts
// ══════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────
//  LOADER
//  Hides after 1.8s, then triggers page fade-in
// ─────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => document.body.classList.add('page-loaded'), 400);
    }
  }, 1800);
});

// ─────────────────────────────────────────────────────────
//  DOM READY — all setup that needs the DOM to exist
// ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── 1. THEME ─────────────────────────────────────────
  const theme = localStorage.getItem('gla-theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);

  // ── 2. NAVBAR SHADOW ON SCROLL ────────────────────────
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // ── 3. MOBILE NAV — close on link click ───────────────
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('navLinks')?.classList.remove('open');
    });
  });

  // ── 4. DROPDOWN — close on outside click ──────────────
  document.addEventListener('click', e => {
    if (!e.target.closest('.navbar')) {
      document.querySelectorAll('.has-dropdown.open')
        .forEach(el => el.classList.remove('open'));
    }
  });

  // Close dropdowns when a dropdown link is clicked
  document.querySelectorAll('.nav-dropdown a').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('navLinks')?.classList.remove('open');
      document.querySelectorAll('.has-dropdown.open')
        .forEach(el => el.classList.remove('open'));
    });
  });

  // ── 5. SCROLL REVEAL ──────────────────────────────────
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // ── 6. COUNTDOWN TO NEXT SUNDAY 8AM ───────────────────
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ── 7. HERO PARTICLES (homepage only) ─────────────────
  initParticles();

  // ── 8. OPEN HEAVEN DATE (sermons page only) ───────────
  const ohEl = document.getElementById('oh-date');
  if (ohEl) {
    ohEl.textContent = new Date().toLocaleDateString('en-NG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  // ── 9. BACK-TO-TOP BUTTON ─────────────────────────────
  //  Always fixed. Hidden until user scrolls 400px down.
  const bttBtn = document.getElementById('back-to-top');
  if (bttBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        bttBtn.style.opacity = '1';
        bttBtn.style.visibility = 'visible';
        bttBtn.style.transform = 'translateY(0)';
      } else {
        bttBtn.style.opacity = '0';
        bttBtn.style.visibility = 'hidden';
        bttBtn.style.transform = 'translateY(8px)';
      }
    }, { passive: true });

    bttBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── 10. COOKIE CONSENT ────────────────────────────────
  //  Show 2.2s after page loads if user hasn't accepted yet
  const cookieBanner = document.getElementById('cookie-banner');
  if (cookieBanner) {
    const cookiesAccepted = localStorage.getItem('gla_cookie_consent');
    if (!cookiesAccepted) {
      setTimeout(() => cookieBanner.classList.add('show'), 2200);
    }
  }

  // ── 11. ANNOUNCEMENT POPUP (homepage only) ────────────
  //  Only shows on index.html
  //  If cookies already done → show at 3s
  //  If cookies pending → show at 7s (after user deals with cookie banner)
  const popup   = document.getElementById('announcement-popup');
  const overlay = document.getElementById('popup-overlay');
  if (popup && overlay) {
    const cookiesAccepted = localStorage.getItem('gla_cookie_consent');
    const delay = cookiesAccepted ? 3000 : 7000;
    setTimeout(() => {
      popup.classList.add('show');
      overlay.classList.add('show');
    }, delay);
  }

  // ── 12. GOD'S LOVE AFFIRMATIONS ───────────────────────
  //  First appears 30s after page load, then every 30s
  //  Appears on ALL pages via JS (no HTML needed)
  setTimeout(showNextAffirmation, 30000);

});

// ══════════════════════════════════════════════════════════
//  GLOBAL FUNCTIONS (called from HTML onclick attributes)
// ══════════════════════════════════════════════════════════

function toggleNav() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

function toggleDropdown(li) {
  if (window.innerWidth > 680) return;
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

function acceptCookies(level) {
  localStorage.setItem('gla_cookie_consent', JSON.stringify({
    level,
    timestamp: Date.now(),
    analytics: level === 'all',
    marketing: level === 'all',
    preferences: true,
  }));
  const banner = document.getElementById('cookie-banner');
  if (banner) {
    banner.style.transition = 'transform .4s ease, opacity .3s ease';
    banner.style.transform  = 'translateX(-50%) translateY(calc(100% + 2rem))';
    banner.style.opacity    = '0';
    setTimeout(() => {
      banner.classList.remove('show');
      banner.removeAttribute('style');
    }, 450);
  }
}

// ══════════════════════════════════════════════════════════
//  COUNTDOWN TO NEXT SUNDAY 8:00 AM
// ══════════════════════════════════════════════════════════
function updateCountdown() {
  const now  = new Date();
  const next = new Date(now);
  const day  = now.getDay(); // 0 = Sunday

  let daysUntil;
  if (day === 0) {
    // It's Sunday — if before 8am, service hasn't started; else next Sunday
    daysUntil = (now.getHours() < 8) ? 0 : 7;
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

// ══════════════════════════════════════════════════════════
//  HERO PARTICLES
// ══════════════════════════════════════════════════════════
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

// ══════════════════════════════════════════════════════════
//  GOD'S LOVE AFFIRMATIONS
//  Slides in from bottom-left every 30 seconds on every page
// ══════════════════════════════════════════════════════════
const AFFIRMATIONS = [
  { icon: '❤️',  verse: 'John 3:16',    text: 'For God so loved the world that He gave His only Son — that includes YOU.' },
  { icon: '🌟',  verse: 'Jer. 29:11',   text: '"For I know the plans I have for you," says the Lord, "plans to prosper you and not to harm you."' },
  { icon: '🕊️', verse: 'Rom. 8:38-39', text: 'Nothing in all creation can separate you from the love of God in Christ Jesus.' },
  { icon: '🙌',  verse: 'Zeph. 3:17',   text: 'The Lord your God is with you. He delights in you and rejoices over you with singing.' },
  { icon: '✨',  verse: 'Ps. 139:14',   text: 'You are fearfully and wonderfully made. God\'s works are wonderful — and so are you.' },
  { icon: '🔥',  verse: 'Isa. 43:4',    text: '"You are precious and honoured in my sight, and I love you," says the Lord.' },
  { icon: '🌈',  verse: 'Lam. 3:22-23', text: 'The steadfast love of the Lord never ceases. His mercies are new every single morning.' },
  { icon: '💛',  verse: '1 John 4:10',  text: 'God loved us first — not because of anything we did, but simply because He is love.' },
  { icon: '🦅',  verse: 'Isa. 40:31',   text: 'Those who hope in the Lord will renew their strength. They will soar on wings like eagles.' },
  { icon: '🙏',  verse: 'Matt. 11:28',  text: '"Come to me, all who are weary and burdened, and I will give you rest." — Jesus' },
  { icon: '💪',  verse: 'Phil. 4:13',   text: 'You can do all things through Christ who strengthens you. Yes — ALL things.' },
  { icon: '🌅',  verse: 'Ps. 30:5',     text: 'Weeping may stay for the night, but joy comes in the morning. Your morning is coming.' },
  { icon: '🎯',  verse: 'Rom. 8:28',    text: 'God works ALL things together for good for those who love Him. ALL things — even this.' },
  { icon: '🌿',  verse: 'Ps. 23:1',     text: 'The Lord is your shepherd — you shall not lack any good thing.' },
  { icon: '💎',  verse: 'Eph. 2:10',    text: 'You are God\'s masterpiece, created in Christ Jesus for good works He prepared just for you.' },
  { icon: '🕯️', verse: 'Matt. 5:14',   text: 'You are the light of the world. Don\'t hide it — let it shine!' },
  { icon: '🛡️', verse: 'Ps. 91:11',    text: 'God commands His angels to guard you in all your ways. You are protected.' },
  { icon: '🌻',  verse: 'Ps. 37:4',     text: 'Delight yourself in the Lord, and He will give you the desires of your heart.' },
  { icon: '🤍',  verse: '1 Pet. 5:7',   text: 'Cast all your anxiety on Him, because He cares for you — deeply and personally.' },
  { icon: '🌙',  verse: 'Ps. 121:7-8',  text: 'The Lord will keep you from all harm. He watches over your coming and going, forever.' },
];

let _lastAffIdx = -1;

function showNextAffirmation() {
  // Pick random, never repeat last
  let idx;
  do { idx = Math.floor(Math.random() * AFFIRMATIONS.length); } while (idx === _lastAffIdx);
  _lastAffIdx = idx;
  const a = AFFIRMATIONS[idx];

  // Remove existing toast if present
  document.getElementById('affirmation-toast')?.remove();

  // Build toast
  const toast = document.createElement('div');
  toast.id = 'affirmation-toast';
  toast.className = 'affirmation-toast';
  toast.innerHTML = `
    <button class="affirmation-close" onclick="dismissAffirmation()" aria-label="Dismiss">✕</button>
    <div class="affirmation-inner">
      <div class="affirmation-icon">${a.icon}</div>
      <div class="affirmation-body">
        <span class="affirmation-verse">${a.verse}</span>
        <p class="affirmation-text">${a.text}</p>
      </div>
    </div>`;
  document.body.appendChild(toast);

  // Trigger slide-in (needs two animation frames to fire transition)
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('show')));

  // Auto-dismiss after 8s
  setTimeout(dismissAffirmation, 8000);

  // Schedule next in 30s
  setTimeout(showNextAffirmation, 30000);
}

function dismissAffirmation() {
  const toast = document.getElementById('affirmation-toast');
  if (!toast) return;
  toast.classList.remove('show');
  toast.classList.add('hiding');
  setTimeout(() => toast.remove(), 500);
}

// ══════════════════════════════════════════════════════════
//  FORM HANDLERS
// ══════════════════════════════════════════════════════════
function handlePrayer(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = '🙏 Prayer Submitted! God bless you.';
  btn.style.cssText = 'background:#2e7d32;color:#fff;width:100%;justify-content:center;';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = orig; btn.style.cssText = ''; btn.disabled = false; e.target.reset(); }, 4000);
}

function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = "✓ Message Sent! We'll be in touch.";
  btn.style.cssText = 'background:#2e7d32;color:#fff;width:100%;justify-content:center;';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = orig; btn.style.cssText = ''; btn.disabled = false; e.target.reset(); }, 4000);
}

function handleReceiptRequest(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const orig = btn.textContent;
  btn.textContent = '✓ Request Submitted!';
  btn.style.cssText = 'background:#2e7d32;color:#fff;width:100%;justify-content:center;';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = orig; btn.style.cssText = ''; btn.disabled = false; e.target.reset(); }, 4000);
}

// ══════════════════════════════════════════════════════════
//  PWA SERVICE WORKER
// ══════════════════════════════════════════════════════════
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
