// 共享通识 · 开场。热点坐标是插图未裁切时的百分比；修改标注无需重新生成图片。
(() => {
  const points=[
    ['助手',79,17,'随身 AI','在你授权的范围内跨设备使用长期记忆，在合适的时候递上一条提醒。',88,33],
    ['眼镜',47,13,'眼镜','看见眼前的会议白板或实验台，在镜片上显示一句相关的旧记录。',64,6],
    ['耳机',29,20,'耳机','双手正忙的时候，私下听到一句提醒，旁人听不到。',13,18],
    ['吊坠',40,40,'吊坠麦克风','你同意记录时，把一句口述存成原件；不同意时就不录。',21,42],
    ['手环',54,38,'戒指与手环','用一个手势请求提示；哪些身体信号可以被使用，由佩戴者自己决定。',71,41],
    ['手机',19,93,'手机','拍下白板或便签，由你决定哪张照片进入自己的资料库。',34,93],
    ['电脑',84,72,'电脑与工作台','打开工作台和第二大脑，查看 AI 依据了哪一行，再亲手修订。这一部分今天已经能做。',91,57]
  ];
  const stages=[
    ['从自己打字，到只会口喷','用说代替打字，AI 帮你整理成文字。','把口述存成原件，别让它只留在聊天记录里。','第二大脑',2],
    ['从等待结果，到燃烧 Token','同时让好几个 AI 干活，开始感觉自己的注意力和判断力不够用。','让 AI 先从第二大脑找依据，再动手；你只核对关键的几处。','工作循环',3],
    ['建立第二大脑，拥有很多分身','用规则与技能解放注意力，几个分身分头做事。','给每个分身定角色和授权，让经验回到同一个大脑。','分身',4],
    ['做出 AI Native 的产品并盈利','让超级个体的能力变成别人愿意付费的作品或服务。','和真人、分身组成圈子，靠交付和复购积累信任。','圈子',5]
  ];
  const ladder=[
    ['超级个体','一个人，多个角色分身','真人确定目标与判断；分身共享个人第二大脑，分别承担不同职责。','个人脑＋角色 Skills＋作品'],
    ['超级团队','围绕任务，组成圈子','多个真人与分身按角色分工，明确负责人、输入、交付和交接。','分工＋交付记录＋复盘'],
    ['超级组织','从岗位组织，到圈子协作','经过确认的经验、工具与客户关系，成为组织可以持续复用的资产。','组织脑＋协作机制＋经营能力']
  ];
  window.renderBrainOrientation=()=>`<section class="brain-orientation" aria-label="超级个体总览">
    <header class="opening-hero"><p class="meta">共享通识 · 开场</p><h1 tabindex="-1">什么是超级个体？</h1>
      <blockquote class="diary-quote"><p>碳基的我与硅基的我，共同构成一个超级个体。</p></blockquote>
      <p>一个人拥有自己的数字记忆，拥有能够调用这些记忆、替自己行动的分身，再通过这些分身与其他人和组织发生关系。</p></header>
    <ol class="ladder" aria-label="从超级个体到超级组织">${ladder.map(([t,s,d,keep],i)=>`<li><i>0${i+1}</i><h2>${t}</h2><strong>${s}</strong><p>${d}</p><small>留下：${keep}</small></li>`).join('')}</ol>
    <section class="today-card"><h2>今天，我的第二大脑长这样</h2>
      <div><img src="assets/real-brain-graph.webp" alt="第二大脑知识图谱" width="448" height="444" loading="lazy">
      <ul><li><b>224</b> 个知识页、<b>1309</b> 条链接。圆点是主题页，连线是彼此的引用。</li><li>本质是一个 Git 仓库：原始资料、知识页、维护规则都是普通文件，换一个 AI 也能接着用。</li><li>平时口述一段想法，AI 整理成原件，再折进对应的知识页。下一节的工作台会一步步演示这个过程。</li></ul></div></section>
    <div class="orientation-atlas"><div class="orientation-picture"><img src="assets/super-individual-future.webp" width="860" height="1075" alt="未来随身助手设想：戴眼镜和耳机的学员，身边有手机、电脑与象征 AI 的光球。">
    <svg class="orientation-leaders" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${points.map(([,x,y,,,lx,ly])=>`<line x1="${x}" y1="${y}" x2="${lx}" y2="${ly}"/><circle cx="${x}" cy="${y}" r=".55"/>`).join('')}</svg>
    ${points.map(([label,,,,,x,y],i)=>`<button type="button" data-device="${i}" aria-pressed="${i===0}" aria-controls="orientation-note" style="left:${x}%;top:${y}%">${label}</button>`).join('')}</div>
    <div class="orientation-side"><p class="meta">科普 · 研究远景</p><h2>认知共生体：AI 陪你经历，再把经验带回来</h2>
    <p>今天的 AI 大多是“你问，它答”。更进一步的设想是：AI 在你允许的范围内陪你经历情境，在合适的时候带回过去的经验，与人一起思考。点图中的设备看看各自的作用。</p>
    <div id="orientation-note" aria-live="polite"><strong>${points[0][3]}</strong><p>${points[0][4]}</p></div>
    <dl class="symbiosis"><div><dt>今天已能做</dt><dd>把经历存成原件，让 AI 沿知识地图找回来，你亲手核对。</dd></div><div><dt>还在探索中</dt><dd>可穿戴感知、主动提醒，以及增强现实、无声输入和神经接口。</dd></div><div><dt>不变的边界</dt><dd>记什么、信哪条、和谁分享，由人决定。</dd></div></dl></div></div>
    <section class="stage-check" aria-labelledby="stage-title"><p class="meta">自测</p><h2 id="stage-title">成为超级个体的几个阶段，你在哪一步？</h2>
      <p>点选最像你现在状态的一项。</p>
      <div class="stage-grid">${stages.map(([t,d],i)=>`<button type="button" data-stage="${i}" aria-pressed="false"><img src="assets/stage-${i+1}-${['voice','tokens','brain','product'][i]}.webp" alt="" width="1024" height="683" loading="lazy"><b>${i<3?'阶段 '+(i+1):'目标'}</b><strong>${t}</strong><span>${d}</span></button>`).join('')}</div>
      <p class="stage-advice" role="status" aria-live="polite"></p></section>
  </section>`;
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-device]');
    if(button){
      const section=button.closest('.orientation-atlas');
      for(const item of section.querySelectorAll('[data-device]'))item.setAttribute('aria-pressed',String(item===button));
      const [, , ,name,description]=points[Number(button.dataset.device)];
      section.querySelector('#orientation-note strong').textContent=name;
      section.querySelector('#orientation-note p').textContent=description;
    }
    const stage=e.target.closest('[data-stage]');
    if(stage){
      const box=stage.closest('.stage-check'),[,,next,section,n]=stages[Number(stage.dataset.stage)];
      for(const item of box.querySelectorAll('[data-stage]'))item.setAttribute('aria-pressed',String(item===stage));
      box.querySelector('.stage-advice').innerHTML='下一步：'+next+' <button type="button" data-chapter="'+n+'">去看「'+section+'」→</button>';
    }
  });
})();
