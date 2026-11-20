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
    const shared = /^foundation(?:\/([1-5])(?:\/(.+))?)?$/.exec(hash);
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
      document.title = window.brainFoundation[chapter-1].title + ' · 共享通识';
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
          <p>认识超级个体、第二大脑、分身与圈子，看一段日常想法如何沉淀为知识页，并被多个分身和团队复用。</p>
          <span class="foundation-cta">${records.get('foundation.done') === '1' ? '重看共享通识' : '开始共享通识'} →</span></div>
          <img src="assets/stage-3-brain.webp" width="1024" height="683" alt="一个人和几个分身围绕同一个知识网络工作。"></a>
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
    const chapters = window.brainFoundation, lesson = chapters[chapter-1], sections = chapters.length - 1;
    const figure = (src, alt, note = '', cls = '') => `<figure class="real-figure ${cls}"><img src="assets/${src}" alt="${escape(alt)}" ${(([w,h]) => w ? `width="${w}" height="${h}"` : '')(window.foundationImageSizes?.[src] || [])} loading="lazy">${note?`<figcaption>${note}</figcaption>`:''}</figure>`;
    const cards = (items, cls) => `<ol class="${cls}">${items.map(([a,b,c]) => `<li><b>${a}</b><strong>${b}</strong><span>${c}</span></li>`).join('')}</ol>`;
    let body = '';
    if (lesson.layers) body += `<section class="concept"><h2>三层结构</h2>${cards(lesson.layers,'layer-cards')}
      ${figure(lesson.image, lesson.alt, lesson.imageNote)}<h3>给 AI 定的三条维护原则</h3>${cards(lesson.rules.map(([a,b]) => ['',a,b]),'rule-list')}</section>`;
    if (lesson.modules) body += `<section class="concept module-tour"><h2>四个模块，一个循环</h2>
      <div class="module-tabs" role="tablist">${lesson.modules.map(([m,s],i) => `<button type="button" role="tab" data-module="${i}" aria-selected="${i===0}"><i>${i+1}</i><b>${m}</b><small>${s}</small></button>`).join('<span aria-hidden="true">→</span>')}</div>
      <div class="module-view">${figure(lesson.modules[0][2], lesson.modules[0][0], lesson.modules[0][4])}<p><b>留下什么：</b><span>${lesson.modules[0][3]}</span></p></div>
      <p class="loop-note">↺ 核验后的经验，回到个人脑与团队脑，成为下一次工作的起点。</p></section>`;
    if (lesson.entries) body += `<section class="concept">${figure(lesson.image, lesson.alt)}<p class="transparent">${lesson.transparent}</p>
      <h2>不同的人，分身从哪里开始</h2>${cards(lesson.entries,'entry-cards')}</section>`;
    if (lesson.brains) body += `<section class="concept">${figure(lesson.image, lesson.alt)}
      <h2>三种脑，各管各的</h2>${cards(lesson.brains,'layer-cards')}<h3>两条建脑路径</h3>${cards(lesson.paths,'entry-cards')}</section>`;
    let extra = '';
    if (lesson.evidence) extra += `<section class="panel evidence"><h2>${lesson.evidence.title}</h2><p>${lesson.evidence.text}</p>
      <div class="evidence-pair">${lesson.evidence.images.map(([src,alt]) => figure(src, alt, alt)).join('')}</div></section>`;
    if (lesson.future) extra += `<section class="panel future-note"><h2>再往前一步：跨组织的分身</h2>${figure(lesson.future.image, lesson.future.alt)}<p>${lesson.future.text}</p></section>`;
    if (lesson.caio) extra += `<aside class="caio-card"><h2>${lesson.caio.title}</h2><ol class="caio-steps">${lesson.caio.steps.map(([t,d],i)=>`<li><i>0${i+1}</i><strong>${t}</strong><span>${d}</span></li>`).join('')}</ol></aside>
      <details class="future-circle"><summary>互动演示 · 两个分身怎样临时组圈协作</summary><section class="circle-story" aria-label="分身与协作圈"></section></details>`;
    const pager = `<nav class="pager" aria-label="通识翻页">${chapter>1?`<button data-chapter="${chapter-1}">← 上一节</button>`:''}
      ${chapter<chapters.length?`<button class="primary" data-chapter="${chapter+1}">下一节 · ${chapters[chapter].name} →</button>`:
        `<button class="primary" id="finish-foundation">${destination.includes('/')?'进入身份课':'继续选择身份'} →</button>`}</nav>`;
    root.innerHTML = `<article class="foundation">
      <nav class="lessons" aria-label="共享通识章节">${chapters.map((c,i) =>
        `<a data-chapter="${i+1}" href="#${foundationRoute(i+1,destination)}" ${i+1===chapter?'aria-current="page"':''}>${i?i+' · ':''}${c.name}</a>`).join('')}</nav>
      ${chapter===1?window.renderBrainOrientation():`<header class="foundation-head" id="shared-first-case" tabindex="-1"><p class="meta">共享通识 · 第 ${chapter-1} 节 / ${sections}</p>
        <h1 tabindex="-1">${lesson.title}</h1><p class="lead">${lesson.lead}</p></header>${body}
        <div id="brain-workbench" tabindex="-1"></div>
        <section class="panel foundation-activity"><h2>${lesson.activityTitle}</h2>${lesson.activity}</section>${extra}`}
      <section class="reflection"><h2>轮到你想一想</h2><p>${lesson.question}</p></section>${pager}</article>`;
    if (chapter > 1) bench = window.mountFoundationBench(root.querySelector('#brain-workbench'), chapter-1);
    const circle = root.querySelector('.future-circle');
    circle?.addEventListener('toggle', () => {
      if (circle.open && !circleContext) circleContext = window.mountCircleStory(circle.querySelector('.circle-story'));
      if (circle.open) bench?.stop(); else circleContext?.stop();
    });
  }
  function link(n, label, cls = '') {
    return `<a class="${cls}" data-go="${n}" href="#${role}/${pageName(n)}" ${n === page ? 'aria-current="page"' : ''}>${label}</a>`;
  }
  const teacherNavNames=['','第1课 · 数学','第2课 · 语文','第3课 · 英语','第4课 · 跨科教研'];
  const enterpriseNavNames=window.enterpriseWorkshop?.navNames||['','第1课','第2课','第3课','第4课'];
  const studentNavNames=window.studentWorkshop?.navNames||['','第1课','第2课','第3课','第4课'];
  const nav = () => `<nav class="lessons" aria-label="课程导航"><a href="#${foundationRoute(1,destination)}" data-review>共享通识</a>${[1,2,3,4].map(n => link(n,(role==='teacher'?teacherNavNames[n]:role==='enterprise'?enterpriseNavNames[n]:studentNavNames[n]) + (get('done.'+n) === '1' ? ' ✓' : ''))).join('')}${!fifthPage(role)?'':link(fifthPage(role),(role==='teacher'?'第5课 · 心理班会':'第5课 · 组织授权')+(get('done.'+fifthPage(role))==='1'?' ✓':''))}${link(5,'结课作品')}</nav>`;
  const variant = () => get('variant') === 'manager' ? 'manager' : 'employee';
  const draftingKey = id => [role,page,variant(),id].join('/');
  const renderOutline = items => `<ol class="teacher-outline" role="list">${items.map(([t,title,note,tag],idx)=>
    `<li><button type="button" class="outline-btn" data-slide-go="${idx+1}" ${idx===0?'aria-current="step"':''}><span class="outline-top"><b>${t} 分钟 · ${title}</b>${tag?`<span class="outline-tag">${tag}</span>`:''}</span><span class="outline-note">${note}</span></button></li>`).join('')}</ol>`;
  function teacherSectionsBar(sec2Label, sec3Label, sec1Label='一、四步工作台实录') {
    return `<div class="lesson-sections-bar" aria-label="本课四部分导览">
      <button type="button" data-scroll-sec="sec-workbench">${sec1Label}</button>
      <button type="button" data-scroll-sec="sec-deck">${sec2Label}</button>
      <button type="button" data-scroll-sec="sec-research">${sec3Label}</button>
      <button type="button" data-scroll-sec="sec-quiz">四、3 个课后小问题</button>
    </div>`;
  }
  function teacherStudio(n) {
    const {cases,cdn,outlines,crossSubjectRows}=window.teacherWorkshop;
    const directory='<nav class="teacher-samples-nav" aria-label="回看三节主科样课"><span>快速调阅三科样课：</span>'+cases.map((c,i)=>link(i+1,c.grade+' · '+c.name)).join('')+'</nav>';
    if(n===4)return '<section class="panel teacher-studio" id="sec-deck"><p class="meta">二、跨科实证总表 · 语数外三节复教课统一编码与复验设计</p><h2>三门主科课怎样站在同一张三维观察表上？</h2>'+directory+
      '<div class="studio-meta-grid"><div><b>跨科共同问题</b><span>脱离当堂纸条、卡片或句型支架后，学生能否独立调用证据解释算理、连接文本或完成口语指路？</span></div><div><b>统一三维观察口径</b><span>① 独立完成（无提示达标） · ② 提示后完成（注明给了哪句提示） · ③ 未完成（如实保留反例）</span></div></div>'+
      '<div class="table-scroll" role="region" aria-labelledby="cross-evidence-caption" tabindex="0"><table class="evidence-table"><caption id="cross-evidence-caption">语数外三科平行班复教匿名样本编码与下周延迟复验安排</caption><thead><tr><th scope="col">学科与课例</th><th scope="col">独立完成</th><th scope="col">提示后完成</th><th scope="col">如实保留的典型反例</th><th scope="col">下周无提示延迟复验</th></tr></thead><tbody>'+
      crossSubjectRows.map(([subj,...cols])=>'<tr><th scope="row">'+subj+'</th>'+cols.map(cell=>'<td>'+cell+'</td>').join('')+'</tr>').join('')+
      '</tbody></table></div>'+
      '<details><summary>延伸参考 · 把同一张三维观察表带到初中课堂</summary><p>七年级语文朗读：请学生标出一句话的停顿并指出上下文依据。八年级数学一次函数：给一张新图，让学生指出斜率对应哪一段变化。两组都按“独立指出 / 提示后指出 / 未指出”编码，分别保留文本标注原件和坐标图。</p></details>'+
      '<details class="studio-prompts"><summary>想把科组多节课记录汇总成跨科试教包？（展开可复制参考话术）</summary>'+
      '<p class="muted">先由教研组教师确认统一观察口径与反例边界，再让 AI 汇总匿名原件链接，未实测的科目严格留空待补。</p>'+
      promptBox('research-coding','第一步 · 匿名取样与反例编码','请打开我第二大脑（//.brain/）里语数外三节课的平行班观察记录，按“独立完成 / 得到哪句提示后完成 / 未完成”三维口径整理匿名样本。等我核对分类后，将每门课尚未解决的典型反例单独列出并写入《我的科研》，附上原件链接。')+
      promptBox('research-package','第二步 · 生成跨科试教与延迟复验包','请根据刚才确认的三科编码，为每门课各设计一道撤去课堂支架的下周延迟复验题，生成《跨学科试教与迁移复验包》。已经实测的填入数据与原件链接，尚未开课实测的明确标注“待测”，并同步挂入《我的备课》。')+'</details></section>';
    const c=cases[n-1],deck='teacher-samples/'+c.slug+'.html',plan='teacher-samples/'+c.slug+'/lesson-plan.md';
    const remote=cdn+c.slug+'/lesson-plan.md', skill='https://keepwork.com/api/raw/official/apps/tools/AIChat/release/AIChat_v1.html?skill=local-classroom-interaction-assistant&amp;classroomMode=';
    return '<section class="panel teacher-studio" id="sec-deck"><p class="meta">二、真实课堂展示 · 40 分钟课堂大屏课件与逐页讲稿'+(c.unit?' · '+c.unit:'')+'</p><h2>'+c.grade+'《'+c.name+'》</h2>'+
      '<div class="studio-meta-grid"><div><b>学习目标</b><span>'+c.goal+'</span></div><div><b>课前准备</b><span>'+c.materials+'</span></div></div>'+
      '<iframe title="'+c.grade+'互动 H5 课件" src="'+deck+'?preview=1"></iframe>'+
      '<div class="teacher-links"><a class="button primary" href="'+deck+'" target="_blank" rel="noopener">全屏打开大屏课件 ↗</a>'+(c.labUrl?'<a class="button" href="'+c.labUrl+'" target="_blank" rel="noopener">'+c.labLabel+'</a>':'')+'<a class="button" href="'+plan+'" download="lesson-plan.md">下载完整教案 (.md)</a><a class="button" target="_blank" rel="noopener" href="'+skill+'prepare">进入 AIChat 备课 ↗</a><a class="button" target="_blank" rel="noopener" href="'+skill+'teach">进入 AIChat 上课 ↗</a><a class="button" href="'+c.url+'" target="_blank" rel="noopener">'+c.source+' ↗</a></div>'+
      '<div class="outline-head"><h3>40 分钟课堂流程与逐页讲稿</h3><small>点击任一环节可同步切换上方课件页</small></div>'+
      renderOutline(outlines[n-1])+
      '<details class="studio-prompts"><summary>想拿自己的旧 PPT 去 AIChat 备课或上课？（展开可复制参考话术）</summary>'+
      '<p class="muted">老师在课堂上手握翻页节奏；翻到互动页点名助手时，助手按同一份 lesson-plan.md 提问等答，答完交还老师。</p>'+
      promptBox('teacher-prepare','给备课助手','请用 AI课程互动助手为《'+c.name+'》备课。先读完整教案 '+remote+' 和课件 '+cdn+c.slug+'.html，再读我提供的旧课件。找到或创建本课唯一的 lesson-plan.md；把第 3 页的主持话术、等答和观察点写进去，登记最近备课并给我可打开的位置。')+
      promptBox('teacher-teach','给授课助手','现在给首班上《'+c.name+'》。请读刚备好的教案，等我说“主持第 3 页”再发问。学生答完把课堂交还给我。课后我会提供匿名观察，请据此修订这份教案，平行班仍选这节课并重新开始活动。')+'</details></section>';
  }
  function enterpriseStudio(n, fullPrompt='', c=courses.enterprise, l=null) {
    const ew=window.enterpriseWorkshop;
    const chatLink=`<a class="button" target="_blank" rel="noopener noreferrer" href="https://keepwork.com/chat">打开 AIChat ↗</a>`;
    if(n===1){
      return `<section class="panel teacher-studio enterprise-studio" id="sec-deck">
        <p class="meta">二、项目决策台账与首课双会话实操 · 25 分钟走通“只读存原件 → 新对话溯源”</p>
        <h2>《经营日报试点》周一评审原件逐句拆解与交接实操</h2>
        <div class="studio-meta-grid">
          <div><b>管理痛点与防错重点</b><span>口头转述最容易把“会上讨论过但因值班成本暂缓的实时推送”当成承诺，或替尚未表态的产品负责人默认节假日排期。</span></div>
          <div><b>第二大脑治理口径</b><span>原始会议纪要只读保留；在《报表试点项目》分栏登记“已拍板承诺＋责任人”与“待确认条件”，换新对话凭索引核验。</span></div>
        </div>
        <div class="table-scroll" role="region" aria-labelledby="ent-l1-caption" tabindex="0">
          <table class="evidence-table"><caption id="ent-l1-caption">周一评审原话、条款性质、责任人与交接防脑补边界</caption>
            <thead><tr><th scope="col">评审原话摘录</th><th scope="col">条款性质</th><th scope="col">责任人与期限</th><th scope="col">交接可执行口径</th></tr></thead>
            <tbody>${ew.lesson1Rows.map(([q,...cols])=>`<tr><th scope="row">${escape(q)}</th>${cols.map(v=>`<td>${escape(v)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
        <div class="diy-subhead">
          <div class="outline-head"><h3>25 分钟首课实操 · 存下原件并换新对话找回来</h3><button type="button" id="hide-hints" aria-expanded="true" aria-controls="lesson-guide">收起提示，自己试一次</button></div>
          <p class="muted">${embedded ? '课程悬浮时，可直接在主聊天粘贴下方修改好的话术发送。' : '可沿用下方虚构评审材料，也可替换成你手头真实的一段会议纪要。'}</p>
        </div>
        <div id="lesson-guide" class="enterprise-guide">
          <blockquote>${escape(c.material)}</blockquote>
          <label class="check"><input type="checkbox" data-check="seen" ${get('seen.1')==='1'?'checked':''}>我看过上方四步工作台示范</label>
          <ol class="steps">
            <li><b>10 分钟 · 存下原件：</b>在绑定默认第二大脑（<code>//.brain/</code>）的会话发送下方第一段话术，完成后在文件栏打开原文件核对标题与原话。</li>
            <li><b>7 分钟 · 换新对话找回：</b>在同一个第二大脑新建空白对话，只发第二段问题，验证能否沿索引找回原件位置并完成交接判断。</li>
          </ol>
          ${promptBox('practice','第一步 · 保存评审原件并登记项目页（可按实际修改）',fullPrompt)}
          ${promptBox('retrieve','第二步 · 给全新对话的溯源追问',c.retrieve)}
          <details><summary>新对话找不到原件怎么办？</summary><p>确认新对话绑定的是同一个第二大脑，先查看 <code>_wiki/index.md</code> 是否已登记《报表试点项目》，再按文件名或关键词核查。设备暂未连通时可先完成页内工作台与问答。</p></details>
        </div>
        <div class="teacher-links">${chatLink}</div>
      </section>`;
    }
    if(n===2){
      return `<section class="panel teacher-studio enterprise-studio" id="sec-deck">
        <p class="meta">二、双信源变更状态矩阵 · 周一立项与周三补充会逐条对齐</p>
        <h2>需求变了，哪条沿用、哪条生效、哪条还在等预算？</h2>
        <div class="studio-meta-grid">
          <div><b>本周新增材料（周三补充会）</b><span>${escape(l.material)}</span></div>
          <div><b>运行态第一信源提醒</b><span>昨天的批处理准点不代表今天也准点；更新决策页时必须一并写清去哪里查当次任务的运行起止时间。</span></div>
        </div>
        <div class="table-scroll" role="region" aria-labelledby="ent-l2-caption" tabindex="0">
          <table class="evidence-table"><caption id="ent-l2-caption">《报表试点项目》周一与周三双信源状态对齐表</caption>
            <thead><tr><th scope="col">业务与技术事项</th><th scope="col">周一原记录</th><th scope="col">周三补充信源</th><th scope="col">当前审定状态</th><th scope="col">下一步动作与确认人</th></tr></thead>
            <tbody>${ew.lesson2Rows.map(([item,...cols])=>`<tr><th scope="row">${escape(item)}</th>${cols.map(v=>`<td>${escape(v)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
        ${promptBox('practice','带到 AIChat 对齐两份会议记录（可修改）',fullPrompt)}
        <div class="teacher-links">${chatLink}</div>
      </section>`;
    }
    if(n===3 || n===4){
      const mode=variant(), d=ew.deliverables[n][mode];
      const historyNav=n===4?`<nav class="teacher-samples-nav" aria-label="回看前序项目沉淀"><span>快速回看前序沉淀：</span>${[1,2,3].map(i=>link(i,enterpriseNavNames[i])).join('')}</nav>`:'';
      return `<section class="panel teacher-studio enterprise-studio" id="sec-deck">
        <p class="meta">二、${n===3?'同源双视角正式交付单预览 · 切换上方管理者 / 员工角色实时对照':'跨项目压力测试与可复用指南 · 从〈报表试点〉迁移到〈门店库存预警〉'}</p>
        <h2>${d.title}</h2>${historyNav}
        <div class="deliverable-head"><span class="ab-badge">${d.badge}</span><button type="button" class="primary" data-download-md="${n}">下载当前模板 (${d.filename})</button></div>
        <div class="studio-meta-grid">
          <div><b>适用读者与场景</b><span>${escape(d.audience)}</span></div>
          <div><b>管理防错纪律</b><span>${escape(d.guardrail)}</span></div>
        </div>
        <div class="table-scroll" role="region" aria-labelledby="ent-l${n}-caption" tabindex="0">
          <table class="evidence-table"><caption id="ent-l${n}-caption">${d.title}核心结构与出处核验</caption>
            <thead><tr><th scope="col">${n===3?'交付单模块':'指南检查步骤'}</th><th scope="col">${n===3?'核定内容':'压力测试对比与执行标准'}</th><th scope="col">${n===3?'原件出处 / 责任归属':'复验动作与待决边界'}</th></tr></thead>
            <tbody>${d.rows.map(([k,v,ref])=>`<tr><th scope="row">${escape(k)}</th><td>${escape(v)}</td><td>${escape(ref)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
        ${promptBox('practice','按当前所选角色（'+(mode==='manager'?'管理者':'员工')+'）带到 AIChat 实操',fullPrompt)}
        <div class="teacher-links">${chatLink}</div>
      </section>`;
    }
    const lesson=window.adultSummit;
    const transferPrompt='请先从我的第二大脑找回上次的交付条件及出处。今天客户要求十家门店周五同开，已经核实具备“设备到货＋人员排班”两项证据的是____，仍在逐店核对的是____。请为我拟一份有明确承诺范围和下次答复时间的客户回复；等我确认后，再把可共享的岗位授权规则写入团队岗位卡，面试观察留在我个人脑。';
    return `<section class="panel teacher-studio enterprise-studio" id="sec-deck">
      <p class="meta">二、十店排期双条件核验与三层脑权限边界 · 峰会 CEO 晨间决策实战</p>
      <h2>哪些店今天能答应？哪些话只能留在个人脑？</h2>
      <div class="teacher-samples-nav"><span>回看前四课方法基础：</span>${[1,2,3,4].map(i=>link(i,enterpriseNavNames[i])).join('')}</div>
      <div class="studio-meta-grid">
        <div><b>晨间 08:40 决策压力</b><span>溪桥、北岸、东林三份交接单全压在 CEO 等签字；客户来电催十家店周五齐开；周四样板店还要约设备方与商场办体验日。</span></div>
        <div><b>超级组织破局动作</b><span>用“设备到货 × 人员排班”双条件锁死对外承诺；把交期承诺权附条件写进团队共享岗位卡，释放创始人单点签字瓶颈。</span></div>
      </div>
      <div class="table-scroll" role="region" aria-labelledby="ent-l5-caption" tabindex="0">
        <table class="evidence-table"><caption id="ent-l5-caption">十家门店周五开业双条件核对表（出处：共享/公司/原件/十店排期核对.md）</caption>
          <thead><tr><th scope="col">门店范围</th><th scope="col">条件一：设备到货</th><th scope="col">条件二：人员排班</th><th scope="col">今日对外可承诺口径</th></tr></thead>
          <tbody>${ew.summitStoreRows.map(([store,...cols])=>`<tr><th scope="row">${escape(store)}</th>${cols.map(v=>`<td>${escape(v)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
      <div class="outline-head"><h3>三层第二大脑信息分流清单</h3><small>可与上方工作台“CEO 个人第二大脑 / 团队共享第二大脑”切换核对</small></div>
      <div class="brain-boundary-grid">${ew.summitBrainCards.map(([title,path,desc])=>`<article class="boundary-card"><b>${escape(title)}</b><code>${escape(path)}</code><p>${escape(desc)}</p></article>`).join('')}</div>
      <div class="diy-subhead"><h3>轮到你接这通催期电话 · 到 AIChat 演练承诺与授权</h3><p class="muted">${escape(lesson.evidence)}</p></div>
      ${promptBox('practice','改成你团队正在处理的排期或授权任务后发送',transferPrompt)}
      <div class="teacher-links">${chatLink}<a class="button" href="${lesson.source}" target="_blank" rel="noopener">观看《未来 CEO 的一个早晨》原片 ↗</a></div>
    </section>`;
  }
  function studentStudio(n, fullPrompt='', c=courses.student, l=null) {
    const sw=window.studentWorkshop;
    const chatLink=`<a class="button" target="_blank" rel="noopener noreferrer" href="https://keepwork.com/chat">打开 AIChat ↗</a>`;
    const rulerLink=`<a class="button" href="../../ExternalLearningTools/xiaoxue-fraction-add-subtract/index.html" target="_blank" rel="noopener">打开《通分对齐尺》实验 ↗</a>`;
    if(n===1){
      return `<section class="panel teacher-studio student-studio" id="sec-deck">
        <p class="meta">二、等长纸条错题卡与 25 分钟双会话实操 · 先找回提醒，再自己动笔算新题</p>
        <h2>一张好用的错题卡长什么样？怎样用它解出 1/3 ＋ 1/6？</h2>
        <div class="studio-meta-grid">
          <div><b>为什么不让 AI 直接报答案？</b><span>直接抄得数 5/6 只能管一道作业；把“先把每一份变得一样大”存进《数学学习》，换新题也能自己推出来。</span></div>
          <div><b>本课验收小目标</b><span>${escape(l.evidence)}</span></div>
        </div>
        <div class="table-scroll" role="region" aria-labelledby="stu-l1-caption" tabindex="0">
          <table class="evidence-table"><caption id="stu-l1-caption">分数错题原卡拆解与今日新题迁移表</caption>
            <thead><tr><th scope="col">学习环节</th><th scope="col">我的原话或算式</th><th scope="col">画纸条发现了什么</th><th scope="col">正确做法与提醒</th></tr></thead>
            <tbody>${sw.lesson1Rows.map(([k,...cols])=>`<tr><th scope="row">${escape(k)}</th>${cols.map(v=>`<td>${escape(v)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
        <div class="diy-subhead">
          <div class="outline-head"><h3>25 分钟首课实操 · 存下错题卡，再开新对话找回来</h3><button type="button" id="hide-hints" aria-expanded="true" aria-controls="lesson-guide">收起提示，自己试一次</button></div>
          <p class="muted">${embedded ? '课程悬浮时，可在主聊天粘贴修改好的话术，由你发送。' : '可用下方分数错题材料试手，也可换成你昨天刚订正的一道真错题。'}</p>
        </div>
        <div id="lesson-guide" class="enterprise-guide">
          <blockquote>${escape(c.material)}</blockquote>
          <label class="check"><input type="checkbox" data-check="seen" ${get('seen.1')==='1'?'checked':''}>我看过上方四步工作台示范</label>
          <ol class="steps">
            <li><b>10 分钟 · 存下原卡：</b>打开 AIChat 左侧「第二大脑」，把下方话术改成自己的表达发送，在文件栏打开原文件核对标题和原话。</li>
            <li><b>7 分钟 · 换新对话找回：</b>新建一个空白对话，只发第二段问题；拿到原卡提醒后，合上提示自己算 <code>1/3 + 1/6</code>。</li>
          </ol>
          ${promptBox('practice','第一步 · 保存我的第一张错题卡（可改成自己的错题）',fullPrompt)}
          ${promptBox('retrieve','第二步 · 给新对话的问题（让陪练找原卡，别直接报答案）',c.retrieve)}
          <details><summary>找不到原件怎么办？</summary><p>确认新对话绑定的是同一个第二大脑。在文件栏查看刚才保存的位置，或从 <code>_wiki/index.md</code> 点进《数学学习》查找。设备暂未连通时可先看上方工作台示范。</p></details>
        </div>
        <div class="teacher-links">${rulerLink}${chatLink}</div>
      </section>`;
    }
    if(n===2){
      return `<section class="panel teacher-studio student-studio" id="sec-deck">
        <p class="meta">二、相似错题“首错行定位”诊断卡 · 保留原草稿，分清概念错与计算错</p>
        <h2>两道分数题都做错了，第一处错误分别藏在哪一行？</h2>
        <div class="studio-meta-grid">
          <div><b>本次带来的新草稿</b><span>${escape(l.material)}</span></div>
          <div><b>陪练分身新规矩</b><span>以后做错题，先别替我重讲整课通分，用一个问题引导我自己圈出“第一次算错的那一行”。</span></div>
        </div>
        <div class="table-scroll" role="region" aria-labelledby="stu-l2-caption" tabindex="0">
          <table class="evidence-table"><caption id="stu-l2-caption">三道分数错题“第一处出错行”与对症药方对照表</caption>
            <thead><tr><th scope="col">错题算式</th><th scope="col">第一次出错在哪一行</th><th scope="col">真实错因分类</th><th scope="col">该用哪条提醒解决</th></tr></thead>
            <tbody>${sw.lesson2Rows.map(([k,...cols])=>`<tr><th scope="row">${escape(k)}</th>${cols.map(v=>`<td>${escape(v)}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </div>
        ${promptBox('practice','带到 AIChat 让陪练分身先问我“错在第几步”',fullPrompt)}
        <div class="teacher-links">${rulerLink}${chatLink}</div>
      </section>`;
    }
    if(n===3){
      return `<section class="panel recall-chart" id="sec-deck" aria-label="英语词汇遗忘曲线推演"></section>
      <section class="panel teacher-studio student-studio">
        <p class="meta">二（续）、双词遮词自测档案与 AIChat 英语陪练话术 · 让复习日期跟着真实表现走</p>
        <h2>为什么 <span lang="en">borrow</span> 明天就要练，<span lang="en">return</span> 可以等三天？</h2>
        <div class="studio-meta-grid">
          <div><b>课堂练习原句</b><span lang="en">${escape(l.material)}</span></div>
          <div><b>诚实记录原则</b><span>曲线只是按半衰期假设算出的估计值；可在上方工作台点「Nov 13 · 填词」亲手试一次，看真实作答怎样改写复习单！</span></div>
        </div>
        <div class="table-scroll" role="region" aria-labelledby="stu-l3-caption" tabindex="0">
          <table class="evidence-table"><caption id="stu-l3-caption">11 月 12–13 日两词自测证据与下次复习安排</caption>
            <thead><tr><th scope="col">单词</th><th scope="col">课本原句 / 新句检测</th><th scope="col">遮住课本后的真实表现</th><th scope="col">动态排期结果</th></tr></thead>
            <tbody>${sw.lesson3Rows.map(([w,sent,obs,plan])=>`<tr><th scope="row">${escape(w)}</th><td lang="en">${escape(sent)}</td><td>${escape(obs)}</td><td>${escape(plan)}</td></tr>`).join('')}</tbody>
          </table>
        </div>
        ${promptBox('practice','复制到 AIChat 让英语陪练抽测今天到期的词',fullPrompt)}
        <div class="teacher-links">${chatLink}</div>
      </section>`;
    }
    return `<section class="panel teacher-studio student-studio" id="sec-deck">
      <p class="meta">二、跨科迁移作品《给同学的一页学习指南》· 经同桌试读打磨定稿</p>
      <h2>怎样把数学找错因的方法，变成语文和科学都能用的检查卡？</h2>
      <nav class="teacher-samples-nav" aria-label="回看前三课攒下的方法"><span>回看前三课攒下的方法：</span>${[1,2,3].map(i=>link(i,studentNavNames[i])).join('')}</nav>
      <div class="deliverable-head"><span class="ab-badge">结课作品预览 · 同桌 3 分钟可照做</span><button type="button" class="primary" data-download-student-guide="1">下载这页指南模板 (one-page-study-guide.md)</button></div>
      <div class="studio-meta-grid">
        <div><b>可选观察写作素材</b><span>${escape(l.material)}</span></div>
        <div><b>同桌试读带来的关键改进</b><span>${escape(l.example)}</span></div>
      </div>
      <div class="table-scroll" role="region" aria-labelledby="stu-l4-caption" tabindex="0">
        <table class="evidence-table"><caption id="stu-l4-caption">《用证据检查作文与科学观察》四步自查表</caption>
          <thead><tr><th scope="col">检查步骤</th><th scope="col">具体怎么做</th><th scope="col">拿“花坛空瓶”句子试一试</th></tr></thead>
          <tbody>${sw.guideSteps.map(([step,how,ex])=>`<tr><th scope="row">${escape(step)}</th><td>${escape(how)}</td><td>${escape(ex)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      ${promptBox('practice','填空改成你自己的学科指南话题，带到 AIChat 起草',fullPrompt)}
      <div class="teacher-links">${chatLink}</div>
    </section>`;
  }
  function renderTeacherExtras(it, quiz, pageNum, doneText, extraPanel='') {
    const ba=it.beforeAfter, gm=it.groupMeeting;
    const cmdBeforeLabel = it.beforeCmdLabel || (pageNum===4 ? '课堂支架条件：' : pageNum===psychologyPage ? '第一轮设定：' : '第 3 页原指令：');
    const cmdAfterLabel = it.afterCmdLabel || (pageNum===4 ? '延迟复验任务：' : pageNum===psychologyPage ? '第二轮调整：' : '第 3 页修订指令：');
    return `<section class="panel teacher-iteration" id="sec-research">
      <p class="meta">${it.meta}</p>
      <h2>${it.heading}</h2>
      <div class="ab-compare">
        <article class="ab-card ab-before">
          <span class="ab-badge">${ba.beforeLabel}</span>
          <p class="ab-cmd"><b>${cmdBeforeLabel}</b>${ba.beforeCmd}</p>
          <ul>${ba.beforeStats.map(([k,v])=>`<li><b>${k}：</b><span>${v}</span></li>`).join('')}</ul>
        </article>
        <div class="ab-arrow" aria-label="课后分析与对照推进"><span>${ba.arrowNote || '课后分析 · 只改一句指令'}</span><b>→</b></div>
        <article class="ab-card ab-after">
          <span class="ab-badge">${ba.afterLabel}</span>
          <p class="ab-cmd"><b>${cmdAfterLabel}</b>${ba.afterCmd}</p>
          <ul>${ba.afterStats.map(([k,v])=>`<li><b>${k}：</b><span>${v}</span></li>`).join('')}</ul>
        </article>
      </div>
      <div class="group-study">
        <div class="group-study-head"><h3>${gm.title}</h3><p class="muted">${gm.subtitle}</p></div>
        <div class="group-turns">${gm.dialogue.map(([who,words])=>`<div class="group-turn ${/(决议|收获)/.test(who)?'is-resolution':''}"><b>${who}</b><p>${words}</p></div>`).join('')}</div>
      </div>
    </section>${extraPanel}
    <section class="panel teacher-quiz" id="sec-quiz">
      <p class="meta">四、课后小问答 · 3 个简单问题</p>
      <h2>回顾这堂课的三个关键细节</h2>
      <p class="muted">点选你认为合适的做法，立即查看解析：</p>
      <div class="quiz-list">${quiz.map(item=>`<div class="quiz-card"><fieldset class="source-choice"><legend>${item.q}</legend>${item.options.map(([v,text,fb])=>`<button type="button" data-verdict="${v}" data-feedback="${escape(fb)}">${text}</button>`).join('')}</fieldset><p class="answer" role="status"></p></div>`).join('')}</div>
      <div class="quiz-done-bar"><label class="check"><input type="checkbox" data-check="done" ${get('done.'+pageNum)==='1'?'checked':''}>${doneText}</label></div>
    </section>`;
  }
  function promptBox(id, label, value) {
    return `<div class="practice"><label for="${id}">${label}</label><textarea id="${id}" rows="4">${escape(drafts.get(draftingKey(id)) ?? value)}</textarea>
      <div class="actions"><button class="copy" type="button" data-for="${id}">复制话术</button><span class="copy-tip" role="status"></span></div></div>`;
  }
  const savePrompt = (c,l) => `${l.practice}请先确认我的默认第二大脑（//.brain/）已连接；如果还未连接，请带我设置。把下面的材料保存到这个大脑的“课程练习”目录，文件名用《${c.source}》。保留原文，已有同名文件时先问我。写好后给出实际路径和原句，方便我打开核对。\n\n${c.material}`;
  function renderCourse() {
    bench?.stop();
    const c = courses[role];
    if(page===psychologyPage){
      const l=window.teacherPsychology;
      const assistant='https://keepwork.com/api/raw/official/apps/tools/AIChat/release/AIChat_v1.html?skill=local-classroom-interaction-assistant&amp;classroomMode=';
      const diyPanel=`<section class="panel psychology-diy">
        <p class="meta">动手备课与双 AI 角色卡 · 可替换成你自己的班会主题</p>
        <h2>自己从零备一节新课（含学生双 AI 实验卡）</h2>
        <p class="muted">把年级、时长和困扰情境换成你班上的真实话题，依次执行“生成 H5 → 验页写唯一讲稿 → 课堂双 AI 实验 → 课后回写”。</p>
        ${l.prompts.slice(0,3).map(([id,label,value])=>promptBox(id,label,value)).join('')}
        <div class="teacher-links"><a class="button primary" target="_blank" rel="noopener" href="${assistant}prepare">进入 AIChat 备课 ↗</a><a class="button" target="_blank" rel="noopener" href="${assistant}teach">进入 AIChat 上课 ↗</a></div>
        <div class="diy-subhead"><h3>学生课堂实作 · 让两位 AI 角色真的聊两轮</h3><p class="muted">同桌各开一个新对话粘贴下方角色卡。第一轮用命令开场，第二轮保留小禾理由不变、只改同伴第一句话，记录两轮真实回复原话。</p></div>
        ${l.roles.map(([id,label,value])=>promptBox(id,label,value)).join('')}
        <div class="teacher-links"><a class="button" target="_blank" rel="noopener" href="https://keepwork.com/chat">打开 AIChat，创建角色对话 ↗</a></div>
        ${promptBox(...l.prompts[3])}
      </section>`;
      root.innerHTML=nav()+`<header class="titleband teacher-band"><p class="meta">学校老师 · 第 5 课 · ${l.unit}</p>
        <h1 tabindex="-1">${l.title}</h1><p>${l.task}</p>
        ${teacherSectionsBar('二、零基础心理 H5 与讲稿','三、双 AI 对照与备课实操')}</header>
        <div class="sec-lead" id="sec-workbench"><p class="meta">一、从零建课四步工作台 · 左侧课堂与备课对话 × 右侧 H5 源码与唯一教案</p><p class="muted">可点上方「① 从零生成 H5 · ② 验页写唯一讲稿 · ③ 双 AI 课堂实验 · ④ 课后修订沉淀」切换阶段，查看先生成 HTML 再配讲稿的全过程。</p></div>
        <div id="brain-workbench" tabindex="-1"></div>
        <section class="panel teacher-studio" id="sec-deck"><p class="meta">二、零基础生成结果示例 · 40 分钟心理班会大屏 H5 与逐页主持词</p><h2>七年级心理班会《${l.title}》</h2>
        <div class="studio-meta-grid"><div><b>活动目标</b><span>${l.goal}</span></div><div><b>课堂组织与材料</b><span>${l.materials}</span></div></div>
        <p class="muted">先在第 2 页查看或修改小禾放不下手机的理由，再到第 3 页点「显示下一句」演完一轮；回第 2 页把同伴开场切成「先听理由，再让对方选」，对比小禾的态度变化。</p>
        <iframe src="about:blank" sandbox="allow-scripts" title="心理活动 H5 成品示例"></iframe>
        <div class="teacher-links"><button type="button" class="primary" id="download-phone">下载这个示例 H5 (.html)</button><a class="button" target="_blank" rel="noopener" href="${assistant}prepare">进入 AIChat 备课 ↗</a><a class="button" target="_blank" rel="noopener" href="${assistant}teach">进入 AIChat 上课 ↗</a><a class="button" target="_blank" rel="noopener" href="https://keepwork.com/chat">打开 AIChat 创建角色对话 ↗</a></div>
        <div class="outline-head"><h3>40 分钟班会流程与逐页讲稿</h3><small>点击任一环节可同步切换上方示例 H5 页码</small></div>
        ${renderOutline(l.scripts)}</section>
        ${renderTeacherExtras(l.iteration,l.quiz,page,'我已掌握从零生成互动 H5、按真实页序备唯一讲稿与主持双 AI 对照实验的完整流程，并完成以上 3 题',diyPanel)}
        <nav class="pager">${link(4,'← 上一课 · 跨科教研','button')}${link(5,'查看结课作品 →','button primary')}</nav>`;
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
      const lesson=window.adultSummit, ew=window.enterpriseWorkshop;
      root.innerHTML=nav()+`<header class="titleband enterprise-band"><p class="meta">${c.label} · 第 5 课 · 超级团队与组织授权（CEO 晨间实战）</p>
        <h1 tabindex="-1">${lesson.title}</h1>
        <p>早上八点四十，CEO 还在路上。三个项目都在等她签字，客户却已经来要周五十店同开的准信——谁去查证据，谁有权对外答应，哪些话留个人脑、哪些进公司脑与合作圈？</p>
        ${teacherSectionsBar('二、十店核验表与三层脑边界','三、授权前后对照与晨会实录','一、四步多脑授权工作台')}</header>
        <div class="sec-lead" id="sec-workbench"><p class="meta">一、多脑协同四步工作台 · 左侧晨间决策对话 × 右侧个人脑 / 公司共享脑 / 合作圈文件</p><p class="muted">可点上方「① 查双表定答复 · ② 个人脑留追问 · ③ 授权改公司岗位卡 · ④ 合作圈核价草案」切换阶段，或切换右侧双脑目录追踪行级出处。</p></div>
        <div id="brain-workbench" tabindex="-1"></div>
        ${enterpriseStudio(5)}
        ${renderTeacherExtras(ew.lessonIterations[4],ew.lessonQuizzes[4],adultPage,ew.doneLabels[5])}
        <nav class="pager">${link(4,'← 上一课 · 跨项复验','button')}${link(5,'查看结课作品 →','button primary')}</nav>`;
      bench=window.mountBrainBench(root.querySelector('#brain-workbench'),role,5,variant());
      return;
    }
    if (page === 5) {
      root.innerHTML = nav() + `<section class="titleband${role==='teacher'?' teacher-band':role==='enterprise'?' enterprise-band':' student-band'}"><p class="meta">${c.label} · 结课作品</p><h1 tabindex="-1">${c.work}</h1>
        <p>${role==='teacher'?'五节课沉淀在同一座第二大脑里：从语数外旧课件重构、跨科延迟复验，到零基础生成心理班会 H5，形成平行班同事打开就能直接试教的教学包。':role==='enterprise'?'五节课从一份评审纪要走到跨组织协作：沉淀出带前置条件的一页项目指南、更新后的公司共享岗位卡，以及个人脑、公司脑与合作圈各守边界的决策体系。':'四节课从一张分数错题卡出发，连起《数学学习》《英语学习》《语文学习》与《我的学习进展》，打磨出一页同桌照着就能用的学习指南。'}</p></section>
        <div id="brain-workbench" tabindex="-1"></div>
        ${role==='teacher'?`<section class="panel"><p class="meta">教师结课资产清点 · 共享教学包与个人脑边界</p><h2>五堂课沉淀下来的两类核心资产</h2>
          <div class="studio-meta-grid"><div><b>可放入科组 / 学校共享脑的资产</b><span>定稿 6 页主科互动课件、零基础 4 页心理班会 H5、唯一 lesson-plan.md、三维课堂观察表、脱敏典型反例与下周延迟复验题。</span></div><div><b>仅保留在教师个人第二大脑的记录</b><span>本班需单独辅导的学生具名名单、课堂个别访谈草稿，以及尚未完成课后回访验证的待测假设。</span></div></div></section>`:role==='enterprise'?`<section class="panel"><p class="meta">管理者与企业结课资产清点 · 个人脑 × 公司共享脑 × 外部合作圈</p><h2>五堂课沉淀下来的三层核心资产</h2>
          <div class="brain-boundary-grid">
            <article class="boundary-card"><b>① 沉淀进团队 / 公司共享脑</b><code>_wiki/concepts/团队协作.md · 共享/公司/项目负责人岗位卡.md</code><p>经过跨项目压力测试的《一页决策条件 / 交接步骤指南》、带行级授权出处的岗位卡，以及去敏后的项目决策台账。</p></article>
            <article class="boundary-card"><b>② 仅保留在管理者个人第二大脑</b><code>docs/面试笔记/项目负责人面试.md</code><p>候选人面试现场观察、下次复试追问考题、内部人员与薪酬过渡评估等未授权公开的私人判断。</p></article>
            <article class="boundary-card"><b>③ 发往客户与外部合作圈</b><code>作品/负责人给客户的开业答复.md · 共享/合作圈/周四核价草案.md</code><p>严格限定在已核实双条件内的门店交期承诺，以及只含本次投入与待核事项的三方体验日核价草案。</p></article>
          </div></section>`:`<section class="panel"><p class="meta">学生结课资产清点 · 可分享给同伴的指南与个人第二大脑边界</p><h2>四堂课攒下来的两类学习财富</h2>
          <div class="studio-meta-grid"><div><b>可以大方分享给同桌 / 学习小组的作品</b><span>经过同学试读改顺的《一页学习指南》、等长纸条分格画图法，以及科学观察“保住真细节、收窄大结论”的四步检查单。</span></div><div><b>留在自己个人第二大脑持续生长的记录</b><span>每次做题的原始演算草稿、英语遮词自测哪几个词需要提示的真实记录，以及《我的学习进展》里的下周个人小目标。</span></div></div></section>`}
        <section class="panel practice"><h2>我的实操记录</h2><ol class="steps">${c.lessons.map((l,i) => `<li>${link(i+1,l.title)} · ${get('done.'+(i+1)) === '1' ? '已自评完成实操' : '待实操自评'}</li>`).join('')}${!fifthPage(role)?'':`<li>${link(fifthPage(role),role==='teacher'?'心理活动 · '+window.teacherPsychology.title:'组织授权 · '+window.adultSummit.title)} · ${get('done.'+fifthPage(role))==='1' ? '已自评完成实操' : '待实操自评'}</li>`}</ol></section>
        ${role==='teacher'?`<nav class="pager">${link(psychologyPage,'← 返回第 5 课 · 心理班会','button')}<a class="button primary" href="#intro">返回课程首页</a></nav>`:role==='enterprise'?`<nav class="pager">${link(adultPage,'← 返回第 5 课 · 组织授权','button')}<a class="button primary" href="#intro">返回课程首页</a></nav>`:`<nav class="pager">${link(4,'← 返回第 4 课 · 观察作文','button')}<a class="button primary" href="#intro">返回课程首页</a></nav>`}`;
      bench=window.mountBrainBench(root.querySelector('#brain-workbench'),role,role==='student'?4:5,variant(),true);
      return;
    }
    const l = c.lessons[page-1], first = page === 1;
    const path = l.variants ? l.variants[variant()] : null;
    const filing=window.brainWiki[role].lessons[page-1];
    const filingTask='示例把这节课的材料归入《'+filing.home+'》，并在《'+filing.related+'》写下另一条有用的判断。请先打开我自己的索引，和我一起选对应的长期词条。能用已有小节就更新它；需要单独建页时，说明理由并等我确认。两处分别注明收录理由和可打开的出处。';
    const fullPracticePrompt=(first ? savePrompt(c,l) : (path?.[1] || l.practice) + (page===2 ? '\n\n补充材料：'+l.material : '')) + '\n\n' + l.method+'\n'+filingTask+'\n请在我的默认第二大脑（//.brain/）中查证原件。列出实际读过、新建、修改的文件和改动前后各一句。';
    const isTeacherTrack = role === 'teacher';
    const isEnterpriseTrack = role === 'enterprise';
    const ew = window.enterpriseWorkshop, sw = window.studentWorkshop;
    const teacherDoneLabels=[
      '',
      '我已完整了解这堂数学课的备课、上课、课后分析与科组教研过程，并完成以上 3 题',
      '我已完整了解这堂语文提问策略课的备课、上课、三栏提问单分析与科组教研过程，并完成以上 3 题',
      '我已完整了解这堂英语信息差问路课的备课、盲走实操、澄清修订与科组评价改革，并完成以上 3 题',
      '我已掌握语数外三科统一观察量规、反例保留原则与隔周无提示延迟复验方法，并完成以上 3 题'
    ];
    const teacherPrevLabels=['','','← 上一课 · 五年级数学','← 上一课 · 四年级语文','← 上一课 · 六年级英语'];
    const teacherNextLabels=['','下一课 · 四年级语文 →','下一课 · 六年级英语 →','下一课 · 跨科教研 →','第5课 · 心理班会 →'];
    const entPrevLabels=['','','← 上一课 · 决策溯源','← 上一课 · 变更对齐','← 上一课 · 分众交付'];
    const entNextLabels=['','下一课 · 变更对齐 →','下一课 · 分众交付 →','下一课 · 跨项复验 →','第5课 · 组织授权 →'];
    const stuPrevLabels=['','','← 上一课 · 数学错题','← 上一课 · 辨析错因','← 上一课 · 英语复习'];
    const stuNextLabels=['','下一课 · 辨析错因 →','下一课 · 英语复习 →','下一课 · 观察作文 →','查看结课作品 →'];
    const entSecBars=[
      [],
      ['二、评审台账与双会话实操','三、交接对照与周会实录'],
      ['二、双信源变更状态矩阵','三、变更对照与评审实录'],
      ['二、同源双视角交付单预览','三、分众改稿与互审实录'],
      ['二、跨项目压力测试与指南','三、失效修正与复验实录']
    ];
    const stuSecBars=[
      [],
      ['二、纸条错题卡与双会话实操','三、订正对照与同桌互讲'],
      ['二、首错行诊断表与陪练话术','三、两次错题对照与复盘'],
      ['二、遗忘曲线推演与双词档案','三、动态排期对照与复盘'],
      ['二、一页学习指南与模板下载','三、同桌试读改稿与分享']
    ];
    const stageHints = isEnterpriseTrack ? (ew?ew.lessonStages[page-1].join(' · '):'') : !isTeacherTrack ? (sw?sw.lessonStages[page-1].join(' · '):'') : '';
    root.innerHTML = nav() + `<header class="titleband${isTeacherTrack?' teacher-band':isEnterpriseTrack?' enterprise-band':' student-band'}"><p class="meta">${c.label} · 第 ${page} 课${l.unit ? ' · '+l.unit : ''}${first && !isTeacherTrack ? ' · 25 分钟' : ''}</p>
      <h1 tabindex="-1">${l.title}</h1><p>${l.question || c.question}</p>
      ${isTeacherTrack ? (page===4
        ? teacherSectionsBar('二、三科证据与编码总表','三、延迟复验与跨科教研会','一、四步跨科教研工作台')
        : teacherSectionsBar('二、真实课堂课件与讲稿','三、课后分析与科组教研'))
        : isEnterpriseTrack ? teacherSectionsBar(entSecBars[page][0], entSecBars[page][1], '一、四步项目治理工作台')
        : teacherSectionsBar(stuSecBars[page][0], stuSecBars[page][1], '一、四步自主学习工作台')}</header>
      ${l.variants ? `<fieldset class="wb-variant"><legend>选择本课角色视角与交付物（工作台、下方交付单与话术同步切换）</legend>${Object.entries(l.variants).map(([id,v]) => `<label><input type="radio" name="variant" value="${id}" ${variant()===id?'checked':''}>${id==='manager'?'管理者':'员工'} · ${v[0]}</label>`).join('')}</fieldset>` : ''}
      ${isTeacherTrack ? `<div class="sec-lead" id="sec-workbench"><p class="meta">${page===4?'一、跨科教研四步工作台 · 左侧教研组对话 × 右侧三科证据编码与复验包':'一、教学迭代四步工作台 · 左侧真实场景与对话 × 右侧第二大脑文件'}</p><p class="muted">${page===4?'可点上方「① 约定口径 · ② 三科取样 · ③ 反例编码 · ④ 延迟复验」直接切换阶段，查看三科课堂原件如何汇聚成跨科研究包。':'可点上方「① 课前备课 · ② 课堂授课 · ③ 课后分析 · ④ 科组教研」直接切换阶段，也可点播放完整观看。'}</p></div>`
        : isEnterpriseTrack ? `<div class="sec-lead" id="sec-workbench"><p class="meta">一、项目决策与治理四步工作台 · 左侧真实职场对话 × 右侧第二大脑文件对比</p><p class="muted">可点上方「${stageHints}」直接切换阶段，核对每一步的新增与撤下原句。</p></div>`
        : `<div class="sec-lead" id="sec-workbench"><p class="meta">一、自主学习四步工作台 · 左侧学习对话与自测 × 右侧我的第二大脑文件</p><p class="muted">可点上方「${stageHints}」直接切换阶段${page===3?'，也可点下方「Nov 13 · 填词」亲手试一次动态调整复习日':''}。</p></div>`}
      <div id="brain-workbench" tabindex="-1"></div>
      ${isTeacherTrack?teacherStudio(page):isEnterpriseTrack?enterpriseStudio(page,fullPracticePrompt,c,l):studentStudio(page,fullPracticePrompt,c,l)}
      ${isTeacherTrack ? renderTeacherExtras(window.teacherWorkshop.lessonIterations[page-1],window.teacherWorkshop.lessonQuizzes[page-1],page,teacherDoneLabels[page])
        : isEnterpriseTrack ? renderTeacherExtras(ew.lessonIterations[page-1],ew.lessonQuizzes[page-1],page,ew.doneLabels[page])
        : renderTeacherExtras(sw.lessonIterations[page-1],sw.lessonQuizzes[page-1],page,sw.doneLabels[page])}
      <nav class="pager">${page===1 ? '<a class="button" href="#intro">选择身份</a>' : link(page-1,isTeacherTrack?teacherPrevLabels[page]:isEnterpriseTrack?entPrevLabels[page]:stuPrevLabels[page],'button')}${page===4&&fifthPage(role)?link(fifthPage(role),isTeacherTrack?teacherNextLabels[4]:entNextLabels[4],'button primary'):link(page+1,page===4?'查看结课作品 →':(isTeacherTrack?teacherNextLabels[page]:isEnterpriseTrack?entNextLabels[page]:stuNextLabels[page]),'button primary')}</nav>`;
    bench=window.mountBrainBench(root.querySelector('#brain-workbench'),role,page,variant());
    const chart=root.querySelector('.recall-chart');
    if(chart)window.brainVocabulary.mount(chart);
    const hints = root.querySelector('#hide-hints');
    if (hints) {
      const guide = root.querySelector('#lesson-guide') || root.querySelector('.grid > .stack');
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
      const stage = root.querySelector('[data-stage][aria-pressed=true] strong')?.textContent;
      return ['课程：用第二大脑成为超级个体 · 共享通识。当前章节：'+l.title, l.lead,
        chapter===1?'开场：超级个体的定义、三级台阶、认知共生体研究远景与成为超级个体的阶段自测。'+(stage?'学员选择的阶段：'+stage+'。':''):'',
        bench?.context(), circleContext?'分身协作情境：'+circleContext.context():'',
        root.querySelector('.foundation-activity')?.textContent.replace(/\s+/g,' ').trim(), '讨论题：'+l.question,
        '请引导学员依据原件判断，把目标、推论与已验证的事实分开，并联系自己的日常资料。'].filter(Boolean).join('\n');
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
  function gotoSampleSlide(btn) {
    const slideNum = Number(btn.dataset.slideGo);
    const frame = root.querySelector('.teacher-studio iframe');
    frame?.contentWindow?.postMessage({channel, type:'host:sample-goto', page:slideNum}, '*');
    btn.closest('.teacher-outline')?.querySelectorAll('[data-slide-go]').forEach(item =>
      item.setAttribute('aria-current', item === btn ? 'step' : 'false'));
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('a,button');
    if (!target) return;
    if (target.dataset.slideGo) { gotoSampleSlide(target); return; }
    if (target.dataset.downloadStudentGuide) {
      const md=window.studentWorkshop?.guideMarkdown;
      if(md){
        const url=URL.createObjectURL(new Blob([md],{type:'text/markdown;charset=utf-8'}));
        const a=document.createElement('a');a.href=url;a.download='one-page-study-guide.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      }
      return;
    }
    if (target.dataset.downloadMd) {
      const d=window.enterpriseWorkshop?.deliverables[Number(target.dataset.downloadMd)]?.[variant()];
      if(d){
        const url=URL.createObjectURL(new Blob([d.markdown],{type:'text/markdown;charset=utf-8'}));
        const a=document.createElement('a');a.href=url;a.download=d.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      }
      return;
    }
    if (target.dataset.scrollSec) {
      document.getElementById(target.dataset.scrollSec)?.scrollIntoView({behavior:'smooth', block:'start'});
      return;
    }
    if (target.matches('.course-menu nav a') && target.origin===location.origin && target.pathname===location.pathname && target.hash && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      history.pushState(null,'',target.href);
      move(target.hash.slice(1));
    } else if (target.dataset.chapter || target.hasAttribute('data-review')) {
      event.preventDefault(); move(foundationRoute(Number(target.dataset.chapter || 1),destination));
    } else if (target.id === 'finish-foundation') {
      set('done','1','foundation'); move(destination);
    } else if (target.dataset.verdict) {
      const group = target.closest('.source-choice');
      group.querySelectorAll('[data-verdict]').forEach(b => b.setAttribute('aria-pressed',String(b===target)));
      const status = group.nextElementSibling;
      if (status?.classList.contains('answer')) { status.textContent = target.dataset.feedback || ''; status.dataset.result = target.dataset.verdict; }
    } else if (target.dataset.module) {
      const tour = target.closest('.module-tour'), i = Number(target.dataset.module), m = window.brainFoundation[chapter-1].modules[i];
      tour.querySelectorAll('[data-module]').forEach(b => b.setAttribute('aria-selected',String(b===target)));
      const img = tour.querySelector('.module-view img');
      img.src = 'assets/'+m[2]; img.alt = m[0];
      tour.querySelector('.module-view figcaption').textContent = m[4];
      tour.querySelector('.module-view p span').textContent = m[3];
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
    if (target.dataset.expect !== undefined) {
      const ok = target.value === target.dataset.expect;
      target.nextElementSibling.textContent = !target.value ? '' : ok ? '✓ 对' : '✗ 再想想';
      target.dataset.result = !target.value ? '' : ok ? 'right' : 'wrong';
      return;
    }
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
    if(event.data?.channel===channel && (event.data.type==='tool:sample-height' || event.data.type==='tool:sample-page')){
      const frame=root.querySelector('.teacher-studio iframe');
      if(!frame||event.source!==frame.contentWindow)return;
      if(event.origin!==new URL(frame.src).origin && event.origin!=='null')return;
      if(event.data.type==='tool:sample-page'){
        const p=Number(event.data.page);
        root.querySelectorAll('.teacher-outline [data-slide-go]').forEach(el=>el.setAttribute('aria-current',Number(el.dataset.slideGo)===p?'step':'false'));
        return;
      }
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
