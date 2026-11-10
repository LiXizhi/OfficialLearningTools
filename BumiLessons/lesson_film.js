(() => {
    const film = document.querySelector('#lesson-film');
    const pages = [...film.querySelectorAll('.film-page')];
    const picker = film.querySelector('select');
    const prev = film.querySelector('[data-prev]');
    const next = film.querySelector('[data-next]');
    const theater = film.querySelector('[data-theater]');
    const key = 'bumi-film.v1.' + location.pathname;
    const fields = [...film.querySelectorAll('.film-content input')];
    let draft;
    try { draft = JSON.parse(localStorage.getItem(key)); } catch {}
    draft ||= history.state?.bumiFilm || {};
    let current = 0, clock;
    const screen = film.querySelector('.film-body');
    const zoom = document.createElement('select');
    zoom.className = 'film-zoom';
    zoom.setAttribute('aria-label', '授课内容缩放');
    zoom.add(new Option('自适应', 'auto'));
    for (const percent of [65, 75, 85, 100, 115, 125, 150]) {
        zoom.add(new Option(percent + '%', String(percent)));
    }
    theater.before(zoom);
    let fitFrame;
    function fitPage() {
        if (!film.classList.contains('expanded')) return;
        const page = pages[current];
        if (zoom.value !== 'auto') {
            page.style.zoom = Number(zoom.value) / 100;
            return;
        }
        // Measure the rendered page at each size so wrapped lines and tables count.
        function fits(percent) {
            page.style.zoom = percent / 100;
            return screen.scrollHeight <= screen.clientHeight && screen.scrollWidth <= screen.clientWidth;
        }
        let best = 100;
        if (!fits(best)) {
            let low = 65, high = 99;
            best = low;
            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                if (fits(mid)) {
                    best = mid;
                    low = mid + 1;
                } else {
                    high = mid - 1;
                }
            }
            page.style.zoom = best / 100;
        }
        zoom.options[0].textContent = '自适应 ' + best + '%';
    }
    function scheduleFit() {
        cancelAnimationFrame(fitFrame);
        fitFrame = requestAnimationFrame(fitPage);
    }
    zoom.onchange = scheduleFit;
    new ResizeObserver(scheduleFit).observe(screen);
    screen.addEventListener('load', scheduleFit, true);
    document.fonts.ready.then(scheduleFit);
    function save() {
        draft.page = current;
        try { localStorage.setItem(key, JSON.stringify(draft)); }
        catch { try { history.replaceState({...history.state, bumiFilm:draft},''); } catch {} }
    }
    fields.forEach((field,i)=>{
        const value=draft.answers?.[i];
        if (field.type==='checkbox') field.checked=value===true;
        else if(typeof value==='string') field.value=value;
        field.addEventListener('input',()=>{
            (draft.answers ||= {})[i] = field.type==='checkbox'?field.checked:field.value;
            save();
        });
    });
    function show(index, focus=false){
        if(index<0||index>=pages.length)return;
        clearInterval(clock);
        film.querySelectorAll('[data-playing]').forEach(b=>{delete b.dataset.playing;b.textContent='连续演示';});
        current=index;
        pages.forEach((page,i)=>{
            page.hidden=i!==index;
            page.style.removeProperty('zoom');
        });
        screen.scrollTo(0, 0);
        scheduleFit();
        picker.value=String(index);
        film.querySelector('.film-count').textContent=(index+1)+' / '+pages.length;
        film.style.setProperty('--progress',(index+1)/pages.length*100+'%');
        prev.disabled=index===0;
        next.textContent=index===pages.length-1?'去互动实验 →':'下一幕 →';
        save();
        if(focus){pages[index].tabIndex=-1;pages[index].focus({preventScroll:true});film.scrollIntoView({block:'start'});}
    }
    function expand(on){
        film.classList.toggle('expanded',on);
        document.body.classList.toggle('projecting',on);
        theater.textContent=on?'退出大屏':'放大授课';
        theater.setAttribute('aria-pressed',String(on));
        if (on) scheduleFit();
        else pages[current].style.removeProperty('zoom');
        if(!on) theater.focus();
    }
    function experiment(){
        if(film.classList.contains('expanded'))expand(false);
        document.querySelector('#classroom').scrollIntoView({block:'start'});
    }
    film.querySelector('a[href="#classroom"]').onclick=event=>{event.preventDefault();experiment();};
    theater.onclick=()=>expand(!film.classList.contains('expanded'));
    picker.onchange=()=>show(Number(picker.value),true);
    prev.onclick=()=>show(current-1,true);
    next.onclick=()=>current===pages.length-1?experiment():show(current+1,true);
    document.addEventListener('keydown',event=>{
        if(event.key==='Escape'&&film.classList.contains('expanded')){expand(false);return;}
        if(!film.contains(event.target)||event.target.matches('input,textarea,select')||event.altKey||event.ctrlKey||event.metaKey)return;
        if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();show(current+(event.key==='ArrowRight'?1:-1),true);}
    });
    for(const diagram of film.querySelectorAll('.film-diagram')){
        const name=diagram.dataset.diagram;
        const shots=bumiFigureShots[name];
        if(!shots)continue;
        const viewport=diagram.querySelector('.film-viewport');
        const img=viewport.querySelector('img'),pointer=viewport.querySelector('i');
        const controls=diagram.querySelector('.film-shots'),caption=diagram.querySelector('.film-narration');
        const original=caption.textContent;
        let position=-1;
        function control(label,action){
            const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=action;
            controls.append(b);return b;
        }
        function stop(){
            clearInterval(clock);play.textContent='连续演示';delete play.dataset.playing;
        }
        function frame(i){
            position=i;
            if(cursor)cursor.hidden=true;
            const [x,sourceY,,line]=shots[i] || [50,50,'',original];
            // Illustrated plates add 16% to the original height above the diagram.
            const photo=['simulation-web-reference','body-front','web-observation-team'].includes(name);
            const y=photo ? sourceY : (sourceY+16)/1.16;
            pointer.hidden=i<0;
            // Scale and translate both the original illustration and its point of interest together.
            const scale=i<0?1:1.5;
            const dx=Math.max(100*(1-scale),Math.min(0,50-x*scale));
            const dy=Math.max(100*(1-scale),Math.min(0,50-y*scale));
            img.style.transform='translate('+dx+'%,'+dy+'%) scale('+scale+')';
            pointer.style.left=(x*scale+dx)+'%';pointer.style.top=(y*scale+dy)+'%';
            caption.textContent=line;
            scheduleFit();
            buttons.forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
        }
        // The dots in the original plate are the same eleven samples as the worksheet table.
        // Read the table so future source revisions change the playback values with it.
        let scrub, cursor;
        if(name==='visual-joint-angle-lines'){
            const table=[...film.querySelectorAll('table')].find(t=>t.rows[0]?.textContent.includes('右肩前后摆'));
            const samples=table ? [...table.rows].slice(1).map(row=>[...row.cells].map(c=>Number(c.textContent.trim()))) : [];
            if(samples.length===11 && samples.every(row=>row.length===3 && row.every(Number.isFinite))){
                const label=document.createElement('label');
                label.className='film-scrub';label.textContent='逐帧读数';
                scrub=document.createElement('input');scrub.type='range';scrub.min=0;scrub.max=samples.length-1;scrub.value=0;
                const value=document.createElement('output');
                cursor=document.createElement('span');cursor.className='film-cursor';cursor.style.top=((22+16)/1.16)+'%';cursor.style.height=(49/1.16)+'%';cursor.hidden=true;viewport.append(cursor);
                function seek(){
                    stop();frame(-1);const i=Number(scrub.value),[time,shoulder,knee]=samples[i];
                    cursor.hidden=false;cursor.style.left=((160+108*i)/1440*100)+'%';
                    value.textContent=time.toFixed(1)+' 秒　右肩 '+shoulder+'°　左膝 '+knee+'°';
                }
                scrub.oninput=seek;
                value.textContent='拖动时间尺，沿两条线核对原始读数。';
                label.append(scrub,value);diagram.append(label);
            }
        }
        if(name==='visual-speed-ten-seconds'){
            const scrubbing=document.createElement('label');
            scrubbing.className='film-scrub';scrubbing.textContent='预测：现实经过多少秒？';
            const elapsed=document.createElement('input');elapsed.type='range';
            elapsed.min=0;elapsed.max=10;elapsed.step=.5;elapsed.value=0;
            const tracks=document.createElement('div');tracks.className='film-rulers';
            const rulers=[0.5,1,2].map(rate=>{
                const row=document.createElement('div');
                const tag=document.createElement('b');tag.textContent=rate+'×';
                const bar=document.createElement('progress');bar.max=20;
                const result=document.createElement('output');
                row.append(tag,bar,result);tracks.append(row);
                return {rate,bar,result};
            });
            const time=document.createElement('output');
            function measure(){
                const seconds=Number(elapsed.value);
                time.textContent=seconds+' 秒';
                for(const {rate,bar,result} of rulers){
                    bar.value=seconds*rate;
                    result.textContent=bar.value+' 片段秒';
                }
            }
            elapsed.oninput=measure;measure();
            scrubbing.append(elapsed,time);diagram.append(scrubbing,tracks);
        }
        const buttons=shots.map((shot,i)=>control(shot[2],()=>{stop();frame(i);}));
        const play=control('连续演示',()=>{
            if(play.dataset.playing){stop();return;}
            frame(position<0||position===shots.length-1?0:position+1);
            play.textContent='暂停演示';play.dataset.playing='true';
            clock=setInterval(()=>{if(position===shots.length-1)stop();else frame(position+1);},3600);
        });
        control('看全图',()=>{stop();frame(-1);});
    }
    const target=location.hash.slice(1);
    const deepLink=pages.findIndex(page=>page.querySelector('.film-diagram')?.dataset.diagram===target);
    show(deepLink>=0?deepLink:Number.isInteger(draft.page)&&draft.page>=0&&draft.page<pages.length?draft.page:0);
})();
