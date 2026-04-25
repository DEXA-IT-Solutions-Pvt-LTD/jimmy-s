// Shared shell: nav + footer + theme + reveal-on-scroll + tweaks
(function () {
  // Apply theme from localStorage
  const stored = JSON.parse(localStorage.getItem('jimmy-tweaks') || '{}');
  const theme = stored.theme || 'cream';
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
      ['index.html', 'Work'],
      ['projects.html', 'Projects'],
      ['services.html', 'Services'],
      ['process.html', 'Process'],
      ['about.html', 'Studio'],
      ['testimonials.html', 'Voices'],
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
            <span class="brand-mark">J</span>
            <span class="brand-text">
              Jimmy's
              <small>Architects · Builders · Nagercoil</small>
            </span>
          </a>
          <div class="nav-links">${linkHtml}</div>
          <a href="contact.html" class="nav-cta">Start a project</a>
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
              <div class="footer-display"><em>Build slow.<br/>Build well.</em></div>
              <p class="footer-tagline">A Nagercoil studio designing homes, retreats and small commercial spaces along the southern coast of Tamil Nadu since 2004.</p>
            </div>
            <div>
              <h4>Studio</h4>
              <ul>
                <li><a href="about.html">Our story</a></li>
                <li><a href="process.html">Process</a></li>
                <li><a href="testimonials.html">Voices</a></li>
              </ul>
            </div>
            <div>
              <h4>Work</h4>
              <ul>
                <li><a href="projects.html">Projects</a></li>
                <li><a href="services.html">Services</a></li>
                <li><a href="contact.html">Enquire</a></li>
              </ul>
            </div>
            <div>
              <h4>Visit</h4>
              <ul>
                <li>Court Road, Nagercoil</li>
                <li>Kanyakumari Dist. — 629001</li>
                <li><a href="tel:+914652000000">+91 4652 000 000</a></li>
                <li><a href="mailto:studio@jimmys.in">studio@jimmys.in</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <span>© 2004 — 2026 · Jimmy's Architects &amp; Builders</span>
            <span>NGRCL · 8.1833° N, 77.4119° E</span>
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
