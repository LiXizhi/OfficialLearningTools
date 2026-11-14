/* 课程路由、目录弹窗、共享无障碍 UI 组件（Tabs / CopyButton / Checkpoint）与宿主上下文摘要 */
(() => {
  const STORE_KEY = 'super-individual.lessons.v2';

  const lessonsMeta = [
    {
      id: 1,
      short: '理念',
      title: '第 1 课 · 理念与现场一天',
      time: '约 20 分钟',
      accent: '#4c7a3f',
      tint: '#e9f3e2',
      summary: '先看 4 位角色的六幕工作现场，再理解“碳基 + 硅基”、一人多分身与 3+1 成长路径。',
      tags: ['六幕现场', '一人多分身', '3+1 阶段']
    },
    {
      id: 2,
      short: '建脑',
      title: '第 2 课 · 第二大脑与建脑循环',
      time: '约 20 分钟',
      accent: '#4f46e5',
      tint: '#eef0fb',
      summary: '拆解 Git + Markdown 真实目录，对比纯向量 RAG，掌握 Ingest / Query / Lint / RSI 与两条建脑路。',
      tags: ['Git+Markdown', 'Wiki vs RAG', '四模块循环']
    },
    {
      id: 3,
      short: '上手',
      title: '第 3 课 · 工作台与四步任务卡',
      time: '约 25 分钟',
      accent: '#0f766e',
      tint: '#e6f5f2',
      summary: '回放 KeepWork AIChat 7 步实战，再按 4 步填写任务卡并导出 .txt / 第二大脑 .md 启动包。',
      tags: ['AIChat 回放', '四步任务卡', '导出 .md']
    },
    {
      id: 4,
      short: '组织',
      title: '第 4 课 · 超级组织与六问诊断',
      time: '约 20 分钟',
      accent: '#b45309',
      tint: '#fdf3e7',
      summary: '从个体到圈子组织、跨组织分身与 CAIO / FDE 交付路径，并用“首次诊断六问”生成试点卡。',
      tags: ['圈子组织', 'CAIO / FDE', '首次诊断六问']
    }
  ];

  const copyTimers = new WeakMap();

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v === undefined || v === null) continue;
      if (k === 'className') node.className = v;
      else if (k === 'textContent') node.textContent = v;
      else if (k === 'innerHTML') node.innerHTML = v;
      else if (k in node && k !== 'list' && typeof v === 'boolean') node[k] = v;
      else node.setAttribute(k, String(v));
    }
    for (const child of Array.isArray(children) ? children : [children]) {
      if (child === null || child === undefined) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  function initTablist(tablistEl, getPanels, onSelect) {
    if (!tablistEl) return { activate() {} };
    const tabs = Array.from(tablistEl.querySelectorAll('[role="tab"]'));
    const resolvePanels = () => {
      if (typeof getPanels === 'function') return getPanels();
      return tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
    };

    const activate = (idx, focusTab = false) => {
      const panels = resolvePanels();
      const target = Math.max(0, Math.min(idx, tabs.length - 1));
      tabs.forEach((tab, i) => {
        const active = i === target;
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        tab.setAttribute('tabindex', active ? '0' : '-1');
        if (panels[i]) panels[i].hidden = !active;
      });
      if (focusTab && tabs[target]) tabs[target].focus();
      onSelect?.(target, tabs[target], panels[target]);
    };

    tablistEl.addEventListener('click', (event) => {
      const tab = event.target.closest('[role="tab"]');
      if (!tab) return;
      const idx = tabs.indexOf(tab);
      if (idx >= 0) activate(idx, false);
    });

    tablistEl.addEventListener('keydown', (event) => {
      const tab = event.target.closest('[role="tab"]');
      if (!tab) return;
      const idx = tabs.indexOf(tab);
      if (idx < 0) return;
      let next = -1;
      if (event.key === 'ArrowRight') next = (idx + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      if (next >= 0) {
        event.preventDefault();
        activate(next, true);
      }
    });

    activate(0, false);
    return { activate, tabs };
  }

  async function writeClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch { /* fallback below */ }
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return Boolean(ok);
    } catch {
      return false;
    }
  }

  function bindCopyButton(btn, getText, statusEl, defaultLabel) {
    if (!btn) return;
    const baseText = defaultLabel || btn.textContent.trim();
    btn.addEventListener('click', async () => {
      const text = typeof getText === 'function' ? getText() : String(getText || '');
      if (!text) return;
      const ok = await writeClipboard(text);
      const prevTimer = copyTimers.get(btn);
      if (prevTimer) window.clearTimeout(prevTimer);

      if (ok) {
        btn.dataset.copied = 'true';
        btn.textContent = '已复制 ✓';
        if (statusEl) statusEl.textContent = '已复制到剪贴板，可直接粘贴使用。';
      } else {
        btn.textContent = '请手动全选下方内容复制';
        if (statusEl) statusEl.textContent = '当前环境禁止剪贴板写入，可直接使用下载或框选复制。';
      }

      const t = window.setTimeout(() => {
        delete btn.dataset.copied;
        btn.textContent = baseText;
      }, 2200);
      copyTimers.set(btn, t);
    });
  }

  function createCheckpointCard({ title, prompt, options, correct, explain }) {
    const card = el('section', { className: 'checkpoint-card', 'aria-label': title || '本课自检' });
    card.appendChild(el('h3', { textContent: title || '本课 1 分钟自检' }));
    card.appendChild(el('p', { className: 'cp-prompt', textContent: prompt }));
    const optWrap = el('div', { className: 'cp-options' });
    const fb = el('p', { className: 'cp-fb', 'aria-live': 'polite' });

    options.forEach((optText, idx) => {
      const b = el('button', { type: 'button', textContent: optText, 'aria-pressed': 'false' });
      b.addEventListener('click', () => {
        optWrap.querySelectorAll('button').forEach((other, oi) => {
          other.setAttribute('aria-pressed', oi === idx ? 'true' : 'false');
          other.classList.remove('is-right', 'is-wrong');
          if (oi === idx) other.classList.add(idx === correct ? 'is-right' : 'is-wrong');
        });
        const isRight = idx === correct;
        fb.className = `cp-fb ${isRight ? 'ok' : 'no'}`;
        fb.textContent = `${isRight ? '理解准确：' : '再想一下：'}${explain}`;
      });
      optWrap.appendChild(b);
    });

    card.appendChild(optWrap);
    card.appendChild(fb);
    return card;
  }

  window.CourseUI = { el, initTablist, bindCopyButton, createCheckpointCard };

  function setHash(hash) {
    try {
      history.replaceState(null, '', hash);
    } catch { /* ignore restricted history frames */ }
  }

  function lessonForHash(raw) {
    const h = (raw || '').replace(/^#/, '').trim();
    if (!h || h === 'lesson-1' || h === 'day' || h === 'theater' || h === 'idea' || h === 'idea-individual') {
      return { lesson: 1, anchor: h && h !== 'lesson-1' ? h : null };
    }
    if (h === 'lesson-2' || h === 'idea-brain') {
      return { lesson: 2, anchor: h === 'idea-brain' ? h : null };
    }
    if (h === 'lesson-3' || h === 'sim' || h === 'practice') {
      return { lesson: 3, anchor: h !== 'lesson-3' ? h : null };
    }
    if (h === 'lesson-4' || h === 'org') {
      return { lesson: 4, anchor: h === 'org' ? h : null };
    }
    return { lesson: 1, anchor: null };
  }

  function loadProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return {
        last: Number(parsed.last) >= 1 && Number(parsed.last) <= 4 ? Number(parsed.last) : 1,
        visited: Array.isArray(parsed.visited) ? parsed.visited.filter((x) => x >= 1 && x <= 4) : [1]
      };
    } catch {
      return { last: 1, visited: [1] };
    }
  }

  function saveProgress(state) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch { /* ignore private mode quota */ }
  }

  const state = loadProgress();
  if (!state.visited.includes(1)) state.visited.push(1);
  let activeLesson = 1;

  const syllabusPop = document.getElementById('syllabus-pop');
  const syllabusBody = document.getElementById('syllabus-pop-body');
  const courseCards = document.getElementById('course-cards');
  const navProgress = document.getElementById('nav-progress');
  const resumeBanner = document.getElementById('resume-banner');
  const resumeText = document.getElementById('resume-text');
  const resumeGo = document.getElementById('resume-go');
  const resumeDismiss = document.getElementById('resume-dismiss');

  function renderCourseNavigation() {
    if (courseCards) {
      courseCards.innerHTML = '';
      lessonsMeta.forEach((m) => {
        const card = el('button', {
          type: 'button',
          className: `course-card${activeLesson === m.id ? ' current' : ''}${state.visited.includes(m.id) ? ' visited' : ''}`,
          style: `--card-accent:${m.accent};--card-tint:${m.tint}`
        });
        card.innerHTML = `
          <span class="cc-done">已学过</span>
          <div class="cc-top">
            <span class="cc-num">${m.id}</span>
            <span class="cc-time">${m.time}</span>
          </div>
          <h3>${m.title}</h3>
          <p>${m.summary}</p>
          <div class="cc-tags">${m.tags.map((t) => `<span>${t}</span>`).join('')}</div>
          <span class="cc-go">${activeLesson === m.id ? '正在学习' : '进入这一课 →'}</span>`;
        card.addEventListener('click', () => openCourseLesson(m.id));
        courseCards.appendChild(card);
      });
    }

    if (syllabusBody) {
      syllabusBody.innerHTML = '';
      lessonsMeta.forEach((m) => {
        const item = el('button', {
          type: 'button',
          className: 'syllabus-pop-item',
          ...(activeLesson === m.id ? { 'aria-current': 'page' } : {})
        });
        item.innerHTML = `<b>${m.id}</b><div><span>${m.title}</span><small>${m.time} · ${m.tags.join(' / ')}</small></div>`;
        item.addEventListener('click', () => {
          if (syllabusPop) syllabusPop.open = false;
          openCourseLesson(m.id);
        });
        syllabusBody.appendChild(item);
      });
    }
  }

  function openCourseLesson(n, anchorId = null, opts = {}) {
    const targetNum = Math.max(1, Math.min(4, Number(n) || 1));
    activeLesson = targetNum;
    if (!state.visited.includes(targetNum)) state.visited.push(targetNum);
    state.last = targetNum;
    saveProgress(state);

    document.querySelectorAll('.lesson').forEach((sec, idx) => {
      sec.hidden = idx + 1 !== targetNum;
    });
    document.querySelectorAll('.lesson-nav a').forEach((a) => {
      const lid = Number(a.dataset.lesson);
      a.classList.toggle('active', lid === targetNum);
      a.classList.toggle('visited', state.visited.includes(lid));
      if (lid === targetNum) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (navProgress) navProgress.textContent = `${targetNum}/4`;
    renderCourseNavigation();

    if (!opts.skipHash) {
      setHash(anchorId ? `#${anchorId}` : `#lesson-${targetNum}`);
    }

    if (!opts.skipScroll) {
      const scrollTarget = anchorId ? document.getElementById(anchorId) : document.getElementById(`lesson-${targetNum}`);
      scrollTarget?.scrollIntoView?.({ behavior: 'auto', block: 'start' });
    }

    window.dispatchEvent(new CustomEvent('courselessonchange', { detail: { lesson: targetNum, anchorId } }));
  }

  window.openCourseLesson = openCourseLesson;

  window.buildCourseToolContext = () => {
    const roleKey = window.getCourseRole?.() || 'student';
    const d = typeof dayRoles !== 'undefined' ? dayRoles[roleKey] : null;
    const meta = lessonsMeta.find((m) => m.id === activeLesson) || lessonsMeta[0];
    const practice = window.getActivePracticeSummary?.() || '';
    const lines = [
      `课程：超级个体培训课（当前所在：${meta.title}）`,
      `当前视角：${d ? `${d.label}（${d.task}）` : roleKey}`,
      `已访问课时：${state.visited.sort().join(', ')} / 4`,
      d ? `关键约束规则：${d.rule}` : '',
      practice ? `\n当前任务卡摘要：\n${practice}` : ''
    ].filter(Boolean).join('\n');
    return lines.slice(0, 8000);
  };

  document.querySelector('.lesson-nav')?.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-lesson]');
    if (!link) return;
    event.preventDefault();
    openCourseLesson(Number(link.dataset.lesson));
  });

  document.addEventListener('click', (event) => {
    const pagerBtn = event.target.closest('[data-go-lesson]');
    if (pagerBtn) {
      const target = Number(pagerBtn.dataset.goLesson);
      if (target >= 1 && target <= 4) openCourseLesson(target);
      return;
    }
    if (syllabusPop?.open && !syllabusPop.contains(event.target)) {
      syllabusPop.open = false;
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && syllabusPop?.open) syllabusPop.open = false;
  });

  document.querySelector('.role-lens')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-course-role]');
    if (!btn) return;
    window.setCourseRole?.(btn.dataset.courseRole, 'header');
  });

  document.getElementById('hero-watch')?.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('day')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('hero-try')?.addEventListener('click', (event) => {
    event.preventDefault();
    openCourseLesson(3, 'practice');
  });

  // 初始路由策略：无 hash 时始终默认显示第 1 课，避免隐藏 #day；若有历史进度则提示恢复条
  const initialHash = location.hash;
  if (initialHash) {
    const target = lessonForHash(initialHash);
    openCourseLesson(target.lesson, target.anchor, { skipScroll: !target.anchor, skipHash: true });
  } else {
    const savedLast = state.last;
    openCourseLesson(1, null, { skipScroll: true, skipHash: true });
    if (savedLast > 1 && resumeBanner && resumeText) {
      const savedMeta = lessonsMeta.find((m) => m.id === savedLast);
      resumeText.textContent = `欢迎回来：你上次学到「${savedMeta?.title || `第 ${savedLast} 课`}」。`;
      resumeBanner.hidden = false;
      resumeGo?.addEventListener('click', () => {
        resumeBanner.hidden = true;
        openCourseLesson(savedLast);
      });
      resumeDismiss?.addEventListener('click', () => {
        resumeBanner.hidden = true;
      });
    }
  }

  window.addEventListener('hashchange', () => {
    const target = lessonForHash(location.hash);
    openCourseLesson(target.lesson, target.anchor, { skipHash: true });
  });
})();
