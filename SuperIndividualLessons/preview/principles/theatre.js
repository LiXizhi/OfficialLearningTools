function createTheatre(selectBranch,inspect,returnToFilm){
  const paper=el('paper'), lines=el('lines'), prop=el('prop'), dock=el('dock');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const drawProp=createPropDrawing(el('prop-drawing'));
  let beats=[], pos=0, step=0, progress=0, running=false, continuous=false, frame=0, stamp=0, branch='';
  let elements=[], destination=null, rect=null;
  const transcript=el('transcript'),slider=el('scrubber'),timecode=el('timecode');
  let offsets=[],duration=0,followChat=true;
  const clock=ms=>Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0');
  transcript.onscroll=()=>{followChat=transcript.scrollHeight-transcript.clientHeight-transcript.scrollTop<8;};
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=n=>n*n*(3-2*n);
  const phase=(p,start,end)=>clamp((p-start)/(end-start));
  const current=()=>beats[step];
  function fileTarget(id){
    return id==='source'?{source:current().source??pos}:{file:id};
  }
  function inspectCurrent(){inspect(fileTarget(current().docId));}
  el('paper-name').parentElement.onclick=inspectCurrent;
  el('line-scope').onclick=inspectCurrent;
  el('resting').onclick=inspectCurrent;
  function controls(){
    const waiting=current().gate&&!branch;
    el('decision').hidden=!current().gate;
    el('play').disabled=waiting;
    el('play').textContent=waiting?'请选择':running?'Ⅱ 暂停':step===beats.length-1&&progress>=1?'↺ 重播':'▶ 播放';
    el('back').disabled=step===0;
    el('forward').disabled=waiting||step===beats.length-1;
    el('segments').querySelectorAll('button').forEach((node,i)=>{
      node.setAttribute('aria-current',String(i===step));
      node.classList.toggle('past',i<step);
      node.disabled=!branch && beats.slice(0,i).some(b=>b.gate);
    });
    el('step-label').textContent=(step+1)+' / '+beats.length+'　'+current().label;
  }
  function pause(){
    running=false;cancelAnimationFrame(frame);stamp=0;
    if(beats.length)controls();
  }
  function measure(){
    if(!destination)return;
    const bench=el('bench').getBoundingClientRect(), target=destination.getBoundingClientRect();
    rect={x:target.left+target.width/2-(bench.left+paper.offsetLeft+paper.offsetWidth/2),
      y:target.top+target.height/2-(bench.top+paper.offsetTop+paper.offsetHeight/2)};
  }
  function type(node,text,f){
    const count=Math.round(text.length*clamp(f));
    if(node.textContent.length!==count||node.dataset.fresh==='1'){
      node.textContent=text.slice(0,count);node.dataset.fresh='';
    }
  }
  function paint(p){
    const b=current(), motion=b.motion;
    const t=p;
    const writes=b.rows.filter(r=>r.type==='insert').length;
    let ordinal=0;
    elements.forEach(({row,content,wrapper})=>{
      let f=1;
      if(row.type==='insert')f=phase(t,.10,.85)*writes-ordinal++;
      type(content,row.text,f);
      wrapper.classList.toggle('typing',row.type==='insert'&&f>=0&&f<1);
      if(row.type==='erase')wrapper.style.setProperty('--strike',Math.round(100*phase(t,.15,.8))+'%');
      if(row.type==='highlight')wrapper.style.setProperty('--mark',Math.round(100*phase(t,.10,.65))+'%');
      if(row.type==='insert'&&f>0&&f<1){
        const body=lines.parentElement;
        const bottom=wrapper.getBoundingClientRect().bottom-body.getBoundingClientRect().bottom;
        if(bottom>1)body.scrollTop+=Math.ceil(bottom);
      }
    });
    const amount=motion==='fold'?smooth(phase(t,.15,.87)):motion==='open'?1-smooth(phase(t,0,.22)):0;
    if(rect && !reduce.matches && amount>0){
      paper.style.transform='translate('+rect.x*amount+'px,'+rect.y*amount+'px) scale('+(1-.93*amount)+') rotate('+(-4*amount)+'deg)';
    }else if(motion==='create'&&!reduce.matches){
      const appear=smooth(phase(t,0,.25));paper.style.transform='scale('+(0.45+appear*.55)+')';
    }else paper.style.transform='';
    const folded=motion==='done'||(motion==='fold'&&t>=.87);
    paper.style.opacity=folded?'0':String(1-.26*amount);
    if(paper.inert!==folded)paper.inert=folded;
    el('resting').hidden=!folded;
    if(motion==='done')el('resting').textContent='✓ 已归档到 '+b.name;
    else if(motion==='fold')el('resting').textContent='✓ 已保存到 '+b.name;
    if(destination)destination.classList.toggle('landed',folded);
    const globalT=(step+t)/beats.length;
    el('scene').style.transform=reduce.matches?'none':'scale('+(1.025+.08*Math.sin(globalT*Math.PI))+') translateX('+(-1.4*Math.sin(globalT*Math.PI))+'%)';
    const arrival=1-smooth(phase(t,0,.23));
    prop.style.transform='translateY('+(arrival*13)+'px) rotate('+(-2+arrival*4)+'deg)';
    prop.style.opacity=String(1-arrival*.6);
    const doing=smooth(phase(t,.05,.70));
    const focus=b.docId==='source'||b.op==='新增行'||b.op==='改写'||motion==='create';
    drawProp(pos,doing,b.prop!==staging[pos][2]);
    prop.style.setProperty('--tip',(focus?1-doing:0)*-65+'deg');
    prop.style.setProperty('--pen-x',((focus?doing:0)*74)+'px');
    prop.style.setProperty('--pen-y',Math.sin(doing*Math.PI*5)*3+'px');
    prop.style.setProperty('--fill',(focus?doing:0)*100+'%');
    prop.style.setProperty('--pencil',focus&&doing>.05&&doing<.96?'1':'0');
    const reply=el('ai-turn').parentElement,pending=t<.42;
    if(reply.hidden!==pending){
      reply.hidden=pending;
      if(followChat)transcript.scrollTop=transcript.scrollHeight;
    }
    el('segments').children[step]?.style.setProperty('--played',p*100+'%');
    const ms=Math.round(offsets[step]+p*b.duration);
    slider.value=ms;
    const label=clock(ms)+' / '+clock(duration);
    if(timecode.textContent!==label){timecode.textContent=label;slider.setAttribute('aria-valuetext',label);}
  }
  function question(i){
    const b=beats[i];
    if(i===0)return staging[pos][5];
    if(b.gate)return '以后我还会问，要单独记吗？';
    if(beats[i-1].gate&&branch)return branch==='new'?'新建一页吧，以后可以单独查。':'先留在项目页，以后从那里找。';
    if(b.docId==='source'&&beats[i-1].docId!=='source')return '你找到的依据是哪一句？';
    if(b.op==='加出处')return '下次怎么找回这条原文？';
    if(b.op==='删旧行')return '原来那一行怎么改？';
    return '';
  }
  function renderChat(){
    const oldTop=transcript.scrollTop;
    const fragment=document.createDocumentFragment();
    function turn(speaker,text,currentId){
      const row=document.createElement('div'),avatar=document.createElement('span'),body=document.createElement('p');
      row.className='turn'+(speaker==='AI'?' assistant':'');
      avatar.textContent=speaker;body.textContent=text;
      if(currentId)body.id=currentId;
      row.hidden=currentId==='ai-turn';
      row.append(avatar,body);fragment.append(row);
    }
    for(let i=0;i<=step;i++){
      const user=question(i);
      if(user)turn('我',user,i===step?'user-turn':'');
      turn('AI',beats[i].ai,i===step?'ai-turn':'');
    }
    transcript.replaceChildren(fragment);
    transcript.scrollTop=followChat?transcript.scrollHeight:oldTop;
  }
  function mount(at){
    progress=at;
    const b=current(), art=staging[pos];
    paper.dataset.operation=b.op;
    el('paper-name').textContent=b.name;
    el('paper-kind').textContent=pageKinds[b.docId];
    el('paper-kind').dataset.kind=b.docId;
    el('op').textContent=b.op;
    el('line-scope').textContent=b.scope;
    renderChat();
    el('prop-kind').textContent=art[1]; el('prop-text').textContent=b.prop;
    prop.dataset.kind=art[0];
    const createAt=beats.findIndex(s=>s.motion==='create');
    const ids=['index','concept','project','person',...(createAt>=0&&step>=createAt?['topic']:[]),'log','source'];
    dock.replaceChildren(...ids.map(id=>{
      const item=document.createElement('button');
      item.className='drawer'+(id===b.docId?' selected':'');
      const target=fileTarget(id);
      item.dataset.doc=id;item.title=id==='source'?'浏览来源文件目录':pageKinds[id]+' · '+files[id];
      item.onclick=()=>inspect(id==='source'?{library:target.source}:target);
      const glyph=document.createElement('i'), txt=document.createElement('span');
      glyph.textContent=id==='source'?'“':'≡';txt.textContent=id==='source'?'来源材料':titles[id];
      const kind=document.createElement('small');kind.textContent=id==='source'?'文件目录':pageKinds[id];
      item.append(glyph,txt,kind);return item;
    }));
    destination=dock.querySelector('[data-doc="'+b.docId+'"]');
    elements=b.rows.map((row,i)=>{
      const wrapper=document.createElement('button'), num=document.createElement('span'), content=document.createElement('span');
      wrapper.className='md-row '+row.type;num.className='num';num.textContent=String(i+1).padStart(2,'0');content.className='code';content.dataset.fresh='1';
      if(row.text.startsWith('#'))wrapper.classList.add('md-heading');
      const sign=document.createElement('span');
      const deleted=row.type==='erase'||row.type==='removed';
      sign.className='diff-sign';sign.setAttribute('aria-hidden','true');
      sign.textContent=deleted?'−':row.type==='insert'?'+':'';
      const factEdit=sign.textContent&&row.key?.startsWith('fact:');
      const target=factEdit?{diff:b}:row.target||(sign.textContent?{diff:b}:fileTarget(b.docId));
      wrapper.title=target.diff?'查看本步改动':target.file?'打开 '+files[target.file]:'查看来源原文';
      wrapper.setAttribute('aria-label',(deleted?'删除：':row.type==='insert'?'新增：':'')+row.text+'。'+wrapper.title);
      wrapper.onclick=()=>inspect(target);
      if(row.type==='erase')content.dataset.original=row.text;
      wrapper.classList.toggle('linked',Boolean(row.target)||b.docId==='source');
      wrapper.append(num,sign,content);return {row,wrapper,content};
    });
    lines.replaceChildren(...elements.map(x=>x.wrapper));
    lines.parentElement.scrollTop=0;
    const activeLine=lines.querySelector('.highlight,.erase,.removed,.insert');
    if(activeLine){
      const body=lines.parentElement;
      body.scrollTop=Math.max(0,activeLine.getBoundingClientRect().top-body.getBoundingClientRect().top-body.clientHeight*.28);
    }
    el('decision').querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n.dataset.action===branch)));
    controls();measure();paint(at);
  }
  function tick(now){
    if(!running)return;
    if(stamp)progress=clamp(progress+Math.min(now-stamp,120)/current().duration);
    stamp=now;paint(progress);
    if(progress>=1){
      if(!continuous||(current().gate&&!branch)||step===beats.length-1){pause();return;}
      step++;mount(0);
      if(current().gate&&!branch){mount(1);pause();return;}
    }
    frame=requestAnimationFrame(tick);
  }
  function start(){
    returnToFilm();
    if(current().gate&&!branch)return;
    if(progress>=1){
      step=step===beats.length-1?0:step+1;
      mount(0);
      if(current().gate&&!branch){mount(1);return;}
    }
    pause();continuous=true;running=true;controls();frame=requestAnimationFrame(tick);
  }
  function seek(n){
    returnToFilm();
    pause();followChat=true;step=Math.max(0,Math.min(beats.length-1,n));
    if(reduce.matches||current().gate){mount(1);return;}
    mount(0);continuous=false;running=true;controls();frame=requestAnimationFrame(tick);
  }
  function timeline(){
    duration=0;offsets=beats.map(b=>{const start=duration;duration+=b.duration;return start;});
    slider.max=duration;
    el('segments').replaceChildren(...beats.map((b,i)=>{
      const dot=document.createElement('button');dot.title=b.label;dot.setAttribute('aria-label',(i+1)+' '+b.label);
      dot.onclick=()=>seek(i);return dot;
    }));
  }
  function load(i,pick,autoplay){
    pause();pos=i;branch=pick;step=0;followChat=true;beats=makeBeats(i,branch);
    timeline();mount(reduce.matches?1:0);
    if(autoplay&&!reduce.matches&&!document.hidden)start();
  }
  function scrub(ms){
    returnToFilm();
    pause();followChat=true;
    const gate=branch?-1:beats.findIndex(b=>b.gate);
    const end=gate<0?duration:offsets[gate]+beats[gate].duration;
    const at=Math.max(0,Math.min(ms,end));
    const next=gate>=0&&at===end?gate:offsets.findLastIndex(start=>start<=at);
    const fraction=(at-offsets[next])/beats[next].duration;
    if(next!==step){step=next;mount(fraction);}
    else{progress=fraction;paint(progress);transcript.scrollTop=transcript.scrollHeight;controls();}
  }
  slider.onpointerdown=()=>pause();
  slider.oninput=()=>scrub(Number(slider.value));
  slider.onkeydown=ev=>{
    const delta={ArrowLeft:-1000,ArrowDown:-1000,ArrowRight:1000,ArrowUp:1000}[ev.key];
    if(delta){ev.preventDefault();scrub(Number(slider.value)+delta);}
  };
  el('play').onclick=()=>running?pause():start();
  el('play').title='播放或暂停（空格）';
  document.addEventListener('keydown',ev=>{
    if(ev.code!=='Space'||ev.repeat||ev.altKey||ev.ctrlKey||ev.metaKey||ev.target.closest('#inspect'))return;
    if(ev.target.closest('button,input,select,textarea,summary,a,[contenteditable=true]'))return;
    if(!ev.target.closest('#case')&&ev.target!==document.body)return;
    ev.preventDefault();running?pause():start();
  });
  el('back').onclick=()=>seek(step-1);
  el('forward').onclick=()=>seek(step+1);
  el('decision').onclick=ev=>{
    const pick=ev.target.closest('[data-action]')?.dataset.action;
    if(!pick)return;
    returnToFilm();
    pause();branch=pick;selectBranch(pick);beats=makeBeats(pos,pick);timeline();
    step=beats.findIndex(b=>b.gate)+1;mount(0);
    if(reduce.matches)mount(1);else start();
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  window.addEventListener('pagehide',pause);
  reduce.addEventListener('change',()=>{pause();paint(progress);});
  new ResizeObserver(()=>{if(beats.length){measure();paint(progress);}}).observe(el('bench'));
  function fileRows(id){
    if(current().docId===id)return elements.map(({row,content})=>({...row,text:content.textContent}));
    return current().docs[id]||[];
  }
  function finalFileRows(id){return beats.at(-1).docs[id]||[];}
  return {load,pause,fileRows,finalFileRows};
}
