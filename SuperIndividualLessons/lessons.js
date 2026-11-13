'use strict';
// 四节课路由：课时切换、课程目录卡、进度记忆（localStorage，沙箱内优雅降级）。
// 兼容旧锚点：#idea → 第1课；#sim / #day / #practice → 第3课；#lesson-N 直达。
(function () {
  const TOTAL = 4;
  const STORE_KEY = 'super-individual-lessons.progress.v1';
  const lessons = [...document.querySelectorAll('.lesson[data-lesson]')];
  const links = [...document.querySelectorAll('[data-lesson-link]')];
  if (lessons.length !== TOTAL) return;
  const meta = [
    { title: '超级个体', sub: '一个人，活成一支队伍', desc: '碳基 + 硅基的融合、一人多分身、成长四阶段。先懂“超级个体”到底是什么。', tags: ['碳硅融合', '分身', '四阶段'], time: '约 15 分钟', accent: '#4c7a3f', tint: '#e9f3e2' },
    { title: '第二大脑', sub: '会长大的经验体系', desc: '三层结构（信源 / 知识地图 / Skills）与四模块工作循环，看懂 RSI 怎样解放注意力。', tags: ['三层结构', '四模块', 'RSI'], time: '约 15 分钟', accent: '#4f46e5', tint: '#eef0fb' },
    { title: '上手工作', sub: '在真实 AIChat 里跑一遍', desc: '工作台演示 + 角色放映室 + 任务卡：读脑、并行、判断、写回，亲手训练自己的分身。', tags: ['AIChat 演示', '放映室', '任务卡'], time: '约 40 分钟', accent: '#b8860b', tint: '#f6efe2' },
    { title: '超级组织', sub: '从一个人到一支军团', desc: '超级团队、超级公司、圈子组织、信任网络，以及 CAIO 新岗位与 FDE 交付。', tags: ['超级团队', '信任网络', 'CAIO'], time: '约 15 分钟', accent: '#7c3aed', tint: '#f1ecfb' }
  ];
  function setHash(hash) { try { setHash(hash); } catch { /* opaque-origin sandbox */ } }
  let current = 1;
  let visited = new Set();
  let storageOK = true;
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved && Array.isArray(saved.visited)) {
      visited = new Set(saved.visited.filter(n => Number.isInteger(n) && n >= 1 && n <= TOTAL));
      if (Number.isInteger(saved.last) && saved.last >= 1 && saved.last <= TOTAL) current = saved.last;
    }
  } catch { storageOK = false; }
  function persist() {
    if (!storageOK) return;
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ visited: [...visited], last: current })); }
    catch { storageOK = false; }
  }

  /* 课程目录卡 */
  const cardsRoot = document.getElementById('course-cards');
  const cards = [];
  if (cardsRoot) {
    meta.forEach((m, i) => {
      const n = i + 1;
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'course-card';
      card.dataset.card = String(n);
      card.style.setProperty('--card-accent', m.accent);
      card.style.setProperty('--card-tint', m.tint);
      card.setAttribute('aria-label', '第 ' + n + ' 课：' + m.title + '，' + m.time);
      const top = document.createElement('div'); top.className = 'cc-top';
      const num = document.createElement('span'); num.className = 'cc-num'; num.textContent = n;
      const time = document.createElement('span'); time.className = 'cc-time'; time.textContent = m.time;
      top.append(num, time);
      const h = document.createElement('h3'); h.textContent = m.title + ' · ' + m.sub;
      const p = document.createElement('p'); p.textContent = m.desc;
      const tags = document.createElement('div'); tags.className = 'cc-tags';
      m.tags.forEach(t => { const s = document.createElement('span'); s.textContent = t; tags.append(s); });
      const go = document.createElement('span'); go.className = 'cc-go'; go.textContent = '进入第 ' + n + ' 课 →';
      const done = document.createElement('span'); done.className = 'cc-done'; done.textContent = '✓ 已学';
      card.append(top, h, p, tags, go, done);
      card.addEventListener('click', () => open(n, true));
      cardsRoot.append(card);
      cards.push(card);
    });
  }

  function sync() {
    links.forEach(a => {
      const n = Number(a.dataset.lessonLink);
      a.classList.toggle('active', n === current);
      a.classList.toggle('visited', visited.has(n));
      if (n === current) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    cards.forEach((c, i) => {
      c.classList.toggle('current', i + 1 === current);
      c.classList.toggle('visited', visited.has(i + 1));
    });
    document.title = '超级个体培训课 · 第' + current + '课 ' + meta[current - 1].title;
  }

  function open(n, scroll) {
    n = Math.max(1, Math.min(TOTAL, n));
    current = n;
    visited.add(n);
    lessons.forEach(sec => { sec.hidden = Number(sec.dataset.lesson) !== n; });
    persist();
    sync();
    if (scroll) {
      const target = lessons[n - 1];
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    }
    // 通知课时变化（供宿主或扩展使用）
    window.dispatchEvent(new CustomEvent('lessonchange', { detail: { lesson: n } }));
  }

  /* 锚点 → 课时映射（兼容旧链接） */
  function lessonForHash(hash) {
    const m = /^#lesson-([1-4])$/.exec(hash);
    if (m) return { lesson: Number(m[1]), anchor: null };
    if (hash === '#idea' || hash === '#idea-individual') return { lesson: 1, anchor: null };
    if (hash === '#idea-brain') return { lesson: 2, anchor: null };
    if (['#sim', '#day', '#practice'].includes(hash)) return { lesson: 3, anchor: hash.slice(1) };
    return null;
  }
  function handleHash(scroll) {
    const route = lessonForHash(location.hash);
    if (!route) return false;
    open(route.lesson, false);
    if (route.anchor) {
      const el = document.getElementById(route.anchor);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
    } else if (scroll) {
      lessons[route.lesson - 1].scrollIntoView({ block: 'start' });
    }
    return true;
  }

  /* 点击拦截：课时导航、目录卡、data-goto-lesson、旧锚点 */
  document.addEventListener('click', e => {
    const goto = e.target.closest('[data-goto-lesson]');
    if (goto) {
      e.preventDefault();
      open(Number(goto.dataset.gotoLesson), true);
      setHash('#lesson-' + goto.dataset.gotoLesson);
      return;
    }
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    const route = lessonForHash(hash);
    if (route) {
      e.preventDefault();
      open(route.lesson, false);
      setHash(hash);
      const target = route.anchor ? document.getElementById(route.anchor) : lessons[route.lesson - 1];
      if (target) requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));
    }
  });

  /* 课间导航 */
  document.querySelectorAll('[data-pager]').forEach(b => {
    b.addEventListener('click', () => {
      const kind = b.dataset.pager;
      if (kind === 'prev') open(current - 1, true);
      else if (kind === 'next') open(current + 1, true);
      else if (kind === 'finish') {
        open(3, false);
        setHash('#practice');
        const p = document.getElementById('practice');
        if (p) requestAnimationFrame(() => p.scrollIntoView({ block: 'start' }));
      }
      if (kind !== 'finish') setHash('#lesson-' + current);
    });
  });

  window.addEventListener('hashchange', () => handleHash(true));

  /* 初始化：hash 优先，其次恢复上次进度 */
  if (!handleHash(false)) open(current, false);
  else sync();
})();