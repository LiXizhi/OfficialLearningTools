(() => {
  const courses = window.brainCourses;
  const root = document.querySelector('#main');
  const switchRole = document.querySelector('#switch-role');
  const prefix = 'super-individual.course.v4.';
  // Progress value 5 already means the graduation page in existing notebooks.
  const adultPage=6;
  // The old teacher CEO slot (6) must not count as completed psychology practice.
  const psychologyPage=7;
  const fifthPage=id=>id==='teacher'?psychologyPage:id==='enterprise'?adultPage:0;
  const channel = 'aichat.external-tool.v1';
  const embedded = parent !== window && /^https?:$/.test(location.protocol);
  const pending = new Map();
  const records = new Map();
  const drafts = new Map();
  let requestNumber = 0;
  let role = '', page = 0, requested = 0, scene, storageReady = false;
  let chapter = 0, destination = 'intro';
  let bench, circleContext;
  const jumpBrain=document.querySelector('#jump-brain');
  jumpBrain.onclick=()=>{const target=root.querySelector('#brain-workbench');target?.focus({preventScroll:true});target?.scrollIntoView({block:'start'});};
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
    const common = ['last','variant', ...[1,2,3,4].flatMap(n => ['seen.' + n,'done.' + n])];
    return ['foundation.done', ...Object.keys(courses).flatMap(id =>
      (fifthPage(id) ? [...common, 'done.' + fifthPage(id)] : common).map(key => id + '.' + key))];
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
  const pageName = n => n === 5 ? 'finish' : 'lesson-' + (n>=adultPage?5:n);
  const foundationRoute = (n, after) => 'foundation/' + n + (after === 'intro' ? '' : '/' + after);
  const lastPage = id => {
    const saved=Number(records.get(id+'.last'));
    return id==='teacher' && saved===adultPage ? 5 : saved;
  };
  function move(hash, navigation='') {
    const position=window.scrollY;
    try { history.replaceState(null, '', '#' + hash); } catch { /* 沙箱由外层保留地址。 */ }
    send('tool:course-page', {page:hash});
    display(hash);
    const focus=navigation?root.querySelector(navigation+' [aria-current="page"]'):root.querySelector('h1');
    focus?.focus({preventScroll:true});
    window.scrollTo({top:navigation?position:0,behavior:'instant'});
  }
  function display(hash) {
    circleContext?.stop();circleContext=null;
    bench?.stop();bench=null;
    scene?.stop();
    scene = null;
    const shared = /^foundation(?:\/([1-4])(?:\/(.+))?)?$/.exec(hash);
    const target = shared ? shared[2] : hash;
    let match = /^(?:(student|teacher|enterprise)\/)?(lesson-([1-5])|finish)$/.exec(target || '');
    if(match?.[3]==='5'&&!fifthPage(match[1]))match=null;
    destination = match ? match[0] : 'intro';
    const browsingLesson = match?.[1] && new URLSearchParams(location.search).get('browse') === '1';
    chapter = shared ? Number(shared[1] || 1) : match && !browsingLesson && records.get('foundation.done') !== '1' ? 1 : 0;
    if (chapter) {
      jumpBrain.hidden=false;
      role = ''; page = 0; requested = 0;
      switchRole.hidden = true;
      renderFoundation();
      document.title = (chapter===4?'分身怎样组圈 · 协作与信任':window.brainFoundation[chapter-1].title) + ' · 共享通识';
      window.dispatchEvent(new CustomEvent('coursepagechange',{detail:{page,chapter}}));
      return;
    }
    role = match?.[1] || '';
    requested = match ? (match[3]==='5'?fifthPage(role):Number(match[3] || 5)) : 0;
    page = role ? requested : 0;
    switchRole.hidden = !role;
    jumpBrain.hidden = !role;
    if (role) {
      set('last', String(page));
      renderCourse();
    } else {
      root.innerHTML = `<section class="choose"><p class="meta">用第二大脑成为超级个体</p>
        <h1 tabindex="-1">你想用第二大脑解决哪类问题？</h1>
        <a class="foundation-card" href="#${foundationRoute(1,destination)}" data-review>
          <div><span class="meta">三种身份共同的第一课</span><h2>共享通识课</h2>
          <p>先看未来随身 AI 的中文图解，再走进今天的工作台：从一份彩排记录找回原话，写出下一班同学能拿去用的交接单。</p>
          <span class="foundation-cta">${records.get('foundation.done') === '1' ? '重看共享通识' : '开始共享通识'} →</span></div>
          <img src="assets/films/exhibit-4.jpg" alt="科学展上，小禾准备把机器人展台交给下一班同学。"></a>
        <h2 class="track-heading">选择你的实操课</h2>
        <div class="tracks">${Object.entries(courses).map(([id,c]) => {
          const last = lastPage(id);
          const action = requested === 5 ? '查看结课作品' : requested ? '进入第 ' + requested + ' 课' : last === 5 ? '继续看结课作品' : last && last===fifthPage(id)?'继续第5课': last ? '继续第 ' + last + ' 课' : '开始第一课';
          return `<button class="track" data-role="${id}"><img src="assets/${c.image}" alt=""><span class="track-body"><strong>我是${c.label}</strong><small>${c.takeaway}</small><span class="action">${action} →</span></span></button>`;
        }).join('')}</div></section>`;
    }
    document.title = (role ? courses[role].label + ' · ' + (page === 5 ? '结课作品' : page===psychologyPage?window.teacherPsychology.title:page===adultPage?window.adultSummit.title:courses[role].lessons[page-1].title) : '用第二大脑成为超级个体') + ' · 超级个体培训课';
    window.dispatchEvent(new CustomEvent('coursepagechange', {detail:{role, page}}));
  }
  function renderFoundation() {
    const chapters = window.brainFoundation;
    const lesson = chapters[chapter-1];
    root.innerHTML = `<article class="foundation">
      <nav class="lessons" aria-label="共享通识章节">${chapters.map((c,i) =>
        `<a data-chapter="${i+1}" href="#${foundationRoute(i+1,destination)}" ${i+1===chapter?'aria-current="page"':''}>${c.name}</a>`).join('')}</nav>
      ${chapter===1?window.renderBrainOrientation():''}
      ${chapter===4?'<section class="circle-story" aria-label="分身与协作圈"></section>':''}
      <header class="foundation-head" id="shared-first-case" tabindex="-1"><p class="meta">共享通识 · ${chapter} / ${chapters.length}</p>${chapter===1||chapter===4?`<h2>${lesson.title}</h2>`:`<h1 tabindex="-1">${lesson.title}</h1>`}<p>${lesson.story}</p></header>
      <div id="brain-workbench" tabindex="-1"></div>
      <details class="film-extra" open><summary>看现场短片 · ${lesson.filmTitle}</summary>
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
      </figure></details>
      <div class="foundation-grid"><section class="panel foundation-reading"><h2>${lesson.idea}</h2><p>${lesson.concept}</p><img src="assets/${lesson.image}" alt="${lesson.alt}" loading="lazy"></section>
      <section class="panel foundation-activity"><h2>${lesson.activityTitle}</h2>
        ${lesson.activity}</section></div>
      <section class="reflection"><h2>轮到你判断</h2><p>${lesson.question}</p></section>
      <nav class="pager" aria-label="通识翻页">${chapter>1?`<button data-chapter="${chapter-1}">← 上一节</button>`:''}
      ${chapter<chapters.length?`<button class="primary" data-chapter="${chapter+1}">下一节 · ${chapters[chapter].name} →</button>`:
        `<button class="primary" id="finish-foundation">${destination.includes('/')?'进入身份课':'继续选择身份'} →</button>`}</nav></article>`;
    if(chapter===4)circleContext=window.mountCircleStory(root.querySelector('.circle-story'));
    scene = window.createFoundationPlayer(root.querySelector('.exhibit-film'),lesson,chapter);
    bench=window.mountBrainBench(root.querySelector('#brain-workbench'),'foundation',chapter);
    const extra=root.querySelector('.film-extra');
    extra.addEventListener('toggle',()=>{if(extra.open)bench.stop();else scene?.stop();});
  }
  function link(n, label, cls = '') {
    return `<a class="${cls}" data-go="${n}" href="#${role}/${pageName(n)}" ${n === page ? 'aria-current="page"' : ''}>${label}</a>`;
  }
  const nav = () => `<nav class="lessons" aria-label="课程导航"><a href="#${foundationRoute(1,destination)}" data-review>共享通识</a>${[1,2,3,4].map(n => link(n,'第' + n + '课' + (get('done.'+n) === '1' ? ' ✓' : ''))).join('')}${!fifthPage(role)?'':link(fifthPage(role),'第5课'+(get('done.'+fifthPage(role))==='1'?' ✓':''))}${link(5,'结课作品')}</nav>`;
  const variant = () => get('variant') === 'manager' ? 'manager' : 'employee';
  const draftingKey = id => [role,page,variant(),id].join('/');
  function teacherStudio(n) {
    const {cases,cdn,outlines}=window.teacherWorkshop;
    const directory='<nav class="teacher-samples-nav" aria-label="三节完整样课">'+cases.map((c,i)=>link(i+1,c.grade+' · '+c.name)).join('')+'</nav>';
    if(n===4)return '<section class="panel teacher-studio"><h2>教研组工作单</h2>'+directory+
      '<ol class="steps"><li>各取一份 A 班和 B 班的匿名原件，先定下什么动作算独立完成。</li><li>两位教师各自编码，再逐条核对分歧。将提示后完成另记，留一份反例。</li><li>只改一项指令，隔一周换一道任务。记下条件、提示和观察结果，再更新结论。</li></ol>'+
      '<details><summary>把同一张观察表带到七、八年级</summary><p>七年级语文朗读：请学生标出一句话的停顿并指出上下文依据。八年级数学一次函数：给一张新图，让学生指出斜率对应哪一段变化。两组都记录“独立指出 / 提示后指出 / 未指出”，分别保留文本标注和坐标图。</p></details></section>';
    const c=cases[n-1],deck='teacher-samples/'+c.slug+'.html',plan='teacher-samples/'+c.slug+'/lesson-plan.md';
    const remote=cdn+c.slug+'/lesson-plan.md', skill='https://keepwork.com/api/raw/official/apps/tools/AIChat/release/AIChat_v1.html?skill=local-classroom-interaction-assistant&amp;classroomMode=';
    return '<section class="panel teacher-studio"><p class="meta">可直接试教 · 40 分钟</p><h2>'+c.grade+'《'+c.name+'》</h2>'+directory+
      '<p><strong>学习目标</strong>　'+c.goal+'</p><p><strong>课前准备</strong>　'+c.materials+'</p>'+
      '<iframe title="'+c.grade+'互动 H5 课件" src="'+deck+'?preview=1"></iframe>'+
      '<div class="teacher-links"><a class="button" href="'+deck+'" target="_blank" rel="noopener">打开大屏课件 ↗</a><a href="'+plan+'" download="lesson-plan.md">下载完整教案</a><a href="'+c.url+'" target="_blank" rel="noopener">'+c.source+' ↗</a></div>'+
      '<h3>课程大纲与逐页讲稿</h3><ol class="teacher-outline">'+outlines[n-1].map(([t,title,note])=>'<li><b>'+t+' 分钟 · '+title+'</b><p>'+note+'</p></li>').join('')+'</ol>'+
      '<details><summary>A 班和 B 班各观察什么？</summary><p><b>A 班指令</b>　'+c.draft+'</p><p><b>晚间修订</b>　'+c.change+'</p><p><b>B 班退出票</b>　'+c.exit+'</p><p>'+c.scope+'</p></details>'+
      '<h3>用 AI课程互动助手试讲</h3><p>先复制备课请求，进入助手后由你发送。准备好再选择刚备好的课，老师掌控翻页。</p>'+
      promptBox('teacher-prepare','给备课助手','请用 AI课程互动助手为《'+c.name+'》备课。先读完整教案 '+remote+' 和课件 '+cdn+c.slug+'.html，再读我提供的旧课件。找到或创建本课唯一的 lesson-plan.md；把第 3 页的主持话术、等答和观察点写进去，登记最近备课并给我可打开的位置。')+
      '<div class="teacher-links"><a class="button" target="_blank" rel="noopener" href="'+skill+'prepare">进入 AIChat 备课 ↗</a><a class="button" target="_blank" rel="noopener" href="'+skill+'teach">进入 AIChat 上课 ↗</a></div>'+
      promptBox('teacher-teach','给授课助手','现在给 A 班上《'+c.name+'》。请读刚备好的教案，等我说“主持第 3 页”再发问。学生答完把课堂交还给我。课后我会提供匿名观察，请据此修订这份教案，B 班仍选这节课并重新开始活动。')+'</section>';
  }
  function promptBox(id, label, value) {
    return `<div class="practice"><label for="${id}">${label}</label><textarea id="${id}" rows="4">${escape(drafts.get(draftingKey(id)) ?? value)}</textarea>
      <div class="actions"><button class="copy" data-for="${id}">复制话术</button><span class="copy-tip" role="status"></span></div></div>`;
  }
  const savePrompt = (c,l) => `${l.practice}请先确认我的默认第二大脑（//.brain/）已连接；如果还未连接，请带我设置。把下面的材料保存到这个大脑的“课程练习”目录，文件名用《${c.source}》。保留原文，已有同名文件时先问我。写好后给出实际路径和原句，方便我打开核对。\n\n${c.material}`;
  function renderCourse() {
    bench?.stop();
    const c = courses[role];
    if(page===psychologyPage){
      const l=window.teacherPsychology;
      const assistant='https://keepwork.com/api/raw/official/apps/tools/AIChat/release/AIChat_v1.html?skill=local-classroom-interaction-assistant&amp;classroomMode=';
      root.innerHTML=nav()+`<header class="titleband"><p class="meta">学校老师 · 第5课 · 七年级心理活动</p>
        <h1 tabindex="-1">${l.title}</h1><p>${l.task}</p></header>
        <div id="brain-workbench" tabindex="-1"></div>
        <section class="panel teacher-studio"><p class="meta">40 分钟 · 生成结果示例</p><h2>先试一轮：两位 AI 会怎样接话？</h2>
        <p>翻到第 2 页，为小禾换一个放不下手机的理由。第 3 页先演一轮，再回去把同伴的开场从命令换成询问，比较小禾的回应。</p>
        <iframe src="about:blank" sandbox="allow-scripts" title="心理活动 H5 成品示例"></iframe>
        <button type="button" id="download-phone">下载这个示例 H5</button>
        <details><summary>展开示例的逐页讲稿</summary><ol class="teacher-outline">${l.scripts.map(([part,words])=>'<li><b>'+part+'</b><p>'+words+'</p></li>').join('')}</ol></details></section>
        <section class="panel"><h2>自己备一节新课</h2><p>用你的年级、可用时间和情境替换空格。依次发送下面的话术，每一步先打开自己的产物核对。</p>
        ${l.prompts.slice(0,3).map(([id,label,value])=>promptBox(id,label,value)).join('')}
        <div class="teacher-links"><a class="button" target="_blank" rel="noopener" href="${assistant}prepare">进入 AIChat 备课 ↗</a><a class="button" target="_blank" rel="noopener" href="${assistant}teach">进入 AIChat 上课 ↗</a></div>
        <h3>学生实作 · 让两个 AI 真的聊一轮</h3><p>两人各开一个新对话，用下面的卡创建各自的角色。A 把同伴的开场转给 B，B 把小禾的回答转回 A，往返两次。另开新对话再试，保留小禾的设定，只换同伴的第一句话。记录两次原话，即使小禾两次都拒绝也值得讨论。</p>
        ${l.roles.map(([id,label,value])=>promptBox(id,label,value)).join('')}
        <a class="button" target="_blank" rel="noopener" href="https://keepwork.com/chat">打开 AIChat，创建角色对话 ↗</a>
        ${promptBox(...l.prompts[3])}
        <p>${l.evidence}</p><label class="check"><input type="checkbox" data-check="done" ${get('done.'+page)==='1'?'checked':''}>我已用自己生成的课件和讲稿主持双 AI 实验，并保存了原话</label></section>
        <nav class="pager">${link(4,'← 第四课','button')}${link(5,'查看结课作品 →','button primary')}</nav>`;
      const html=window.makePhoneLessonHTML();
      root.querySelector('.teacher-studio iframe').srcdoc=html;
      root.querySelector('#download-phone').onclick=()=>{
        const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
        const a=document.createElement('a');a.href=url;a.download='phone-habits.html';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      };
      bench=window.mountBrainBench(root.querySelector('#brain-workbench'),role,5,variant());
      return;
    }
    if(page===adultPage){
      const lesson=window.adultSummit;
      const transfer='客户希望所有团队周五上线，测试通过了两个团队，其余团队还缺负责人。写下你今天能承诺的范围。';
      root.innerHTML=nav()+`<header class="titleband"><p class="meta">第5课</p><h1 tabindex="-1">${lesson.title}</h1><p>早上八点四十，CEO 还在路上。三个项目都在等她签字，客户却已经来要周五的日期。谁去查，谁有权答应？</p></header>
        <div id="brain-workbench" tabindex="-1"></div><section class="panel practice"><h2>轮到你接这通电话</h2><p>${transfer}</p>
        ${promptBox('practice','改成自己的任务后，带到 AIChat 练习','请先从我的第二大脑找回上次的交付条件及出处。今天的要求是____，已经核实的两项证据是____。请为我拟一份有明确范围和下次答复时间的回复，等我确认后，再把可复用的规则写入指定的共享文档。')}
        <p>${lesson.evidence}</p><label class="check"><input type="checkbox" data-check="done" ${get('done.'+adultPage)==='1'?'checked':''}>我已用自己的材料写出一份有依据的答复</label>
        <p><small>本课改编自峰会演示中的 CEO 情境对话。 <a href="${lesson.source}" target="_blank" rel="noopener">观看《未来 CEO 的一个早晨》</a></small></p></section>
        <nav class="pager">${link(4,'← 第四课','button')}${link(5,'查看结课作品 →','button primary')}</nav>`;
      bench=window.mountBrainBench(root.querySelector('#brain-workbench'),role,5,variant());
      return;
    }
    if (page === 5) {
      root.innerHTML = nav() + `<section class="titleband"><p class="meta">${c.label} · 结课作品</p><h1 tabindex="-1">${c.work}</h1>
        <p>打开第二大脑里的最终作品，选一处改动，向同伴解释你依据了什么。</p></section>
        <div id="brain-workbench" tabindex="-1"></div><section class="panel practice"><h2>我的实操记录</h2><ol class="steps">${c.lessons.map((l,i) => `<li>${link(i+1,l.title)} · ${get('done.'+(i+1)) === '1' ? '已自评完成实操' : '待实操自评'}</li>`).join('')}${!fifthPage(role)?'':`<li>${link(fifthPage(role),role==='teacher'?'心理活动 · '+window.teacherPsychology.title:'第5课')} · ${get('done.'+fifthPage(role))==='1'?'已自评完成实操':'待实操自评'}</li>`}</ol></section>`;
      bench=window.mountBrainBench(root.querySelector('#brain-workbench'),role,role==='teacher'?5:4,variant(),true);
      return;
    }
    const l = c.lessons[page-1], first = page === 1;
    const path = l.variants ? l.variants[variant()] : null;
    const task = l.task;
    const filing=window.brainWiki[role].lessons[page-1];
    const filingTask='示例把这节课的材料归入《'+filing.home+'》，并在《'+filing.related+'》写下另一条有用的判断。请先打开我自己的索引，和我一起选对应的长期词条。能用已有小节就更新它；需要单独建页时，说明理由并等我确认。两处分别注明收录理由和可打开的出处。';
    root.innerHTML = nav() + `<header class="titleband"><p class="meta">${c.label} · 第 ${page} 课${first ? ' · 25 分钟' : ''}</p>
      <h1 tabindex="-1">${l.title}</h1><p>${first ? c.question : task}</p></header>
      ${l.variants ? `<fieldset class="wb-variant"><legend>选择本课交付物</legend>${Object.entries(l.variants).map(([id,v]) => `<label><input type="radio" name="variant" value="${id}" ${variant()===id?'checked':''}>${id==='manager'?'管理者':'员工'} · ${v[0]}</label>`).join('')}</fieldset>` : ''}
      <div id="brain-workbench" tabindex="-1"></div>
      ${role==='teacher'?teacherStudio(page):''}
      ${role==='student'&&page===3?'<section class="panel recall-chart" aria-label="英语词汇遗忘曲线推演"></section>':''}
      <div class="grid"><div class="stack"><section class="panel"><h2>${first ? '这次要存下的材料' : '这次练什么'}</h2>
      <p class="muted">虚构练习材料，也可换成你适合使用的资料。</p><blockquote>${l.material || c.material}</blockquote>
      <label class="check"><input type="checkbox" data-check="seen" ${get('seen.'+page)==='1'?'checked':''}>我看过工作台示范</label></section>
      <section class="panel"><h2>${first ? '10 分钟 · 存下并打开原件' : '动手做'}</h2>
      ${first ? '<ol class="steps"><li>打开 AIChat 左侧「第二大脑」。已有大脑就进入，首次使用按向导选一个练习文件夹，完成创建或连接。</li><li>在绑定这个大脑的会话里，把材料改成自己的表达，再复制、粘贴并发送。</li><li>在文件栏打开 AI 给出的原文件，核对标题和原话。</li></ol>' : '<p>'+task+'</p>'}
      ${promptBox('practice',first?'按自己的情况修改后发送':'可修改的练习话术',(first ? savePrompt(c,l) : (path?.[1] || l.practice) + (page===2 ? '\n\n补充材料：'+l.material : '')) + '\n\n' + l.method+'\n'+filingTask+'\n请在我的默认第二大脑（//.brain/）中查证原件。列出实际读过、新建、修改的文件和改动前后各一句。')}
      </section>
      ${first ? `<section class="panel"><h2>7 分钟 · 换一个新对话找回来</h2><p>在同一个第二大脑里新建对话，只发下面的问题。找到后打开原文件，核对回答里的原话。</p>
        ${promptBox('retrieve','给新对话的问题',c.retrieve)}<p><b>现在自己试一次。</b>${task}</p>
        <details><summary>找不到原件怎么办？</summary><p>确认新对话绑定的是同一个第二大脑。在文件栏查看刚才保存的位置，再用标题或两个关键词查找。如果设备还没连通，可以继续看示范，接通后再回来实操。</p></details></section>` : ''}
      </div><aside class="stack"><section class="panel"><p class="meta">${c.goal}</p><h2>${first ? '3 分钟 · 收起提示演示' : '用作品自评'}</h2>
      <p>${l.evidence}</p>${first ? '<button id="hide-hints" aria-expanded="true" aria-controls="lesson-guide">收起提示，自己试一次</button>' : ''}<label class="check"><input type="checkbox" data-check="done" ${get('done.'+page)==='1'?'checked':''}>我已完成实操，能展示作品</label></section>
      <section class="panel"><h3>到 AIChat 继续练习</h3><p>${embedded ? '课程悬浮时，在主聊天中粘贴修改好的话术，由你发送。' : '保留这个课件，在 AIChat 中完成保存、查找和核对。'}</p>
      <a class="button" target="_blank" rel="noopener noreferrer" href="https://keepwork.com/chat">打开 AIChat ↗</a></section></aside></div>
      <nav class="pager">${page===1 ? '<a class="button" href="#intro">选择身份</a>' : link(page-1,'← 上一课','button')}${page===4&&fifthPage(role)?link(fifthPage(role),'第5课 →','button primary'):link(page+1,page===4?'查看结课作品 →':'下一课 →','button primary')}</nav>`;
    bench=window.mountBrainBench(root.querySelector('#brain-workbench'),role,page,variant());
    const chart=root.querySelector('.recall-chart');
    if(chart)window.brainVocabulary.mount(chart);
    const hints = root.querySelector('#hide-hints');
    if (hints) {
      const guide = root.querySelector('.grid > .stack');
      guide.id = 'lesson-guide';
      hints.addEventListener('click', () => {
        guide.hidden = !guide.hidden;
        hints.setAttribute('aria-expanded', String(!guide.hidden));
        hints.textContent = guide.hidden ? '再看提示' : '收起提示，自己试一次';
        if (guide.hidden) bench.stop();
      });
    }
  }
  window.buildCourseToolContext = () => {
    if (chapter) {
      const l = window.brainFoundation[chapter-1];
      return ['课程：用第二大脑成为超级个体 · 共享通识。当前章节：'+l.title,chapter===1?'开场：认知共生体和可穿戴设备是未来设想。今天学员主动提供原件，从第二大脑检索、核对并写回。':'',bench?.context(), l.place, l.story, l.watch, l.concept,
        circleContext?'未来分身协作情境：'+circleContext.context():'',
        '当前动画画面：'+root.querySelector('[data-phase]').textContent+'。'+root.querySelector('[data-current]').textContent+' '+root.querySelector('.exhibit-film video').getAttribute('aria-label'),
        '本幕旁白：'+root.querySelector('[data-voice]').textContent,root.querySelector('.foundation-activity')?.textContent.trim(), '讨论题：'+l.question,
        '这是虚构的科学展案例。请引导学员依据原件说明判断，区分今天能做的练习与对未来工作的设想。'].join('\n');
    }
    if (!role) return '课程：用第二大脑成为超级个体。学员正在选择学生、学校老师或 IT 企业员工或管理者身份。';
    if(page===fifthPage(role)){
      const lesson=role==='teacher'?window.teacherPsychology:window.adultSummit;
      return ['第5课',courses[role].label,lesson.title,lesson.task,lesson.evidence,bench?.context()].join('\n');
    }
    const c = courses[role], l = c.lessons[page-1];
    if (!l) return `课程：用第二大脑成为超级个体。身份：${c.label}。结课作品：${c.work}。${bench?.context()} 请学员展示一次有依据的修订。`;
    return [`课程：用第二大脑成为超级个体。身份：${c.label}。第 ${page} 课：${l.title}。`,bench?.context(),
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
    if (target.matches('.course-menu nav a') && target.origin===location.origin && target.pathname===location.pathname && target.hash && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      history.pushState(null,'',target.href);
      move(target.hash.slice(1));
    } else if (target.dataset.chapter || target.hasAttribute('data-review')) {
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
      const last = lastPage(id);
      move(id+'/'+pageName(requested || (last>=1 && last<=(fifthPage(id)||5) ? last : 1)));
    } else if (target.id === 'switch-role' || target.getAttribute('href') === '#intro') {
      event.preventDefault(); move('intro');
    } else if (target.dataset.go) {
      event.preventDefault();
      const navigation=target.closest('.lessons')?'.lessons':target.closest('.teacher-samples-nav')?'.teacher-samples-nav':'';
      move(role+'/'+pageName(Number(target.dataset.go)),navigation);
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
    if(event.data?.channel===channel && event.data.type==='tool:sample-height'){
      const frame=root.querySelector('.teacher-studio iframe');
      if(!frame||event.source!==frame.contentWindow)return;
      if(event.origin!==new URL(frame.src).origin && event.origin!=='null')return;
      const height=event.data.height;
      if(Number.isInteger(height)&&height>0&&height<=8192)frame.style.height=(height+2)+'px';
      return;
    }
    if (!embedded || event.source !== parent || event.origin !== location.origin || event.data?.channel !== channel) return;
    const msg = event.data;
    if (msg.type === 'host:cache') pending.get(msg.requestId)?.(msg);
    else if (msg.type === 'host:always-on-top-support' && msg.supported) send('tool:always-on-top',{enabled:true});
    else if (msg.type === 'host:get-tool-context') send('tool:tool-context',{requestId:msg.requestId,context:window.buildCourseToolContext()});
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden){scene?.stop();bench?.stop();circleContext?.stop();} });
  window.addEventListener('pagehide',()=>{scene?.stop();bench?.stop();circleContext?.stop();});
  send('tool:ready',{capabilities:['tool-context']});
  loadProgress().then(() => {
    display(location.hash.slice(1));
    root.setAttribute('aria-busy','false');
    window.addEventListener('hashchange', () => display(location.hash.slice(1)));
  });
})();
