export default {
  'g6-07': {
    goal:'让同伴删除虚构身份栏，逐条证实人数服务照常分流，并在读数缺失时转人工。',
    product:'只数人数的走廊分流器',
    opening:'我们只想知道走廊挤不挤。把圆圈和三角两张身份卡拿走，灯还知道该怎么亮吗？',
    prediction:'预测人数7、8和空白分别收到什么指引；删掉符号后，哪一条指引会变化？',
    demonstration:'先投屏排练三张练习卡，保留虚构符号并运行，再只切换为删除身份栏。进入实际 Paracraft，点连廊值班机器人，依次送三张卡，核对转向和台词。请大家找出实现这项服务需要的最少字段。',
    debrief:'数到8为何已经要等候？删身份栏前后哪些输入记录改变了，哪些服务动作保持相同？',
    student:'制作自己的入口告知词和等候线，从7、8、空白三张卡开始；先在浏览器排练，再在真实 Paracraft 世界点机器人，观察同样三张卡的分流。保存第一版给参观者。',
    revision:'请参观者只读告知词试玩三个条件。删去身份栏、保留人数和阈值，重新送相同三张卡，比较是否仍知道去哪条线、何时找老师。',
    fields:[
      {key:'cards',label:'每行一张练习卡：人数｜虚构符号。人数空白表示未读到。',value:'7｜△\n8｜○\n｜◇'},
      {key:'policy',label:'输入卡的设计',options:['附虚构身份栏','删除身份栏']},
      {key:'limit',label:'从几人起亮橙灯（1至99）',value:'8'},
      {key:'queue',label:'队伍应到哪里等候？',value:'蓝色脚印线'}
    ],
    run(v){
      const limit = Number(v.limit), queue = v.queue.trim();
      if (!Number.isInteger(limit) || limit<1 || limit>99) return '请把阈值写成1至99的整数。';
      if (!queue) return '请给等候地点写一个能辨认的名称。';
      const rows=v.cards.split(/\r?\n/).filter(s=>s.trim());
      if (!rows.length) return '请先放入一张卡；输入“｜”可测试读数缺失。';
      return rows.map((row,i)=>{
        const [raw,symbol] = row.split(/[|｜]/).map(s=>s.trim());
        const fields=v.policy==='删除身份栏'?'仅人数':'人数＋虚构符号'+(symbol||'（空）');
        const response=!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)) ? '停步，请值班员确认读数'
          : Number(raw)>=limit?'橙灯 → 到'+queue+'等候':'绿灯 → 继续通行';
        return '卡'+(i+1)+'　输入字段：'+fields+'；人数：'+(raw||'空白')+'；'+response;
      }).join('\n');
    },
    world(v){
      const limit=Number(v.limit),queue=v.queue.trim();
      const literal=s=>JSON.stringify(String(s).replace(/[\u0000-\u001f]/g,' '));
      if (!Number.isInteger(limit) || limit<1 || limit>99 || !queue) return 'registerClickEvent(function() say("先写好阈值与等候地点。", 3) end)';
      const cards=v.cards.split(/\r?\n/).filter(s=>s.trim()).map(line=>line.split(/[|｜]/).map(s=>s.trim()));
      if (!cards.length) return 'registerClickEvent(function() say("还没有练习卡。", 3) end)';
      const counts=cards.map(([n])=>/^\d+$/.test(n)&&Number.isSafeInteger(Number(n)) ? Number(n) : -1);
      const labels=cards.map(([n,s],i)=>literal('卡'+(i+1)+' 人数：'+(n||'空白')+(v.policy==='附虚构身份栏'?'　符号：'+(s||'空') : '')));
      return `local counts={${counts.join(',')}}
local cards={${labels.join(',')}}
registerClickEvent(function()
    local k=ask("入口告知：只按当前人数分流。请选择模拟输入卡。",cards)
    if not k or not counts[k] then return end
    if counts[k]<0 then turnTo(0) say("读数待核，请值班员确认。",3)
    elseif counts[k]>=${limit} then turnTo(90) say(${literal('橙灯，请到'+queue+'等候。')},3)
    else turnTo(180) say("绿灯，请继续通行。",3) end
end)`;
    },
    checks:[{set:{},expect:'人数：8；橙灯 → 到蓝色脚印线等候'},{set:{policy:'删除身份栏',cards:'7｜△'},expect:'输入字段：仅人数；人数：7；绿灯'},{set:{cards:'｜◇'},expect:'停步，请值班员确认读数'},{set:{limit:'-1'},expect:'请把阈值写成1至99的整数'}]
  },
  'g6-08': {
    goal:'用同一组运动参数，解释两位展评员读数相差的秒数，并修改说明牌让他独立复现。',
    product:'六格巡游复现台',
    opening:'两位同学看的是同一段巡游，一人记3秒，一人记5秒。是谁多算了一段？',
    prediction:'从白线到蓝旗是六格，每秒两格。读牌用两秒，如果先按表才读牌，终点读数会多多少？',
    demonstration:'投屏固定距离、速度和读牌时间，先按越线计时，再只把起表设为读牌前。打开 Paracraft 点巡游角色，先试一次“越线起表”，再试“读牌前起表”；它走同一段路后报出课内模型读数。请同学分别报移动段和等待段。',
    debrief:'两版中角色何时真正开始走？若起表动作不明，哪两次读数就不能作同一比较？',
    student:'给展评员设计白线至蓝旗的路线和起表提示，输入距离和速度。在网页先查分段读数；打开真实 Paracraft 点角色两次，用两种起表动作复跑，保存自己的第一版。',
    revision:'让没有听过说明的展评员照牌复现，记录他何时按表。只改起表说明，用原来的距离、速度、读牌时间重跑，再比较读数。',
    fields:[
      {key:'distance',label:'路线长度（1至8格）',value:'6'},{key:'speed',label:'巡游速度（1至4格/秒）',value:'2'},
      {key:'pause',label:'读牌停留（0至5秒）',value:'2'},{key:'start',label:'说明牌写的起表动作',options:['角色越过白线时起表','读牌前起表']}
    ],
    run(v){
      const values=[v.distance,v.speed,v.pause], [d,s,p]=values.map(Number);
      if (values.some(s=>!s.trim()) || ![d,s,p].every(Number.isFinite) || d<1 || d>8 || s<1 || s>4 || p<0 || p>5) return '参数待核：路长1至8格、速度1至4格/秒、读牌0至5秒。';
      const fmt=x=>String(+x.toFixed(2));
      const move=d/s, included=v.start==='读牌前起表'?p:0;
      return ['说明牌：从白线到蓝旗，共'+d+'格；每秒'+s+'格。'+v.start+'，到蓝旗停表。',
        '时间线：读牌 '+p+' 秒 → 巡游 '+fmt(move)+' 秒 → 到旗。',
        '移动用时：'+fmt(move)+' 秒；模型表读数：'+fmt(included+move)+' 秒。',
        '表里额外计入的读牌时间：'+fmt(included)+' 秒。'].join('\n');
    },
    world(v){
      const raw=[v.distance,v.speed,v.pause], [d,s,p]=raw.map(Number);
      if (raw.some(x=>!x.trim()) || ![d,s,p].every(Number.isFinite) || d<1 || d>8 || s<1 || s>4 || p<0 || p>5) return 'registerClickEvent(function() say("路线参数超出展台范围，请重设。",3) end)';
      const move=+(d/s).toFixed(4), total=+(d/s+p).toFixed(2);
      const choice=v.start==='读牌前起表'?2:1;
      return `local busy=false
registerClickEvent(function()
    if busy then return end
    busy=true
    local k=ask("复现方式（说明牌采用第${choice}项）",{"越线起表","读牌前起表"})
    if k~=1 and k~=2 then busy=false return end
    say("请读牌，准备起跑。")
    wait(${p})
    turnTo(90)
    say("越过白线")
    walkForward(${d},${move})
    if k==1 then say("到蓝旗。模型表读数：${+(d/s).toFixed(2)}秒。",3)
    else say("到蓝旗。模型表读数：${total}秒，包含读牌。",3) end
    walkForward(-${d},${move})
    busy=false
end)`;
    },
    checks:[{set:{},expect:'模型表读数：3 秒'},{set:{start:'读牌前起表'},expect:'模型表读数：5 秒'},{set:{distance:'8'},expect:'移动用时：4 秒'},{set:{speed:'0'},expect:'参数待核'}]
  },
  'g7-01': {
    goal:'追踪同一问路请求经过五个环节的记录，定位最早的偏差，并做出可恢复的交互入口。',
    product:'校园问路台的五层诊断台',
    opening:'访客明明说“礼堂”，屏幕却报“地点未知”。我们应该先改按钮，还是先找哪一步听错了？',
    prediction:'如果风声只改动了转写文字，意图能否匹配？恢复同一句的文字输入后，路线会怎样？',
    demonstration:'投屏安静室内的完整轨迹，再只选风声场景，看哪一行先变。保持风声并切换文字入口重试。最后改强光，比较正确路线与看不清显示的区别。',
    debrief:'最早偏差发生在转写、意图匹配还是显示？你能指给同伴看哪一行是证据吗？',
    student:'写两个校园地名和各自路线，加入一个让外班同学容易听错的地名；制作两个输入入口，在三种模拟场景测试。为自己的地名建立可复查的五层记录。',
    revision:'请展台值日生用同一句话在风声和强光下找路；只改入口或显示，再用原句复测，保存成功的路线和仍然受阻的一步。',
    fields:[
      {key:'routes',label:'地点资料，每行：地名｜路线',value:'礼堂｜向东经过蓝门\n图书角｜沿走廊到第二间'},
      {key:'query',label:'访客实际想问的话',value:'礼堂在哪'},{key:'noisy',label:'有风时的模拟转写',value:'李糖在哪'},
      {key:'scene',label:'场景',options:['安静室内','户外风声','户外强光']},{key:'entry',label:'入口',options:['按麦克风','打字']},
      {key:'screen',label:'显示',options:['普通显示','高对比显示']}
    ],
    run(v){
      if (!v.query.trim()) return '先写访客的问题，才有一条可追踪的输入。';
      const routes = [];
      for (const line of v.routes.split(/\r?\n/).filter(x=>x.trim())) {
        const pair=line.split(/[|｜]/).map(x=>x.trim());
        if (pair.length!==2||pair.some(s=>!s)) return '资料行缺少地名或路线：'+line;
        routes.push(pair);
      }
      if (!routes.length) return '请填写至少一条可检索的地点资料。';
      const received=(v.scene==='户外风声'&&v.entry==='按麦克风'?v.noisy:v.query).trim();
      const hits=routes.filter(([place])=>received.includes(place));
      const route = hits.length===1 ? hits[0][1] : hits.length>1 ? '请确认具体地名' : '未定位，转人工问路';
      const readability=v.scene==='户外强光'&&v.screen==='普通显示'?'屏幕可读性待改善':'路线反馈可读';
      return ['① 场景：'+v.scene,'② 数据：访客原句“'+v.query+'”；接收到“'+received+'”。',
        '③ 算法：逐一匹配资料地名，命中 '+hits.length+' 条。',
        '④ 模型演示：用词表模拟地点意图；结果：'+(hits.map(r=>r[0]).join('、')||'未知')+'。',
        '⑤ 交互：'+v.entry+' → '+route+'；'+readability+'。',
        '最早可查的偏差：'+(received!==v.query.trim()?'转写文字变化':hits.length!==1?'地点资料匹配':readability==='屏幕可读性待改善'?'显示环节':'本次轨迹完整')+'。'].join('\n');
    },
    checks:[{set:{},expect:'向东经过蓝门；路线反馈可读'},{set:{scene:'户外风声'},expect:'最早可查的偏差：转写文字变化'},{set:{scene:'户外强光'},expect:'最早可查的偏差：显示环节'},{set:{query:'操场在哪'},expect:'未定位，转人工问路'}]
  },
  'g7-02': {
    goal:'从含错录和重复的原始表算出可追溯均值；改一项制造同键冲突后能找回两行证据。',
    product:'逐行可查的温室数据修理台',
    opening:'温室记录算出57.6℃。谁能指出哪些行进入了分母，为什么值日员想重算？',
    prediction:'剔除重复、空值与越界后，预期有几行参与平均？把重复行改成23℃会把哪两行送回核查？',
    demonstration:'投屏六行原表，运行时同时看两个均值和行号。只把第三行22改成23，再运行，核查同一时间两条冲突记录是否都移出清洁均值。',
    debrief:'为何同一设备同一时刻的不同读数都要保留原值？清洁均值的分母改变时，应随报告交出什么？',
    student:'录入温室模拟表并制作修理单，写下探头量程，逐行核对原始值、处理理由与均值。复制第一版后再尝试自己的设备和时间。',
    revision:'让下一班值日员把同一时刻的一条记录改成不同温度。调整输入或量程，重跑原六行和冲突行，把每次参与统计的行号交给他。',
    fields:[
      {key:'rows',label:'每行：设备｜时间｜读数，读数可带℃，空白保留',value:'A｜09:00｜20℃\nA｜09:10｜22℃\nA｜09:10｜22℃\nA｜09:20｜\nA｜09:30｜200℃\nA｜09:40｜24 ℃'},
      {key:'max',label:'探头量程上限（下限为0℃）',value:'50'}
    ],
    run(v){
      const upper=Number(v.max);
      if (!v.max.trim() || !Number.isFinite(upper) || upper<=0) return '量程上限需要一个大于零的数。';
      const groups=new Map(),rows=[],raw=[];
      v.rows.split(/\r?\n/).forEach((line,i)=>{
        if (!line.trim()) return;
        const parts=line.split(/[|｜]/).map(s=>s.trim()), name='R'+(i+1);
        const row={name,line,reason:'',value:null}; rows.push(row);
        if(parts.length!==3 || !parts[0] || !parts[1]) {row.reason='行格式待核';return;}
        const token=parts[2].replace(/\s*(?:℃|°C)$/i,'').trim();
        if (!token) {row.reason='缺失，不补零';return;}
        if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)||!Number.isFinite(Number(token))) {row.reason='无法解析，待核';return;}
        row.value=Number(token); raw.push(row.value);
        const key=JSON.stringify(parts.slice(0,2));
        if (!groups.has(key)) groups.set(key,[]);
        groups.get(key).push(row);
      });
      const used=[];
      for (const group of groups.values()){
        const conflict=new Set(group.map(r=>r.value)).size>1;
        group.forEach((r,i)=>{
          if(conflict) r.reason='同键异值，待复核（'+group.map(s=>s.name).join('、')+'）';
          else if(r.value<0 || r.value>upper) r.reason='越界，保留原值待核';
          else if(i) r.reason='重复，已保留'+group[0].name;
          else {r.reason='计入 '+r.value+'℃';used.push(r);}
        });
      }
      const mean=a=>a.length?(a.reduce((sum,n)=>sum+n,0)/a.length).toFixed(1)+'℃':'无可用读数';
      return ['原始均值：'+mean(raw)+'（'+raw.length+'条可解析读数）','清洁均值：'+mean(used.map(r=>r.value))+'；参与行：'+(used.map(r=>r.name).join('、')||'无'),
        ...rows.map(r=>r.name+' '+r.line+' → '+r.reason)].join('\n');
    },
    checks:[{set:{},expect:'清洁均值：22.0℃；参与行：R1、R2、R6'},{set:{},expect:'原始均值：57.6℃'},{set:{rows:'A｜09:10｜22\nA｜09:10｜23'},expect:'同键异值，待复核（R1、R2）'},{set:{rows:'B｜10:00｜'},expect:'清洁均值：无可用读数'}]
  },
  'g7-03': {
    goal:'在四张补样预算内给两种天气、两个角度分配路标卡，计算覆盖变化并和独立测试的证据分开。',
    product:'路标训练样本补拍预算板',
    opening:'八张路标照都来自晴天。再拍四张晴天正面，数量够多了，能回答阴天斜面的表现吗？',
    prediction:'把同样四张预算从晴正面移到阴正面和阴斜面，覆盖几格？测试结果会跟着自动提高吗？',
    demonstration:'先把预算4、0、0、0加入6、2、0、0，再只把预算分配改成0、0、2、2。投屏各格变化，另列每格两张旧测试卡的正确数；让大家分别指出已经测到的事实与待测项。',
    debrief:'从2/4到4/4是在数什么？哪一格旧模型测试全错？要检验新模型，需要谁在另一批卡上做什么？',
    student:'给虚构路标设计晴天/阴天、正面/斜面四格材料。填写原始计数，给四张补拍卡分配格子。独立测试卡始终留出；导出作品给下一组安排拍摄。',
    revision:'请组员用全投一格的方案试一次。只重新分配补拍预算，保持旧数据和测试卡不变，请他重算覆盖，并指出新模型尚未测试的指标。',
    fields:[
      {key:'base',label:'原训练数量：晴正、晴斜、阴正、阴斜',value:'6，2，0，0'},
      {key:'add',label:'补拍分配：四格合计最多4张',value:'4，0，0，0'},
      {key:'correct',label:'旧模型独立测试正确数：每格共2张',value:'2，1，1，0'}
    ],
    run(v){
      const parse=s=>{
        const tokens=s.trim().split(/[,，、\s]+/u);
        return tokens.length===4 && tokens.every(t=>/^\d+$/.test(t) && Number.isSafeInteger(Number(t)))?tokens.map(Number):null;
      };
      const base=parse(v.base),add=parse(v.add),correct=parse(v.correct);
      if (!base||!add||!correct) return '请输入四个非负整数，依次对应晴正、晴斜、阴正、阴斜。';
      const spent=add.reduce((a,b)=>a+b,0);
      if (spent>4) return '预算超出 '+(spent-4)+' 张；请重新分配。';
      if (correct.some(n=>n>2)) return '每格只有2张独立测试卡，正确数不能超过2。';
      const labels=['晴正','晴斜','阴正','阴斜'],after=base.map((n,i)=>n+add[i]),coverage=a=>a.filter(n=>n>0).length;
      return ['已安排 '+spent+' 张，剩余 '+(4-spent)+' 张。',
        ...labels.map((s,i)=>s+'：训练 '+base[i]+' → '+after[i]+' 张；旧模型独立测试 '+correct[i]+'/2。'),
        '训练覆盖：'+coverage(base)+'/4 → '+coverage(after)+'/4；仍空的格：'+(labels.filter((_,i)=>after[i]===0).join('、')||'无')+'。',
        '旧模型测试：'+correct.reduce((a,b)=>a+b,0)+'/8；补拍后新模型：尚未测试。'].join('\n');
    },
    checks:[{set:{},expect:'训练覆盖：2/4 → 2/4'},{set:{add:'0 0 2 2'},expect:'训练覆盖：2/4 → 4/4；仍空的格：无'},{set:{add:'0 2 2 2'},expect:'预算超出 2 张'},{set:{correct:'2 1 3 0'},expect:'正确数不能超过2'}]
  }
};
