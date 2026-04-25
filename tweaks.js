// Tweaks panel - vanilla JS implementation of the host protocol
(function () {
  const STORAGE = 'jimmy-tweaks';
  const defaults = { theme: 'cream', accent: '', fontPair: 'serif-sans' };
  let state = { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE) || '{}') };
  let panel = null;

  const ACCENTS = {
    cream: ['#b85c38', '#8a6d3b', '#3d4a37', '#2d4a5a'],
    stone: ['#5a6b52', '#7a5b3a', '#3d4a5a', '#7a3a4a'],
    ink:   ['#d68b62', '#c9a85c', '#8aa57a', '#7a9ec9']
  };

  function applyState() {
    document.documentElement.setAttribute('data-theme', state.theme);
    if (state.accent) {
      document.documentElement.style.setProperty('--accent', state.accent);
    } else {
      document.documentElement.style.removeProperty('--accent');
    }
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
    if (key === 'theme') {
      // reset accent so swatches refresh; pick first of new theme
      state.accent = '';
    }
    applyState();
    renderPanel();
  }

  function renderPanel() {
    if (!panel) return;
    const accents = ACCENTS[state.theme] || ACCENTS.cream;
    panel.innerHTML = `
      <div class="tw-head">
        <div>
          <div class="tw-title">Tweaks</div>
          <div class="tw-sub">Try a direction</div>
        </div>
        <button class="tw-close" aria-label="Close">×</button>
      </div>

      <div class="tw-section">
        <div class="tw-label">Palette</div>
        <div class="tw-row">
          ${[
            ['cream', 'Warm cream'],
            ['stone', 'Cool stone'],
            ['ink',   'Dark ink']
          ].map(([k, label]) => `
            <button class="tw-pill ${state.theme === k ? 'on' : ''}" data-act="theme" data-val="${k}">
              <span class="tw-swatch tw-swatch-${k}"></span>${label}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="tw-section">
        <div class="tw-label">Accent</div>
        <div class="tw-swatches">
          ${accents.map(c => `
            <button class="tw-color ${state.accent === c ? 'on' : ''}" style="background:${c}" data-act="accent" data-val="${c}" aria-label="${c}"></button>
          `).join('')}
          <button class="tw-color ${!state.accent ? 'on' : ''}" data-act="accent" data-val="" aria-label="default" style="background:transparent;border:1px dashed currentColor;"><span style="font-size:9px;font-family:monospace;">DEF</span></button>
        </div>
      </div>

      <div class="tw-section">
        <div class="tw-label">Type pairing</div>
        <div class="tw-stack">
          ${[
            ['serif-sans',     'Cormorant + Inter Tight', 'Editorial classic'],
            ['didone-mono',    'Bodoni + IBM Plex',       'High contrast'],
            ['modern-grotesk', 'Fraunces + Space Grotesk','Contemporary']
          ].map(([k, name, hint]) => `
            <button class="tw-radio ${state.fontPair === k ? 'on' : ''}" data-act="fontPair" data-val="${k}">
              <span class="tw-radio-name">${name}</span>
              <span class="tw-radio-hint">${hint}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    panel.querySelectorAll('[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.act;
        const val = btn.dataset.val;
        set(act, val);
      });
    });
    panel.querySelector('.tw-close')?.addEventListener('click', hide);
  }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'tweaks-panel';
    panel.style.cssText = `
      position: fixed; right: 24px; bottom: 24px; z-index: 200;
      width: 320px; background: var(--paper); color: var(--ink);
      border: 1px solid var(--ink); padding: 20px; font-family: var(--sans);
      box-shadow: 0 24px 60px -20px rgba(0,0,0,0.35);
      display: none;
    `;
    const style = document.createElement('style');
    style.textContent = `
      #tweaks-panel .tw-head { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
      #tweaks-panel .tw-title { font-family: var(--serif); font-size: 22px; font-style: italic; line-height: 1; }
      #tweaks-panel .tw-sub { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-3); margin-top: 6px; }
      #tweaks-panel .tw-close { background: none; border: none; font-size: 24px; line-height: 1; cursor: pointer; color: var(--ink); padding: 0; }
      #tweaks-panel .tw-section { margin-bottom: 18px; }
      #tweaks-panel .tw-label { font-family: var(--mono); font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 10px; }
      #tweaks-panel .tw-row { display:flex; flex-direction: column; gap: 6px; }
      #tweaks-panel .tw-pill { display:flex; align-items:center; gap: 10px; padding: 8px 10px; border: 1px solid var(--line); background: transparent; cursor: pointer; font-family: var(--sans); font-size: 12px; color: var(--ink); text-align: left; }
      #tweaks-panel .tw-pill.on { border-color: var(--ink); background: var(--bg-2); }
      #tweaks-panel .tw-swatch { width: 14px; height: 14px; border: 1px solid var(--line); display:inline-block; }
      #tweaks-panel .tw-swatch-cream { background: linear-gradient(135deg, #f5f0e8 50%, #b85c38 50%); }
      #tweaks-panel .tw-swatch-stone { background: linear-gradient(135deg, #eceae5 50%, #5a6b52 50%); }
      #tweaks-panel .tw-swatch-ink   { background: linear-gradient(135deg, #15130f 50%, #d68b62 50%); }
      #tweaks-panel .tw-swatches { display:flex; gap: 8px; flex-wrap: wrap; }
      #tweaks-panel .tw-color { width: 28px; height: 28px; border: 1px solid var(--line); cursor: pointer; padding: 0; display:grid; place-items:center; color: var(--ink-3); }
      #tweaks-panel .tw-color.on { outline: 2px solid var(--ink); outline-offset: 2px; }
      #tweaks-panel .tw-stack { display:flex; flex-direction: column; gap: 6px; }
      #tweaks-panel .tw-radio { padding: 10px 12px; border: 1px solid var(--line); background: transparent; cursor: pointer; text-align: left; display:flex; flex-direction:column; gap: 2px; color: var(--ink); }
      #tweaks-panel .tw-radio.on { border-color: var(--ink); background: var(--bg-2); }
      #tweaks-panel .tw-radio-name { font-size: 12px; }
      #tweaks-panel .tw-radio-hint { font-family: var(--mono); font-size: 10px; color: var(--ink-3); }
    `;
    document.head.appendChild(style);
    document.body.appendChild(panel);
    return panel;
  }

  function show() {
    ensurePanel();
    panel.style.display = 'block';
    renderPanel();
  }

  function hide() {
    if (panel) panel.style.display = 'none';
    window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
  }

  // Register listener BEFORE announcing availability
  window.addEventListener('message', (e) => {
    if (!e.data || typeof e.data !== 'object') return;
    if (e.data.type === '__activate_edit_mode') show();
    if (e.data.type === '__deactivate_edit_mode') hide();
  });

  // Apply persisted state on load
  applyState();

  // Announce
  window.parent.postMessage({ type: '__edit_mode_available' }, '*');
})();
