import {practicals, practicalPanel, practicalScript} from './practical-page.mjs';
import {teachingDesk} from './teaching-desk.mjs';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const batchSizes = [6,6,6,6,6,6,5,5,5,5];
export const studios = {};
const isText = value => typeof value === 'string' && value.trim().length > 0;
function validateLesson(id, lesson) {
  for (const field of ['artifact','reader','brief','revision','boundary']) {
    if (!isText(lesson[field])) throw Error(id + ' 缺少 ' + field);
  }
  for (const [field,count] of [['teacher',5],['student',5],['prompts',5],['choices',2]]) {
    const values = lesson[field];
    if (!Array.isArray(values) || values.length !== count || !values.every(isText)) throw Error(id+' 请检查 '+field);
  }
  if (!Array.isArray(lesson.materials) || lesson.materials.length < 3 || !lesson.materials.every(isText)) throw Error(id+' 请核对材料');
  if (!Array.isArray(lesson.cases) || lesson.cases.length !== 3) throw Error(id+' 请核对挑战题数量');
  for (const {question, options, answer, reason} of lesson.cases) {
    if (!isText(question) || !isText(reason) || !Array.isArray(options) || options.length !== 3 ||
        new Set(options).size !== 3 || !options.every(isText) || !Number.isInteger(answer) || !options[answer]) throw Error(id+' 请核对题干、选项、答案和依据');
  }
}
let ordinal = 0;
for (const [index,size] of batchSizes.entries()) {
  const batch = JSON.parse(read('studios/batch' + String(index + 1).padStart(2,'0') + '.json'));
  if (Object.keys(batch).length !== size) throw Error('第 '+(index+1)+' 批数量不符');
  for (let j = 0; j < size; j++, ordinal++) {
    const id = 'g'+(3+Math.floor(ordinal/8))+'-'+String(ordinal%8+1).padStart(2,'0');
    if (!batch[id]) throw Error('第 '+(index+1)+' 批缺少 '+id);
    validateLesson(id,batch[id]);
    studios[id] = batch[id];
  }
}

const phases = ['提问','选方案','备材料','做首版','试玩改版'];
const minutes = ['0–5','5–13','13–20','20–32','32–40'];
const runtime = read('studio-workshop.js');
const experimentRuntime = read('studio-experiments.js');
const experiments = {'g4-08':'用同一批十张卡重跑两条口令','g6-04':'用路线和停顿时间预测用时','g8-03':'手算后，运行词频分类器'};

function robotKit(id, lesson) {
  const lua = s => JSON.stringify(s);
  const questions = lesson.cases.map(c => '{q=' + lua(c.question) + ', options={' + c.options.map(lua).join(', ') + '}, correct=' + (c.answer+1) + ', evidence=' + lua(c.reason) + '}');
  const code = `local tests = {
    ${questions.join(',\n    ')}
}
setActorValue("sentientRadius", 0)
registerClickEvent(function()
    local index = ask("想复核哪一次测试？", {"基准", "改变条件", "换个场景"})
    local test = tests[index]
    if not test then return end
    local answer = ask(test.q, test.options)
    if not answer then return end
    if answer == test.correct then
        say("判断成立。" .. test.evidence, 6)
        turnTo(90)
    else
        say("停下核对材料。" .. test.evidence, 6)
        turnTo(0)
    end
end)`;
  const scene = `local s = createScene({name="${id.replace('-','_')}_review", dimensions={12,6,10}})
s:box({position={0,0,0}, dimensions={12,1,10}, blockId=62})
s:group("guide")
s:box({position={10,1,8}, dimensions={1,1,0.5}, size=0.25, color="#00786e"})
s:box({position={10,2,8}, dimensions={0.75,0.5,0.5}, size=0.25, color="#ffc45b"})
local model="blocktemplates/"..s.name.."_guide.x"
s:exportVoxelX(model,"guide")
s:requireModels({model})
local movie=s:movie({name="review",position={5,1,5},duration=2})
s:actor(movie,{name=s.name.."_guide",filename=model,position={7,1,5},scale=1,animId=0})
s:block({position={5,1,4},blockId=219})
s:editEntity(s:position({5,1,4}),function(entity)
    entity:SetDisplayName(s.name)
    entity:SetNPLCode([==[
${code}
]==])
end)
s:block({position={5,1,3},blockId=190,data=5})
return {lever=s:position({5,1,3}),movie=s:position({5,1,5})}`;
  const sections = [['行为脚本',code],['建景 Lua',scene],['MCP 调用参数',JSON.stringify({action:'run_code',clientId:'<当前客户端>',params:{expectedIdentity:{clientId:'<当前客户端>',worldPath:'<当前世界>',sessionId:'<当前会话>'},requestId:'<本次建景唯一编号>',code:scene}},null,2)]];
  return '<details class="studio-kit"><summary>在 Paracraft 搭一个本课复核站</summary><p>先开空白世界，把建景委托带入主对话。建好后打开拉杆，点向导选两种条件，核对它的台词和朝向。</p><button class="btn-open-paracraft-std">打开 Paracraft</button>' +
    sections.map(([name,src],i)=>'<details><summary>'+name+'</summary><button class="copy-code-btn" data-copy-target="studio-code-'+i+'">复制'+name+'</button><pre id="studio-code-'+i+'">'+escape(src)+'</pre></details>').join('') +
    '<button data-studio-scene data-chat-copy>和 AI 聊 · 建景委托</button></details>';
}

export function studioPage(id, teacher, platform, extra) {
  const practical = practicals[id];
  const original = studios[id];
  const l = practical ? {...original,artifact:practical.product,brief:practical.goal,revision:practical.revision,student:[...original.student.slice(0,3),practical.student,practical.revision]} : original;
  const handsOn = practical ? practicalPanel(id,teacher,platform) : '';
  const steps = teacher ? l.teacher : l.student;
  const training = l.revealAt == null ? l.materials : l.materials.filter((_,i) => !l.sealedMaterials.includes(i));
  const materials = training.map(m => '<li>'+escape(m)+' <button type="button" data-cite="'+l.materials.indexOf(m)+'">引用到本步记录</button></li>').join('');
  const options = l.choices.map((c,i) => '<option value="'+i+'">'+escape(c)+'</option>').join('');
  const panel = `<section class="studio" data-lesson="${id}" data-role="${teacher?'teacher':'student'}">
  <div class="studio-head"><small>${extra?'样板课拓展':teacher?'教师演示材料':'学生上机 · 我的作品'} · ${escape(l.reader)}</small><h2>${escape(practical?.product || l.artifact)}</h2><p>${escape(practical?.student || l.brief)}</p></div>
  ${id === 'g4-01' && !teacher ? read('leaf-lab.html') : ''}
  <div class="studio-layout"><aside><h3>桌上的材料</h3><ul data-materials>${materials}</ul>${l.revealAt == null ? '' : '<label>封存首版规则<textarea data-rule rows="2"></textarea></label><button data-reveal>锁定规则，打开测试夹</button><p data-seal-status role="status"></p>'}<p><b>使用约定</b>　${escape(l.boundary)}</p></aside>
  <div class="studio-bench"><nav aria-label="作品制作步骤">${phases.map((p,i)=>'<button data-phase="'+i+'">'+p+'</button>').join('')}</nav>
  <h3 data-phase-title></h3><p data-lead></p>
  ${!teacher && !extra ? '<div data-student-tools><div data-at="0"><label>我看完回复还想追问什么？<textarea data-followup rows="2"></textarea></label><button data-send-followup data-chat-copy>和 AI 聊 · 追问</button></div><div data-at="1"><p>先比较两个方案，再把选择理由记下来。</p></div><div data-at="2"><p>从材料区挑一条能支持你作品的依据，用“引用到本步记录”保存它，并写下你为什么选它。</p></div><div data-at="3"><p>做出首版后请同伴试一次。先记他做了什么，再问他原本想做什么。</p><button data-jump-work>打开本课制作台</button></div><div data-at="4"><p>'+escape(l.revision)+'</p><button data-jump-work>回制作台修改并重测</button></div></div>' : ''}
  <button data-read>朗读这一步</button><label>制作方案<select data-choice>${options}</select></label>
  ${teacher?'<button data-vote>为当前方案加一票</button> <output data-tally></output>':''}
  <label>本步委托，可改写<textarea data-prompt rows="5"></textarea></label><button data-chat-copy data-copy-prompt>和 AI 聊</button> <a data-studio-chat href="https://keepwork.com/chat" target="_blank" rel="noopener">打开 AIChat</a><p>复制后到 AIChat 主对话粘贴、确认并发送。</p>
  <button data-example>在本页模拟 AI 回复</button><p data-example-output hidden></p><label data-note-label for="studio-note"></label><textarea id="studio-note" aria-label="本步制作记录" data-note rows="2"></textarea>
  <button data-next>下一步</button></div></div>
  ${!teacher && practical ? (l.sealedMaterials ? '<div data-practical-seal data-exam-private hidden>'+handsOn+'</div>' : handsOn) : ''}
  ${l.revealAt == null ? '' : '<template data-sealed>'}<details class="studio-cases" ${l.revealAt == null ? '' : 'data-exam-private'} open><summary>用三道题检验作品</summary>${l.cases.map((c,i)=>`<div class="studio-case" data-case="${i}"><h3>${escape(c.question)}</h3>${c.options.map((v,j)=>'<button data-answer="'+j+'">'+escape(v)+'</button>').join('')}<p role="status"></p></div>`).join('')}</details>${l.revealAt == null ? '' : '</template>'}
  ${platform==='P' && !practical ? robotKit(id,l):''}
  ${platform==='A' ? `<details class="studio-returns"><summary>带回自己做的网页，比较两个版本</summary><p>从 AIChat 文件面板保存单文件 HTML，依次选取两版，用同一道题试玩。其他格式的作品请在原工具中打开，在第五步记下结果。</p>
  ${[1,2].map(v=>'<label>我的第 '+v+' 版网页<input type="file" accept=".html,.htm,text/html" data-return="'+v+'"></label><button data-preview="'+v+'">试玩第 '+v+' 版</button>').join('')}<p role="status" data-preview-status></p><div data-player></div></details>`:''}
  ${experiments[id] ? '<section class="studio-handoff" data-experiment><h3>'+experiments[id]+'</h3><div data-controls></div><button>运行课内实验</button><output aria-live="polite"></output></section>' : ''}
  <div class="studio-handoff"><h3>请同伴试玩</h3><p>${escape(l.revision)}</p>
  ${!teacher && !extra ? '<div data-peer-review><label>第一版 · 同伴在哪一步停下？记下他的动作或原话<textarea data-peer="trial"></textarea></label><label>第二版 · 我只改这一处<textarea data-peer="change"></textarea></label><label>用相同输入重试 · 这次实际发生了什么？<textarea data-peer="retest"></textarea></label></div>':''}
  <label>留给试玩者的一句操作指引<textarea data-hint rows="2"></textarea></label>
  <details><summary>给验收卡加一道自己的试玩任务</summary><label>让同伴做哪个动作？<textarea data-own-task rows="2"></textarea></label><label>做完应该看到什么？<textarea data-own-result rows="2"></textarea></label></details>
  <button data-card="1">保存第一版验收卡</button><button data-card="2">保存第二版验收卡</button>
  <button data-studio-record>导出制作记录</button><p role="status" data-status></p></div></section>`;
  return {body:extra?'<details class="studio-extra" id="studio-extension"><summary>拓展挑战 · '+escape(l.artifact)+'</summary>'+panel+'</details>':teacher ? teachingDesk(id,l,practical,handsOn)+'<details data-teacher-kit><summary>打开教师演示工具与原有制作记录</summary>'+panel+'</details>' : panel,
    script:'(() => {const lesson='+JSON.stringify(l).replaceAll('<','\\u003c')+', steps='+JSON.stringify(steps).replaceAll('<','\\u003c')+', phases='+JSON.stringify(phases)+', minutes='+JSON.stringify(minutes)+';\n'+runtime+'\n'+(id === 'g4-01' ? read('leaf-lab.js') : experiments[id] ? experimentRuntime : '')+'\n})();'+(teacher && !extra ? '\n'+read('teaching-desk.js') : '')+(practical ? practicalScript(id,teacher,platform):'')};
}
