(() => {
  const personal=new Map();
  const reviewKey='super-individual.student.nov13.v1';
  let reviewResult='';
  try{const saved=sessionStorage.getItem(reviewKey);if(['solo','hint','retry'].includes(saved))reviewResult=saved;}catch{}
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const short=path=>path.split('/').pop().replace(/\.md$/,'');
  const split=text=>text===undefined?[]:text.split('\n');
  // Keep unchanged lines in place when a revision also appends a citation.
  function diff(before,after){
    const a=split(before),b=split(after),n=a.length,m=b.length;
    const lengths=Array.from({length:n+1},()=>new Uint16Array(m+1));
    for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)lengths[i][j]=a[i]===b[j]?1+lengths[i+1][j+1]:Math.max(lengths[i+1][j],lengths[i][j+1]);
    let i=0,j=0;const rows=[];
    while(i<n||j<m){
      if(i<n&&j<m&&a[i]===b[j]){rows.push(['',b[j++]]);i++;}
      else if(i<n&&(j===m||lengths[i+1][j]>=lengths[i][j+1]))rows.push(['del',a[i++]]);
      else rows.push(['add',b[j++]]);
    }
    return rows;
  }
  function markup(line,files){
    const slide=/^课件：\[投屏第 3 页\]\(teacher-samples\/(fractions|reading|english)\.html#p3\)$/.exec(line);
    if(slide)return '课件：<a class="wb-link" data-sample-slide="'+slide[1]+'" href="teacher-samples/'+slide[1]+'.html#p3" target="_blank" rel="noopener">投屏第 3 页 ↗</a>';
    return line.split(/(\[\[[^\]\n]+\]\])/g).map(part=>{
      if(!part.startsWith('[[')||!part.endsWith(']]'))return esc(part);
      const [slug,label]=part.slice(2,-2).split('|'),[file,line]=slug.split('#L'),path=Object.hasOwn(files,file)?file:file+'.md';
      return Object.hasOwn(files,path)?'<button class="wb-link" data-file="'+esc(path)+'"'+(/^\d+$/.test(line)?' data-line="'+line+'"':'')+' title="'+esc(path)+'">'+esc(label||slug)+' ↗</button>':esc(part);
    }).join('');
  }
  const stamp=ms=>Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0');
  window.mountBrainBench=function(host,track,lesson,variant,finish=false){
    let {frames,actor,topic,related,topics,work}=window.buildBrainLesson(track,lesson,variant,reviewResult);
    const english=track==='student'&&lesson===3;
    const summit=lesson===5&&track==='enterprise';
    const vaultOf=path=>path.startsWith('共享/')?'team':'private';
    const vaultNames={private:'CEO 个人第二大脑',team:'团队共享第二大脑'};
    const visited={};
    let citedLine=0;
    const duration=4000,reduce=matchMedia('(prefers-reduced-motion: reduce)');
    let total=duration*frames.length,hinted=false,retried=false,typed='',feedback='',chartResult='';
    const stepOptions=()=>frames.map((f,i)=>'<option value="'+i+'">'+(i+1)+' / '+frames.length+'　'+esc(f.label)+'</option>').join('');
    const replyDuration=duration*.35,writingDuration=duration*.74;
    let pauseAfterReveal=false;
    let time=finish?total:0,step=-1,manual='',mode='sample',playing=false,raf=0,last=0,answered=false;
    let selected='',lastFile='',lastFrame=null,lastManual='',lineNodes=[],follow=true;
    if(!personal.has(track))personal.set(track,{files:new Map(),notes:new Map(),drafts:new Map(),history:[]});
    const mine=personal.get(track);
    const course=window.brainCourses[track],image=course?course.image:'films/exhibit-'+lesson+'.jpg';
    const current=()=>frames[step],get=s=>host.querySelector(s);
    host.className=summit?'wb wb-summit':'wb';
    host.innerHTML='<div class="wb-head"><h2>第二大脑工作台</h2><span>第 '+lesson+' 课 · 课堂示例</span></div>'+
      '<div class="wb-duet"><section class="wb-left"><div class="wb-picture"><img alt="" src="assets/'+image+'"><strong>'+esc(actor)+'的工作台</strong></div><div class="wb-chat" tabindex="0" aria-label="本课对话"></div><div class="wb-judge" hidden></div></section>'+
      '<section class="wb-right"><div class="wb-tools"><strong>'+(summit?'第二大脑目录':'我的第二大脑')+'</strong><button data-mode="sample">课堂示例</button><button data-mode="mine">我的文档</button></div>'+
      '<div class="wb-sample">'+(summit?'<nav class="wb-vaults" aria-label="选择第二大脑目录">'+Object.entries(vaultNames).map(([key,label])=>'<button data-vault="'+key+'">'+label+'</button>').join('')+'</nav>':'<nav class="wb-wiki-pages" aria-label="直接打开 Wiki 词条"></nav>')+'<label class="wb-file-label">文件 <select aria-label="浏览第二大脑的文件"></select></label><div class="wb-filehead"><b></b><span>＋ 新增　− 删除</span></div><div class="wb-lines" tabindex="0" aria-label="Markdown 文件正文"></div></div>'+
      '<div class="wb-personal" hidden><label>导入自己的课堂副本 <input type="file" accept=".md,.txt,text/plain,text/markdown"></label><small>资料仅在当前页面内存中使用。离开前可下载笔记；正式入库在 AIChat 中完成。</small>'+
      '<label>我的文件 <select class="wb-own-files"></select></label><pre class="wb-own-body"></pre><label>把这条笔记归入哪个 Wiki 词条？<select class="wb-own-topic"></select></label><label>我根据原件确认了什么？<textarea rows="2" placeholder="写一句自己的判断，保存后可从笔记回到原件。"></textarea></label>'+
      '<div><button data-action="save">保存带出处的笔记</button> <button data-action="download">下载当前文件</button></div><small role="status" class="wb-msg"></small><div class="wb-own-diff"></div></div>'+
      '<details class="wb-changes" open><summary>本课到此改动了哪些文件？</summary><div></div></details></section></div>'+
      '<div class="wb-controls"><button data-action="play"></button>'+(english?'<button data-action="quiz-jump">Nov 13 · 填词</button>':'')+(summit?'<button data-action="interview-jump">从面试笔记看起</button>':'')+'<button data-action="prev" aria-label="上一步">‹</button><button data-action="next" aria-label="下一步">›</button><select class="wb-step" aria-label="跳到工作步骤">'+stepOptions()+'</select><label>时间轴 <input type="range" min="0" max="'+total+'" step="10" aria-label="同步查看对话和文件"></label><output></output></div>';
    const chat=get('.wb-chat'),tree=get('.wb-file-label select'),lines=get('.wb-lines'),slider=get('[type=range]'),play=get('[data-action=play]');
    function syncPlay(){
      const waiting=mode==='sample'&&current()?.label==='记录人的检验'&&!answered&&time>=(step+1)*duration-1;
      const waitingForWord=current()?.quiz&&time>=(step+1)*duration-1;
      play.disabled=waiting||waitingForWord||pauseAfterReveal;
      play.textContent=waitingForWord?'Your turn':waiting?(english?'Your turn':'请先判断'):pauseAfterReveal?'播完暂停':playing?'Ⅱ 暂停':time===total?'↺ 重播':'▶ 播放';
    }
    function stop(){playing=false;pauseAfterReveal=false;cancelAnimationFrame(raf);syncPlay();last=0;}
    function fileBody(){
      const frame=current(),path=manual||frame.path,files=frame.files;
      if(summit){
        const vault=vaultOf(path),paths=Object.keys(files);
        for(const button of host.querySelectorAll('[data-vault]'))button.setAttribute('aria-pressed',String(button.dataset.vault===vault));
        const choices=paths.filter(p=>vaultOf(p)===vault);
        // Prioritize the files from this morning; retain the learner's four earlier lessons.
        const recent=new Set(frames.slice(0,step+1).map(f=>f.path));
        const groups=vault==='team'?
          [['公司岗位卡',choices.filter(p=>p.startsWith('共享/公司/')&&!p.startsWith('共享/公司/原件/'))],['团队原件',choices.filter(p=>p.startsWith('共享/公司/原件/'))],['对外合作草案',choices.filter(p=>p.startsWith('共享/合作圈/'))]]:
          [['本节个人文件',choices.filter(p=>recent.has(p))],['以往课程文件',choices.filter(p=>!recent.has(p))]];
        tree.innerHTML=fileOptions(groups);
        tree.setAttribute('aria-label',vaultNames[vault]+'中的文件');
        visited[vault]=path;
      }
      tree.value=path;get('.wb-filehead b').textContent=path;
      lines.setAttribute('aria-label',path.endsWith('.html')?'H5 课件源码':'Markdown 文件正文');
      for(const button of host.querySelectorAll('.wb-wiki-pages button'))button.setAttribute('aria-pressed',String(button.dataset.file===path));
      const revision=summit&&manual?frames.slice(0,step+1).findLast(f=>f.write&&f.path===path):frame.write&&frame.path===path?frame:null;
      const rows=revision?diff(revision.before,files[path]):split(files[path]).map(s=>['',s]);
      let before=0,after=0;
      lines.innerHTML=rows.map(([kind,s])=>{
        if(kind!=='add')before++;
        if(kind!=='del')after++;
        const number=kind==='del'?before:after;
        const cited=manual&&citedLine===number&&kind!=='del';
        const hit=!manual&&frame.focus&&s.includes(frame.focus);
        return '<div class="wb-row '+kind+(cited?' cited':hit?' hit':'')+'"><small>'+String(number).padStart(2,'0')+'</small><b aria-hidden="true">'+(kind==='del'?'−':kind==='add'?'+':'')+'</b><span>'+markup(s,files)+'</span></div>';
      }).join('');
      lineNodes=summit&&manual?[]:rows.map(([kind,s],i)=>kind==='add'?{text:s,node:lines.children[i].lastElementChild}:null).filter(Boolean);
      lines.scrollTop=0;
      const hot=lines.querySelector('.cited')||lines.querySelector('.hit,.del,.add');
      if(hot)lines.scrollTop=Math.max(0,hot.offsetTop-lines.clientHeight*.28);
      get('.wb-curve-change')?.remove();
      host.classList.toggle('wb-review-result',Boolean(frame.result&&path===frame.path));
      if(frame.curve&&path===frame.path){
        if(frame.result){
          lines.insertAdjacentHTML('beforebegin',window.brainVocabulary.comparison(frame.result));
          lines.scrollTop=lines.querySelector('.del')?.offsetTop||0;
        }else{lines.insertAdjacentHTML('afterbegin',window.brainVocabulary.preview());lines.scrollTop=0;}
      }
      lastFile=path;lastFrame=frame;lastManual=manual;
    }
    function fileOptions(groups){
      return groups.map(([label,options])=>options.length?'<optgroup label="'+label+'">'+options.map(path=>'<option value="'+esc(path)+'">'+esc(path)+'</option>').join('')+'</optgroup>':'').join('');
    }
    function scene(){
      const f=current(),files=f.files,oldTop=chat.scrollTop;
      if(f.photo){
        const photo=get('.wb-picture img'),src='assets/'+f.photo[0];
        if(photo.getAttribute('src')!==src)photo.src=src;
        photo.alt=f.speaker+' · '+f.photo[1];get('.wb-picture strong').textContent=photo.alt;
      }
      const paths=Object.keys(files),wikiPages=paths.filter(p=>p.startsWith('_wiki/')&&p.split('/').length===3);
      if(!summit){
        get('.wb-wiki-pages').innerHTML='<b>Wiki 词条</b>'+wikiPages.map(p=>'<button data-file="'+esc(p)+'">'+esc(short(p))+'</button>').join('');
        tree.innerHTML=fileOptions([['Wiki 词条',wikiPages],['索引与日志',paths.filter(p=>p.startsWith('_wiki/')&&!wikiPages.includes(p))],['我的原始文档',paths.filter(p=>p.startsWith('docs/'))],['本课教案与课堂观察',paths.filter(p=>p.startsWith('TeachingArtifacts/'))],['本人的作品',paths.filter(p=>p.startsWith('作品/'))]]);
      }
      chat.innerHTML=frames.slice(0,step+1).filter((s,i)=>!s.fileOnly||i===step).map(s=>(s.fresh?'<p class="wb-break">'+(english?'Nov 13 · A new conversation':'新对话 · 从索引重新查找')+'</p>':'')+
        (s.user?'<p class="wb-message wb-user"><b>'+esc(s.speaker||actor)+' · 我</b><span>'+esc(s.user)+'</span></p>':'')+
        '<p class="wb-message wb-ai"'+(s===f?' hidden':'')+'><b>'+(s.photo?'AI课程互动助手':'AI 助手')+'</b><span>'+esc(s.ai)+'</span></p>').join('');
      chat.scrollTop=follow?chat.scrollHeight:oldTop;
      const judge=get('.wb-judge');judge.hidden=!f.quiz&&(f.label!=='记录人的检验'||answered);
      if(f.quiz){
        judge.innerHTML='<form class="wb-word-form" lang="en"><label>May I <input name="word" required autocomplete="off" spellcheck="false" aria-label="Missing word"> your ruler?</label><div><button type="submit">Check answer</button> <button type="button" data-action="hint">Hint</button></div><small role="status"></small></form>';
        judge.querySelector('input').value=typed;
        judge.querySelector('small').textContent=feedback;
      }else if(!judge.hidden){
        const [q,yes,no]=window.brainDecisions[track][lesson-1],answers=lesson%2?[yes,no]:[no,yes];
        judge.innerHTML='<strong>'+esc(q)+'</strong>'+answers.map(a=>'<button data-answer="'+(a===yes?'yes':'no')+'">'+esc(a)+'</button>').join('')+'<small role="status"></small>';
      }
      const activeResult=f.result||'';
      if(english&&activeResult!==chartResult){
        chartResult=activeResult;
        const chart=document.querySelector('section.recall-chart');
        if(chart)window.brainVocabulary.mount(chart,chartResult);
      }
      const touched=new Map();
      frames.slice(0,step+1).filter(s=>s.write).forEach(s=>touched.set(s.path,touched.get(s.path)|| (s.before===undefined?'新建':'修改')));
      get('.wb-changes div').innerHTML=[...touched].map(([p,op])=>'<button data-file="'+esc(p)+'">'+op+' · '+esc(short(p))+'</button>').join('')||'此刻正在查找资料，本课还没有写入文件。';
      get('.wb-step').value=step;
      get('[data-action=prev]').disabled=step===0;get('[data-action=next]').disabled=step===frames.length-1;
      fileBody();
    }
    function paint(ms){
      time=Math.min(total,Math.max(0,ms));
      const next=Math.min(frames.length-1,Math.floor(time/duration));
      if(step!==next){step=next;manual='';scene();}
      if(lastFrame!==current()||lastFile!==(manual||current().path)||lastManual!==manual)fileBody();
      const elapsed=time-step*duration;
      const reply=chat.lastElementChild;
      const pending=elapsed<replyDuration;
      if(reply.hidden!==pending){reply.hidden=pending;if(follow)chat.scrollTop=chat.scrollHeight;}
      if(lineNodes.length){
        const count=lineNodes.reduce((n,x)=>n+x.text.length,0);
        let budget=reduce.matches?count:Math.round(count*Math.min(1,elapsed/writingDuration));
        for(const {text,node} of lineNodes){
          const n=Math.max(0,Math.min(text.length,budget));budget-=text.length;
          if(node.dataset.n===String(n))continue;
          node.dataset.n=n;
          if(n===text.length)node.innerHTML=markup(text,current().files);else node.textContent=text.slice(0,n);
          if(playing&&n>0&&n<text.length&&node.parentElement.offsetTop>lines.scrollTop+lines.clientHeight-38)lines.scrollTop=node.parentElement.offsetTop-lines.clientHeight*.55;
        }
      }
      slider.value=time;get('output').textContent=stamp(time)+' / '+stamp(total);syncPlay();
    }
    function tick(now){
      if(!playing)return;
      const nextTime=time+(last?now-last:0);
      if(pauseAfterReveal){
        const revealDuration=lineNodes.length?writingDuration:replyDuration;
        if(reduce.matches||nextTime>=step*duration+revealDuration){
          // End the reading hold as well, so Resume advances directly to the next step.
          paint(step===frames.length-1?total:(step+1)*duration-1);
          stop();
          return;
        }
      }
      if(!get('.wb-judge').hidden&&nextTime>=(step+1)*duration-1){paint((step+1)*duration-1);stop();return;}
      paint(nextTime);last=now;if(time>=total)stop();else raf=requestAnimationFrame(tick);
    }
    function showMode(value){
      mode=value;get('.wb-personal').hidden=value!=='mine';get('.wb-sample').hidden=value==='mine';
      get('.wb-head span').textContent='第 '+lesson+' 课 · '+(value==='mine'?'我的文档':'课堂示例');syncPlay();
      get('.wb-changes').hidden=value==='mine';
      host.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===value)));
      if(value==='mine'){stop();renderMine();}
    }
    function selectFile(path,line=0){if(!Object.hasOwn(current().files,path))return;stop();showMode('sample');manual=path;citedLine=line;fileBody();paint(time);}
    const ownTopics=()=>[...new Set([...topics,...Array.from(mine.notes.values(),n=>n.topic)])];
    function ownFiles(){
      const pages=ownTopics().map(path=>{
        const notes=[...mine.notes].filter(([,n])=>n.topic===path);
        const body=notes.map(([p,n])=>'- '+n.body+'\n  笔记：[['+p+']]　原件：[['+n.src+']]').join('\n');
        return [path,'# '+short(path)+'\n\n'+window.brainWiki[track].pages[short(path)].scope+'\n\n'+(body||'尚未归入笔记。')];
      });
      const links=paths=>paths.map(p=>'- [['+p+']]').join('\n');
      const index='# 我的资料索引\n\n## Wiki 词条\n'+links(pages.map(([p])=>p))+'\n\n## 原件与笔记\n'+links([...mine.files.keys(),...mine.notes.keys(),'_wiki/log.md']);
      return new Map([['_wiki/index.md',index],['_wiki/log.md','# 我的修改记录\n'+mine.history.join('\n')],...pages,...mine.files,...[...mine.notes].map(([p,n])=>[p,n.text])]);
    }
    const draftKey=()=>mine.notes.has(selected)?'note:'+selected:'new:'+lesson+'|'+selected;
    function renderMine(){
      const all=ownFiles();
      if(!all.has(selected))selected=[...mine.files.keys()].at(-1)||'_wiki/index.md';
      get('.wb-own-files').innerHTML=[...all.keys()].map(p=>'<option value="'+esc(p)+'">'+esc(p)+'</option>').join('');
      get('.wb-own-files').value=selected;
      const body=get('.wb-own-body');body.replaceChildren();
      for(const part of all.get(selected).split(/(\[\[[^\]\n]+\]\])/g)){
        const path=part.slice(2,-2);
        if(part.startsWith('[[')&&part.endsWith(']]')&&all.has(path)){const btn=document.createElement('button');btn.className='wb-link';btn.dataset.own=path;btn.textContent=part;body.append(btn);}
        else body.append(document.createTextNode(part));
      }
      const edit=get('.wb-personal textarea');
      edit.disabled=selected.startsWith('_wiki/');edit.value=mine.drafts.get(draftKey())??mine.notes.get(selected)?.body??'';
      const picker=get('.wb-own-topic');
      picker.innerHTML=ownTopics().map(p=>'<option value="'+esc(p)+'">'+esc(short(p))+'</option>').join('');
      picker.value=mine.notes.get(selected)?.topic||topic;picker.disabled=edit.disabled;
      get('[data-action=save]').disabled=edit.disabled;
      const note=mine.notes.get(selected);
      get('.wb-own-diff').innerHTML=note?'<small>最近一次保存</small>'+(note.old?'<p class="del">− '+esc(note.old)+'</p>':'')+'<p class="add">+ '+esc(note.body)+'</p>':'';
    }
    host.onclick=ev=>{
      const slide=ev.target.closest('[data-sample-slide]');
      if(slide){
        const preview=document.querySelector('.teacher-studio iframe');
        stop();
        if(preview&&new URL(preview.src).pathname===new URL(slide.href).pathname){
          ev.preventDefault();const target=new URL(preview.src);target.searchParams.set('page','3');preview.src=target.href;preview.focus({preventScroll:true});preview.scrollIntoView({block:'center'});
        }
        return;
      }
      const b=ev.target.closest('button');if(!b)return;
      if(b.dataset.mode){showMode(b.dataset.mode);return;}
      if(b.dataset.answer){
        if(b.dataset.answer==='yes'){answered=true;get('.wb-judge').hidden=true;stop();showMode('sample');manual='';follow=true;paint((step+1)*duration);playing=true;play.textContent='Ⅱ 暂停';raf=requestAnimationFrame(tick);}
        else{selectFile(current().path);get('.wb-judge small').textContent=english?'Read yesterday’s recall check. Which word needed a hint?':'再看右侧检验记录《'+short(current().path)+'》。哪句话有原文支持？';}
        return;
      }
      if(b.dataset.vault){
        const vault=b.dataset.vault,files=current().files;
        const remembered=visited[vault];
        const path=Object.hasOwn(files,remembered)?remembered:frames.slice(0,step+1).findLast(f=>vaultOf(f.path)===vault)?.path||Object.keys(files).find(p=>vaultOf(p)===vault);
        selectFile(path);return;
      }
      if(b.dataset.file){selectFile(b.dataset.file,Number(b.dataset.line)||0);return;}
      if(b.dataset.own){selected=b.dataset.own;renderMine();return;}
      const action=b.dataset.action;
      if(action==='interview-jump'){
        stop();showMode('sample');manual='';follow=true;
        paint((frames.findIndex(f=>f.label==='面试笔记留在个人脑')+1)*duration-1);
        lines.focus({preventScroll:true});
      }
      if(action==='quiz-jump'){
        stop();showMode('sample');manual='';follow=true;paint((frames.findIndex(f=>f.quiz)+1)*duration-1);stop();
        get('.wb-word-form input').focus({preventScroll:true});
      }
      if(action==='hint'){
        hinted=true;feedback='It starts with bor… You take something and give it back later.';
        get('.wb-word-form small').textContent=feedback;get('.wb-word-form input').focus();
      }
      if(action==='play'){
        if(playing){pauseAfterReveal=true;syncPlay();}
        else{showMode('sample');manual='';follow=true;paint(time>=total?0:time);playing=true;syncPlay();raf=requestAnimationFrame(tick);}
      }
      if(action==='next'||action==='prev'){stop();showMode('sample');manual='';follow=true;paint((step+(action==='next'?1:-1))*duration+duration-1);stop();}
      if(action==='save'){
        const body=get('.wb-personal textarea').value.trim(),msg=get('.wb-msg');if(!body){msg.textContent='先写下你的判断。';return;}
        const src=mine.notes.get(selected)?.src||selected;
        const path=mine.notes.has(selected)?selected:'笔记/第'+lesson+'课/'+src.split('/').pop()+'.笔记.md';
        const old=mine.notes.get(path)?.body;
        const destination=get('.wb-own-topic').value;
        if(old===body&&mine.notes.get(path)?.topic===destination){msg.textContent='这份笔记已保存。';return;}
        mine.drafts.delete(draftKey());
        mine.drafts.delete('note:'+path);
        mine.notes.set(path,{src,body,old,topic:destination,text:'# '+short(path)+'\n\n'+body+'\n\n出处：[['+src+']]\n归入：[['+destination+']]'});
        mine.history.push('第 '+lesson+' 课 · '+(old?'修改':'新建')+' [['+path+']] → [['+destination+']]');selected=path;renderMine();msg.textContent='已归入《'+short(destination)+'》，可以沿词条打开原件。';
      }
      if(action==='download'){
        const url=URL.createObjectURL(new Blob([ownFiles().get(selected)],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');
        a.href=url;a.download=selected.split('/').pop();a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
      }
    };
    host.addEventListener('input',e=>{if(e.target.name==='word')typed=e.target.value;});
    host.addEventListener('submit',e=>{
      if(!e.target.matches('.wb-word-form'))return;
      e.preventDefault();
      const answer=e.target.elements.word.value.trim().toLowerCase();
      if(!answer)return;
      if(answer!=='borrow'){
        retried=true;feedback='Try again. You want to take the ruler now and give it back later.';
        e.target.querySelector('small').textContent=feedback;e.target.elements.word.select();return;
      }
      stop();reviewResult=hinted?'hint':retried?'retry':'solo';
      try{sessionStorage.setItem(reviewKey,reviewResult);}catch{}
      frames=window.buildBrainLesson(track,lesson,variant,reviewResult).frames;
      total=duration*frames.length;slider.max=total;get('.wb-step').innerHTML=stepOptions();
      hinted=false;retried=false;typed='';feedback='';manual='';follow=true;
      showMode('sample');paint(total);stop();lines.focus({preventScroll:true});
    });
    tree.onchange=()=>selectFile(tree.value);
    get('.wb-step').onchange=e=>{stop();showMode('sample');manual='';follow=true;paint((Number(e.target.value)+1)*duration-1);stop();};
    slider.onpointerdown=stop;slider.oninput=()=>{stop();showMode('sample');manual='';follow=true;paint(Number(slider.value));stop();};
    chat.onscroll=()=>{follow=chat.scrollHeight-chat.scrollTop-chat.clientHeight<9;};
    get('.wb-own-files').onchange=e=>{selected=e.target.value;renderMine();};
    get('.wb-personal textarea').oninput=e=>mine.drafts.set(draftKey(),e.target.value);
    get('[type=file]').onchange=async e=>{
      const f=e.target.files[0];if(!f)return;
      const msg=get('.wb-msg');
      if(!/\.(md|txt)$/i.test(f.name)||f.size>1024*1024){msg.textContent='请选择 1 MB 以内的 Markdown 或文本文件。';return;}
      try{
        const text=await f.text();if(!host.isConnected)return;
        const base=f.name.replace(/[\[\]|]/g,'_'),dot=base.lastIndexOf('.');
        let path='我的原件/'+base,n=1;
        while(mine.files.has(path))path='我的原件/'+base.slice(0,dot)+' ('+(++n)+')'+base.slice(dot);
        mine.files.set(path,text);mine.history.push('第 '+lesson+' 课 · 导入 [['+path+']]');selected=path;renderMine();msg.textContent='已加入当前身份的课堂副本。';
      }catch{msg.textContent='未能读取文件，请重新选择。';}finally{e.target.value='';}
    };
    paint(time);stop();showMode('sample');if(finish)selectFile(work);
    return {stop,context:()=>mode==='mine'?'学员正在本地课堂副本中核对自己的资料。':'工作台示例：'+current().label+'；打开 '+(manual||current().path)+'。本课主词条：'+topic+'；关联词条：'+related+'；本课作品：'+work};
  };
})();
