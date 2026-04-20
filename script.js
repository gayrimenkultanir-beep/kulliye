/**
 * Sultan II. Bayezid Külliyesi Sağlık Müzesi
 * Main JavaScript — Modüler yapı
 */

/* ─────────────────────────────────────────────
   YARDIMCI FONKSİYONLAR
───────────────────────────────────────────── */

/**
 * DOM hazır olduğunda çalıştır (defer ile kullanıldığında direkt çalışır)
 */
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

/**
 * Güvenli querySelector
 */
function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/* ─────────────────────────────────────────────
   SPLASH SCREEN
───────────────────────────────────────────── */
function initSplash() {
  const splash = qs('#splash');
  if (!splash) return;

  const SPLASH_DURATION = 3200;

  window.addEventListener('load', () => {
    setTimeout(() => {
      splash.classList.add('out');

      // Erişilebilirlik: gizlendikten sonra DOM'dan kaldır
      splash.addEventListener('transitionend', () => {
        splash.remove();
      }, { once: true });
    }, SPLASH_DURATION);
  });
}

/* ─────────────────────────────────────────────
   HAMBURGER / MOBİL MENÜ
───────────────────────────────────────────── */
function initMobileMenu() {
  const hamburger  = qs('#hamburger');
  const mobileMenu = qs('#mobileMenu');
  if (!hamburger || !mobileMenu) return;

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.removeAttribute('aria-hidden');
    // İlk linke focus
    const firstLink = qs('a', mobileMenu);
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  function toggleMenu() {
    const isOpen = hamburger.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Dışarı tıklayınca kapat
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && e.target !== hamburger) {
      closeMenu();
    }
  });

  // ESC tuşuyla kapat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.classList.contains('open')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Mobil menü linklerine tıklayınca kapat
  qsa('a', mobileMenu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* ─────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────── */
function initScrollReveal() {
  const elements = qsa('.reveal, .tl-item');
  if (!elements.length) return;

  // Reduced motion: direkt görünür yap
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────────
   HERO SCROLL BUTONU
───────────────────────────────────────────── */
function initHeroScroll() {
  const scrollBtn     = qs('#scrollDown');
  const videoSection  = qs('#video-section');
  if (!scrollBtn || !videoSection) return;

  scrollBtn.addEventListener('click', () => {
    videoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

/* ─────────────────────────────────────────────
   BACK TO TOP
───────────────────────────────────────────── */
function initBackToTop() {
  const btt = qs('#btt');
  if (!btt) return;

  const THRESHOLD = 400;

  const onScroll = () => {
    btt.classList.toggle('show', window.scrollY > THRESHOLD);
  };

  // Throttle ile performans iyileştirme
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btt.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Erişilebilirlik: focus'u hero'ya taşı
    const hero = qs('#hero');
    if (hero) hero.setAttribute('tabindex', '-1'), hero.focus();
  });
}

/* ─────────────────────────────────────────────
   HABER / DUYURU SEKMELERİ
───────────────────────────────────────────── */
function initNewsTabs() {
  const tabs   = qsa('.news-tab');
  const panels = qsa('.news-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = 'tab-' + tab.dataset.tab;

      // Aktif sekmeyi güncelle
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Aktif paneli göster
      panels.forEach(panel => {
        const isActive = panel.id === targetId;
        panel.classList.toggle('active', isActive);
        if (isActive) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      });
    });

    // Klavye navigasyonu (sol/sağ ok tuşları)
    tab.addEventListener('keydown', (e) => {
      const idx = tabs.indexOf(tab);
      let nextIdx;

      if (e.key === 'ArrowRight') {
        nextIdx = (idx + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        nextIdx = (idx - 1 + tabs.length) % tabs.length;
      } else {
        return;
      }

      e.preventDefault();
      tabs[nextIdx].focus();
      tabs[nextIdx].click();
    });
  });
}

/* ─────────────────────────────────────────────
   GOOGLE SHEETS CSV YÜKLEME
───────────────────────────────────────────── */
const SHEET_CONFIG = [
  {
    listId : 'list-duyurular',
    url    : 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQQERf8SWNyArJj-5FUlJgcfaMWqNkiQpa0Zuzgx3gTxUb1afXeA9Lw45RUB1yN5uOfUdkMK44C12HM/pub?gid=0&single=true&output=csv',
    dateCol: 'TARİH',
    textCol: 'DUYURU METNİ',
  },
  {
    listId : 'list-haberler',
    url    : 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQQERf8SWNyArJj-5FUlJgcfaMWqNkiQpa0Zuzgx3gTxUb1afXeA9Lw45RUB1yN5uOfUdkMK44C12HM/pub?gid=995325209&single=true&output=csv',
    dateCol: 'TARİH',
    textCol: 'DUYURU METNİ',
  },
  {
    listId : 'list-basinda',
    url    : 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQQERf8SWNyArJj-5FUlJgcfaMWqNkiQpa0Zuzgx3gTxUb1afXeA9Lw45RUB1yN5uOfUdkMK44C12HM/pub?gid=1712536451&single=true&output=csv',
    dateCol: 'TARİH',
    textCol: 'DUYURU METNİ',
  },
];

const MAX_NEWS_ITEMS = 5;

function renderNewsItems(listEl, rows, dateCol, textCol) {
  listEl.innerHTML = '';

  if (!rows.length) {
    listEl.innerHTML = '<li class="news-item"><span class="news-text">Kayıt bulunamadı.</span></li>';
    return;
  }

  const fragment = document.createDocumentFragment();
  rows.slice(0, MAX_NEWS_ITEMS).forEach(row => {
    const li = document.createElement('li');
    li.className = 'news-item';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'news-date';
    dateSpan.textContent = row[dateCol] || '';

    const textSpan = document.createElement('span');
    textSpan.className = 'news-text';
    textSpan.textContent = row[textCol] || '';

    li.appendChild(dateSpan);
    li.appendChild(textSpan);
    fragment.appendChild(li);
  });

  listEl.appendChild(fragment);
}

function loadSheetData(config) {
  const listEl = qs('#' + config.listId);
  if (!listEl) return;

  if (typeof Papa === 'undefined') {
    listEl.innerHTML = '<li class="news-item"><span class="news-text">PapaParse yüklenemedi.</span></li>';
    return;
  }

  Papa.parse(config.url, {
    download        : true,
    header          : true,
    skipEmptyLines  : true,
    complete(results) {
      const rows = [...results.data].reverse();
      renderNewsItems(listEl, rows, config.dateCol, config.textCol);
    },
    error() {
      listEl.innerHTML = '<li class="news-item"><span class="news-text">Veriler yüklenemedi. Lütfen tekrar deneyin.</span></li>';
    },
  });
}

function initNewsData() {
  SHEET_CONFIG.forEach(loadSheetData);
}

/* ─────────────────────────────────────────────
   SAYAÇ ANİMASYONU
───────────────────────────────────────────── */
function animateCounter(el, target, duration = 2000) {
  if (!el) return;

  // Reduced motion: direkt göster
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = target.toLocaleString('tr-TR');
    return;
  }

  const startTime  = performance.now();
  const startValue = 0;

  function update(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startValue + (target - startValue) * easedProgress);

    el.textContent = current.toLocaleString('tr-TR');

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target.toLocaleString('tr-TR');
    }
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const visitSection = qs('#visit');
  if (!visitSection) return;

  let countersStarted = false;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;

      animateCounter(qs('#counter-years'), 537, 2000);
      animateCounter(qs('#counter-rooms'), 4,   800);

      observer.disconnect();
    }
  }, { threshold: 0.3 });

  observer.observe(visitSection);
}

/* ─────────────────────────────────────────────
   SMOOTH SCROLL (iç linkler için)
───────────────────────────────────────────── */
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = qs(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = qs('#navbar')?.offsetHeight || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ─────────────────────────────────────────────
   INIT — Tüm modülleri başlat
───────────────────────────────────────────── */
initSplash();

ready(() => {
  initMobileMenu();
  initScrollReveal();
  initHeroScroll();
  initBackToTop();
  initNewsTabs();
  initNewsData();
  initCounters();
  initSmoothScroll();
  initWaterRipple();
});

/* ─────────────────────────────────────────────
   SU DALGALANMA EFEKTİ — WebGL Ripple Simülasyonu
   Hero alanında mouse/touch takibi ile gerçek
   su yüzey fiziği simüle eder.
───────────────────────────────────────────── */
function initWaterRipple() {
  const hero = qs('#hero');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'water-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) { canvas.remove(); return; }

  /* ── GLSL Shader Kaynakları ── */
  const VS = `attribute vec2 a_pos;varying vec2 v_uv;void main(){v_uv=a_pos*.5+.5;gl_Position=vec4(a_pos,0.,1.);}`;

  const SIM_FS = `precision highp float;
    uniform sampler2D u_prev;uniform vec2 u_res;
    uniform vec2 u_drop;uniform float u_dropAmt,u_damping;
    varying vec2 v_uv;
    void main(){
      vec2 px=1./u_res;
      float c=texture2D(u_prev,v_uv).r;
      float l=texture2D(u_prev,v_uv-vec2(px.x,0.)).r;
      float r=texture2D(u_prev,v_uv+vec2(px.x,0.)).r;
      float u=texture2D(u_prev,v_uv+vec2(0.,px.y)).r;
      float d=texture2D(u_prev,v_uv-vec2(0.,px.y)).r;
      float vel=texture2D(u_prev,v_uv).g;
      float acc=(l+r+u+d)*.5-c;
      vel=(vel+acc)*u_damping;
      float next=c+vel;
      float dist=distance(v_uv,u_drop);
      if(dist<.018) next+=u_dropAmt*(1.-dist/.018);
      gl_FragColor=vec4(clamp(next,-1.,1.),vel,0.,1.);
    }`;

  const RENDER_FS = `precision highp float;
    uniform sampler2D u_sim,u_env;uniform vec2 u_res;
    varying vec2 v_uv;
    void main(){
      vec2 px=1./u_res;
      float l=texture2D(u_sim,v_uv-vec2(px.x,0.)).r;
      float r=texture2D(u_sim,v_uv+vec2(px.x,0.)).r;
      float u=texture2D(u_sim,v_uv+vec2(0.,px.y)).r;
      float d=texture2D(u_sim,v_uv-vec2(0.,px.y)).r;
      vec2 normal=vec2(r-l,u-d)*8.;
      vec3 env=texture2D(u_env,v_uv+normal*.04).rgb;
      float spec=pow(max(dot(normalize(vec3(normal,1.)),normalize(vec3(.3,.6,1.))),0.),40.);
      float h=texture2D(u_sim,v_uv).r;
      vec3 gold=vec3(.78,.66,.30);
      vec3 dark=vec3(.10,.063,.031);
      vec3 water=mix(dark,dark*1.4,h*.5+.5);
      vec3 col=env*.6+water*.4+gold*spec*.7;
      col+=vec3(.12,.08,.02)*max(h,0.)*.4;
      gl_FragColor=vec4(col,1.);
    }`;

  /* ── Shader / Program Yardımcıları ── */
  function mkShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s); return s;
  }
  function mkProg(vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, mkShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, mkShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p); return p;
  }

  const simProg    = mkProg(VS, SIM_FS);
  const renderProg = mkProg(VS, RENDER_FS);

  const quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);

  function bindQuad(prog) {
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  }

  /* ── Texture / Framebuffer ── */
  function mkTex(w, h) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function mkFB(tex) {
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    return fb;
  }

  /* ── Ortam Dokusu (altın desenli koyu zemin) ── */
  function buildEnvTex() {
    const size = 512;
    const c2 = document.createElement('canvas');
    c2.width = c2.height = size;
    const ctx = c2.getContext('2d');
    ctx.fillStyle = '#1a1008';
    ctx.fillRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2;
    const gold = 'rgba(201,168,76,';
    for (let i = 5; i > 0; i--) {
      ctx.beginPath(); ctx.arc(cx, cy, i * size / 12, 0, Math.PI * 2);
      ctx.strokeStyle = gold + (0.04 * i) + ')'; ctx.lineWidth = 1; ctx.stroke();
    }
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(ang) * size * 0.6, cy + Math.sin(ang) * size * 0.6);
      ctx.strokeStyle = gold + '0.06)'; ctx.lineWidth = 1; ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
    g.addColorStop(0, 'rgba(201,168,76,0.25)'); g.addColorStop(1, 'rgba(201,168,76,0)');
    ctx.fillStyle = g; ctx.fill();
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c2);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  let W, H, fbs, texs, envTex;

  function resize() {
    const rect = hero.getBoundingClientRect();
    W = Math.max(1, Math.floor(rect.width  * 0.5));
    H = Math.max(1, Math.floor(rect.height * 0.5));
    canvas.width  = rect.width;
    canvas.height = rect.height;
    if (fbs)  fbs.forEach(f => gl.deleteFramebuffer(f));
    if (texs) texs.forEach(t => gl.deleteTexture(t));
    if (envTex) gl.deleteTexture(envTex);
    texs = [mkTex(W, H), mkTex(W, H)];
    fbs  = [mkFB(texs[0]), mkFB(texs[1])];
    envTex = buildEnvTex();
  }

  resize();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 150);
  });

  /* ── Mouse / Touch Takibi ── */
  let cur = 0;
  let mouse = { x: -1, y: -1, active: false };
  let lastDrop = { x: -1, y: -1 };
  let dropAmt = 0;

  function getPos(e) {
    const r = canvas.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - r.left) / r.width, y: 1.0 - (cy - r.top) / r.height };
  }

  hero.addEventListener('mousemove', e => {
    const p = getPos(e);
    mouse = { x: p.x, y: p.y, active: true };
    const dx = p.x - lastDrop.x, dy = p.y - lastDrop.y;
    if (dx * dx + dy * dy > 0.0004) {
      dropAmt = 0.35; lastDrop = { x: p.x, y: p.y };
    }
  });

  hero.addEventListener('mouseleave', () => { mouse.active = false; dropAmt = 0; });

  hero.addEventListener('touchmove', e => {
    e.preventDefault();
    const p = getPos(e);
    mouse = { x: p.x, y: p.y, active: true };
    dropAmt = 0.6; lastDrop = { x: p.x, y: p.y };
  }, { passive: false });

  hero.addEventListener('click', e => {
    const p = getPos(e); mouse = p; dropAmt = 0.85; lastDrop = p;
  });

  /* ── Render Döngüsü ── */
  function uLoc(prog, name) { return gl.getUniformLocation(prog, name); }

  function step() {
    const next = 1 - cur;

    // Simülasyon geçişi
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbs[next]);
    gl.viewport(0, 0, W, H);
    gl.useProgram(simProg);
    bindQuad(simProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texs[cur]);
    gl.uniform1i(uLoc(simProg, 'u_prev'), 0);
    gl.uniform2f(uLoc(simProg, 'u_res'), W, H);
    gl.uniform2f(uLoc(simProg, 'u_drop'), mouse.x, mouse.y);
    gl.uniform1f(uLoc(simProg, 'u_dropAmt'), dropAmt);
    gl.uniform1f(uLoc(simProg, 'u_damping'), 0.985);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    dropAmt *= 0.7;

    // Render geçişi
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(renderProg);
    bindQuad(renderProg);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texs[next]);
    gl.uniform1i(uLoc(renderProg, 'u_sim'), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, envTex);
    gl.uniform1i(uLoc(renderProg, 'u_env'), 1);
    gl.uniform2f(uLoc(renderProg, 'u_res'), W, H);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    cur = next;

    // Otomatik damlacık (mouse olmadığında)
    if (!mouse.active && Math.random() < 0.012) {
      mouse.x = 0.25 + Math.random() * 0.5;
      mouse.y = 0.25 + Math.random() * 0.5;
      dropAmt = 0.18 + Math.random() * 0.22;
      lastDrop = { x: mouse.x, y: mouse.y };
    }

    requestAnimationFrame(step);
  }

  step();
}
