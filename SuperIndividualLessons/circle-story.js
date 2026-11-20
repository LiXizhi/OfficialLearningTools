// Each beat is a complete message and its matching simulated workbench operation.
(() => {
  const actors={
    lin:['林老师','林','lin'], linAI:['林老师的分身','林 AI','lin'],
    zhou:['周工','周','zhou'], zhouAI:['周工的分身','周 AI','zhou'], duty:['值班分身','值 AI','duty']
  };
  const linPrivate='私聊 · 林老师与分身', zhouPrivate='私聊 · 周工与分身';
  const group='圈聊 · 科学展筹备群', booth='圈聊 · 展台临时圈';
  const quote='当天未启动小车。', oldLine='真车离线重启：待复测。';
  const newLine='2 号电脑断网重启后需要联网登录。离线开场先放本机录像。';
  const records={
    index:['林老师的第二大脑','_wiki/index.md',['# 展台资料','离线演示 → 周四彩排.md']],
    rehearsal:['林老师的第二大脑','docs/周四彩排.md',['# 周四彩排','断网后，本机录像从头播到片尾。',quote]],
    device:['周工的第二大脑','设备/小车展台.md',['# 展台设备','现场控制台安装在展台 2 号电脑。','复测时先拔网线，再关闭并重开控制台。']],
    calendar:['周工的个人工作台','日历 / 今日安排',['08:50　设备值班','08:55–09:00　空闲']],
    team:['团队第二大脑','Wiki/展台交接.md',['# 离线开场',oldLine]],
    test:['周工的第二大脑','docs/周五现场复测.md',['# 展台 2 号电脑 · 周五现场复测','断网并重启，控制台停在登录页。','本机录像从头播到片尾。','记录人：周工']],
    shared:['团队第二大脑','原件/周五现场复测.md',['# 展台 2 号电脑 · 周五现场复测','断网并重启，控制台停在登录页。','本机录像从头播到片尾。','记录人：周工　核对人：林老师']]
  };
  const scenes=[
    ['各自准备','08:30','workbench','林老师在电脑前核对彩排笔记','九点开场，断网时能演什么？','在工作台提出问题。分身用检索工具翻第二大脑，从索引追到彩排原句。'],
    ['长期圈子','08:40','workbench','林老师在工作台发出复测请求','筹备群里，谁来接这件事？','把微信、钉钉或飞书里的工作群想成未来的长期圈子。成员可以委派分身接单。收到求助时，团队文件里的测试结论仍然是“待复测”。'],
    ['相遇成圈','08:50','encounter','林老师和周工走到同一展台','两人走近，分身先打个招呼。','未来设想：两人事先允许在展台附近交换角色与任务，走近即可临时组圈。酒会上也可以只交换公开的研究兴趣，各自点头后再交换名片。'],
    ['分身传话','08:53','encounter','两位负责人在展台旁商量复测','哪一句能发？谁现在有空？','分身可以在私聊里读获准使用的资料；要跨到圈里，先确认可以分享哪一句。对方收到周工的答复，详细日程留在周工自己的工作台。'],
    ['散场交班','08:58','test','两人在断网设备旁复测并记录结果','临时圈要散了，哪句能留下？','周工同意交出原件，林老师核对并确认交接句，分身再写入团队第二大脑。临时圈到期后，下一班仍可沿团队文件找到这次复测。']
  ];
  // actor, audience, spoken message, operation, target, result, cited line
  const beats=[
    [0,'lin',linPrivate,'查一下周四彩排。断网时，我们试过真车吗？','查找文件','index','从索引定位彩排原件。',2],
    [0,'linAI',linPrivate,'录像播完了。笔记最后一句写着“当天未启动小车”。','读取原件','rehearsal','找到能支持判断的原话。',3],
    [1,'lin',linPrivate,'可以发到筹备群：九点前，找一位能试车的志愿者。','本人授权','rehearsal','只授权发送求助。彩排本仍在个人脑。'],
    [1,'linAI',group,'九点前，谁能来展台复测小车？','发送圈消息','inbox','求助已发给筹备组成员。'],
    [1,'duty',group,'我接到了，这就联系设备志愿者。','回复圈消息','inbox','请求已送达；复测尚未完成。'],
    [2,'linAI',booth,'你好，我负责机器人展台。我们在找人测离线控制。','建立临时圈','inbox','双方已允许在展台附近交换角色和本次任务。'],
    [2,'zhouAI',booth,'周工负责这台车。我去问问他。','回复圈消息','inbox','双方的分身都能看到这句招呼。'],
    [2,'zhouAI',zhouPrivate,'旁边是展台的林老师。要一起测车吗？','发送私信','dm','收件人只有周工。'],
    [3,'zhouAI',booth,'周四拔线后，你们重启过控制台吗？','发送圈消息','inbox','向展台临时圈询问测试条件。'],
    [3,'lin',linPrivate,'可以发彩排本最后一句，整本留在我这里。','本人授权','rehearsal','林老师允许分享第 3 行。',3],
    [3,'linAI',booth,'周四彩排原话：“当天未启动小车。”','发送授权摘录','rehearsal','已发送摘录，私人文件保留在原处。',3],
    [3,'zhouAI',zhouPrivate,'你的日历显示 08:55 有五分钟空档。现在过去吗？','查询日历','calendar','仅在周工的私聊中显示空档。',2],
    [3,'zhou',zhouPrivate,'可以。告诉林老师我现在过去。','本人确认','calendar','周工同意赴约。'],
    [3,'zhouAI',booth,'周工已确认，现在到展台复测。','发送圈消息','inbox','圈内只收到赴约答复。'],
    [3,'zhouAI',zhouPrivate,'我查了你的设备页。用展台 2 号电脑拔线，关闭控制台，再重新打开。','读取设备记录','device','从周工的第二大脑找到复测步骤。',3],
    [4,'zhou',booth,'2 号电脑断网重启要登录，录像能播完。我同意把复测原件交给筹备组。','保存现场原件','test','周工记录结果并同意共享。',2],
    [4,'linAI',linPrivate,'建议写入：“'+newLine+'” 请你核对。','对照团队文件','team','等待林老师确认，原交接句仍在。',2],
    [4,'lin',linPrivate,'我核对过了。就用这句，把周工的复测原件一起存好。','本人确认','test','林老师已确认复测结果，团队文件等待写入。',2],
    [4,'linAI',linPrivate,'已替换交接页第 2 行。下一班点出处就能查到复测原件。','写入 Markdown','team','团队文件已更新。',2]
  ];
  const request=beats.findIndex(b=>b[4]==='对照团队文件'),write=beats.length-1;
  const span=3800,total=beats.length*span;
  const stamp=ms=>Math.floor(ms/60000)+':'+String(Math.floor(ms/1000)%60).padStart(2,'0');
  const buttons=(labels,attr)=>labels.map((label,i)=>'<button type="button" data-'+attr+'="'+i+'">'+label+'</button>').join('');
  const row=(number,value,style='')=>'<div class="ct-line '+style+'"><small>'+String(number).padStart(2,'0')+'</small><span>'+value+'</span></div>';
  function bubble(b){
    const [,id,channel,msg]=b,[name,avatar,side]=actors[id],privateChat=channel.startsWith('私聊');
    return '<article class="ct-msg ct-'+side+'"><i aria-hidden="true">'+avatar+'</i><div><b>'+name+'</b><small class="'+(privateChat?'ct-private':'ct-public')+'">'+channel+'</small><p>'+msg+'</p></div></article>';
  }
  window.mountCircleStory=host=>{
    let time=0,step=-1,approved=false,playing=false,raf=0,start=0,view='',follow=true;
    const get=s=>host.querySelector(s);
    host.innerHTML='<header><p class="meta">分身协作演示</p><h2 tabindex="-1">两个 AI 分身怎样一起办成一件事？</h2><p>科学展九点开门。林老师需要试车，周工负责设备。看他们的分身怎样联系，再把亲手试过的结果交给下一班。</p></header>'+
      '<nav class="circle-stops" aria-label="分身协作场景">'+buttons(scenes.map(s=>s[0]),'stop')+'</nav>'+
      '<div class="ct-player"><div class="ct-panels"><section class="ct-left"><figure><img alt=""><figcaption></figcaption></figure><div class="ct-chat" tabindex="0" aria-label="分身对话记录"></div></section>'+
      '<section class="ct-right"><h3>工作台操作</h3><div class="ct-trace"></div><nav class="ct-tabs" aria-label="查看同步记录">'+buttons(['当前操作','圈内消息','团队第二大脑','个人原件'],'view')+'</nav><div class="circle-sheet" tabindex="0" aria-label="工作台记录"></div></section></div>'+
      '<div class="ct-controls"><button data-play-circle>▶ 播放</button><button data-skip="-1" aria-label="上一条消息">‹</button><button data-skip="1" aria-label="下一条消息">›</button><label>时间轴 <input type="range" min="0" max="'+total+'" step="100" value="0" aria-label="分身协作时间轴"></label><output></output></div></div>'+
      '<details class="ct-more"><summary>这一幕里的协作关系</summary><p></p></details>';
    const chat=get('.ct-chat'),sheet=get('.circle-sheet'),slider=get('input'),play=get('[data-play-circle]');
    function stop(){
      playing=false;cancelAnimationFrame(raf);host.classList.remove('ct-playing');
      play.textContent=play.disabled?'等待确认':time===total?'↺ 重播':'▶ 播放';
    }
    function record(){
      const b=beats[step],target=view||b[5];
      const personal=['rehearsal','device','test'].includes(view);
      host.querySelectorAll('[data-view]').forEach((btn,i)=>btn.setAttribute('aria-pressed',String(i===(personal?3:view==='inbox'?1:view==='team'||view==='shared'?2:0))));
      if(target==='inbox'){
        const sent=beats.slice(0,step+1).filter(item=>item[2].startsWith('圈聊'));
        sheet.innerHTML='<h4>圈内投递记录</h4>'+ (sent.length?sent.map(item=>'<p class="ct-mail"><b>'+item[2]+' · '+actors[item[1]][0]+'</b>'+item[3]+'</p>').join(''):'<p>此刻还没有圈消息。</p>');
        sheet.scrollTop=sheet.scrollHeight;return;
      }
      if(target==='dm'){
        sheet.innerHTML='<h4>私信投递记录</h4><p>周工的分身 → 周工</p><p>'+b[3]+'</p>';return;
      }
      const [owner,path,lines]=records[target];
      let body=lines.map((line,i)=>row(i+1,line,target===b[5]&&i+1===b[7]?'ct-hit':'')).join('');
      if(target==='index')body+='<button data-doc="rehearsal">打开周四彩排原件 ↗</button>';
      if(target==='team'&&step===write)body=row(1,lines[0])+row(2,'− '+oldLine,'circle-del')+row(2,'＋ '+newLine,'circle-add')+'<p class="ct-owner">确认人：林老师 · 原件提供人：周工</p>'+
        '<button data-doc="shared">依据 · 打开周五现场复测原件 ↗</button>';
      if(target==='team'&&step===request)body+='<p>待确认草稿：'+newLine+'</p><button class="ct-approve" data-confirm>以林老师身份确认这句</button>';
      if(target==='shared')body+='<button data-doc="team">返回展台交接页</button>';
      const picker=personal?'<div class="ct-sources"><button data-doc="rehearsal">林老师 · 彩排本</button><button data-doc="device">周工 · 设备页</button>'+(step>=request-1?'<button data-doc="test">周工 · 复测原件</button>':'')+'</div>':'';
      sheet.innerHTML=picker+'<p class="ct-owner">'+owner+'</p><h4>'+path+'</h4>'+body;sheet.scrollTop=0;
    }
    function paint(ms){
      const gated=!approved&&ms>=(request+1)*span;
      time=Math.min(total,Math.max(0,gated?(request+1)*span-1:ms));
      const next=Math.min(write,Math.floor(time/span));
      if(next!==step){
        const previousScene=step<0?-1:beats[step][0];step=next;view='';
        const b=beats[step],scene=scenes[b[0]];
        if(previousScene!==b[0]){
          get('figure img').src='assets/circle-'+scene[2]+'.webp';get('figure img').alt=scene[3];
          get('figcaption').textContent=scene[1]+' · '+scene[4];get('.ct-more p').textContent=scene[5];
          host.querySelectorAll('[data-stop]').forEach((btn,i)=>btn.setAttribute('aria-pressed',String(i===b[0])));
        }
        const operator=step===0?'林老师的分身':actors[b[1]][0];
        get('.ct-trace').innerHTML='<b>'+b[4]+'</b><span>'+operator+' · '+b[6]+'</span>';
        const oldScroll=chat.scrollTop;
        chat.innerHTML=beats.slice(0,step+1).map(bubble).join('');
        chat.scrollTop=follow?chat.scrollHeight:oldScroll;
        get('[data-skip="-1"]').disabled=step===0;get('[data-skip="1"]').disabled=step===write;
        record();
      }
      slider.value=time;get('output').textContent=stamp(time)+' / '+stamp(total);
      slider.setAttribute('aria-valuetext',stamp(time)+'，'+scenes[beats[step][0]][0]+'，'+beats[step][4]);
      play.disabled=gated||(!approved&&step===request&&time>=(request+1)*span-1);
      if(gated||time===total)stop();
      if(play.disabled)play.textContent='等待确认';
      else if(!playing)play.textContent=time===total?'↺ 重播':'▶ 播放';
    }
    function tick(now){if(!playing)return;paint(now-start);if(playing)raf=requestAnimationFrame(tick);}
    function seek(ms){stop();follow=true;const inspected=view;view='';paint(ms);if(inspected)record();chat.scrollTop=chat.scrollHeight;}
    function startPlayback(){
      if(time===total){approved=false;seek(0);}
      if(view){view='';record();}
      follow=true;chat.scrollTop=chat.scrollHeight;playing=true;host.classList.add('ct-playing');
      play.textContent='Ⅱ 暂停';start=performance.now()-time;raf=requestAnimationFrame(tick);
    }
    host.addEventListener('click',ev=>{
      const b=ev.target.closest('button');if(!b)return;
      if(b.hasAttribute('data-play-circle')){if(playing)stop();else startPlayback();}
      else if(b.dataset.stop!==undefined)seek(beats.findIndex(item=>item[0]===Number(b.dataset.stop))*span);
      else if(b.dataset.skip)seek((step+Number(b.dataset.skip))*span);
      else if(b.hasAttribute('data-confirm')&&step===request){approved=true;seek((request+1)*span);startPlayback();}
      else if(b.dataset.view!==undefined||b.dataset.doc){stop();view=b.dataset.doc??['','inbox','team','rehearsal'][Number(b.dataset.view)];record();}
    });
    slider.addEventListener('pointerdown',stop);slider.addEventListener('input',()=>seek(Number(slider.value)));
    chat.addEventListener('scroll',()=>{follow=chat.scrollHeight-chat.clientHeight-chat.scrollTop<8;});
    paint(0);
    return {stop,context:()=>{const b=beats[step];return [scenes[b[0]][4],actors[b[1]][0],b[2],b[3],b[4],b[6],view&&('正在查看：'+(records[view]?.[1]||'圈内消息'))].filter(Boolean).join('。');}};
  };
})();
