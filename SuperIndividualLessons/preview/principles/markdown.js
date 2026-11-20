// Classroom Markdown buffers. Playback, browsing and export all use these lines.
function wikiLine(key,text,target){return {key,text,target,type:'plain'};}
function wikiLink(id){
  const slug=files[id].split('/').pop().replace(/\.md$/,'');
  return '[['+slug+'|'+titles[id]+']]';
}
function initialWiki(){
  const docs={};
  for(const [id,kind] of Object.entries({concept:'concept',project:'project',person:'entity'})){
    docs[id]=[wikiLine('start','---'),wikiLine('title','title: '+titles[id]),wikiLine('type','type: '+kind),
      wikiLine('sources','sources: []'),wikiLine('end','---'),wikiLine('heading','# '+titles[id]),wikiLine('body','')];
    if(id==='person')docs[id].push(wikiLine('role','课堂角色示例：记录授课老师在项目中的分工。'));
    docs[id].push(wikiLine('related','## 相关词条'));
    for(const target of id==='project'?['concept','person']:['project']){
      docs[id].push(wikiLine(target,'- '+wikiLink(target),{file:target}));
    }
  }
  docs.index=[wikiLine('heading','# 我的第二大脑 · 词条索引')];
  for(const [key,title,id] of [['methods','方法','concept'],['projects','我的项目','project'],['people','相关人员','person']]){
    docs.index.push(wikiLine(key,'## '+title),wikiLine(id,'- '+wikiLink(id),{file:id}));
  }
  docs.index.push(wikiLine('history','## 维护记录'),wikiLine('log','- [维护日志](log.md)',{file:'log'}));
  docs.log=[wikiLine('heading','# 改动记录')];
  return docs;
}
function putLine(rows,line,before){
  const out=rows.slice(),old=out.findIndex(r=>r.key===line.key);
  if(old>=0)out[old]=line;
  else{const at=out.findIndex(r=>r.key===before);out.splice(at<0?out.length:at,0,line);}
  return out;
}
function addCitation(rows,n){
  const path=archive[events[n].src].path;
  rows=putLine(rows,wikiLine('sources','sources:'));
  return putLine(rows,wikiLine('src:'+path,'  - '+path,{source:n}),'end');
}
function projectIndex(n){return wikiLine('project','- '+wikiLink('project')+' — '+events[n].line,{file:'project'});}
function factLine(n){return wikiLine('fact:'+events[n].key,'- '+events[n].line,{source:n});}
function refLine(n){
  const path=archive[events[n].src].path;
  const relative='../../'+path;
  return wikiLine('ref:'+n,'  [出处 '+(n+1)+']('+relative+')',{source:n});
}
function logEntry(n){
  const e=events[n];
  return [wikiLine('date:'+n,'## '+e.date+' · '+e.title),wikiLine('fact:'+e.key,'- '+e.line),
    wikiLine('ref:'+n,'出处：'+archive[e.src].path,{source:n})];
}
function teacherRows(rows){
  return putLine(addCitation(rows,11),wikiLine('duties','- 11 月 7 日讨论：老师准备材料、控制课堂节奏，需要时请 AI 调出课件。',{source:11}),'related');
}
function buildWikiHistory(pos){
  const docs=initialWiki();
  for(let i=0;i<pos;i++){
    const e=events[i];
    if(e.dest!=='log')docs[e.dest]=putLine(putLine(addCitation(docs[e.dest],i),factLine(i),'related'),refLine(i),'related');
    if(e.dest==='project')docs.index=putLine(docs.index,projectIndex(i));
    if(i===11)docs.person=teacherRows(docs.person);
    docs.log.push(...logEntry(i));
  }
  return docs;
}
function wikiFrames(beats,pos,choice){
  const e=events[pos],sourcePath=archive[e.src].path;
  let docs=buildWikiHistory(pos);
  let deleted=null,deletedAt=-1;
  for(const beat of beats){
    const id=beat.docId;
    if(id==='source'){beat.docs=docs;continue;}
    const before=docs[id]||[];
    let rows=before,focus='';
    switch(beat.op){
      case '查索引': focus=e.dest;break;
      case '读旧页': focus=pos===15?'fact:lesson':'fact:'+e.key;break;
      case '等你选择':focus='fact:buttons';break;
      case '删旧行':
        deletedAt=before.findIndex(r=>r.key==='fact:'+e.key);
        deleted=before[deletedAt];
        rows=before.filter(r=>r!==deleted);break;
      case '草稿去重':break;
      case '新建文件':
        rows=['---','title: 课堂现场验证','type: concept','sources: []','---','# 课堂现场验证',
          '- 电磁场 H5：已用语音找回并打开。','- 遥控器双按钮：联动待测。'].map((s,i)=>wikiLine(['start','title','type','sources','end','heading','demo','hardware'][i],s));
        break;
      case '新增行':case '改写':
        if(deletedAt>=0)rows=[...before.slice(0,deletedAt),factLine(pos),...before.slice(deletedAt)];
        else rows=id==='log'?[...before,...logEntry(pos).slice(0,2)]:putLine(before,factLine(pos),'related');
        if(pos===15&&choice==='new')rows=putLine(rows,wikiLine('topic','- '+wikiLink('topic'),{file:'topic'}));
        break;
      case '加出处':
        if(id==='topic'){
          rows=addCitation(before,12);
          for(const [key,n] of [['demo',12],['hardware',13]]){
            const old=rows.find(r=>r.key===key);
            rows=putLine(rows,wikiLine(key,old.text+' [依据](../../'+archive.demo.path+')',{source:n}));
          }
          rows=putLine(rows,wikiLine('project','所属项目：'+wikiLink('project'),{file:'project'}));
        }else if(id==='log')rows=putLine(before,logEntry(pos)[2]);
        else{
          rows=putLine(addCitation(before,pos),refLine(pos),'related');
          // Reuse an existing source path when this file has already been cited.
          focus='src:'+sourcePath;
        }
        break;
      case '更新目录':
        rows=putLine(before,projectIndex(pos));
        if(pos===15&&choice==='new')rows=putLine(rows,wikiLine('topic','- '+wikiLink('topic'),{file:'topic'}),'projects');
        break;
      case '追加日志':rows=[...before,...logEntry(pos)];break;
    }
    if(rows!==before)docs={...docs,[id]:rows};
    if(pos===11&&beat.op==='已归档')docs={...docs,person:teacherRows(docs.person)};
    beat.docs=docs;
    if(beat.op==='草稿去重')continue;
    if(beat.op==='删旧行'&&deleted){beat.rows=before.map(r=>r===deleted?{...r,type:'erase'}:r);continue;}
    const oldByKey=new Map(before.map(r=>[r.key,r]));
    beat.rows=rows.flatMap(r=>{
      const old=oldByKey.get(r.key);
      if(old?.text===r.text)return [r.key===focus?{...r,type:'highlight'}:r];
      const replaced=old||(beat.op==='改写'&&r.key===deleted?.key?deleted:null);
      return [...(replaced?[{...replaced,type:'removed'}]:[]),{...r,type:'insert'}];
    });
  }
  return beats;
}
