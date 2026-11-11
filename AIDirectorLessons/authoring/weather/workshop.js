(() => {
    'use strict';
    const book = document.querySelector('.fieldbook');
    const teacher = book.dataset.role === 'teacher';
    const $ = id => document.getElementById(id);
    const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[char]);
    const phases = ['提问', '做计划', '生图', '做第一版', '试玩改版'];
    const modes = ['Ask', 'Plan', 'Image', 'Implement', 'Iterate'];
    const times = ['0–5', '5–10', '10–17', '17–27', '27–40'];
    const titles = ['先问一个会影响作品的问题', '把玩法说清楚，再动手', '给挑战卡画一张封面', '让第一版真的跑起来', '带着一次试玩回来改稿'];
    const sources = ['本周五科学社展出校园气象站记录仪。','展台有三份手绘气温图，参观者可以体验读数。'];
    const tracks = {
        temperature: { name:'读温度', title:'温度侦探', data:'练习温度计从 10 到 30 °C，每小格 1 °C，液柱顶端在 24 °C。', question:'液柱顶端是几摄氏度？', choices:['22 °C','24 °C','26 °C'], answer:1, hint:'从 20 °C 向上数，液柱顶端比 20 高出几小格？', subject:'一支红色液柱温度计' },
        graph: { name:'找变化', title:'气温侦探', data:'练习数据：周一 18 °C、周二 22 °C、周三 20 °C。', question:'哪一天的气温最高？', choices:['周一','周二','周三'], answer:1, hint:'沿着折线找最高的点，再看正下方是哪一天。', subject:'气象观察员和手绘折线图' }
    };
    const key = 'ai-director.g5-04.v1.' + book.dataset.role;
    let saved;
    try { saved = JSON.parse(localStorage.getItem(key)); } catch {}
    if (!saved) saved = history.state?.[key];
    const emptyProject = () => ({ notes:{}, edits:{}, used:{}, done:{}, title:'', style:'科学手账水彩', side:'右侧', hint:'', feedback:'' });
    const state = { track:'temperature', step:0, projects:{}, votes:[0,0], run:Math.random().toString(36).slice(2,10), ...saved };
    if (!Object.hasOwn(tracks,state.track)) state.track = 'temperature';
    if (!Number.isInteger(state.step) || state.step < 0 || state.step > 4) state.step = 0;
    const project = () => state.projects[state.track] ||= emptyProject();
    const track = () => tracks[state.track];
    const title = () => project().title.trim() || track().title;
    const cover = () => project().cover || $('station').src;
    const message = value => { $('status').textContent = value; };
    function save() {
        try { localStorage.setItem(key, JSON.stringify(state)); return; } catch {}
        try { history.replaceState({...history.state, [key]:state}, ''); }
        catch { message('浏览器限制保存。离开前请复制制作记录。'); }
    }
    const lectureGuide = [
        '对全班说：“路过展台的三年级同学只有一分钟，他愿意试什么？”请大家举手，记录票数，选择一个方向。再当众改一句委托。',
        '把 AI 的方案读给大家。问：“今天只做一道题，哪一步可以删掉？”在下方写下全班选定的玩法和一个验收条件。',
        '投屏念出生图描述，请一位同学决定主角和留白位置。把第一张图放进封面看一眼，再决定采用还是重新描述。',
        '让大家看清空工作区、选中的封面和生成的文件。点开 index.html，请一位同学站到电脑前，自己完成第一次试玩。',
        '请试玩者说：“我点了……我看到……我希望……” 带着他的原话回主对话。只改一处，再请他用同一动作试一次。'
    ];
    const studentGuide = [
        '先选一个你想给三年级同学做的挑战。读材料，挑一件你还没弄懂的事问 AI。看到回复后，再追问一句。',
        '请 AI 给两个简单玩法。选一个，删去眼下用不到的部分。写下玩家打开后看见什么、点什么、怎样检查。',
        '挑画风和留白位置，用 Craft 请 AI 生图。看主角够不够醒目、标题会不会挡住它。可以再说一句让 AI 重画。',
        '把计划、选中的图片和资料交给 AI。打开工作区中的 index.html，从头玩一次，再故意选错一次，看看会发生什么。',
        '记下一个具体发现。先让 AI 给两个改法，选一个，再让它动手。打开新版重复刚才的动作，比较前后变化。'
    ];
    const notes = ['我还想追问的一句话','我选的玩法和验收条件','我选哪张图，为什么','第一版试玩时，我看到了什么','第二版重测的结果'];
    const placeholders = ['例如：为什么从 20 开始数？换一张图我还会读吗？','例如：一题三选一；同学不用听我解释就能选答案。','例如：我选主角靠左的图，右边放标题还能看清温度计。','例如：我故意选错，页面只说“再试试”。','例如：这次选错后有读图提示，我能独立再答一次。'];
    const modeGuides = ['在 Ask 中对话。把不懂的地方换成你自己的话。','在输入框旁选择 Plan，看过方案后自己做决定。','从 Plan 切到 Craft，让 AI 调用生图工具。','使用 Craft 执行计划，确认文件写入本课工作空间。','在同一个主对话追问，再用 Craft 修改。'];
    function basePrompt(step = state.step) {
        const p = project(), t = track();
        const goal = '我想为第一次来校园气象站的三年级同学做《' + title() + '》，主题是' + t.name + '。';
        const facts = sources.join('') + '本题使用模拟练习数据。' + t.data;
        const own = p.notes;
        return [
            goal + (teacher ? '我还没想清玩法，请先问我两个会影响设计的问题，等我回答。全班可用的材料是：' : '我想先弄懂：'+(state.track==='graph'?'折线最高的一天，一定也是升温最快的一天吗？':'读温度计时，我应该从哪个刻度开始数？')+'请用一个小例子解释，然后出一道题让我试，等我回答再揭晓。材料是：') + facts,
            goal + '先做 Plan。' + (own[0] ? '我追问的是：“' + own[0] + '”。' : '') + '请给我两个简单玩法，每个只写玩家看什么、点哪里、怎样知道答得对不对。只用一道题，等我选择再开始制作。' + facts,
            '请用生图工具为《' + title() + '》生成一张横向封面。主体是' + t.subject + '，' + p.style + '风格，' + p.side + '留出放标题的空白。画面干净，无文字和数字。图用于封面，答题刻度和数据另画。把图片保存在本课工作区并告诉我文件名。',
            goal + '请在本课工作区创建第一版 index.html。采用我的计划：' + (own[1] || '一道题，选择答案后显示反馈，允许再试。') + '封面用刚才选中的图片。选图说明：' + (own[2] || '使用本会话中我选的封面。') + '用代码按以下数据绘制题图：' + facts + '首次打开隐藏答案。请把封面内嵌进 HTML，使文件离线也能单独打开。做完告诉我打开哪里试玩。',
            '请根据这次真实试玩，和我一起改进《' + title() + '》。我观察到：' + (own[3] || '〔先在左边记录实际现象〕') + '。我希望：' + (p.feedback || '〔写入一个想改的地方〕') + '。请先给两个改法，等我选定。实施时保留 index.html，把新版另存为 index-v2.html，告诉我怎样用相同操作重测。'
        ][step];
    }
    function currentPrompt() { return project().edits[state.step] ?? basePrompt(); }
    function followUp() {
        const p=project();
        const fallback=['能不能换个例子让我自己试试？先别告诉我答案。','采用一道题、三选一的玩法。','主角再大一些，留白处不要放仪器。','我想弄清这个操作为什么得到这样的反馈。','我选给新手一个读图提示。'];
        const choiceText=p.notes[state.step]?.trim() || fallback[state.step];
        return [choiceText,choiceText+' 请把这个选择整理成三步计划和一个可以实际检验的条件。',choiceText+' 请按我的这个决定修改封面描述，保留上一张图以便比较。',choiceText+' 请解释可能的原因，再问我想改哪里。',(p.feedback || fallback[4])+'。请按这个选择改出 index-v2.html，保留第一版；提醒我用同一个动作复测。'][state.step];
    }
    function refreshHandoffs() {
        const p=project(), s=state.step;
        $('follow-text').value=p.followEdits?.[s] ?? followUp();
    }
    window.weatherLessonContext = () => {
        const p = project();
        return ['当前步骤：' + phases[state.step] + ' · ' + title(), ...phases.map((phase,i) =>
            [phase, titles[i], (teacher ? lectureGuide : studentGuide)[i], modeGuides[i],
             p.edits[i] ?? basePrompt(i), notes[i], p.notes[i], p.followEdits?.[i]].filter(Boolean).join('｜'))].join('\n');
    };
    const returned = new Map();
    function fileKey(version) { return state.track+'-'+version; }
    function previewControls() {
        const versions=state.step===3?[1]:[1,2];
        return '<details><summary>带回自己做的网页，直接试玩</summary><p class="compact">从工作台下载单文件 HTML 后选取。预览只在本次打开时保留。</p>'
            +versions.map(v=>'<label for="product-'+v+'">第 '+v+' 版 HTML</label><input id="product-'+v+'" type="file" data-version="'+v+'" accept=".html,.htm,text/html">').join('')
            +'<div class="choices">'+versions.map(v=>choice('real-preview',v,'打开第 '+v+' 版')).join('')+'</div><div id="real-game"></div></details>';
    }
    function previewReal(version) {
        const source=returned.get(fileKey(version));
        if(!source){message('先选择从工作台带回的第 '+version+' 版 HTML。');return;}
        const frame=document.createElement('iframe');
        frame.className='returned';frame.title='我的第 '+version+' 版作品';
        frame.setAttribute('sandbox','allow-scripts');frame.referrerPolicy='no-referrer';
        frame.srcdoc='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data: blob:; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'; form-action \'none\'; base-uri \'none\'">'+source;
        $('real-game').replaceChildren(frame);
    }
    const choice = (id,value,label,active=false) => '<button type="button" data-action="'+id+'" data-value="'+esc(value)+'" aria-pressed="'+active+'">'+esc(label)+'</button>';
    function toolsPanel() {
        const p = project(), t = track();
        switch (state.step) {
        case 0: return '<div class="choices">'+Object.entries(tracks).map(([id,item])=>choice('track',id,item.name,state.track===id)).join('')+'</div>'
            + (teacher ? '<div class="choices">'+state.votes.map((n,i)=>choice('vote',i,Object.values(tracks)[i].name+' ＋1 · '+n+' 票')).join('')+choice('resetVotes','','清零')+'</div>' : '')
            + '<div class="callout"><b>题目材料 · 模拟观测</b><br>'+t.data+'</div><label for="work-title">给作品起名</label><input id="work-title" type="text" maxlength="50" placeholder="'+t.title+'" value="'+esc(p.title)+'">';
        case 1: return '<div class="callout"><b>看见 → 动手 → 收到反馈</b><br>把计划讲给一个没玩过的人听。他知道第一步点哪里吗？</div>';
        case 2: return '<label for="style">封面画风</label><select id="style"><option>科学手账水彩</option><option>彩纸拼贴</option><option>彩色铅笔速写</option></select>'
            + '<label for="side">标题留白</label><select id="side"><option>右侧</option><option>左侧</option><option>上方</option></select><label for="art">带回我实际生成的图（可选）</label><input id="art" type="file" accept="image/png,image/jpeg,image/webp">'+(p.cover?'<img class="kit" src="'+esc(p.cover)+'" alt="选中的封面">':'')
            + '<label><input id="made-image" type="checkbox" '+(p.madeImage?'checked':'')+'> 我已在 AIChat 生成并看过自己的图</label>';
        case 3: return '<div class="callout"><b>空工作区 → index.html → 试玩</b><br>先核对题图和这张数据卡，再试一个错误答案。<br>'+t.data+'</div>';
        case 4: return '<label for="feedback">我希望改进的一处</label><input id="feedback" type="text" maxlength="280" value="'+esc(p.feedback)+'" placeholder="例如：答错时提示从哪个刻度开始数"><label for="hint">给下一位玩家的具体提示</label><input type="text" id="hint" maxlength="180" placeholder="'+esc(t.hint)+'" value="'+esc(p.hint)+'">';
        }
    }
    function diagram() {
        let marks = '';
        if (state.track === 'temperature') {
            for (let n=10;n<=30;n++) {
                const y=130-(n-10)*5;
                marks+='<path d="M114 '+y+'h'+(n%5===0?18:8)+'" stroke="#314c41"/>';
                if (n%5===0) marks+='<text x="140" y="'+(y+4)+'">'+n+' °C</text>';
            }
            marks+='<rect x="95" y="24" width="11" height="112" rx="5" fill="#ede5d1" stroke="#4c6457"/><rect x="97" y="60" width="7" height="78" fill="#b5402d"/><circle cx="100.5" cy="138" r="8" fill="#b5402d"/>';
        } else {
            marks='<path d="M40 16v104h225 M64 94L150 36L236 65" fill="none" stroke="#2b685d" stroke-width="3"/>';
            [[64,94,18,'周一'],[150,36,22,'周二'],[236,65,20,'周三']].forEach(([x,y,n,day])=>{marks+='<circle cx="'+x+'" cy="'+y+'" r="5" fill="#bc6226"/><text x="'+x+'" y="'+(y-10)+'" text-anchor="middle">'+n+' °C</text><text x="'+x+'" y="142" text-anchor="middle">'+day+'</text>';});
        }
        return '<svg viewBox="0 0 300 155" role="img" aria-label="'+esc(track().data)+'">'+marks+'</svg>';
    }
    const demoTitle = () => '<h3>'+esc(title())+'</h3><p>模拟练习数据 · '+esc(track().question)+'</p>';
    function game(version) {
        return '<div class="practice" data-version="'+version+'"><img src="'+esc(cover())+'" alt="挑战卡封面">'+demoTitle()+diagram()+'<div class="choices">'+track().choices.map((c,i)=>choice('answer',i,c)).join('')+'</div><output aria-live="polite">请选择一个答案。</output></div>';
    }
    function answerText(index, version) {
        if (index === track().answer) return '答对了！'+track().data;
        return version === 1 ? '再试一次。' : (project().hint.trim() || track().hint);
    }
    function showExample() {
        const p=project(), box=$('sample-output');
        p.used[state.step] = true;
        const content = [
            '我先问你：读者以前看过这种图吗？如果他遇到困难，你愿意直接给答案，还是让他带着提示再试一次？',
            '玩法甲：选一个答案，再看反馈。玩法乙：先观察一处线索，再自己猜答案。你想采用哪个？可以在左边只留下其中两步。',
            '<img class="kit" src="'+esc($('station').src)+'" alt="课件备用气象站封面">这是课件自带的备用图。指出主角和标题位置，再写下你自己的生图描述。',
            game(1),
            '<div class="choices">'+choice('version',1,'试玩第一版')+choice('version',2,'试玩第二版')+'</div><div id="version-preview">'+game(2)+'</div><button data-action="export-game">保存第二版示例 HTML</button>'
        ];
        box.innerHTML='<b>本页模拟示例</b><div>'+content[state.step]+'</div>';
        box.hidden=false;
        save();
    }
    function render() {
        const s=state.step, p=project();
        $('start').textContent=(Object.values(p.done).some(Boolean)?'继续':'开始')+(teacher?'现场制作':'我的挑战')+' ↓';
        book.querySelector('.strip').innerHTML=phases.map((name,i)=>'<button data-action="step" data-value="'+i+'" '+(s===i?'aria-current="step"':'')+'><small>'+modes[i]+'</small>'+name+(p.done[i]?' ✓':'')+'</button>').join('');
        $('phase').textContent=teacher?'全班制作 · '+times[s]+' 分钟':'我的手账 · 第 '+(s+1)+' / 5 步';
        $('heading').textContent=titles[s]; $('lead').textContent=(teacher?lectureGuide:studentGuide)[s];
        $('brief-title').textContent=(teacher?['全班选题','全班定计划','投屏挑一张图','请一位同学试玩','听听玩家怎么说']:['选我的题目','设计玩家的三个动作','做出我的封面','我当第一位玩家','我的修改委托'])[s];
        $('guide').textContent=['想好一个读者，用练习材料问一个具体问题。','先在右边发出委托。读过 AI 的两个方案，把你的决定记在这里。','布局和画风将写进右侧委托。图片回到本页后可以放进练习卡试排。','在 AIChat 文件面板打开自己的网页。离线时也可以试右边的示例。','保留第一版，在第二版重做刚才的操作。把自己的发现写下来。'][s];
        $('tools').innerHTML=toolsPanel()+(s>=3?previewControls():'');
        if(s===2){$('style').value=p.style;$('side').value=p.side;}
        $('mode-guide').textContent=modeGuides[s];
        $('request').value=currentPrompt(); $('note-label').textContent=notes[s]; $('note').placeholder=s===0 && state.track==='graph'?'例如：最高的一天和升温最快的一天有什么区别？':placeholders[s]; $('note').value=p.notes[s] || '';
        $('sample-output').hidden=true; $('sample-output').replaceChildren();
        $('rebuild').hidden=p.edits[s]===undefined;
        refreshHandoffs();
        $('progress').textContent='已记录 '+Object.values(p.done).filter(Boolean).length+' / 5 个制作决定';
        $('next').textContent=s===4?'整理我的制作记录':'记下决定，继续 →';
        $('receipt').hidden=true;
        message('');
    }
    function go(step) {
        state.step=step;
        render(); save();
        $('desk').focus({preventScroll:true}); $('desk').scrollIntoView({block:'start'});
    }
    function refreshPrompt() { $('request').value=currentPrompt(); refreshHandoffs(); save(); }
    function record() {
        const p=project();
        const decisions=phases.map((phase,i)=>{
            const lines=[phase+' · '+notes[i],p.notes[i] || '尚未记录'];
            if(p.used[i])lines.push('本步看过课内模拟示例。');
            if(p.sent?.[i])lines.push('准备给 AI 的文字：'+p.sent[i]);
            if(p.followEdits?.[i])lines.push('我的追问：'+p.followEdits[i]);
            return lines.join('\n');
        });
        return ['《'+title()+'》制作记录',(teacher?'教师现场制作':'学生独立制作')+' · '+track().name,'',decisions.join('\n\n'),'',
            '生图描述：'+(p.edits[2] || [track().subject,p.style,p.side+'留白'].join('，')),
            p.madeImage?'生图：作者已确认在 AIChat 生成并看过图片。':'生图：待亲自完成或确认。',
            '课内预览封面：'+(p.cover?'作者导入的图片':'备用插画'),'希望改善：'+(p.feedback||'尚未记录'),
            'AI 使用说明：制作决定与重测结果由作者填写。'].join('\n');
    }
    async function copy(text,field) {
        try { await navigator.clipboard.writeText(text); return true; } catch {}
        const temp=field || document.createElement('textarea');
        if(!field){temp.value=text;book.append(temp);}
        temp.focus();temp.select();
        let ok=false;try{ok=document.execCommand('copy');}catch{}
        if(!field && ok)temp.remove();
        if(!ok)message('浏览器限制了剪贴板。文字已选中，请按 Ctrl/Cmd+C 或长按复制。');
        return ok;
    }
    function download(name,text,type) {
        const url=URL.createObjectURL(new Blob([text],{type}));
        const a=document.createElement('a');a.href=url;a.download=name;a.click();
        setTimeout(()=>URL.revokeObjectURL(url),2000);
        message('如浏览器限制下载，请用页尾的“独立窗口打开课件”，或复制制作记录。');
    }
    function exportGame() {
        const contents=game(2);
        const feedback=track().choices.map((_,i)=>answerText(i,2));
        const script='const replies='+JSON.stringify(feedback).replaceAll('<','\\u003c')+';document.querySelectorAll("button").forEach(b=>b.onclick=()=>document.querySelector("output").textContent=replies[Number(b.dataset.value)]);';
        download('气象挑战-课内示例.html','<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(title())+'</title><style>body{max-width:560px;margin:24px auto;padding:12px;background:#faf5e8;color:#183e33;font:19px/1.6 system-ui}img{width:100%;max-height:180px;object-fit:cover}svg{width:100%;height:200px}button{padding:12px;margin:4px;font:inherit}output{display:block}</style>'+contents+'<small>课内模拟作品 · 示意封面 · 模拟练习数据</small><script>'+script+'<\/script></html>','text/html;charset=utf-8');
    }
    async function importCover(file) {
        if(!file)return;
        const p=project();
        if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>12*1024*1024){message('请选择小于 12 MB 的 PNG、JPG 或 WebP 图片。');return;}
        try {
            const bmp=await createImageBitmap(file), ratio=Math.min(1,720/bmp.width,480/bmp.height);
            const canvas=document.createElement('canvas');
            canvas.width=Math.max(1,Math.round(bmp.width*ratio)); canvas.height=Math.max(1,Math.round(bmp.height*ratio));
            canvas.getContext('2d').drawImage(bmp,0,0,canvas.width,canvas.height);bmp.close();
            p.cover=canvas.toDataURL('image/webp',.72);save();
            if(p===project() && state.step===2){render();message('已把你选的封面放进本课练习卡。');}
        }catch{message('无法读取这张图，请选择另一张。');}
    }
    $('start').onclick=()=>go(state.step);
    $('standalone').href=new URL('index.html',location.href).href;
    $('note').oninput=()=>{project().notes[state.step]=$('note').value;if(!$('note').value.trim()) delete project().done[state.step];refreshHandoffs();save();};
    $('request').oninput=()=>{project().edits[state.step]=$('request').value;$('rebuild').hidden=false;save();};
    $('rebuild').onclick=()=>{delete project().edits[state.step];$('rebuild').hidden=true;refreshPrompt();message('已按你的最新选择重组委托。');};
    $('tools').oninput=e=>{
        const fields={'work-title':'title',style:'style',side:'side',feedback:'feedback',hint:'hint'};
        if(fields[e.target.id]){project()[fields[e.target.id]]=e.target.value;refreshPrompt();}
    };
    $('tools').onchange=async e=>{
        if(e.target.id==='made-image'){project().madeImage=e.target.checked;save();}
        if(e.target.id==='art')importCover(e.target.files[0]);
        if(e.target.matches('input[type=file][data-version]')){
            const file=e.target.files[0], version=Number(e.target.dataset.version), key=fileKey(version);
            if(!file)return;
            if(file.size>8*1024*1024){message('请选择小于 8 MB 的单页 HTML，也可以直接在 AIChat 预览。');return;}
            try{const html=await file.text();returned.set(key,html);if($('real-game') && key===fileKey(version))previewReal(version);}
            catch{message('文件没有读成功，请重新选择。');}
        }
    };
    $('copy').onclick=async()=>{if(await copy($('request').value,$('request')))message('已复制。切到你的主对话，粘贴后可以继续改。');};
    $('follow-copy').onclick=async()=>{if(await copy($('follow-text').value,$('follow-text')))message('追问已复制，可在原会话继续。');};
    $('follow-text').oninput=()=>{(project().followEdits ||= {})[state.step]=$('follow-text').value;save();};
    $('example').onclick=showExample;
    $('speak').onclick=()=>{if(!window.speechSynthesis){message('此浏览器没有朗读功能，可直接阅读上方引导。');return;}
        speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(titles[state.step]+'。'+$('lead').textContent);speech.lang='zh-CN';speechSynthesis.speak(speech);};
    $('next').onclick=()=>{
        if(!$('note').value.trim()){message('先在“'+notes[state.step]+'”写下你自己的一个决定。');$('note').focus();return;}
        project().done[state.step]=true;save();
        if(state.step<4)go(state.step+1);
        else {render();$('receipt').hidden=false;$('record').textContent=record();$('receipt').scrollIntoView();}
    };
    $('record-copy').onclick=async()=>{if(await copy(record()))message('制作记录已复制。');};
    $('download').onclick=()=>download('气象挑战-制作记录.txt',record(),'text/plain;charset=utf-8');
    book.addEventListener('click',e=>{
        const b=e.target.closest('[data-action]');if(!b)return;
        const v=b.dataset.value;
        switch(b.dataset.action){
        case 'step': go(Number(v));break;
        case 'track': state.track=v;render();save();break;
        case 'vote': state.votes[Number(v)]++;render();save();break;
        case 'resetVotes': state.votes=[0,0];render();save();break;
        case 'answer': {const gameBox=b.closest('.practice');gameBox.querySelector('output').textContent=answerText(Number(v),Number(gameBox.dataset.version));break;}
        case 'version': $('version-preview').innerHTML=game(Number(v));break;
        case 'real-preview': previewReal(Number(v));break;
        case 'export-game': exportGame();break;
        }
    });
    render();
})();
