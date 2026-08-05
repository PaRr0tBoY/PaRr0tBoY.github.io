(() => {
  const root = document.documentElement;
  const nav = document.querySelector('.site-shell-nav, .navbar-fixed');
  const lang = document.querySelector('[data-site-lang], #langBtn');
  const mode = document.querySelector('[data-site-mode], #modeBtn');
  const savedMode = localStorage.getItem('mode');
  const savedLang = localStorage.getItem('lang');
  const setMode = dark => {
    root.dataset.mode = dark ? 'dark' : 'light';
    mode?.classList.toggle('is-light', !dark);
    const sun = document.getElementById('iconSun');
    const moon = document.getElementById('iconMoon');
    // toggleAttribute (not `hidden =`): the SVG hidden IDL property does not
    // reflect to the attribute in Chromium, so a baked hidden attr would stick.
    if (sun) sun.toggleAttribute('hidden', dark);
    if (moon) moon.toggleAttribute('hidden', !dark);
    localStorage.setItem('mode', root.dataset.mode);
  };
  const setLang = en => {
    root.lang = en ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-zh]').forEach(e => { e.hidden = en; });
    document.querySelectorAll('[data-en]').forEach(e => { e.hidden = !en; });
    if (lang) lang.title = en ? 'Switch to Chinese' : '切换为英文';
    const titleEl = document.querySelector('title[data-zh][data-en]');
    if (titleEl) document.title = en ? titleEl.dataset.en : titleEl.dataset.zh;
    localStorage.setItem('lang', en ? 'en' : 'zh-CN');
  };
  setMode(savedMode !== 'light');
  setLang((savedLang || 'en') === 'en');
  lang?.addEventListener('click', () => setLang(root.lang !== 'en'));
  mode?.addEventListener('click', () => setMode(root.dataset.mode !== 'dark'));
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  let last = scrollY, ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      if (nav && y <= 24) nav.classList.remove('is-hidden', 'nav-hidden');
      else if (nav && Math.abs(y - last) > 4) {
        const hidden = y > last;
        nav.classList.toggle('is-hidden', hidden);
        nav.classList.toggle('nav-hidden', hidden);
      }
      last = y;
      ticking = false;
    });
  }, { passive: true });
})();
