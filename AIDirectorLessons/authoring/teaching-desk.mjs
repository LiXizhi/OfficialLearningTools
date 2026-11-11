import {readFileSync} from 'node:fs';
const read = name => readFileSync(new URL(name, import.meta.url),'utf8');
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

export function teachingDesk(id,lesson) {
    const phases = ['提出问题','全班定计划','准备与演示','交给试玩者','改版与离堂'];
    const times = ['0–5','5–13','13–20','20–32','32–40'];
    const leaf = id==='g4-01';
    const evidence = lesson.materials.filter((_,i)=>!lesson.sealedMaterials?.includes(i));
    const intro = leaf ? '先让全班预测：拿走训练照片，已经学好的助手会立刻忘记吗？第三轮再用实测结果回到这个问题。' : lesson.brief;
    return `<section data-teaching-desk class="studio"><div class="studio-head"><small>教师大屏 · 40 分钟</small><h2>今天带全班解决什么问题？</h2><p>${esc(intro)}</p></div>
    <nav aria-label="课堂环节">${phases.map((s,i)=>'<button data-teach-phase="'+i+'">'+s+' · '+times[i]+' 分</button>').join('')}</nav>
    ${phases.map((name,i)=>`<section class="studio-handoff" data-teach-slide="${i}" ${i?'hidden':''}><small>${times[i]} 分钟</small><h2>${name}</h2><p style="font-size:1.2em">${esc(lesson.teacher[i])}</p>
    ${i===0?'<h3>投屏材料</h3><p>'+esc(evidence[0])+'</p><details><summary>备课时看 · 本节课收什么证据</summary>'+esc(lesson.revision)+'</details>':''}
    ${i===1?'<h3>举手选一种做法</h3>'+lesson.choices.map((v,j)=>'<button data-teach-vote="'+j+'">'+esc(v)+'　+1</button>').join('')+'<p data-teach-tally aria-live="polite"></p><button data-clear-votes>重新计票</button>':''}
    ${i===2?'<h3>投屏材料与操作</h3><ul>'+evidence.map(m=>'<li>'+esc(m)+'</li>').join('')+'</ul>':''}
    ${i===3?'<h3>把操作交给一位同学</h3><p>'+esc(lesson.revision)+'</p><label>试玩者做了什么，在哪一步停住？<textarea data-teach-note="trial" rows="2"></textarea></label>':''}
    ${i===4?'<div data-exam-private><h3>离堂前，先独立判断</h3><p>'+esc(lesson.cases[2].question)+'</p><ol>'+lesson.cases[2].options.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol><details><summary>听完理由，再揭示依据</summary>'+esc(lesson.cases[2].options[lesson.cases[2].answer])+'。'+esc(lesson.cases[2].reason)+'</details><label>只改了什么？同一个人重试后有什么变化？<textarea data-teach-note="retest" rows="2"></textarea></label></div>':''}
    ${i===3 && !lesson.sealedMaterials ? '<div data-class-prediction><h3>先投票预测，再揭示结果</h3><p>'+esc(lesson.cases[1].question)+'</p>'+lesson.cases[1].options.map((option,j)=>'<button data-predict="'+j+'">'+esc(option)+'　+1</button>').join('')+'<output data-predictions aria-live="polite"></output><details><summary>公布结果，一起找依据</summary>'+esc(lesson.cases[1].reason)+'</details></div>' : ''}
    ${i===3 ? '<button data-project-demo>打开本课作品或世界演示工具</button>' : ''}
    <details><summary>在主对话中做这一环节</summary><label>投屏委托，可先改写<textarea rows="4" data-teach-prompt>${esc([lesson.brief,...evidence,lesson.prompts[i]].join('\n'))}</textarea></label><button data-teach-copy data-chat-copy>和 AI 聊</button></details>
    </section>`).join('')}
    ${leaf?'<div data-demo-stage hidden>'+read('leaf-lab.html')+'</div>':''}
    <button data-teach-next>下一环节</button><p data-teach-status role="status"></p></section>`;
}
