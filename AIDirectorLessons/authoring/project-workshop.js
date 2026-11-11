// Inlined with the lesson's data in each standalone worksheet.
const el = id => document.getElementById(id);
const storeKey = 'director-workshop-v1/' + lesson.id + '/' + (teacher ? 'teacher' : 'student');
const state = {step:0, plan:lesson.choices[0], hint:lesson.sampleHint, notes:[], drafts:[], follows:[], votes:[0,0]};
try { Object.assign(state, JSON.parse(localStorage.getItem(storeKey))); } catch {}
const save = () => {
  document.querySelectorAll('[data-record]').forEach(line => {
    const i = +line.dataset.record;
    line.textContent = lesson.steps[i][6]+'：'+(state.notes[i] || '未记录');
  });
  try { localStorage.setItem(storeKey, JSON.stringify(state)); }
  catch { el('status').textContent = '浏览器无法保留草稿，离开前请保存制作记录。'; }
};
const escape = text => String(text).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function download(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], {type}));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function makeCard() {
  const revised = state.step === 4;
  const name = lesson.artifact + (revised ? ' · 第二版' : ' · 第一版');
  const shell = '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + name + '</title><style>body{max-width:48rem;margin:auto;padding:16px;background:#fffdf4;color:#173e37;font:17px/1.55 system-ui}h1{font-size:1.35em}details,fieldset{margin:10px 0;padding:10px;border:1px solid #899e90}summary,button{cursor:pointer}button{font:inherit;margin:4px;padding:5px}output{display:block}</style><h1>' + name + '</h1>';
  if (gate) {
    return shell + '<p>校门纸卡模拟 · 你是新生。先出示星星卡，再试着遮住它。</p><details><summary>★ 出示清晰校牌</summary>' +
      (state.plan === lesson.choices[0] ? '机器人说：“早上好，欢迎来到星星班！”' : '机器人向前一步，挥手迎接你。') +
      '</details><details><summary>▧ 遮住校牌</summary>机器人停在原地，对你说：“' + escape(revised ? state.hint : '我看不清，请稍等。') + '”</details></html>';
  }
  const cases = [
    ['演出在哪？','在学校大礼堂。',0,1], ['门票多少钱？','十元。',1,1],
    ['门票多少钱？','公告未说明票价。',2,2], ['演出场馆在哪？','公告未说明地点。',3,2]
  ];
  if (state.plan === lesson.choices[1]) cases.unshift(cases.splice(1,1)[0]);
  const labels = ['有据答对','无据编造','合理拒答','有据漏答'];
  const quiz = cases.map(([q,a,on,off]) => '<fieldset data-on="'+on+'" data-off="'+off+'"><legend>'+q+'</legend><p>固定答复：'+a+'</p>'+labels.map((l,i)=>'<button data-index="'+i+'">'+l+'</button>').join('')+'<output aria-live="polite"></output></fieldset>').join('');
  const behavior = () => {
    const toggle = document.querySelector('input');
    if (toggle) toggle.onchange = () => {
      document.querySelector('#e2').hidden = toggle.checked;
      document.querySelectorAll('output').forEach(out => { out.textContent = ''; });
    };
    document.querySelectorAll('fieldset').forEach(box => {
      box.onclick = e => {
        if (!e.target.matches('button')) return;
        const expected = toggle?.checked ? box.dataset.off : box.dataset.on;
        const locationCase = box.dataset.on === '0' || box.dataset.on === '3';
        const evidence = locationCase ? (toggle?.checked ? '当前公告没有地点依据。' : 'E2 明确写了学校大礼堂。') : '三条公告都没有说明票价。';
        box.querySelector('output').textContent = (e.target.dataset.index === expected ? '判断成立。' : '再核对一次。') + evidence;
      };
    });
  };
  return shell + '<p>E1　本周六 14:00 举行科技节演出。<br><span id="e2">E2　地点在学校大礼堂。<br></span>E3　现场设 AI 体验区。</p>' +
    (revised ? '<label><input type="checkbox">撤掉地点证据 E2</label><p>'+escape(state.hint)+'</p>' : '') +
    quiz + '<script>('+behavior.toString()+')()<'+ '/script></html>';
}
function prompt() {
  const earlier = state.notes.slice(0,state.step).filter(Boolean).join('；');
  return [lesson.material, '我的选择：'+state.plan, earlier && '之前的制作记录：'+earlier, lesson.steps[state.step][4],
    state.step === 4 && '第二版的文字：'+state.hint].filter(Boolean).join('\n');
}
function showStep(index, focus = false) {
  state.step = index;
  const row = lesson.steps[index];
  document.querySelectorAll('[data-step]').forEach(btn => {
    if (+btn.dataset.step === index) btn.setAttribute('aria-current','step');
    else btn.removeAttribute('aria-current');
  });
  el('phase').textContent = teacher ? ['0–5 分钟','5–13 分钟','13–20 分钟','20–32 分钟','32–40 分钟'][index] : '我的制作进度 · ' + (index + 1) + ' / 5';
  el('heading').textContent = row[1];
  el('lead').textContent = row[teacher ? 2 : 3];
  el('note-label').textContent = row[6];
  el('note').value = state.notes[index] || '';
  el('plan').value = state.plan;
  el('hint').value = state.hint;
  el('request').value = state.drafts[index] ?? prompt();
  el('recompose').hidden = state.drafts[index] == null;
  el('follow').value = state.follows[index] ?? [
    '请换一个例子，让我先猜，再解释。',
    '我选“'+state.plan+'”。请把这项选择写进验收步骤。',
    '这幅图缩小后，哪个地方最容易看不清？',
    '我试了一次，观察到：'+(state.notes[index] || '（补上实际现象）'),
    '请对照第一版，帮我核查这次只改了哪一个条件。'
  ][index];
  el('next').textContent = index < 4 ? '下一步 · '+lesson.steps[index+1][0] : '保存制作记录';
  el('sample-output').textContent = row[5];
  el('sample-output').hidden = el('prototype').hidden = true;
  el('hint').hidden = el('hint').labels[0].hidden = index !== 4;
  el('status').textContent = '';
  if (teacher) el('votes').textContent = lesson.choices.map((s,i)=>s+' '+state.votes[i]+' 票').join(' / ');
  save();
  if (focus) el('desk').focus();
}
el('begin').onclick = () => showStep(state.step,true);
document.querySelectorAll('[data-step]').forEach(btn => { btn.onclick = () => showStep(+btn.dataset.step,true); });
el('note').oninput = e => { state.notes[state.step] = e.target.value; save(); };
el('request').oninput = e => { state.drafts[state.step] = e.target.value; el('recompose').hidden = false; save(); };
el('plan').onchange = e => {
  state.plan = e.target.value;
  showStep(state.step);
};
el('hint').oninput = e => {
  state.hint = e.target.value;
  if (state.drafts[state.step] == null) el('request').value = prompt();
  document.querySelector('#prototype iframe').srcdoc = makeCard();
  save();
};
if (teacher) el('vote').onclick = () => {
  state.votes[lesson.choices.indexOf(state.plan)]++;
  showStep(state.step);
};
el('recompose').onclick = () => { delete state.drafts[state.step]; showStep(state.step); };
el('follow').oninput = e => { state.follows[state.step] = e.target.value; save(); };
el('copy-follow').onclick = () => copyLessonChatText(el('follow').value);
el('open-materials').onclick = () => {
  el('materials').open = true;
  el('materials').scrollIntoView();
};
el('copy').onclick = () => copyLessonChatText(el('request').value);
el('example').onclick = () => {
  el('sample-output').hidden = false;
  if (state.step < 3) return;
  el('prototype').hidden = false;
  document.querySelector('#prototype iframe').srcdoc = makeCard();
  el('export').textContent = '保存'+(state.step === 3 ? '第一' : '第二')+'版示例 HTML';
};
el('export').onclick = () => download(lesson.id+'-v'+(state.step-2)+'.html', makeCard(), 'text/html');
el('speak').onclick = () => {
  if (!window.speechSynthesis) { el('status').textContent = '此浏览器无法朗读，请阅读上方引导。'; return; }
  speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(el('lead').textContent);
  speech.lang = 'zh-CN';
  speechSynthesis.speak(speech);
};
el('next').onclick = () => {
  if (state.step < 4) return showStep(state.step+1,true);
  const record = lesson.steps.map((row,i)=>row[6]+'：'+(state.notes[i]?.trim() || '未记录')).join('\n');
  download(lesson.id+'-制作记录.txt', [lesson.artifact, '选择：'+state.plan, record].join('\n'), 'text/plain;charset=utf-8');
};
showStep(state.step);
