import fs from 'node:fs';
import {fileURLToPath, pathToFileURL} from 'node:url';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');
const html = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export const catalogStyle = read('catalog.css');

const teacherIcon = '<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3.5" width="15" height="10" rx="2"/><path d="M7 16.5h6M10 13.5v3"/></svg>';
const studentIcon = '<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="14" height="9.5" rx="1.8"/><path d="M1.8 16h16.4"/></svg>';
const searchIcon = '<svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="8.8" cy="8.8" r="5.3"/><path d="m13 13 3.8 3.8"/></svg>';

function cleanStage(stage) {
  return String(stage || '').replace(/（[^（）]*）$/, '').trim();
}

function cleanGradeTitle(project) {
  return String(project || '').replace(/（[^（）]*）$/, '').trim();
}

function cleanTopic(chapter) {
  return String(chapter || '').replace(/^第[\d&\-]+章\s*/, '').trim();
}

function renderPillar(raw) {
  const match = String(raw).match(/^(\d+)\s+([^（]+)(?:（(.+)）)?$/);
  if (!match) return '<span class="pillar-chip">' + html(raw) + '</span>';
  const [, num, name, detail] = match;
  return '<span class="pillar-chip"><b>' + html(num) + '</b>' + html(name.trim()) + (detail ? ' · ' + html(detail.trim()) : '') + '</span>';
}

export function renderCatalog({course, framework, grades, gradeMeta, catalog, studios = {}, practicals = {}}) {
  const totalCount = catalog.length;
  const aichatCount = catalog.filter(x => x.platform === 'AIChat').length;
  const paracraftCount = catalog.filter(x => x.platform === 'Paracraft').length;

  let body = '<header class="catalog-hero">'
    + '<div class="hero-copy">'
    + '<p class="hero-eyebrow"><span>中小学人工智能通识课程</span><span class="dot" aria-hidden="true"></span><span>三至九年级 · 全 ' + totalCount + ' 课时</span></p>'
    + '<h1>' + html(course) + '</h1>'
    + '<p class="hero-lead">从认识身边的智能助手，到独立完成智慧校园项目。引导学生在真实情境中说清意图、动手创造作品、用实验核验结果，养成严谨诚实的智能时代素养。</p>'
    + '<div class="hero-pillars" aria-label="课程素养主线">' + framework.mainline.map(renderPillar).join('') + '</div>'
    + '</div>'
    + '<div class="hero-roles" aria-label="双端上课入口说明">'
    + '<div class="role-card is-teacher"><div class="role-icon">' + teacherIcon + '</div><div><div class="role-title">教师大屏<span>普通教室 · 投屏授课</span></div><p>一台电脑即可带动全班提问、预测、实验与讨论，配齐 40 分钟课堂环节与演示引导。</p></div></div>'
    + '<div class="role-card is-student"><div class="role-icon">' + studentIcon + '</div><div><div class="role-title">学生上机<span>机房与平板 · 动手创作</span></div><p>按步骤独立完成提问、搭建与对比验证，在 AIChat 与 Paracraft 中做出可带走的作品。</p></div></div>'
    + '</div>'
    + '</header>';

  body += '<div class="catalog-nav-wrap">'
    + '<div class="catalog-bar">'
    + '<div class="catalog-sticky">'
    + '<nav class="grades" aria-label="年级目录">'
    + grades.map((_, i) => '<a href="#g' + (i + 3) + '"' + (i === 0 ? ' data-active="true"' : '') + '>' + (i + 3) + ' 年级</a>').join('')
    + '</nav>'
    + '</div>'
    + '<div class="bar-controls">'
    + '<div class="env-filter" role="group" aria-label="按工具筛选">'
    + '<button type="button" data-env="all" aria-pressed="true">全部 <em>' + totalCount + '</em></button>'
    + '<button type="button" data-env="AIChat" aria-pressed="false">AIChat <em>' + aichatCount + '</em></button>'
    + '<button type="button" data-env="Paracraft" aria-pressed="false">Paracraft <em>' + paracraftCount + '</em></button>'
    + '</div>'
    + '<label class="search-box">' + searchIcon + '<input type="search" id="catalog-search" placeholder="搜索课题或关键词…" aria-label="搜索课程" autocomplete="off"></label>'
    + '</div>'
    + '</div>'
    + '</div>'
    + '<div class="filter-status" id="filter-status" hidden><span id="filter-count" role="status"></span><button type="button" id="filter-reset">显示全部课程</button></div>';

  for (const [gi, project] of grades.entries()) {
    const g = gi + 3;
    const meta = gradeMeta[gi];
    const stageLabel = cleanStage(meta.stage);
    const gradeTitle = cleanGradeTitle(project);
    const gradeLessons = catalog.filter(x => x.g === g);

    body += '<section id="g' + g + '" class="grade-section" data-grade="' + g + '">'
      + '<div class="grade-head">'
      + '<div class="grade-badge" aria-hidden="true"><strong>' + g + '</strong><span>年级</span></div>'
      + '<div class="grade-info">'
      + '<div class="grade-meta"><span class="stage-pill">' + html(stageLabel) + '</span><span>8 课时 · 4 节 AIChat + 4 节 Paracraft</span></div>'
      + '<h2><span class="sr-only">' + g + ' 年级 · </span>' + html(gradeTitle) + '</h2>'
      + '<p class="grade-focus">' + html(meta.focus) + '</p>'
      + '</div>'
      + '</div>'
      + '<div class="lesson-grid">'
      + gradeLessons.map(x => {
        const id = 'g' + x.g + '-' + String(x.n).padStart(2, '0');
        const brief = practicals[id] ? practicals[id].product+'。'+practicals[id].goal : studios[id]?.brief || x.task;
        const topic = cleanTopic(x.chapter);
        const isParacraft = x.platform === 'Paracraft';
        const envClass = isParacraft ? 'is-paracraft' : 'is-aichat';
        const numLabel = '第 ' + String(x.n).padStart(2, '0') + ' 课';
        const searchText = [g + '年级', stageLabel, gradeTitle, numLabel, topic, x.platform, x.title, brief, x.task].join(' ').toLowerCase();
        return '<article class="lesson-card" data-platform="' + html(x.platform) + '" data-search="' + html(searchText) + '">'
          + '<div>'
          + '<div class="lesson-top">'
          + '<span class="lesson-no">' + numLabel + '</span>'
          + '<span class="lesson-topic">' + html(topic) + '</span>'
          + '<span class="env-badge ' + envClass + '">' + html(x.platform) + '</span>'
          + '</div>'
          + '<h3>' + html(x.title) + '</h3>'
          + '<p class="lesson-desc">' + html(brief) + '</p>'
          + '</div>'
          + '<div class="lesson-actions">'
          + '<a class="entry-link is-teacher" href="' + x.teacher + '">' + teacherIcon + '教师大屏<span aria-hidden="true"> · 带全班讨论</span></a>'
          + '<a class="entry-link is-student" href="' + x.student + '">' + studentIcon + '学生上机<span aria-hidden="true"> · 独立做作品</span></a>'
          + '</div>'
          + '</article>';
      }).join('')
      + '</div>'
      + '</section>';
  }

  body += '<div class="empty-state" id="empty-state" hidden><p>没有找到匹配的课程，试试其他关键词或切换筛选条件。</p><button type="button" id="empty-reset">查看全部 ' + totalCount + ' 节课</button></div>';

  body += '<footer class="catalog-footer">'
    + '<details class="framework-drawer">'
    + '<summary>课程体系架构与课堂使用约定<span>四维八能 · 六大模块 · 五步教学法 · 安全准则</span></summary>'
    + '<div class="framework-body">'
    + '<h3>一、“四维八能”核心素养框架</h3><div class="fw-grid-4">'
    + framework.competencies.map(([name, dim, desc]) => '<div class="fw-card"><small>' + html(dim) + '</small><h4>' + html(name) + '</h4><p>' + html(desc) + '</p></div>').join('')
    + '</div>'
    + '<h3>二、六大课程模块</h3><div class="fw-grid-3">'
    + framework.modules.map(([m, c, l]) => '<div class="fw-card"><h4>' + html(m) + '</h4><p>' + html(c) + '</p><small>支撑素养：' + html(l) + '</small></div>').join('')
    + '</div>'
    + '<h3>三、40 分钟五步教学法与课堂安全准则</h3><div class="fw-grid-2">'
    + '<div class="fw-card"><h4>课堂五步教学法</h4><ol>' + framework.fiveSteps.map(([s, t, d]) => '<li>' + html(s.replace(/^\d+\s*/, '') + '（' + t + '）：' + d) + '</li>').join('') + '</ol></div>'
    + '<div class="fw-card"><h4>AI 使用安全四项准则</h4><ol>' + framework.governance.map(([g, d]) => '<li><strong>' + html(g) + '：</strong>' + html(d) + '</li>').join('') + '</ol></div>'
    + '</div>'
    + '</div>'
    + '</details>'
    + '</footer>';

  const script = `(() => {
  const envButtons = [...document.querySelectorAll('.env-filter [data-env]')];
  const searchInput = document.getElementById('catalog-search');
  const statusBox = document.getElementById('filter-status');
  const statusCount = document.getElementById('filter-count');
  const emptyState = document.getElementById('empty-state');
  const sections = [...document.querySelectorAll('.grade-section')];
  const gradeLinks = [...document.querySelectorAll('.grades a')];
  let activeEnv = 'all';
  let lockUntil = 0;

  function setActiveGrade(hash) {
    for (const link of gradeLinks) {
      const active = link.getAttribute('href') === hash;
      link.dataset.active = String(active);
      if (active && link.parentElement.scrollWidth > link.parentElement.clientWidth) {
        const nav = link.parentElement;
        nav.scrollTo({left: link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2, behavior: 'smooth'});
      }
    }
  }

  function syncActiveFromScroll() {
    if (Date.now() < lockUntil) return;
    const visible = sections.filter(s => !s.hidden);
    if (!visible.length) return;
    let current = visible[0];
    for (const sec of visible) {
      if (sec.getBoundingClientRect().top <= 140) current = sec;
      else break;
    }
    setActiveGrade('#' + current.id);
  }

  function applyFilter() {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const terms = query ? query.split(/\\s+/) : [];
    let visibleTotal = 0;

    for (const sec of sections) {
      let gradeVisible = 0;
      for (const card of sec.querySelectorAll('.lesson-card')) {
        const envMatch = activeEnv === 'all' || card.dataset.platform === activeEnv;
        const hay = card.dataset.search || '';
        const textMatch = !terms.length || terms.every(t => hay.includes(t));
        const show = envMatch && textMatch;
        card.hidden = !show;
        if (show) {
          gradeVisible++;
          visibleTotal++;
        }
      }
      sec.hidden = gradeVisible === 0;
    }

    const filtered = activeEnv !== 'all' || terms.length > 0;
    statusBox.hidden = !filtered || visibleTotal === 0;
    if (!statusBox.hidden) {
      const envLabel = activeEnv === 'all' ? '' : activeEnv + ' · ';
      statusCount.textContent = envLabel + '共找到 ' + visibleTotal + ' 节课程';
    }
    emptyState.hidden = visibleTotal > 0;
    syncActiveFromScroll();
  }

  function resetFilter() {
    activeEnv = 'all';
    for (const b of envButtons) b.setAttribute('aria-pressed', String(b.dataset.env === 'all'));
    if (searchInput) searchInput.value = '';
    applyFilter();
  }

  for (const btn of envButtons) {
    btn.addEventListener('click', () => {
      activeEnv = btn.dataset.env;
      for (const b of envButtons) b.setAttribute('aria-pressed', String(b === btn));
      applyFilter();
    });
  }

  searchInput?.addEventListener('input', applyFilter);
  searchInput?.addEventListener('keydown', e => {
    if (e.key === 'Escape' && searchInput.value) {
      searchInput.value = '';
      applyFilter();
    }
  });
  document.getElementById('filter-reset')?.addEventListener('click', resetFilter);
  document.getElementById('empty-reset')?.addEventListener('click', resetFilter);

  for (const link of gradeLinks) {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target?.hidden) resetFilter();
      lockUntil = Date.now() + 900;
      setActiveGrade('#' + targetId);
    });
  }

  if (/^#g[3-9]$/.test(location.hash)) {
    lockUntil = Date.now() + 900;
    setActiveGrade(location.hash);
  }
  addEventListener('hashchange', () => {
    if (/^#g[3-9]$/.test(location.hash)) {
      lockUntil = Date.now() + 900;
      setActiveGrade(location.hash);
    }
  });

  addEventListener('scroll', syncActiveFromScroll, {passive: true});
})();`;

  return {body, script};
}

function loadAvailableStudios() {
  const dir = new URL('./studios/', import.meta.url);
  if (!fs.existsSync(dir)) return {};
  const files = fs.readdirSync(dir).filter(f => /^batch\d+\.json$/.test(f)).sort();
  return Object.assign({}, ...files.map(f => JSON.parse(fs.readFileSync(new URL(f, dir), 'utf8'))));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const course = '超级学生AI通识课';
  const {framework, grades, gradeMeta, lessons, samples} = JSON.parse(read('curriculum.json'));
  const catalog = lessons.map(([p, title, task], i) => {
    const g = 3 + Math.floor(i / 8), n = i % 8 + 1;
    const prefix = 'g' + g + '-' + String(n).padStart(2, '0');
    return {
      idx: i, g, n,
      chapter: gradeMeta[g - 3].chapters[n - 1] || ('第' + n + '章'),
      title,
      platform: p === 'P' ? 'Paracraft' : 'AIChat',
      sample: Boolean(samples[i]),
      task,
      teacher: prefix + '-teacher/index.html',
      student: prefix + '-student/index.html'
    };
  });
  const home = renderCatalog({course, framework, grades, gradeMeta, catalog, studios: loadAvailableStudios(), practicals:(await import('./practical-page.mjs')).practicals});
  const script = home.script + `
(() => {
    if (parent === window) return;
    function reportPage() {
      const grade = /^#g[3-9]$/.test(location.hash) ? location.hash : '';
      const page = "index.html" + grade;
      parent.postMessage({channel:'aichat.external-tool.v1', type:'tool:director-page', page}, '*');
    }
    addEventListener('pageshow', reportPage);
    addEventListener('hashchange', reportPage);
    reportPage();
  })();`;
  const out = '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + html(course) + '</title><style>' + catalogStyle + '</style><main>' + home.body + '</main><script>' + script + '</script></html>';
  fs.writeFileSync(fileURLToPath(new URL('../index.html', import.meta.url)), out.replace(/[ \t]+$/gm, ''));
}
