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
});
