// Client-facing review & tweaks panel — always visible on deployed site
// Lets the client try palettes, leave notes, and send approval/feedback
(function () {
  const STORAGE = 'jimmy-tweaks';
  const NOTES = 'jimmy-feedback';
  const defaults = { theme: 'navy', accent: '', fontPair: 'serif-sans' };
  let state = { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE) || '{}') };
  let open = false;
  let panel = null;
  let fab = null;

  // Studio contact for approvals
  const STUDIO_EMAIL = 'jimmysarchitectsbuilders@gmail.com';
  const STUDIO_WA = '917449021000';

  const ACCENTS = {
    navy:  ['#f5b800', '#e89622', '#d49d00', '#a17a45'],
    cream: ['#e89622', '#b85c38', '#8a6d3b', '#3d4a37'],
    stone: ['#5a6b52', '#e89622', '#7a5b3a', '#3d4a5a'],
    ink:   ['#e89622', '#d68b62', '#c9a85c', '#8aa57a']
  };

  function applyState() {
    document.documentElement.setAttribute('data-theme', state.theme);
    if (state.accent) document.documentElement.style.setProperty('--accent', state.accent);
    else document.documentElement.style.removeProperty('--accent');
    if (state.fontPair === 'didone-mono') {
      document.documentElement.style.setProperty('--serif', "'Bodoni Moda', 'Didot', serif");
      document.documentElement.style.setProperty('--sans', "'IBM Plex Sans', sans-serif");
    } else if (state.fontPair === 'modern-grotesk') {
      document.documentElement.style.setProperty('--serif', "'Fraunces', serif");
      document.documentElement.style.setProperty('--sans', "'Space Grotesk', sans-serif");
    } else {
      document.documentElement.style.setProperty('--serif', "'Cormorant Garamond', 'Times New Roman', serif");
      document.documentElement.style.setProperty('--sans', "'Inter Tight', 'Helvetica Neue', sans-serif");
    }
    localStorage.setItem(STORAGE, JSON.stringify(state));
  }

  function set(key, value) {
    state[key] = value;
    if (key === 'theme') state.accent = '';
    applyState();
    render();
  }

  function buildSummary() {
    const themeMap = { navy: 'Brand Navy', cream: 'Warm Cream', stone: 'Cool Stone', ink: 'Dark Ink' };
    const fontMap = { 'serif-sans': 'Cormorant + Inter Tight', 'didone-mono': 'Bodoni + IBM Plex', 'modern-grotesk': 'Fraunces + Space Grotesk' };
    return [
      `Palette: ${themeMap[state.theme] || state.theme}`,
      `Accent: ${state.accent || 'default'}`,
      `Type pairing: ${fontMap[state.fontPair] || state.fontPair}`,
      `Page: ${location.pathname.split('/').pop() || 'index.html'}`
    ].join('\n');
  }

  function sendApproval(decision) {
    const name = (panel.querySelector('#rev-name') || {}).value || '';
    const note = (panel.querySelector('#rev-note') || {}).value || '';
    const subject = encodeURIComponent(`[Jimmy's Website] ${decision} — ${name || 'Client'}`);
    const body = encodeURIComponent(
      `Decision: ${decision}\n` +
      `From: ${name || '(name not provided)'}\n\n` +
      `Notes:\n${note || '(none)'}\n\n` +
      `— Selected design settings —\n${buildSummary()}\n\n` +
      `Reviewed at: ${new Date().toLocaleString()}\n` +
      `URL: ${location.href}`
    );
    const mailto = `mailto:${STUDIO_EMAIL}?subject=${subject}&body=${body}`;
    const wa = `https://wa.me/${STUDIO_WA}?text=${body}`;
    // Persist locally
    const log = JSON.parse(localStorage.getItem(NOTES) || '[]');
    log.push({ decision, name, note, settings: state, at: new Date().toISOString(), url: location.href });
    localStorage.setItem(NOTES, JSON.stringify(log));
    // Open both
    window.open(mailto, '_blank');
    setTimeout(() => window.open(wa, '_blank'), 400);
    panel.querySelector('#rev-thanks').style.display = 'block';
    setTimeout(() => { panel.querySelector('#rev-thanks').style.display = 'none'; }, 6000);
  }

  function render() {
    if (!panel) return;
    const accents = ACCENTS[state.theme] || ACCENTS.navy;
    panel.innerHTML = `
      <div class="rv-head">
        <div>
          <div class="rv-title">Try styles</div>
          <div class="rv-sub">Palette · accent · type</div>
        </div>
        <button class="rv-close" aria-label="Close">×</button>
      </div>

      <div class="rv-section">
        <div class="rv-label">01 · Palette</div>
        <div class="rv-row">
          ${[
            ['navy',  'Brand navy (default)'],
            ['cream', 'Warm cream'],
            ['stone', 'Cool stone'],
            ['ink',   'Dark ink']
          ].map(([k, label]) => `
            <button class="rv-pill ${state.theme === k ? 'on' : ''}" data-act="theme" data-val="${k}">
              <span class="rv-swatch rv-swatch-${k}"></span>${label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="rv-section">
        <div class="rv-label">02 · Accent</div>
        <div class="rv-swatches">
          ${accents.map(c => `
            <button class="rv-color ${state.accent === c ? 'on' : ''}" style="background:${c}" data-act="accent" data-val="${c}" aria-label="${c}"></button>
          `).join('')}
          <button class="rv-color ${!state.accent ? 'on' : ''}" data-act="accent" data-val="" aria-label="default" style="background:transparent;border:1px dashed currentColor;"><span style="font-size:9px;font-family:monospace;">DEF</span></button>
        </div>
      </div>

      <div class="rv-section">
        <div class="rv-label">03 · Type pairing</div>
        <div class="rv-stack">
          ${[
            ['serif-sans',     'Cormorant + Inter Tight', 'Editorial classic'],
            ['didone-mono',    'Bodoni + IBM Plex',       'High contrast'],
            ['modern-grotesk', 'Fraunces + Space Grotesk','Contemporary']
          ].map(([k, name, hint]) => `
            <button class="rv-radio ${state.fontPair === k ? 'on' : ''}" data-act="fontPair" data-val="${k}">
              <span class="rv-radio-name">${name}</span>
              <span class="rv-radio-hint">${hint}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    panel.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => set(btn.dataset.act, btn.dataset.val));
    });
    panel.querySelector('.rv-close').addEventListener('click', toggle);
  }

  function ensure() {
    if (panel) return;

    fab = document.createElement('button');
    fab.id = 'review-fab';
    fab.innerHTML = `
      <span class="fab-dot"></span>
      <span class="fab-text">Try styles</span>
    `;
    fab.addEventListener('click', toggle);

    panel = document.createElement('div');
    panel.id = 'review-panel';

    const style = document.createElement('style');
    style.textContent = `
      #review-fab {
        position: fixed; right: 24px; bottom: 24px; z-index: 200;
        display: flex; align-items: center; gap: 10px;
        padding: 14px 20px;
        background: #f5b800; color: #0d1b2e;
        border: none; cursor: pointer;
        font-family: 'Inter Tight', sans-serif;
        font-size: 13px; font-weight: 600;
        letter-spacing: 0.04em;
        box-shadow: 0 12px 32px -8px rgba(0,0,0,0.4);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      #review-fab:hover { transform: translateY(-2px); box-shadow: 0 16px 40px -8px rgba(0,0,0,0.5); }
      #review-fab .fab-dot {
        width: 8px; height: 8px; background: #0d1b2e; border-radius: 50%;
        animation: rvPulse 2s ease infinite;
      }
      @keyframes rvPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      @media (max-width: 600px) {
        #review-fab .fab-text { display: none; }
        #review-fab { padding: 14px; border-radius: 50%; width: 52px; height: 52px; justify-content: center; }
      }

      #review-panel {
        position: fixed; right: 24px; bottom: 24px; z-index: 201;
        width: 360px; max-width: calc(100vw - 32px);
        max-height: calc(100vh - 48px); overflow-y: auto;
        background: var(--paper, #fff); color: var(--ink, #0d1b2e);
        border: 1px solid var(--ink, #0d1b2e); padding: 24px;
        font-family: 'Inter Tight', sans-serif;
        box-shadow: 0 32px 80px -20px rgba(0,0,0,0.5);
        display: none;
      }
      #review-panel.open { display: block; }

      #review-panel .rv-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
      #review-panel .rv-title { font-family: var(--serif); font-size: 24px; font-style: italic; line-height: 1; }
      #review-panel .rv-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-3); margin-top: 6px; }
      #review-panel .rv-close { background: none; border: none; font-size: 28px; line-height: 1; cursor: pointer; color: var(--ink); padding: 0; }

      #review-panel .rv-section { margin-bottom: 20px; }
      #review-panel .rv-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 10px; }

      #review-panel .rv-row { display:flex; flex-direction: column; gap: 6px; }
      #review-panel .rv-pill { display:flex; align-items:center; gap: 10px; padding: 10px; border: 1px solid var(--line); background: transparent; cursor: pointer; font-size: 12px; color: var(--ink); text-align: left; }
      #review-panel .rv-pill.on { border-color: var(--ink); background: var(--bg-2); }
      #review-panel .rv-swatch { width: 16px; height: 16px; border: 1px solid var(--line); display:inline-block; }
      #review-panel .rv-swatch-navy  { background: linear-gradient(135deg, #0d1b2e 50%, #f5b800 50%); }
      #review-panel .rv-swatch-cream { background: linear-gradient(135deg, #f5f0e8 50%, #e89622 50%); }
      #review-panel .rv-swatch-stone { background: linear-gradient(135deg, #eceae5 50%, #5a6b52 50%); }
      #review-panel .rv-swatch-ink   { background: linear-gradient(135deg, #15130f 50%, #d68b62 50%); }

      #review-panel .rv-swatches { display:flex; gap: 8px; flex-wrap: wrap; }
      #review-panel .rv-color { width: 30px; height: 30px; border: 1px solid var(--line); cursor: pointer; padding: 0; display:grid; place-items:center; color: var(--ink-3); }
      #review-panel .rv-color.on { outline: 2px solid var(--ink); outline-offset: 2px; }

      #review-panel .rv-stack { display:flex; flex-direction: column; gap: 6px; }
      #review-panel .rv-radio { padding: 10px 12px; border: 1px solid var(--line); background: transparent; cursor: pointer; text-align: left; display:flex; flex-direction:column; gap: 2px; color: var(--ink); }
      #review-panel .rv-radio.on { border-color: var(--ink); background: var(--bg-2); }
      #review-panel .rv-radio-name { font-size: 12px; }
      #review-panel .rv-radio-hint { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--ink-3); }

      #review-panel .rv-finalise { padding-top: 20px; border-top: 1px solid var(--line); margin-top: 8px; }
      #review-panel .rv-input { width: 100%; padding: 10px 12px; margin-bottom: 8px; background: var(--bg, transparent); border: 1px solid var(--line); color: var(--ink); font-family: inherit; font-size: 13px; outline: none; }
      #review-panel .rv-input:focus { border-color: var(--accent, #f5b800); }
      #review-panel textarea.rv-input { resize: vertical; }

      #review-panel .rv-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px; }
      #review-panel .rv-btn { padding: 12px; font-family: inherit; font-size: 12px; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; cursor: pointer; border: 1px solid var(--ink); }
      #review-panel .rv-btn-primary { background: #f5b800; color: #0d1b2e; border-color: #f5b800; }
      #review-panel .rv-btn-primary:hover { background: #d49d00; border-color: #d49d00; }
      #review-panel .rv-btn-ghost { background: transparent; color: var(--ink); }
      #review-panel .rv-btn-ghost:hover { background: var(--ink); color: var(--paper); }

      #review-panel .rv-hint { margin-top: 10px; font-size: 11px; color: var(--ink-3); }
      #review-panel .rv-thanks { display: none; margin-top: 12px; padding: 10px 12px; background: var(--bg-2); border-left: 3px solid #f5b800; font-size: 12px; }
    `;
    document.head.appendChild(style);
    document.body.appendChild(fab);
    document.body.appendChild(panel);
  }

  function toggle() {
    open = !open;
    panel.classList.toggle('open', open);
    fab.style.display = open ? 'none' : 'flex';
    if (open) render();
  }

  // Init
  applyState();
  document.addEventListener('DOMContentLoaded', ensure);
  if (document.readyState !== 'loading') ensure();

  // Compatibility with editor host (kept so editor toolbar still works)
  window.addEventListener('message', (e) => {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.type === '__activate_edit_mode' && !open) toggle();
    if (e.data.type === '__deactivate_edit_mode' && open) toggle();
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch(_) {}
})();
