const files={index:'_wiki/index.md',concept:'_wiki/concepts/source-checking.md',project:'_wiki/projects/aichat-tool.md',person:'_wiki/entities/classroom-teacher.md',log:'_wiki/log.md',topic:'_wiki/concepts/classroom-verification.md'};
const titles={index:'总索引',concept:'资料核对方法',project:'课堂 AI 助教',person:'授课老师',log:'维护日志',topic:'课堂现场验证'};
const pageKinds={index:'Wiki 索引',concept:'Wiki 词条 · 方法',project:'Wiki 词条 · 项目',person:'Wiki 词条 · 人员',log:'维护记录',topic:'Wiki 词条 · 方法',source:'来源材料'};
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const el=id=>document.getElementById(id);
const button=(label,attr,value,selected=false)=>'<button '+attr+'="'+value+'" aria-pressed="'+selected+'">'+escapeHtml(label)+'</button>';
const link=(label,attr,value)=>'<button class="doclink" '+attr+'="'+value+'">'+escapeHtml(label)+'</button>';
let pos=0, tab=0, file='index', source=0, choice='', originOpen=false;
const last=events.length-1;
function hasTopic(){return pos===last && choice==='new';}
function facts(until,target){
  const rows=new Map();
  events.slice(0,until+1).forEach((e,i)=>{
    if(e.dest===target)rows.set(e.key,i);
  });
  return [...rows.values()];
}
function line(entry,number){return '- '+entry.line+' 〔来源 '+(number+1)+'〕';}
const inspector=el('inspect'),reader=document.querySelector('#reference .reader');
const trail=[];
let inspectedBeat=null;
const theatre=createTheatre(pick=>{choice=pick;file='index';view();},openInspector,closeInspector);
document.querySelector('.course-menu').addEventListener('toggle',event=>{
  if(event.currentTarget.open)theatre.pause();
});
const select=el('case-select');
for(const [g,scene] of scenes.entries()){
  const group=document.createElement('optgroup');group.label=scene[0];select.append(group);
  events.forEach((e,i)=>{if(e.g===g)group.append(new Option((i+1)+'. '+e.title,i));});
}
select.onchange=()=>go(Number(select.value));
el('reference').addEventListener('toggle',()=>{if(el('reference').open){closeInspector();theatre.pause();}});
function renderCard(){
  el('teacher-example').hidden=pos!==last;
  const e=events[pos],g=scenes[e.g];
  select.value=String(pos);
  el('counter').textContent='案例 '+(pos+1)+' / '+events.length+'　·　'+e.date;
  el('title').textContent=e.title;el('input').textContent=e.input;
  el('scene').src='art/'+g[1]+'.webp';el('scene').alt=g[2];el('place').textContent=g[0];
  el('prev').disabled=pos===0;el('next').disabled=pos===last;
  el('reference').open=false;
  theatre.load(pos,choice,true);view();
}
function changes(){
  const e=events[pos],prior=facts(pos-1,e.dest).find(i=>events[i].key===e.key);
  const before=prior===undefined?'（这个位置原来还没有这一条）':line(events[prior],prior);
  return '<h3>为什么这样处理？</h3><p>'+escapeHtml(e.reason)+'</p><details><summary>展开这次读写的文件顺序</summary><pre>读 AGENTS.md：了解维护规则\n读 _wiki/index.md：先找已有词条\n读 '+escapeHtml(archive[e.src].path)+'：核对本次输入\n'+(e.dest==='log'?'追加 _wiki/log.md：记录处理结果':('改 '+files[e.dest]+'：归入已有主题\n核对 index.md 的条目摘要，追加 log.md'))+'</pre></details><small class="path">'+files[e.dest]+' · 教学改写对照</small>'+
    '<pre><span class="'+(prior===undefined?'same':'del')+'">− '+escapeHtml(before)+'</span>\n<span class="add">+ '+escapeHtml(line(e,pos))+'</span></pre>'+
    '<p>本条出处 '+link(archive[e.src].path,'data-source',pos)+'</p>'+
    (e.src==='git'?'<h3>真实 Git 修改节选 · 43b82e68</h3><p>概念页的 sources 新增了会议归档。正文同时增加了回到归档、逐字稿和讲稿的入口。下面两行取自实际增量。</p><pre class="add">+  - docs/meetings/2026-10-29-aichat-persona-school.md\n+来源：[会议归档](../../docs/meetings/2026-10-29-aichat-persona-school.md)及其完整逐字稿；[润色演讲稿](../../docs/2026/beijing4-ai-campus-20261028/v4/second-brain-talk.md)。产品实现边界见 [[aichat-tool]]。</pre>':'')+
    (pos===last?'<p>建页选择在上方演示中的“决定记录位置”一步。</p>':'')+'<button data-file="'+e.dest+'">打开改后的文件 →</button>';
}
function fileText(){
  const reading=!inspector.hidden;
  const rows=reading?theatre.fileRows(file):theatre.finalFileRows(file);
  const lines=rows.map(r=>{
    const content=r.target?.file?link(r.text,'data-file',r.target.file):r.target?.source!==undefined?link(r.text,'data-source',r.target.source):escapeHtml(r.text);
    return '<span class="source-line '+(r.type==='insert'?'add':r.type==='removed'||r.type==='erase'?'del':'')+'">'+content+'</span>';
  }).join('\n');
  const nav=reading?'':'<div class="files">'+Object.keys(files).filter(k=>k!=='topic'||hasTopic()).map(k=>button(titles[k],'data-file',k,k===file)).join('')+'</div>';
  return nav+'<small class="path">'+escapeHtml(files[file])+' · 课堂副本</small><pre id="markdown">'+lines+'</pre><button data-export="1">保存这份 Markdown</button>';
}
function evidence(i){
  const e=events[i],a=archive[e.src];
  const siblings=events.flatMap((entry,n)=>entry.src===e.src?[n]:[]);
  const sections=siblings.length>1?'<div class="excerpts" aria-label="本文件收录的段落">'+siblings.map(n=>button(events[n].loc,'data-source',n,n===i)).join('')+'</div>':'';
  return '<div class="source-evidence">'+(inspector.hidden?'<h3>'+escapeHtml(sourceTitles[e.src])+'</h3>':'')+'<small>'+escapeHtml(a.kind)+' · '+escapeHtml(e.loc)+'</small>'+
  '<blockquote>'+escapeHtml(e.quote)+'</blockquote>'+sections+
  (e.src==='product'?'<p>从项目页继续追溯：'+link('打开 11 月 8 日演示记录','data-source',13)+'</p>':'')+
  (e.src==='report'?'<p>回查会中原话：'+link('打开原始逐字稿 · 第 274 行','data-original','delivery')+'</p>':'')+
  (e.src==='git'?'<p>查本次归档的原始输入：'+link('打开彩排原稿 · 段 19','data-source',5)+'</p>':'')+
  '<details><summary>查看文件位置与完整原文</summary><span class="path">'+escapeHtml(a.path)+'</span><p>'+escapeHtml(a.origin)+'</p><p>选择本机同名文件，定位这段引文。</p><input type="file" id="local-source" accept=".md,.txt"><pre id="actual">等待读取本机文件。</pre></details></div>';
}
function openInspector(target){
  theatre.pause();
  const current=trail.at(-1);
  if(current){
    current.scrollTop=el('inspect-body').scrollTop;
    if(current.library!==undefined){
      current.openGroups=[...reader.querySelectorAll('[data-group][open]')].map(node=>node.dataset.group);
      current.treeScroll=reader.querySelector('.source-library').scrollTop;
      current.detailScroll=reader.querySelector('.source-detail').scrollTop;
    }
  }
  if(inspector.hidden){
    inspector.hidden=false;
    el('paper').hidden=true;
    el('resting').inert=true;
    el('reference').open=false;
    el('inspect-body').append(reader);
  }
  if(current?.source!==undefined && target.source!==undefined && events[current.source].src===events[target.source].src)trail.pop();
  trail.push({...target});
  inspectTarget(target);
}
function inspectTarget(target){
  originOpen=Boolean(target.original);
  if(target.diff){tab=3;inspectedBeat=target.diff;}
  else if(target.library!==undefined){tab=4;source=target.library;}
  else if(target.file){tab=1;file=target.file;}
  else{tab=2;source=target.source??pos;}
  el('inspect-title').textContent=tab===4?'来源材料 · '+Object.keys(archive).length+' 份':tab===3?inspectedBeat.name:tab===1?files[file].split('/').pop():sourceTitles[originOpen?'asr':events[source].src];
  const active=tab===4||tab===2?'source':tab===1?file:inspectedBeat.docId;
  el('dock').querySelectorAll('[data-doc]').forEach(node=>node.classList.toggle('browsing',node.dataset.doc===active));
  const back=el('inspect-back'),backToList=trail.at(-2)?.library!==undefined;
  back.hidden=trail.length<2;
  back.textContent=backToList?'‹ 材料列表':'‹ 返回';
  back.setAttribute('aria-label',backToList?'返回材料列表':'返回上一项');
  view();
  if(target.openGroups)reader.querySelectorAll('[data-group]').forEach(node=>{node.open=target.openGroups.includes(node.dataset.group);});
  if(tab===4){
    const tree=reader.querySelector('.source-library'),activeFile=tree.querySelector('[aria-current=true]');
    if(target.treeScroll!==undefined)tree.scrollTop=target.treeScroll;
    else tree.scrollTop+=Math.max(0,activeFile.getBoundingClientRect().bottom-tree.getBoundingClientRect().bottom);
    reader.querySelector('.source-detail').scrollTop=target.detailScroll||0;
  }
  el('inspect-body').scrollTop=target.scrollTop||0;
  el('inspect-title').focus({preventScroll:true});
}
el('inspect-back').onclick=()=>{if(trail.length>1){trail.pop();inspectTarget(trail.at(-1));}};
el('inspect-close').onclick=()=>{closeInspector();el('play').focus({preventScroll:true});};
inspector.addEventListener('keydown',ev=>{if(ev.key==='Escape')el('inspect-close').click();});
function closeInspector(){
  if(inspector.hidden)return;
  inspector.hidden=true;
  el('paper').hidden=false;
  el('resting').inert=false;
  el('dock').querySelector('.browsing')?.classList.remove('browsing');
  el('reference').append(reader);
  trail.length=0;inspectedBeat=null;
  if(tab>=3)tab=0;
  view();
}
function stepDiff(b){
  const edited=b.rows.filter(row=>['insert','removed','erase'].includes(row.type));
  const rows=edited.map(row=>{
    const added=row.type==='insert';
    return '<div class="diff-line '+(added?'add':'del')+'"><b aria-label="'+(added?'新增':'删除')+'">'+(added?'+':'−')+'</b><span>'+escapeHtml(row.text)+'</span></div>';
  }).join('');
  return '<small class="path">'+escapeHtml(b.scope)+' · 课堂副本</small><h3>'+escapeHtml(b.label)+'</h3><div class="diff-block">'+rows+'</div><p>'+escapeHtml(b.ai)+'</p><div class="files">'+button('打开完整文件','data-file',b.docId)+button('核对本次原文','data-source',pos)+'</div>';
}
function view(){
  const e=events[pos];
  el('tabs').innerHTML=['看处理与改动','从索引找文件','核对原件'].map((s,i)=>button(s,'data-tab',i,tab===i)).join('');
  if(tab===4){el('view').innerHTML=sourceLibrary(source);return;}
  if(originOpen){el('view').innerHTML='<h3>原始逐字稿 · 第 274 行</h3><span class="path">'+archive.asr.path+'</span><blockquote>我中间你压缩成15分钟。看能不能压。你就把它剪辑一下去播，1.5倍速播或者110倍速播也可以。</blockquote><p>这是会议中的视频设想。“110倍速”保留了识别原样。会后要求另见追加记录。</p>'+link('返回会后记录','data-source',9);return;}
  el('view').innerHTML=tab===3?stepDiff(inspectedBeat):tab===0?changes():tab===2?evidence(source):((pos===last&&inspector.hidden?'<h3>新开一个对话，交一份有依据的答复</h3><p>“明天上课，我可以用遥控器的两个键录音和发指令吗？哪些操作已经演示过？”从下面的 index.md 起步，找到项目页，再打开两条出处。说清能演什么、还缺哪次测试。</p>':'')+fileText());
}
function go(i){
  closeInspector();
  pos=Math.max(0,Math.min(last,i));tab=0;file='index';source=pos;originOpen=false;
  history.replaceState(null,'','#'+(pos+1));renderCard();
  window.scrollTo(0,0);
}
document.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b)return;
  const d=b.dataset;
  if(d.export){
    const rows=el('markdown').querySelectorAll('.source-line:not(.del)');
    const blob=new Blob([[...rows].map(row=>row.textContent).join('\n')+'\n'],{type:'text/markdown;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=files[file].split('/').pop();a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;
  }
  if(b.id==='prev')return go(pos-1);
  if(b.id==='next'&&pos<last)return go(pos+1);
  if(b.closest('#inspect .reader')){
    if(tab===4&&d.source!==undefined){
      source=Number(d.source);
      trail.at(-1).library=source;
      const detail=reader.querySelector('.source-detail');
      detail.innerHTML=sourceDetail(source);detail.scrollTop=0;
      reader.querySelectorAll('[data-entry]').forEach(node=>{
        const active=node.dataset.entry===events[source].src;
        node.setAttribute('aria-current',String(active));
        if(active)node.dataset.source=source;
      });
      if(!b.isConnected)detail.querySelector('[aria-pressed=true]')?.focus({preventScroll:true});
      return;
    }
    if(d.file)openInspector({file:d.file});
    else if(d.source!==undefined)openInspector({source:Number(d.source)});
    else if(d.original)openInspector({original:d.original});
    return;
  }
  if(!b.closest('#reference'))return;
  originOpen=false;
  if(d.tab!==undefined){tab=Number(d.tab);file='index';source=pos;}
  if(d.file){tab=1;file=d.file;}
  if(d.source!==undefined){tab=2;source=Number(d.source);}
  if(d.original){tab=2;originOpen=true;}
  view();
});
document.addEventListener('change',async ev=>{
  if(ev.target.id!=='local-source'||!ev.target.files[0])return;
  const chosen=ev.target.files[0],out=el('actual'),entry=events[source];
  if(chosen.name!==archive[entry.src].path.split('/').pop()){out.textContent='文件名与本条来源不符，请选上面标出的文件。';return;}
  try{
    const raw=await chosen.text(),q=entry.quote,at=raw.indexOf(q);
    if(!out.isConnected||ev.target.files[0]!==chosen)return;
    if(at<0){out.textContent='此版本未匹配到引文，请核对文件版本。\n\n'+raw;return;}
    const hit=document.createElement('mark');hit.textContent=q;
    out.replaceChildren(raw.slice(0,at),hit,raw.slice(at+q.length));
    out.scrollTop=hit.offsetTop-20;
  }catch{out.textContent='暂时读不到所选文件。';}
});
const requested=Number(location.hash.slice(1));
if(Number.isInteger(requested)&&requested>=1&&requested<=events.length){pos=requested-1;source=pos;}
renderCard();

window.addEventListener('hashchange',()=>{
  const n=Number(location.hash.slice(1));
  if(Number.isInteger(n)&&n>=1&&n<=events.length)go(n-1);
});
