/* ─── PRELOADER ─── */
(function () {
  // Hide everything except the preloader while loading
  document.body.classList.add('pl-loading');

  function dismissPreloader() {
    const pl = document.getElementById('preloader');
    if (!pl) return;

    // Reveal page content first (invisible → visible)
    document.body.classList.remove('pl-loading');

    // Then wipe the preloader upward
    pl.classList.add('pl-exit');
    pl.addEventListener('animationend', () => {
      pl.classList.add('pl-done');
    }, { once: true });
  }

  // Minimum display time (ms) so it never just flashes
  const MIN_TIME = 2000;
  const start = Date.now();

  window.addEventListener('load', () => {
    const elapsed = Date.now() - start;
    const remaining = Math.max(0, MIN_TIME - elapsed);
    setTimeout(dismissPreloader, remaining);
  });

  // Safety fallback — dismiss after 4s no matter what
  setTimeout(dismissPreloader, 4000);
})();

/* ─── UTILS ─── */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const lerp  = (a,b,t) => a + (b-a)*t;
const clamp = (v,lo,hi) => Math.max(lo,Math.min(hi,v));

/* ─── SCROLL PROGRESS ─── */
const spb = $('#spb');
let scrollY = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  spb.style.width = (scrollY / (document.body.scrollHeight - window.innerHeight) * 100) + '%';
  $('#nav').classList.toggle('scrolled', scrollY > 44);
  $('#btt').classList.toggle('on', scrollY > 420);
  updateActiveNav();
}, {passive:true});
$('#btt').addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
$('#hbg').addEventListener('click', () => $('#nul').classList.toggle('open'));

/* ─── ACTIVE NAV ─── */
function updateActiveNav() {
  const sections = ['home','about','experience','skills','projects','resume','contact'];
  let current = 'home';
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && scrollY >= el.offsetTop - 160) current = id;
  });
  $$('.nav-ul a[data-s]').forEach(a => {
    a.classList.toggle('active', a.dataset.s === current);
  });
}

/* ─── CURSOR + GOLD TRAIL ─── */
const curEl = $('#cur'), curR = $('#cur-r');
let mx=0, my=0, crx=0, cry=0;
const TDOTS = 10;
const trail = Array.from({length:TDOTS}, (_,i) => {
  const d = document.createElement('div');
  d.className = 'tdot';
  Object.assign(d.style, {
    width: (5 - i*.38) + 'px',
    height: (5 - i*.38) + 'px',
    opacity: 0,
  });
  document.body.appendChild(d);
  return {el:d, x:0, y:0};
});

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  curEl.style.left = mx + 'px'; curEl.style.top = my + 'px';
}, {passive:true});

(function cursorLoop() {
  crx = lerp(crx, mx, .12); cry = lerp(cry, my, .12);
  curR.style.left = crx + 'px'; curR.style.top = cry + 'px';
  let px = mx, py = my;
  trail.forEach((t, i) => {
    const f = .22 - i * .016;
    t.x = lerp(t.x, px, f); t.y = lerp(t.y, py, f);
    t.el.style.left = t.x + 'px'; t.el.style.top = t.y + 'px';
    t.el.style.opacity = ((1 - i / TDOTS) * .28) + '';
    px = t.x; py = t.y;
  });
  requestAnimationFrame(cursorLoop);
})();

$$('a,button,input,textarea,.stile,.pc,.pl,.si,.dc,.tl-item').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hov'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hov'));
});

/* ─── PARTICLES ─── */
const cvs = $('#pcvs');
const ctx = cvs.getContext('2d');
let W = cvs.width = window.innerWidth, H = cvs.height = window.innerHeight;
window.addEventListener('resize', () => {
  W = cvs.width = window.innerWidth;
  H = cvs.height = window.innerHeight;
}, {passive:true});

class Dot {
  constructor() { this.reset(true); }
  reset(init) {
    this.x   = init ? Math.random() * W : (Math.random() > .5 ? -5 : W + 5);
    this.y   = init ? Math.random() * H : Math.random() * H;
    this.vx  = (Math.random() - .5) * .32;
    this.vy  = (Math.random() - .5) * .32;
    this.r   = Math.random() * 1.5 + .5;
    this.a   = Math.random() * .38 + .1;
    this.life= Math.random() * 200 + 120;
    this.age = 0;
  }
  step() {
    this.x += this.vx; this.y += this.vy; this.age++;
    if (this.age > this.life || this.x < -10 || this.x > W+10 || this.y < -10 || this.y > H+10)
      this.reset(false);
  }
  draw() {
    const fade = Math.min(this.age/30, 1, (this.life-this.age)/30);
    const isLt = document.documentElement.classList.contains('light');
    const col  = isLt ? `rgba(194,24,91,${this.a * fade * .5})` : `rgba(201,169,110,${this.a * fade})`;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fillStyle = col; ctx.fill();
  }
}

const PCNT = 80;
const dots = Array.from({length: PCNT}, () => new Dot());
const LINK = 130;

(function particleLoop() {
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < dots.length; i++) {
    for (let j = i+1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
      const d  = Math.sqrt(dx*dx + dy*dy);
      if (d < LINK) {
        const isLt = document.documentElement.classList.contains('light');
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.strokeStyle = isLt
          ? `rgba(194,24,91,${(1-d/LINK)*.045})`
          : `rgba(201,169,110,${(1-d/LINK)*.065})`;
        ctx.lineWidth = .6; ctx.stroke();
      }
    }
  }
  dots.forEach(d => { d.step(); d.draw(); });
  requestAnimationFrame(particleLoop);
})();

/* ─── MOUSE PARALLAX ─── */
let ptx=0, pty=0, ppx=0, ppy=0;
document.addEventListener('mousemove', e => {
  ptx = (e.clientX / window.innerWidth  - .5) * 2;
  pty = (e.clientY / window.innerHeight - .5) * 2;
}, {passive:true});

const hcol  = $('#hcol');
const b1    = $('#b1');
const b3    = $('#b3');
const hcard = $('#hcard');
const plxEls = $$('.plx');

(function parallaxLoop() {
  ppx = lerp(ppx, ptx, .055);
  ppy = lerp(ppy, pty, .055);
  if (hcol)  hcol.style.transform  = `translate(${ppx * -9}px, ${ppy * -6}px)`;
  if (b1)    b1.style.transform    = `translate(${ppx * 22}px, ${ppy * 14}px)`;
  if (b3)    b3.style.transform    = `translate(${ppx * 14}px, ${ppy * 10}px)`;
  plxEls.forEach(el => {
    const spd  = parseFloat(el.dataset.spd || .06);
    const rect = el.closest('section')?.getBoundingClientRect();
    if (!rect) return;
    const progress = clamp((-rect.top) / window.innerHeight, -1, 2);
    el.style.transform = `translateY(${-progress * window.innerHeight * spd}px)`;
  });
  requestAnimationFrame(parallaxLoop);
})();

/* ─── 3D TILT — HERO CARD ─── */
if (hcard) {
  hcard.addEventListener('mousemove', e => {
    const r  = hcard.getBoundingClientRect();
    const dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
    const dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
    hcard.style.transform = `perspective(820px) rotateY(${dx*13}deg) rotateX(${-dy*10}deg)`;
  });
  hcard.addEventListener('mouseleave', () => {
    hcard.style.transform = 'perspective(820px) rotateY(0deg) rotateX(0deg)';
  });
}

/* ─── 3D TILT — PROJECT CARDS ─── */
$$('.pc').forEach(card => {
  const glow = card.querySelector('.pcg');
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const x  = e.clientX - r.left, y = e.clientY - r.top;
    const dx = (x - r.width  / 2) / (r.width  / 2);
    const dy = (y - r.height / 2) / (r.height / 2);
    card.style.transform = `perspective(620px) rotateY(${dx*7}deg) rotateX(${-dy*5}deg) translateZ(5px)`;
    if (glow) { glow.style.left = x + 'px'; glow.style.top = y + 'px'; }
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(620px) rotateY(0) rotateX(0) translateZ(0)';
  });
});

/* ─── SCROLL REVEAL ─── */
const rvObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, {threshold:.1});
$$('.rv,.rv-l,.rv-r').forEach(el => rvObs.observe(el));

/* ─── COUNTING STATS ─── */
const cntObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target, target = +el.dataset.t;
    let v = 0;
    const step = Math.ceil(target / 38);
    const t = setInterval(() => {
      v = Math.min(v + step, target);
      el.textContent = v;
      if (v >= target) clearInterval(t);
    }, 42);
    cntObs.unobserve(el);
  });
}, {threshold:.55});
$$('.sn[data-t]').forEach(el => cntObs.observe(el));

/* ─── TYPEWRITER ─── */
const phrases = ['Civil Engineer','Architectural Drafter','Structural Enthusiast','Dream Builder','Cat Mom 🐱','Seismic Designer'];
let pi=0, ci=0, del=false;
const twEl = $('#tw');
function typeLoop() {
  const cur = phrases[pi];
  if (!del) {
    twEl.textContent = cur.slice(0, ++ci);
    if (ci === cur.length) { del = true; setTimeout(typeLoop, 1900); return; }
  } else {
    twEl.textContent = cur.slice(0, --ci);
    if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
  }
  setTimeout(typeLoop, del ? 48 : 88);
}
typeLoop();

/* ─── SKILLS TABS ─── */
const gv2 = $('#gv'), bv2 = $('#bv'), rv2 = $('#rv2');
let radarDone = false;

function showTab(which) {
  [gv2, bv2, rv2].forEach(p => { p.style.display='none'; p.setAttribute('aria-hidden','true'); });
  $$('.skt').forEach(t => { t.classList.remove('on'); t.setAttribute('aria-selected','false'); });
  const btn = $(`.skt[data-tab="${which}"]`);
  if (btn) { btn.classList.add('on'); btn.setAttribute('aria-selected','true'); }
  if (which === 'grid') {
    gv2.style.display = 'grid'; gv2.removeAttribute('aria-hidden');
  } else if (which === 'bars') {
    bv2.style.display = 'flex'; bv2.removeAttribute('aria-hidden');
    $$('.bf').forEach(b => b.style.width = '0%');
    requestAnimationFrame(() => setTimeout(() => {
      $$('.bf').forEach(b => b.style.width = b.dataset.p + '%');
    }, 60));
  } else {
    rv2.style.display = 'flex'; rv2.removeAttribute('aria-hidden');
    if (!radarDone) { drawRadar(); radarDone = true; }
    else drawRadar();
  }
}
$$('.skt').forEach(btn => btn.addEventListener('click', () => showTab(btn.dataset.tab)));
gv2.style.display = 'grid';

/* ─── RADAR CHART ─── */
const LABELS = ['AutoCAD','ETABS','SAFE','MS Office','Surveying','Struct. Calc','Reporting'];
const VALUES = [.90, .85, .80, .88, .82, .87, .92];
let radarAnim = null;

function drawRadar() {
  const c = $('#rc'); if (!c) return;
  const ctx2 = c.getContext('2d');
  const W2 = c.width, H2 = c.height;
  const cx = W2/2, cy = H2/2, R = 158;
  const N = LABELS.length;
  const ang = i => Math.PI * 2 * i / N - Math.PI / 2;
  const isLt = () => document.documentElement.classList.contains('light');

  const accentHex  = () => isLt() ? 'rgba(194,24,91,.85)'   : 'rgba(201,169,110,.85)';
  const fillStop0  = () => isLt() ? 'rgba(240,100,160,.22)' : 'rgba(201,169,110,.22)';
  const fillStop1  = () => isLt() ? 'rgba(240,80,130,.08)'  : 'rgba(208,128,146,.08)';
  const dotColor   = () => isLt() ? '#c2185b' : '#c9a96e';

  if (radarAnim) cancelAnimationFrame(radarAnim);
  let prog = 0;
  (function step() {
    ctx2.clearRect(0, 0, W2, H2);
    const p = clamp(prog, 0, 1);
    const lt = isLt();

    [.25,.5,.75,1].forEach((lvl, ri) => {
      ctx2.beginPath();
      for (let i = 0; i < N; i++) {
        const a = ang(i), x = cx + Math.cos(a)*R*lvl, y = cy + Math.sin(a)*R*lvl;
        i === 0 ? ctx2.moveTo(x,y) : ctx2.lineTo(x,y);
      }
      ctx2.closePath();
      ctx2.strokeStyle = lt ? `rgba(180,60,110,${.07+ri*.02})` : `rgba(255,255,255,${.045+ri*.015})`;
      ctx2.lineWidth = 1; ctx2.stroke();
      ctx2.fillStyle = lt ? 'rgba(120,40,80,.45)' : 'rgba(107,117,133,.55)';
      ctx2.font = '9px JetBrains Mono, monospace';
      ctx2.textAlign = 'left';
      ctx2.fillText(`${Math.round(lvl*100)}%`, cx+4, cy - R*lvl + 4);
    });

    for (let i = 0; i < N; i++) {
      ctx2.beginPath(); ctx2.moveTo(cx, cy);
      ctx2.lineTo(cx + Math.cos(ang(i))*R, cy + Math.sin(ang(i))*R);
      ctx2.strokeStyle = lt ? 'rgba(180,60,110,.07)' : 'rgba(255,255,255,.055)';
      ctx2.lineWidth = 1; ctx2.stroke();
    }

    ctx2.beginPath();
    for (let i = 0; i < N; i++) {
      const a = ang(i), v = VALUES[i]*p;
      const x = cx + Math.cos(a)*R*v, y = cy + Math.sin(a)*R*v;
      i === 0 ? ctx2.moveTo(x,y) : ctx2.lineTo(x,y);
    }
    ctx2.closePath();
    const grad = ctx2.createRadialGradient(cx,cy,0,cx,cy,R);
    grad.addColorStop(0, fillStop0()); grad.addColorStop(1, fillStop1());
    ctx2.fillStyle = grad; ctx2.fill();
    ctx2.strokeStyle = accentHex(); ctx2.lineWidth = 2; ctx2.stroke();

    for (let i = 0; i < N; i++) {
      const a = ang(i), v = VALUES[i]*p;
      const x = cx + Math.cos(a)*R*v, y = cy + Math.sin(a)*R*v;
      ctx2.beginPath(); ctx2.arc(x,y,5,0,Math.PI*2);
      ctx2.fillStyle = dotColor(); ctx2.fill();
      ctx2.beginPath(); ctx2.arc(x,y,8,0,Math.PI*2);
      ctx2.strokeStyle = lt ? 'rgba(194,24,91,.3)' : 'rgba(201,169,110,.3)';
      ctx2.lineWidth = 1.5; ctx2.stroke();
    }

    ctx2.font = 'bold 11.5px Syne, sans-serif';
    ctx2.fillStyle = lt ? 'rgba(45,10,24,.78)' : 'rgba(240,236,227,.78)';
    ctx2.textBaseline = 'middle';
    for (let i = 0; i < N; i++) {
      const a = ang(i);
      const lx = cx + Math.cos(a)*(R+30), ly = cy + Math.sin(a)*(R+30);
      ctx2.textAlign = Math.cos(a) > .1 ? 'left' : Math.cos(a) < -.1 ? 'right' : 'center';
      ctx2.fillText(LABELS[i], lx, ly);
    }

    prog += .024;
    radarAnim = prog < 1 ? requestAnimationFrame(step) : null;
  })();
}

/* ─── THEME TOGGLE ─── */
(function initTheme() {
  const saved = localStorage.getItem('theme');
  const preferLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  if (saved === 'light' || (!saved && preferLight)) {
    document.documentElement.classList.add('light');
  }
  updateKnobIcon();
})();

function updateKnobIcon() {
  const isLight = document.documentElement.classList.contains('light');
  const knob = $('#toggleKnob');
  knob.innerHTML = isLight
    ? '<i class="fas fa-sun ti-sun"></i>'
    : '<i class="fas fa-moon ti-moon"></i>';
}

$('#themeBtn').addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
  const isLight = document.documentElement.classList.contains('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  updateKnobIcon();
  if (radarDone) setTimeout(drawRadar, 50);
});

/* ═══════════════════════════════════════════════
   CONTACT FORM — Validation + EmailJS
═══════════════════════════════════════════════ */
(function() {
  emailjs.init({ publicKey: '-zfOMXQheeCswMF9D' });
})();

const contactForm = $('#contactForm');
const sendBtn     = $('#sendBtn');
const fsuc        = $('#fsuc');
const ferr        = $('#ferr');

/* ── helpers ── */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getErr(id) { return document.getElementById(id); }

function setError(inputEl, errEl, msg) {
  inputEl.classList.add('input-err');
  inputEl.classList.remove('input-ok');
  inputEl.setAttribute('aria-invalid', 'true');
  errEl.textContent = msg;
  errEl.classList.add('visible');
}

function clearError(inputEl, errEl) {
  inputEl.classList.remove('input-err');
  inputEl.classList.add('input-ok');
  inputEl.setAttribute('aria-invalid', 'false');
  errEl.textContent = '';
  errEl.classList.remove('visible');
}

/* ── live validation on blur (once user has interacted) ── */
const fnEl   = $('#fn'),   fnErr  = getErr('fn-err');
const feEl   = $('#fe'),   feErr  = getErr('fe-err');
const fmsgEl = $('#fmsg'), fmsgErr = getErr('fmsg-err');

function validateName(live) {
  const val = fnEl.value.trim();
  if (!val) {
    setError(fnEl, fnErr, 'Please enter your name.');
    return false;
  }
  if (val.length < 2) {
    setError(fnEl, fnErr, 'Name must be at least 2 characters.');
    return false;
  }
  clearError(fnEl, fnErr);
  return true;
}

function validateEmail(live) {
  const val = feEl.value.trim();
  if (!val) {
    setError(feEl, feErr, 'Please enter your email address.');
    return false;
  }
  if (!emailRegex.test(val)) {
    setError(feEl, feErr, 'Please enter a valid email address (e.g. you@example.com).');
    return false;
  }
  clearError(feEl, feErr);
  return true;
}

function validateMessage(live) {
  const val = fmsgEl.value.trim();
  if (!val) {
    setError(fmsgEl, fmsgErr, 'Please write a message before sending.');
    return false;
  }
  if (val.length < 10) {
    setError(fmsgEl, fmsgErr, 'Message is too short — please add a bit more detail.');
    return false;
  }
  clearError(fmsgEl, fmsgErr);
  return true;
}

/* blur listeners — only kick in after first interaction */
fnEl.addEventListener('blur',   () => validateName(true));
feEl.addEventListener('blur',   () => validateEmail(true));
fmsgEl.addEventListener('blur', () => validateMessage(true));

/* clear error on input so feedback feels responsive */
fnEl.addEventListener('input',   () => { if (fnEl.classList.contains('input-err'))   validateName(true); });
feEl.addEventListener('input',   () => { if (feEl.classList.contains('input-err'))   validateEmail(true); });
fmsgEl.addEventListener('input', () => { if (fmsgEl.classList.contains('input-err')) validateMessage(true); });

/* ── submit ── */
contactForm.addEventListener('submit', function(e) {
  e.preventDefault();

  /* run all validations and collect results */
  const nameOk  = validateName();
  const emailOk = validateEmail();
  const msgOk   = validateMessage();

  fsuc.style.display = 'none';
  ferr.style.display = 'none';

  if (!nameOk || !emailOk || !msgOk) {
    /* scroll the first error into view */
    const firstErr = contactForm.querySelector('.input-err');
    if (firstErr) firstErr.focus();
    return;
  }

  /* disable button while sending */
  sendBtn.disabled = true;
  sendBtn.classList.add('loading');

  const templateParams = {
    from_name:  fnEl.value.trim(),
    from_email: feEl.value.trim(),
    subject:    ($('#fs')?.value.trim()) || 'Website Contact',
    message:    fmsgEl.value.trim(),
  };

  emailjs.send('service_xvf27ts', 'template_irpzijg', templateParams, {
    privateKey: '5j-YmJuW__BgCtEWtufRF'
  })
  .then(() => {
    fsuc.style.display = 'block';
    contactForm.reset();
    /* clear ok states after reset */
    [fnEl, feEl, fmsgEl].forEach(el => el.classList.remove('input-ok', 'input-err'));
  })
  .catch(() => {
    ferr.style.display = 'block';
  })
  .finally(() => {
    sendBtn.disabled = false;
    sendBtn.classList.remove('loading');
  });
});