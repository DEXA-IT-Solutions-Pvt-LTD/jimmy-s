// Shared shell: nav + footer + theme + reveal-on-scroll + tweaks
(function () {
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
    const navMount = document.getElementById('nav-mount');
    const footerMount = document.getElementById('footer-mount');
    if (navMount) navMount.outerHTML = navHtml(navMount.dataset.active || '');
    if (footerMount) footerMount.outerHTML = footerHtml();

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
