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

  // ── machine translation of user content ([data-translate]) ─────
  // Google Translate's free gtx endpoint. Only elements a page marks with
  // data-translate are sent — the chrome stays on hand-written data-zh/data-en
  // strings. Originals are kept in memory so switching back to English
  // restores them without a network round trip.
  const GT_URL = 'https://translate.googleapis.com/translate_a/single';
  const zhOrig = new WeakMap();  // Text node -> original text (for restore)
  const zhDone = new Map();      // source text -> translated text (session cache)
  const zhNodeMap = new Map();   // source text -> Set<Text node> awaiting result
  const zhQueue = [];
  const zhQueued = new Set();
  let zhPumping = false;
  const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','CODE','PRE','KBD','SAMP','TEXTAREA','SVG','MATH']);
  const CORE_RE = /^(\s*)([\s\S]*?)(\s*)$/;

  function* zhWalk(el) {
    const stack = [el];
    while (stack.length) {
      const n = stack.pop();
      for (const c of n.childNodes) {
        if (c.nodeType === 3) yield c;
        else if (c.nodeType === 1 && !SKIP.has(c.tagName)) stack.push(c);
      }
    }
  }

  function zhCollect(el) {
    for (const node of zhWalk(el)) {
      const m = CORE_RE.exec(node.nodeValue);
      if (!m) continue;
      const lead = m[1], core = m[2], trail = m[3];
      // Too short, or no Latin, or already Chinese-authored (mixed CJK+Latin
      // like "Qwen3.8-MAX 推出…" churns the queue for a no-op translation).
      if (core.length < 2 || !/[A-Za-z]/.test(core) || /[\u4e00-\u9fff]/.test(core)) continue;
      // Already translated (its text moved off the recorded original): skip,
      // otherwise the translated text would be re-enqueued on every re-walk.
      const orig = zhOrig.get(node);
      if (orig !== undefined && orig !== node.nodeValue) continue;
      // Collapse internal whitespace so multi-line text nodes batch cleanly.
      const norm = core.replace(/\s+/g, ' ');
      zhOrig.set(node, node.nodeValue);
      const cached = zhDone.get(norm);
      if (cached !== undefined) { node.nodeValue = lead + cached + trail; continue; }
      if (!zhQueued.has(norm)) { zhQueued.add(norm); zhQueue.push(norm); }
      let set = zhNodeMap.get(norm);
      if (!set) { set = new Set(); zhNodeMap.set(norm, set); }
      set.add(node);
    }
  }

  function translateContent() {
    for (const el of document.querySelectorAll('[data-translate]')) {
      if (el.parentElement?.closest('[data-translate]')) continue;
      zhCollect(el);
    }
    zhPump();
  }

  function restoreContent() {
    for (const el of document.querySelectorAll('[data-translate]')) {
      for (const node of zhWalk(el)) {
        const orig = zhOrig.get(node);
        if (orig !== undefined && node.nodeValue !== orig) node.nodeValue = orig;
      }
    }
  }

  const zhSleep = ms => new Promise(r => setTimeout(r, ms));
  const zhTries = new Map();  // source text -> failed attempts

  async function zhDrain() {
    while (zhQueue.length) {
      const batch = zhQueue.splice(0, 12);
      batch.forEach(t => zhQueued.delete(t));
      const ok = await zhSend(batch);
      if (!ok) {
        // gtx throttles bursts; retry the whole batch after the queue drains.
        await zhSleep(3000);
        batch.forEach(t => {
          const tries = (zhTries.get(t) || 0) + 1;
          if (tries < 4 && !zhQueued.has(t)) { zhTries.set(t, tries); zhQueued.add(t); zhQueue.push(t); }
        });
      } else {
        batch.forEach(t => zhTries.delete(t));
      }
      await zhSleep(250);
    }
  }

  async function zhPump() {
    if (zhPumping) return;
    zhPumping = true;
    try {
      await zhDrain();
      // One second chance for anything a throttling window dropped.
      if (zhNodeMap.size) {
        await zhSleep(8000);
        zhTries.clear();
        for (const t of zhNodeMap.keys()) {
          if (!zhQueued.has(t)) { zhQueued.add(t); zhQueue.push(t); }
        }
        await zhDrain();
      }
    } finally { zhPumping = false; }
  }

  async function zhSend(batch) {
    // gtx ignores extra q params — batch by joining lines into one q instead;
    // the response returns one segment per line, in order.
    const url = GT_URL + '?client=gtx&sl=auto&tl=zh-CN&dt=t&q=' + encodeURIComponent(batch.join('\n'));
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 8000);
    try {
      const r = await fetch(url, { signal: ctl.signal });
      if (!r.ok) return false;
      const data = await r.json();
      const segs = data && data[0];
      if (Array.isArray(segs)) {
        batch.forEach((core, i) => {
          const tr = segs[i] && segs[i][0];
          if (typeof tr !== 'string') return;
          zhDone.set(core, tr.replace(/\n+$/, ''));
          const nodes = zhNodeMap.get(core);
          if (!nodes) return;
          zhNodeMap.delete(core);
          for (const node of nodes) {
            if (!node.isConnected) continue;
            const m = CORE_RE.exec(node.nodeValue);
            node.nodeValue = m[1] + zhDone.get(core) + m[3];
          }
        });
      }
      return true;
    } catch (e) {
      return false;
    } finally {
      clearTimeout(t);
    }
  }

  // Pages that render content later (news feeds, view-transition swaps) opt in
  // by adding [data-translate] elements; translate those as they appear.
  new MutationObserver(records => {
    if (root.lang === 'en') return;
    for (const r of records) {
      for (const n of r.addedNodes) {
        if (n.nodeType === 1 && (n.matches?.('[data-translate]') || n.querySelector?.('[data-translate]'))) {
          translateContent();
          return;
        }
      }
    }
  }).observe(document.documentElement, { childList: true, subtree: true });

  const setLang = en => {
    root.lang = en ? 'en' : 'zh-CN';
    document.querySelectorAll('[data-zh]').forEach(e => { e.hidden = en; });
    document.querySelectorAll('[data-en]').forEach(e => { e.hidden = !en; });
    if (lang) lang.title = en ? 'Switch to Chinese' : '切换为英文';
    const titleEl = document.querySelector('title[data-zh][data-en]');
    if (titleEl) document.title = en ? titleEl.dataset.en : titleEl.dataset.zh;
    localStorage.setItem('lang', en ? 'en' : 'zh-CN');
    if (en) restoreContent(); else translateContent();
  };
  // Idempotent wiring so pages that re-apply after view-transition swaps
  // (the blog) never double-attach a click handler that cancels itself.
  const wiredLangs = new WeakSet();
  const wireLang = btn => {
    if (btn && !wiredLangs.has(btn)) {
      wiredLangs.add(btn);
      btn.addEventListener('click', () => setLang(root.lang !== 'en'));
    }
  };
  setMode(savedMode !== 'light');
  setLang((savedLang || 'en') === 'en');
  wireLang(lang);
  mode?.addEventListener('click', () => setMode(root.dataset.mode !== 'dark'));
  window.siteShell = { setLang, setMode, wireLang };
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
