function startBumiClassroom(lab, mission, portable = false) {
    const n = Number(lab.dataset.lesson);
    const teacher = lab.dataset.role === 'teacher';
    const $ = id => document.getElementById(id);
    const stage = $('lesson-stage');
    const key = 'bumi-classroom.v1.' + location.pathname;
    let state = {step:0, prediction:null, votes:[0,0], notes:[]};
    try { Object.assign(state, JSON.parse(localStorage.getItem(key)) || history.state?.classroom); }
    catch { Object.assign(state, history.state?.classroom); }
    if (portable) state = {step:1, prediction:0, votes:[0,0], notes:[]};
    let timer;
    function save() {
        if (portable) return;
        try { localStorage.setItem(key, JSON.stringify(state)); }
        catch { try { history.replaceState({...history.state, classroom:state}, ''); } catch {} }
    }
    function element(tag, text, cls) {
        const el = document.createElement(tag);
        el.textContent = text;
        if (cls) el.className = cls;
        return el;
    }
    function button(label, fn, parent = stage) {
        const b = element('button', label);
        b.type = 'button'; b.onclick = fn; parent.append(b);
        return b;
    }
    function picture(name, alt) {
        const img = document.createElement('img');
        if(portable) img.src=lab.dataset.robot;
        else bumiCourseImage(img,'bumi-course/'+name);
        img.alt = alt;
        return img;
    }
    function note(text) {
        state.notes.push(text);
        save(); showRecord();
        $('to-studio').disabled = !ready();
        const lastPhase = document.querySelector('[data-phase="2"]');
        if(lastPhase) lastPhase.disabled = !ready();
    }
    function showRecord() {
        $('trial-record').replaceChildren(...state.notes.map(text => element('li',text)));
    }
    function move(step) {
        state.step = step; save(); render();
        $('lesson-heading').focus({preventScroll:true});
        lab.scrollIntoView({block:'start'});
    }
    function opening() {
        const panel = element('div','','briefing');
        const copy = element('div','');
        copy.append(element('p',mission.task));
        if (teacher) copy.append(element('p','请同学举手。每点一次为该预测记一票，然后请一位同学上台验证。'));
        else copy.append(element('p','选出你的预测，再亲手验证。'));
        mission.choices.forEach((choice,i) => {
            const b = button(choice + (teacher ? ' · ' + state.votes[i] + ' 票' : ''), () => {
                state.prediction = i;
                if (teacher) state.votes[i]++;
                save(); render();
            },copy);
            b.setAttribute('aria-pressed',String(i === state.prediction));
        });
        const start = button(teacher ? '开始全班演示 →' : '动手验证 →',()=>move(1),copy);
        start.className = 'next'; start.disabled = state.prediction === null;
        const scene = picture('lesson-'+String(n).padStart(2,'0')+'/'+mission.scene+'.webp',mission.lab+'教学图');
        if (n === 4) {
            bumiCourseImage(scene,'bumi-meadow.webp');
            scene.alt = '小布米走过绿地的课程插画';
            scene.className = 'stop-cover';
        }
        panel.append(copy,scene); stage.append(panel);
    }
    function sequence() {
        let picked = [];
        const tray = element('div','','tray');
        const output = element('p','从空白流程开始。','live');
        stage.append(element('p','依次点击部件，组装一条可以交给同伴的流程。'),tray,output);
        const parts = [...mission.order.slice(2),...mission.order.slice(0,2)];
        function reset() { picked = []; tray.querySelectorAll('button').forEach(b=>b.disabled=false); output.textContent='重新排列。'; }
        parts.forEach(part=>{
            const b = button(part,()=>{
                picked.push(part); b.disabled=true;
                output.textContent=picked.join(' → ');
                if(picked.length!==parts.length) return;
                if(picked.every((v,i)=>v===mission.order[i])) note(output.textContent);
                else output.textContent+='。再试一次：'+mission.hint;
            },tray);
        });
        button('清空并重排',reset);
    }
    function sorting() {
        let i = 0;
        const card = element('h3',mission.cases[i][0],'case-card');
        const tray = element('div','','tray');
        const result = element('p','','live');
        stage.append(card,tray,result);
        mission.bins.forEach((bin,index)=>button(bin,()=>{
            const [prompt,answer,why]=mission.cases[i];
            if(index!==answer){result.textContent='再核对这条线索：'+why; return;}
            result.textContent=bin+'。'+why;
            i++;
            if(i===mission.cases.length){
                note(mission.cases.map(([item,category])=>item+' → '+mission.bins[category]).join('；'));
                card.textContent='全部归档'; tray.replaceChildren();
            } else card.textContent=mission.cases[i][0];
        },tray));
    }
    function body() {
        const model = element('div','','body-map');
        model.append(picture('shared/bumi-reference-beautified.webp','小布米正面关节定位图'));
        const cue = element('p','先点连接大腿和小腿的地方。','live');
        stage.append(cue,model);
        let foundKnee=false;
        for(const [label,x,y] of [['肩',64,28],['肘',69,40],['膝',61,66]]){
            const b=button(label,()=>{
                if(!foundKnee && label==='膝'){foundKnee=true;cue.textContent='找到了膝！再点连接上臂和前臂的地方。';}
                else if(foundKnee && label==='肘'){cue.textContent='两处都找到了。轮到同伴指给你看。';note('在正面图上定位了膝和肘，对应大腿与小腿、上臂与前臂的连接。');}
                else cue.textContent=foundKnee?'沿着手臂找到中间的连接。':'沿着腿找中间的连接。';
            },model); b.style.left=x+'%'; b.style.top=y+'%';
        }
    }
    function zoom() {
        const view = element('div','','zoom-view');
        const img = picture('shared/bumi-reference-beautified.webp','固定姿态的 Bumi 原型图');
        view.append(img);stage.append(element('p','同一张身体图，先拉近观察膝部，再恢复全身。'),view);
        let close=false;
        button('拉近镜头',()=>{img.style.transform='scale(2.3)';close=true;});
        button('恢复全身',()=>{img.style.transform='none';if(close){note('镜头从全身拉近到膝部再还原；关节的连接和姿态保持一致。');close=false;}});
    }
    function drive() {
        const canvas=document.createElement('canvas');
        canvas.width=640; canvas.height=230; canvas.style.width='100%';
        canvas.setAttribute('aria-label','指令轨迹示意图');
        const ctx=canvas.getContext('2d');
        const info=element('p','','live');
        stage.append(element('p','先按前进，再按左转。再做一次，这次先归零再左转。观察前进速度是否保留。'),canvas,info);
        let speed=0,turn=0,angle=0,x=230,y=145,path=[];
        function draw(){
            ctx.fillStyle='#e7f1db';ctx.fillRect(0,0,640,230);
            ctx.strokeStyle='#ccdaba';ctx.lineWidth=1;
            for(let i=0;i<640;i+=32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,230);ctx.stroke();}
            for(let i=0;i<230;i+=32){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(640,i);ctx.stroke();}
            ctx.beginPath();path.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));
            ctx.strokeStyle='#25886a';ctx.lineWidth=4;ctx.stroke();
            ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='#184c49';ctx.beginPath();
            ctx.moveTo(15,0);ctx.lineTo(-9,-9);ctx.lineTo(-5,0);ctx.lineTo(-9,9);ctx.closePath();ctx.fill();ctx.restore();
            info.textContent='前进速度 '+speed.toFixed(1)+'　·　转向 '+turn.toFixed(1);
        }
        function preview(label){
            clearInterval(timer);
            if(label==='前进')speed=0.5;
            if(label==='归零站立'){speed=0;turn=0;}
            if(label==='左转')turn=0.5;
            let ticks=0;
            timer=setInterval(()=>{
                angle-=turn*.085;x+=Math.cos(angle)*speed*2.2;y+=Math.sin(angle)*speed*2.2;
                path.push([x,y]);draw();
                if(++ticks>=32){clearInterval(timer);if(label==='左转')note('左转指令保留前进速度 '+speed.toFixed(1)+'：'+(speed?'沿弧线前进。':'在当前位置转向。'));}
            },24);
        }
        for(const name of ['前进','归零站立','左转'])button(name,()=>preview(name));
        button('回到起点',()=>{clearInterval(timer);x=230;y=145;angle=0;speed=0;turn=0;path=[];draw();});draw();
    }
    function stopping() {
        const round = state.notes.length;
        const blind = round%2===0;
        stage.append(element('p', blind?'第一种停法：黄旗距起点约三秒路程。出发后小布米会被挡住，请在心里数三秒，然后按“喊停”。':'第二种停法：路线和速度相同。这次看着小布米走到黄旗再喊停。'));
        const track=element('div','','stop-track');
        const flag=element('span','⚑ 黄旗','flag');
        const walker=picture('shared/bumi-reference-beautified.webp','小布米位置');
        walker.className='walker';
        const screen=element('span','观察窗已盖住 · 心里数三秒','blindfold');
        track.append(flag,walker);stage.append(track);
        const actions=element('div','','tray'), feedback=element('p','','live');
        stage.append(actions,feedback);
        let t0=0;
        const go=button('出发',()=>{
            go.disabled=true;stop.disabled=false;
            t0=performance.now();
            if(blind)track.append(screen);
            timer=setInterval(()=>{
                const t=(performance.now()-t0)/1000;
                walker.style.left=Math.min(t*20,98)+'%';
                if(t>=5)finish(false);
            },25);
        },actions);
        function finish(manual){
            clearInterval(timer);screen.remove();stop.disabled=true;
            const distance=Math.min((performance.now()-t0)/1000,5);
            walker.style.left=Math.min(distance*20,98)+'%';
            const error=distance-3;
            const where=Math.abs(error)<.1?'停在黄旗旁':error<0?'停在黄旗前':'越过黄旗';
            const record=(blind?'遮住画面':'看着黄旗')+'：'+(manual?'人喊停':'到达路段终点')+'，用时 '+distance.toFixed(2)+' 秒，'+where+'，相差 '+Math.abs(error).toFixed(2)+' 秒。';
            feedback.textContent=record;
            note(record);
            (state.stops ||= []).push({distance, manual});
            save();
            if (!blind && state.stops.length >= 2) {
                const first=state.stops.at(-2);
                const difference=Math.abs(first.distance-3)-Math.abs(error);
                const comparison=Math.abs(difference)<0.01?'两轮和黄旗的距离几乎相同。':
                    (difference>0?'看着黄旗的一轮':'遮住画面的一轮')+'更接近目标，相差时间少了 '+Math.abs(difference).toFixed(2)+' 秒。';
                feedback.append(element('p',comparison+' 换一位操作员，结果还一样吗？'));
            }
            $('to-studio').disabled=state.notes.length<2;
            button(blind?'换一种停法 →':'再测一组',()=>render(),actions);
        }
        const stop=button('喊停',()=>finish(true),actions);stop.disabled=true;
    }
    function animation(kind) {
        const poses=['放下手','举起手','向外挥'];
        const angles=[25,145,115];
        let frames=[], rate=1;
        const display=element('div','','pose-stage');
        const figure=element('div','','pose-figure');
        for(const part of ['head','torso','arm','forearm','legs'])figure.append(element('span','','pose-'+part));
        const caption=element('span','等待播放');
        display.append(figure,caption);
        const strip=element('p','','live'),controls=element('div','','tray');
        stage.append(element('p',kind==='pose'?'点选四张姿态卡排成一段动作，再播放或倒放。':'同一条动作有四拍，分别播放原速和两倍速，比较用时。'),display,strip,controls);
        if(kind==='pose'){
            poses.forEach((p,i)=>button(p,()=>{if(frames.length<4)frames.push(i);strip.textContent=frames.map(j=>poses[j]).join(' → ');},controls));
            button('清空时间线',()=>{frames=[];strip.textContent='';},controls);
        }else{
            frames=[0,1,2,0];
            [0.5,1,2].forEach(v=>button(v+' 倍速',()=>{rate=v;strip.textContent='播放速度：'+rate+' 倍';},controls));
        }
        function play(reverse){
            if(frames.length<4){caption.textContent='先选四张姿态卡。';return;}
            const ordered=reverse?[...frames].reverse():[...frames],duration=600/rate;
            const buttons=[...stage.querySelectorAll('button')];buttons.forEach(b=>b.disabled=true);
            let i=0;
            const frame=()=>{
                figure.style.setProperty('--angle',angles[ordered[i]]+'deg');
                caption.textContent='第 '+(i+1)+' 拍 · '+poses[ordered[i]];
            };
            frame();
            timer=setInterval(()=>{i++;if(i<ordered.length){frame();return;}
                clearInterval(timer);buttons.forEach(b=>b.disabled=false);
                note((reverse?'倒放':'正放')+'：'+ordered.map(j=>poses[j]).join(' → ')+'，'+rate+' 倍速，设定用时 '+(ordered.length*duration/1000).toFixed(1)+' 秒。');
            },duration);
        }
        button('播放',()=>play(false));if(kind==='pose')button('倒放',()=>play(true));
    }
    function handoff() {
        let current='回放中';
        const screen=element('h3',current+' · 正在跳舞','case-card');
        stage.append(element('p','让正在回放舞蹈的展台回到站立，再交给下一位同学。'),screen);
        for(const label of ['暂停回放','继续回放','停止回放并归位']){
            button(label,()=>{
                if(label==='暂停回放'&&current==='回放中')current='暂停在当前帧';
                else if(label==='继续回放'&&current==='暂停在当前帧')current='回放中';
                else if(label==='停止回放并归位'){current='初始站姿 · 仿真已暂停';note('停止回放并归位，速度清零，仿真保持暂停。');}
                else {screen.textContent=current+' · 先检查谁在控制动作';return;}
                screen.textContent=current;
            });
        }
    }
    function fair() {
        const readout=element('div','','timing-panel');
        const segment=element('strong','片段 5.0 秒'),watch=element('span','秒表 0.0 秒');
        const progress=document.createElement('progress');progress.max=20;progress.value=0;
        readout.append(segment,watch,progress);
        stage.append(element('p','保持同一片段与起点 A = 5 秒。选倍率，同时启动片段和秒表，约十秒时按暂停。每种倍率可测三次。'),readout);
        let rate=1,t0=0;
        const choices=[0.5,1,2].map(v=>button(v+'×',()=>{
            rate=v;choices.forEach((b,i)=>b.setAttribute('aria-pressed',String([0.5,1,2][i]===rate)));
        }));
        choices[1].setAttribute('aria-pressed','true');
        function read(){
            const t=(performance.now()-t0)/1000, b=5+t*rate;
            segment.textContent='片段 '+b.toFixed(1)+' 秒';watch.textContent='秒表 '+t.toFixed(1)+' 秒';
            progress.value=Math.min(20,b-5);return {t,b};
        }
        const start=button('同时开始',()=>{
            controls(true);t0=performance.now();read();timer=setInterval(read,45);
        });
        const stop=button('暂停并记录',()=>{
            clearInterval(timer);const {t,b}=read();controls(false);
            note(rate+'× · 课内计时模型：A = 5.0 秒，B = '+b.toFixed(1)+' 秒，实际 T = '+t.toFixed(2)+' 秒。B − A ≈ '+(b-5).toFixed(1)+' 秒；T × 倍率 ≈ '+(t*rate).toFixed(1)+' 秒。');
        });
        function controls(running){choices.forEach(b=>b.disabled=running);start.disabled=running;stop.disabled=!running;}
        controls(false);
    }
    const activities={body,zoom,drive,stop:stopping,pose:()=>animation('pose'),speed:()=>animation('speed'),state:handoff,fair};
    function aiDiscussion() {
        const panel = element('details','','lab-discussion');
        panel.append(element('summary',teacher?'与 AI 教师一起引导讨论':'向 AI 追问这个实验'));
        const label = element('label','可编辑的课堂问题');
        const draft = document.createElement('textarea');
        const drafts = state.discussion ||= {};
        const observations = () => state.notes.length ? '本组的课内模型记录：'+state.notes.slice(-2).join('；') : '还没有实验记录。';
        const compose = () => [mission.ask, state.prediction === null ? '' : '我们的预测：'+mission.choices[state.prediction],
            observations(),teacher?'请给全班一个需要动手验证的追问，先让同学提出依据。':'请帮我挑出一个值得重测的条件，让我自己动手得出结论。'].filter(Boolean).join('\n');
        draft.value = drafts[state.step] ?? compose();
        draft.oninput = () => {drafts[state.step]=draft.value; save();};
        label.append(draft); panel.append(label);
        const message = element('output','');
        button('带入最新记录',()=>{draft.value=compose();draft.oninput();},panel);
        button('复制问题',async()=>{
            try { await navigator.clipboard.writeText(draft.value); message.textContent='已复制。在会话中粘贴即可。'; }
            catch { draft.focus();draft.select();message.textContent='请复制选中的文字。'; }
        },panel);
        button(teacher?'打开讲课会话 ↗':'打开我的 AI 会话 ↗',()=>$(teacher?'lecture':'chat').click(),panel);
        panel.append(message); stage.append(panel);
    }
    function render() {
        clearInterval(timer);
        stage.replaceChildren();
        $('trial-panel').hidden=state.step!==1;
        if (!portable) {
            $('studio').hidden=state.step<2;
            $('make-panel').hidden=state.step!==2;
            $('peer-panel').hidden=state.step!==3;
        }
        $('lesson-heading').textContent=[mission.ask,mission.lab,'把这次发现做成一道展题',teacher?'请一位同学上台试玩':'交给下一组同学试玩'][state.step];
        $('lesson-guide').textContent=state.step===0?(teacher?'全班预测':'我的预测'):state.step===1?'课内互动模型 · 数据仅代表本次练习':'用自己的记录做一件展品';
        document.querySelectorAll('[data-phase]').forEach(b=>{
            const step=Number(b.dataset.phase);
            b.setAttribute('aria-current',step===state.step?'step':'false');
            b.disabled=step===1&&state.prediction===null || step===2&&!ready() || step===3&&!$('preview1').childElementCount;
        });
        if(state.step===0)opening();
        if(state.step===1){
            (activities[mission.kind] || (mission.order?sequence:sorting))();
            showRecord();
            $('to-studio').disabled=!ready();
        }
        if (!portable && state.step < 2) aiDiscussion();
    }
    function ready(){return state.notes.length >= (mission.kind==='stop'?2:1);}
    document.addEventListener('bumi-first-version',()=>move(3));
    function enterStudio(){
        if(!$('evidence').value)$('evidence').value='课内练习记录：\n'+state.notes.join('\n');
        if(!$('action').value)$('action').value=mission.task;
        $('evidence').dispatchEvent(new Event('input',{bubbles:true}));
        move(2);
    }
    document.querySelectorAll('[data-phase]').forEach(b=>b.onclick=()=>Number(b.dataset.phase)===2?enterStudio():move(Number(b.dataset.phase)));
    $('to-studio').onclick=portable ? () => {
        (document.querySelector('.exhibit') || document.querySelector('h1')).scrollIntoView();
    } : enterStudio;
    render();
}

const bumiRoom = document.querySelector('#classroom');
startBumiClassroom(bumiRoom, bumiMissions[Number(bumiRoom.dataset.lesson)-1]);
