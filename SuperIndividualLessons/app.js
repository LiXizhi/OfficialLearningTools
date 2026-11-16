/* 课程外壳：路由、身份、进度、每课渲染、复制练习、自检，以及在 AIChat 课堂库中的悬浮/上下文桥接。 */
(() => {
  const C = window.COURSE;
  const STORE = 'super-individual.course.v3';
  const PAGES = ['intro', 'lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'finish'];
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- 状态 ---------- */
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE) || '{}');
      return {
        role: s.role === 'teacher' ? 'teacher' : 'student',
        done: Array.isArray(s.done) ? s.done.filter((n) => n >= 1 && n <= 4) : [],
        last: Number.isInteger(s.last) && s.last >= 0 && s.last <= 5 ? s.last : 0
      };
    } catch { return { role: 'student', done: [], last: 0 }; }
  }
  const state = load();
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* 隐私模式 */ } };
  let page = 0;
  const scenes = {};

  /* ---------- 顶栏步骤 ---------- */
  const stepsNav = $('.steps');
  const stepDefs = [{ n: 0, ico: '★', name: '开场' }, ...C.lessons.map((l) => ({ n: l.id, ico: l.icon, name: l.name, color: l.color })), { n: 5, ico: '🗺', name: '地图' }];
  stepsNav.innerHTML = stepDefs.map((s) => `<a href="#${PAGES[s.n]}" data-go="${s.n}" style="--c:${s.color || '#23382b'}"><i>${s.ico}</i><span>${esc(s.name)}</span></a>`).join('');

  function paintSteps() {
    stepsNav.querySelectorAll('a').forEach((a) => {
      const n = Number(a.dataset.go);
      a.classList.toggle('done', state.done.includes(n));
      if (n === page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const startBtn = $('#start');
    if (state.last > 0 && state.last < 5) startBtn.textContent = `继续第 ${state.last} 课 →`;
    else if (state.last === 5) startBtn.textContent = '再看一遍地图 →';
    else startBtn.textContent = '开始第 1 课 →';
  }

  /* ---------- 开场 ---------- */
  $('.four').innerHTML = C.lessons.map((l) => `
    <li style="--c:${l.color}">
      <button type="button" data-go="${l.id}">
        <span class="four-ico">${l.icon}</span>
        <span class="four-num">第 ${l.id} 件事</span>
        <b>${esc(l.name)}</b>
        <span class="four-line">${esc(l.title)}</span>
      </button>
    </li>`).join('');

  /* ---------- 每课 ---------- */
  function lessonHTML(l) {
    return `
      <header class="lesson-head" style="--c:${l.color};--art:url('${l.art}')">
        <span class="lh-num">${l.id}</span>
        <div>
          <p class="kicker">第 ${l.id} 件事 · ${esc(l.name)}</p>
          <h1>${esc(l.title)}</h1>
          <p class="lead">${esc(l.lead)}</p>
        </div>
      </header>

      <section class="block" aria-label="生活场景动画">
        <h2 class="block-title scene-title"></h2>
        <div class="lesson-scene"></div>
      </section>

      <section class="block points-wrap" aria-label="三句要点" style="--c:${l.color}">
        <ul class="points">${l.points.map(([i, t, d]) => `<li><span>${i}</span><b>${esc(t)}</b><small>${esc(d)}</small></li>`).join('')}</ul>
        <button type="button" class="where" data-shot="${l.shot}" data-name="${esc(l.name)}">
          <img src="${l.shot}" alt="" loading="lazy">
          <span><b>📍 ${esc(l.where)}</b><small>点开看真实界面</small></span>
        </button>
      </section>

      <section class="block try" aria-labelledby="try-${l.id}" style="--c:${l.color}">
        <h2 class="block-title" id="try-${l.id}">✍️ 在 AIChat 里试一试</h2>
        <ol class="try-steps"><li>看一看，按你的情况改一改</li><li>点“复制”</li><li>在 AIChat 输入框粘贴，按回车</li></ol>
        <label class="sr-only" for="prompt-${l.id}">练习话术</label>
        <textarea id="prompt-${l.id}" class="prompt" rows="4" spellcheck="false"></textarea>
        <div class="row">
          <button type="button" class="btn primary copy" data-for="prompt-${l.id}">📋 复制</button>
          <span class="copy-tip" role="status"></span>
          <button type="button" class="btn ghost reset" data-lesson="${l.id}">恢复示例</button>
        </div>
      </section>

      <section class="block quiz" aria-labelledby="quiz-${l.id}" style="--c:${l.color}">
        <h2 class="block-title" id="quiz-${l.id}">🤔 想一想：${esc(l.quiz.q)}</h2>
        <div class="quiz-opts">${l.quiz.options.map((o, i) => `<button type="button" data-i="${i}">${esc(o)}</button>`).join('')}</div>
        <p class="quiz-fb" role="status"></p>
      </section>

      <nav class="pager">
        <button type="button" class="btn ghost" data-go="${l.id - 1}">← ${l.id === 1 ? '开场' : '上一课'}</button>
        <button type="button" class="btn primary" data-go="${l.id + 1}">${l.id === 4 ? '看 AIChat 地图 →' : `下一课：${esc(C.lessons[l.id].name)} →`}</button>
      </nav>`;
  }

  C.lessons.forEach((l) => {
    const sec = $(`#lesson-${l.id}`);
    sec.setAttribute('aria-label', `第 ${l.id} 件事：${l.name}`);
    sec.innerHTML = lessonHTML(l);
    scenes[l.id] = window.createScene($('.lesson-scene', sec));
    const quiz = $('.quiz', sec);
    quiz.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-i]');
      if (!b) return;
      const ok = Number(b.dataset.i) === l.quiz.correct;
      quiz.querySelectorAll('button').forEach((x) => { x.classList.remove('right', 'wrong'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add(ok ? 'right' : 'wrong');
      b.setAttribute('aria-pressed', 'true');
      $('.quiz-fb', quiz).textContent = (ok ? '✓ 对！' : '再想想：') + l.quiz.explain;
      if (ok && !state.done.includes(l.id)) { state.done.push(l.id); save(); paintSteps(); }
    });
  });
  scenes[0] = window.createScene($('#intro-scene'));

  /* ---------- 身份 ---------- */
  function applyRole(withAutoplay = false) {
    const r = C.roles[state.role];
    document.querySelectorAll('.role-switch button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.role === state.role)));
    $('.role-day').textContent = C.intro[state.role].title;
    scenes[0].load(C.intro[state.role], { persona: r.persona, autoplay: withAutoplay && page === 0 });
    C.lessons.forEach((l) => {
      const sec = $(`#lesson-${l.id}`);
      const sc = l.scene[state.role];
      $('.scene-title', sec).textContent = `🎬 ${sc.title}`;
      scenes[l.id].load(sc, { persona: r.persona, autoplay: withAutoplay && page === l.id });
      $('.prompt', sec).value = l.practice[state.role];
    });
    window.renderAIChatMap($('#aichat-map'), r.persona);
  }
  $('.role-switch').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-role]');
    if (!b || b.dataset.role === state.role) return;
    state.role = b.dataset.role;
    save();
    applyRole(true);
  });

  /* ---------- 收尾页 ---------- */
  $('.map-legend').innerHTML = C.lessons.map((l) => `<li style="--c:${l.color}"><span class="m-pin p${l.id}">${l.id}</span><b>${esc(l.name)}</b><small>${esc(l.where.replace('在 AIChat 里：', ''))}</small></li>`).join('');
  $('.habits').innerHTML = C.habits.map((h) => `<li><label><input type="checkbox"> <span>${esc(h)}</span></label></li>`).join('');
  $('.glossary dl').innerHTML = C.glossary.map(([t, d]) => `<dt>${esc(t)}</dt><dd>${esc(d)}</dd>`).join('');
  $('#open-aichat').href = C.aichatUrl;
  $('#print').addEventListener('click', () => window.print());

  /* ---------- 路由 ---------- */
  function pageFromHash(h) {
    const id = (h || '').replace(/^#/, '');
    const i = PAGES.indexOf(id);
    return i >= 0 ? i : 0;
  }
  function show(n, { push = true, autoplay = true } = {}) {
    const next = Math.max(0, Math.min(5, Number(n) || 0));
    Object.values(scenes).forEach((s) => s.stop());
    page = next;
    document.querySelectorAll('.page').forEach((p) => { p.hidden = Number(p.dataset.page) !== page; });
    if (page > 0) { state.last = page; save(); }
    paintSteps();
    if (push) { try { history.replaceState(null, '', `#${PAGES[page]}`); } catch { /* 受限 iframe */ } }
    window.scrollTo({ top: 0 });
    const sc = scenes[page];
    if (sc && autoplay) {
      const data = page === 0 ? C.intro[state.role] : C.lessons[page - 1].scene[state.role];
      sc.load(data, { persona: C.roles[state.role].persona, autoplay: true });
    }
    const heading = $(`#${PAGES[page]} h1`);
    if (heading && push) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
    window.dispatchEvent(new CustomEvent('coursepagechange', { detail: { page } }));
  }
  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (!go) return;
    e.preventDefault();
    show(go.dataset.go);
  });
  $('#start').addEventListener('click', () => show(state.last > 0 ? state.last : 1));
  window.addEventListener('hashchange', () => show(pageFromHash(location.hash), { push: false }));

  /* ---------- 复制练习（AIChat 内外一致：只复制到剪贴板） ---------- */
  const tipTimers = new WeakMap();
  function legacyCopy(text) {
    const field = Object.assign(document.createElement('textarea'), { value: text });
    field.setAttribute('readonly', '');
    field.style.cssText = 'position:fixed;inset-block-start:0;opacity:0';
    document.body.append(field);
    field.select();
    try { return document.execCommand('copy'); } catch { return false; } finally { field.remove(); }
  }
  async function copyPrompt(btn) {
    const area = document.getElementById(btn.dataset.for);
    const tip = btn.parentElement.querySelector('.copy-tip');
    const text = area.value.trim();
    if (!text) return;
    let ok = false;
    // 沙箱 iframe 中剪贴板请求可能一直不返回：最多等 1.5 秒，然后改用旧方法。
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500));
    try { await Promise.race([navigator.clipboard.writeText(text), timeout]); ok = true; } catch { ok = legacyCopy(text); }
    clearTimeout(tipTimers.get(btn));
    btn.toggleAttribute('data-copied', ok);
    tip.textContent = '';
    requestAnimationFrame(() => {
      tip.textContent = ok ? '已复制！到 AIChat 输入框粘贴（Ctrl+V），按回车。' : '浏览器不允许自动复制：文字已选中，请按 Ctrl+C。';
    });
    if (!ok) { area.focus(); area.select(); }
    tipTimers.set(btn, setTimeout(() => { btn.removeAttribute('data-copied'); }, 2500));
  }
  document.addEventListener('click', (e) => {
    const copy = e.target.closest('button.copy');
    if (copy) copyPrompt(copy);
    const reset = e.target.closest('button.reset');
    if (reset) {
      const l = C.lessons[Number(reset.dataset.lesson) - 1];
      $(`#prompt-${l.id}`).value = l.practice[state.role];
    }
  });

  /* ---------- 真实界面截图查看 ---------- */
  const viewer = $('#viewer');
  document.addEventListener('click', (e) => {
    const w = e.target.closest('button.where');
    if (!w) return;
    $('#viewer-img').src = w.dataset.shot;
    $('#viewer-img').alt = `${w.dataset.name}在 KeepWork AIChat 中的界面`;
    $('#viewer-title').textContent = `${w.dataset.name} · 在 AIChat 里的样子`;
    viewer.showModal();
  });
  $('#viewer-close').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); }); // closedby 不支持时的点外关闭

  /* ---------- AIChat 课堂库桥接：悬浮置顶 + 把当前课告诉主聊天里的 AI ---------- */
  window.buildCourseToolContext = () => {
    const r = C.roles[state.role];
    const l = page >= 1 && page <= 4 ? C.lessons[page - 1] : null;
    return [
      '课程：超级个体 · 四件事，一个 AIChat（面向不熟悉 AI 的学生和老师）',
      `学员身份：${r.label}`,
      l ? `当前：第 ${l.id} 件事「${l.name}」—— ${l.title}` : `当前：${page === 0 ? '开场' : 'AIChat 地图（已学完）'}`,
      l ? `本课练习话术：${$(`#prompt-${l.id}`).value.trim()}` : '',
      '请你当这门课的助教：用简单的话回答；学员粘贴练习时，真的帮他完成，同时点出他做对了什么、下次可以怎么说得更清楚。'
    ].filter(Boolean).join('\n').slice(0, 8000);
  };
  const channel = 'aichat.external-tool.v1';
  let wrapperOrigin = '';
  try { wrapperOrigin = new URL(location.href).origin; } catch { wrapperOrigin = ''; }
  const embedded = window.parent !== window && /^https?:$/.test(location.protocol) && Boolean(wrapperOrigin);
  const sendWrapper = (type, detail = {}) => { if (embedded) window.parent.postMessage({ ...detail, channel, type }, wrapperOrigin); };
  window.addEventListener('message', (event) => {
    if (!embedded || event.source !== window.parent || event.origin !== wrapperOrigin || event.data?.channel !== channel) return;
    const m = event.data;
    if (m.type === 'host:always-on-top-support' && m.supported) sendWrapper('tool:always-on-top', { enabled: true });
    else if (m.type === 'host:get-tool-context') sendWrapper('tool:tool-context', { requestId: m.requestId, context: window.buildCourseToolContext() });
  });
  sendWrapper('tool:ready', { capabilities: ['tool-context'] });

  /* ---------- 启动 ---------- */
  document.addEventListener('visibilitychange', () => { if (document.hidden) Object.values(scenes).forEach((s) => s.stop()); });
  applyRole(false);
  show(pageFromHash(location.hash), { push: false, autoplay: true });
})();
