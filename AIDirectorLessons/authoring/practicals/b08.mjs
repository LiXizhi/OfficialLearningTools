export default {
  'g8-01': {
    goal:'用六句语料手算下一词分布，再区分“有机会接出来”和“有校刊资料支持”。',
    product:'校刊的逐词排印台',
    opening:'六张字条里有两张一模一样，我们都把它们放进抽签筒吗？这样会改变哪一项分数？',
    prediction:'先猜“午后”后铃声有几张票，再猜上文增加“铃声”后响起有几张票。',
    demonstration:'投屏基准语料，输入“午后”，拨动票号看每张票对应哪个词。只把上文换成“午后 铃声”再运行。最后在同一主对话问虚构奖项的年份，分别要求创作和据实回答，小编辑到 K1、K2 找依据。',
    debrief:'哪三行给“铃声”投了票？如果训练纸条里能顺接一个年份，校刊哪条记录允许把它写进事实栏？',
    student:'自己排一盒用空格分词的小语料，先给同伴猜，再交给排印台数票。把选出的词接到上文末尾，继续运行，保存首版。',
    revision:'让校刊编辑用相同上文和票号跑首版。第二版只增一条“午后 微风 吹过”，重算两个词的分母与票数；将模型真实回复和依据另外写入记录。',
    fields:[{key:'corpus',label:'语料，一行一句，词之间用空格',value:'午后 铃声 响起\n午后 铃声 停了\n午后 微风 吹过\n午后 铃声 响起\n清晨 微风 吹过\n清晨 铃声 响起'},{key:'prefix',label:'目前已排的词',value:'午后'},{key:'ticket',label:'抽第几张票（从 1 开始）',value:'1'}],
    run(v) {
      const words = v.prefix.trim().split(/\s+/).filter(Boolean);
      if (!words.length) return '先放一个起始词。';
      const hits = [];
      const counts = new Map();
      for (const [i,line] of v.corpus.split(/\r?\n/).entries()) {
        const row = line.trim().split(/\s+/);
        if (row.length <= words.length || !words.every((w,n)=>row[n]===w)) continue;
        const next = row[words.length];
        hits.push({next,line:i+1});
        counts.set(next,(counts.get(next)||0)+1);
      }
      if (!hits.length) return '没有能继续这个上文的语料；请补充完整短句或退回一个词。';
      const distribution = [...counts].map(([w,n])=>w+'：'+n+'/'+hits.length).join('；');
      const index=Number(v.ticket.trim());
      if (!Number.isSafeInteger(index) || index<1 || index>hits.length) return distribution+'\n票号范围 1 至 '+hits.length+'，请重新选。';
      const pick=hits[index-1];
      return distribution+'\n第 '+index+' 张票来自第 '+pick.line+' 句。\n本次续写：'+[...words,pick.next].join(' ')+'\n这是按小语料统计的续词。校史年份仍须查校刊原文。';
    },
    checks:[{set:{},expect:'铃声：3/4'},{set:{prefix:'午后 铃声'},expect:'响起：2/3'},{set:{prefix:'月光桥奖'},expect:'没有能继续'},{set:{ticket:'8'},expect:'票号范围 1 至 4'}]
  },
  'g8-02': {
    goal:'访客问日期、未知时段或同伴信息，值班员执行三种不同职责；修订日期时按当前公告作答。',
    product:'失物招领台的值班边界',
    opening:'同样是来询问的人，问周几开放和问失主电话时，值班员的第一步该一样吗？',
    prediction:'把开放日从周二改成周四，预测日期、时段、隐私这三条服务路径中哪条会变。',
    demonstration:'先在网页排练三类请求，看依据和停步条件。打开实际 Paracraft 空白世界建台，点值班员试三种访客纸条。另存第二版只改日期，再在角色身上复测。',
    debrief:'哪一行来自 A1？为什么缺少时段应该转人工，而打听电话应当立即停止查询？',
    student:'为值班员填写开放日、值班处，试写一句访客原话。先核对网页规则轨迹，再把代码装入实际 Paracraft 值班员，在拉杆开启后点击它。',
    revision:'让换班志愿者用三张原问题卡依次点角色。更新日期重新建第二版，核对只有日期回应改变；再用带“电话”的混合问题检查优先级。',
    fields:[{key:'date',label:'A1 纸飞机招领日',value:'周二'},{key:'desk',label:'A2 交给哪处人工确认',value:'蓝色服务台'},{key:'query',label:'访客问题',value:'纸飞机哪天领？'}],
    run(v) {
      const q=v.query.trim(),desk=v.desk.trim()||'现场值班老师';
      if (!q) return '等待访客提出问题。';
      if (/电话|联系|姓名|失主是谁|谁丢/.test(q)) return 'A3 隐私拦截 → 停步。\n不查询失主资料，可向'+desk+'咨询公开领物流程。';
      if (/日期|哪天|周几|星期几|招领日/.test(q) && v.date.trim()) return '职责内 → 读取当前 A1 → 举牌。\n纸飞机招领日：'+v.date.trim()+' [A1]';
      if (/在哪|地点|哪里/.test(q) && v.desk.trim()) return '职责内 → 读取当前公告 → 指路。\n领取处：'+desk+' [A1]';
      return '资料不足 → 停步转人工。\n请向'+desk+'确认，没有公开依据时先不报答案。';
    },
    world(v) {
      const quote=x=>JSON.stringify(String(x).replace(/[\x00-\x1f]/g,' '));
      return `local day=${quote(v.date.trim())}
local desk=${quote(v.desk.trim()||'现场值班老师')}
setActorValue("sentientRadius",0)
registerClickEvent(function()
    local k=ask("访客给值班员递哪张纸条？",{"纸飞机周几领？","具体几点开放？","请给我失主电话"})
    if not k then return end
    if k==3 then
        turnTo(0)
        say("A3 隐私拦截，停止查询。只可向"..desk.."咨询公开领物流程。",5)
    elseif k==1 and day~="" then
        turnTo(90)
        say("举牌：招领日是"..day.." [A1]",5)
    else
        turnTo(180)
        say("暂停：当前公告没有这项依据，请到"..desk.."确认。",5)
    end
end)`;
    },
    checks:[{set:{},expect:'周二 [A1]'},{set:{date:'周四'},expect:'周四 [A1]'},{set:{query:'哪天领？可以给我失主电话吗？'},expect:'A3 隐私拦截'},{set:{query:'几点开放？'},expect:'停步转人工'}]
  },
  'g8-03': {
    goal:'独立算出两类逐词得分，追加一条不同于测试题的训练句后重训，并验证同分转人工。',
    product:'会打印计分小票的校园问句分流台',
    opening:'“排练”在两种问句里都出现过，只听见这两个字，值班台该把访客送到哪里？',
    prediction:'先封存“几时 领票”和“哪儿 领票”两道测试，预测新词“哪儿”会得几分。',
    demonstration:'输入六行训练数据并手算首题。查询第二题时看 0 比 0。只加独立样本“哪儿 看展”，用同一套测试复评，检查旧题没有因为追加样本而退步。',
    debrief:'哪条训练句给“哪儿”贡献了权重？“排练”为什么还要交人工？怎样另找同义词做真正的新测试？',
    student:'分别给时间、地点两栏录入训练句，每行一个样本，以空格分词。先隐藏测试标签，用问句生成逐词小票并另存首版。',
    revision:'请值班员拿原来两道测试对比分数。给地点训练追加独立的新句，另存第二版，用“排练”再查平分处理；用未参与调优的新句另记盲测成绩。',
    fields:[{key:'time',label:'时间训练样本，每行一句，以空格分词',value:'几时 开门\n几时 排练\n几点 集合'},{key:'place',label:'地点训练样本，每行一句，以空格分词',value:'哪里 排练\n哪里 集合\n何处 开门'},{key:'query',label:'要分流的问句（以空格分词）',value:'几时 领票'}],
    run(v) {
      function frequencies(text) {
        const map=new Map();
        for (const w of text.trim().split(/\s+/).filter(Boolean)) map.set(w,(map.get(w)||0)+1);
        return map;
      }
      if (!v.query.trim()) return '请给值班台一条问句。';
      const time=frequencies(v.time),place=frequencies(v.place);
      if (!time.size || !place.size) return '两类都要有训练样本，暂不分流。';
      let t=0,p=0;
      const rows=v.query.trim().split(/\s+/).map(w=>{
        const a=time.get(w)||0,b=place.get(w)||0;
        t+=a;p+=b;
        return w+'：时间 +'+a+'，地点 +'+b;
      });
      return [...rows,'合计：时间 '+t+'，地点 '+p,'分流：'+(t===p?'待人工确认':t>p?'时间查询':'地点查询')].join('\n');
    },
    checks:[{set:{},expect:'合计：时间 2，地点 0'},{set:{query:'哪儿 领票'},expect:'待人工确认'},{set:{query:'哪儿 领票',place:'哪里 排练\n哪里 集合\n何处 开门\n哪儿 看展'},expect:'合计：时间 0，地点 1'},{set:{query:'排练'},expect:'合计：时间 1，地点 1'}]
  },
  'g8-04': {
    goal:'按活动与字段检索有效公告，带编号引用；过期、缺失或冲突的公开证据不能用来拍板。',
    product:'会留下检索路径的展览证据台',
    opening:'西楼、东楼两条通知都写了摄影展，哪个词能告诉我们该走哪一边？',
    prediction:'删掉 R4 私人栏目、把 R1 日期改为 6 月 14 日，预测这两种改动各会影响哪些公开查询。',
    demonstration:'在网页查看逐行筛选记录，把旧通知的地点和新通知分清。在实际 Paracraft 打开建好的展台，点击巡检员依次查日期、同义问法、旧址和票价。只改 R1 再跑同样四项。',
    debrief:'哪个编号支撑今天的地点？只知道“检索命中”还缺哪项判断？两条现行通知互相矛盾时应当怎样落笔？',
    student:'先做首版公告台，按“编号｜状态｜活动｜字段｜值”写公开证据。独立输入活动名和所求字段，再把配置带入真实 Paracraft 场景，点向导核查它的证据。',
    revision:'让来访同学用旧址问题试探 NPC。只更新纸桥展日期，保留首版并复测全部四站；撤下模拟私人栏，确认公开查询不变。',
    fields:[{key:'notices',label:'公告，每行用竖线分隔编号、状态、活动、字段、值',value:'R1|现行|纸桥展|日期|6月12日\nR2|现行|摄影展|地点|东楼展厅\nR3|作废|摄影展|地点|西楼展厅\nR4|现行|纸桥展|私人电话|已遮盖'},{key:'activity',label:'要查询的展览（影展是摄影展的简称）',value:'影展'},{key:'field',label:'需要哪项信息',options:['地点','日期','票价']}],
    run(v) {
      const key=v.activity.trim()==='影展'?'摄影展':v.activity.trim();
      if (!key) return '先告诉咨询台活动名称。';
      const traces=[],hits=[];
      for (const [i,line] of v.notices.split(/\r?\n/).entries()) {
        if (!line.trim()) continue;
        const parts=line.split(/[|｜]/).map(x=>x.trim());
        if(parts.length!==5 || parts.some(x=>!x)){traces.push('第 '+(i+1)+' 行字段不全，跳过');continue;}
        const [id,status,activity,field,value]=parts;
        if (!['日期','地点','票价'].includes(field)){traces.push(id+' 排除非公开服务字段');continue;}
        if (activity!==key || field!==v.field) continue;
        if(status!=='现行'){traces.push(id+' 排除非现行公告');continue;}
        traces.push(id+' 现行命中');hits.push([id,value]);
      }
      const values=new Set(hits.map(x=>x[1]));
      const result = !hits.length?'缺证，转现场确认':values.size>1?'现行公告冲突，转人工核对 '+hits.map(x=>x[0]).join('、'):hits[0][1]+' ['+hits.map(x=>x[0]).join('、')+']';
      return ['检索：'+key+' / '+v.field,...traces,'答复：'+result].join('\n');
    },
    world(v) {
      const quote=x=>JSON.stringify(String(x).replace(/[\x00-\x1f]/g,' '));
      const rows=v.notices.split(/\r?\n/).map(x=>x.split(/[|｜]/).map(s=>s.trim()))
        .filter(x=>x.length===5&&x.every(Boolean)&&x[1]==='现行'&&['日期','地点','票价'].includes(x[3]))
        .map(x=>'{'+[x[0],x[2],x[3],x[4]].map(quote).join(',')+'}').join(',\n');
      return `local public={${rows}}
local stations={{"纸桥展","日期"},{"摄影展","地点"},{"摄影展","地点"},{"纸桥展","票价"}}
registerClickEvent(function()
    local k=ask("巡检哪个展位？",{"纸桥展几号开放？","影展在哪？","旧通知说摄影展在西楼，核对现址","纸桥展票价多少？"})
    if not k then return end
    local wanted=stations[k]
    local answer=nil
    local refs={}
    local conflict=false
    for _,row in ipairs(public) do
        if row[2]==wanted[1] and row[3]==wanted[2] then
            table.insert(refs,row[1])
            if answer and answer~=row[4] then conflict=true end
            answer=row[4]
        end
    end
    if not answer or conflict then
        turnTo(0)
        if conflict then say("现行公告冲突，请到现场核对。",5) else say("未找到公开依据，请到现场确认。",5) end
    else
        turnTo(90)
        say(wanted[1].."的"..wanted[2].."："..answer.." ["..table.concat(refs,"、").."]",5)
    end
end)`;
    },
    checks:[{set:{},expect:'东楼展厅 [R2]'},{set:{activity:'纸桥展',field:'日期',notices:'R1|现行|纸桥展|日期|6月14日'},expect:'6月14日 [R1]'},{set:{field:'票价'},expect:'缺证，转现场确认'},{set:{notices:'R2|现行|摄影展|地点|东楼\nR5|现行|摄影展|地点|西楼'},expect:'现行公告冲突'}]
  },
  'g8-06': {
    goal:'导览员从活动名直接查教室，从卡色连续查两张表，遇到含糊输入先澄清。',
    product:'会分解问路任务的社团导航员',
    opening:'拿了一张绿卡，不知道社团名，向导该先读教室表还是活动名册？',
    prediction:'同一个目的地，点名纸桥社的三种问法会查几次表？拿绿卡的同学会查几次？',
    demonstration:'先排练“去哪参加纸桥社”，只换成“拿绿卡去哪”并比较调用次数。打开实际 Paracraft 的社团向导，点它选含糊询问，看它先停步追问；再给卡色，复核两次查询和朝向。',
    debrief:'运动方向能够说明它查过两张表吗？让同伴指着记录说出哪一步拿到社团名、哪一步拿到教室。',
    student:'做两份独立的映射表。自己写同义问句和无指代问句，运行排练得到轨迹。进入实际 Paracraft 点击向导，试清楚与含糊两种请求并保留首版。',
    revision:'同伴重复三种纸桥社问法和一次含糊请求，再递出绿卡。第二版只改绿卡对应的社团，复测原输入，检查绿卡路径和点名路径各自的结果。',
    fields:[{key:'roster',label:'名册 N1，每行 卡色=社团',value:'黄卡=纸桥社\n绿卡=星图社'},{key:'rooms',label:'教室 P1，每行 社团=教室',value:'纸桥社=东楼201\n星图社=西楼202'},{key:'query',label:'来访者原话',value:'拿绿卡去哪？'}],
    run(v) {
      const table=text=>text.split(/\r?\n/).map(x=>x.split(/[=＝]/).map(s=>s.trim())).filter(x=>x.length===2&&x.every(Boolean));
      const roster=table(v.roster),rooms=table(v.rooms);
      const q=v.query.trim(),trace=[];
      const named=[...new Set(rooms.map(row=>row[0]).filter(n=>q.includes(n)))];
      const cards=[...new Set(roster.map(row=>row[0]).filter(n=>q.includes(n)))];
      let name=named[0];
      if (named.length+cards.length!==1) return '停步追问：请说出一个社团名或一种卡色。';
      if(cards.length) {
        const names=[...new Set(roster.filter(row=>row[0]===cards[0]).map(row=>row[1]))];
        if(names.length!==1)return 'N1 名册冲突，停步请老师核对。';
        name=names[0]; trace.push('调用 N1：'+cards[0]+' → '+name);
      }
      const matches=[...new Set(rooms.filter(row=>row[0]===name).map(row=>row[1]))];
      if(matches.length!==1)return [...trace,'P1 '+(matches.length?'地点冲突':'没有该社团的教室')+'，原地等候人工确认。'].join('\n');
      trace.push('调用 P1：'+name+' → '+matches[0]);
      return [...trace,'共 '+trace.length+' 次查表，带路到 '+matches[0]].join('\n');
    },
    world(v) {
      const parse=text=>text.split(/\r?\n/).map(x=>x.split(/[=＝]/).map(s=>s.trim())).filter(x=>x.length===2&&x.every(Boolean));
      const quote=x=>JSON.stringify(String(x).replace(/[\x00-\x1f]/g,' '));
      const lua=rows=>'{'+rows.map(row=>'{'+row.map(quote).join(',')+'}').join(',')+'}';
      return `local roster=${lua(parse(v.roster))}
local rooms=${lua(parse(v.rooms))}
local function find(rows,key)
    local result=nil
    for _,row in ipairs(rows) do
        if row[1]==key then
            if result and result~=row[2] then return nil end
            result=row[2]
        end
    end
    return result
end
registerClickEvent(function()
    local k=ask("向导收到哪种委托？",{"去哪参加纸桥社？","拿绿卡去哪？","那个地方在哪？","纸桥社地点是哪？","纸桥社在哪办？"})
    if not k then return end
    local name="纸桥社"
    if k==3 then
        turnTo(0)
        say("先停步。请告诉我一个社团名或一种卡色。",4)
        local clarified=ask("访客补充线索",{"绿卡","纸桥社","还不知道"})
        if not clarified or clarified==3 then return end
        if clarified==1 then k=2 end
    end
    if k==2 then
        name=find(roster,"绿卡")
        if not name then say("N1 无唯一结果，请老师核对。",4) return end
        say("先查 N1，绿卡登记为"..name,3)
    end
    local room=find(rooms,name)
    if not room then turnTo(0) say("P1 无唯一地点，原地等候。",4) return end
    if string.find(room,"西",1,true) then turnTo(270) elseif string.find(room,"东",1,true) then turnTo(90) end
    say("查 P1："..name.." → "..room,4)
end)`;
    },
    checks:[{set:{},expect:'共 2 次查表，带路到 西楼202'},{set:{query:'去哪参加纸桥社？'},expect:'共 1 次查表，带路到 东楼201'},{set:{query:'那个地方在哪？'},expect:'停步追问'},{set:{roster:'绿卡=纸桥社'},expect:'共 2 次查表，带路到 东楼201'},{set:{rooms:'纸桥社=东楼201'},expect:'没有该社团的教室'}]
  }
};
