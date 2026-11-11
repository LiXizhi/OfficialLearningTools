export default {
  'g6-02': {
    goal:'值班员能看着算式选出更快路线，遇检修时能让推荐停在人工确认门前。',
    product:'会交出发车权的路线调度板',
    opening:'抄近路要转四次弯，绕远路只转一次，你押哪一辆先到？',
    prediction:'两条路分别用 12 格 4 角和 16 格 1 角。先押每角不停时谁快，再押每角停两秒时谁快。',
    demonstration:'保留路线资料，把每角停顿从 0 调到 2，逐项读出路长用时和等候用时。接着只挂检修牌，请一名值班员指出流程停在哪一步。',
    debrief:'甲多等了几秒？这个差值什么时候能抵消它少走的四格？平局时机器能替谁决定？',
    student:'为自己的两条模拟路线填格数与转角，选一个停顿档。让同伴先手算再按运行，保存两条算式和人工决定。',
    revision:'请值班员在检修状态尝试发车；修正一处路线参数或许可设置，再用同一检修牌与原停顿值测试，保留两版结果。',
    fields:[
      {key:'routes',label:'每行写 路名,格数,转角数；每格用 1 秒',value:'甲,12,4\n乙,16,1'},
      {key:'pause',label:'每次转角停顿几秒（0 至 20）',value:'0'},
      {key:'gate',label:'值班员的现场记录',options:['畅通，等人确认','畅通，已确认','入口检修']}
    ],
    run(v){
      const rows=v.routes.trim().split(/\n/).map(row=>row.trim().split(/[,，]/).map(s=>s.trim()));
      if(rows.length!==2 || rows.some(r=>r.length!==3 || !r[0] || !/^[1-9]\d{0,2}$/.test(r[1]) || !/^\d{1,3}$/.test(r[2]) || +r[2]>=+r[1]) || rows[0][0]===rows[1][0]) return '需要两条不同名的路线，每行三项；格数 1～999，转角为非负整数且少于格数。';
      if(!v.pause.trim() || !Number.isFinite(+v.pause) || +v.pause<0 || +v.pause>20) return '请填写 0 至 20 秒的转角停顿。';
      const times=rows.map(([,length,corners])=>Number((+length+corners*v.pause).toFixed(3)));
      const verdict=times[0]===times[1]?'两路同速，请值班员选择':rows[times[0]<times[1]?0:1][0]+'较快';
      const gate={'入口检修':'暂停：检修牌拦住出发。','畅通，等人确认':'等待值班员确认。','畅通，已确认':'人工已确认，可以出发。'}[v.gate] || '现场记录未知，等待复核。';
      return [...rows.map(([name,length,corners],i)=>name+'：'+length+' + '+corners+' × '+v.pause+' = '+times[i]+' 秒'),'计算建议：'+verdict,'人工开关：'+gate].join('\n');
    },
    checks:[{set:{},expect:'甲较快'},{set:{pause:'2'},expect:'乙较快'},{set:{gate:'入口检修'},expect:'检修牌拦住出发'},{set:{routes:'甲,6,1\n乙,6,1'},expect:'两路同速'},{set:{pause:''},expect:'请填写'}]
  },
  'g6-03': {
    goal:'同伴只凭网格、方向和工地坐标复走两版路线，指出哪一步停下、哪条绕路仍抵达同一终点。',
    product:'可以改写走法的巡检沙盘',
    opening:'站在蓝格就算走了一格吗？请找一个大家都能重复的计数办法。',
    prediction:'从 (1,2) 向东走 6 格；若 (4,2) 加一块施工砖，巡检员会停在哪一格？',
    demonstration:'浏览器先排练“东6”，只打开施工开关，读出最后安全格。打开实际 Paracraft，给端点铺蓝黄砖，把模拟施工位置标红；点巡检角色切换两种情景，再沿提交的绕行路核对转角。',
    debrief:'绕行多走几格？并排比较两份轨迹，哪个坐标与两个端点保持不动？',
    student:'独立从起点编一串东南西北指令，保持终点不变。浏览器排练后打开 Paracraft，在角色站的起点、终点铺砖，安装建景脚本并点角色核查第一版。',
    revision:'搭档先让直路撞上模拟工地，再用同一工地试“东2 北1 东2 南1 东2”。对照两版的终点、步数、转角数；可再设计另一条可达路线。',
    fields:[
      {key:'moves',label:'巡检路线（方向+格数，空格分开）',value:'东6'},
      {key:'site',label:'施工格坐标（横,纵）',value:'4,2'},
      {key:'closed',label:'本轮工地',options:['开放','施工']}
    ],
    run(v){
      const site=v.site.trim().match(/^([1-7])\s*[,，]\s*([1-5])$/);
      if(!site) return '施工格需在 1～7 列、1～5 行，例如 4,2。';
      const tokens=v.moves.trim().split(/\s+/);
      if(tokens.length>30 || tokens.some(t=>!/^([东南西北])([1-9])$/.test(t))) return '每段写一个方向和 1～9 格，最多 30 段，例如 东2 北1。';
      if(!['开放','施工'].includes(v.closed)) return '请选择开放或施工。';
      const dirs={'东':[1,0],'西':[-1,0],'北':[0,1],'南':[0,-1]};
      let x=1,y=2,steps=0,turns=0,previous='';
      const trail=['(1,2)'];
      if(v.closed==='施工' && x===+site[1] && y===+site[2]) return '起点位于施工格，无法出发。';
      for(const token of tokens){
        const dir=token[0], [dx,dy]=dirs[dir];
        for(let i=0;i<+token[1];i++){
          const nx=x+dx,ny=y+dy;
          if(nx<1 || nx>7 || ny<1 || ny>5) return trail.join(' → ')+'\n超出沙盘，停在 ('+x+','+y+')。';
          if(v.closed==='施工' && nx===+site[1] && ny===+site[2]) return trail.join(' → ')+'\n遇到施工格，停在 ('+x+','+y+')，已走 '+steps+' 格。';
          if(previous && dir!==previous) turns++;
          previous=dir;x=nx;y=ny;steps++;trail.push('('+x+','+y+')');
        }
      }
      return trail.join(' → ')+'\n'+(x===7 && y===2?'抵达黄线':'尚未抵达 (7,2)')+'；共 '+steps+' 格、'+turns+' 次转角。';
    },
    world(v){
      const tokens=v.moves.trim().split(/\s+/);
      const site=v.site.trim().match(/^([1-7])\s*[,，]\s*([1-5])$/);
      if(!site || tokens.length>30 || tokens.some(t=>!/^([东南西北])([1-9])$/.test(t))) return 'registerClickEvent(function() say("先核查方向、格数与施工坐标，再更新角色脚本。",3) end)';
      const offsets={'东':[1,0],'西':[-1,0],'北':[0,1],'南':[0,-1]};
      const route=tokens.map(t=>'{'+offsets[t[0]].join(',')+','+t[1]+'}').join(',');
      return `local ox,oy,oz=getPos()
local busy=false
registerClickEvent(function()
    if busy then return end
    busy=true
    local mode=ask("排练条件（工地由坐标模拟）",{"开放","施工"})
    if not mode then busy=false return end
    local x,y=1,2
    setPos(ox,oy,oz)
    if mode==2 and x==${+site[1]} and y==${+site[2]} then say("起点施工，等待人工处理",3) busy=false return end
    local route={${route}}
    local steps,turns=0,0
    local lastX,lastY=0,0
    for _,part in ipairs(route) do
        for i=1,part[3] do
            local nx,ny=x+part[1],y+part[2]
            if nx<1 or nx>7 or ny<1 or ny>5 or (mode==2 and nx==${+site[1]} and ny==${+site[2]}) then
                say("停在 ("..x..","..y..")，已走 "..steps.." 格。请核对边界或施工格",4)
                busy=false return
            end
            if steps>0 and (lastX~=part[1] or lastY~=part[2]) then turns=turns+1 end
            lastX,lastY=part[1],part[2]
            x,y=nx,ny
            setPos(ox-(x-1),oy,oz+(y-2))
            wait(0.4)
            steps=steps+1
        end
    end
    local finish="尚未抵达黄线"
    if x==7 and y==2 then finish="抵达黄线" end
    say(finish.."，走 "..steps.." 格，转角 "..turns.." 次",4)
    busy=false
end)`;
    },
    checks:[{set:{},expect:'共 6 格、0 次转角'},{set:{closed:'施工'},expect:'停在 (3,2)'},{set:{closed:'施工',moves:'东2 北1 东2 南1 东2'},expect:'共 8 格、4 次转角'},{set:{moves:'西3'},expect:'超出沙盘'},{set:{moves:''},expect:'每段写一个方向'}]
  },
  'g6-04': {
    goal:'同路、同车速跑三轮，只在中间轮改变每角停顿，能将实测与预期分开并检查恢复差值。',
    product:'三轮停顿实验记录仪',
    opening:'最后再跑一次零停顿，能查出什么是只跑两轮看不出的？',
    prediction:'蓝道每格 1 秒走 8 格转两次，绿道走 10 格转一次。两道每角停 2 秒时会不会同时到？',
    demonstration:'浏览器排练蓝道三轮，改中间轮的停顿，核对起点、速度和路线。打开实际 Paracraft 点同一辆巡检车，选择同一路线按 0→设定值→0 运行，记录车报出的三次本地计时。',
    debrief:'你用哪两次实测说明恢复了原条件？秒数不同，可能是等待误差还是速度也发生了变化？',
    student:'选一道，指定中间轮停多久，先算三轮预期。打开 Paracraft 点巡检车，在世界中跑同路三轮，把看到的实际读数填回来再保存首版。',
    revision:'搭档换一档中间轮停顿，端点、速度、角色保持不变。让他按原输入重跑首版和改版，报告第三轮减第一轮的差值。',
    fields:[
      {key:'track',label:'固定路线',options:['蓝道（8格2角）','绿道（10格1角）']},
      {key:'pause',label:'中间轮每角停几秒（0 至 5）',value:'2'},
      {key:'actual',label:'实测栏（按三轮顺序填秒数，留空表示仅排练）',value:''}
    ],
    run(v){
      const paths={'蓝道（8格2角）':[8,2],'绿道（10格1角）':[10,1]};
      const path=paths[v.track];
      if(!Array.isArray(path) || !v.pause.trim() || !Number.isFinite(+v.pause) || +v.pause<0 || +v.pause>5) return '请选择路线，并填写 0～5 秒的中间轮停顿。';
      const [length,turns]=path, waits=[0,+v.pause,0], ideal=waits.map(p=>length+p*turns);
      const lines=ideal.map((t,i)=>'轮 '+(i+1)+'：每角停 '+waits[i]+' 秒，预测 '+t+' 秒');
      if(!v.actual.trim()) return [...lines,'尚无实测：请在世界跑三轮后填写。'].join('\n');
      const values=v.actual.trim().split(/[\s,，、]+/).map(s=>+s);
      if(values.length!==3 || values.some(n=>!Number.isFinite(n) || n<=0)) return [...lines,'实测需按顺序填三个大于零的秒数。'].join('\n');
      const fmt=n=>String(Number(n.toFixed(2)));
      return [...lines,...values.map((t,i)=>'轮 '+(i+1)+' 实测 '+t+' 秒；实测减预测 '+fmt(t-ideal[i])+' 秒'),'恢复差值（第三轮－第一轮）：'+fmt(values[2]-values[0])+' 秒'].join('\n');
    },
    world(v){
      const blue=v.track==='蓝道（8格2角）';
      if((!blue && v.track!=='绿道（10格1角）') || !v.pause.trim() || !Number.isFinite(+v.pause) || +v.pause<0 || +v.pause>5) return 'registerClickEvent(function() say("先选路线并核对停顿时间",3) end)';
      const route=blue?'{{0,1,1},{-6,0,6},{0,-1,1}}':'{{-3,4,5},{-3,-4,5}}';
      return `local ox,oy,oz=getPos()
local busy=false
registerClickEvent(function()
    if busy then return end
    busy=true
    local trial=ask("同一路线试哪一轮？",{"第一轮：零停顿","第二轮：每角停 ${+v.pause} 秒","第三轮：恢复零停顿"})
    if not trial then busy=false return end
    local pause=0
    if trial==2 then pause=${+v.pause} end
    local legs=${route}
    setPos(ox,oy,oz)
    local x,z=0,0
    local start=getTimer()
    for j,leg in ipairs(legs) do
        for step=1,leg[3] do
            wait(1)
            x=x+leg[1]/leg[3]
            z=z+leg[2]/leg[3]
            setPos(ox+x,oy,oz+z)
        end
        if j<#legs and pause>0 then wait(pause) end
    end
    local seconds=math.floor((getTimer()-start)*100+0.5)/100
    say("第 "..trial.." 轮：实际用时 "..seconds.." 秒。记好再点角色。",5)
    busy=false
end)`;
    },
    checks:[{set:{},expect:'轮 2：每角停 2 秒，预测 12 秒'},{set:{track:'绿道（10格1角）',pause:'3'},expect:'预测 13 秒'},{set:{actual:'8.1,12.2,8.3'},expect:'恢复差值（第三轮－第一轮）：0.2 秒'},{set:{actual:'8 12'},expect:'实测需按顺序填三个'}]
  },
  'g6-05': {
    goal:'交接员能追到每一张原纸条，找回缺失单位，将重复粘贴和两次同值区分开，并按起点独立求均值。',
    product:'计时纸条核对器',
    opening:'两个 12 秒可以是真跑了两次，也可以是同一张纸抄了两遍。你凭什么决定留下哪条？',
    prediction:'把侧门 9 秒加进原表，先猜蓝线均值会不会变；接着试试只换掉一条记录的编号。',
    demonstration:'先运行默认表，投屏 R2 的两行出处与 R1 的相同秒数。只给缺单位的 R3 加“秒”，看日志变化；再加侧门 R4，复核分组均值。',
    debrief:'哪里能看到没有丢掉第二次 12 秒？一行和纸条冲突时，你凭什么决定能不能入组？',
    student:'根据材料录入原纸条和手抄表，自编一处漏填或重复，让接班人运行并根据日志找回原行。',
    revision:'搭档先加入侧门，再故意改错一个秒数。只修正该行，重测相同纸条，核实蓝线均值和侧门组分别怎样变。',
    fields:[
      {key:'source',label:'原纸条：编号,起点,带“秒”的原读数（每张一行）',value:'R1,蓝线,12秒\nR2,蓝线,12秒\nR3,蓝线,15秒\nR4,侧门,9秒'},
      {key:'entries',label:'交接表：编号,起点,读数（每行一条）',value:'R1,蓝线,12秒\nR2,蓝线,12秒\nR2,蓝线,12秒\nR3,蓝线,15'}
    ],
    run(v){
      const parse=text=>text.trim().split(/\n/).map(l=>l.trim().split(/[,，]/).map(s=>s.trim()));
      const originals=new Map(), used=new Set(), groups=new Map(), log=[];
      for(const [i,row] of parse(v.source).entries()){
        const [id,gate,val]=row, match=/^(\d+(?:\.\d+)?)\s*秒$/.exec(val || '');
        if(row.length!==3 || !id || !gate || !match || !Number.isFinite(+match[1]) || +match[1]<=0 || originals.has(id)) return '原纸条第 '+(i+1)+' 行需有唯一编号、起点、正数和秒单位。';
        originals.set(id,{gate,seconds:+match[1]});
      }
      if(!v.entries.trim()) return '交接表为空，请逐行录入。';
      for(const [i,row] of parse(v.entries).entries()){
        const [id,gate,val]=row, ref=originals.get(id), match=/^(\d+(?:\.\d+)?)\s*(秒)?$/.exec(val || '');
        const prefix='行 '+(i+1)+'（'+(id || '无编号')+'）：';
        if(row.length!==3 || !ref || ref.gate!==gate || !match || +match[1]!==ref.seconds){log.push(prefix+'待查原纸条，本行暂不计入。');continue;}
        if(used.has(id)){log.push(prefix+'重复粘贴，不再计入。');continue;}
        used.add(id);
        if(!groups.has(gate)) groups.set(gate,[]);
        groups.get(gate).push(ref.seconds);
        log.push(prefix+(match[2]?'保留':'按原纸条补“秒”')+'，'+ref.seconds+' 秒。');
      }
      for(const [name,values] of groups) log.push(name+'组：'+values.length+' 次，均值 '+Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(2))+' 秒。');
      return log.join('\n');
    },
    checks:[{set:{},expect:'蓝线组：3 次，均值 13 秒'},{set:{entries:'R3,蓝线,15\nR4,侧门,9秒'},expect:'侧门组：1 次，均值 9 秒'},{set:{entries:'R3,蓝线,51秒'},expect:'待查原纸条'},{set:{entries:'R2,蓝线,12秒\nR2,蓝线,12'},expect:'重复粘贴'}]
  },
  'g6-06': {
    goal:'编辑能逐次比较两车的记录，给结论附上数据范围；在雨天或安全问题上指出缺测的证据。',
    product:'展签证据审稿桌',
    opening:'用三次秒表记录，能不能为“每所学校都更安全”这句话署名？',
    prediction:'逐行检查甲是否总在乙之前；只把一次 14 秒换成 18 秒，原句还能成立吗？',
    demonstration:'先投屏三次配对，选“甲每次用时较短”，只替换一行再审。恢复原值，只换展签的范围或指标，让观众读出缺少的那项记录。',
    debrief:'推翻“每次”需要几个反例？把计时做一百次，能补上摔倒次数这个证据吗？',
    student:'挑展签要说明的范围与主张，把成对读数录入首版；用文件里的证据编号向下一位编辑解释这句话能保留到哪里。',
    revision:'让编辑把最后一对改成平局，观察原结论怎样被挑战。修订主张后用原来的三对数据及这份平局数据各重测一次。',
    fields:[
      {key:'pairs',label:'给审稿员的配对秒数：甲,乙（每轮一行）',value:'14,17\n15,17\n14,16'},
      {key:'scope',label:'展签声称适用的范围',options:['本次固定参数沙盘','雨天的沙盘','任意学校的走廊']},
      {key:'claim',label:'展签中要核查的主张',options:['甲每次用时较短','甲平均用时较短','甲路线更安全']}
    ],
    run(v){
      const pairs=v.pairs.trim().split(/\n/).map(s=>s.trim().split(/[,，]/).map(x=>x.trim()));
      if(pairs.some(p=>p.length!==2 || p.some(x=>!x || !Number.isFinite(+x) || +x<=0))) return '需填写每轮两项正数秒值，例如 14,17；不能用缺测作为零秒。';
      const diffs=pairs.map(([a,b])=>Number(b)-Number(a));
      const rows=pairs.map(([a,b],i)=>'E2-'+(i+1)+'：甲 '+a+' 秒、乙 '+b+' 秒；'+(diffs[i]>0?'甲较短':diffs[i]<0?'乙较短':'平局'));
      rows.push('E1：同一沙盘、同一起终点、每格 1 秒、每角停 1 秒。E3：只记录到达用时。');
      if(v.scope!=='本次固定参数沙盘'){
        rows.push(v.scope==='雨天的沙盘'?'范围待测：未设置雨水与摩擦条件。':v.scope==='任意学校的走廊'?'范围待测：没有其他学校的观测。':'未知范围，请重新选择。');
      }
      if(v.claim==='甲路线更安全') rows.push('安全主张待测：缺少碰撞、摔倒等事先定义的指标记录。');
      else if(v.claim==='甲每次用时较短'){
        const ix=diffs.findIndex(n=>n<=0);
        rows.push(ix<0?'本表逐轮核对：'+pairs.length+' 次均为甲较短。':'本表反例：E2-'+(ix+1)+'，不能保留“每次”。');
      }else if(v.claim==='甲平均用时较短'){
        const delta=diffs.reduce((s,n)=>s+n,0)/diffs.length;
        rows.push('本表乙减甲的均值差为 '+Number(delta.toFixed(2))+' 秒；'+(delta>0?'支持甲平均较短。':'不支持甲平均较短。'));
      }else rows.push('未知主张，请重新选择。');
      return rows.join('\n');
    },
    checks:[{set:{},expect:'3 次均为甲较短'},{set:{pairs:'14,17\n18,17\n14,16'},expect:'本表反例：E2-2'},{set:{scope:'雨天的沙盘'},expect:'未设置雨水与摩擦条件'},{set:{claim:'甲平均用时较短'},expect:'2.33 秒'},{set:{claim:'甲路线更安全'},expect:'安全主张待测'},{set:{pairs:'14,'},expect:'不能用缺测作为零秒'}]
  }
};
