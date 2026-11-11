export default {
  'g9-04': {
    goal:'同伴按展品要求点到正确厅牌，遇到未知展品能转人工，面板只在点对终点时记为到达。', product:'会核对终点的展厅入口 NPC',
    opening:'向导说完“去北边”，服务就算完成了吗？', prediction:'先猜朝东进入时，“正前方”和“北墙圆标 A”分别会把人带到哪面墙。', demonstration:'先在浏览器排练桥模任务。把起始朝向从北改为东，比较相对指引。打开实际 Paracraft，点入口向导叫出展品，再选择自己敲的牌，观察面板最后一个状态。',debrief:'哪一步的输入改变了“指引已发出”和“已经到达”的区别？',student:'编写两条展品和目的厅映射，用未收录词试一次。保留 V1，再从课件进入空白世界建景，点角色实际走通一次。',revision:'请陌生访客朝东找桥模，只把指引从正前方改为地标，在同一朝向重走并记下点牌结果。',
    fields:[{key:'map',label:'展品与展厅，每行“展品=A或B”',value:'桥模=A\n风车=B'},{key:'item',label:'访客想找的展品',value:'桥模'},{key:'orientation',label:'入场朝向',options:['北','东']},{key:'guide',label:'向导说法',options:['固定地标','正前方']},{key:'touch',label:'访客实际点的牌',options:['尚未点牌','A','B']}],
    run(v){
      const rows=v.map.split(/\r?\n/).filter(x=>x.trim()).map(x=>x.split('=').map(s=>s.trim()));
      if(!rows.length||rows.some(r=>r.length!==2||!r[0]||!['A','B'].includes(r[1]))||new Set(rows.map(r=>r[0])).size!==rows.length)return '映射表无法启用：请给每个展品唯一的 A 或 B 终点。';
      const item=v.item.trim(), hit=rows.find(r=>r[0]===item);
      if(!hit)return '需求：'+(item||'未填写')+'\n未收录 → 西墙黄旗人工台；本轮未记到达。';
      const target=hit[1], directed=v.guide==='固定地标'?target:v.orientation==='北'?'A':'B';
      return ['已接单：'+item,'实际目标：'+target,'按当前指引走向：'+directed,(directed===target?'指引与目标相符':'指引偏离目标'),v.touch==='尚未点牌'?'等待到站牌':v.touch===target?'点牌正确 → 已到达':'点错 '+v.touch+' → 返回路口'].join('\n');
    },
    world(v){
      const rows=v.map.split(/\r?\n/).filter(x=>x.trim()).map(x=>x.split('=').map(s=>s.trim()));
      if(!rows.length||rows.some(r=>r.length!==2||!r[0]||!['A','B'].includes(r[1]))||new Set(rows.map(r=>r[0])).size!==rows.length) return 'registerClickEvent(function() say("请先修正展品映射表。",3) end)';
      const q=JSON.stringify, menu=rows.map(r=>q(r[0])).concat('"未收录展品"').join(','), goals=rows.map(r=>q(r[1])).join(',');
      return `registerClickEvent(function()
  local i=ask("选展品",{ ${menu} })
  local goals={${goals}}
  local target=goals[i]
  if not target then say("西墙黄旗人工台可以帮忙，本轮未记到达。",4) return end
  local direction=${v.guide==='固定地标'?'target':q(v.orientation==='北'?'A':'B')}
  turnTo(direction=="A" and 0 or 90)
  say(direction=="A" and "请到北墙圆标 A" or "请到东墙方标 B",2)
  local t=ask("你敲哪面终点牌？",{"北墙圆标 A","东墙方标 B","尚未到站"})
  if t==3 or not t then say("等待到站牌",2)
  elseif (t==1 and target=="A") or (t==2 and target=="B") then say("已到达",2)
  else say("点错牌，请返回路口",2) end
end)`;
    },
    checks:[{set:{touch:'A'},expect:'点牌正确 → 已到达'},{set:{guide:'正前方',orientation:'东'},expect:'指引偏离目标'},{set:{item:'未登记'},expect:'西墙黄旗人工台'},{set:{map:'桥模=C'},expect:'映射表无法启用'}]
  },
  'g9-05': {
    goal:'由秒数和动作重建一次试玩，算出岔口停留、错点和完成时刻，并识别有干预的测试。',product:'静音观察员事件计时单',opening:'甲在路口站了十二秒，我们凭哪两笔记录知道？',prediction:'把离开岔口的时刻延后两秒，哪些指标应该变，哪些不变？',demonstration:'先用甲的样例日志重放到站，改一处离开时间再比较。在实际 Paracraft 点角色启动一次静音试玩，让访客自己选路、点牌，收表后才讨论。',debrief:'能记录的动作与事后猜的原因，哪一项可以进计算列？',student:'建立秒数与动作的记录单，要求访客同意。自己在实际世界点角色试走，另请一名首次访客从同一起点走，观察员用外部秒表写下事件。',revision:'用另一位首次访客试只换一处岔口牌的版本。重算两版日志，遇到有人提示的轮次，另列说明。',
    fields:[{key:'log',label:'实测日志，每行“秒数 动作”，动作选开始、入岔、离岔、点B、点A、提示',value:'0 开始\n4 入岔\n16 离岔\n18 点B\n29 点A'},{key:'sign',label:'岔口牌给访客看的原话',value:'请到前面展厅'}],
    run(v){
      if(!v.log.trim())return '尚无观测，请按开始并记时。';
      const seen=[], rows=v.log.trim().split(/\r?\n/);let last=-1,entry=null,dwell=0,wrong=0,end=null,start=null,help=0;
      for(const [i,line] of rows.entries()){
        const m=line.trim().match(/^(\d+)\s+(开始|入岔|离岔|点B|点A|提示)$/);
        if(!m||+m[1]<last||end!==null)return '第 '+(i+1)+' 行需要核对动作、时间顺序或结束位置。';
        const time=+m[1],act=m[2];last=time;
        if(i===0&&act!=='开始'||i>0&&act==='开始')return '首行须为唯一的开始事件。';
        if(act==='开始')start=time;
        if(act==='入岔'){if(entry!==null)return '重复入岔，缺少离岔记录。';entry=time;}
        if(act==='离岔'){if(entry===null)return '没有对应入岔记录。';dwell+=time-entry;entry=null;}
        if(act==='点B')wrong++;
        if(act==='点A')end=time;
        if(act==='提示')help++;
        seen.push(time+' 秒 '+act);
      }
      return ['展示指引：'+(v.sign.trim()||'空牌'),seen.join(' → '),'已配对的停顿：'+dwell+' 秒'+(entry!==null?'（另有未配对入岔）':''),'错点 B：'+wrong+' 次',end===null?'尚未完成':'完成耗时：'+(end-start)+' 秒',help?'有干预：'+help+' 次':'本轮未记提示'].join('\n');
    },
    world(v){return `registerClickEvent(function()
  say(${JSON.stringify(v.sign.trim()||'空牌')} ,2)
  local wrong=0
  for i=1,5 do
    local t=ask("请选择你要走的路线。观察员只记录时间和动作。",{"北墙圆标 A","东墙方标 B","请求提示","退出本轮"})
    if t==1 then turnTo(0) say("点 A，完成。此前错点 "..wrong.." 次。",3) return end
    if t==2 then turnTo(90) wrong=wrong+1 say("点 B，回到岔口。",2)
    elseif t==3 then say("观察员记下提示：目标是北墙圆标 A。",2)
    else say("本轮未完成。",2) return end
  end
  say("五次操作已记录，本轮未完成。",2)
end)`;},
    checks:[{set:{},expect:'已配对的停顿：12 秒'},{set:{log:'0 开始\n4 入岔\n18 离岔\n29 点A'},expect:'已配对的停顿：14 秒'},{set:{log:'0 开始\n6 提示\n10 点A'},expect:'有干预：1 次'},{set:{log:'0 开始\n4 离岔'},expect:'没有对应入岔记录'}]
  },
  'g9-06': {
    goal:'在预算内按阻断记录数挑一个修改，能独立算出首版和复测通过率。',product:'带证据分母的改版决定板',opening:'让四个人都遇到的花边问题，和让两人走错厅的问题，先修哪个？',prediction:'把六分钟预算降为三分钟，推荐还成立吗？',demonstration:'录入四个匿名轮次，显示 V1 的分母；先看六分钟预算下的可行改动，再只减预算。输入新日志核对百分比差异。',debrief:'决定单引用了哪几次失败？百分点变化的分母各是多少？',student:'输入自己的两轮日志，给候选修改标上对应问题名和耗时，做出可以交给开发者的 V1 决定板。',revision:'请同伴把预算降至三分钟，再把预算恢复；只调候选工时或标记遗漏的阻断记录，用原日志重测。',
    fields:[{key:'v1',label:'V1 每行“通过/失败 问题名”，通过可省略问题',value:'失败 指引不清\n通过\n失败 指引不清\n通过 标题浅'},{key:'v2',label:'V2 同口令的另一组首次访客',value:'通过\n通过\n通过\n失败 指引不清'},{key:'costs',label:'候选项，每行“问题名 分钟”',value:'指引不清 4\n标题浅 6'},{key:'budget',label:'可用分钟',value:'6'}],
    run(v){
      const parse=s=>s.trim()?s.trim().split(/\r?\n/).map(r=>r.trim().match(/^(通过|失败)(?:\s+(.+))?$/)):[];const a=parse(v.v1),b=parse(v.v2);
      if(!a.length||[...a,...b].some(r=>!r||r[1]==='失败'&&!r[2]))return '日志须有 V1 样本；失败行需要问题名。';
      const budget=Number(v.budget);if(!v.budget.trim()||!Number.isFinite(budget)||budget<0)return '预算需要非负数字。';
      const c=v.costs.trim().split(/\r?\n/).map(row=>row.trim().match(/^(.+?)\s+(\d+(?:\.\d+)?)$/));if(c.some(r=>!r))return '候选项需要问题名和数字工时。';
      const choices=c.filter(r=>+r[2]<=budget).map(r=>({name:r[1],cost:+r[2],ids:a.flatMap((x,i)=>x[1]==='失败'&&x[2]===r[1]?['T'+(i+1)]:[])})).filter(x=>x.ids.length).sort((x,y)=>y.ids.length-x.ids.length||x.cost-y.cost);
      const wins=rows=>rows.filter(r=>r[1]==='通过').length, rate=rows=>wins(rows)/rows.length*100;
      return ['V1 通过：'+wins(a)+'/'+a.length,choices.length?'先修：'+choices[0].name+'；'+choices[0].cost+' 分钟；阻断编号 '+choices[0].ids.join('、'):'预算内没有有阻断证据的候选项。',b.length?'V2 通过：'+wins(b)+'/'+b.length+'；变化 '+Number((rate(b)-rate(a)).toFixed(1))+' 个百分点':'等待同条件的 V2 实测。'].join('\n');
    },
    checks:[{set:{},expect:'阻断编号 T1、T3'},{set:{budget:'3'},expect:'预算内没有有阻断证据'},{set:{v2:'通过\n通过'},expect:'变化 50 个百分点'},{set:{v1:'失败'},expect:'失败行需要问题名'}]
  },
  'g9-07': {
    goal:'迁移真实人工台后，逐站发现并修正过时指引；灰阶读者仍能辨识 A/B。',product:'三站同步的伦理审计牌',opening:'人工台搬了，改入口就够吗？请找一条仍走向旧台的路线。',prediction:'只改系统实际位置，三处文字会剩下几处与系统一致？',demonstration:'使用西墙位置排练，先只移动真实人工台，逐站对照。在实际 Paracraft 点审计向导，按入口、未知答复、回访三条路线查看站牌并指给同伴看。',debrief:'哪段用户指引过期？还会向访客收集哪些无关信息？',student:'为三个入口分别写方位，填真实数据字段和 AI 声明，创建 V1。打开实际世界，依次点击向导试三个出口。',revision:'邻组只拿你做的牌找人工台。把西墙搬到南墙，修正仍指错的牌，再按原顺序复测。',
    fields:[{key:'desk',label:'人工台实际位置',options:['西墙黄旗','南墙白旗']},{key:'routes',label:'入口、未知答复、终点回访各一行目的地',value:'西墙黄旗\n西墙黄旗\n西墙黄旗'},{key:'fields',label:'系统收集字段，逗号分隔',value:'本轮状态'},{key:'keys',label:'访客按键方案',options:['圆标 A、方标 B，加文字','红色和绿色，无文字']},{key:'credit',label:'AI 和人分别做了什么',value:'AI 起草草图，项目组核字、核对方位。'}],
    run(v){
      const names=['入口','未知答复','终点回访'], lines=v.routes.split(/\r?\n/).map(x=>x.trim());
      if(lines.length!==3)return '请依序填写三个站点，一行一处。';
      const bad=names.filter((_,i)=>lines[i]!==v.desk),excess=v.fields.split(/[，,、]/).map(x=>x.trim()).filter(x=>x&&x!=='本轮状态');
      return [...names.map((n,i)=>n+' → '+(lines[i]||'缺说明')+'；'+(lines[i]===v.desk?'可到人工台':'未指到实际人工台')),bad.length?'待同步：'+bad.join('、'):'三处位置已同步',excess.length?'超出本轮所需字段：'+excess.join('、'):'本轮采集满足设定的最小字段范围',v.keys.startsWith('圆标')?'灰阶仍可凭形状和文字辨认':'灰阶检查：缺少文字或形状',v.credit.trim()?'待人工核对的署名：'+v.credit:'缺少制作声明'].join('\n');
    },
    world(v){const names=['入口','未知答复','终点回访'], routes=v.routes.split(/\r?\n/).map(s=>s.trim()); const msg=names.map((n,i)=>JSON.stringify(n+'牌：'+(routes[i]||'缺失')+'；实地核对：'+(routes[i]===v.desk?'位置一致':'此牌需要同步')));return `registerClickEvent(function()
  local i=ask("选择审计路线",{"从入口问路","向 NPC 询问未知展品","在终点请求回访","看操作与制作声明"})
  if not i then return end
  if i==4 then say(${JSON.stringify(v.keys+'；收集字段：'+v.fields+'；声明：'+v.credit)},5) return end
  local messages={${msg.join(',')}}
  local directions={${names.map((_,i)=>routes[i]==='西墙黄旗'?270:routes[i]==='南墙白旗'?180:0).join(',')}}
  turnTo(directions[i])
  say(messages[i],4)
end)`;},
    checks:[{set:{},expect:'三处位置已同步'},{set:{desk:'南墙白旗',routes:'南墙白旗\n西墙黄旗\n南墙白旗'},expect:'待同步：未知答复'},{set:{fields:'本轮状态、手机号'},expect:'超出本轮所需字段：手机号'},{set:{credit:''},expect:'缺少制作声明'}]
  },
  'g9-08': {
    goal:'评委能独立复算两轮证据、提交变更条件并通过实际路线检验答辩。',product:'可现场变更的三站答辩展',opening:'用四个匿名格子证明你改进过，再说出它们还证明不了什么。',prediction:'如果评委只能看灰阶，绿色 B 牌的哪部分信息会消失？',demonstration:'在浏览器切换评委条件并检查证据台。打开实际 Paracraft，先点证据站复核，再让评委选择灰阶路线；仅替换 B 标识再次运行。',debrief:'哪份原始记录支持你的改版？提出收手机号时，你能展示怎样的最小替代？',student:'把真实两轮结果填入展签，决定 B 牌展示什么和谁负责核查。建好实际世界，请同学点三站，复述一项有证据的判断。',revision:'请灰阶试玩者在原起点找同一风车；只添加文字或形状后再试。另请评委提出身份排名要求，检查匿名汇总演示。',
    fields:[{key:'round1',label:'V1 记录，逐个填“成”或“败”',value:'成 败 成 败'},{key:'round2',label:'V2 同任务记录',value:'成 成 成 败'},{key:'marker',label:'B 标牌的可见元素',options:['只涂绿色','绿色、方形与 B 厅文字']},{key:'view',label:'评委现场提出',options:['普通视图找风车','灰阶视图找风车','收集手机号做排名']},{key:'decision',label:'团队亲自做出的选择与核查',value:'团队只改地点指引，核对四位首次访客的到站记录。'}],
    run(v){
      const parse=s=>s.trim()?s.trim().split(/[\s，,、]+/):[], a=parse(v.round1), b=parse(v.round2);
      if(!a.length||!b.length||[...a,...b].some(x=>!['成','败'].includes(x)))return '证据站待补：两轮都要填写可核对的成或败。';
      const count=xs=>xs.filter(x=>x==='成').length;
      const visible=v.view.startsWith('灰阶')?(v.marker.startsWith('只')?'灰度色块，无法单凭牌面锁定 B':'方形与 B 厅文字仍可见'):v.marker;
      const verdict=v.view.startsWith('收集')?'拒收身份字段；演示匿名总完成 '+(count(a)+count(b))+' 次': '评委能看到：'+visible;
      return ['证据站：V1 '+count(a)+'/'+a.length+'；V2 '+count(b)+'/'+b.length,'待查的 V2 失败轮次：'+(b.flatMap((x,i)=>x==='败'?[i+1]:[]).join('、')||'本组无失败记录'),verdict,'责任站：'+(v.decision.trim()||'尚缺团队核查说明')].join('\n');
    },
    world(v){
      const a=v.round1.trim().split(/[\s，,、]+/),b=v.round2.trim().split(/[\s，,、]+/),ok=[...a,...b].every(x=>x==='成'||x==='败');
      const n=r=>r.filter(x=>x==='成').length;
      const evidence=ok?'V1 成功 '+n(a)+'/'+a.length+'；V2 成功 '+n(b)+'/'+b.length+'。请评委核对原始记录：'+v.round1+'；'+v.round2:'证据待补，请核查两轮记录。';
      return `registerClickEvent(function()
  local station=ask("走哪一站？",{"证据站：复算","展品站：换灰阶再试","责任站：评委变更"})
  if station==1 then turnTo(0) say(${JSON.stringify(evidence)},6)
  elseif station==2 then
    turnTo(90)
    local mode=ask("选试用条件",{"普通视图","灰阶视图"})
    if mode==2 then say(${JSON.stringify(v.marker.startsWith('只')?'B 牌只剩灰度色块，缺少可辨形状与文字。':'方形仍在，B 厅文字仍可读。')},4)
    elseif mode==1 then say(${JSON.stringify(v.marker)},3) end
  elseif station==3 then turnTo(180) say(${JSON.stringify('手机号与找路无关。评委可查两轮匿名总数；团队核查：'+v.decision)},5) end
end)`;},
    checks:[{set:{},expect:'V2 3/4'},{set:{view:'灰阶视图找风车'},expect:'无法单凭牌面锁定 B'},{set:{view:'灰阶视图找风车',marker:'绿色、方形与 B 厅文字'},expect:'方形与 B 厅文字仍可见'},{set:{view:'收集手机号做排名'},expect:'匿名总完成 5 次'},{set:{round1:'缺'},expect:'证据站待补'}]
  }
};
