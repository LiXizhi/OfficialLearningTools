import {readFileSync} from 'node:fs';

const read = file=>readFileSync(new URL(file,import.meta.url),'utf8');
const escape = s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const safeJson = value=>JSON.stringify(value).replaceAll('<','\\u003c');
const batches=await Promise.all(Array.from({length:10},(_,i)=>import('./practicals/b'+String(i+1).padStart(2,'0')+'.mjs')));
export const practicals={};
for(const {default:batch} of batches){
    for(const [id,p] of Object.entries(batch)){
        if(practicals[id]) throw Error('重复课号 '+id);
        practicals[id]=p;
        for(const field of ['goal','product','opening','prediction','demonstration','debrief','student','revision']){
            if(typeof p[field]!=='string' || !p[field].trim()) throw Error(id+' 缺少 '+field);
        }
        const defaults=Object.fromEntries(p.fields.map(f=>[f.key,f.options?.[0] ?? f.value]));
        if(!p.fields.length || Object.keys(defaults).length!==p.fields.length || p.checks.length<3) throw Error(id+' 控件或测试材料缺失');
        for(const check of p.checks){
            for(const [k,v] of Object.entries(check.set)){
                const f=p.fields.find(field=>field.key===k);
                if(!f || (f.options && !f.options.includes(v))) throw Error(id+' 无效的检查输入 '+k);
            }
            if(!p.run({...defaults,...check.set}).includes(check.expect)) throw Error(id+' 复核失败 '+check.expect);
        }
    }
}
if(Object.keys(practicals).length!==52) throw Error('应有52节实践课');

const imageTasks = {
    'g3-02':'用自己画的同一道具做两张观察图，一张完整，一张只遮住关键线索。',
    'g3-05':'给故事选一张插图。对照三幕，说明画面中的道具与动作是否连贯。',
    'g5-05':'把按记录复原的画面与 AI 畅想画并排检查，并写清两张图的依据。',
    'g5-06':'为分镜选画面。先确认镜头里的角色、道具与上一幕能接上，再决定采用。',
    'g5-07':'从自己的电影里选一帧截图，再用相同时间点核对改过机位后的截图。'
};
export function practicalPanel(id,teacher,platform) {
    const p=practicals[id], world=platform==='P';
    if(world && typeof p.world!=='function') throw Error(id+' 缺少建景行为');
    const choices=p.fields.map(f=>{
        const control=f.options ? '<select data-input="'+escape(f.key)+'">'+f.options.map(o=>'<option>'+escape(o)+'</option>').join('')+'</select>'
            : '<textarea data-input="'+escape(f.key)+'" rows="'+(String(f.value).includes('\n')?4:2)+'">'+escape(f.value)+'</textarea>';
        return '<label>'+escape(f.label)+control+'</label>';
    }).join('');
    return `<style>${read("practical.css")}</style><section class="studio-handoff practical" data-practical="${id}" data-role="${teacher?'teacher':'student'}">
    <small>${world?'Paracraft · 世界排练':'AIChat · 可独立试玩的作品'}</small><h2>${escape(p.product)}</h2>
    <p>${escape(teacher?p.demonstration:p.student)}</p><div class="practical-controls">${choices}</div>
    ${imageTasks[id]?`<details data-art><summary>使用自己的图，检查画面</summary><p>${escape(imageTasks[id])}</p><label>导入自己的图或课堂生成图<input type="file" accept="image/png,image/jpeg,image/webp" data-art-file></label><label>来源与选用理由<input data-art-caption></label><figure hidden><img alt="选入作品的课堂素材"><figcaption></figcaption></figure><button data-art-remove>移除图片</button><p data-art-status role="status"></p></details>`:''}
    <details><summary>把这一步带到 AIChat 主对话</summary><label>我的制作委托<textarea data-maker-prompt rows="5"></textarea></label><button data-compose>按当前设置重组</button> <button data-maker-copy data-chat-copy>和 AI 聊</button></details>
    <button data-run>运行当前作品</button>${teacher?'<button data-keep-demo>把这次结果留在大屏上</button><div data-class-before hidden><h3>全班刚才看到的结果</h3><pre></pre></div>':''}<div data-graphic></div><output data-result aria-live="polite"></output>
    ${world?'<details data-world-panel><summary>带入 Paracraft 运行这一版</summary><p>打开本课空白世界，把当前设置生成的建景委托复制到主对话。建好后拉动拉杆、点角色，再用同一输入复测。</p><button class="btn-open-paracraft-std">打开 Paracraft</button><button data-world-copy data-chat-copy>和 AI 聊 · 用这些设置建景</button><details><summary>查看行为脚本与完整建景 Lua</summary><pre data-world-code></pre><pre data-scene-code></pre></details><button data-world-file>下载当前建景 Lua</button></details>':''}
    <div class="practical-editions" ${teacher?'hidden':''}><h3>${teacher?'请一位同学试玩':'把作品交给下一位使用者'}</h3>
    <p>${escape(p.revision)}</p><label>${teacher?'试玩者刚才做了什么？':'同伴的原话或我观察到的卡点'}<textarea data-observation rows="2"></textarea></label>
    <button data-edition="1">留存并下载第一版</button><button data-edition="2">留存并下载修改版</button>
    <p data-edition-status role="status"></p><details><summary>两版记录与重测</summary><div data-history></div><label>用相同条件重试，结果怎样？<textarea data-retest rows="2"></textarea></label><button data-journal>下载制作记录</button><button data-new-project>开始另一份作品</button></details></div></section>`;
}

function fnSource(fn,name){
    const source=Function.prototype.toString.call(fn);
    return /^\s*(?:function\b|\(|[\w$]+\s*=>)/.test(source)?'('+source+')':'({'+source+'}).'+name;
}
export function practicalScript(id,teacher,platform){
    const p=practicals[id];
    const config={id,title:p.product,goal:p.goal,student:p.student,revision:p.revision,fields:p.fields,teacher,sealed:['g7-05','g8-03','g8-07'].includes(id)};
    const scene=platform==='P'?read('practical-scene.js'):'';
    return '\n(() => {const config='+safeJson(config)+';\nconst run='+fnSource(p.run,'run')+';\nconst world='+(p.world?fnSource(p.world,'world'):'null')+';\n'+scene+'\n'+read('practical-visual.js')+'\n'+read('practical-workshop.js')+'\n})();';
}
