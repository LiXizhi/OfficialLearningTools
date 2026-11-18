(() => {
  const courses = window.brainCourses;
  const root = document.querySelector('#main');
  const switchRole = document.querySelector('#switch-role');
  const prefix = 'super-individual.course.v4.';
  const channel = 'aichat.external-tool.v1';
  const embedded = parent !== window && /^https?:$/.test(location.protocol);
  const pending = new Map();
  const records = new Map();
  const drafts = new Map();
  let requestNumber = 0;
  let role = '', page = 0, requested = 0, scene, storageReady = false;
  let chapter = 0, destination = 'intro';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const get = key => records.get(role + '.' + key);
  const warn = () => { document.querySelector('#storage-status').textContent = '本次仍可练习。进度暂时只保留在当前页面。'; };
  function send(type, detail = {}) {
    if (embedded) parent.postMessage({channel, type, ...detail}, location.origin);
  }
  function cacheRequest(type, detail) {
    return new Promise(resolve => {
      const requestId = 'brain-course-' + (++requestNumber);
      const finish = reply => { clearTimeout(timer); pending.delete(requestId); resolve(reply); };
      const timer = setTimeout(() => finish(null), 1600);
      pending.set(requestId, finish);
      send(type, {requestId, ...detail});
    });
  }
  function keys() {
    return ['foundation.done', ...Object.keys(courses).flatMap(id => ['last','variant', ...[1,2,3,4].flatMap(n => ['seen.' + n,'done.' + n])].map(key => id + '.' + key))];
  }
  async function loadProgress() {
    try {
      if (embedded) {
        const reply = await cacheRequest('tool:cache:get', {key:prefix});
        if (!reply?.ok) throw Error();
        const allowed = keys();
        for (const [key, value] of Object.entries(reply.value || {})) if (allowed.includes(key)) records.set(key, value);
      } else {
        for (const key of keys()) {
          const value = localStorage.getItem(prefix + key);
          if (value !== null) records.set(key, value);
        }
      }
      storageReady = true;
    } catch { warn(); }
  }
  function set(key, value, owner = role) {
    const path = owner + '.' + key;
    if (records.get(path) === value) return;
    records.set(path, value);
    if (!storageReady) return;
    if (embedded) {
      cacheRequest('tool:cache:set', {key:prefix + path, value}).then(reply => { if (!reply?.ok) warn(); });
    } else {
      try { localStorage.setItem(prefix + path, value); } catch { warn(); }
    }
  }
  const pageName = n => n === 5 ? 'finish' : 'lesson-' + n;
  const foundationRoute = (n, after) => 'foundation/' + n + (after === 'intro' ? '' : '/' + after);
  function move(hash) {
    try { history.replaceState(null, '', '#' + hash); } catch { /* 沙箱由外层保留地址。 */ }
    send('tool:course-page', {page:hash});
    display(hash);
    root.querySelector('h1')?.focus({preventScroll:true});
    window.scrollTo(0,0);
  }
  function display(hash) {
    scene?.stop();
    scene = null;
    const shared = /^foundation(?:\/([1-4])(?:\/(.+))?)?$/.exec(hash);
    const target = shared ? shared[2] : hash;
    const match = /^(?:(student|teacher|enterprise)\/)?(lesson-([1-4])|finish)$/.exec(target || '');
    destination = match ? match[0] : 'intro';
    chapter = shared ? Number(shared[1] || 1) : match && records.get('foundation.done') !== '1' ? 1 : 0;
    if (chapter) {
      role = ''; page = 0; requested = 0;
      switchRole.hidden = true;
      renderFoundation();
      document.title = window.brainFoundation[chapter-1].title + ' · 共享通识';
      window.dispatchEvent(new CustomEvent('coursepagechange',{detail:{page,chapter}}));
      return;
    }
    role = match?.[1] || '';
    requested = match ? Number(match[3] || 5) : 0;
    page = role ? requested : 0;
    switchRole.hidden = !role;
    if (role) {
      set('last', String(page));
      renderCourse();
    } else {
      root.innerHTML = `<section class="choose"><p class="meta">用第二大脑成为超级个体</p>
        <h1 tabindex="-1">你想用第二大脑解决哪类问题？</h1>
        <a class="foundation-card" href="#${foundationRoute(1,destination)}" data-review>
          <div><span class="meta">三种身份共同的第一课</span><h2>共享通识课</h2>
          <p>什么是第二大脑？跟着校园科学展，看一份彩排记录怎样变成分身能引用、同伴能接手的知识。</p>
          <span class="foundation-cta">${records.get('foundation.done') === '1' ? '重看共享通识' : '开始共享通识'} →</span></div>
          <img src="assets/films/exhibit-4.jpg" alt="科学展上，小禾准备把机器人展台交给下一班同学。"></a>
        <h2 class="track-heading">选择你的实操课</h2>
        <div class="tracks">${Object.entries(courses).map(([id,c]) => {
          const last = Number(records.get(id + '.last'));
          const action = requested === 5 ? '查看结课作品' : requested ? '进入第 ' + requested + ' 课' : last === 5 ? '继续看结课作品' : last ? '继续第 ' + last + ' 课' : '开始第一课';
          return `<button class="track" data-role="${id}"><img src="assets/${c.image}" alt=""><span class="track-body"><strong>我是${c.label}</strong><small>${c.takeaway}</small><span class="action">${action} →</span></span></button>`;
        }).join('')}</div></section>`;
    }
    document.title = (role ? courses[role].label + ' · ' + (page === 5 ? '结课作品' : courses[role].lessons[page-1].title) : '用第二大脑成为超级个体') + ' · 超级个体培训课';
    window.dispatchEvent(new CustomEvent('coursepagechange', {detail:{role, page}}));
  }
  function renderFoundation() {
    const chapters = window.brainFoundation;
    const lesson = chapters[chapter-1];
    root.innerHTML = `<article class="foundation">
      <nav class="lessons" aria-label="共享通识章节">${chapters.map((c,i) =>
        `<a data-chapter="${i+1}" href="#${foundationRoute(i+1,destination)}" ${i+1===chapter?'aria-current="page"':''}>${c.name}</a>`).join('')}</nav>
      <header class="foundation-head"><p class="meta">共享通识 · ${chapter} / ${chapters.length}</p><h1 tabindex="-1">${lesson.title}</h1></header>
      <figure class="exhibit-film">
        <figcaption><span>${lesson.place}</span><strong>${lesson.filmTitle}</strong>
          <p class="film-setup">${lesson.story}</p><p class="film-watch">${lesson.watch}</p></figcaption>
        <div class="film-frame">
          <video playsinline preload="metadata" poster="assets/films/exhibit-${chapter}.jpg" src="assets/films/exhibit-${chapter}.mp4"></video>
          <img data-still src="assets/films/exhibit-${chapter}.jpg" alt="${lesson.filmAlt}">
        </div>
        <div class="film-controls" role="group" aria-label="短片播放">
          <button type="button" data-play>播放短片</button><button type="button" data-prev>上一幕</button><button type="button" data-next>下一幕</button>
          <button type="button" data-mute aria-label="播放普通话旁白">旁白开</button>
        </div>
        <div class="film-notes"><div aria-live="polite" aria-atomic="true"><b data-phase></b><p data-voice></p></div>
          <div class="film-record"><small data-record-title></small><strong data-current></strong><span data-previous hidden></span></div>
        </div><p data-video-status role="status"></p>
      </figure>
      <div class="foundation-grid"><section class="panel foundation-reading"><h2>${lesson.idea}</h2><p>${lesson.concept}</p><img src="assets/${lesson.image}" alt="${lesson.alt}" loading="lazy"></section>
      <section class="panel foundation-activity"><h2>${lesson.activityTitle}</h2>
        ${lesson.activity}</section></div>
      <section class="reflection"><h2>轮到你判断</h2><p>${lesson.question}</p></section>
      <nav class="pager" aria-label="通识翻页">${chapter>1?`<button data-chapter="${chapter-1}">← 上一节</button>`:''}
      ${chapter<chapters.length?`<button class="primary" data-chapter="${chapter+1}">下一节 · ${chapters[chapter].name} →</button>`:
        `<button class="primary" id="finish-foundation">${destination.includes('/')?'进入身份课':'继续选择身份'} →</button>`}</nav></article>`;
    scene = window.createFoundationPlayer(root.querySelector('.exhibit-film'),lesson,chapter);
  }
  function link(n, label, cls = '') {
    return `<a class="${cls}" data-go="${n}" href="#${role}/${pageName(n)}" ${n === page ? 'aria-current="page"' : ''}>${label}</a>`;
  }
  const nav = () => `<nav class="lessons" aria-label="课程导航"><a href="#${foundationRoute(1,destination)}" data-review>共享通识</a>${[1,2,3,4].map(n => link(n,'第' + n + '课' + (get('done.'+n) === '1' ? ' ✓' : ''))).join('')}${link(5,'结课作品')}</nav>`;
  const variant = () => get('variant') === 'manager' ? 'manager' : 'employee';
  const draftingKey = id => [role,page,variant(),id].join('/');
  function promptBox(id, label, value) {
    return `<div class="practice"><label for="${id}">${label}</label><textarea id="${id}" rows="4">${escape(drafts.get(draftingKey(id)) ?? value)}</textarea>
      <div class="actions"><button class="copy" data-for="${id}">复制话术</button><span class="copy-tip" role="status"></span></div></div>`;
  }
  const savePrompt = (c,l) => `${l.practice}请先确认第二大脑已连接；如果还未连接，请一步一步带我设置。把下面的材料保存到我的第二大脑“课程练习”目录，文件名用《${c.source}》。保留原文，已有同名文件时先问我。写好后告诉我实际文件位置，方便我打开核对。\n\n${c.material}`;
  function renderCourse() {
    const c = courses[role];
    if (page === 5) {
      root.innerHTML = nav() + `<section class="titleband"><p class="meta">${c.label} · 结课作品</p><h1 tabindex="-1">${c.work}</h1>
        <p>打开第二大脑里的最终作品，选一处改动，向同伴解释你依据了什么。</p></section>
        <section class="panel practice"><h2>我的实操记录</h2><ol class="steps">${c.lessons.map((l,i) => `<li>${link(i+1,l.title)} · ${get('done.'+(i+1)) === '1' ? '已自评完成实操' : '待实操自评'}</li>`).join('')}</ol></section>`;
      return;
    }
    const l = c.lessons[page-1], first = page === 1;
    const path = l.variants ? l.variants[variant()] : null;
    const task = l.task;
    root.innerHTML = nav() + `<header class="titleband"><p class="meta">${c.label} · 第 ${page} 课${first ? ' · 25 分钟' : ''}</p>
      <h1 tabindex="-1">${l.title}</h1><p>${first ? c.question : task}</p></header>
      <div class="grid"><div class="stack"><section class="panel"><h2>${first ? '这次要存下的材料' : '这次练什么'}</h2>
      <p class="muted">虚构练习材料，也可换成你适合使用的资料。</p><blockquote>${l.material || c.material}</blockquote>
      <details class="demo" ${first ? 'open' : ''}><summary>${first ? '5 分钟 · 看一遍原卡怎样派上用场' : '看一个示范'}</summary>
      <div id="scene"></div><label class="check"><input type="checkbox" data-check="seen" ${get('seen.'+page)==='1'?'checked':''}>我看过示范</label></details></section>
      <section class="panel"><h2>${first ? '10 分钟 · 存下并打开原件' : '动手做'}</h2>
      ${first ? '<ol class="steps"><li>打开 AIChat 左侧「第二大脑」。已有大脑就进入，首次使用按向导选一个练习文件夹，完成创建或连接。</li><li>在绑定这个大脑的会话里，把材料改成自己的表达，再复制、粘贴并发送。</li><li>在文件栏打开 AI 给出的原文件，核对标题和原话。</li></ol>' : '<p>'+task+'</p>'}
      ${l.variants ? `<fieldset><legend>选择本课交付物</legend>${Object.entries(l.variants).map(([id,v]) => `<label><input type="radio" name="variant" value="${id}" ${variant()===id?'checked':''}>${id==='manager'?'管理者':'员工'} · ${v[0]}</label>`).join('')}</fieldset>` : ''}
      ${promptBox('practice',first?'按自己的情况修改后发送':'可修改的练习话术',(first ? savePrompt(c,l) : (path?.[1] || l.practice) + (page===2 ? '\n\n补充材料：'+l.material : '')) + '\n\n' + l.method)}
      </section>
      ${first ? `<section class="panel"><h2>7 分钟 · 换一个新对话找回来</h2><p>在同一个第二大脑里新建对话，只发下面的问题。找到后打开原文件，核对回答里的原话。</p>
        ${promptBox('retrieve','给新对话的问题',c.retrieve)}<p><b>现在自己试一次。</b>${task}</p>
        <details><summary>找不到原件怎么办？</summary><p>确认新对话绑定的是同一个第二大脑。在文件栏查看刚才保存的位置，再用标题或两个关键词查找。如果设备还没连通，可以继续看示范，接通后再回来实操。</p></details></section>` : ''}
      </div><aside class="stack"><section class="panel"><p class="meta">${c.goal}</p><h2>${first ? '3 分钟 · 收起提示演示' : '用作品自评'}</h2>
      <p>${l.evidence}</p>${first ? '<button id="hide-hints" aria-expanded="true" aria-controls="lesson-guide">收起提示，自己试一次</button>' : ''}<label class="check"><input type="checkbox" data-check="done" ${get('done.'+page)==='1'?'checked':''}>我已完成实操，能展示作品</label></section>
      <section class="panel"><h3>到 AIChat 继续练习</h3><p>${embedded ? '课程悬浮时，在主聊天中粘贴修改好的话术，由你发送。' : '保留这个课件，在 AIChat 中完成保存、查找和核对。'}</p>
      <a class="button" target="_blank" rel="noopener noreferrer" href="https://keepwork.com/chat">打开 AIChat ↗</a></section></aside></div>
      <nav class="pager">${page===1 ? '<a class="button" href="#intro">选择身份</a>' : link(page-1,'← 上一课','button')}${link(page+1,page===4?'查看结课作品 →':'下一课 →','button primary')}</nav>`;
    const beats = first ? [
      {cap:c.question, hl:'main', msgs:[{u:c.question}]},
      {cap:'第一次对话：把材料和自己的想法写入文件，再打开核对。', hl:'panel', msgs:[{u:'请把这份材料存进我的第二大脑，告诉我原文件的位置。'}], panel:{type:'files',title:'第二大脑 · 课程练习',items:[c.source+'.md']}},
      {cap:'第二次对话：换个说法找回昨天的记录。', fresh:true, hl:'side', msgs:[{u:c.retrieve}]},
      {cap:'打开找回的文件，核对原文。',hl:'panel',panel:{type:'files',title:'第二大脑 · 课程练习',items:[c.source+'.md']}},
      {cap:c.demoResult, hl:'main', msgs:[{a:c.demoResult,cite:c.source}]}
    ] : [
      {cap:task,hl:'main',msgs:[{u:task}]},
      {cap:l.example,hl:'panel',msgs:[{a:l.example}],panel:{type:'files',title:'本课所用记录',items:[c.source+'.md']}}
    ];
    const player = window.createScene(document.querySelector('#scene'));
    scene = player;
    const demo = root.querySelector('.demo');
    const hints = root.querySelector('#hide-hints');
    if (hints) {
      const guide = root.querySelector('.grid > .stack');
      guide.id = 'lesson-guide';
      hints.addEventListener('click', () => {
        guide.hidden = !guide.hidden;
        hints.setAttribute('aria-expanded', String(!guide.hidden));
        hints.textContent = guide.hidden ? '再看提示' : '收起提示，自己试一次';
        if (guide.hidden) player.stop();
      });
    }
    const playDemo = () => player.load({beats},{persona:c.label,autoplay:demo.open});
    playDemo();
    demo.addEventListener('toggle', () => {
      if (demo.open && demo.isConnected) playDemo();
      else player.stop();
    });
  }
  window.buildCourseToolContext = () => {
    if (chapter) {
      const l = window.brainFoundation[chapter-1];
      return ['课程：用第二大脑成为超级个体 · 共享通识。当前章节：'+l.title, l.place, l.story, l.watch, l.concept,
        '当前动画画面：'+root.querySelector('[data-phase]').textContent+'。'+root.querySelector('[data-current]').textContent+' '+root.querySelector('.exhibit-film video').getAttribute('aria-label'),
        '本幕旁白：'+root.querySelector('[data-voice]').textContent,root.querySelector('.foundation-activity')?.textContent.trim(), '讨论题：'+l.question,
        '这是虚构的科学展案例。请引导学员依据原件说明判断，区分今天能做的练习与对未来工作的设想。'].join('\n');
    }
    if (!role) return '课程：用第二大脑成为超级个体。学员正在选择学生、学校老师或 IT 企业员工或管理者身份。';
    const c = courses[role], l = c.lessons[page-1];
    if (!l) return `课程：用第二大脑成为超级个体。身份：${c.label}。结课作品：${c.work}。请学员展示一次有依据的修订。`;
    return [`课程：用第二大脑成为超级个体。身份：${c.label}。第 ${page} 课：${l.title}。`,
      '当前任务：'+l.task, '通识方法的应用：'+l.method, l.variants ? '交付物：'+l.variants[variant()][0] : '', '实操验收：'+l.evidence,
      '请一次引导一步。找回资料时要实际查阅学员第二大脑里的原件并给出位置，再请学员自己用它完成任务。'].filter(Boolean).join('\n');
  };
  async function copy(button) {
    const field = document.getElementById(button.dataset.for);
    const status = button.nextElementSibling;
    if (!field.value.trim()) { status.textContent = '先写下练习话术。'; return; }
    let copied = false, timer;
    try {
      await Promise.race([navigator.clipboard.writeText(field.value),new Promise((_,reject) => {timer=setTimeout(reject,1200);})]);
      copied = true;
    } catch {
      field.focus(); field.select();
      try { copied = document.execCommand('copy'); } catch { /* 保留选择供手动复制。 */ }
    } finally { clearTimeout(timer); }
    status.textContent = copied ? '已复制，粘贴到 AIChat 后发送。' : '已选中文字，请用系统复制或 Ctrl+C。';
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('a,button');
    if (!target) return;
    if (target.dataset.chapter || target.hasAttribute('data-review')) {
      event.preventDefault(); move(foundationRoute(Number(target.dataset.chapter || 1),destination));
    } else if (target.id === 'finish-foundation') {
      set('done','1','foundation'); move(destination);
    } else if (target.dataset.verdict) {
      const accurate = target.dataset.verdict === 'scoped';
      root.querySelectorAll('[data-verdict]').forEach(b => b.setAttribute('aria-pressed',String(b===target)));
      document.getElementById('source-feedback').textContent = accurate
        ? '证据范围对上了。B 验证了录像；A 记录了控制台重启要登录。把这两个条件分别链接到原件，留下一项复测。'
        : '再看原件 B 的最后一句：当天启动过控制台吗？日期更新了，接受测试的对象也变了。';
    } else if (target.dataset.role) {
      const id = target.dataset.role;
      const last = Number(records.get(id+'.last'));
      move(id+'/'+pageName(requested || (last>=1 && last<=5 ? last : 1)));
    } else if (target.id === 'switch-role' || target.getAttribute('href') === '#intro') {
      event.preventDefault(); move('intro');
    } else if (target.dataset.go) {
      event.preventDefault(); move(role+'/'+pageName(Number(target.dataset.go)));
    } else if (target.classList.contains('copy')) void copy(target);
  });
  root.addEventListener('input', event => {
    if (event.target.tagName === 'TEXTAREA') drafts.set(draftingKey(event.target.id),event.target.value);
  });
  root.addEventListener('change', ({target}) => {
    if (target.dataset.check) {
      set(target.dataset.check+'.'+page,target.checked?'1':'0');
      if (target.dataset.check==='done') root.querySelector('nav.lessons').outerHTML=nav();
    } else if (target.name==='variant') {
      set('variant',target.value);
      scene?.stop(); renderCourse();
      root.querySelector('input[name=variant]:checked').focus();
    }
  });
  window.addEventListener('message', event => {
    if (!embedded || event.source !== parent || event.origin !== location.origin || event.data?.channel !== channel) return;
    const msg = event.data;
    if (msg.type === 'host:cache') pending.get(msg.requestId)?.(msg);
    else if (msg.type === 'host:always-on-top-support' && msg.supported) send('tool:always-on-top',{enabled:true});
    else if (msg.type === 'host:get-tool-context') send('tool:tool-context',{requestId:msg.requestId,context:window.buildCourseToolContext()});
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) scene?.stop(); });
  send('tool:ready',{capabilities:['tool-context']});
  loadProgress().then(() => {
    display(location.hash.slice(1));
    root.setAttribute('aria-busy','false');
    window.addEventListener('hashchange', () => display(location.hash.slice(1)));
  });
})();
