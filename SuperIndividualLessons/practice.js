'use strict';
const prefix = 'super-individual-lessons.task.';
const fields = ['title','brief','materials','roles','decision','knowledge','agent','change','review','pilot'];
const labels = ['任务','委托与验收','材料','分身分工','判断与依据','知识与出处','分身说明','新材料与复跑','交接与改进','服务试点卡'];
const tasks = new Map();
let active = null, latestSave = '', savedInBrowser = true;
const sheet = $('sheet'), selector = $('tasks');
function key() { return crypto.randomUUID(); }
function validTask(t) {
  return t && typeof t.id === 'string' && /^[a-f0-9-]{36}$/i.test(t.id) && Object.hasOwn(dayRoles,t.role)
    && fields.every(f => typeof t[f] === 'string');
}
function addStored(records) {
  for (const t of records) if (validTask(t) && !tasks.has(t.id)) tasks.set(t.id,t);
  listTasks();
}
function listTasks() {
  selector.replaceChildren(new Option(tasks.size ? '选择已保存的任务' : '还没有任务', ''));
  for (const t of tasks.values()) selector.add(new Option((t.done ? '✓ ' : '') + (t.title || '未命名任务') + ' · ' + dayRoles[t.role].label, t.id));
  selector.value = active?.id || '';
}
function edit(t) {
  active = t;
  sheet.hidden = !t;
  if (t) {
    selectRole(t.role);
    $('update-source').textContent = dayRoles[t.role].sources[2];
    $('update-material').open = false;
    $('sheet-title').textContent = dayRoles[t.role].label + ' · 我的任务卡';
    for (const f of fields) sheet.elements.namedItem(f).value = t[f];
    $('done').textContent = t.done ? '重新打开任务' : '标记完成';
  }
  listTasks();
}
function save() {
  const t = active;
  if (!t) return;
  tasks.set(t.id,t);
  try {
    localStorage.setItem(prefix+t.id,JSON.stringify(t));
    $('task-status').textContent = '已保存在当前浏览器。';
  } catch {
    if (embedded) {
      latestSave = key();
      sendWrapper('tool:cache:set',{key:prefix+t.id,requestId:latestSave,value:t});
      $('task-status').textContent = '正在保存任务…';
      clearTimeout(save.timeout);
      save.timeout = setTimeout(() => {
        if (latestSave) $('task-status').textContent = '当前窗口尚未确认保存，可下载任务卡。';
      },2200);
    } else $('task-status').textContent = '浏览器存储不可用，可下载任务卡保存。';
  }
}
function create(example) {
  const r = currentRole();
  const t = Object.fromEntries(fields.map(f => [f,'']));
  Object.assign(t,{id:key(),role:roleId,done:false});
  if (example) Object.assign(t, {
    title:r.task,brief:r.brief,materials:r.sources.slice(0,2).join('\n'),roles:r.pair.join('\n'),
    agent:'职责：' + r.agents.join('与') + '。依据上述材料，输出带来源的结论和待确认项。'
  });
  tasks.set(t.id,t); edit(t); save();
  sheet.elements.namedItem('title').focus();
}
$('example').onclick = () => create(true);
$('new').onclick = () => create(false);
selector.onchange = () => edit(tasks.get(selector.value));
sheet.onsubmit = e => e.preventDefault();
sheet.oninput = e => {
  if (!active || !fields.includes(e.target.name)) return;
  active[e.target.name] = e.target.value;
  if (e.target.name === 'title') listTasks();
  save();
};
function lines(items) {
  return items.map(f => labels[fields.indexOf(f)] + '：' + (active[f] || '待填写')).join('\n\n');
}
for (const btn of sheet.querySelectorAll('[data-copy]')) btn.onclick = async () => {
  const items = btn.dataset.copy === 'brief' ? ['title','brief','materials','roles'] : ['brief','materials','knowledge','agent','change'];
  const text = lines(items);
  try { await navigator.clipboard.writeText(text); $('task-status').textContent = '已复制，可以粘贴到惯用的 AI 对话。'; }
  catch {
    const area = $('copy-text'); area.hidden = false; area.value = text; area.focus(); area.select();
    $('task-status').textContent = '请复制下方已选中的文字。';
  }
};
$('done').onclick = () => {
  if (!active.done && (!active.title.trim() || !active.review.trim())) {
    $('task-status').textContent = '先写下任务名称和一次交接结果，再标记完成。';
    sheet.elements.namedItem(active.title.trim() ? 'review' : 'title').focus(); return;
  }
  active.done = !active.done; save(); edit(active);
};
$('download').onclick = () => {
  const a = document.createElement('a');
  const r = dayRoles[active.role];
  const url = URL.createObjectURL(new Blob(['超级个体培训课 · '+r.label+'\n\n'+lines(fields)],{type:'text/plain;charset=utf-8'}));
  a.href = url; a.download = (active.title || '我的任务卡').replace(/[\\/:*?"<>|]/g,'_')+'.txt'; a.click();
  setTimeout(() => URL.revokeObjectURL(url),30000);
};
try {
  const records = [];
  for (let i=0; i<localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(prefix)) { try { records.push(JSON.parse(localStorage.getItem(k))); } catch {} }
  }
  addStored(records);
} catch { savedInBrowser = false; listTasks(); }
if (!savedInBrowser && embedded) {
  const readId = key();
  window.addEventListener('message', e => {
    if (!fromWrapper(e) || e.data.type !== 'host:cache') return;
    const m = e.data;
    if (m.requestId === readId && Array.isArray(m.value)) addStored(m.value);
    if (m.requestId === latestSave) {
      latestSave = ''; clearTimeout(save.timeout);
      $('task-status').textContent = m.ok ? '已保存在当前浏览器。' : '浏览器存储不可用，可下载任务卡保存。';
    }
  });
  sendWrapper('tool:cache:get',{key:prefix,requestId:readId});
}
