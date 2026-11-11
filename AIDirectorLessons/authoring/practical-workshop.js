const panel=document.querySelector('[data-practical]');
const find=s=>panel.querySelector(s);
if(config.id==='g9-01')window.directorPrivateBrief=()=>[config.title,config.goal,config.student,'访谈原话与草稿留在本组，本次上下文只提供公开任务。'].join('\n');
const controls=[...panel.querySelectorAll('[data-input]')];
const storageKey='director-practical-v1/'+config.id+'/'+panel.dataset.role;
let state={};
try {state=JSON.parse(localStorage.getItem(storageKey)) || {};} catch {}
const values=()=>Object.fromEntries(controls.map(el=>[el.dataset.input,el.value]));
const status=text=>{find('[data-edition-status]').textContent=text;};
function persist(){
    try {if(config.id==='g9-01' && values().permit!=='使用虚构演练记录'){localStorage.removeItem(storageKey);return;}localStorage.setItem(storageKey,JSON.stringify(state));}
    catch {status('当前窗口不能保存草稿，离开前请下载作品和制作记录。');}
}
function saveFile(filename,content,mime){
    const link=document.createElement('a');
    const url=URL.createObjectURL(new Blob([content],{type:mime}));
    link.href=url;link.download=filename;document.body.append(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
}
function defaults(){
    return Object.fromEntries(config.fields.map(f=>[f.key,f.options?.[0] ?? f.value]));
}
function fill(input){
    for(const el of controls) el.value=input[el.dataset.input] ?? defaults()[el.dataset.input];
}
function compose(){
    const text=[config.goal,config.student];
    if(!config.sealed && config.id!=='g9-01') for(const f of config.fields) text.push(f.label+'：'+values()[f.key]);
    text.push(config.sealed?'只讨论制作与验证方法，封存题留给独立评测员。':'请根据这些材料提出制作方案。我确认后再制作，保留首版供同伴试玩。');
    return text.join('\n');
}
const prompt=find('[data-maker-prompt]');
prompt.oninput=()=>{state.prompt=prompt.value;persist();};
find('[data-compose]').onclick=()=>{delete state.prompt;prompt.value=compose();persist();};
find('[data-maker-copy]').onclick=()=>copyLessonChatText(prompt.value);
function showWorld(){
    if(!world) return;
    const code=world(values());
    find('[data-world-code]').textContent=code;
    find('[data-scene-code]').textContent=buildScene(code);
}
function observe(){
    const input=values();
    const output=run(input);
    find('[data-result]').textContent=output;
    drawLessonVisual(find('[data-graphic]'),config.id,input,output);
    state.input=input;state.last={input,output};
    persist();
}
find('[data-run]').onclick=observe;
if(config.teacher){
    const before=find('[data-class-before]');
    find('[data-keep-demo]').onclick=()=>{
        if(!state.last) observe();
        state.baseline=state.last.output;before.querySelector('pre').textContent=state.baseline;before.hidden=false;persist();
    };
    if(state.baseline){before.hidden=false;before.querySelector('pre').textContent=state.baseline;}
}
for(const el of controls) el.oninput=()=>{
    state.input=values();delete state.last;find('[data-graphic]').replaceChildren();if(state.prompt==null) prompt.value=compose();
    find('[data-result]').textContent='设置已改变，请运行这一版。';showWorld();persist();
};
for(const key of ['observation','retest']){
    const field=find('[data-'+key+']');
    field.value=state[key] || '';
    field.oninput=()=>{state[key]=field.value;persist();};
}
function renderHistory(){
    const holder=find('[data-history]');holder.replaceChildren();
    for(const [version,s] of Object.entries(state.editions || {})){
        const details=document.createElement('details');
        const summary=document.createElement('summary');summary.textContent='第 '+version+' 版 · 查看当时的设置和结果';
        const output=document.createElement('pre');output.textContent=config.fields.map(f=>f.label+'：'+s.input[f.key]).join('\n')+'\n\n'+s.output;
        const button=document.createElement('button');button.textContent='再次下载第 '+version+' 版';
        button.onclick=()=>exportEdition(version,s);
        details.append(summary,output,button);holder.append(details);
    }
}
// A downloaded copy contains the same lesson mechanism and the author's choices.
// Students' text reaches DOM text/value properties, never executable source.
function openProduct(config,input,run,art,draw){
    document.title=config.title;
    const main=document.querySelector('main');
    const heading=document.createElement('h1');heading.textContent=config.title;
    const task=document.createElement('p');task.textContent=config.student;main.append(heading,task);
    if(art?.url){
        const figure=document.createElement('figure'),image=document.createElement('img'),caption=document.createElement('figcaption');
        image.src=art.url;image.alt=art.caption || '作者选用的课堂图片';image.style.maxWidth='100%';caption.textContent=art.caption;
        figure.append(image,caption);main.append(figure);
    }
    const controls={};
    for(const f of config.fields){
        const label=document.createElement('label');label.textContent=f.label;
        const el=document.createElement(f.options?'select':'textarea');
        if(f.options) for(const o of f.options) el.add(new Option(o,o));
        el.value=input[f.key];el.dataset.input=f.key;controls[f.key]=el;label.append(el);main.append(label);
    }
    const button=document.createElement('button');button.textContent='运行作品';button.dataset.run='';
    const output=document.createElement('output');output.dataset.result='';output.setAttribute('aria-live','polite');
    const graphic=document.createElement('div');
    button.onclick=()=>{const v=Object.fromEntries(Object.entries(controls).map(([k,el])=>[k,el.value]));output.textContent=run(v);draw(graphic,config.id,v,output.textContent);};
    main.append(button,graphic,output);button.click();
}
function exportEdition(v,snapshot){
    const serial=x=>JSON.stringify(x).replaceAll('<','\\u003c');
    const raw=run.toString();
    const source=/^\s*(?:function\b|\(|[\w$]+\s*=>)/.test(raw)?'('+raw+')':'({'+raw+'}).run';
    const js='('+openProduct.toString()+')('+serial(config)+','+serial(snapshot.input)+','+source+','+serial(snapshot.art || null)+',('+drawLessonVisual.toString()+'))';
    const html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>我的作品</title><style>body{background:#f6f5ee;color:#163c37;font:18px/1.65 system-ui}main{max-width:50rem;margin:auto;padding:1rem}label,output{display:block;margin:1rem 0;white-space:pre-wrap;overflow-wrap:anywhere}textarea,select{display:block;box-sizing:border-box;width:100%;padding:.6em;font:inherit}textarea{min-height:4em}button{font:inherit;padding:.5em 1em;background:#164f49;color:white;border:0;border-radius:.4em}output{padding:1rem;background:white}</style><main></main><script>'+js.replace(/<\/script/gi,'<\\/script')+'<'+ '/script></html>';
    saveFile(config.id+'-'+config.title+'-V'+v+'.html',html,'text/html;charset=utf-8');
}
for(const b of panel.querySelectorAll('[data-edition]')) b.onclick=()=>{
    if(config.id==='g9-01' && values().permit==='未获得摘录许可'){status('没有摘录许可，不能导出访谈作品。');return;}
    const v=b.dataset.edition;
    state.editions ||= {};
    if(v==='1' && state.editions[1]){exportEdition(1,state.editions[1]);status('已下载保留的第一版。');return;}
    if(!state.last){status('请先运行当前设置，看到结果后再保存。');return;}
    if(v==='2' && (!state.editions[1] || !state.observation?.trim())){status('请先留存首版，并记录一次真实试玩观察。');return;}
    if(v==='2' && JSON.stringify(state.last.input)===JSON.stringify(state.editions[1].input) && JSON.stringify(state.art || null)===JSON.stringify(state.editions[1].art || null)){status('请根据观察改变一个设置，再运行并保存。');return;}
    state.editions[v]={input:{...state.last.input},output:state.last.output,art:state.art?{...state.art}:null};persist();renderHistory();
    exportEdition(v,state.editions[v]);status('第 '+v+' 版已下载，可在独立窗口交给同伴试玩。');
};
find('[data-journal]').onclick=()=>{
    if(config.id==='g9-01' && values().permit==='未获得摘录许可'){status('没有摘录许可，不能导出制作记录。');return;}
    const entries=Object.entries(state.editions || {}).map(([v,s])=>'V'+v+'\n'+config.fields.map(f=>f.label+'：'+s.input[f.key]).join('\n')+'\n实际课内输出：\n'+s.output);
    saveFile(config.id+'-制作记录.txt',[config.title,config.goal,...entries,'试玩观察：'+(state.observation || '尚未记录'),'重测：'+(state.retest || '尚未记录')].join('\n\n'),'text/plain;charset=utf-8');
};
find('[data-new-project]').onclick=()=>{
    if(!confirm('开始另一份作品？此页草稿将清空，请先下载需要保留的版本。')) return;
    state={};fill(defaults());find('[data-result]').textContent='';find('[data-graphic]').replaceChildren();
    for(const k of ['observation','retest']) find('[data-'+k+']').value='';
    renderHistory();showWorld();showArt();prompt.value=compose();persist();status('新作品已就绪。');
};
if(world){
    find('[data-world-copy]').onclick=()=>copyLessonChatText('先确认当前客户端、空白世界和可用能力。支持 run_code 时执行下方完整建景 Lua，检查作业结果并告诉我演员和拉杆的位置。如果只支持 create_scripted_actor，先查世界路径和可用空地，以 human 模型和下面的角色行为原文创建并启动角色；告诉我角色的位置以及还需自己搭哪些标志。没有创建能力时，指导我在电影方块旁的代码方块粘贴行为，不要声称已建景。\n角色行为：\n'+find('[data-world-code]').textContent+'\n完整建景 Lua：\n'+find('[data-scene-code]').textContent);
    find('[data-world-file]').onclick=()=>saveFile(config.id+'-建景.lua',find('[data-scene-code]').textContent,'text/plain;charset=utf-8');
}
function showArt(){
    const area=find('[data-art]');if(!area)return;
    area.querySelector('figure').hidden=!state.art?.url;
    if(state.art?.url) area.querySelector('img').src=state.art.url;
    else area.querySelector('img').removeAttribute('src');
    area.querySelector('figcaption').textContent=state.art?.caption || '';
    area.querySelector('[data-art-caption]').value=state.art?.caption || '';
}
if(find('[data-art]')){
    const caption=find('[data-art-caption]'),fileInput=find('[data-art-file]');
    caption.oninput=()=>{state.art ||= {};state.art.caption=caption.value;showArt();persist();};
    find('[data-art-remove]').onclick=()=>{fileInput.value='';delete state.art;showArt();persist();};
    fileInput.onchange=async()=>{
        const file=fileInput.files[0];if(!file)return;
        const notice=find('[data-art-status]');
        if(file.size>8*1024*1024){notice.textContent='请选择小于 8 MB 的课堂图片。';return;}
        try{
            const bitmap=await createImageBitmap(file);
            const scale=Math.min(1,720/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');
            canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
            canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
            if(fileInput.files[0]!==file)return;
            state.art={caption:caption.value,url:canvas.toDataURL('image/webp',0.72)};showArt();persist();notice.textContent='已放入作品，下载时会一起保存。';
        }catch{notice.textContent='图片读取失败，请选择 PNG、JPEG 或 WebP。';}
    };
}
fill(state.input || defaults());prompt.value=state.prompt ?? compose();renderHistory();showWorld();showArt();
if(state.last){find('[data-result]').textContent=state.last.output;drawLessonVisual(find('[data-graphic]'),config.id,state.last.input,state.last.output);}
