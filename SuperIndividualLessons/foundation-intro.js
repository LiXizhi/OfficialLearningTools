// Coordinates are percentages of the uncropped illustration. All labels are HTML.
(() => {
  const points=[
    ['助手',79,17,'随身 AI','在未来设想中，助手可以跨设备使用你授权的长期记忆，在需要时递上一条有出处的提示。',88,33],
    ['眼镜',47,13,'眼镜','看见你面前的展台，在镜片上显示一句上次试演的结论。',64,6],
    ['耳机',29,20,'耳机','双手忙着布展时，你也能私下听到一句提醒。',13,18],
    ['吊坠',40,40,'吊坠麦克风','你同意记录时，轻声说下“这次只试了录像”。这句话以后可以成为原件。',21,42],
    ['手环',54,38,'戒指与手环','用一个手势请求提示；哪些身体信号可以使用，由佩戴者选择。',71,41],
    ['手机',19,93,'手机','在路上拍下展台便笺，选择哪张照片可以进入自己的资料库。',34,93],
    ['电脑',84,72,'电脑与工作台','打开获准使用的文档，查看助手依据了哪一行，亲手修订交接说明。',91,57]
  ];
  window.renderBrainOrientation=()=>`<section class="brain-orientation" aria-label="超级个体总览">
    <header><p class="meta">共享通识 · 开场</p><h1 tabindex="-1">如果 AI 记得你亲手试过的事</h1>
    <p>在这门课里，超级个体是能带着自己的长期记忆、借助 AI 完成工作，并对结果作判断的人。</p><p>明天科学展换班。有人问：“断网了，小车还能演示吗？”你记得上周试过，却想不起当时播的是录像，还是开了真车。</p></header>
    <div class="orientation-pair"><section><h2>未来设想 · 提醒就在眼前</h2>
    <p>设想你正站在展台前。经你允许，随身 AI 知道你在看哪台设备，从个人记忆里找出上周的彩排记录。耳机里传来一句：“那天只试了录像。”你决定先放片，再请同伴测试小车。</p>
    <p>这幅“超级个体”的远景叫<strong>认知共生体</strong>：AI 随人经历情境，能在合适的时候带回过去的经验。人决定记什么、信哪条、和谁分享。</p></section>
    <section><h2>今天能做 · 在工作台找回原件</h2>
    <p>用 AIChat 连接你的第二大脑，存下彩排便笺。新开对话问“断网能演什么？”，让 AI 从索引翻到《校园科学展》，点开原件。你核对后，把“录像已测，真车待测”写进交接单。</p>
    <p>接班人能沿链接重看依据。以后换一个对话，仍能接着这份文件工作。下面的四节通识会逐步演给你看。</p></section></div>
    <div class="orientation-atlas"><div class="orientation-picture"><img src="assets/super-individual-future.webp" alt="未来随身助手设想：戴眼镜和耳机的学员，身边有手机、电脑与象征 AI 的光球。">
    <svg class="orientation-leaders" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${points.map(([,x,y,,,lx,ly])=>`<line x1="${x}" y1="${y}" x2="${lx}" y2="${ly}"/><circle cx="${x}" cy="${y}" r=".55"/>`).join('')}</svg>
    ${points.map(([label,,,,,x,y],i)=>`<button type="button" data-device="${i}" aria-pressed="${i===0}" aria-controls="orientation-note" style="left:${x}%;top:${y}%">${label}</button>`).join('')}</div>
    <div class="orientation-side"><h2>随身助手如何感知和回应？</h2><p>点图中的设备，看看它在未来场景里做什么。</p>
    <div id="orientation-note" aria-live="polite"><strong>${points[0][3]}</strong><p>${points[0][4]}</p></div>
    <p>更远的探索还包括增强现实投影、无声输入和神经接口。图示呈现研究设想；本课实操使用你主动提供的文档。</p>
    <small>图为课程重绘。参考 <a href="https://www.toutiao.com/article/7709292047487828480/" target="_blank" rel="noopener">36氪文章</a> 与 <a href="https://arxiv.org/abs/2611.05376" target="_blank" rel="noopener">费豪的认知共生体论文</a>。</small>
    <p><a href="#shared-first-case" class="button" data-first-case>进入第一节 · 共同记忆 ↓</a></p></div></div>
    <aside class="circle-invite"><div><h2>如果旁边的人也有一个分身呢？</h2><p>科学展上，一位老师在找人试车，一位志愿者恰好会修车。看看两人的分身怎样从一句招呼，走到一份共同的交接记录。</p></div><button type="button" data-chapter="4">看第四节 · 分身怎样组圈 →</button></aside></section>`;
  document.addEventListener('click',e=>{
    const button=e.target.closest('[data-device]');
    if(button){
      const section=button.closest('.orientation-atlas');
      for(const item of section.querySelectorAll('[data-device]'))item.setAttribute('aria-pressed',String(item===button));
      const [, , ,name,description]=points[Number(button.dataset.device)];
      section.querySelector('#orientation-note strong').textContent=name;
      section.querySelector('#orientation-note p').textContent=description;
    }
    if(e.target.closest('[data-first-case]')){
      e.preventDefault();document.querySelector('#shared-first-case')?.focus();document.querySelector('#shared-first-case')?.scrollIntoView();
    }
  });
})();
