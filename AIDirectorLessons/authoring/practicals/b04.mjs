// Each activity is embedded independently in a student's exported project.
export default {
    'g5-05': {
        goal:'让新生走两次展厅，能从牌上指出铜钟与纸翼的不同来源，并报告缺牌时查不到什么。',
        product:'钟亭双展区布展排练器',
        opening:'一位新生说钟亭真的长着发光的翅膀。你会带他到哪里查证？',
        prediction:'先预测临时移走右牌后，哪一条观察仍能追到 F1，哪件新增物件会失去现场提示。',
        demonstration:'投屏同一条游览路线，先出示两块展牌，再只撤右牌并重走。打开实际 Paracraft，在左区摆两柱一钟、右区加想象道具和可点向导，请新生亲自找牌，再恢复右牌。',
        debrief:'你在哪个展位见到哪件东西？建筑没有移动时，让你改变判断的是哪一块牌？',
        student:'从空白展厅开始。给幻想展区起一个具体道具名，在浏览器排练左右路线；进入 Paracraft 搭出两区、设置入口标牌，打开向导拉杆请同伴参观。',
        revision:'同一新生沿同一路线两走，第二遍仅撤右牌。保留 V1，把右牌移到新生先看到的位置，恢复标牌并走第三遍，听他能否说出新增物的来源。',
        fields:[
            {key:'route',label:'参观顺序',options:['先左后右','先右后左']},
            {key:'prop',label:'右区想象道具',value:'一对发光的纸翼'},
            {key:'sign',label:'右区来源牌',options:['挂出 I1','暂时收起 I1']}
        ],
        run(v) {
            const prop = String(v.prop || '').trim();
            if (!prop) return '右区还没有道具。请写一个与 F1 不同的想象部件。';
            if (!['先左后右','先右后左'].includes(v.route) || !['挂出 I1','暂时收起 I1'].includes(v.sign)) return '请选择游览顺序和右牌状态。';
            const stops = [
                {place:'左区',objects:'两根灰柱、一口铜钟',source:'F1 · 练习观察记录'},
                {place:'右区',objects:'铜钟加上'+prop,source:v.sign==='挂出 I1'?'I1 · AI辅助畅想':'现场缺少来源牌，请问向导'}
            ];
            if (v.route === '先右后左') stops.reverse();
            return stops.map((s,i)=>(i+1)+'站 '+s.place+'｜看见：'+s.objects+'｜能读到：'+s.source).join('\n')
                +'\n现场可直接查证来源的展位：'+(v.sign==='挂出 I1'?'2/2':'1/2')+'。';
        },
        world(v) {
            const label = JSON.stringify(String(v.prop || '未命名道具').replace(/[\x00-\x1f]/g,' '));
            const leftFirst = v.route !== '先右后左';
            return `local prop = ${label}
local showSign = ${v.sign === '挂出 I1'}
local function visitLeft()
    turnTo(270)
    say("左区：两根灰柱和一口铜钟。牌上写 F1，练习观察记录。",4)
end
local function visitRight(show)
    turnTo(90)
    if show then say("右区：" .. prop .. "。牌上写 I1，AI辅助畅想。",4)
    else say("右区：" .. prop .. "。展位缺少来源牌，向作者索取设计卡。",4) end
end
registerClickEvent(function()
    local mode=ask("两次参观只换右牌状态", {"按作品设置走一遍","切换右牌再走一遍"})
    if mode~=1 and mode~=2 then return end
    local show=showSign
    if mode==2 then show=not show end
    ${leftFirst?'visitLeft()\n    visitRight(show)':'visitRight(show)\n    visitLeft()'}
end)`;
        },
        checks:[
            {set:{},expect:'现场可直接查证来源的展位：2/2'},
            {set:{sign:'暂时收起 I1',route:'先右后左',prop:'云朵风车'},expect:'1站 右区｜看见：铜钟加上云朵风车｜能读到：现场缺少来源牌'},
            {set:{prop:''},expect:'请写一个与 F1 不同的想象部件'}
        ]
    },
    'g5-06': {
        goal:'做出有时间码、景别、动作与台词的三幕分镜表；让摄影师能定位皱眉的那一幕。',
        product:'十二秒失物角分镜剪辑台',
        opening:'摄影师只收到三句台词。你能补哪一格，让他知道什么时候给小栎的眉毛一个特写？',
        prediction:'只换第二幕景别时，先猜什么变大了，第一幕开拍和第三幕结束的时间会不会变。',
        demonstration:'投屏三个4秒镜头生成首版拍摄表。只将第二幕远景换成特写，再次生成；请全班核对时间码与证据台词是否逐字保留。',
        debrief:'哪一行指明了摄影师要拍谁、拍多久、什么时候可以让观众看清依据？',
        student:'拿三张纸卡试摆，用自己的话写三幕动作、台词与每幕时长。请 AI 在同一主对话润色一句，再自行核对体育馆的柜名，生成第一版拍摄表交给摄影师。',
        revision:'摄影师先按 V1 报时摆纸偶，再只调第二幕景别；在 V2 同一秒观察小栎，确认另外两幕的时长与台词仍一致。',
        fields:[
            {key:'shots',label:'三幕脚本，每行填 秒数｜动作｜字幕',value:'4｜小栎在教室失物角捡起蓝手套｜这是谁的手套？\n4｜听助手说完，小栎皱眉｜助手：在图书馆！\n4｜小栎翻开登记卡核对柜名｜登记卡：体育馆失物柜'},
            {key:'view',label:'第二幕机位',options:['远景','面部特写']},
            {key:'actor',label:'担任核查员的纸偶',value:'小栎'}
        ],
        run(v) {
            const actor = String(v.actor||'').trim();
            const rows = String(v.shots||'').trim().split(/\r?\n/);
            if (!actor) return '先给核查员纸偶起一个虚构称呼。';
            if (rows.length!==3) return '需要三幕，当前有 '+(rows[0]?rows.length:0)+' 幕。';
            if (!['远景','面部特写'].includes(v.view)) return '请选择第二幕机位。';
            let end=0;
            const cuts=[];
            for (const [i,line] of rows.entries()) {
                const cols=line.split(/[|｜]/).map(x=>x.trim());
                if (cols.length!==3 || !cols.every(Boolean) || !/^\d+$/.test(cols[0]) || +cols[0]<1 || +cols[0]>60) return '第'+(i+1)+'幕请填 1—60 的整数秒数、动作和字幕。';
                const start=end;
                end+=Number(cols[0]);
                const view=['全景',v.view,'道具特写'][i];
                cuts.push('镜'+(i+1)+' '+start+'—'+end+'秒｜'+view+'｜'+cols[1]+'｜字幕：'+cols[2]);
            }
            return '核查员：'+actor+'\n'+cuts.join('\n')+'\n片长 '+end+' 秒。'+(end===12?'符合十二秒片长。':'与12秒目标相差 '+Math.abs(end-12)+' 秒。');
        },
        checks:[
            {set:{},expect:'镜2 4—8秒｜远景'},
            {set:{view:'面部特写',shots:'3｜找手套｜在哪儿？\n5｜抬眉｜你确定？\n6｜翻卡｜体育馆'},expect:'片长 14 秒。与12秒目标相差 2 秒'},
            {set:{shots:'4｜看｜读'},expect:'当前有 1 幕'},
            {set:{shots:'4｜看｜读\n零｜拍｜卡\n4｜翻｜查'},expect:'第2幕请填'}
        ]
    },
    'g5-07': {
        goal:'能在2、6、10秒三个核验点复述失物故事，只改变终幕机位使登记牌进入镜头范围。',
        product:'末镜取景与静音字幕排练台',
        opening:'电影的字还在，观众怎么会看不见？让我们从第十秒的摄影机位置找原因。',
        prediction:'猜一猜机位中心向右移两格，哪些暂停点的结果应当相同，哪块牌会进入画面。',
        demonstration:'设终幕中心为0、牌在2，分别暂停2、6、10秒；仅把机位改为2复查。打开实际 Paracraft 电影方块，按三段时间轴摆机位与字幕，再在第10秒预览登记牌。',
        debrief:'从时间码、画面范围和同伴复述里，各找一条证据说明改动只影响结尾。',
        student:'带入上一课脚本，或用失物角备用脚本。在浏览器按横向格子排练；再开 Paracraft 放电影方块和演员，按0、4、8秒设三镜头，12秒结束，静音放映 V1。',
        revision:'请第一次看短片的同伴在第10秒指出牌面。V2 只移动末镜机位，再用同一画幅在2、6、10秒暂停；分别记录观众在第几秒读出体育馆。',
        fields:[
            {key:'pause',label:'暂停时刻（0—12秒）',value:'10'},
            {key:'camera',label:'第三镜机位中心（横向整数格）',value:'0'},
            {key:'board',label:'登记牌位置（横向整数格）',value:'2'},
            {key:'caption',label:'结尾登记牌文字',value:'登记卡：体育馆失物柜'}
        ],
        run(v) {
            const parse = s => (String(s??'').trim() && /^-?\d+$/.test(String(s).trim())) ? Number(s) : NaN;
            const sec=parse(v.pause), center=parse(v.camera), board=parse(v.board);
            if (!Number.isInteger(sec)||sec<0||sec>12) return '暂停时刻应在0至12秒之间，填整数。';
            if (![center,board].every(x=>Number.isInteger(x)&&Math.abs(x)<=20)) return '机位与登记牌各填 -20 至 20 之间的一个整数格。';
            if (sec===12) return '12秒｜片段结束。退到第10秒检查证据镜头。';
            if (sec<4) return sec+'秒｜镜1 全景｜教室失物角，小栎捡起蓝手套。';
            if (sec<8) return sec+'秒｜镜2 近景｜助手字幕：在图书馆！小栎皱眉。';
            const left=center-1,right=center+1;
            const visible=board>=left && board<=right;
            return sec+'秒｜镜3 道具镜｜取景范围 '+left+' 至 '+right+' 格；登记牌在 '+board+' 格。\n'+
                (visible?'登记牌入镜。'+(String(v.caption||'').trim()?'可读文字：'+v.caption:'牌面空白，先填写文字。'):'登记牌在画外，观众无法从画面核查柜名。');
        },
        world(v) {
            const q=s=>JSON.stringify(String(s||'').replace(/[\x00-\x1f]/g,' '));
            const coord=s=> /^-?\d+$/.test(String(s).trim()) && Math.abs(Number(s))<=20 ? Number(s) : null;
            const camera=coord(v.camera), board=coord(v.board);
            if (camera===null||board===null) return 'registerClickEvent(function() say("请先填写有效的机位和登记牌格数，再生成排练。",4) end)';
            return `local center=${camera}
local board=${board}
local caption=${q(v.caption)}
registerClickEvent(function()
    local mode=ask("拍同一个十二秒纸偶动作",{"第一版机位","只将终幕机位对准登记牌"})
    if mode~=1 and mode~=2 then return end
    turnTo(0)
    say("开场：教室失物角，小栎捡起蓝手套。",4)
    turnTo(90)
    say("助手说：在图书馆！小栎皱眉。",4)
    turnTo(180)
    local finalCenter=center
    if mode==2 then finalCenter=board end
    if math.abs(board-finalCenter)<=1 and caption~="" then say(caption,4)
    else say("末镜排练：观众无法读到登记牌。",4) end
end)`;
        },
        checks:[
            {set:{},expect:'登记牌在画外'},
            {set:{camera:'2',caption:'体育馆二号柜'},expect:'可读文字：体育馆二号柜'},
            {set:{pause:'6',camera:'2'},expect:'镜2 近景'},
            {set:{pause:'13'},expect:'暂停时刻应在0至12秒'},
            {set:{camera:'2',caption:''},expect:'牌面空白'}
        ]
    },
    'g5-08': {
        goal:'为每句试载事实连上正确记录，给人工校对与 AI 欢迎词分别署名；让下一班能追到证据。',
        product:'纸桥试载声明牌与查证索引',
        opening:'展牌写“这座桥能托五枚”。下一班怎样知道这是亲手试的，还是欢迎词里猜的？',
        prediction:'先猜换错一个记录号，查证时会在哪一行暴露出来；展品上的数字会自己改变吗？',
        demonstration:'投屏课堂模拟记录 S1、S2，先出具两行声明。仅把折槽桥的记录号换成 S1，再运行逐行对照。打开实际 Paracraft，让同伴点展厅向导查同一块展牌并读出来源。',
        debrief:'找出一句事实、一项人做的事、一项 AI 做的事。哪条记录支持“本次5枚”，还缺什么才能谈其他纸桥？',
        student:'从两行试载事实做第一版，输入实际分工。浏览器排练查证后，进入 Paracraft 搭两座展台，把对应记录放旁边，点向导逐项听出处与贡献。',
        revision:'另一桌总编辑挑一行查证失败的事实。只改这行的错引号，保持筹码数与署名不动，再请同一人按相同次序查两行。',
        fields:[
            {key:'claims',label:'一行一条：桥型｜本次筹码数｜记录号',value:'平纸桥｜2｜S1\n折槽桥｜5｜S2'},
            {key:'human',label:'人的实际贡献',value:'搭两座桥，逐枚放筹码，对照记录校字幕'},
            {key:'ai',label:'AI 工具与用途',value:'AIChat 起草欢迎词，作者删去过度结论'}
        ],
        run(v) {
            const refs={S1:{bridge:'平纸桥',n:2},S2:{bridge:'折槽桥',n:5}};
            const rows=String(v.claims||'').split(/\r?\n/).filter(x=>x.trim());
            if (!rows.length) return '声明牌缺少事实。先写桥型、筹码数和记录号。';
            let valid=0;
            const results=rows.map((row,i)=>{
                const cells=row.split(/[|｜]/).map(x=>x.trim());
                const [bridge,n,source]=cells;
                const label='第'+(i+1)+'行 ';
                if(cells.length!==3||!bridge||!/^\d+$/.test(n)||!source) return label+'三格未填全或筹码数不是非负整数。';
                const ref=Object.hasOwn(refs,source)?refs[source]:null;
                if(!ref) return label+'找不到记录 '+source+'，请核对 S1 或 S2。';
                if(ref.bridge!==bridge || ref.n!==Number(n)) return label+'错引：'+source+' 实记 '+ref.bridge+' '+ref.n+' 枚。';
                valid++; return label+bridge+' 本次托 '+n+' 枚 ← '+source+'，吻合。';
            });
            return [...results,'已核对 '+valid+'/'+rows.length+' 行。','人工贡献：'+(String(v.human||'').trim()||'待补具体动作'),'AI 工具与用途：'+(String(v.ai||'').trim()||'待填实际使用情况')].join('\n');
        },
        world(v) {
            const quote=s=>JSON.stringify(String(s||'').replace(/[\x00-\x1f]/g,' '));
            const refs={S1:'平纸桥｜2',S2:'折槽桥｜5'};
            const lines=String(v.claims||'').trim().split(/\r?\n/).filter(x=>x.trim()).map(line=>{
                const [name,n,id]=line.split(/[|｜]/).map(s=>s.trim());
                const ref=Object.hasOwn(refs,id) ? refs[id] : '';
                return quote((name||'未填桥型')+'，申报 '+(n||'未填')+' 枚。'+(ref?'调出 '+id+'：'+ref+' 枚。'+(name+'｜'+n===ref?'记录吻合。':'请复核这一行。'):'缺少可查的记录。'));
            });
            return `local facts={${lines.join(',')}}
registerClickEvent(function()
    local mode=ask("选择巡展路线",{"逐行核对事实","查看人工贡献和 AI 用途"})
    if mode==1 then
        turnTo(270)
        if #facts==0 then say("展牌没有事实记录，请总编辑补写。",4) end
        for i=1,#facts do say(facts[i],5) end
    elseif mode==2 then
        turnTo(90)
        say(${quote('人工贡献：'+(v.human||'待补具体动作'))},5)
        say(${quote('AI工具与用途：'+(v.ai||'待填实际使用情况'))},5)
    end
end)`;
        },
        checks:[
            {set:{},expect:'已核对 2/2 行'},
            {set:{claims:'折槽桥｜5｜S1'},expect:'错引：S1 实记 平纸桥 2 枚'},
            {set:{claims:'展览桥｜9｜S8'},expect:'找不到记录 S8'},
            {set:{claims:''},expect:'声明牌缺少事实'}
        ]
    },
    'g6-01': {
        goal:'把“路更好走”改成有起终点、测量动作、单位和目标的委托，按目标用同一组观测选路。',
        product:'两种委托共用的路线测量单',
        opening:'送展牌的同学和端纸杯的同学同时出发。“更好走”对两个人一定是同一条路吗？',
        prediction:'看甲道18秒3次转弯、乙道22秒1次转弯。在数据不变时，猜哪一种委托会使选路翻转。',
        demonstration:'投屏录入两条路线，按最短用时排一次。保留出发、到达口令与数据，切成最少转弯再排一次；让全班各找一项足以复测的依据。',
        debrief:'如果你明天要拿秒表复现结果，从什么时候开始，到哪里停？两个指标给出不同建议时该听哪位委托人？',
        student:'给值班同学制作一张测量单。填入起终点和两条模拟观测，用前轮越过线的口令统一计时；带自己的问题去 AIChat 请它找歧义，回来亲自算一次。',
        revision:'交给送牌员和运杯员各试一次。请同伴只换指标复算，若两条路同分，让他自己指出并列；只改有歧义的起停口令，再用原始记录复测。',
        fields:[
            {key:'start',label:'从什么动作开始',value:'小车前轮越过图书角蓝线'},
            {key:'finish',label:'到什么动作停止',value:'小车前轮碰到作品展台黄线'},
            {key:'metric',label:'委托人的目标',options:['通行时间最短','转弯次数最少']},
            {key:'routes',label:'每行填 路名｜用时秒｜转弯次数',value:'甲道｜18｜3\n乙道｜22｜1'}
        ],
        run(v) {
            const start=String(v.start||'').trim(), finish=String(v.finish||'').trim();
            if (!start||!finish) return '缺少可复现的'+(!start?'起点动作':'终点动作')+'。';
            const rows=String(v.routes||'').trim().split(/\r?\n/).filter(x=>x.trim());
            if(rows.length<2) return '至少需要两条路线的观测才能比较。';
            if(!['通行时间最短','转弯次数最少'].includes(v.metric)) return '先选用时或转弯作为指标。';
            const data=[];
            const names=new Set();
            for(const [i,row] of rows.entries()){
                const cells=row.split(/[|｜]/).map(x=>x.trim());
                const [name,sec,turns]=cells;
                if(cells.length!==3||!name||!/^\d+(\.\d+)?$/.test(sec)||!Number.isFinite(Number(sec))||Number(sec)<=0||!/^\d+$/.test(turns)||!Number.isSafeInteger(Number(turns))) return '第'+(i+1)+'行需包含路名、正数秒数、非负整数转弯次数。';
                if(names.has(name)) return '路名重复：'+name+'。请为两条路线分别命名。';
                names.add(name); data.push({name,sec:Number(sec),turns:Number(turns)});
            }
            const timed=v.metric==='通行时间最短', field=timed?'sec':'turns',unit=timed?'秒':'次';
            data.sort((a,b)=>a[field]-b[field]);
            const best=data[0][field], winners=data.filter(r=>r[field]===best).map(r=>r.name);
            return '测量口令：从「'+start+'」至「'+finish+'」。\n按'+v.metric+'复算：'+data.map(r=>r.name+' '+r[field]+unit).join('，')+'。\n'+
                (winners.length>1?'并列：':'本次推荐：')+winners.join('、')+'（'+best+unit+'）。';
        },
        checks:[
            {set:{},expect:'本次推荐：甲道（18秒）'},
            {set:{metric:'转弯次数最少'},expect:'本次推荐：乙道（1次）'},
            {set:{routes:'长廊｜20｜0\n花径｜20｜3'},expect:'并列：长廊、花径（20秒）'},
            {set:{finish:''},expect:'缺少可复现的终点动作'},
            {set:{routes:'甲｜18｜3\n乙｜21｜-1'},expect:'第2行需包含'}
        ]
    }
};
