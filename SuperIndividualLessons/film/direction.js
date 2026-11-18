// Deterministic choreography. Frame time is local to a shot and ranges from 0 to 1.
function directExhibit(set,chapter,shot,time,opening=false) {
  const {render,scene,camera,v,words,he,peer,teacher,rover,twins,display,cord,sheet,paper,pen,stamp,folder}=set;
  const clamp=n=>Math.max(0,Math.min(1,n));
  function ease(a,b){const t=clamp((time-a)/(b-a));return t*t*(3-2*t);}
  const move=(a,b,f)=>a.clone().lerp(b,f);
  const direction=[
    ['promise','recording','write','opening'],
    ['draft','reboot','recording','compare'],
    ['assignment','missing','download','press'],
    ['pass','search','retest','seal']
  ][chapter][shot];
  const writing=['promise','draft','write','compare','press'].includes(direction);
  const playback=['recording','opening','retest'].includes(direction);
  const handing=direction==='pass', signing=direction==='seal', pulling=direction==='reboot';
  const peerWorking=chapter===3 || direction==='opening';
  const showPeers=peerWorking || direction==='assignment';
  const flick=Math.sin(time*Math.PI*6),wave=Math.sin(time*Math.PI*2);
  he.g.position.set(-.66,0,-.15);
  peer.g.position.set(peerWorking?-1.39-.42*(1-ease(.02,.65)):-1.72,0,-.19);
  teacher.g.position.set(1.61,0,-.30);
  he.g.rotation.y=.19;peer.g.rotation.y=.30;teacher.g.rotation.y=-.28;
  peer.g.visible=showPeers;teacher.g.visible=signing || direction==='opening';
  for(const [i,a] of [he,peer,teacher].entries()) {
    a.head.rotation.y=(a===teacher?-.35:.37)+.10*wave;
    a.head.rotation.x=.15+.07*Math.sin((time*2+i)*Math.PI);
    a.head.rotation.z=.033*Math.sin(time*4+i);
    a.eyes.scale.y=1-.94*Math.pow(Math.max(0,Math.cos(time*9+i*2-4)),100);
  }
  rover.h.rotation.y=direction==='assignment'?.35*wave:0;
  for(const [i,twin] of twins.entries()){
    twin.g.visible=chapter===2;
    twin.g.position.y=1.05+.08*(1+Math.sin(time*6+i*2));
    twin.h.rotation.y=(i?-.42:.36)+wave*.20;
    twin.arm.rotation.z=-.6+.36*Math.sin(time*9+i);
  }
  folder.visible=chapter===3 || chapter===1;
  sheet.position.set(-.63,1.07,.59);sheet.rotation.set(0,-.08,0);
  if(handing){
    sheet.position.copy(move(v(-.60,1.33,.30),v(-1.21,1.31,.27),ease(.16,.78)));
    sheet.rotation.x=.36;sheet.rotation.y=.1;
  } else if(signing) {
    sheet.position.copy(move(v(.95,1.08,.65),v(1.58,1.22,.5),ease(.67,.94)));
  }
  const titles={promise:'展台说明',draft:'离线测试草稿',write:'展台说明',compare:'核验记录',press:'校报 · 开放日',pass:'展前检查单',seal:'展台检查单'};
  const pc=paper.ctx,pw=paper.c.width,ph=paper.c.height;
  pc.fillStyle='#fff3d1';pc.fillRect(0,0,pw,ph);
  pc.fillStyle='#387369';pc.fillRect(0,0,14,ph);
  words(pc,titles[direction] || '彩排笔记',40,65,39,'#344e45');
  const notes={
    compare:['A   真车重启要登录','B   录像断网也能播'], write:['已确认    本机录像','待复测    真车开机'],
    draft:['整个展台','断网也能用？'], press:['展厅可观看录像','真车演示待确认'],
    pass:['下载录像','点击播放'], search:['下载录像','点击播放'],
    retest:['录像存到展台电脑','拔线后播到片尾'],seal:['录像存到展台电脑','拔线后播到片尾']
  };
  const paperLines=notes[direction] || ['机器人应该能演示？','根据哪次彩排？'];
  const revising=['write','compare','press'].includes(direction);
  paperLines.forEach((line,i)=>{
    const reveal=revising?ease(.12+i*.32,.48+i*.32):1;
    pc.save();pc.beginPath();pc.rect(33,85+i*59,(pw-45)*reveal,58);pc.clip();
    words(pc,line,39,131+i*59,26,'#53665d',500);pc.restore();
  });
  pc.strokeStyle='#bc6046';pc.lineWidth=6;
  pc.beginPath();pc.moveTo(39,146);pc.lineTo(39+220*ease(.18,.81),146);pc.stroke();
  if(signing && time>.51){
    pc.strokeRect(245,215,104,53);words(pc,'已复验',251,251,28,'#b75340');
  }
  paper.texture.needsUpdate=true;
  sheet.updateMatrixWorld(true);
  pen.visible=writing;
  const line=time>=.48?1:0;
  const inkProgress=revising?ease(.12+line*.36,.48+line*.32):ease(.18,.81);
  const nib=sheet.localToWorld(v(-.23+.34*inkProgress,.032,-.06+(revising?line*.09:0)+.009*flick));
  pen.position.copy(nib);pen.rotation.z=.04*wave;
  const inkPad=sheet.localToWorld(v(.10,.04,.115));
  const stampLift= .25*(1-ease(.19,.52))+.24*ease(.53,.69);
  stamp.position.copy(inkPad).y+=stampLift;stamp.visible=signing;
  const inserted=v(.071,1.08,.63),loose=v(-.22,1.077,.70);
  const downloads=direction==='download'||direction==='retest';
  const plugPosition=move(inserted,loose,pulling?ease(.20,.40):downloads?ease(.48,.61):playback?1:0);
  cord(plugPosition);
  const key=v(.17,1.115,.72);
  let heRight=v(-.32,1.12,.31),heLeft=v(-.99,1.105,.37);
  let peerRight=v(peer.g.position.x+.39,1.14,.24),teacherLeft=v(1.25,1.17,.22);
  if(writing) heRight=nib.clone().add(v(.054,.11,-.012));
  if(handing) {
    heLeft=sheet.localToWorld(v(.25,.055,0));
    peerRight=move(peerRight,sheet.localToWorld(v(-.23,.055,0)),ease(.20,.67));
  }
  if(pulling) heRight=move(heRight,plugPosition.clone().add(v(-.06,.029,0)),ease(0,.19));
  if(playback || direction==='download' || direction==='missing'){
    const reach=ease(.03,.40)*(1-.7*ease(.65,.98));
    heRight=move(heRight,v(.11,1.115,.70),reach);
  }
  if(direction==='assignment') heRight=move(heRight,v(-.12,1.50,.52),ease(.15,.45));
  if(direction==='search'||direction==='retest') {
    peer.g.position.x=-.32-.88*(1-ease(.02,.52));he.g.position.x=-1.53;
    heLeft.x=-1.75;heRight.x=-1.18;
    peerRight=move(v(peer.g.position.x+.31,1.17,.21),key,ease(.35,.64));
  }
  if(signing) teacherLeft=stamp.position.clone().add(v(.005,.15,0));
  for(const a of [he,peer,teacher]) a.g.updateMatrixWorld(true);
  he.left(heLeft);he.right(heRight);peer.right(peerRight);
  peer.left(v(peer.g.position.x-.29,1.14,.31));
  teacher.left(teacherLeft);teacher.right(v(1.90,1.16,.26));

  // The little rover travels inside the recorded film; the physical rover remains parked.
  const sc=display.ctx,w=display.c.width,h=display.c.height;
  const status=(title,sub,bg,fg)=>{
    sc.fillStyle=bg;sc.fillRect(0,0,w,h);sc.fillStyle=fg;sc.fillRect(31,42,55,7);
    words(sc,title,30,132,48,fg);words(sc,sub,32,205,25,fg,500);
  };
  if(downloads && time<.60){
    status('正在下载','保存到：展台电脑','#356764','#fff0c8');
    sc.fillStyle='#f1c276';sc.fillRect(32,242,460*ease(.04,.48),13);
  } else if(playback || downloads){
    sc.fillStyle='#9fcbc1';sc.fillRect(0,0,w,h);
    sc.fillStyle='#619482';sc.beginPath();sc.moveTo(0,193);sc.lineTo(115,88);sc.lineTo(223,184);sc.lineTo(380,99);sc.lineTo(576,192);sc.fill();
    sc.fillStyle='#eec994';sc.fillRect(0,192,w,h-192);
    const x=100+320*time;
    sc.fillStyle='#bf703b';sc.fillRect(x-45,154,92,46);sc.fillRect(x-28,124,58,34);
    sc.fillStyle='#34615c';sc.fillRect(x-19,132,39,12);
    for(const dx of [-29,29]){sc.beginPath();sc.arc(x+dx,202,15,0,Math.PI*2);sc.fillStyle='#2c4747';sc.fill();
      sc.beginPath();sc.moveTo(x+dx,202);sc.lineTo(x+dx+9*Math.cos(time*25),202+9*Math.sin(time*25));sc.strokeStyle='#c3bb98';sc.lineWidth=4;sc.stroke();}
    sc.fillStyle='#294e48';sc.fillRect(0,h-50,w,50);words(sc,'本机录像',18,h-16,23,'#fff1ce');
    sc.fillStyle='#75988c';sc.fillRect(142,h-22,386,5);sc.fillStyle='#f2c465';sc.fillRect(142,h-22,386*time,5);
  } else if(pulling){
    if(time<.49)status('控制台就绪',time<.32?'连接正常':'已断网 · 仍可操作','#28615d','#f3edd4');
    else if(time<.64)status('重启中…','','#1e3234','#a0c3ae');
    else status('请联网登录','控制台重新启动','#864d40','#fff1d8');
  } else if(direction==='search'||direction==='missing') {
    if(time<.36)status('打开录像','展台电脑 / 本地文件','#416e74','#f5e5c4');
    else status('找不到文件','此电脑尚未保存录像','#8b5545','#fff1d8');
  } else if(direction==='compare')status('两份原件','A 控制台     B 录像','#346560','#fcf1d3');
  else if(direction==='draft'||direction==='promise')status('离线也可以？','昨晚的彩排讨论','#476d74','#fff1d8');
  else if(direction==='assignment'||direction==='press')status('共同工作页','展台讲解  /  校报记者','#486875','#fff0cc');
  else status('展前检查单','展厅 01   /   彩排记录','#40645c','#fff0d8');
  display.texture.needsUpdate=true;
  // Lens changes are motivated by the evidence: first show its owner, then the actual object.
  const wide=[v(.26,2.26,4.68),v(-.13,1.40,.03)];
  const desk=[v(.08,2.02,2.82),v(-.30,1.43,.20)];
  const screen=[v(.63,1.87,2.18),v(.49,1.33,.48)];
  const page=[v(-.48,2.26,1.46),v(-.55,1.084,.58)];
  const both=[v(.12,2.30,3.28),v(-.24,1.26,.26)];
  const handoff=[v(-1.04,1.76,2.00),v(-1.01,1.43,.10)];
  const seal=[v(1.28,2.20,1.76),v(1.25,1.15,.46)];
  const cuts={
    promise:[wide,desk],recording:[both,screen],write:[desk,page],opening:[wide,both],
    draft:[desk,page],reboot:[desk,screen],compare:[desk,page],assignment:[wide,both],
    missing:[desk,screen],download:[both,screen],press:[both,page],pass:[wide,handoff],
    search:[wide,screen],retest:[both,screen],seal:[wide,seal]
  };
  const [start,end]=opening?[wide,wide]:cuts[direction];
  const f=ease(.15,.76);
  camera.position.copy(move(start[0],end[0],f));camera.lookAt(move(start[1],end[1],f));
  render.render(scene,camera);
}
