/* Flagomat — guess every flag in the world. Vanilla JS, no build step. */
(() => {
  'use strict';

  // ───────────────────────── helpers ─────────────────────────
  const app = document.getElementById('app');
  const toastEl = document.getElementById('toast');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, 'and').replace(/\b(the|of|republic|and)\b/g, '').replace(/[^a-z0-9]/g, '');

  const store = {
    get(k, d) { try { const v = localStorage.getItem('flagomat:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('flagomat:' + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };
  const settings = Object.assign({ sound: true, territories: false, brainrot: true }, store.get('settings', {}));
  const stats = Object.assign({ aura: 0, games: 0, bestStreak: 0, best: {} }, store.get('stats', {}));
  const saveSettings = () => store.set('settings', settings);
  const saveStats = () => store.set('stats', stats);

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(() => toastEl.classList.remove('show'), 1800);
  }

  // ───────────────────────── sound ─────────────────────────
  let actx = null;
  function beep(kind) {
    if (!settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const notes = kind === 'good' ? [660, 880] : kind === 'win' ? [523, 659, 784, 1047] : [220, 160];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = kind === 'bad' ? 'sawtooth' : 'triangle';
        o.frequency.value = f;
        const t = actx.currentTime + i * 0.09;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
        o.connect(g).connect(actx.destination);
        o.start(t); o.stop(t + 0.2);
      });
    } catch { /* no audio */ }
    if (kind === 'bad' && navigator.vibrate) navigator.vibrate(80);
  }

  function confetti(n = 90) {
    const colors = ['#6C3BFF', '#FF4D8D', '#FFB020', '#16B26B', '#2EC5FF'];
    for (let i = 0; i < n; i++) {
      const d = document.createElement('div');
      d.className = 'confetti';
      d.style.left = Math.random() * 100 + 'vw';
      d.style.background = pick(colors);
      d.style.animationDuration = 1.8 + Math.random() * 1.6 + 's';
      d.style.animationDelay = Math.random() * 0.4 + 's';
      d.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      document.body.appendChild(d);
      setTimeout(() => d.remove(), 4200);
    }
  }

  // ───────────────────────── brainrot copy ─────────────────────────
  const W_LINES = ['W 🔥', 'Ate and left no crumbs 💅', 'Big brain energy 🧠', '+1000 aura ✨', 'Sheesh 🥶', 'Absolute cinema 🎬', 'Geography GOAT 🐐',
    'No cap, that’s right 🧢', 'You’re cooking 🍳', 'Slay 💅', 'Certified map enjoyer 🗺️', 'Rizz level: cartographer 😎', 'Built different 💪',
    'Main character moment ✨', 'That’s bussin’ 🤤', 'Locked in 🔒', 'Mewing on the globe 🤫', 'Peak geography 🏔️', 'Sigma move 🗿'];
  const L_LINES = ['L + ratio 💀', 'Skill issue 😔', 'Emotional damage 💥', 'Bro thought 😭', 'Not the vibe 🫠', '-500 aura 📉', 'Who told you that? 🤨',
    'It’s giving… wrong 💀', 'NPC behaviour 🤖', 'Google Maps is crying 😢', 'Caught in 4K 📸', 'Bro is lost 🧭', 'Only in Ohio 🌽',
    'Touch a globe, not grass 🌍', 'The flag is NOT flagging 🚩', 'Delulu is not the solulu 🫥', 'Sir, this is a Wendy’s 🍔'];
  const STREAK_LINES = { 3: '🔥 3 streak — heating up', 5: '🔥🔥 5 streak — you’re on fire', 10: '⚡ 10 streak — unstoppable sigma', 15: '🗿 15 streak — aura overload', 20: '👑 20 streak — touch grass maybe?', 30: '🌍 30 streak — you ARE the globe', 50: '🐐 50 streak — actual legend' };
  const lineFor = (ok) => settings.brainrot ? pick(ok ? W_LINES : L_LINES) : (ok ? 'Correct!' : 'Not quite');

  const RANKS = [
    [0, '🤖', 'NPC Energy', 'Bro thinks Africa is a country.'],
    [20, '💀', 'Skill Issue', 'The globe is disappointed, but believes in you.'],
    [40, '😐', 'Mid', 'Not bad, not great. Perfectly balanced.'],
    [60, '🍳', 'Lowkey Cooking', 'You know your stuff. The aura is building.'],
    [80, '✨', 'Main Character', 'Teachers fear you. Atlases respect you.'],
    [95, '🐐', 'Geography GOAT', 'Absolute cinema. Your aura is immeasurable.'],
  ];
  const rankFor = (pct) => RANKS.filter((r) => pct >= r[0]).pop();

  // ───────────────────────── data ─────────────────────────
  const ALL = window.COUNTRIES;
  const BY_CODE = Object.fromEntries(ALL.map((c) => [c.code, c]));
  const CONTINENTS = [
    ['Europe', '🏰'], ['Asia', '🏯'], ['Africa', '🦁'], ['North America', '🗽'], ['South America', '🦜'], ['Oceania', '🏝️'],
  ];
  const pool = (continent) => ALL.filter((c) => (settings.territories || c.main) && (!continent || c.continent === continent));
  const flagSrc = (code) => `flags/${code}.svg`;
  const countryFlag = (c, cls = '') => `<img class="${cls}" src="${flagSrc(c.code)}" alt="" loading="lazy" draggable="false">`;
  const itemFlag = (it, cls = '') => it.svg ? it.svg : `<img class="${cls}" src="${it.img}" alt="" loading="lazy" draggable="false">`;
  const MEME_COUNTRIES = [...new Set(window.MEMES.map((m) => m[2]))];

  // Distractors: prefer look-alike neighbours (same sub-region / continent), then random.
  function distractors(answer, candidates, n = 3, keyFns = []) {
    const out = new Set();
    for (const fn of keyFns) {
      const same = shuffle(candidates.filter((c) => c !== answer && fn(c) === fn(answer)));
      for (const c of same) { if (out.size >= Math.min(n, keyFns.indexOf(fn) + 2)) break; out.add(c); }
    }
    for (const c of shuffle(candidates)) { if (out.size >= n) break; if (c !== answer) out.add(c); }
    return [...out].slice(0, n);
  }

  // ───────────────────────── modes ─────────────────────────
  const MODES = {
    world: { icon: '🌍', title: 'World Tour', desc: 'Every country on Earth. Guess from the flag.', setup: 'length' },
    continent: { icon: '🗺️', title: 'Continents', desc: 'Master one continent at a time.', setup: 'continent' },
    reverse: { icon: '🔁', title: 'Reverse', desc: 'See the name, find the flag.', setup: 'length' },
    type: { icon: '⌨️', title: 'Type It', desc: 'No options. Pure big brain.', setup: 'length' },
    speed: { icon: '⏱️', title: 'Speedrun', desc: '60 seconds. As many as you can.' },
    survival: { icon: '❤️', title: 'Survival', desc: '3 lives. How far can you go?' },
    cities: { icon: '🏙️', title: 'City Flags', desc: 'Amsterdam, Tokyo, Chicago & more.' },
    regions: { icon: '🏴', title: 'Regions & Nations', desc: 'Scotland, Texas, Bavaria…' },
    memes: { icon: '😂', title: 'Meme Origins', desc: `${window.MEMES.length} memes. Which country made it?`, setup: 'length' },
  };

  function buildQueue(mode, opt = {}) {
    if (mode === 'memes') {
      const memes = shuffle(window.MEMES).slice(0, opt.n || 15);
      return memes.map(memeQuestion);
    }
    if (mode === 'cities' || mode === 'regions') {
      const kind = mode === 'cities' ? 'city' : 'region';
      const items = window.CITY_FLAGS.filter((c) => c.kind === kind);
      return shuffle(items).map((it) => ({
        kind: 'flag', flag: itemFlag(it), answerId: it.id,
        options: shuffle([it, ...distractors(it, items, 3, [(x) => x.country])]).map((o) => ({ id: o.id, label: o.name })),
        answerLabel: it.name, fact: it.fact, thumb: itemFlag(it),
      }));
    }
    const p = pool(opt.continent);
    let list = shuffle(p);
    if (opt.n && opt.n < list.length) list = list.slice(0, opt.n);
    return list.map((c) => countryQuestion(mode, c, opt.continent ? p : pool()));
  }

  function countryQuestion(mode, c, candidates) {
    const base = { answerId: c.code, answerLabel: c.name, fact: window.FLAG_FACTS[c.code] || (c.capital ? `Capital: ${c.capital}.` : ''), thumb: countryFlag(c), country: c };
    if (mode === 'type') return { ...base, kind: 'type', flag: countryFlag(c) };
    const opts = shuffle([c, ...distractors(c, candidates, 3, [(x) => x.sub, (x) => x.continent])]);
    if (mode === 'reverse') return { ...base, kind: 'reverse', name: c.name, options: opts.map((o) => ({ id: o.code, flag: countryFlag(o) })) };
    return { ...base, kind: 'flag', flag: countryFlag(c), options: opts.map((o) => ({ id: o.code, label: o.name })) };
  }

  function memeQuestion(m) {
    const [name, emoji, code, year, clue, reveal] = m;
    const answer = BY_CODE[code];
    const memeCands = MEME_COUNTRIES.filter((x) => x !== code).map((x) => BY_CODE[x]).filter(Boolean);
    const others = distractors(answer, memeCands, 3, [(x) => x.continent]);
    const opts = shuffle([answer, ...others]);
    return {
      kind: 'meme', meme: { name, emoji, year, clue }, answerId: code, answerLabel: answer.name, fact: reveal,
      thumb: `<span>${emoji}</span>`, reviewLabel: name,
      options: opts.map((o) => ({ id: o.code, label: o.name, mini: countryFlag(o, 'mini') })),
    };
  }

  // ───────────────────────── router ─────────────────────────
  let game = null;
  let timer = null;
  const stopTimer = () => { clearInterval(timer); timer = null; };

  function go(view, arg) {
    stopTimer();
    document.onkeydown = null;
    window.scrollTo(0, 0);
    ({ home, setup, play, results, atlas }[view])(arg);
  }
  window.addEventListener('popstate', () => go('home'));

  // ───────────────────────── home ─────────────────────────
  function home() {
    const strip = shuffle(pool()).slice(0, 9).map((c, i) => `<img src="${flagSrc(c.code)}" alt="" style="animation-delay:${i * 0.2}s">`).join('');
    const best = (id) => stats.best[id] != null ? `<span class="best">🏆 ${stats.best[id]}</span>` : '';
    const card = (id, wide) => {
      const m = MODES[id];
      return `<button class="mode${wide ? ' wide' : ''}" data-mode="${id}">${best(id)}<span class="ic">${m.icon}</span><span><b>${m.title}</b><br><small>${m.desc}</small></span></button>`;
    };
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    app.innerHTML = `
      <div class="hero">
        <h1 class="logo">Flagomat</h1>
        <p class="tagline">Every flag on Earth. Zero chill. Maximum aura.</p>
        <div class="flag-strip">${strip}</div>
      </div>
      <div class="stats-row">
        <div class="stat"><b>${stats.aura.toLocaleString()}</b><span>Aura ✨</span></div>
        <div class="stat"><b>${stats.games}</b><span>Games</span></div>
        <div class="stat"><b>${stats.bestStreak}</b><span>Best streak</span></div>
      </div>
      <div class="section-title">Flags</div>
      <div class="modes">
        ${card('world', true)}
        ${card('continent')}${card('reverse')}
        ${card('type')}${card('speed')}
        ${card('survival')}${card('cities')}
        ${card('regions')}
        <button class="mode" data-go="atlas"><span class="ic">📖</span><span><b>Flag Atlas</b><br><small>Browse & learn all ${pool().length + window.CITY_FLAGS.length} flags.</small></span></button>
      </div>
      <div class="section-title">Brainrot zone</div>
      <div class="modes">${card('memes', true)}</div>
      <div class="section-title">Settings</div>
      <div class="settings">
        ${toggle('brainrot', 'Brainrot commentary', 'Gen-Z reactions after every answer')}
        ${toggle('sound', 'Sound effects', 'Dings and sad trombones')}
        ${toggle('territories', 'Include territories', `Adds ${ALL.length - ALL.filter((c) => c.main).length} territories (Aruba, Greenland, Guam…)`)}
      </div>
      ${!standalone ? `<div class="install"><span class="ic">📲</span><span>${isIOS
        ? 'Install it like a real app: tap <b>Share</b> <span aria-hidden="true">⎋</span> then <b>Add to Home Screen</b>. Works offline!'
        : 'Install it like a real app: use your browser menu → <b>Install app</b> / <b>Add to Home screen</b>. Works offline!'}</span></div>` : ''}
      <p class="footer">${pool().length} countries · ${window.CITY_FLAGS.filter((c) => c.kind === 'city').length} cities · ${window.CITY_FLAGS.filter((c) => c.kind === 'region').length} regions · ${window.MEMES.length} memes</p>`;
    app.querySelectorAll('[data-mode]').forEach((b) => b.onclick = () => {
      const id = b.dataset.mode;
      MODES[id].setup ? go('setup', id) : start(id, {});
    });
    app.querySelector('[data-go="atlas"]').onclick = () => go('atlas');
    app.querySelectorAll('.switch').forEach((s) => s.onclick = () => {
      settings[s.dataset.key] = !settings[s.dataset.key];
      saveSettings();
      home();
    });
  }
  const toggle = (key, label, sub) =>
    `<div class="setting"><span>${label}<small>${sub}</small></span><button class="switch" role="switch" aria-label="${label}" aria-checked="${!!settings[key]}" data-key="${key}"></button></div>`;

  // ───────────────────────── setup ─────────────────────────
  function setup(mode) {
    const m = MODES[mode];
    let rows;
    if (mode === 'continent') {
      rows = CONTINENTS.map(([name, ic]) => {
        const n = pool(name).length;
        return `<button class="choice" data-c="${name}"><span class="ic">${ic}</span><span>${name}<small>${n} flags${stats.best['continent:' + name] != null ? ` · best ${stats.best['continent:' + name]}` : ''}</small></span><span class="go">›</span></button>`;
      }).join('');
    } else {
      const total = mode === 'memes' ? window.MEMES.length : pool().length;
      const lens = [[10, '⚡', 'Quick round'], [25, '🎯', 'Standard'], [total, '🏆', mode === 'memes' ? 'All the memes (good luck)' : 'Every single one']];
      rows = lens.map(([n, ic, t]) => `<button class="choice" data-n="${n}"><span class="ic">${ic}</span><span>${n} questions<small>${t}</small></span><span class="go">›</span></button>`).join('');
    }
    app.innerHTML = `
      <div class="top"><button class="icon-btn" data-back aria-label="Back">←</button><h2>${m.icon} ${m.title}</h2></div>
      <p class="tagline" style="margin:0 4px 16px">${m.desc}</p>
      <div class="choices">${rows}</div>`;
    app.querySelector('[data-back]').onclick = () => go('home');
    app.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => start('continent', { continent: b.dataset.c, n: 0 }));
    app.querySelectorAll('[data-n]').forEach((b) => b.onclick = () => start(mode, { n: +b.dataset.n }));
  }

  // ───────────────────────── game ─────────────────────────
  function start(mode, opt) {
    history.pushState({}, '');
    const endless = mode === 'speed' || mode === 'survival';
    game = {
      mode, opt, endless, queue: buildQueue(mode, endless ? {} : opt), idx: 0,
      aura: 0, correct: 0, wrong: 0, streak: 0, bestStreak: 0, lives: mode === 'survival' ? 3 : Infinity,
      missed: [], answered: false, timeLeft: mode === 'speed' ? 60 : null,
      key: mode === 'continent' ? 'continent:' + opt.continent : mode,
    };
    if (mode === 'speed') {
      const t0 = Date.now();
      timer = setInterval(() => {
        game.timeLeft = Math.max(0, 60 - (Date.now() - t0) / 1000);
        const bar = app.querySelector('.progress > div');
        if (bar) bar.style.width = (game.timeLeft / 60) * 100 + '%';
        const tl = app.querySelector('[data-time]');
        if (tl) tl.textContent = Math.ceil(game.timeLeft) + 's';
        if (game.timeLeft <= 0) finish();
      }, 100);
    }
    play();
  }

  function play() {
    const g = game;
    if (g.endless && g.idx >= g.queue.length) g.queue.push(...buildQueue(g.mode, {}));
    const q = g.queue[g.idx];
    g.answered = false;
    const m = MODES[g.mode];
    const title = g.mode === 'continent' ? g.opt.continent : m.title;
    const total = g.queue.length;
    const progress = g.mode === 'speed'
      ? `<div class="progress timer"><div style="width:${(g.timeLeft / 60) * 100}%"></div></div>`
      : g.endless ? '' : `<div class="progress"><div style="width:${(g.idx / total) * 100}%"></div></div>`;
    const left = g.mode === 'speed' ? `⏱️ <span data-time>${Math.ceil(g.timeLeft)}s</span>`
      : g.mode === 'survival' ? `<span class="lives">${'❤️'.repeat(g.lives)}${'🖤'.repeat(3 - g.lives)}</span>`
      : `${g.idx + 1} / ${total}`;

    let prompt = '', answers = '';
    if (q.kind === 'flag' || q.kind === 'type') {
      prompt = `<div class="prompt"><div class="q">${q.kind === 'type' ? 'Type the country' : g.mode === 'cities' ? 'Which city?' : g.mode === 'regions' ? 'Which region?' : 'Which country?'}</div><div class="bigflag">${q.flag}</div></div>`;
    } else if (q.kind === 'reverse') {
      prompt = `<div class="prompt"><div class="q">Find the flag of</div><div class="bigname">${esc(q.name)}</div></div>`;
    } else if (q.kind === 'meme') {
      prompt = `<div class="prompt meme-card"><div class="q">Where was this meme born?</div><div class="emoji">${q.meme.emoji}</div><div class="title">${esc(q.meme.name)}</div><span class="year">${q.meme.year}</span><p class="clue">${esc(q.meme.clue)}</p></div>`;
    }
    if (q.kind === 'type') {
      answers = `<form class="typebox" autocomplete="off"><input id="guess" type="text" inputmode="text" autocapitalize="words" autocorrect="off" spellcheck="false" placeholder="Country name…" aria-label="Country name"><button class="btn" type="submit">Go</button></form>
        <div class="hint-row"><button class="btn ghost" data-hint>💡 Hint</button><button class="btn ghost" data-skip>🏳️ Give up</button></div>`;
    } else if (q.kind === 'reverse') {
      answers = `<div class="options flags">${q.options.map((o, i) => `<button class="opt" data-id="${o.id}" aria-label="Option ${i + 1}">${o.flag}</button>`).join('')}</div>`;
    } else {
      answers = `<div class="options">${q.options.map((o, i) => `<button class="opt" data-id="${esc(o.id)}"><span class="key">${i + 1}</span>${o.mini || ''}<span>${esc(o.label)}</span></button>`).join('')}</div>`;
    }

    app.innerHTML = `
      <div class="top"><button class="icon-btn" data-quit aria-label="Quit">✕</button><h2>${m.icon} ${esc(title)}</h2><span class="pill">✨ ${g.aura}</span></div>
      ${progress}
      <div class="hud"><span>${left}</span><span class="streak">${g.streak >= 2 ? `🔥 ${g.streak}` : ''}</span></div>
      ${prompt}${answers}<div data-feedback></div>`;

    app.querySelector('[data-quit]').onclick = () => (g.correct + g.wrong > 0 ? finish() : go('home'));
    app.querySelectorAll('.opt').forEach((b) => b.onclick = () => answer(b.dataset.id, b));
    if (q.kind === 'type') {
      const input = app.querySelector('#guess');
      setTimeout(() => input.focus(), 50);
      app.querySelector('form').onsubmit = (e) => {
        e.preventDefault();
        if (g.answered) return next();
        const v = input.value.trim();
        if (!v) return;
        const ok = typedMatch(v, q.country);
        if (!ok && g.mode === 'type' && !q.tries) { q.tries = 1; input.classList.add('bad'); input.select(); toast(settings.brainrot ? 'Nah 💀 one more try' : 'Try again'); setTimeout(() => input.classList.remove('bad'), 500); return; }
        input.classList.add(ok ? 'good' : 'bad');
        answer(ok ? q.answerId : '__wrong__');
      };
      app.querySelector('[data-hint]').onclick = () => {
        const c = q.country;
        q.hinted = (q.hinted || 0) + 1;
        toast(q.hinted === 1 ? `Starts with “${c.name[0]}” · ${c.name.length} letters` : `${c.continent}${c.capital ? ` · capital: ${c.capital}` : ''}`);
        input.focus();
      };
      app.querySelector('[data-skip]').onclick = () => { if (!g.answered) { input.classList.add('bad'); answer('__wrong__'); } };
    }
    document.onkeydown = (e) => {
      if (q.kind === 'type' && !g.answered) return;
      const n = parseInt(e.key, 10);
      if (!g.answered && n >= 1 && n <= 4) { const b = app.querySelectorAll('.opt')[n - 1]; if (b) b.click(); }
      else if (g.answered && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); next(); }
    };
  }

  function typedMatch(v, c) {
    const g = norm(v);
    if (!g) return false;
    const names = [c.name, ...c.alt].map(norm).filter(Boolean);
    if (names.includes(g)) return true;
    // forgive small typos on longer names
    return names.some((n) => n.length >= 5 && lev(g, n) <= (n.length >= 9 ? 2 : 1));
  }
  function lev(a, b) {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }

  function answer(id, btn) {
    const g = game, q = g.queue[g.idx];
    if (g.answered) return;
    g.answered = true;
    const ok = id === q.answerId;
    app.querySelectorAll('.opt').forEach((b) => {
      b.disabled = true;
      if (b.dataset.id === q.answerId) b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    let streakMsg = '';
    if (ok) {
      g.correct++; g.streak++;
      g.bestStreak = Math.max(g.bestStreak, g.streak);
      const gain = 100 + Math.min(g.streak - 1, 10) * 10 - (q.hinted ? 30 * q.hinted : 0) - (q.tries ? 30 : 0);
      g.aura += Math.max(gain, 20);
      streakMsg = STREAK_LINES[g.streak] || '';
      beep('good');
    } else {
      g.wrong++; g.streak = 0;
      g.aura = Math.max(0, g.aura - 50);
      g.missed.push(q);
      if (g.mode === 'survival') g.lives--;
      beep('bad');
    }
    const pillEl = app.querySelector('.pill');
    if (pillEl) pillEl.textContent = `✨ ${g.aura}`;
    const streakEl = app.querySelector('.streak');
    if (streakEl) streakEl.textContent = g.streak >= 2 ? `🔥 ${g.streak}` : '';
    if (g.mode === 'survival') { const l = app.querySelector('.lives'); if (l) l.textContent = '❤️'.repeat(Math.max(g.lives, 0)) + '🖤'.repeat(3 - Math.max(g.lives, 0)); }
    if (streakMsg && settings.brainrot) toast(streakMsg);

    if (g.mode === 'speed') { setTimeout(next, ok ? 350 : 900); return; }

    const fb = app.querySelector('[data-feedback]');
    const last = !g.endless && g.idx + 1 >= g.queue.length;
    const dead = g.mode === 'survival' && g.lives <= 0;
    const ansText = q.kind === 'meme' ? `It’s from <b>${esc(q.answerLabel)}</b> ${countryFlag(BY_CODE[q.answerId], 'mini')}`
      : ok ? `It’s <b>${esc(q.answerLabel)}</b>.` : `It was <b>${esc(q.answerLabel)}</b>.`;
    fb.innerHTML = `<div class="feedback ${ok ? 'good' : 'bad'}">
        <div class="line">${lineFor(ok)}</div>
        <div class="ans" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">${ansText}</div>
        ${q.fact ? `<div class="fact">💡 ${esc(q.fact)}</div>` : ''}
      </div>
      <button class="btn block" data-next>${dead ? 'See results 💀' : last ? 'See results 🏁' : 'Next →'}</button>`;
    fb.querySelector('[data-next]').onclick = next;
    fb.querySelector('[data-next]').focus({ preventScroll: true });
    fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function next() {
    const g = game;
    if (!g || g.finished) return;
    if (g.mode === 'survival' && g.lives <= 0) return finish();
    g.idx++;
    if (!g.endless && g.idx >= g.queue.length) return finish();
    if (g.mode === 'speed' && g.timeLeft <= 0) return finish();
    play();
  }

  function finish() {
    stopTimer();
    const g = game;
    if (!g || g.finished) return;
    g.finished = true;
    const answered = g.correct + g.wrong;
    stats.games++;
    stats.aura += g.aura;
    stats.bestStreak = Math.max(stats.bestStreak, g.bestStreak);
    const score = g.endless ? g.correct : Math.round((g.correct / Math.max(answered, 1)) * 100);
    const full = g.endless || answered === g.queue.length; // only complete runs count as records
    const prev = stats.best[g.key] == null ? null : parseInt(stats.best[g.key], 10);
    const isBest = full && answered > 0 && (prev == null || score > prev);
    if (isBest) stats.best[g.key] = g.endless ? score : score + '%';
    saveStats();
    go('results', { isBest });
  }

  // ───────────────────────── results ─────────────────────────
  function results({ isBest }) {
    const g = game;
    const answered = g.correct + g.wrong;
    const pct = Math.round((g.correct / Math.max(answered, 1)) * 100);
    const [, emoji, title, blurb] = rankFor(g.endless ? Math.min(100, g.correct * (g.mode === 'speed' ? 4 : 5)) : pct);
    const headline = g.mode === 'speed' ? `${g.correct} flags in 60s` : g.mode === 'survival' ? `Survived ${g.correct} flags` : `${g.correct} / ${answered} correct · ${pct}%`;
    const missed = g.missed.slice(0, 30).map((q) => `<div class="review-item"><span class="thumb">${q.thumb}</span><span>${esc(q.reviewLabel || q.answerLabel)}${q.reviewLabel ? `<small>from ${esc(q.answerLabel)}</small>` : ''}</span></div>`).join('');
    app.innerHTML = `
      <div class="top"><button class="icon-btn" data-home aria-label="Home">⌂</button><h2>${MODES[g.mode].icon} Results</h2></div>
      <div class="result">
        ${isBest ? '<div class="new-best">🏆 NEW PERSONAL BEST</div>' : ''}
        <div class="rank-emoji">${emoji}</div>
        <h1>${title}</h1>
        <p class="sub">${blurb}</p>
        <div class="stats-row">
          <div class="stat"><b>${g.correct}</b><span>${g.endless ? 'Score' : 'Correct'}</span></div>
          <div class="stat"><b>+${g.aura}</b><span>Aura ✨</span></div>
          <div class="stat"><b>${g.bestStreak}</b><span>Best streak</span></div>
        </div>
        <p class="sub">${headline}</p>
        <button class="btn block" data-again>Play again 🔁</button>
        <button class="btn ghost block" data-share>Share score 📤</button>
      </div>
      ${missed ? `<div class="review"><div class="section-title">Study these 📚</div>${missed}</div>` : ''}`;
    app.querySelector('[data-home]').onclick = () => go('home');
    app.querySelector('[data-again]').onclick = () => start(g.mode, g.opt);
    app.querySelector('[data-share]').onclick = async () => {
      const text = `Flagomat ${MODES[g.mode].icon} ${MODES[g.mode].title}${g.opt.continent ? ` (${g.opt.continent})` : ''}: ${headline} — rank “${title}” ${emoji}. +${g.aura} aura ✨`;
      try {
        if (navigator.share) { await navigator.share({ text }); return; }
      } catch (e) { if (e && e.name === 'AbortError') return; }
      try { await navigator.clipboard.writeText(text); toast('Score copied 📋'); } catch { toast(text); }
    };
    if (pct >= 80 || isBest) { confetti(); beep('win'); }
  }

  // ───────────────────────── atlas ─────────────────────────
  function atlas() {
    history.pushState({}, '');
    let filter = 'All', q = '';
    const tabs = ['All', ...CONTINENTS.map((c) => c[0]), 'Cities', 'Regions'];
    app.innerHTML = `
      <div class="top"><button class="icon-btn" data-back aria-label="Back">←</button><h2>📖 Flag Atlas</h2></div>
      <input class="search" type="search" placeholder="Search a country, city or capital…" aria-label="Search">
      <div class="chips">${tabs.map((t) => `<button class="chip${t === 'All' ? ' on' : ''}" data-t="${t}">${t}</button>`).join('')}</div>
      <div class="count"></div>
      <div class="grid"></div>`;
    const grid = app.querySelector('.grid'), count = app.querySelector('.count');
    const items = () => {
      const qq = norm(q);
      let list;
      if (filter === 'Cities' || filter === 'Regions') {
        list = window.CITY_FLAGS.filter((c) => c.kind === (filter === 'Cities' ? 'city' : 'region')).map((c) => ({ title: c.name, sub: BY_CODE[c.country]?.name || '', flag: itemFlag(c), fact: c.fact }));
      } else {
        list = pool(filter === 'All' ? null : filter).map((c) => ({ title: c.name, sub: c.capital, flag: countryFlag(c), fact: window.FLAG_FACTS[c.code] || '', c }));
        if (filter === 'All') list = list.concat(window.CITY_FLAGS.map((c) => ({ title: c.name, sub: BY_CODE[c.country]?.name || '', flag: itemFlag(c), fact: c.fact })));
      }
      if (qq) list = list.filter((x) => norm(x.title).includes(qq) || norm(x.sub).includes(qq) || (x.c && x.c.alt.some((a) => norm(a).includes(qq))));
      return list;
    };
    const render = () => {
      const list = items();
      count.textContent = `${list.length} flag${list.length === 1 ? '' : 's'}`;
      grid.innerHTML = list.map((x, i) => `<button class="tile" data-i="${i}"><span class="fl">${x.flag}</span><b>${esc(x.title)}</b><small>${esc(x.sub || '')}</small></button>`).join('');
      grid.querySelectorAll('.tile').forEach((t) => t.onclick = () => detail(list[+t.dataset.i]));
    };
    const detail = (x) => {
      const bg = document.createElement('div');
      bg.className = 'modal-bg';
      const c = x.c;
      bg.innerHTML = `<div class="modal" role="dialog" aria-label="${esc(x.title)}"><div class="bigflag">${x.flag}</div><h3>${esc(x.title)}</h3>
        ${c ? `<p>🏛️ Capital: <b>${esc(c.capital || '—')}</b></p><p>🌍 ${esc(c.continent)}${c.sub ? ` · ${esc(c.sub)}` : ''}</p>${c.area > 0 ? `<p>📐 ${Math.round(c.area).toLocaleString()} km²</p>` : ''}` : `<p>📍 ${esc(x.sub)}</p>`}
        ${x.fact ? `<p style="margin-top:12px">💡 ${esc(x.fact)}</p>` : ''}
        <button class="btn block" data-close>Close</button></div>`;
      bg.onclick = (e) => { if (e.target === bg || e.target.dataset.close != null) bg.remove(); };
      document.body.appendChild(bg);
    };
    app.querySelector('[data-back]').onclick = () => go('home');
    app.querySelector('.search').oninput = (e) => { q = e.target.value; render(); };
    app.querySelectorAll('.chip').forEach((ch) => ch.onclick = () => {
      filter = ch.dataset.t;
      app.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === ch));
      render();
    });
    render();
  }

  // ───────────────────────── boot ─────────────────────────
  go('home');

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then(() => {
      // Warm the cache with every flag so the whole game works offline.
      if (store.get('warmed', 0) === 1) return;
      const urls = [...new Set([...ALL.map((c) => flagSrc(c.code)), ...window.CITY_FLAGS.filter((c) => c.img).map((c) => c.img)])];
      const idle = window.requestIdleCallback || ((f) => setTimeout(f, 2500));
      idle(() => caches.open('flagomat-flags-v1').then((c) => c.addAll(urls)).then(() => store.set('warmed', 1)).catch(() => {}));
    }).catch(() => {});
  }
})();
