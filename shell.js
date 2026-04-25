// Shared shell: nav + footer + theme + reveal-on-scroll + tweaks
(function () {
  const TRACKING_KEY = 'jimmy-visitor-events';
  const SESSION_KEY = 'jimmy-visitor-session-id';
  const TRACKING_CONFIG = window.JIMMY_TRACKING || {};
  // Set these via window.JIMMY_TRACKING = { endpoint: '', siteKey: '' } before loading this script.
  const TRACKING_ENDPOINT = TRACKING_CONFIG.endpoint || 'https://visitor-tracker-api.keyflow-dev-backend.workers.dev/track-event';
  const TRACKING_SITE_KEY = TRACKING_CONFIG.siteKey || 'jimmy-s-main';

  function getSessionId() {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : `sess_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  }

  function getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'
    };
  }

  function saveEventLocally(payload) {
    const current = JSON.parse(localStorage.getItem(TRACKING_KEY) || '[]');
    current.push(payload);
    // Keep last 500 events so storage does not grow forever.
    const trimmed = current.slice(-500);
    localStorage.setItem(TRACKING_KEY, JSON.stringify(trimmed));
  }

  function sendEvent(payload) {
    saveEventLocally(payload);
    if (!TRACKING_ENDPOINT) return;

    const body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(TRACKING_ENDPOINT, blob);
        return;
      }
      fetch(TRACKING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true
      }).catch(() => {});
    } catch (_) {
      // Ignore telemetry failures so UX is never blocked.
    }
  }

  function track(eventType, data) {
    const payload = {
      eventType,
      timestampIso: new Date().toISOString(),
      sessionId: getSessionId(),
      siteKey: TRACKING_SITE_KEY || null,
      page: location.pathname.split('/').pop() || 'index.html',
      url: location.href,
      referrer: document.referrer || null,
      device: getDeviceInfo(),
      ...data
    };
    sendEvent(payload);
  }

  // Apply theme from localStorage
  const stored = JSON.parse(localStorage.getItem('jimmy-tweaks') || '{}');
  const theme = stored.theme || 'navy';
  const accent = stored.accent || null;
  const fontPair = stored.fontPair || 'serif-sans';
  document.documentElement.setAttribute('data-theme', theme);
  if (accent) {
    document.documentElement.style.setProperty('--accent', accent);
  }
  if (fontPair === 'didone-mono') {
    document.documentElement.style.setProperty('--serif', "'Bodoni Moda', 'Didot', serif");
    document.documentElement.style.setProperty('--sans', "'IBM Plex Sans', sans-serif");
  } else if (fontPair === 'modern-grotesk') {
    document.documentElement.style.setProperty('--serif', "'Fraunces', serif");
    document.documentElement.style.setProperty('--sans', "'Space Grotesk', sans-serif");
  }

  function navHtml(active) {
    const links = [
      ['index.html', 'Home'],
      ['about.html', 'About'],
      ['services.html', 'Services'],
      ['projects.html', 'Projects'],
      ['process.html', 'Process'],
      ['testimonials.html', 'Reviews'],
      ['contact.html', 'Contact']
    ];
    const linkHtml = links
      .map(([href, label]) => {
        const cls = href === active ? 'active' : '';
        return `<a href="${href}" class="${cls}">${label}</a>`;
      })
      .join('');
    return `
      <nav class="nav">
        <div class="nav-inner">
          <a href="index.html" class="brand">
            <img src="logo.png" alt="Jimmy's Architects &amp; Builders" class="brand-logo" />
            <span class="brand-text">
              Jimmy's
              <small>Architects · Builders · Est. 2009</small>
            </span>
          </a>
          <div class="nav-links">${linkHtml}</div>
          <a href="contact.html" class="nav-cta">Get a quote</a>
        </div>
      </nav>
    `;
  }

  function footerHtml() {
    return `
      <footer class="footer">
        <div class="footer-inner">
          <div class="footer-grid">
            <div>
              <img src="logo.png" alt="Jimmy's Architects &amp; Builders" style="width: 96px; height: 96px; background: #fff; padding: 6px; margin-bottom: 24px; display: block;" />
              <div class="footer-display"><em>Whose architect<br/>and builder<br/>is God.</em></div>
              <p class="footer-tagline">End-to-end architectural &amp; construction services from Nagercoil — quality, aesthetics, perfection, timely delivery, value for money. Since 2009.</p>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><a href="about.html">About</a></li>
                <li><a href="services.html">Services</a></li>
                <li><a href="process.html">Process</a></li>
                <li><a href="projects.html">Projects</a></li>
              </ul>
            </div>
            <div>
              <h4>Reach us</h4>
              <ul>
                <li><a href="tel:+917449021000">+91 74490 21000</a></li>
                <li><a href="tel:+917449031000">+91 74490 31000</a></li>
                <li><a href="https://wa.me/917449021000">WhatsApp</a></li>
                <li><a href="mailto:jimmysarchitectsbuilders@gmail.com">jimmysarchitectsbuilders@gmail.com</a></li>
              </ul>
            </div>
            <div>
              <h4>Two offices</h4>
              <ul>
                <li>WCC Road, Jey Pee Complex,<br/>Nagercoil — 629 001</li>
                <li style="margin-top:12px;">Near Old Mudippura Temple,<br/>Kollemcode</li>
                <li style="margin-top:12px;">Kanyakumari Dist., Tamil Nadu</li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© 2009 — 2026 · Jimmy's Architects &amp; Builders</span>
            <span>15 years · Kanyakumari · Tamil Nadu</span>
          </div>
        </div>
      </footer>
    `;
  }

  // Inject
  document.addEventListener('DOMContentLoaded', () => {
    track('page_visit');

    const navMount = document.getElementById('nav-mount');
    const footerMount = document.getElementById('footer-mount');
    if (navMount) navMount.outerHTML = navHtml(navMount.dataset.active || '');
    if (footerMount) footerMount.outerHTML = footerHtml();

    document.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener('click', () => {
        track('navigation_click', {
          targetHref: link.getAttribute('href') || '',
          targetText: (link.textContent || '').trim().slice(0, 100)
        });
      });
    });

    // Reveal on scroll
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  });
})();
