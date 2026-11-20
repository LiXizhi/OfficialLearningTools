(() => {
  const slides=[...document.querySelectorAll('.slide')];
  const prev=document.querySelector('#prev'),next=document.querySelector('#next');
  const params=new URLSearchParams(location.search);
  const preview=parent!==window&&params.get('preview')==='1';
  document.documentElement.classList.toggle('sample-preview',preview);
  let page=0;
  function show(index){
    page=Math.max(0,Math.min(slides.length-1,index));
    slides.forEach((slide,i)=>slide.hidden=i!==page);
    prev.disabled=page===0;next.disabled=page===slides.length-1;
    document.querySelector('output').textContent=(page+1)+' / '+slides.length;
    if(!preview){
      try{history.replaceState(null,'','#p'+(page+1));}catch{/* The classroom wrapper can own navigation. */}
    }
    if(preview)parent.postMessage({channel:'aichat.external-tool.v1',type:'tool:sample-page',page:page+1},'*');
  }
  function openPage(){
    const numbered=/^#p(\d+)$/.exec(location.hash);
    const initial=Number(preview?params.get('page'):numbered?.[1]);
    show(Number.isInteger(initial)&&initial>0?initial-1:0);
    if(!preview)window.scrollTo(0,0);
  }
  prev.onclick=()=>show(page-1);next.onclick=()=>show(page+1);
  const copy=document.querySelector('[data-copy-request]');
  if(copy)copy.onclick=async()=>{
    const field=document.querySelector('.coach textarea');field.select();
    try{await navigator.clipboard.writeText(field.value);copy.textContent='已复制';}
    catch{copy.textContent='已选中，可手动复制';}
  };
  document.querySelector('nav').hidden=false;
  document.addEventListener('keydown',e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.target.matches('input,textarea,select'))return;
    if(['ArrowRight','PageDown','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(page+(['ArrowRight','PageDown'].includes(e.key)?1:-1));}
  });
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    const card=b.closest('.visual,fieldset');if(!card)return;
    const status=card.querySelector('.status');
    if(b.dataset.feedback){
      status.textContent=b.dataset.feedback;
      card.querySelectorAll('[data-feedback],[data-parts]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));
    }
    if(b.dataset.parts){
      const n=Number(b.dataset.parts);
      card.querySelectorAll('[data-feedback],[data-parts]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));
      card.querySelectorAll('.bar').forEach((bar,i)=>{
        const pieces=n||[2,3][i],colored=n?[3,2][i]:1;
        bar.innerHTML=Array.from({length:pieces},(_,j)=>'<i class="'+(j<colored?'on':'')+'"></i>').join('');
      });
      const tagA=card.querySelector('[data-tag="a"]'),tagB=card.querySelector('[data-tag="b"]'),tagSum=card.querySelector('[data-tag="sum"]'),sumBar=card.querySelector('[data-sum]');
      if(tagA)tagA.textContent=n?'3 个 1/6 ＝ 3/6':'1 个 1/2';
      if(tagB)tagB.textContent=n?'2 个 1/6 ＝ 2/6':'1 个 1/3';
      if(tagSum)tagSum.textContent=n?'5 个 1/6 ＝ 5/6':'待合并';
      if(sumBar)sumBar.innerHTML=n?'<i class="a"></i><i class="a"></i><i class="a"></i><i class="b"></i><i class="b"></i><i></i>':'<span class="sum-wait">先统一成同样大的小格，再合并涂色部分</span>';
      status.textContent=n?'涂色长度没变，每小格都变成了整张纸的 1/6！3 个 1/6 加 2 个 1/6，一共 5 个 1/6（5/6）。':'上条每格是 1/2，下条每格是 1/3，两格大小不同，不能直接合起来数。';
    }
    if(b.dataset.mark){card.querySelectorAll('[data-evidence]').forEach(el=>el.classList.toggle('marked',el.dataset.evidence===b.dataset.mark));}
    if(b.dataset.move){
      const cells=[...card.querySelectorAll('.map span')];
      const pos=cells.findIndex(el=>el.classList.contains('here'));
      let dest=pos;
      if(b.dataset.move==='reset')dest=6;
      if(b.dataset.move==='north'&&pos>=3)dest=pos-3;
      if(b.dataset.move==='east'&&pos%3<2)dest=pos+1;
      if(b.dataset.move==='west'&&pos%3>0)dest=pos-1;
      if(b.dataset.move==='south'&&pos<6)dest=pos+3;
      cells.forEach((el,i)=>{
        const active=i===dest;
        el.classList.toggle('here',active);
        if(active)el.setAttribute('aria-current','location');else el.removeAttribute('aria-current');
      });
      status.textContent=dest===4?'At the museum. Tell your partner which landmark you used.':dest===pos&&b.dataset.move!=='reset'?'Edge of the map. Ask for clarification.':'You are at '+cells[dest].textContent+'.';
    }
  });
  window.addEventListener('message',e=>{
    if(preview&&e.data?.channel==='aichat.external-tool.v1'&&e.data.type==='host:sample-goto'){
      const target=Number(e.data.page);
      if(Number.isInteger(target)&&target>=1&&target<=slides.length)show(target-1);
    }
  });
  window.addEventListener('hashchange',openPage);
  openPage();
  if(preview){
    // Only intrinsic content is measured; the receiving iframe may have an opaque sandbox origin.
    function reportHeight(){
      parent.postMessage({channel:'aichat.external-tool.v1',type:'tool:sample-height',
        height:Math.ceil(document.body.getBoundingClientRect().height)},'*');
    }
    reportHeight();
    const observer=new ResizeObserver(reportHeight);
    observer.observe(document.body);
  }
})();
