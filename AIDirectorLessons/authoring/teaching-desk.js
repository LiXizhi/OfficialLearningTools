(() => {
    const desk = document.querySelector('[data-teaching-desk]');
    const get = s => desk.querySelector(s);
    const key = 'director-teaching/'+document.title;
    let saved = {};
    try {saved = JSON.parse(localStorage.getItem(key)) || {};} catch {}
    const votes = saved.votes || [0,0];
    let phase = Number.isInteger(saved.phase) ? saved.phase : 0;
    function save() {
        try {localStorage.setItem(key,JSON.stringify({...saved,phase,votes}));}
        catch {get('[data-teach-status]').textContent='本次课堂记录保留在当前窗口。';}
    }
    function show(i) {
        phase=i;
        desk.querySelectorAll('[data-teach-slide]').forEach(s=>s.hidden=Number(s.dataset.teachSlide)!==i);
        desk.querySelectorAll('[data-teach-phase]').forEach(b=>b.setAttribute('aria-current',Number(b.dataset.teachPhase)===i?'step':'false'));
        const demo=get('[data-demo-stage]');
        if(demo) demo.hidden=!(i===2 || i===3);
        get('[data-teach-next]').textContent=i===4?'回到课堂问题':'下一环节';
        get('[data-teach-tally]').textContent='方案一 '+votes[0]+' 票　方案二 '+votes[1]+' 票';
    }
    desk.querySelectorAll('[data-teach-phase]').forEach(b=>b.onclick=()=>{show(Number(b.dataset.teachPhase));save();});
    get('[data-teach-next]').onclick=()=>{show((phase+1)%5);save();};
    desk.querySelectorAll('[data-teach-vote]').forEach(b=>b.onclick=()=>{votes[Number(b.dataset.teachVote)]++;show(phase);save();});
    get('[data-clear-votes]').onclick=()=>{votes.fill(0);show(phase);save();};
    desk.querySelectorAll('[data-teach-note],[data-teach-prompt]').forEach((el,i)=>{
        if(saved[i]!=null) el.value=saved[i];
        el.oninput=()=>{saved[i]=el.value;save();};
    });
    desk.querySelectorAll('[data-teach-copy]').forEach(b=>b.onclick=()=>copyLessonChatText(b.parentElement.querySelector('textarea').value));
    const predictionVotes=saved.predictionVotes || (saved.predictionVotes=[0,0,0]);
    function showPredictions() {
        if(get('[data-predictions]')) get('[data-predictions]').textContent=predictionVotes.map((n,i)=>'第 '+(i+1)+' 项 '+n+' 票').join('　');
    }
    desk.querySelectorAll('[data-predict]').forEach(b=>b.onclick=()=>{
        predictionVotes[Number(b.dataset.predict)]++;showPredictions();save();
    });
    showPredictions();
    get('[data-project-demo]').onclick=()=>{
        const kit=document.querySelector('[data-teacher-kit]');
        kit.open=true;
        const target=kit.querySelector('[data-experiment]') || kit.querySelector('.studio-returns,.studio-kit');
        if(target.tagName==='DETAILS') target.open=true;target.scrollIntoView({block:'start'});
    };
    window.directorTeachingContext=()=>['当前授课环节：'+get('[data-teach-phase][aria-current=step]').textContent,
        get('[data-teach-slide]:not([hidden])').innerText,
        ...Array.from(desk.querySelectorAll('[data-teach-note]'),e=>e.value)].join('\n');
    show(phase);
})();
