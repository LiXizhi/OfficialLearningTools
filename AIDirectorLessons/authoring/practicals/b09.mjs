export default {
  'g8-07': {
    goal:'固定六道题和判据，分别找出修复、退步与持平的题号。',
    product:'借伞助手逐题回归比较器',
    opening:'一版改好了还伞地点，却开始自己定借伞数量，你会给它上线吗？',
    prediction:'两版通过数会怎样变？先写一个你最不愿看到的退步。',
    demonstration:'用默认三道调优题跑两轮。封存规则后请评测员开启封存夹，使用同样的两版原话重算。只改变 V2 的一行，用原六题检验回归标签。',
    debrief:'哪一题从有据漏答变为有据答对？哪一题把没有规定的数量说成确定答案？',
    student:'先保留调优阶段的三个回答；在新对话中让两版分别作答并记原话。规则封版后才由评测员打开保管的三题，分别跑两版。比较器在本地按约定短答核对，不会向模型发送封存夹。',
    revision:'评测员锁定同一组问题，对照两次结果，把退步题的原话改为有依据的回答；保留两版并说明新增的拒答是否有依据。',
    fields:[
      {key:'stage',label:'评测阶段',options:['只跑三道调优题','规则已封版，由评测员加测三题']},
      {key:'old',label:'旧版调优短答（T1 借处、T2 还处、T3 押金，每行一答）',value:'东厅\n未说明\n未说明'},
      {key:'next',label:'新版调优短答（同序；无法从公告得知就填“未说明”）',value:'东厅\n西厅\n未说明'},
      {key:'extra',label:'封版后由评测员录入旧答｜新答（每行一题；留空用课堂固定输出）',value:''}
    ],
    run(v){
      const rows=s=>String(s||'').trim().split(/\r?\n/).map(x=>x.trim());
      const a=rows(v.old),b=rows(v.next);
      if(a.length!==3||b.length!==3||a.includes('')||b.includes('')) return '调优夹需要两份各三行的短答，缺行不能计分。';
      const truth=['东厅','西厅',null], ids=['T1','T2','T3'];
      if(v.stage==='规则已封版，由评测员加测三题'){
        const pairs=rows(v.extra?.trim()||'暂停｜暂停\n未说明｜未说明\n未说明｜两把').map(x=>x.split(/[|｜]/).map(y=>y.trim()));
        if(pairs.length!==3||pairs.some(x=>x.length!==2||x.some(y=>!y))) return '封存夹需要三行“旧答｜新答”，请评测员核对。';
        truth.push('暂停',null,null);ids.push('R1 周五借伞','R2 电话','R3 数量');
        pairs.forEach(([old,next])=>{a.push(old);b.push(next);});
      }
      const score=(s,t)=>{
        if(!t) return s==='未说明'?'合理拒答':'无据编造';
        if(s===t) return '有据答对';
        return s==='未说明'?'有据漏答':'与公告原文不符';
      };
      const passed=x=>['合理拒答','有据答对'].includes(x);
      let before=0,after=0;
      const lines=ids.map((id,i)=>{
        const old=score(a[i],truth[i]),next=score(b[i],truth[i]);
        before+=Number(passed(old));after+=Number(passed(next));
        const change=passed(old)===passed(next)?'通过状态持平':passed(next)?'改善':'退步';
        return id+'：'+a[i]+'（'+old+'）→ '+b[i]+'（'+next+'），'+change;
      });
      return [ids.length===3?'调优阶段，封存夹未参与。':'封版重测，含三道封存题。','固定短答逐字核对，实际同义长答须人工复判。',...lines,'通过：'+before+'/'+ids.length+' → '+after+'/'+ids.length].join('\n');
    },
    checks:[
      {set:{},expect:'通过：2/3 → 3/3'},
      {set:{stage:'规则已封版，由评测员加测三题'},expect:'R3 数量：未说明（合理拒答）→ 两把（无据编造），退步'},
      {set:{stage:'规则已封版，由评测员加测三题',extra:'暂停｜暂停\n未说明｜未说明\n未说明｜未说明'},expect:'通过：5/6 → 6/6'},
      {set:{next:'东厅'},expect:'缺行不能计分'}
    ]
  },
  'g8-08':{
    goal:'访客提出同一个问题，能在公告在架时找到原文，撤牌后能独自到达值班点。',
    product:'能撤牌、能带路的借物咨询台',
    opening:'公告栏已经空了，机器人还能领人去西厅还伞吗？',
    prediction:'撤下 A2 时，哪一句回答、哪一条路线应一起变化？',
    demonstration:'先在浏览器排练还伞题，再打开 Paracraft，依照本课路线在角色两侧摆公告牌与黄色值班牌。拉杆开启 NPC，选择还伞，跟到 A2；在角色菜单撤牌并在现场撤下对应 A2 标志，重问同题，跟到值班点。',
    debrief:'哪次运行真的有还伞依据？只改答案却仍朝原方向走，访客会在哪一步迷路？',
    student:'先用在架开关排练，写一句可跟随的人工转接指引；在 Paracraft 空白世界打开生成的角色，按它的两个转向设置两处标志，用相同问题试跑两种路线。',
    revision:'让不熟悉场景的同伴从同一入口先问还伞，再撤牌重问，记录他跟到哪块牌。只改人工点标志文字，恢复起点再试一次。',
    fields:[
      {key:'shelf',label:'A2 当前状态',options:['在架','撤下']},
      {key:'question',label:'当前访客请求',options:['哪里还伞？','在哪里借伞？','可以借几天？','上一位借伞人叫什么？']},
      {key:'desk',label:'人工点醒目标志（写在实际值班牌上）',value:'黄旗旁的值班桌'},
      {key:'location',label:'A2 公告中的归还点',value:'西厅'}
    ],
    run(v){
      const desk=String(v.desk||'').trim(),place=String(v.location||'').trim();
      const ready=v.shelf==='在架'&&place!=='';
      if(v.question==='在哪里借伞？') return '命中 A1：借伞在东厅。\n行动：沿蓝线跟到公告栏，核对 A1 原文。';
      if(v.question==='哪里还伞？'&&ready) return '命中 A2：还伞在'+place+'。\n行动：沿蓝线跟到公告栏，核对 A2 原文。';
      const reason=v.question==='上一位借伞人叫什么？'?'涉及他人隐私，不提供身份。':v.question==='哪里还伞？'?'A2 缺少在架依据。':'公告未说明此事。';
      return reason+'\n'+(desk?'行动：沿黄线到'+desk+'，咨询公开流程。':'人工点标志空白：停在入口，请补上可辨认的指引。');
    },
    world(v){
      const q=x=>JSON.stringify(String(x||'').trim().replace(/[\u0000-\u001f]/g,' '));
      return `local onShelf = ${v.shelf==='在架'?'true':'false'}
local place = ${q(v.location)}
local desk = ${q(v.desk)}
local busy = false
setActorValue("sentientRadius", 0)
registerClickEvent(function()
    if busy then return end
    busy = true
    local n = ask("访客到达入口", {"哪里还伞？","在哪里借伞？","可以借几天？","上一位借伞人叫什么？","切换 A2 在架状态"})
    if n == 5 then
        onShelf = not onShelf
        if onShelf then say("A2 已在架，请同步放回实体公告牌。", 3)
        else say("A2 已撤下，请同步移走实体公告牌。", 3) end
    elseif n and n >= 1 and n <= 4 then
        local known = n == 2 or (n == 1 and onShelf and place ~= "")
        if known then
            turnTo(90)
            if n == 2 then say("请跟我到公告栏核对 A1：在东厅借伞。", 3)
            else say("请跟我到公告栏核对 A2：在" .. place .. "还伞。", 3) end
        else
            turnTo(-90)
            if n == 4 then say("不提供他人身份。", 2)
            else say("公告没有可引用的依据。", 2) end
            if desk ~= "" then say("请跟我到" .. desk .. "，咨询公开流程。", 3) end
        end
        if known or desk ~= "" then
            walkForward(2, 1)
            say("请在此核对，再独立复走一次。", 3)
            walkForward(-2, 1)
        else say("人工点标志空白，先在入口等老师。", 3) end
    end
    busy = false
end)`;
    },
    checks:[
      {set:{location:'北廊'},expect:'命中 A2：还伞在北廊'},
      {set:{shelf:'撤下'},expect:'沿黄线到黄旗旁的值班桌'},
      {set:{question:'上一位借伞人叫什么？',desk:''},expect:'人工点标志空白'},
      {set:{shelf:'撤下',question:'在哪里借伞？'},expect:'命中 A1'}
    ]
  },
  'g9-01':{
    goal:'设计员能把两句访谈证据追回对应的原话，找到需要再向本人核实的推测。',
    product:'可以回到原话的访谈核对卡',
    opening:'“他想看楼层”与“他想装摄像头”，哪句能追回受访者说过的话？',
    prediction:'把“先知道在哪一层”换成“愿意刷脸”，证据卡会把它放到哪里？',
    demonstration:'先用两行虚构原话生成卡，再只改摘录的一个词，检查是否还有逐字依据。把许可改为不同意，核对输出不再呈现摘录。',
    debrief:'逐字命中能证明引用准确；为什么推测的意思还要由受访者核对？',
    student:'用示例或自愿匿名、获准的小组材料逐行录入。选择两句短摘录，写自己的需求推测，把可追到原话的证据和待本人核实的推测分别交给同伴。',
    revision:'请同伴用卡上的编号找回原句，再邀请本人校正推测。只换使用场景做一次复访，原话与更正各留一版。',
    fields:[
      {key:'permit',label:'素材权限',options:['使用虚构演练记录','受访者同意匿名摘录并给本组核对','未获得摘录许可']},
      {key:'source',label:'匿名原话，每行一句（练习默认使用虚构材料）',value:'课间只有十分钟，我想先知道失物放在哪一层。\n放学时人多，我更想先知道服务台现在开不开。'},
      {key:'quotes',label:'拟摘录的原文片段，每行一条',value:'失物放在哪一层\n服务台现在开不开'},
      {key:'idea',label:'开发者的需求推测',value:'课间先显示失物楼层；放学时先显示服务台状态。'},
      {key:'feedback',label:'本人校正的原话（仅获准后记录，演练可留空）',value:''}
    ],
    run(v){
      if(v.permit==='未获得摘录许可') return '停止摘录。清除输入中的真实材料后换用虚构记录；不生成含访谈内容的卡片。';
      const source=String(v.source||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      const excerpts=String(v.quotes||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
      if(!source.length||!excerpts.length) return '缺少原话或摘录，无法建立引用。';
      const lines=excerpts.map(ex=>{
        const refs=source.flatMap((s,i)=>s.includes(ex)?['Q'+(i+1)]:[]);
        if(!refs.length) return '待重查：“'+ex+'”没有逐字依据。';
        if(refs.length>1) return '需消歧：“'+ex+'”可见于 '+refs.join('、')+'，请增加上下文。';
        return refs[0]+' 可追回：“'+ex+'”';
      });
      return [v.permit,...lines,'设计者推测：'+(String(v.idea||'').trim()||'尚未提出'),'本人校正：'+(String(v.feedback||'').trim()||'待核实')].join('\n');
    },
    checks:[
      {set:{},expect:'Q2 可追回：“服务台现在开不开”'},
      {set:{quotes:'愿意刷脸'},expect:'没有逐字依据'},
      {set:{source:'先问老师\n先问值班员',quotes:'先问'},expect:'可见于 Q1、Q2'},
      {set:{permit:'未获得摘录许可'},expect:'停止摘录'}
    ]
  },
  'g9-02':{
    goal:'在四课时预算下保住数据、查询和验收闭环，并能解释为何砍掉某项。',
    product:'能检查工时与依赖的 MVP 排期板',
    opening:'把地图做好却没有时间让同伴试一次，这个版本能验收吗？',
    prediction:'八课时能排哪些任务？如果明天只给四课时，哪张卡必须留下？',
    demonstration:'投屏默认八课时计划，保留任务顺序、仅把预算改成四，找超支的课时；删 D、E 后重跑。再把 B 移到 A 前，看相同总时数下能否验收。',
    debrief:'哪一行说明预算够了仍可能无法开工？C 占用的一格换来了什么证据？',
    student:'从访谈确认的场景写出验收动作。用字母把任务排成执行顺序，运行查看账单、超支和缺少的依赖。只有通过核心闭环才能交给同伴演示。',
    revision:'同伴抽走四格工期，保留第一次排期，仅移动或移除可选任务。交给另一位同伴读出还能交付什么、哪一步负责验收。',
    fields:[
      {key:'budget',label:'可用课时（正整数）',value:'8'},
      {key:'plan',label:'单人执行顺序（A 数据1，B 查询2，C 验收1，D 地图2，E 开放时间2，F 动画3）',value:'A B C D E'},
      {key:'accept',label:'验收员实际要试的动作',value:'查蓝杯应见二楼，再查未登记的水壶应能重新查询。'}
    ],
    run(v){
      const costs={A:1,B:2,C:1,D:2,E:2,F:3};
      const names={A:'整理三条数据',B:'查询与未知反馈',C:'同伴验收',D:'楼层地图',E:'开放时间',F:'动画导览'};
      const budget=Number(v.budget);
      if(!Number.isSafeInteger(budget)||budget<1) return '预算须为正整数课时。';
      const ids=String(v.plan||'').toUpperCase().trim().split(/[\s,，、]+/).filter(Boolean);
      if(!ids.length) return '排期为空，请加入任务。';
      if(ids.some(x=>!Object.hasOwn(costs,x))) return '无法识别任务：'+ids.filter(x=>!Object.hasOwn(costs,x)).join('、');
      if(new Set(ids).size!==ids.length) return '存在重复任务，请检查后再合计。';
      let total=0;const issues=[];
      const lines=ids.map((x,i)=>{
        const start=total+1;total+=costs[x];
        const req=x==='B'?['A']:x==='C'?['A','B']:[];
        for(const r of req) if(!ids.slice(0,i).includes(r))issues.push(x+' 开始前缺 '+r);
        return '第 '+start+'–'+total+' 课时 '+x+' '+names[x];
      });
      for(const r of ['A','B','C']) if(!ids.includes(r))issues.push('核心闭环缺 '+r);
      if(total>budget)issues.push('超支 '+(total-budget)+' 课时');
      if(!String(v.accept||'').trim())issues.push('验收动作为空');
      return [...lines,'总工时 '+total+' / 预算 '+budget,issues.length?issues.join('；'):'可按序演示并验收，余 '+(budget-total)+' 课时。','演示动作：'+(String(v.accept||'').trim()||'待补')].join('\n');
    },
    checks:[
      {set:{},expect:'总工时 8 / 预算 8'},
      {set:{budget:'4'},expect:'超支 4 课时'},
      {set:{plan:'A B C',budget:'4'},expect:'可按序演示并验收，余 0'},
      {set:{plan:'B A C'},expect:'B 开始前缺 A'},
      {set:{budget:''},expect:'预算须为正整数'}
    ]
  },
  'g9-03':{
    goal:'用五行观测得到可复核的准确率、点击上限、隐私和独立操作结论。',
    product:'初次使用者的三分钟验收计分票',
    opening:'五个答案全对，但有一行先索取手机号，项目能通过吗？',
    prediction:'第四题多点一次，只会改变哪一栏？再加入“无人指导”会多看哪项证据？',
    demonstration:'运行首轮五行记录，展示每一项门槛；只把 U4 的点击数从 3 改 4，复算。再保持行为不动切到初次独立使用，尝试登记一行获提示。',
    debrief:'有几题正确、最大点击发生在哪一行？哪个条件能独立否决通过？',
    student:'请同伴从首页逐题操作，用观察到的动作填票，记实际用时。先练给定五行，再以实际测得的记录制作自己的票。',
    revision:'让第二位观察员独立计数，出现分歧先改口径再用原记录复判；修改首页一处提示后，请新手在无人讲解的条件下复测五题。',
    fields:[
      {key:'records',label:'U1–U5 各一行：对或错，点击数，无隐私或涉隐私，自助或获提示',value:'对，2，无隐私，自助\n对，2，无隐私，自助\n错，3，无隐私，自助\n对，3，无隐私，自助\n对，2，无隐私，自助'},
      {key:'scenario',label:'操作条件',options:['首轮允许口头解释','初次使用，必须独立操作']},
      {key:'seconds',label:'本轮五题总用时（秒；默认 150 是演练计时）',value:'150'}
    ],
    run(v){
      const raw=String(v.records||'').trim().split(/\r?\n/);
      if(raw.length!==5)return '须有 U1 至 U5 五条观察，缺少或多出的行不计分。';
      let correct=0,max=0;const over=[],privateRows=[],help=[];
      for(const [i,line] of raw.entries()){
        const a=line.split(/[,，]/).map(s=>s.trim());
        if(a.length!==4||!['对','错'].includes(a[0])||!/^\d+$/.test(a[1])||!Number.isSafeInteger(Number(a[1]))||!['无隐私','涉隐私'].includes(a[2])||!['自助','获提示'].includes(a[3])) return 'U'+(i+1)+' 格式不完整，请回看原记录。';
        const n=Number(a[1]);max=Math.max(n,max);if(n>3)over.push('U'+(i+1));
        if(a[0]==='对')correct++;if(a[2]==='涉隐私')privateRows.push('U'+(i+1));if(a[3]==='获提示')help.push('U'+(i+1));
      }
      const secs=Number(v.seconds);
      if(!String(v.seconds||'').trim()||!Number.isFinite(secs)||secs<=0)return '请补实际计时（正秒数），暂不签结论。';
      const independent=v.scenario==='初次使用，必须独立操作';
      const ok=correct>=4&&!over.length&&!privateRows.length&&secs<=180&&(!independent||!help.length);
      return ['准确性 '+correct+'/5（门槛 4/5）','最大点击 '+max+'；超限行：'+(over.join('、')||'无'),'隐私异常：'+(privateRows.join('、')||'无'),'获提示行：'+(help.join('、')||'无')+'；'+(independent?'独立操作纳入验收':'首轮仅记录'),'五题 '+secs+' 秒，'+(secs<=180?'三分钟内完成':'超时'),'总验收：'+(ok?'通过':'不通过')].join('\n');
    },
    checks:[
      {set:{},expect:'总验收：通过'},
      {set:{records:'对，2，无隐私，自助\n对，2，无隐私，自助\n错，3，无隐私，自助\n对，4，无隐私，自助\n对，2，无隐私，自助'},expect:'超限行：U4'},
      {set:{records:'对，2，无隐私，自助\n对，2，无隐私，自助\n对，3，无隐私，自助\n对，3，无隐私，自助\n对，2，涉隐私，自助'},expect:'隐私异常：U5'},
      {set:{records:''},expect:'须有 U1 至 U5 五条观察'}
    ]
  }
};
