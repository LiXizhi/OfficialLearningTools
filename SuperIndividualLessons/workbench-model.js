// Replay all earlier lessons, including the chosen enterprise branch, before
// recording this lesson. A write replaces one immutable Markdown buffer.
window.buildBrainLesson = function(track,number,variant,reviewResult){
  const story=window.brainStories[track],course=window.brainCourses[track];
  const library=window.brainWiki[track],index='_wiki/index.md',log='_wiki/log.md';
  const name=path=>path.split('/').pop().replace(/\.md$/,'');
  const wiki=path=>'[['+path.replace(/\.md$/,'')+'|'+name(path)+']]';
  const pagePath=title=>'_wiki/'+(library.pages[title].project?'projects':'concepts')+'/'+title+'.md';
  const pageHeader=title=>'# '+title+'\n\n'+library.pages[title].scope;
  const indexEntry=title=>'- '+wiki(pagePath(title))+'　'+library.pages[title].scope;
  const startingPages=Object.entries(library.pages).filter(([,p])=>p.source);
  let files={[index]:'# 我的 Wiki 词条\n\n'+startingPages.map(([title])=>indexEntry(title)).join('\n'),[log]:'# 维护日志'},previous=null;
  for(const [title,p] of startingPages){
    const source='docs/'+p.source+'.md';
    files[source]='# '+p.source+'\n\n'+p.excerpt;
    files[pagePath(title)]=pageHeader(title)+'\n\n## 开课前的记录\n'+p.excerpt+'\n出处：'+wiki(source);
  }
  const frames=[];
  for(let i=0;i<number;i++){
    function event(label,user,ai,path,next,focus='',fresh=false,extras={}){
      const before=files[path];
      if(next!==undefined)files={...files,[path]:next};
      if(i===number-1)frames.push({label,user,ai,path,before,files,write:next!==undefined,focus,fresh,...extras});
    }
    if(i===4&&track==='enterprise'){
      files={...files,...window.adultSummit.initialFiles};
      previous=window.buildSummitLesson({event,read:path=>files[path],wiki,index,log,pagePath,previous,role:track});
      continue;
    }
    if(track==='teacher'){
      const build=i===4?window.buildTeacherPsychology:i===3?window.buildTeacherResearch:window.buildTeacherWorkshop;
      previous=build({i,event,read:path=>files[path],index,log,wiki,pagePath,previous});
      continue;
    }
    const l={...story.stages[i],...(track==='enterprise'&&variant==='manager'&&i>=2?story.manager[i-2]:{})};
    const filing={...library.lessons[i],...(track==='enterprise'&&variant==='manager'&&i>=2?library.manager[i-2]:{})};
    const topic=pagePath(filing.home),related=pagePath(filing.related);
    const raw='docs/'+l.input+'.md',proof='docs/'+l.check+'.md',out='作品/'+l.work+'.md';
    if(l.vocabulary){
      const final=window.buildVocabularyDays({event,read:path=>files[path],wiki,index,log,topic,related,raw,proof,out,previous,result:reviewResult});
      previous={...l,...filing,topic,out,raw,final};
      continue;
    }
    const material=l.material||course.lessons[i].material||course.material;
    event('从索引开始',l.question,previous?'先翻《'+name(previous.topic)+'》，找回上节课的作品，再决定新材料放哪一页。':'索引里已有《'+filing.home+'》和《'+filing.related+'》。今天先看《'+filing.home+'》里原来记了什么。',index,undefined,wiki(previous?.topic||topic));
    if(previous){
      event('打开已有词条','上一次是怎么判断的？','这条结论旁边留着上节作品和原件，我先打开作品核对。',previous.topic,undefined,wiki(previous.out));
      event('取回上节作品','','上节最后保存的是这句话：“'+previous.final+'”',previous.out,undefined,previous.final);
    }else event('打开已有词条','这个词条平时装什么？',library.pages[filing.home].scope+' 你原来留过这份材料。',topic,undefined,wiki('docs/'+library.pages[filing.home].source+'.md'));
    event('保存我的原件','这份是我今天带来的材料。先把原话留下。','我把它作为独立的 Markdown 原件保存。以后改判断，还能回这里看当时写了什么。',raw,'# '+l.input+'\n\n'+material);
    if(previous)event('对照旧原件','新情况和上次的条件一样吗？','先看上一次的原件，再和刚保存的《'+l.input+'》比较。',previous.raw,undefined,previous.quote);
    event('核对这句原话','','在新原件中找到“'+l.quote+'”。请你判断这句话能支持什么。',raw,undefined,l.quote);
    if(!files[topic]){
      event('商量是否另开词条','这份新材料以后从哪里找？',filing.reason,related);
      const origin=library.pages[filing.related].source;
      event('确认并新建词条','可以，以后我会单独来这页找。','我先写下这页收哪些材料，并链接到已有的记录。',topic,pageHeader(filing.home)+'\n\n相关词条：'+wiki(related)+(track==='student'?'\n先前的观察日记线索：'+wiki('docs/'+origin+'.md'):''));
      event('登记总索引','','把新词条的入口和收录范围加进索引。',index,files[index]+'\n'+indexEntry(filing.home));
    }
    const revising=previous?.topic===topic&&previous.heading===filing.heading;
    const judgment='当前判断：'+l.finding;
    const updated=revising?files[topic].replace('当前判断：'+previous.finding,judgment):files[topic]+'\n\n## '+filing.heading+'\n'+judgment;
    event('修订已有词条','我确认：'+l.finding,'这条放在《'+filing.home+'》的“'+filing.heading+'”小节。'+(revising?'上次的出处保留，新判断旁再附今天的原件。':'以后同类材料可以接着写在这里。'),topic,updated+'\n第 '+(i+1)+' 课原件：'+wiki(raw));
    if(!previous){
      event('新对话查索引',course?.retrieve||'明早展台可以怎样开场？把依据找给我。','新对话先读索引，找到《'+filing.home+'》。',index,undefined,wiki(topic),true);
      event('沿词条找原件','','词条里有出处。沿这个链接打开最初保存的材料。',topic,undefined,wiki(raw));
      event('打开找回的原件','','原文件里确实有“'+l.quote+'”。现在用它做眼前的事。',raw,undefined,l.quote);
    }
    const draft='# '+l.work+'\n\n'+l.draft+'\n\n依据：'+wiki(topic);
    event('AI 起草作品','根据以上材料给我一个初稿，留给我核对。','我另建作品草稿。下面这句还要由你试一试。',out,draft);
    event('记录人的检验','我试过了：'+l.note,'把你的原话保存为核对记录。它是改稿的依据。',proof,'# '+l.check+'\n\n'+l.note);
    event('按证据改稿','请按我的核对结果改这一句。','红色是撤下的草稿，蓝色是这次确认的写法。',out,draft.replace(l.draft,l.final)+'\n核对：'+wiki(proof));
    event('把成果写回词条','','下次打开《'+filing.home+'》，可以找到作品、检验记录，再翻到《'+filing.related+'》。',topic,files[topic]+'\n作品：'+wiki(out)+'\n核对：'+wiki(proof)+'\n另见：'+wiki(related));
    event('打开关联词条','换个时候，我还会从哪里找这件事？','再翻《'+filing.related+'》。'+library.pages[filing.related].scope,related);
    event('写入另一页','在这页留下这次能用的经验。',filing.entry,related,files[related]+'\n\n## '+l.work+'\n'+filing.entry+'\n参见：'+wiki(topic)+'　检验记录：'+wiki(proof)+'　作品：'+wiki(out));
    event('登记改动','以后怎么知道为什么改过？','日志里能分别打开两页，看到各自留下的判断和共同引用的原件。',log,files[log]+'\n\n## 第 '+(i+1)+' 课\n主词条 '+wiki(topic)+'\n关联词条 '+wiki(related)+'\n作品 '+wiki(out)+'\n依据 '+wiki(proof));
    previous={...l,...filing,topic,out,raw};
  }
  const topics=Object.keys(library.pages).map(pagePath).filter(path=>Object.hasOwn(files,path));
  const summit=track==='enterprise'&&number===5;
  return {frames,actor:summit?'CEO':story.actor,topic:previous.topic,related:summit?previous.related:pagePath(previous.related),topics,work:previous.out};
};
