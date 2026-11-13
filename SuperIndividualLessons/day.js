'use strict';
const $ = id => document.getElementById(id);
const currentRole = () => dayRoles[roleId];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const locations = {
  student: ['科学社 · 窗边的实验台', '两盆豆苗，相差三厘米。', '大家都说是阳光的功劳。我想先查查那天到底怎么种的。', '豆苗复测卡'],
  teacher: ['数学组 · 课后的办公室', '答对了，就真的懂了吗？', '十二个孩子，九个答对了。可听到这个理由，我决定换一道题。', '分数诊断题卡'],
  leader: ['校园 · 课后服务接送点', '报了名的家庭，都来了吗？', '三十户报名，签到表上只有十八户。我得先知道谁真的来了。', '试点决策单'],
  founder: ['创业公司 · 经营复盘会', '三份协议，几笔到账？', '经营会前，我想知道这三个数字，各自经得起哪份材料的追问。', '经营核验简报']
};
const shots = [
  {name:'现场',time:'09:00',seconds:6},
  {name:'委托',time:'09:05',seconds:12},
  {name:'对证',time:'10:30',seconds:0},
  {name:'建脑',time:'14:00',seconds:13},
  {name:'复跑',time:'14:10',seconds:12},
  {name:'交接',time:'17:30',seconds:10}
];
let roleId = 'student', shot = 0, started = false, playing = false, elapsed = 0, lastTick = 0, frame = 0;
let selectedSource = 0, answered = false, sound = false, spoken = '', builtPhase = -1;
function node(tag, cls, text) {
  const el = document.createElement(tag); if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}
function control(text, action, cls) {
  const b = node('button', cls, text); b.type = 'button'; b.onclick = action; return b;
}
function line() {
  const r = currentRole();
  return [locations[roleId][2],r.brief,r.pair.join(' '),'我收到一份新材料。先存出处，再把这次容易犯的错写成分身规则。',
    '现在开一个全新对话，把知识页和分身说明交给它。同样的问题，看看它改了哪里。',r.handoff][shot];
}
function silence() { if (sound && 'speechSynthesis' in window) speechSynthesis.cancel(); spoken = ''; }
function narrate() {
  if (!sound || !playing || spoken === line()) return;
  silence(); const voice = new SpeechSynthesisUtterance(line()); voice.lang = 'zh-CN';
  speechSynthesis.speak(voice); spoken = line();
}
function pause() {
  playing = false; cancelAnimationFrame(frame); silence();
  $('theater').classList.remove('running'); $('play').textContent = '▶ 播放';
}
function inspect(file, label) {
  pause(); $('large').src = 'assets/'+file+'.webp'; $('large').alt = label;
  $('viewer').showModal();
}
function evidencePane(r) {
  const box = node('div','documents');
  const tabs = node('div','files');
  r.sources.slice(0,2).forEach((source,i) => {
    const b = control(source.split('｜')[0], () => { selectedSource=i; renderShot(); });
    b.setAttribute('aria-pressed',i === selectedSource); tabs.append(b);
  });
  const paper = node('div','paper');
  const excerpt = r.sources[selectedSource].split('｜');
  paper.append(node('small','', '原始记录　/　' + (selectedSource+1) + ' of 2'),node('h3','',excerpt[0]));
  const rows = {
    student: [[['位置','记录高度'],['窗边','8 厘米'],['柜边','5 厘米']],[['实验条件','窗边','柜边'],['容器','大盆','小杯'],['水量','两盆不同','两盆不同']]],
    teacher: [[['离堂题','人数'],['答题','12'],['选对','9']],[['问题','口述理由'],['比较 ⅓ 与 ¼','“因为 3 比 4 小”'],['整体大小','未说明']]],
    leader: [[['课后服务','家庭数'],['两班报名','30']],[['首周签到','家庭数'],['至少到场一次','18'],['缺席原因','未记录']]],
    founder: [[['业务阶段','企业数'],['参加试用','8'],['签试点协议','3']],[['截至周四','状态'],['第 1 笔','已到账'],['其余两笔','到账时间待核']]]
  };
  const table = node('table');
  rows[roleId][selectedSource].forEach((row,i) => { const tr=node('tr'); row.forEach(cell=>tr.append(node(i?'td':'th','',cell)));table.append(tr); });
  paper.append(table,node('p','quote',excerpt[1]));box.append(tabs,paper); return box;
}
function appWindow(name, asset, sceneBody, phase = 2) {
  const shell=node('div','app-window'), top=node('div','window-top');
  top.append(node('span','window-mark','◈'),node('strong','',name),control('查看原始界面 ↗',()=>inspect(asset,name+' · 平台截图'),'original'));
  const space=node('div','app-space'), img=node('img','ui-shot');
  img.src='assets/'+asset+'.webp';img.alt=name+'原始界面';
  if (phase===0 && playing) {
    shell.classList.add('establish-ui');
    const pointer = node('span','screen-pointer','➤');
    pointer.setAttribute('aria-hidden','true');
    space.append(pointer);
  }
  const content=node('div','app-content');content.append(sceneBody);space.append(img,content);shell.append(top,space);
  return shell;
}
function sceneView(phase) {
  const r=currentRole(), copy=locations[roleId];
  const sheet=node('div','window-body');
  if (shot===1) {
    sheet.append(node('small','doc-path','新对话　/　'+copy[3]),node('p','chat-bubble',r.vague));
    if (phase>=1) sheet.append(node('p','reply','交给谁？希望对方拿到什么结果？'));
    if (phase>=2) {
      const draft=node('div','composer');draft.append(node('small','','补充委托'),node('p','typed',playing && !reduced.matches ? r.brief.slice(0,1) : r.brief));
      sheet.append(draft);
    }
    return appWindow('工作台 · AI 对话','workbench',sheet,phase);
  }
  if (shot===2) {
    const desk = evidencePane(r);
    const agent = node('div','agent-note');
    agent.append(node('strong','',r.agents[selectedSource]),node('span','',r.pair[selectedSource]));
    desk.prepend(agent);
    return appWindow('核验桌 · 两份原始材料','tools',desk);
  }
  if (shot===3) {
    sheet.append(node('small','doc-path','我的第二大脑　/　'+copy[3]),node('h3','','项目知识页'));
    const source=r.sources[2].split('｜');
    sheet.append(node('div','file-line','▤　'+source[0]+'.md'));
    if (phase>=1) sheet.append(node('p','change-line',source[1]));
    if (phase>=2) sheet.append(node('div','revision','＋ 写入分身规则　'+r.rule));
    return appWindow('第二大脑 · 写入依据','brain',sheet,phase);
  }
  if (shot===4) {
    sheet.append(node('small','doc-path',r.agents[1]+'　/　新对话'),node('h3','',copy[3]+' · 版本比较'),node('p','old-version','第一版　'+r.before));
    if (phase>=1) sheet.append(node('div','revision','修订版　'+r.after));
    if (phase>=2) sheet.append(node('small','doc-path','引用　'+r.sources[2].split('｜')[0]));
    return appWindow('工作台 · 分身复跑','workbench',sheet,phase);
  }
  if (shot===5) {
    const end=node('div','end-title');
    end.append(node('small','','17:30　/　交接现场'),node('h3','',copy[3]+'，交给下一位'),node('p','',r.handoff));
    if (phase>=2) end.append(control('查看圈子示意图',()=>inspect('circles','学校圈子与分身 · 组织示意图'),'end-link'));
    return end;
  }
  return null;
}
function drawPhase() {
  const duration=shots[shot].seconds;
  const phase=(!playing && elapsed===0 && shot!==0) || reduced.matches ? 2 : Math.min(2,Math.floor(3*elapsed/(duration||1)));
  if (builtPhase===phase) {
    const typed = $('shot-content').querySelector('.typed');
    if (typed && playing && !reduced.matches) {
      const limit = Math.ceil((elapsed - duration*2/3)*20);
      typed.textContent = currentRole().brief.slice(0, Math.max(1,limit));
    }
    return;
  }
  builtPhase=phase;
  const view=sceneView(phase);
  $('shot-content').replaceChildren(...(view?[view]:[]));
}
function renderShot() {
  const r=currentRole(), copy=locations[roleId];
  $('location-still').src='assets/'+roleId+(shot===5?'-end.webp':'-scene.webp'); $('location-still').alt=(shot===5?r.handoff:copy[0])+'，AI 生成的情景画面';
  $('clock').textContent=shots[shot].time; $('location').textContent=copy[0];
  $('role-label').textContent=r.label+'的工作日'; $('story-title').textContent=copy[1]; $('opening-line').textContent=copy[2];
  $('opening').hidden=shot!==0; $('start-film').hidden=started;
  $('shot-content').hidden=shot===0; $('screen').classList.toggle('closeup',shot>0 && shot<5);
  $('subtitle').hidden=shot===0 || shot===5;
  $('subtitle').textContent=shot===2?'先点开两份原始记录，再做判断。':line();
  $('choice').hidden=shot!==2;
  $('play').textContent=playing?'Ⅱ 暂停':'▶ 播放';
  $('next').textContent=shot===5?'去实操 ↗':'›';
  $('next').setAttribute('aria-label',shot===5?'去实操':'下一镜');
  $('previous').disabled=shot===0;
  [...$('timeline').children].forEach((b,i)=>b.setAttribute('aria-current',i===shot?'step':'false'));
  $('story-status').textContent='第 '+(shot+1)+' / 6 镜 · '+shots[shot].name+'　｜　情景图为 AI 生成，平台原图叠加教学演示。';
  builtPhase=-1;drawPhase();
}
function jump(index, auto=false) {
  pause();shot=index;elapsed=0;started=true;
  if (auto && shot!==2) { run(); } else renderShot();
}
function tick(now) {
  if (!playing) return;
  elapsed+=(now-lastTick)/1000;lastTick=now;
  if (elapsed>=shots[shot].seconds) {
    if (shot===5) { pause();elapsed=shots[shot].seconds;renderShot();$('story-status').textContent='短片结束。领取角色任务，或设立自己的任务。';return; }
    jump(shot+1,true);return;
  }
  drawPhase();frame=requestAnimationFrame(tick);
}
function run() {
  if (shot===2) {
    if (answered) jump(3,true);
    else { $('choice').scrollIntoView({block:'nearest'}); $('answers').firstElementChild.focus({preventScroll:true}); }
    return;
  }
  if (shot===5 && elapsed>=shots[shot].seconds) { jump(0,true);return; }
  started=true;playing=true;lastTick=performance.now();$('theater').classList.add('running');
  renderShot();narrate();frame=requestAnimationFrame(tick);
}
function selectRole(id) {
  pause();roleId=id;shot=0;elapsed=0;started=false;selectedSource=0;answered=false;
  const r=currentRole();
  for(const b of $('roles').children)b.setAttribute('aria-pressed',b.dataset.role===id);
  $('feedback').textContent='';$('answers').replaceChildren(...r.options.map((option,i)=>control(option,()=>{
    answered=i===r.correct;$('feedback').textContent=(answered?'判断有据。':'再核对一下。')+r.why;
    if (answered) $('feedback').append(' ',control('看下一镜 →',()=>jump(3,true)));
  })));
  $('example').textContent='领取'+r.label+'任务';renderShot();
}
for(const [id,r] of Object.entries(dayRoles)){
  const b=control(r.label,()=>selectRole(id));
  const img=node('img');img.alt='';img.src='assets/'+id+'-scene.webp';b.prepend(img);b.dataset.role=id;$('roles').append(b);
}
shots.forEach((s,i)=>$('timeline').append(control(s.name,()=>jump(i))));
$('play').onclick=()=>playing?pause():run();$('start-film').onclick=run;
$('previous').onclick=()=>jump(Math.max(0,shot-1));
$('next').onclick=()=>{if(shot<5) jump(shot+1);else{pause();$('practice').scrollIntoView();$('example').focus({preventScroll:true});}};
$('restart').onclick=()=>{selectRole(roleId);run();};
$('close').onclick=()=>$('viewer').close();
if ('speechSynthesis' in window) {
  $('sound').hidden=false;$('sound').onclick=()=>{silence();sound=!sound;$('sound').setAttribute('aria-pressed',sound);narrate();};
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('pagehide',pause);
selectRole('student');

const channel='aichat.external-tool.v1';
const wrapperOrigin=new URL(location.href).origin;
const embedded=parent!==window && /^https?:$/.test(location.protocol);
function sendWrapper(type,detail={}) {if(embedded)parent.postMessage({...detail,channel,type},wrapperOrigin);}
function fromWrapper(event){return embedded && event.source===parent && event.origin===wrapperOrigin && event.data?.channel===channel;}
window.addEventListener('message',event=>{
  if(!fromWrapper(event))return;
  const m=event.data;
  if(m.type==='host:always-on-top-support' && m.supported)sendWrapper('tool:always-on-top',{enabled:true});
  if(m.type==='host:get-tool-context')sendWrapper('tool:tool-context',{requestId:m.requestId,context:['超级个体培训课',currentRole().label,shots[shot].name,line()].join('\n')});
});
sendWrapper('tool:ready',{capabilities:['tool-context']});
