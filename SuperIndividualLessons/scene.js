/* 场景播放器：在模拟的 KeepWork AIChat 窗口里逐拍播放生活场景。
   createScene(mount, { label }) 返回 { load(scene, opts), stop() }。 */
(() => {
  const ZONES = { main: 'AI 工作台', composer: 'AI 工作台', side: '第二大脑', panel: '', rail: 'AI 工具', top: '人机圈子' };
  const BEAT_MS = 3400;
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function windowHTML(persona) {
    return `
      <div class="mock" aria-hidden="true">
        <div class="m-top" data-zone="top">
          <span class="m-dots"><i></i><i></i><i></i></span>
          <b>KeepWork AIChat</b><span class="m-persona">${esc(persona)}</span>
          <span class="m-chips"><em>🧠 第二大脑</em><em class="m-circle">◎ 圈子</em><em>钉钉</em><em>飞书</em></span>
        </div>
        <div class="m-body">
          <nav class="m-rail" data-zone="rail"><i>💬</i><i>🧠</i><i class="m-tool">🧰</i><i>📅</i></nav>
          <nav class="m-side" data-zone="side">
            <div class="m-brainrow">🧠 第二大脑</div>
            <div class="m-sess on">今天的任务</div>
            <div class="m-sess">学习小组</div>
            <div class="m-sess">周五展示</div>
          </nav>
          <section class="m-main" data-zone="main">
            <div class="m-msgs"></div>
            <div class="m-composer" data-zone="composer"><span class="m-mic">🎙</span><span class="m-typed"></span><span class="m-send">↑</span></div>
          </section>
          <aside class="m-panel" data-zone="panel"></aside>
        </div>
      </div>`;
  }

  function msgHTML(m, isNew) {
    const cls = isNew ? ' new' : '';
    if (m.u) return `<div class="m-msg u${cls}">${m.voice ? '<span class="m-voice">🎙 语音</span>' : ''}${esc(m.u)}</div>`;
    if (m.a) return `<div class="m-msg a${cls}">${esc(m.a)}${m.cite ? `<small class="m-cite">📎 ${esc(m.cite)}</small>` : ''}</div>`;
    if (m.tool) {
      const [i, n, r] = m.tool;
      return `<div class="m-tool-card${cls}"><span class="m-ti">${i}</span><b>${esc(n)}</b><span class="m-tr">${esc(r)}</span><span class="m-ok">✓</span></div>`;
    }
    return '';
  }

  const item = (x) => (typeof x === 'string' ? { n: x } : x);

  function panelHTML(p) {
    if (!p) return '<div class="m-empty">文件和预览会出现在这里</div>';
    if (p.type === 'files') {
      return `<h5>${esc(p.title)}</h5>${p.items.map(item).map((f) => `<div class="m-file ${f.s || ''}">📄 ${esc(f.n)}</div>`).join('')}`;
    }
    if (p.type === 'table') {
      return `<h5>预览 · ${esc(p.title)}</h5><table class="m-table">${p.rows.map((r, i) => `<tr>${r.map((c) => (i ? `<td>${esc(c)}</td>` : `<th>${esc(c)}</th>`)).join('')}</tr>`).join('')}</table>`;
    }
    if (p.type === 'brain') {
      const col = (name, ico, list) => `<div class="m-bcol"><h6>${ico} ${name}</h6>${list.length ? list.map(item).map((x) => `<div class="m-bitem ${x.s || ''}">${esc(x.n)}</div>`).join('') : '<div class="m-bitem ghost">（空）</div>'}</div>`;
      return `<h5>第二大脑</h5><div class="m-brain">${col('资料箱', '📥', p.box)}${col('知识本', '📒', p.book)}${col('规则本', '📏', p.rules)}</div>`;
    }
    if (p.type === 'calendar') {
      return `<h5>${esc(p.title)}</h5>${p.items.map(([d, t, n, s]) => `<div class="m-cal ${s || ''}"><b>${esc(d)}</b><span>${esc(t)}</span>${esc(n)}</div>`).join('')}`;
    }
    if (p.type === 'circle') {
      const members = p.members ? `<div class="m-members">${p.members.map((m) => `<span class="${m.includes('🤖') ? 'bot' : ''}">${esc(m)}</span>`).join('')}</div>` : '';
      const chat = (p.items || []).map((g) => `<div class="m-g ${g.bot ? 'bot' : ''}"><b>${g.bot ? '🤖 ' : ''}${esc(g.who)}</b><span>${esc(g.t)}</span>${g.flag ? `<em>${esc(g.flag)}</em>` : ''}</div>`).join('');
      return `<h5>◎ ${esc(p.title)}</h5>${members}<div class="m-gchat">${chat}</div>`;
    }
    return '';
  }

  window.createScene = function createScene(mount) {
    mount.classList.add('scene');
    mount.innerHTML = `
      <div class="sc-stage"><div class="sc-window"></div></div>
      <p class="sc-cap" aria-live="polite"></p>
      <div class="sc-controls">
        <button type="button" class="sc-play">▶ 播放</button>
        <button type="button" class="sc-prev" aria-label="上一步">‹</button>
        <div class="sc-dots" role="group" aria-label="场景步骤"></div>
        <button type="button" class="sc-next" aria-label="下一步">›</button>
      </div>`;
    const win = mount.querySelector('.sc-window');
    const cap = mount.querySelector('.sc-cap');
    const playBtn = mount.querySelector('.sc-play');
    const dots = mount.querySelector('.sc-dots');
    let scene = null;
    let idx = 0;
    let timer = 0;
    let typer = 0;
    let playing = false;

    function stopTimers() {
      clearTimeout(timer);
      clearInterval(typer);
      timer = 0;
      typer = 0;
    }

    function setPlaying(on) {
      playing = on;
      playBtn.textContent = on ? '❚❚ 暂停' : (scene && idx >= scene.beats.length - 1 ? '↻ 重播' : '▶ 播放');
      mount.classList.toggle('is-playing', on);
    }

    function type(el, text) {
      clearInterval(typer);
      if (!text) { el.textContent = ''; return; }
      if (reduceMotion()) { el.textContent = text; return; }
      let n = 0;
      el.textContent = '';
      typer = setInterval(() => {
        n += 1;
        el.textContent = text.slice(0, n);
        if (n >= text.length) clearInterval(typer);
      }, Math.max(28, Math.min(70, 1300 / text.length)));
    }

    function render() {
      const beats = scene.beats;
      const msgs = [];
      let panel = null;
      let firstNewMsg = 0;
      beats.slice(0, idx + 1).forEach((b, bi) => {
        if (bi === idx) firstNewMsg = msgs.length;
        if (b.msgs) msgs.push(...b.msgs);
        if (b.panel) panel = b.panel;
      });
      const beat = beats[idx];
      const panelChanged = Boolean(beat.panel);
      const mock = win.querySelector('.mock');
      mock.dataset.hl = beat.hl || '';
      mock.querySelector('.m-msgs').innerHTML = msgs.slice(-5).map((m, i, arr) => msgHTML(m, msgs.length - arr.length + i >= firstNewMsg)).join('');
      const panelEl = mock.querySelector('.m-panel');
      panelEl.innerHTML = panelHTML(panel);
      panelEl.classList.toggle('new', panelChanged);
      mock.classList.toggle('show-panel', Boolean(panel));
      type(mock.querySelector('.m-typed'), beat.say || '');
      cap.textContent = beat.cap;
      dots.querySelectorAll('button').forEach((d, di) => {
        d.setAttribute('aria-current', di === idx ? 'step' : 'false');
        d.classList.toggle('seen', di < idx);
      });
      mount.querySelector('.sc-prev').disabled = idx === 0;
      mount.querySelector('.sc-next').disabled = idx >= beats.length - 1;
      mount.dataset.step = String(idx);
    }

    function go(i, keepPlaying = false) {
      if (!scene) return;
      stopTimers();
      idx = Math.max(0, Math.min(i, scene.beats.length - 1));
      render();
      if (keepPlaying && idx < scene.beats.length - 1) {
        timer = setTimeout(() => go(idx + 1, true), BEAT_MS);
      } else {
        setPlaying(false);
      }
    }

    function play() {
      if (!scene) return;
      if (idx >= scene.beats.length - 1) idx = -1;
      setPlaying(true);
      go(idx + 1, true);
    }

    playBtn.addEventListener('click', () => (playing ? (stopTimers(), setPlaying(false)) : play()));
    mount.querySelector('.sc-prev').addEventListener('click', () => go(idx - 1));
    mount.querySelector('.sc-next').addEventListener('click', () => go(idx + 1));
    mount.addEventListener('keydown', (e) => {
      if (e.target.closest('textarea,input')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1); }
    });

    return {
      load(next, { persona = '', autoplay = false } = {}) {
        stopTimers();
        scene = next;
        idx = 0;
        win.innerHTML = windowHTML(persona);
        dots.innerHTML = next.beats.map((b, i) => `<button type="button" aria-label="第 ${i + 1} 步"></button>`).join('');
        dots.querySelectorAll('button').forEach((d, i) => d.addEventListener('click', () => go(i)));
        render();
        if (autoplay && !reduceMotion()) {
          setPlaying(true);
          timer = setTimeout(() => go(1, true), BEAT_MS);
        } else {
          setPlaying(false);
        }
      },
      stop() { stopTimers(); setPlaying(false); },
      get step() { return idx; }
    };
  };

  /* 收尾页“AIChat 地图”：静态窗口，四个区域都标出编号 */
  window.renderAIChatMap = function renderAIChatMap(mount, persona) {
    mount.innerHTML = windowHTML(persona);
    const mock = mount.querySelector('.mock');
    mock.removeAttribute('aria-hidden');
    mock.classList.add('is-map', 'show-panel');
    mock.querySelector('.m-msgs').innerHTML = msgHTML({ u: '帮我准备周五的小组展示' }) + msgHTML({ tool: ['🔍', '网页搜索', '找到 3 个例子'] }) + msgHTML({ a: '提纲已写好，请检查。', cite: '出处：知识本' });
    mock.querySelector('.m-panel').innerHTML = panelHTML({ type: 'circle', title: '学习小组', items: [{ who: '同学', t: '数据在哪？' }, { who: '我的分身', bot: true, t: '在记录第 2 页。' }] });
    mock.querySelector('.m-typed').textContent = '说一句话，让 AI 开始干活……';
    const pins = [['.m-main', 1, 'AI 工作台'], ['.m-brainrow', 2, '第二大脑'], ['.m-tool-card', 3, 'AI 工具'], ['.m-panel', 4, '人机圈子']];
    pins.forEach(([sel, n, name]) => {
      const host = mock.querySelector(sel);
      if (host) host.insertAdjacentHTML('afterbegin', `<span class="m-pin p${n}" title="${name}">${n}</span>`);
    });
  };

  window.SCENE_ZONES = ZONES;
})();
