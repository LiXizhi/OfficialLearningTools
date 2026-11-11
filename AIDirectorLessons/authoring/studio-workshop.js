// Included in the standalone lesson with its own content and role.
const root = document.querySelector('.studio[data-lesson]');
const get = selector => root.querySelector(selector);
const all = selector => [...root.querySelectorAll(selector)];
const storageKey = 'director-studio-v1/' + root.dataset.lesson + '/' + root.dataset.role;
let draft = {};
try { draft = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch {}
const state = Object.assign({ownTask:'', ownResult:'', phase:0, choice:0, votes:[0,0], prompts:{}, notes:{}, answers:{}, hint:'', versions:{}}, draft);
const status = message => { get('[data-status]').textContent = message; };
function persist() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { status('此窗口无法保存草稿。离开前请导出制作记录。'); }
}
if (window !== parent) get('[data-studio-chat]').hidden = true;
for (const [selector, field] of [['[data-own-task]','ownTask'],['[data-own-result]','ownResult']]) {
    const input = get(selector);
    input.value = state[field];
    input.oninput = () => { state[field] = input.value; persist(); };
}
const noteLabels = ['我问了什么？看完回答后还想追问什么？','我选了哪个方案？为什么？','我实际使用的材料、来源和取舍','第一版的位置与实际试玩结果','同伴的原话、改动和同一条件下的重测结果'];
function prompt() {
    const material = lesson.revealAt != null ? lesson.materials.filter((_,i) => !lesson.sealedMaterials.includes(i)) : lesson.materials;
    const prefix = [lesson.brief, '我选的方案：' + lesson.choices[state.choice], ...material];
    if (state.phase && state.notes[state.phase-1]) prefix.push('上一步记录：' + state.notes[state.phase-1]);
    return [...prefix,lesson.prompts[state.phase]].join('\n');
}
window.directorStudioContext = () => {
    if (root.closest('details:not([open])')) return '';
    return ['当前作品：'+lesson.artifact, '当前步骤：'+phases[state.phase], '我的方案：'+lesson.choices[state.choice],
        ...phases.map((name,i)=>[name,steps[i],state.prompts[i+'/'+state.choice] ?? lesson.prompts[i],state.notes[i]].filter(Boolean).join('｜'))].join('\n');
};
const followup = get('[data-followup]');
if (followup) {
    followup.value=state.followup || '';
    followup.oninput=()=>{state.followup=followup.value;persist();};
    get('[data-send-followup]').onclick=()=>copyLessonChatText(followup.value);
    all('[data-jump-work]').forEach(b=>b.onclick=()=>{
        const tools=get('.studio-returns') || get('.studio-kit');
        tools.open=true;tools.scrollIntoView({block:'start'});
    });
}
function render() {
    all('[data-at]').forEach(el=>el.hidden=Number(el.dataset.at)!==state.phase);
    all('[data-phase]').forEach((b,i) => b.setAttribute('aria-current', i === state.phase ? 'step' : 'false'));
    get('[data-choice]').value = state.choice;
    get('[data-phase-title]').textContent = (state.phase+1) + '/5　' + phases[state.phase] + (root.dataset.role === 'teacher' ? ' · ' + minutes[state.phase] + ' 分钟' : '');
    get('[data-lead]').textContent = steps[state.phase];
    get('[data-prompt]').value = state.prompts[state.phase + '/' + state.choice] ?? prompt();
    get('[data-note-label]').textContent = noteLabels[state.phase];
    get('[data-note]').value = state.notes[state.phase] || '';
    get('[data-next]').textContent = state.phase === 4 ? '到同伴试玩区' : '下一步';
    get('[data-example-output]').hidden = true;
    if (get('[data-tally]')) get('[data-tally]').textContent = state.votes.map((v,i) => lesson.choices[i] + ' ' + v + '票').join(' / ');
}
function choosePhase(i) {
    if (lesson.revealAt != null && i >= lesson.revealAt && !state.sealedRule) {
        get('[data-seal-status]').textContent = '请先记录并锁定首版规则，才打开测试夹。';
        get('[data-rule]').focus(); return;
    }
    state.phase = i; persist(); render(); }
all('[data-phase]').forEach((b,i) => b.onclick = () => choosePhase(i));
get('[data-next]').onclick = () => state.phase < 4 ? choosePhase(state.phase+1) : get('[data-hint]').focus();
get('[data-materials]').onclick = e => {
    const button = e.target.closest('[data-cite]');
    if (!button) return;
    const note = get('[data-note]');
    note.value = [note.value, '依据：'+lesson.materials[Number(button.dataset.cite)]].filter(Boolean).join('\n');
    state.notes[state.phase] = note.value; persist(); note.focus();
};
get('[data-note]').oninput = e => { state.notes[state.phase] = e.target.value; persist(); };
get('[data-choice]').onchange = e => { state.choice = Number(e.target.value); persist(); render(); };
get('[data-prompt]').oninput = e => { state.prompts[state.phase + '/' + state.choice] = e.target.value; persist(); };
get('[data-copy-prompt]').onclick = () => copyLessonChatText(get('[data-prompt]').value);
if (get('[data-studio-scene]')) get('[data-studio-scene]').onclick = () => copyLessonChatText('请在我确认的空白世界中搭建《' + lesson.artifact + '》配套复核站，先读世界状态和创建能力，按实际客户端、世界和会话身份填写调用模板，生成本次请求编号。运行后检查任务结果，告诉我如何开拉杆试玩。\n' + get('#studio-code-2').textContent);
get('[data-read]').onclick = () => {
    if (!window.speechSynthesis) { status('设备未提供朗读，请读当前步骤的文字。'); return; }
    speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(steps[state.phase]);
    voice.lang = 'zh-CN'; speechSynthesis.speak(voice);
};
if (get('[data-vote]')) get('[data-vote]').onclick = () => { state.votes[state.choice]++; persist(); render(); };
get('[data-example]').onclick = () => {
    if (get('[data-sealed]')) {
        const output = get('[data-example-output]'); output.hidden = false;
        output.textContent = '课内示例 · ' + lesson.materials.find((_,i) => !lesson.sealedMaterials.includes(i)); return;
    }
    const examples = [lesson.cases[0].question, '可先试「'+lesson.choices[state.choice]+'」。验收时这样做：'+lesson.revision,
        lesson.materials.join('\n'), lesson.cases[0].reason, lesson.cases[1].reason];
    const output = get('[data-example-output]');
    output.textContent = '课内示例 · ' + examples[state.phase]; output.hidden = false;
};
function answer(box, index) {
    const c = lesson.cases[Number(box.dataset.case)];
    box.querySelectorAll('button').forEach((button,j) => button.setAttribute('aria-pressed',String(j === index)));
    box.querySelector('p').textContent = (index === c.answer ? '判断成立。' : '再核对一次。') + c.reason;
}
function bindCases() { all('[data-case]').forEach((box,i) => {
    if (Number.isInteger(state.answers[i])) answer(box,state.answers[i]);
    box.querySelectorAll('button').forEach((b,j) => b.onclick = () => { state.answers[i] = j; answer(box,j); persist(); });
});
}
function revealCases() {
    const sealed = get('[data-sealed]');
    if (sealed) sealed.replaceWith(sealed.content);
}
function unseal() {
    const sealed = get('[data-sealed]');
    if (!sealed) return;
    const twoLocks = root.dataset.lesson === 'g7-05';
    if (!twoLocks || state.predictions) revealCases();
    for (const text of lesson.materials.filter((_,i) => lesson.sealedMaterials.includes(i))) {
        if (twoLocks && text.startsWith('封签答案') && !state.predictions) {
            const panel = document.createElement('div'); panel.dataset.examPrivate='';
            const fields = ['09','10','11','12'].map(number => {
                const label = document.createElement('label'); label.textContent=number+' 号预测';
                const input = document.createElement('select');
                for (const value of ['请选择','报修','预约']) input.add(new Option(value,value));
                label.append(input); panel.append(label); return input;
            });
            const lock = document.createElement('button'); lock.textContent='锁定四个预测，揭晓真值';
            panel.append(lock); get('[data-seal-status]').after(panel);
            lock.onclick = () => {
                if (fields.some(f=>f.selectedIndex===0)) {get('[data-seal-status]').textContent='请先预测四题。';return;}
                state.predictions=fields.map(f=>f.value);persist();panel.remove();revealCases();bindCases();
                const answer=document.createElement('li');answer.dataset.examPrivate='';answer.textContent=text;get('[data-materials]').append(answer);
                get('[data-seal-status]').textContent='已锁定四次预测：'+state.predictions.join(' / ');
            };
            continue;
        }
        const li = document.createElement('li'); li.dataset.examPrivate = ''; li.textContent = text+' ';
        const cite = document.createElement('button'); cite.dataset.cite=lesson.materials.indexOf(text); cite.textContent='引用到本步记录';
        li.append(cite); get('[data-materials]').append(li);
    }
    get('[data-rule]').readOnly = true;
    get('[data-rule]').value = state.sealedRule;
    get('[data-reveal]').disabled = true;
    get('[data-seal-status]').textContent = state.predictions ? '已锁定四次预测：'+state.predictions.join(' / ') : '首版规则已锁定，保留这次结果供重测对照。';
}
if (get('[data-reveal]')) {
    if (state.sealedRule) unseal();
    else {
        get('[data-rule]').value = state.ruleDraft || '';
        get('[data-rule]').oninput = e => { state.ruleDraft = e.target.value; persist(); };
        get('[data-reveal]').onclick = () => {
            const rule = get('[data-rule]').value.trim();
            if (!rule) { get('[data-seal-status]').textContent = '先写下首版规则。'; return; }
            state.sealedRule = rule; unseal(); bindCases(); choosePhase(lesson.revealAt);
        };
    }
}
bindCases();
const returned = new Map();
all('[data-return]').forEach(input => {
    input.onchange = async () => {
        const file = input.files[0];
        const version = input.dataset.return;
        returned.delete(version);
        if (!file) return;
        const notice = get('[data-preview-status]');
        if (file.size > 5 * 1024 * 1024) { notice.textContent = '请选择 5 MB 以内的单文件网页。'; return; }
        try {
            const source = await file.text();
            if (input.files[0] !== file) return;
            returned.set(version,source);
            notice.textContent = '第 '+version+' 版已就绪，点击试玩。离开时请保留原文件。';
        } catch { notice.textContent = '读取失败，请重新选取文件。'; }
    };
});
all('[data-preview]').forEach(button => {
    button.onclick = () => {
        const version = button.dataset.preview;
        const source = returned.get(version);
        const notice = get('[data-preview-status]');
        if (!source) { notice.textContent = '请先选择第 '+version+' 版网页。'; return; }
        const frame = document.createElement('iframe');
        frame.title = '我的第 '+version+' 版作品';
        frame.setAttribute('sandbox','allow-scripts');
        frame.referrerPolicy = 'no-referrer';
        frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; form-action 'none'; base-uri 'none'">` + source;
        get('[data-player]').replaceChildren(frame);
        notice.textContent = '正在试玩第 '+version+' 版。';
    };
});
const peerNotes = state.peerNotes || (state.peerNotes = {});
all('[data-peer]').forEach(field=>{
    const key=field.dataset.peer;
    field.value=peerNotes[key] || '';
    field.oninput=()=>{peerNotes[key]=field.value;persist();};
});
const hint = get('[data-hint]');
hint.value = state.hint;
hint.oninput = () => { state.hint = hint.value; persist(); };
function download(name, content, mime) {
    const url = URL.createObjectURL(new Blob([content], {type:mime}));
    const a = document.createElement('a'); a.href = url; a.download = root.dataset.lesson + '-' + name;
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url),30000);
}
const escape = v => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function makeCard(version) {
    const snapshot = state.versions[version];
    const title = lesson.artifact + ' · 同伴验收卡 V' + version;
    const personal = snapshot.task ? '<h2>作者出的试玩任务</h2><p>'+escape(snapshot.task)+'</p><details><summary>试过后核对预期</summary>'+escape(snapshot.result)+'</details>' : '';
    const questions = lesson.cases.map(c => '<fieldset><legend>'+escape(c.question)+'</legend>'+c.options.map((o,i) =>
        '<button data-answer="'+String(i === c.answer)+'">'+escape(o)+'</button>').join('')+'<output data-reason="'+escape(c.reason)+'"></output></fieldset>').join('');
    const script = "document.addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(!b)return;const o=b.parentNode.querySelector('output');o.textContent=(b.dataset.answer==='true'?'判断成立。':'再试一次。')+o.dataset.reason})";
    return '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escape(title)+'</title><style>body{margin:2rem auto;padding:0 1rem;max-width:48rem;font:18px/1.7 system-ui;color:#163e3c}fieldset{margin:1rem 0}button{font:inherit;margin:.3rem;padding:.4rem}output{display:block}</style><h1>'+escape(title)+'</h1><p>'+escape(lesson.brief)+'</p><p>'+escape(snapshot.choice)+'</p><p>'+escape(snapshot.hint)+'</p><ul>'+lesson.materials.map(m=>'<li>'+escape(m)+'</li>').join('')+'</ul>'+personal+questions+'<script>'+script+'<'+ '/script></html>';
}
all('[data-card]').forEach(b => b.onclick = () => {
    const version = Number(b.dataset.card);
    if (get('[data-sealed]')) { status('请先完成封存测试再保存验收卡。'); return; }
    if (version === 2 || !state.versions[version]) {
        if (!state.hint.trim()) { status('先写下给试玩者的指引。'); hint.focus(); return; }
        if (version === 2 && !state.versions[1]) { status('先保存第一版，再修改指引并重测。'); return; }
        if (Boolean(state.ownTask.trim()) !== Boolean(state.ownResult.trim())) { status('自编任务请同时写操作和预期结果。'); return; }
        if (version === 2 && state.versions[1].hint === state.hint.trim() && state.versions[1].task === state.ownTask.trim() && state.versions[1].result === state.ownResult.trim()) { status('请根据同伴的反馈修改指引或试玩任务，再保存第二版。'); return; }
        state.versions[version] = {hint:state.hint.trim(),task:state.ownTask.trim(),result:state.ownResult.trim(),choice:lesson.choices[state.choice]}; persist();
    }
    download('同伴验收卡-V'+version+'.html',makeCard(version),'text/html;charset=utf-8');
    status('已导出第'+version+'版验收卡。请单独打开文件，交给同伴试玩。');
});
get('[data-studio-record]').onclick = () => {
    const lines = [lesson.artifact,lesson.brief,...(state.followup ? ['我的追问：'+state.followup] : []),'我选的方案：'+lesson.choices[state.choice],...(state.sealedRule ? ['冻结的首版规则：'+state.sealedRule] : []),...(state.predictions ? ['首次预测：'+state.predictions.join(' / ')] : []),...phases.map((p,i)=>p+'：'+(state.notes[i] || '尚未记录')),
        ...(get('[data-sealed]') ? [] : lesson.cases).map((c,i)=>c.question+'　我的选择：'+(c.options[state.answers[i]] ?? '尚未作答')),
        ...Object.entries({trial:'首版试玩',change:'单项修改',retest:'同条件重测'}).filter(([k])=>peerNotes[k]).map(([k,title])=>title+'：'+peerNotes[k]),
        ...Object.entries(state.versions).map(([v,s])=>'V'+v+' 验收卡指引：'+s.hint+(s.task?'　自编任务：'+s.task+'　预期：'+s.result:'')),'使用约定：'+lesson.boundary];
    download('制作记录.txt',lines.join('\n\n'),'text/plain;charset=utf-8'); status('已导出当前制作记录。');
};
render();
