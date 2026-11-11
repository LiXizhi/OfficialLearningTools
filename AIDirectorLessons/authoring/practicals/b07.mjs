export default {
  'g7-04': {
    goal:'给同一张路标卡分别跑手写规则和最近邻，指出哪一条训练记录改变了转向。',
    product:'可调训练样本的丁字路口双引路员',
    opening:'同一块红牌从中间挪到右边一格，两位引路员还会指向同一边吗？',
    prediction:'红牌在中心时两者都右转；挪一格后，先算它到两张训练卡各有几格，再猜引路员的动作。',
    demonstration:'先运行中心红牌，再只改横距为1，投屏两种判断的依据。在 Paracraft 打开搭好的世界，点角色选择中心和偏移卡，观察实际朝向。把第二个训练动作改成直行，再比较同一偏移卡的结果。',
    debrief:'两条最近的红牌样本距离同为1，标签一致和标签冲突时，机器人凭什么行动或暂停？',
    student:'在浏览器排练同一路口的两位引路员。编辑一条训练卡，保留颜色、横距和动作三列，再打开 Paracraft 建景、开拉杆点角色验证。导出首版连同你的两次路线预测。',
    revision:'让同伴选一张偏移卡，在纸上先算距离，再按按钮。只修改一项训练标签，拿同一张卡重测，再用蓝牌检查未见类别是否停步。',
    fields:[
      {key:'training',label:'训练卡，每行写 颜色 横距 动作',value:'红 0 右转\n红 2 右转\n无 0 直行'},
      {key:'color',label:'测试标志',options:['红','蓝','无']},
      {key:'offset',label:'测试标志的横距（整数格）',value:'0'}
    ],
    run(v){
      const lines=String(v.training??'').trim().split(/\n/);
      const examples=[];
      for(const [i,line] of lines.entries()){
        const a=line.trim().split(/\s+/);
        if(a.length!==3 || !['红','蓝','无'].includes(a[0]) || !/^-?\d{1,2}$/.test(a[1]) || !['直行','右转'].includes(a[2])) return '训练卡第'+(i+1)+'行格式有误：示例“红 2 右转”。';
        examples.push({color:a[0],x:Number(a[1]),action:a[2]});
      }
      if(!['红','蓝','无'].includes(v.color) || !/^-?\d{1,2}$/.test(String(v.offset).trim()))return '输入未知：请选择标志，并填入两位以内的整数横距。';
      const x=Number(v.offset);
      const rule=(v.color==='红' && x===0)?'右转':'直行';
      const group=examples.filter(s=>s.color===v.color);
      if(!group.length)return '手写规则：'+rule+'\n近邻：无同色训练卡，停步询问。';
      const distance=Math.min(...group.map(s=>Math.abs(s.x-x)));
      const ties=group.filter(s=>Math.abs(s.x-x)===distance);
      const labels=new Set(ties.map(s=>s.action));
      return '手写规则：'+rule+'\n最近距离：'+distance+'格\n同距训练卡：'+ties.map(s=>s.color+'@'+s.x+'→'+s.action).join('、')+'\n近邻：'+(labels.size===1?ties[0].action:'标签冲突，停步询问');
    },
    world(v){
      const lines=String(v.training??'').trim().split(/\n/).map(l=>l.trim().split(/\s+/));
      if(lines.some(a=>a.length!==3||!['红','蓝','无'].includes(a[0])||!/^[-]?\d{1,2}$/.test(a[1])||!['直行','右转'].includes(a[2])))return 'registerClickEvent(function() say("请先修正训练卡。",3) end)';
      const training=lines.map(([c,x,a])=>'{'+JSON.stringify(c)+','+Number(x)+','+JSON.stringify(a)+'}').join(',');
      const x=Number(v.offset);
      if(!Number.isInteger(x)||!String(v.offset??'').trim()||!['红','蓝','无'].includes(v.color))return 'registerClickEvent(function() say("请填写测试标志与整数横距。",3) end)';
      return `local examples={${training}}
registerClickEvent(function()
  local test=ask("模拟路标输入",{"中心红牌","偏移一格的红牌","本次自选卡"})
  if not test then return end
  local c,x="红",0
  if test==2 then x=1 elseif test==3 then c=${JSON.stringify(v.color)}; x=${x} end
  local mode=ask("用哪种判断？",{"固定规则","同色最近邻"})
  if not mode then return end
  local action="直行"
  if mode==1 then
    if c=="红" and x==0 then action="右转" end
  else
    local best=999
    action="停步询问"
    for _,e in ipairs(examples) do
      if e[1]==c then
        local d=math.abs(e[2]-x)
        if d<best then best=d; action=e[3]
        elseif d==best and action~=e[3] then action="标签冲突，停步询问" end
      end
    end
  end
  turnTo(0)
  say(action,2)
  if action=="右转" then turnTo(90) elseif action~="直行" then return end
  walkForward(1,0.8); walkForward(-1,0.8)
end)`;
    },
    checks:[
      {set:{},expect:'手写规则：右转'},
      {set:{offset:'1'},expect:'同距训练卡：红@0→右转、红@2→右转'},
      {set:{offset:'1',training:'红 0 右转\n红 2 直行'},expect:'标签冲突，停步询问'},
      {set:{color:'蓝'},expect:'无同色训练卡'}
    ]
  },
  'g7-05': {
    sealed:true,
    goal:'冻结只见过8条训练单的规则，用4张封存卡算出独立成绩，再定位原题泄漏导致的分数变化。',
    product:'校园服务工单的封存评测器',
    opening:'看过答案后能把原题都分对。这个成绩还能回答“下一张新工单能否分对”吗？',
    prediction:'按训练夹写的规则，含指定线索才报修，其余预约。预测两条误判若进入记忆表，哪类得分会升高。',
    demonstration:'先投屏8条训练单，编辑并冻结报修线索。运行本地评测器才打开封存袋，抄下四个预测和命中数；保持线索不变，只改为记忆两张错单后复测，再核对额外新单。',
    debrief:'两次测试的分母相同，哪些编号在第二次已经见过？增分是否来自一条可用于新问法的规则？',
    student:'只读训练夹：报修为修椅脚、补窗帘、修书架、补球网；预约为借棋盘、留空教室、订画架、借展板。先把冻结的关键词写在纸上签封，把鼠标交给同伴运行首测，再导出这份首版。封存题在本地程序打分，训练对话只讨论方法。',
    revision:'请另一个小组运行冻结版，记下四个预测。保持词表原样，只切换污染开关并用原四题重测，拿额外新单分辨背题与泛化。见过本袋后修改的规则，应用新的独立题组验收。',
    fields:[{key:'words',label:'冻结前的报修线索，用空格分隔；其余请求归预约',value:'修 补'},{key:'mode',label:'本地评测方式',options:['独立封袋','污染演示：把10、11加入记忆']}],
    run(v){
      const words=[...new Set(String(v.words??'').trim().split(/\s+/).filter(Boolean))];
      if(!words.length)return '规则尚未冻结：请根据8条训练单写至少一个线索。';
      if(!['独立封袋','污染演示：把10、11加入记忆'].includes(v.mode))return '评测方式未知，请选择独立或污染演示。';
      const rows=[['09','修推车','报修'],['10','水龙头滴水','报修'],['11','门把手松了','报修'],['12','借计时器','预约']];
      const memorized=v.mode.startsWith('污染')?new Set(['10','11']):new Set();
      const predict=text=>words.some(w=>text.includes(w))?'报修':'预约';
      let hits=0;
      const trace=rows.map(([id,text,truth])=>{
        const remembered=memorized.has(id),answer=remembered?truth:predict(text);
        if(answer===truth)hits++;
        return id+' '+text+' → '+answer+'；真值'+truth+'；'+(remembered?'查记忆':'按词表')+'；'+(answer===truth?'命中':'误判');
      });
      return '冻结词表：'+words.join('、')+'\n'+trace.join('\n')+'\n'+(memorized.size?'污染得分':'独立得分')+'：'+hits+'/4＝'+hits*25+'%\n同袋已见题：'+memorized.size+'道\n额外新题13 椅背摇晃 → '+predict('椅背摇晃')+'（真值报修，不计入四题分数）';
    },
    checks:[{set:{},expect:'独立得分：2/4＝50%'},{set:{mode:'污染演示：把10、11加入记忆'},expect:'污染得分：4/4＝100%'},{set:{words:''},expect:'规则尚未冻结'},{set:{words:'借'},expect:'独立得分：0/4＝0%'}]
  },
  'g7-06': {
    goal:'按同一组访客逐卡计算通行受阻和额外格数，解释为什么相同命中数对应不同后果。',
    product:'看得见绕行与受阻的路线评审台',
    opening:'两位向导都答对九次。有一位向导让推车停在台阶口，你能从总分发现是哪一位吗？',
    prediction:'把唯一的错误从推车卡换到赶时间卡，预测总分、受阻次数、额外格数中哪些会变。',
    demonstration:'设短路6格、坡道10格，比较甲乙的十张卡。只换策略，再点空白卡试访客追问。在真实 Paracraft 世界开拉杆，点导览角色，分别模拟赶时间和推车需求，观察何时角色停步。',
    debrief:'1次受阻和多走4格分别发生在哪张卡？空白卡需要知道的是路线要求还是个人身份？',
    student:'在浏览器路线评审台排练，把坡道长度改成你设计的校园格图距离。保留两种误判计数。进入实际 Paracraft 搭两条示意路线，点角色试两类卡和空白卡后导出首版。',
    revision:'同伴先用“推车”卡，再出示空白卡并回答需要无台阶。只把默认短线换为先追问，比较两版停点；最后试拒绝回答，应留在原地。',
    fields:[{key:'ramp',label:'缓坡格数（短线固定6格，请填7至30）',value:'10'},{key:'policy',label:'十张卡的分类策略',options:['甲：错一张推车卡','乙：错一张赶时间卡']},{key:'empty',label:'空白卡默认分支',options:['直接选短线','先询问通行需求']},{key:'reply',label:'模拟访客答复',options:['需要无台阶','可走台阶','暂不说明']}],
    run(v){
      const ramp=Number(v.ramp);
      if(!Number.isInteger(ramp)||ramp<7||ramp>30)return '缓坡地图未就绪：输入7至30的整数格。';
      if(!['甲：错一张推车卡','乙：错一张赶时间卡'].includes(v.policy))return '未知评审策略。';
      let hits=0,blocked=0,extra=0;const errors=[];
      for(let i=1;i<=10;i++){
        const needsRamp=i>8;
        const wrong=i===(v.policy.startsWith('甲')?9:1);
        const useRamp=wrong?!needsRamp:needsRamp;
        if(!wrong)hits++;
        else if(useRamp){extra+=ramp-6;errors.push(i+'号赶时间卡绕行'+(ramp-6)+'格');}
        else{blocked++;errors.push(i+'号推车卡停在台阶前');}
      }
      const next=v.empty==='直接选短线'?'默认指向六格台阶线，通行条件未知':v.empty!=='先询问通行需求'?'策略未知，暂停':v.reply==='需要无台阶'?'指向'+ramp+'格缓坡':v.reply==='可走台阶'?'指向六格短线':'暂停移动，展示两路条件并请人工协助';
      return '十张卡命中：'+hits+'/10\n受阻：'+blocked+'次；额外路程：'+extra+'格\n错卡：'+errors.join('，')+'\n空白卡：'+next;
    },
    world(v){
      const ramp=Number(v.ramp);
      if(!Number.isInteger(ramp)||ramp<7||ramp>30)return 'registerClickEvent(function() say("请先标好缓坡格数。",2) end)';
      return `registerClickEvent(function()
  local card=ask("访客模拟卡",{"赶时间，能走台阶","推车，需无台阶","空白卡"})
  if not card then return end
  local useRamp=false
  if card==3 then
    ${v.empty==='先询问通行需求'?`local answer=ask("这次路线需要无台阶吗？",{"需要","不需要","暂不说明"})
    if not answer or answer==3 then say("暂停：短线有台阶，缓坡无台阶，请人工协助。",3); return end
    useRamp=answer==1`:'say("短线有三级台阶；资料不全，停在入口核实。",3); return'}
  else
    local miss=ask("试普通卡还是该策略的唯一错例？",{"普通","唯一错例"})
    if not miss then return end
    useRamp=card==2
    if miss==2 and card==${v.policy.startsWith('甲')?2:1} then useRamp=not useRamp end
  end
  if card==2 and not useRamp then say("推车停在台阶前，无法通行。",3); return end
  if useRamp then turnTo(90); say("缓坡，共${ramp}格。",2) else turnTo(0); say("短线六格。",2) end
  walkForward(2,1); walkForward(-2,1)
end)`;
    },
    checks:[{set:{},expect:'受阻：1次；额外路程：0格'},{set:{policy:'乙：错一张赶时间卡',ramp:'12'},expect:'受阻：0次；额外路程：6格'},{set:{empty:'先询问通行需求',reply:'暂不说明'},expect:'暂停移动'},{set:{ramp:''},expect:'缓坡地图未就绪'}]
  },
  'g7-07': {
    goal:'逐格重放模拟语音目标、读牌和执行朝向，找到日志里首次偏差并抵达服务台。',
    product:'带坐标和故障日志的转角导览世界',
    opening:'向导听清了“去服务台”，却在墙前停住。你要先查看哪个坐标的哪一行记录？',
    prediction:'从(0,0)朝东出发。路口在(3,0)，右箭头如果提前出现，预测机器人转向后尝试进入的格子。',
    demonstration:'保持拐角为3，先运行箭头在2的路线，再仅把箭头移到3。在 Paracraft 点角色，选择当前路标或提前一格的路标，比较转角、行走方向与停点。最后在正确路口试执行故障。',
    debrief:'如果日志显示看对牌、决定右转，角色却仍朝东，证据把故障定位在哪一步？',
    student:'在浏览器中编辑地图转角的横坐标、箭头位置和语音目标卡。先用提前一格的箭头保存有故障的路线。实际进入 Paracraft，开拉杆点向导，按格重走并抄下首次偏差。',
    revision:'请同伴重放同一目标卡，先标记首次离开通道的位置。V2只矫正箭头，复测同一起点和原指令；转身动作故意不执行时再检查能否定位另一类故障。',
    fields:[{key:'corner',label:'路口横坐标，1至5格',value:'3'},{key:'arrow',label:'右箭头横坐标，0至5格',value:'2'},{key:'voice',label:'模拟语音转写',value:'去服务台'},{key:'motor',label:'转向执行状态',options:['执行右转','故障：保持朝东']}],
    run(v){
      if(!/^\s*[1-5]\s*$/.test(v.corner)||!/^\s*[0-5]\s*$/.test(v.arrow))return '格图输入无效：路口1至5格，箭头0至5格。';
      if(String(v.voice??'').trim()!=='去服务台')return '目标未确认：暂停，请重新选择或输入“去服务台”。';
      const corner=Number(v.corner), arrow=Number(v.arrow);
      let x=0,y=0,direction='东';
      const log=['语音→目标：服务台；起点(0,0)朝东'];
      for(let i=0;i<10;i++){
        if(x===corner && y===2){log.push('终点：('+x+','+y+')，服务台前停止');break;}
        if(x===arrow && y===0){
          direction=v.motor==='执行右转'?'南':'东';
          log.push('('+x+',0) 读右箭头 → 规划右转 → 实际朝'+direction);
        }
        const nx=x+(direction==='东'?1:0), ny=y+(direction==='南'?1:0);
        if(!(ny===0 && nx<=corner || nx===corner && ny<=2)){
          log.push('被挡：从('+x+','+y+')尝试进入('+nx+','+ny+')');
          break;
        }
        x=nx;y=ny;log.push('进入('+x+','+y+')');
      }
      return log.join('\n');
    },
    world(v){
      if(!/^\s*[1-5]\s*$/.test(v.corner)||!/^\s*[0-5]\s*$/.test(v.arrow))return 'registerClickEvent(function() say("请先设置有效格图。",2) end)';
      const c=Number(v.corner),a=Number(v.arrow);
      if(String(v.voice??'').trim()!=='去服务台')return 'registerClickEvent(function() say("目标未确认，请重选模拟指令。",2) end)';
      return `registerClickEvent(function()
  local card=ask("模拟路线卡",{"用我的箭头","只把箭头放在路口","只把箭头移到路口前一格"})
  if not card then return end
  local corner,arrow=${c},${a}
  if card==2 then arrow=corner elseif card==3 then arrow=corner-1 end
  local x,y=0,0
  local south=false
  turnTo(0)
  for tick=1,10 do
    if x==corner and y==2 then say("到达服务台。",2); break end
    if x==arrow and y==0 then
      south=${v.motor==='执行右转'?'true':'false'}
      say("在第"..x.."格读到右箭头。",1)
      if south then turnTo(90) end
    end
    local nx,ny=x+1,y
    if south then nx,ny=x,y+1 end
    if not ((ny==0 and nx<=corner) or (nx==corner and ny<=2)) then
      say("墙前停止；尝试进入("..nx..","..ny..")",2); break
    end
    x,y=nx,ny; walkForward(0.5,0.4)
  end
  if y>0 then turnTo(90); walkForward(-y*0.5,0.5) end
  if x>0 then turnTo(0); walkForward(-x*0.5,0.5) end
end)`;
    },
    checks:[{set:{},expect:'从(2,0)尝试进入(2,1)'},{set:{arrow:'3'},expect:'终点：(3,2)'},{set:{arrow:'3',motor:'故障：保持朝东'},expect:'从(3,0)尝试进入(4,0)'},{set:{voice:'去哪儿'},expect:'目标未确认'}]
  },
  'g7-08': {
    goal:'同伴用同一张规则卡在改过地名的地图上找服务；显示每次匹配、追问、停点与四单通过率。',
    product:'跨地图的图标与功能导览台',
    opening:'导览台学会了“蓝书往西”。校园改成一东一西两个蓝书，它会把要借书的人送到哪里？',
    prediction:'四张访客卡按图标匹配，遇到两个图标时选表中首项。先猜哪张卡很可能到错了功能点。',
    demonstration:'投屏图例，让同伴用四张卡验收。如果两个蓝书只按首项选，记录第3单的功能。只换成歧义追问，仍用原图原卡重跑。真实 Paracraft 中点NPC，选择蓝书服务，听它是否先澄清再移动。',
    debrief:'把借书点换个叫法但保留图标和功能，哪些分支应该保持？用功能核对到达比核对地名多检查了什么？',
    student:'在浏览器作品中把甲图的图标规则搬到乙图。编辑目的地清单，每行分开图标、功能、方位。先导出默认选首项的首版；打开实际 Paracraft、点向导，用两张不同蓝书功能卡试玩。',
    revision:'同伴依次输入种植、活动、借书、集合；记录终点上的功能。只给重复图标加追问，再跑原四单。最后加入同功能不同位置的新项，确认仍有歧义时停步。',
    fields:[
      {key:'map',label:'地图乙，每行 图标｜功能｜方位（东/西/南/北）',value:'蓝书｜还书｜西\n蓝书｜借书｜东\n绿叶｜种植｜南\n红旗｜活动｜北\n黄星｜集合｜南'},
      {key:'rule',label:'遇到重复图标',options:['取表中首项','追问具体功能']},
      {key:'cards',label:'访客卡，每行 图标｜所需功能；留空功能表示不透露',value:'绿叶｜种植\n红旗｜活动\n蓝书｜借书\n黄星｜集合'}
    ],
    run(v){
      const map=[], cards=[];
      for(const [i,line] of String(v.map??'').trim().split(/\n/).entries()){
        const a=line.split(/[｜|]/).map(s=>s.trim());
        if(a.length!==3||!a[0]||!a[1]||!['东','西','南','北'].includes(a[2]))return '地图第'+(i+1)+'行需写图标、功能和有效方位。';
        map.push(a);
      }
      for(const [i,line] of String(v.cards??'').trim().split(/\n/).entries()){
        const a=line.split(/[｜|]/).map(s=>s.trim());
        if(a.length!==2||!a[0])return '访客卡第'+(i+1)+'行需写图标｜功能。';
        cards.push(a);
      }
      let correct=0;const log=[];
      cards.forEach(([icon,goal],i)=>{
        const matches=map.filter(p=>p[0]===icon);
        const ask=matches.length>1 && v.rule==='追问具体功能';
        const candidates=ask?matches.filter(m=>m[1]===goal):matches;
        const pick=ask&&candidates.length!==1?null:candidates[0];
        const outcome=pick?pick[2]+'侧'+pick[1]:'停步请人工确认';
        if(pick && pick[1]===goal)correct++;
        log.push((i+1)+'号 '+icon+'匹配'+matches.length+'项'+(ask?' → 追问功能':'')+' → '+outcome+'；'+(pick&&pick[1]===goal?'通过':'未通过'));
      });
      return log.join('\n')+'\n功能验收通过：'+correct+'/'+cards.length;
    },
    world(v){
      const points=String(v.map??'').trim().split(/\n/).map(l=>l.split(/[｜|]/).map(x=>x.trim()));
      if(points.some(a=>a.length!==3||!a[0]||!a[1]||!['东','西','南','北'].includes(a[2])))return 'registerClickEvent(function() say("地图缺少功能或方位，先检查图例。",2) end)';
      const pointsLua=points.map(a=>'{'+a.map(x=>JSON.stringify(x)).join(',')+'}').join(',');
      const icons=[...new Set(points.map(p=>p[0]))];
      return `local points={${pointsLua}}
local icons={${icons.map(x=>JSON.stringify(x)).join(',')}}
registerClickEvent(function()
  local i=ask("选择图标卡",icons)
  if not i then return end
  local matches={}
  for _,p in ipairs(points) do
    if p[1]==icons[i] then table.insert(matches,p) end
  end
  local chosen=matches[1]
  if #matches>1 and ${v.rule==='追问具体功能'?'true':'false'} then
    local options={}
    for _,p in ipairs(matches) do table.insert(options,p[2]) end
    table.insert(options,"暂不说明")
    local j=ask("你要办理什么服务？",options)
    if not j or j>#matches then say("没有明确功能，请人工确认。",2); return end
    chosen=matches[j]
    for k,p in ipairs(matches) do
      if k~=j and p[2]==chosen[2] then say("功能仍重复，停步确认具体位置。",2); return end
    end
  end
  local angle={["东"]=0,["南"]=90,["西"]=180,["北"]=270}
  turnTo(angle[chosen[3]])
  say("请到"..chosen[3].."侧。",2); walkForward(1,0.8)
  say("终点功能："..chosen[2],2); walkForward(-1,0.8)
end)`;
    },
    checks:[{set:{},expect:'功能验收通过：3/4'},{set:{rule:'追问具体功能'},expect:'功能验收通过：4/4'},{set:{cards:'蓝书｜',rule:'追问具体功能'},expect:'停步请人工确认'},{set:{map:'铃铛｜领物｜东',cards:'铃铛｜领物'},expect:'东侧领物；通过'}]
  }
};
