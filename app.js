/* HypeReps — free calisthenics progress tracker.
   Plain JS, no build step. All data in localStorage (key: hypereps.v1). */
'use strict';

const KEY = 'hypereps.v1';
const SETS = 3;

/* ---------- Exercise ladders ----------
   Each level: n = name, r = [min, max] target range, u = 'r' (reps) or 's' (seconds), c = coaching cue.
   Progression: hit the target on every set -> target goes up one step.
   Hit the top of the range -> next level, target resets to that level's min.
   Miss 3 sessions in a row -> target resets to min (or drop a level if already at min). */
const LADDERS = {
  squat: { name: 'Squat', levels: [
    { n: 'Sit-to-stand (chair)', r: [8, 15], u: 'r', c: 'Sit back to a chair, stand up tall without using hands.' },
    { n: 'Bodyweight squat', r: [8, 15], u: 'r', c: 'Feet shoulder width, hips below knees, chest up.' },
    { n: 'Split squat (each leg)', r: [8, 12], u: 'r', c: 'Long stance, back knee drops to just above the floor.' },
    { n: 'Bulgarian split squat (each leg)', r: [6, 12], u: 'r', c: 'Back foot on a chair or sofa. Slow down, drive up.' },
    { n: 'Assisted shrimp squat (each leg)', r: [5, 10], u: 'r', c: 'Hold a door frame, hold back foot, knee taps the floor.' },
    { n: 'Shrimp squat (each leg)', r: [5, 8], u: 'r', c: 'No hands. Back knee kisses the floor, stand tall.' },
    { n: 'Assisted pistol squat (each leg)', r: [5, 8], u: 'r', c: 'Hold a door frame, other leg straight out front.' },
    { n: 'Pistol squat (each leg)', r: [3, 8], u: 'r', c: 'Full one-leg squat, arms forward for balance. Beast mode.' }
  ]},
  push: { name: 'Push-up', levels: [
    { n: 'Wall push-up', r: [8, 15], u: 'r', c: 'Hands on a wall, body straight, chest to wall.' },
    { n: 'Incline push-up', r: [8, 15], u: 'r', c: 'Hands on a table or bench edge, body like a plank.' },
    { n: 'Knee push-up', r: [8, 15], u: 'r', c: 'Knees down, hips in line, chest to the floor.' },
    { n: 'Push-up', r: [5, 12], u: 'r', c: 'Full plank, elbows about 45°, chest touches down.' },
    { n: 'Diamond push-up', r: [5, 10], u: 'r', c: 'Hands together under chest, elbows tight.' },
    { n: 'Decline push-up', r: [5, 10], u: 'r', c: 'Feet on a chair, hands on the floor.' },
    { n: 'Archer push-up (each side)', r: [3, 8], u: 'r', c: 'Wide hands, shift onto one arm, other arm straight.' },
    { n: 'One-arm push-up', r: [1, 5], u: 'r', c: 'Wide feet, one hand under chest. Legendary.' }
  ]},
  row: { name: 'Row', levels: [
    { n: 'Towel door row', r: [8, 15], u: 'r', c: 'Towel round a solid door handle, lean back, pull chest in.' },
    { n: 'High table row', r: [8, 15], u: 'r', c: 'Under a sturdy table, knees bent, pull chest to the edge.' },
    { n: 'Inverted row', r: [5, 12], u: 'r', c: 'Body straight, heels down, squeeze shoulder blades.' },
    { n: 'Feet-raised row', r: [5, 10], u: 'r', c: 'Feet on a chair, body straight, pull hard.' },
    { n: 'Archer row (each side)', r: [3, 8], u: 'r', c: 'Pull to one hand, other arm stays straight.' }
  ]},
  pullup: { name: 'Pull-up', levels: [
    { n: 'Dead hang', r: [10, 40], u: 's', c: 'Hang from the bar, shoulders active, breathe.' },
    { n: 'Scapular pull-up', r: [6, 12], u: 'r', c: 'Straight arms, pull shoulders down, lift body slightly.' },
    { n: 'Negative pull-up', r: [3, 6], u: 'r', c: 'Jump or step to the top, lower for 5 slow seconds.' },
    { n: 'Pull-up', r: [1, 8], u: 'r', c: 'Dead hang to chin over bar. No kipping.' },
    { n: 'Archer pull-up (each side)', r: [2, 6], u: 'r', c: 'Pull towards one hand, other arm extends.' }
  ]},
  pike: { name: 'Shoulder press', levels: [
    { n: 'Incline pike push-up', r: [6, 12], u: 'r', c: 'Hands on a bench, hips high, head towards the edge.' },
    { n: 'Pike push-up', r: [5, 12], u: 'r', c: 'Hips high like an upside-down V, head between hands.' },
    { n: 'Elevated pike push-up', r: [5, 10], u: 'r', c: 'Feet on a chair, hips stacked over shoulders.' },
    { n: 'Wall handstand hold', r: [15, 45], u: 's', c: 'Walk feet up the wall, arms locked, belly tight.' },
    { n: 'Handstand push-up negative', r: [2, 6], u: 'r', c: 'From wall handstand, lower head to a cushion slowly.' },
    { n: 'Wall handstand push-up', r: [1, 6], u: 'r', c: 'Full press against the wall. Absolute unit.' }
  ]},
  hinge: { name: 'Hinge', levels: [
    { n: 'Glute bridge', r: [10, 20], u: 'r', c: 'Feet flat, drive hips up, squeeze glutes at top.' },
    { n: 'Single-leg glute bridge (each leg)', r: [8, 15], u: 'r', c: 'One foot down, hips level, pause at top.' },
    { n: 'Single-leg hip thrust (each leg)', r: [8, 15], u: 'r', c: 'Shoulders on a sofa, one leg drives hips up.' },
    { n: 'Nordic curl negative', r: [3, 6], u: 'r', c: 'Feet anchored, lower forwards as slowly as you can.' },
    { n: 'Nordic curl', r: [2, 6], u: 'r', c: 'Lower and pull yourself back up with hamstrings.' }
  ]},
  core: { name: 'Core', levels: [
    { n: 'Knee plank', r: [20, 60], u: 's', c: 'Forearms and knees, straight line head to knees.' },
    { n: 'Plank', r: [20, 60], u: 's', c: 'Forearms and toes, squeeze glutes, no sagging.' },
    { n: 'Tuck hollow hold', r: [15, 45], u: 's', c: 'Lower back pressed down, knees tucked, shoulders up.' },
    { n: 'Hollow body hold', r: [15, 45], u: 's', c: 'Arms and legs long, lower back glued to the floor.' },
    { n: 'Tuck L-sit', r: [10, 30], u: 's', c: 'Hands on chairs or floor, lift knees to chest.' },
    { n: 'L-sit', r: [5, 20], u: 's', c: 'Legs straight out, hips off the floor. Elite.' }
  ]}
};
const ORDER = ['squat', 'push', 'row', 'pike', 'pullup', 'hinge', 'core'];

function program(s, wk) {
  if (wk === 'A') return ['squat', 'push', 'row', 'core'];
  return ['squat', 'pike', s.hasBar ? 'pullup' : 'row', 'hinge'];
}

/* ---------- Hype coach ---------- */
const HYPE = {
  hit: ['Clean set! 💪', 'Yes! That\'s how it\'s done!', 'Smashed it! 🔥', 'Strong! Keep rolling!', 'Textbook rep work!',
    'Look at you go! 🚀', 'That set had attitude!', 'Easy work! (It wasn\'t. Respect.)', 'Boom! Next one!', 'You\'re on fire! 🔥',
    'Pure power! ⚡', 'Gravity is losing! 🙌', 'Machine mode! 🤖', 'Absolute scenes!', 'Nailed it! 🎯'],
  miss: ['Every rep counts. Proud of that effort!', 'Close! That\'s strength being built.', 'Tough set — you showed up. 👊',
    'Reps in the bank. Next time it moves!', 'That\'s the edge of your strength. That\'s where growth lives.', 'No quitting. Love it. 💥'],
  exercise: ['Exercise done! ✅', 'That\'s one ticked off! 🎉', 'Crushed that block!', 'Done and dusted! 🧹'],
  up: ['Target up next time! 📈', 'Leveling closer... 👀', 'More reps unlocked next session!'],
  level: ['LEVEL UP! 🆙', 'NEW LEVEL UNLOCKED! 🔓', 'YOU EVOLVED! 🦍', 'NEXT RUNG! 🪜'],
  session: ['Session complete — absolute legend! 🏆', 'Workout done! You\'re stronger than this morning. 💪',
    'That\'s a wrap! Go get some food, champ. 🍗', 'Done! Future you says thanks. 🙏', 'Session smashed! See you next time. 🔥'],
  start: ['Let\'s gooo! 🚀', 'Time to get strong! 💪', 'Warm up, then let\'s cook! 🔥', 'Your body vs gravity. Round on! 🥊']
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];

/* ---------- Badges ---------- */
const BADGES = [
  { id: 'first', n: '🎉 First session', test: (s) => s.log.length >= 1 },
  { id: 's10', n: '🔟 10 sessions', test: (s) => s.log.length >= 10 },
  { id: 's25', n: '🥉 25 sessions', test: (s) => s.log.length >= 25 },
  { id: 's50', n: '🥈 50 sessions', test: (s) => s.log.length >= 50 },
  { id: 's100', n: '🥇 100 sessions', test: (s) => s.log.length >= 100 },
  { id: 'lvl1', n: '🆙 First level-up', test: (s) => countLevelUps(s) >= 1 },
  { id: 'lvl10', n: '🪜 10 level-ups', test: (s) => countLevelUps(s) >= 10 },
  { id: 'week3', n: '📅 3 sessions in 7 days', test: (s) => sessionsInLast(s, 7) >= 3 },
  { id: 'pushup', n: '💪 First full push-up', test: (s) => everDid(s, 'push', 3) },
  { id: 'pullup', n: '🧗 First pull-up', test: (s) => everDid(s, 'pullup', 3) },
  { id: 'pistol', n: '🦵 First pistol squat', test: (s) => everDid(s, 'squat', 7) },
  { id: 'onearm', n: '☝️ One-arm push-up', test: (s) => everDid(s, 'push', 7) },
  { id: 'hspu', n: '🤸 Handstand push-up', test: (s) => everDid(s, 'pike', 5) },
  { id: 'lsit', n: '🪑 L-sit', test: (s) => everDid(s, 'core', 5) }
];
function countLevelUps(s) { return s.log.reduce((n, l) => n + l.items.filter((i) => i.result === 'level').length, 0); }
function sessionsInLast(s, days) { const t = Date.now() - days * 864e5; return s.log.filter((l) => new Date(l.date).getTime() >= t).length; }
function everDid(s, id, lvl) { return s.log.some((l) => l.items.some((i) => i.id === id && i.lvl >= lvl && i.sets.some((x) => x > 0))); }

/* ---------- State ---------- */
function defaults() {
  const ex = {};
  ORDER.forEach((id) => { ex[id] = { lvl: 0, target: LADDERS[id].levels[0].r[0], fails: 0 }; });
  return { v: 1, onboarded: false, hasBar: true, rest: 90, sound: true, next: 'A', ex, log: [], badges: {}, current: null };
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaults();
    return sanitize(JSON.parse(raw));
  } catch (e) { return defaults(); }
}
function sanitize(d) {
  const s = defaults();
  if (!d || typeof d !== 'object') return s;
  s.onboarded = !!d.onboarded;
  s.hasBar = d.hasBar !== false;
  s.rest = clampInt(d.rest, 0, 600, 90);
  s.sound = d.sound !== false;
  s.next = d.next === 'B' ? 'B' : 'A';
  ORDER.forEach((id) => {
    const e = d.ex && d.ex[id];
    if (!e) return;
    const L = LADDERS[id].levels;
    const lvl = clampInt(e.lvl, 0, L.length - 1, 0);
    const [mn, mx] = L[lvl].r;
    s.ex[id] = { lvl, target: clampInt(e.target, mn, mx, mn), fails: clampInt(e.fails, 0, 2, 0) };
  });
  if (Array.isArray(d.log)) {
    s.log = d.log.filter((l) => l && Array.isArray(l.items) && !isNaN(new Date(l.date))).map((l) => ({
      date: new Date(l.date).toISOString(),
      wk: l.wk === 'B' ? 'B' : 'A',
      items: l.items.filter((i) => LADDERS[i.id]).map((i) => ({
        id: i.id,
        lvl: clampInt(i.lvl, 0, LADDERS[i.id].levels.length - 1, 0),
        target: clampInt(i.target, 0, 999, 0),
        sets: (Array.isArray(i.sets) ? i.sets : []).slice(0, SETS).map((x) => (x == null ? null : clampInt(x, 0, 999, 0))),
        result: ['up', 'level', 'top', 'fail', 'reset', 'down', 'skip'].includes(i.result) ? i.result : 'skip'
      }))
    }));
  }
  if (d.badges && typeof d.badges === 'object') {
    BADGES.forEach((b) => { if (d.badges[b.id]) s.badges[b.id] = String(d.badges[b.id]).slice(0, 30); });
  }
  if (d.current && Array.isArray(d.current.items)) {
    s.current = {
      wk: d.current.wk === 'B' ? 'B' : 'A',
      started: String(d.current.started || new Date().toISOString()),
      items: d.current.items.filter((i) => LADDERS[i.id]).map((i) => ({
        id: i.id,
        sets: (Array.isArray(i.sets) ? i.sets : []).slice(0, SETS).map((x) => (x == null ? null : clampInt(x, 0, 999, 0)))
      }))
    };
  }
  return s;
}
function clampInt(v, mn, mx, dflt) { const n = parseInt(v, 10); return isNaN(n) ? dflt : Math.min(mx, Math.max(mn, n)); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { hype('Could not save — storage full or blocked.'); } }

let S = load();

/* ---------- Progression (pure) ---------- */
function stepOf(level) { return level.u === 's' ? 5 : 1; }
function progress(exState, id, sets) {
  const L = LADDERS[id].levels;
  const e = { ...exState };
  const lv = L[e.lvl];
  const [mn, mx] = lv.r;
  const step = stepOf(lv);
  if (sets.every((x) => x == null)) return { e, result: 'skip' };
  const success = sets.every((x) => x != null && x >= e.target);
  if (success) {
    e.fails = 0;
    if (e.target >= mx) {
      if (e.lvl < L.length - 1) { e.lvl += 1; e.target = L[e.lvl].r[0]; return { e, result: 'level' }; }
      return { e, result: 'top' };
    }
    e.target = Math.min(mx, e.target + step);
    return { e, result: 'up' };
  }
  e.fails += 1;
  if (e.fails < 3) return { e, result: 'fail' };
  e.fails = 0;
  if (e.target > mn) { e.target = mn; return { e, result: 'reset' }; }
  if (e.lvl > 0) {
    e.lvl -= 1;
    const p = L[e.lvl];
    e.target = Math.max(p.r[0], p.r[1] - 2 * stepOf(p));
    return { e, result: 'down' };
  }
  return { e, result: 'fail' };
}

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const main = () => $('#main');
function esc(t) { return String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function unitLabel(u, n) { return u === 's' ? n + 's' : n + (n === 1 ? ' rep' : ' reps'); }
function lvlOf(id, lvl) { return LADDERS[id].levels[lvl]; }
function fmtDate(iso) { return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
function fraction(id, e) {
  const L = LADDERS[id].levels; const [mn, mx] = L[e.lvl].r;
  return (e.lvl + (mx > mn ? (e.target - mn) / (mx - mn) : 1)) / L.length;
}

let hypeTimer;
function hype(msg) {
  const h = $('#hype');
  h.textContent = msg;
  h.classList.add('show');
  clearTimeout(hypeTimer);
  hypeTimer = setTimeout(() => h.classList.remove('show'), 2200);
}
function confetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = document.createElement('div');
  c.className = 'confetti';
  c.setAttribute('aria-hidden', 'true');
  const cols = ['#ff4d8d', '#ffb020', '#7dff8a', '#6ec8ff', '#ffffff'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = cols[i % cols.length];
    p.style.animationDelay = Math.random() * 0.6 + 's';
    c.appendChild(p);
  }
  document.body.appendChild(c);
  setTimeout(() => c.remove(), 2800);
}
let audioCtx;
function beep() {
  if (!S.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.18].forEach((t) => {
      const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.2, audioCtx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.15);
      o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.16);
    });
  } catch (e) {}
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

/* ---------- Rest timer ---------- */
let restLeft = 0, restInt = null;
function startRest() {
  if (!S.rest) return;
  restLeft = S.rest;
  clearInterval(restInt);
  const t = $('#timer');
  t.hidden = false;
  drawRest();
  restInt = setInterval(() => {
    restLeft -= 1;
    if (restLeft <= 0) { stopRest(); beep(); hype('Rest over — next set! 🔔'); return; }
    drawRest();
  }, 1000);
}
function drawRest() {
  const m = Math.floor(restLeft / 60), s = String(restLeft % 60).padStart(2, '0');
  $('#timer').innerHTML = `<span aria-live="off">Rest ${m}:${s}</span><button type="button" id="restAdd">+30s</button><button type="button" id="restSkip">Skip</button>`;
  $('#restAdd').onclick = () => { restLeft += 30; drawRest(); };
  $('#restSkip').onclick = stopRest;
}
function stopRest() { clearInterval(restInt); restInt = null; $('#timer').hidden = true; }

/* ---------- Modal ---------- */
let lastFocus = null;
function openModal(html, onClose) {
  const m = $('#modal');
  lastFocus = document.activeElement;
  m.innerHTML = `<div class="box">${html}</div>`;
  m.hidden = false;
  const close = () => { m.hidden = true; m.innerHTML = ''; if (onClose) onClose(); if (lastFocus) lastFocus.focus(); };
  m.querySelectorAll('[data-close]').forEach((b) => (b.onclick = close));
  m.onkeydown = (e) => { if (e.key === 'Escape') close(); };
  const f = m.querySelector('button, [href], input, select');
  if (f) f.focus();
  return close;
}

/* ---------- Navigation ---------- */
let view = 'today';
function go(v) {
  view = v;
  document.querySelectorAll('.nav').forEach((b) => {
    if (b.dataset.view === v) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  render();
  main().focus({ preventScroll: true });
  window.scrollTo(0, 0);
}
document.querySelectorAll('.nav').forEach((b) => (b.onclick = () => go(b.dataset.view)));

function render() {
  if (!S.onboarded) return renderOnboarding();
  if (view === 'progress') return renderProgress();
  if (view === 'history') return renderHistory();
  if (view === 'settings') return renderSettings();
  return S.current ? renderSession() : renderToday();
}

/* ---------- Onboarding ---------- */
const HEALTH_Q = [
  'Has a doctor ever said you have a heart condition or high blood pressure?',
  'Do you get chest pain at rest, during daily activity or when exercising?',
  'Do you lose balance from dizziness, or have you lost consciousness in the last 12 months?',
  'Do you have a bone, joint or soft-tissue problem that could be made worse by exercise?',
  'Are you currently taking medication for a heart condition or blood pressure?',
  'Are you pregnant, or have you given birth in the last 6 months?',
  'Is there any other reason you should not exercise without medical advice?'
];
let ob = { step: 0 };
function renderOnboarding() {
  const m = main();
  if (ob.step === 0) {
    m.innerHTML = `
      <section class="card hero">
        <h1>Welcome to HypeReps 🚀</h1>
        <p>Your free bodyweight coach. Start where you are, level up one rung at a time, and get hyped after every set.</p>
        <ul>
          <li>No equipment needed to start (a pull-up bar unlocks more)</li>
          <li>3 sessions a week, about 30–40 minutes</li>
          <li>No account. Your data stays on this device.</li>
        </ul>
      </section>
      <form class="card" id="health">
        <h2>Quick health check</h2>
        <p class="muted small">Your answers are not saved or sent anywhere.</p>
        ${HEALTH_Q.map((q, i) => `
          <fieldset><legend>${esc(q)}</legend>
            <label class="opt"><input type="radio" name="q${i}" value="no" required> No</label>
            <label class="opt"><input type="radio" name="q${i}" value="yes"> Yes</label>
          </fieldset>`).join('')}
        <button class="btn big" type="submit">Next</button>
      </form>`;
    $('#health').onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const anyYes = HEALTH_Q.some((_, i) => fd.get('q' + i) === 'yes');
      if (anyYes) {
        openModal(`
          <div class="boom" aria-hidden="true">🩺</div>
          <h2 id="modalTitle">Please check with your GP first</h2>
          <p>You answered yes to at least one question. Speak to your GP or a qualified health professional before starting a new exercise programme.</p>
          <p class="small muted">HypeReps gives general fitness information, not medical advice.</p>
          <button class="btn ghost" data-close type="button">Go back</button>
          <button class="btn" id="ack" type="button">I've had medical clearance</button>`);
        $('#ack').onclick = () => { $('#modal').hidden = true; ob.step = 1; renderOnboarding(); };
      } else { ob.step = 1; renderOnboarding(); }
    };
    return;
  }
  if (ob.step === 1) {
    m.innerHTML = `
      <form class="card" id="test">
        <h1>Find your starting level 🎯</h1>
        <p class="muted">Be honest — starting a bit easy is how you win long term.</p>
        <fieldset><legend>Do you have a pull-up bar (or somewhere safe to hang)?</legend>
          <label class="opt"><input type="radio" name="bar" value="yes" required> Yes</label>
          <label class="opt"><input type="radio" name="bar" value="no"> No — I'll do rows instead</label>
        </fieldset>
        <fieldset><legend>Push-ups: how many full push-ups can you do in a row?</legend>
          <label class="opt"><input type="radio" name="push" value="0,8" required> Not yet — wall push-ups to start</label>
          <label class="opt"><input type="radio" name="push" value="2,8"> I can do knee push-ups</label>
          <label class="opt"><input type="radio" name="push" value="3,5"> 1–5</label>
          <label class="opt"><input type="radio" name="push" value="3,8"> 6–15</label>
          <label class="opt"><input type="radio" name="push" value="4,5"> 16 or more</label>
        </fieldset>
        <fieldset><legend>Squats: how many bodyweight squats in a row?</legend>
          <label class="opt"><input type="radio" name="squat" value="0,8" required> Getting up from a chair is hard</label>
          <label class="opt"><input type="radio" name="squat" value="1,8"> Under 10</label>
          <label class="opt"><input type="radio" name="squat" value="2,8"> 10–25</label>
          <label class="opt"><input type="radio" name="squat" value="3,6"> More than 25</label>
        </fieldset>
        <fieldset id="pullField"><legend>Pull-ups: what can you do on the bar?</legend>
          <label class="opt"><input type="radio" name="pull" value="0,10"> I can't hang for 10 seconds yet</label>
          <label class="opt"><input type="radio" name="pull" value="1,6"> I can hang, but no pull-ups</label>
          <label class="opt"><input type="radio" name="pull" value="3,1"> 1–4 pull-ups</label>
          <label class="opt"><input type="radio" name="pull" value="3,5"> 5 or more</label>
        </fieldset>
        <button class="btn big" type="submit">Build my plan</button>
      </form>`;
    const f = $('#test');
    const sync = () => {
      const noBar = f.bar.value === 'no';
      $('#pullField').hidden = noBar;
      f.querySelectorAll('input[name="pull"]').forEach((r) => (r.required = !noBar));
    };
    f.querySelectorAll('input[name="bar"]').forEach((r) => (r.onchange = sync));
    f.onsubmit = (e) => {
      e.preventDefault();
      const s = defaults();
      // keep history, badges and preferences if retaking the test
      s.log = S.log; s.badges = S.badges; s.rest = S.rest; s.sound = S.sound;
      s.onboarded = true;
      s.hasBar = f.bar.value === 'yes';
      const set = (id, v) => {
        const [l, t] = v.split(',').map(Number);
        const r = LADDERS[id].levels[l].r;
        s.ex[id] = { lvl: l, target: Math.min(r[1], Math.max(r[0], t)), fails: 0 };
      };
      set('push', f.push.value);
      set('squat', f.squat.value);
      const pushL = s.ex.push.lvl;
      if (s.hasBar) {
        set('pullup', f.pull.value);
        set('row', s.ex.pullup.lvl >= 3 ? '2,5' : '1,8');
      } else {
        set('row', pushL >= 3 ? '1,8' : '0,8');
      }
      set('pike', pushL >= 4 ? '1,5' : '0,6');
      set('core', pushL >= 3 ? '1,20' : '0,20');
      set('hinge', '0,10');
      S = s;
      save();
      ob.step = 2;
      renderOnboarding();
    };
    return;
  }
  // step 2: summary
  m.innerHTML = `
    <section class="card hero">
      <h1>Your plan is ready! 🔥</h1>
      <p>Workouts alternate <b>A</b> and <b>B</b>. Aim for 3 a week with a rest day between.</p>
    </section>
    <section class="card">
      <h2>Your starting rungs</h2>
      <table><tbody>
        ${ORDER.filter((id) => id !== 'pullup' || S.hasBar).map((id) => {
          const e = S.ex[id]; const l = lvlOf(id, e.lvl);
          return `<tr><th scope="row">${esc(LADDERS[id].name)}</th><td>${esc(l.n)}<br><span class="muted small">${SETS} × ${unitLabel(l.u, e.target)}</span></td></tr>`;
        }).join('')}
      </tbody></table>
      <h2>How you level up</h2>
      <ol>
        <li>Hit your target on all ${SETS} sets → next time the target goes up.</li>
        <li>Reach the top of the range → <b>LEVEL UP</b> to a harder exercise.</li>
        <li>Miss 3 sessions in a row → we ease the target back so you can build again.</li>
      </ol>
      <p class="muted small">Always warm up for 5 minutes first. Stop if you feel pain (not effort — pain).</p>
      <button class="btn big" id="go">Let's go!</button>
    </section>`;
  $('#go').onclick = () => { ob.step = 0; go('today'); hype(pick(HYPE.start)); };
}

/* ---------- Today ---------- */
function renderToday() {
  const ids = program(S, S.next);
  const last = S.log[S.log.length - 1];
  main().innerHTML = `
    <section class="card hero">
      <div class="row"><span class="pill hot">Workout ${S.next}</span><span class="muted small">${S.log.length} sessions done</span></div>
      <h1>${S.log.length ? pick(['Ready to level up?', 'Back for more? Love it.', 'Let\'s get stronger today.']) : 'Your first session awaits!'}</h1>
      ${last ? `<p class="muted small">Last session: ${esc(fmtDate(last.date))}</p>` : ''}
    </section>
    ${ids.map((id) => {
      const e = S.ex[id]; const l = lvlOf(id, e.lvl);
      return `<div class="card ex"><div class="row"><h3>${esc(l.n)}</h3><span class="pill">${SETS} × ${unitLabel(l.u, e.target)}</span></div>
        <div class="lvl">${esc(LADDERS[id].name)} · level ${e.lvl + 1} of ${LADDERS[id].levels.length}</div></div>`;
    }).join('')}
    <button class="btn big" id="start">Start workout ${S.next}</button>
    <p class="center muted small" style="text-align:center"><button class="linkbtn" id="swap">Do workout ${S.next === 'A' ? 'B' : 'A'} instead</button></p>`;
  $('#start').onclick = () => {
    S.current = { wk: S.next, started: new Date().toISOString(), items: ids.map((id) => ({ id, sets: Array(SETS).fill(null) })) };
    save();
    hype(pick(HYPE.start));
    window.hypeTrack && window.hypeTrack('workout_start', { workout: S.next });
    render();
  };
  $('#swap').onclick = () => { S.next = S.next === 'A' ? 'B' : 'A'; save(); render(); };
}

/* ---------- Session ---------- */
function renderSession() {
  const c = S.current;
  main().innerHTML = `
    <section class="card hero"><div class="row"><span class="pill hot">Workout ${c.wk}</span>
      <button class="linkbtn" id="cancel">Cancel workout</button></div>
      <h1>Tap a circle when a set's done</h1>
      <p class="muted small">Tap again to lower the count if you fell short. Rest timer starts automatically.</p>
    </section>
    <div id="items"></div>
    <button class="btn big" id="finish">Finish workout 🏁</button>`;
  drawItems();
  $('#finish').onclick = finishSession;
  $('#cancel').onclick = () => {
    const close = openModal(`<h2 id="modalTitle">Cancel this workout?</h2><p>Nothing from this session will be saved.</p>
      <button class="btn ghost" data-close type="button">Keep going</button> <button class="btn danger" id="yesCancel" type="button">Cancel it</button>`);
    $('#yesCancel').onclick = () => { S.current = null; save(); stopRest(); close(); render(); };
  };
}
function drawItems() {
  const c = S.current;
  $('#items').innerHTML = c.items.map((it, idx) => {
    const e = S.ex[it.id]; const l = lvlOf(it.id, e.lvl);
    const done = it.sets.every((x) => x != null);
    return `<div class="card ex ${done ? 'done' : ''}">
      <div class="row"><h3>${esc(l.n)}</h3><span class="pill ${done ? 'lime' : ''}">${SETS} × ${unitLabel(l.u, e.target)}</span></div>
      <p class="cue">${esc(l.c)}</p>
      <div class="sets" role="group" aria-label="${esc(l.n)} sets">
        ${it.sets.map((x, si) => {
          const cls = x == null ? '' : x >= e.target ? 'hit' : 'miss';
          const label = x == null ? `Set ${si + 1}, not done. Tap to log ${unitLabel(l.u, e.target)}` : `Set ${si + 1}: ${unitLabel(l.u, x)}. Tap to lower`;
          return `<button type="button" class="set ${cls}" data-i="${idx}" data-s="${si}" aria-label="${esc(label)}">${x == null ? '–' : x}<small>${x == null ? 'set ' + (si + 1) : l.u === 's' ? 'sec' : 'reps'}</small></button>`;
        }).join('')}
      </div>
      <div class="tools">
        ${l.u === 's' ? `<button type="button" data-hold="${idx}">⏱ Time a hold</button>` : ''}
        <button type="button" data-reset="${idx}">Clear sets</button>
      </div>
    </div>`;
  }).join('');
  $('#items').querySelectorAll('.set').forEach((b) => (b.onclick = () => tapSet(+b.dataset.i, +b.dataset.s)));
  $('#items').querySelectorAll('[data-reset]').forEach((b) => (b.onclick = () => {
    S.current.items[+b.dataset.reset].sets = Array(SETS).fill(null); save(); drawItems();
  }));
  $('#items').querySelectorAll('[data-hold]').forEach((b) => (b.onclick = () => holdTimer(+b.dataset.hold)));
}
function tapSet(i, si) {
  const it = S.current.items[i];
  const e = S.ex[it.id]; const l = lvlOf(it.id, e.lvl); const step = stepOf(l);
  const prev = it.sets[si];
  let next;
  if (prev == null) next = e.target;
  else if (prev <= 0) next = null;
  else next = Math.max(0, prev - step);
  it.sets[si] = next;
  save();
  drawItems();
  // keep focus on the same circle for keyboard users
  const btn = $(`#items .set[data-i="${i}"][data-s="${si}"]`); if (btn) btn.focus();
  if (prev == null) {
    const allDone = it.sets.every((x) => x != null);
    if (allDone) hype(pick(HYPE.exercise) + (it.sets.every((x) => x >= e.target) ? ' ' + pick(HYPE.up) : ''));
    else hype(pick(HYPE.hit));
    if (!allDone || i < S.current.items.length - 1) startRest();
  } else if (next != null && prev >= e.target && next < e.target) {
    hype(pick(HYPE.miss));
  }
}
function holdTimer(i) {
  const it = S.current.items[i];
  const si = it.sets.findIndex((x) => x == null);
  if (si < 0) { hype('All sets logged — clear them to redo.'); return; }
  stopRest();
  let secs = 0, run = null;
  const close = openModal(`
    <h2 id="modalTitle">Hold timer — set ${si + 1}</h2>
    <div class="boom" id="holdSecs" aria-live="off">0s</div>
    <p class="muted">Target: ${S.ex[it.id].target}s</p>
    <button class="btn" id="holdGo" type="button">Start</button>
    <button class="btn ghost" data-close type="button">Cancel</button>`, () => clearInterval(run));
  $('#holdGo').onclick = () => {
    if (run) {
      clearInterval(run); run = null;
      close();
      it.sets[si] = secs;
      save(); drawItems();
      hype(secs >= S.ex[it.id].target ? pick(HYPE.hit) : pick(HYPE.miss));
      if (it.sets.some((x) => x == null)) startRest();
      return;
    }
    $('#holdGo').textContent = 'Stop';
    run = setInterval(() => {
      secs += 1;
      $('#holdSecs').textContent = secs + 's';
      if (secs === S.ex[it.id].target) { beep(); $('#holdSecs').textContent = secs + 's 🎯'; }
    }, 1000);
  };
}
function finishSession() {
  const c = S.current;
  const logged = c.items.some((it) => it.sets.some((x) => x != null));
  if (!logged) { hype('Log at least one set first! 💪'); return; }
  stopRest();
  const entry = { date: new Date().toISOString(), wk: c.wk, items: [] };
  const lines = [];
  c.items.forEach((it) => {
    const before = S.ex[it.id];
    const { e, result } = progress(before, it.id, it.sets);
    entry.items.push({ id: it.id, lvl: before.lvl, target: before.target, sets: it.sets.slice(), result });
    S.ex[it.id] = e;
    const lb = lvlOf(it.id, before.lvl), la = lvlOf(it.id, e.lvl);
    if (result === 'level') lines.push(`<li><b>${pick(HYPE.level)}</b> ${esc(lb.n)} → <b>${esc(la.n)}</b></li>`);
    else if (result === 'up') lines.push(`<li>📈 ${esc(la.n)}: next time ${SETS} × ${unitLabel(la.u, e.target)}</li>`);
    else if (result === 'top') lines.push(`<li>👑 ${esc(la.n)}: top of the ladder! Keep owning it.</li>`);
    else if (result === 'fail') lines.push(`<li>💪 ${esc(la.n)}: same target next time — you've got this.</li>`);
    else if (result === 'reset') lines.push(`<li>🔄 ${esc(la.n)}: target eased to ${unitLabel(la.u, e.target)} to rebuild momentum.</li>`);
    else if (result === 'down') lines.push(`<li>🔄 Back to ${esc(la.n)} for a bit — stepping back to leap forward.</li>`);
  });
  S.log.push(entry);
  S.next = c.wk === 'A' ? 'B' : 'A';
  S.current = null;
  const newBadges = BADGES.filter((b) => !S.badges[b.id] && b.test(S));
  newBadges.forEach((b) => (S.badges[b.id] = entry.date.slice(0, 10)));
  save();
  window.hypeTrack && window.hypeTrack('workout_complete', { workout: c.wk, sessions: S.log.length });
  const leveled = entry.items.some((i) => i.result === 'level');
  if (leveled || newBadges.length) confetti();
  openModal(`
    <div class="boom" aria-hidden="true">${leveled ? '🆙' : '🏆'}</div>
    <h2 id="modalTitle">${esc(pick(HYPE.session))}</h2>
    <ul>${lines.join('')}</ul>
    ${newBadges.length ? `<h3>New badge${newBadges.length > 1 ? 's' : ''}!</h3><div class="badges" style="justify-content:center">${newBadges.map((b) => `<span class="badge">${esc(b.n)}</span>`).join('')}</div>` : ''}
    <p class="muted small">Next up: Workout ${S.next}. Rest a day, eat well, sleep well.</p>
    <button class="btn" data-close type="button">Nice! 🙌</button>`, () => render());
  render();
}

/* ---------- Progress ---------- */
function renderProgress() {
  const ids = ORDER.filter((id) => id !== 'pullup' || S.hasBar);
  const ups = countLevelUps(S);
  main().innerHTML = `
    <h1>Your progress 📈</h1>
    <div class="stats">
      <div class="stat"><b>${S.log.length}</b><span class="small muted">sessions</span></div>
      <div class="stat"><b>${ups}</b><span class="small muted">level-ups</span></div>
      <div class="stat"><b>${sessionsInLast(S, 7)}</b><span class="small muted">this week</span></div>
    </div>
    ${ids.map((id) => {
      const e = S.ex[id]; const l = lvlOf(id, e.lvl); const pct = Math.round(fraction(id, e) * 100);
      return `<div class="card"><div class="row"><h3>${esc(LADDERS[id].name)}</h3><span class="pill">Level ${e.lvl + 1}/${LADDERS[id].levels.length}</span></div>
        <p class="muted small" style="margin:4px 0 8px">${esc(l.n)} · ${SETS} × ${unitLabel(l.u, e.target)}</p>
        <div class="bar" role="img" aria-label="${pct}% up the ${esc(LADDERS[id].name)} ladder"><i style="width:${pct}%"></i></div>
        ${chart(id)}</div>`;
    }).join('')}
    <h2>Badges</h2>
    <div class="badges">${BADGES.map((b) => `<span class="badge ${S.badges[b.id] ? '' : 'locked'}">${esc(b.n)}${S.badges[b.id] ? '' : ' <span class="small">(locked)</span>'}</span>`).join('')}</div>`;
}
function chart(id) {
  const pts = [];
  S.log.forEach((l) => l.items.forEach((i) => { if (i.id === id && i.result !== 'skip') pts.push(fraction(id, { lvl: i.lvl, target: i.target })); }));
  pts.push(fraction(id, S.ex[id]));
  if (pts.length < 2) return '<p class="muted small">Chart appears after your first session with this exercise.</p>';
  const W = 300, H = 80, P = 4;
  const max = Math.max(...pts), min = Math.min(...pts);
  const span = max - min || 1;
  const xy = pts.map((p, i) => `${(P + (i * (W - 2 * P)) / (pts.length - 1)).toFixed(1)},${(H - P - ((p - min) / span) * (H - 2 * P)).toFixed(1)}`);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(LADDERS[id].name)} progress over ${pts.length - 1} sessions">
    <polyline fill="none" stroke="#ff4d8d" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${xy.join(' ')}"/></svg>`;
}

/* ---------- History ---------- */
function renderHistory() {
  if (!S.log.length) { main().innerHTML = '<h1>History</h1><div class="card">No sessions yet. Your first one is going to be epic. 🔥</div>'; return; }
  main().innerHTML = `<h1>History</h1>` + S.log.slice().reverse().map((l) => `
    <div class="card"><div class="row"><h3>${esc(fmtDate(l.date))}</h3><span class="pill">Workout ${l.wk}</span></div>
    <table><tbody>${l.items.map((i) => {
      const lv = lvlOf(i.id, i.lvl);
      const tag = i.result === 'level' ? ' <span class="pill lime">LEVEL UP</span>' : '';
      return `<tr><td>${esc(lv.n)}${tag}</td><td>${i.sets.map((x) => (x == null ? '–' : x)).join(' / ')} ${lv.u === 's' ? 'sec' : ''}</td></tr>`;
    }).join('')}</tbody></table></div>`).join('');
}

/* ---------- Settings ---------- */
function renderSettings() {
  main().innerHTML = `
    <h1>Settings</h1>
    <section class="card">
      <label for="rest">Rest timer between sets</label>
      <select id="rest">${[0, 60, 90, 120, 180].map((v) => `<option value="${v}" ${S.rest === v ? 'selected' : ''}>${v ? v + ' seconds' : 'Off'}</option>`).join('')}</select>
      <label class="opt"><input type="checkbox" id="sound" ${S.sound ? 'checked' : ''}> Sound and vibration when rest ends</label>
      <label class="opt"><input type="checkbox" id="bar" ${S.hasBar ? 'checked' : ''}> I have a pull-up bar</label>
    </section>
    <section class="card">
      <h2>Adjust your levels</h2>
      <p class="muted small">Too easy or too hard? Move any exercise to a different rung.</p>
      ${ORDER.map((id) => `<label for="lv_${id}">${esc(LADDERS[id].name)}</label>
        <select id="lv_${id}" data-id="${id}">${LADDERS[id].levels.map((l, i) => `<option value="${i}" ${S.ex[id].lvl === i ? 'selected' : ''}>${i + 1}. ${esc(l.n)}</option>`).join('')}</select>`).join('')}
    </section>
    <section class="card">
      <h2>Your data</h2>
      <p class="muted small">Everything is stored on this device only. Back it up before changing phones or clearing your browser.</p>
      <div class="tools">
        <button type="button" id="expJson">Export backup (JSON)</button>
        <button type="button" id="expCsv">Export history (CSV)</button>
      </div>
      <label for="imp">Import a backup</label>
      <input type="file" id="imp" accept="application/json,.json">
      <p style="margin-top:16px"><button type="button" class="btn danger" id="wipe">Delete all my data</button></p>
    </section>
    <section class="card">
      <h2>Health</h2>
      <p class="small">Warm up first. Stop if you feel pain, dizziness or chest discomfort, and seek medical advice. If your health changes, check with your GP before continuing.</p>
      <button type="button" class="linkbtn" id="recheck">Retake the starting test</button>
    </section>`;
  $('#rest').onchange = (e) => { S.rest = +e.target.value; save(); hype('Saved ✅'); };
  $('#sound').onchange = (e) => { S.sound = e.target.checked; save(); };
  $('#bar').onchange = (e) => { S.hasBar = e.target.checked; save(); hype(S.hasBar ? 'Pull-ups unlocked! 🧗' : 'Rows it is!'); };
  document.querySelectorAll('select[data-id]').forEach((sel) => (sel.onchange = () => {
    const id = sel.dataset.id; const lvl = +sel.value;
    S.ex[id] = { lvl, target: LADDERS[id].levels[lvl].r[0], fails: 0 };
    save(); hype(`${LADDERS[id].name}: ${LADDERS[id].levels[lvl].n} ✅`);
  }));
  $('#expJson').onclick = () => download('hypereps-backup.json', JSON.stringify(S, null, 2), 'application/json');
  $('#expCsv').onclick = () => {
    const rows = [['date', 'workout', 'exercise', 'level', 'target', 'unit', 'set1', 'set2', 'set3', 'result']];
    S.log.forEach((l) => l.items.forEach((i) => {
      const lv = lvlOf(i.id, i.lvl);
      rows.push([l.date, l.wk, lv.n, i.lvl + 1, i.target, lv.u === 's' ? 'seconds' : 'reps', ...i.sets.map((x) => (x == null ? '' : x)), i.result]);
    }));
    download('hypereps-history.csv', rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv');
  };
  $('#imp').onchange = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const d = JSON.parse(rd.result);
        if (!d || !d.ex) throw new Error('bad');
        S = sanitize(d); save(); hype('Backup restored! 🎉'); render();
      } catch (err) { hype('That file isn\'t a HypeReps backup.'); }
    };
    rd.readAsText(f);
  };
  $('#wipe').onclick = () => {
    const close = openModal(`<h2 id="modalTitle">Delete everything?</h2><p>All sessions, levels and badges on this device will be permanently deleted. This can't be undone.</p>
      <button class="btn ghost" data-close type="button">Keep my data</button> <button class="btn danger" id="yesWipe" type="button">Delete all</button>`);
    $('#yesWipe').onclick = () => {
      try { localStorage.removeItem(KEY); } catch (e) {}
      S = defaults(); ob = { step: 0 }; close(); go('today');
    };
  };
  $('#recheck').onclick = () => { S.onboarded = false; ob = { step: 1 }; save(); render(); };
}
function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* expose pure logic for tests */
if (typeof window !== 'undefined') window.HypeReps = { progress, LADDERS, sanitize, defaults, program, BADGES };

render();
