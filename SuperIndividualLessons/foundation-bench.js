// 共享通识工作台：左边是场景与对话，右边是第二大脑的目录和文件。
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const base = path => path.split('/').pop().replace(/\.md$/, '');
  const owner = path => path.startsWith('公司脑/') ? 'team' : 'mine';
  const kind = path => path.startsWith('notes/') ? '原件' :
    path === 'AGENTS.md' ? '维护规则' : path.endsWith('index.md') ? '索引' : path.endsWith('log.md') ? '日志' :
    path.startsWith('_wiki/') ? '知识页' : path.startsWith('docs/') ? '作品记录' : '文件';
  function diff(before, after) {
    const a = before || [], b = after, n = a.length, m = b.length;
    const L = Array.from({length:n + 1}, () => new Uint16Array(m + 1));
    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? 1 + L[i + 1][j + 1] : Math.max(L[i + 1][j], L[i][j + 1]);
    const rows = []; let i = 0, j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && a[i] === b[j]) { rows.push(['', b[j++]]); i++; }
      else if (i < n && (j === m || L[i + 1][j] >= L[i][j + 1])) rows.push(['del', a[i++]]);
      else rows.push(['add', b[j++]]);
    }
    return rows;
  }
  function build(number) {
    const data = window.foundationBench;
    let files = Object.fromEntries(Object.entries(data.files).map(([k, v]) => [k, [...v]]));
    let frames = [], scene = null;
    data.chapters.slice(0, number).forEach((chapter, c) => {
      for (const step of chapter.steps) {
        if (step.scene) scene = step.scene;
        let path = step.open, before;
        if (step.write) {
          const [target, change] = step.write;
          path = target; before = files[target];
          files = {...files, [target]: change(files[target] ? [...files[target]] : [])};
        }
        if (c === number - 1) frames.push({...step, path, before, files, scene, wrote:Boolean(step.write), created:Boolean(step.write) && !before});
      }
    });
    return frames;
  }
  window.buildFoundationBench = build;

  window.mountFoundationBench = function(host, number) {
    const chapter = window.foundationBench.chapters[number - 1];
    const frames = build(number);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const answered = new Set();
    let step = 0, manual = '', playing = false, timer = 0, revealTimer = 0;
    host.className = 'fb';
    host.innerHTML =
      '<header class="fb-head"><div><b>第二大脑工作台</b><span>' + esc(chapter.title) + '</span></div></header>' +
      '<ol class="fb-steps" aria-label="工作步骤">' + frames.map((f, i) => '<li><button type="button" data-step="' + i + '"><i>' + (i + 1) + '</i><span>' + esc(f.label) + '</span></button></li>').join('') + '</ol>' +
      '<div class="fb-duet">' +
        '<section class="fb-left" aria-label="场景与对话"><figure class="fb-scene"><img alt=""><figcaption></figcaption></figure>' +
          '<div class="fb-chat" tabindex="0" aria-label="对话记录" aria-live="polite"></div><div class="fb-ask" hidden></div></section>' +
        '<section class="fb-right" aria-label="第二大脑文件"><nav class="fb-tree" aria-label="第二大脑目录"></nav>' +
          '<div class="fb-editor"><div class="fb-tab"><b></b><span class="fb-kind"></span><span class="fb-op"></span></div>' +
          '<div class="fb-lines" tabindex="0" aria-label="文件正文"></div></div></section>' +
      '</div>' +
      '<div class="fb-controls"><button type="button" data-fb="play">▶ 播放</button><button type="button" data-fb="prev" aria-label="上一步">‹ 上一步</button>' +
      '<button type="button" data-fb="next" aria-label="下一步">下一步 ›</button><progress max="' + frames.length + '"></progress><output></output></div>';
    const $ = s => host.querySelector(s);
    const chat = $('.fb-chat'), lines = $('.fb-lines'), ask = $('.fb-ask');
    const blocked = i => frames[i].ask && !answered.has(i);
    function markup(line, files) {
      return esc(line).replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (all, path, label) => {
        const real = path.replace(/&amp;/g, '&');
        return Object.hasOwn(files, real) ? '<button type="button" class="fb-link" data-file="' + path + '">' + label + ' ↗</button>' : label;
      });
    }
    function tree(f) {
      const groups = {};
      for (const path of Object.keys(f.files).sort()) {
        const parts = path.split('/'), top = owner(path) === 'team' ? '公司脑' : '我的第二大脑';
        const folder = parts.slice(owner(path) === 'team' ? 1 : 0, -1).join('/') || '·';
        ((groups[top] ||= {})[folder] ||= []).push(path);
      }
      const touched = new Map();
      frames.slice(0, step + 1).filter(x => x.wrote).forEach(x => touched.set(x.path, touched.get(x.path) || (x.created ? 'new' : 'mod')));
      const open = manual || f.path;
      $('.fb-tree').innerHTML = Object.entries(groups).map(([top, folders]) =>
        '<section class="fb-vault fb-' + (top === '公司脑' ? 'team' : 'mine') + '"><h4>' + top + '</h4>' +
        Object.entries(folders).map(([folder, paths]) => '<div class="fb-folder"><small title="' + esc(folder) + '">' + esc(folder === '·' ? '根目录' : folder.split('/').slice(-1)[0] + '/') + '</small>' +
          paths.map(p => '<button type="button" data-file="' + esc(p) + '"' + (p === open ? ' aria-current="true"' : '') + ' title="' + esc(p) + '">' +
            '<span>' + esc(base(p)) + '</span>' + (touched.get(p) ? '<em class="fb-' + touched.get(p) + '">' + (touched.get(p) === 'new' ? '新建' : '已改') + '</em>' : '') + '</button>').join('') +
        '</div>').join('') + '</section>').join('');
    }
    function file(f) {
      const path = manual || f.path, body = f.files[path] || [];
      const showDiff = !manual && f.wrote;
      $('.fb-tab b').textContent = path;
      $('.fb-kind').textContent = (owner(path) === 'team' ? '公司脑 · ' : '') + kind(path);
      $('.fb-op').textContent = showDiff ? (f.created ? '本步新建' : '本步修改') : manual ? '你打开的文件' : '本步读取';
      const rows = showDiff ? diff(f.before, body) : body.map(s => ['', s]);
      let n = 0, fm = 0;
      lines.innerHTML = rows.map(([k, s]) => {
        if (k !== 'del') n++;
        if (s === '---') fm++;
        const front = fm === 1 || (s === '---' && fm === 2);
        const hit = !manual && f.focus && s.includes(f.focus);
        const cls = [k, hit ? 'hit' : '', front ? 'front' : '', /^#{1,3} /.test(s) ? 'heading' : ''].filter(Boolean).join(' ');
        return '<div class="fb-row ' + cls + '"><small>' + (k === 'del' ? '' : String(n).padStart(2, '0')) + '</small><b aria-hidden="true">' + (k === 'del' ? '−' : k === 'add' ? '+' : '') + '</b><span>' + markup(s, f.files) + '</span></div>';
      }).join('') || '<p class="fb-empty">（空文件）</p>';
      const hot = lines.querySelector('.hit') || lines.querySelector('.add,.del');
      lines.scrollTop = hot ? Math.max(0, hot.offsetTop - lines.clientHeight * .3) : 0;
    }
    function bubbles(upto, revealLast) {
      chat.innerHTML = frames.slice(0, upto + 1).map((f, i) =>
        (f.me ? '<div class="fb-msg fb-me"><i aria-hidden="true">我</i><p>' + esc(f.me) + '</p></div>' : '') +
        '<div class="fb-msg fb-ai"' + (i === upto && !revealLast ? ' hidden' : '') + '><i aria-hidden="true">AI</i><div><b>' + esc(f.who || 'AI 助手') + '</b><p>' + esc(f.ai) + '</p></div></div>').join('');
      chat.scrollTop = chat.scrollHeight;
    }
    function quiz(f, i) {
      ask.hidden = !f.ask;
      if (!f.ask) return;
      const done = answered.has(i);
      ask.innerHTML = '<strong>' + esc(f.ask.q) + '</strong><div>' + f.ask.options.map(([text, ok], k) =>
        '<button type="button" data-option="' + k + '"' + (done && ok ? ' aria-pressed="true"' : '') + '>' + esc(text) + '</button>').join('') + '</div>' +
        '<small role="status">' + (done ? esc(f.ask.options.find(o => o[1])[2]) : '先判断，再继续。') + '</small>';
    }
    function show(i, animate = false) {
      clearTimeout(revealTimer);
      step = Math.max(0, Math.min(frames.length - 1, i)); manual = '';
      const f = frames[step];
      const img = $('.fb-scene img'), src = 'assets/' + f.scene[0];
      if (img.getAttribute('src') !== src) { img.src = src; img.alt = f.scene[1]; }
      $('.fb-scene figcaption').textContent = f.scene[1];
      host.querySelectorAll('[data-step]').forEach((b, k) => {
        b.setAttribute('aria-current', String(k === step));
        b.classList.toggle('done', k < step);
        b.disabled = k > step && frames.slice(step, k).some((_, d) => blocked(step + d));
      });
      const reveal = animate && !reduce.matches;
      bubbles(step, !reveal);
      if (reveal) revealTimer = setTimeout(() => { const last = chat.querySelector('.fb-ai:last-child'); if (last) { last.hidden = false; chat.scrollTop = chat.scrollHeight; } }, 650);
      tree(f); file(f); quiz(f, step);
      $('progress').value = step + 1;
      $('output').textContent = (step + 1) + ' / ' + frames.length;
      $('[data-fb=prev]').disabled = step === 0;
      $('[data-fb=next]').disabled = step === frames.length - 1 || blocked(step);
      sync();
    }
    function sync() {
      const play = $('[data-fb=play]');
      play.disabled = blocked(step);
      play.textContent = blocked(step) ? '请先判断' : playing ? 'Ⅱ 暂停' : step === frames.length - 1 ? '↺ 重播' : '▶ 播放';
    }
    function stop() { playing = false; clearTimeout(timer); sync(); }
    function tick() {
      if (!playing) return;
      if (blocked(step) || step === frames.length - 1) { stop(); return; }
      show(step + 1, true);
      timer = setTimeout(tick, reduce.matches ? 3200 : 5200);
    }
    host.addEventListener('click', ev => {
      const b = ev.target.closest('button'); if (!b) return;
      if (b.dataset.step) { stop(); show(Number(b.dataset.step)); }
      else if (b.dataset.file) { stop(); manual = b.dataset.file; tree(frames[step]); file(frames[step]); }
      else if (b.dataset.option) {
        const f = frames[step], [, ok, note] = f.ask.options[Number(b.dataset.option)];
        ask.querySelectorAll('[data-option]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        ask.querySelector('small').textContent = note;
        if (ok) { answered.add(step); $('[data-fb=next]').disabled = step === frames.length - 1; sync(); show(step); ask.querySelector('small').textContent = note; }
      }
      else if (b.dataset.fb === 'play') {
        if (playing) stop();
        else { if (step === frames.length - 1) show(0); playing = true; sync(); timer = setTimeout(tick, reduce.matches ? 1200 : 2600); }
      }
      else if (b.dataset.fb === 'next' || b.dataset.fb === 'prev') { stop(); show(step + (b.dataset.fb === 'next' ? 1 : -1), b.dataset.fb === 'next'); }
    });
    show(0);
    return {
      stop,
      context: () => {
        const f = frames[step];
        return ['工作台演示：' + chapter.title, '第 ' + (step + 1) + '/' + frames.length + ' 步：' + f.label,
          f.me ? '我说：' + f.me : '', (f.who || 'AI 助手') + '：' + f.ai, '打开的文件：' + (manual || f.path), f.ask ? '判断题：' + f.ask.q + (answered.has(step) ? '（已答对）' : '（待回答）') : ''].filter(Boolean).join('\n');
      }
    };
  };
})();
