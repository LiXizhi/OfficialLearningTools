// Hands-on experiments for the end of grade four and the first three grade-five lessons.
export default {
  'g4-07': {
    goal: '隔着遮挡墙只凭颜色猜四张新卡，交卷后能指出两处误判。',
    product: '先交卷再翻牌的盲测馆',
    opening: '平时见过的白纸、蓝塑料能代表所有白色和蓝色物品吗？',
    prediction: '把白猜纸、蓝猜塑料的四次预测写齐，再猜它能答对几张。',
    demonstration: '投屏学习区四张明牌，浏览器排练先填三项再填四项，比较何时可见材质。打开 Paracraft 的测试墙，让第一次见卡的同学先登记再点背面翻牌。',
    debrief: '哪两张的颜色骗过了口令？已知答案后再试应记在哪一栏？',
    student: '从展台挑选颜色口令，独立设计第一版猜测单。排练后在 Paracraft 建公开区与挡墙，把四张底牌交给主持人，别在训练区展示。',
    revision: '让新搭档漏填第三题再交卷；将给他看的登记提示改得更具体，重测同一漏答。公开后的原题仅用于复盘，另找未见过的卡做下一次盲测。',
    fields: [
      {key:'notice',label:'给挑战者的登记提示',value:'按 T1 到 T4 的顺序填四个猜测，每行填纸或塑料。'},
      {key:'guesses',label:'T1 白、T2 蓝、T3 蓝、T4 白；我的猜测（每行一项）',value:''},
      {key:'mode',label:'本轮身份',options:['首次盲测','原题再练']}
    ],
    run(v) {
      const guesses = v.guesses.trim() ? v.guesses.trim().split(/\n/).map(x=>x.trim()) : [];
      const instructions = v.notice.trim() || '先猜四张，再统一翻牌。';
      const start = instructions + '\n训练展台：白纸、白信封、蓝塑料片、蓝瓶盖。';
      if (guesses.length!==4) return start+'\n已填 '+guesses.filter(Boolean).length+' 项。需要恰好四行有效猜测，四张答案继续封存。';
      const invalid = guesses.findIndex(x=>!['纸','塑料'].includes(x));
      if (invalid!==-1) return start+'\n请检查 T'+(invalid+1)+'，只接受纸或塑料。答案继续封存。';
      const truth = ['纸','塑料','纸','塑料'];
      const misses = [];
      const rows = guesses.map((guess,i)=>{
        if (guess!==truth[i]) misses.push('T'+(i+1));
        return 'T'+(i+1)+'：你猜'+guess+'，翻牌是'+truth[i]+'，'+(guess===truth[i]?'命中':'误判');
      });
      return [start,...rows,v.mode+'：'+(4-misses.length)+'/4；错例：'+(misses.join('、')||'无')].join('\n');
    },
    world(v){
      const label=JSON.stringify(String(v.notice||'请依次猜四张卡。').replace(/[\u0000-\u001f]/g,' '));
      const tag=JSON.stringify(String(v.mode).replace(/[\u0000-\u001f]/g,' '));
      return `registerClickEvent(function()
  local colors = {"白","蓝","蓝","白"}
  local truth = {1,2,1,2}
  local guesses = {}
  local tags = {"纸","塑料"}
  say(${label},2)
  for i=1,4 do
    local n=ask("T"..i.." "..colors[i].."色，请锁定猜测", tags)
    if n~=1 and n~=2 then say("本轮未交齐，答案继续封存",2) return end
    guesses[i]=n
  end
  local hits=0
  for i=1,4 do
    if guesses[i]==truth[i] then hits=hits+1 end
    say("T"..i.." 你猜"..tags[guesses[i]].."，实际是"..tags[truth[i]],2)
  end
  say(${tag}.."命中 "..hits.."/4",2)
end)`;
    },
    checks:[
      {set:{guesses:'纸\n塑料\n塑料\n纸'},expect:'首次盲测：2/4；错例：T3、T4'},
      {set:{guesses:'纸\n塑料\n纸\n塑料',mode:'原题再练'},expect:'原题再练：4/4；错例：无'},
      {set:{guesses:'纸\n塑料'},expect:'已填 2 项'},
      {set:{guesses:'纸\n布\n纸\n塑料'},expect:'请检查 T2'}
    ]
  },
  'g4-08': {
    goal:'保持十张测试卡不变，逐张找出新口令改对和改错的卡。',
    product:'十卡错例记分板',
    opening:'分数从七分升到八分，以前答对的卡还都对吗？',
    prediction:'先选颜色或纹理口令，猜蓝纤纸与蓝纤塑能不能同时判对。',
    demonstration:'投屏固定十卡，先按颜色口令，再仅换成纹理口令。浏览器排练记录翻转的卡号；在 Paracraft 点 3 号与 10 号角色复现同特征异材质。',
    debrief:'找出两个新误判，解释为什么继续收集不同特征可能比多抄同一张样本有效。',
    student:'用练习袋里的白纤纸、蓝滑塑及新增的蓝纤纸、白滑塑讨论口令。做一块 V1 计分板，再打开 Paracraft 搭分拣员和错例台，逐张点十个测试角色。',
    revision:'请邻桌用相同十卡跑两版，核对 3、4、8 和 5、10 的变化。新设计的卡另列为迁移挑战，不把固定测试卡用作训练材料。',
    fields:[
      {key:'rule',label:'要比较的分拣口令',options:['颜色：白猜纸，其余猜塑料','纹理：纤维纹猜纸，光滑猜塑料']},
      {key:'cards',label:'测试卡，每行编号、颜色、纹理、真材质（空格分隔）',value:'1 白 纤维纹 纸\n2 白 纤维纹 纸\n3 蓝 纤维纹 纸\n4 棕 纤维纹 纸\n5 白 光滑 纸\n6 蓝 光滑 塑料\n7 蓝 光滑 塑料\n8 白 光滑 塑料\n9 棕 光滑 塑料\n10 蓝 纤维纹 塑料'}
    ],
    run(v){
      const lines=v.cards.trim().split(/\n/).filter(s=>s.trim());
      if (!lines.length) return '请放入至少一张测试卡，再开赛。';
      const useTexture=v.rule.startsWith('纹理');
      const seen=new Set(), errors=[], results=[];
      let hits=0;
      for (const [index,line] of lines.entries()) {
        const parts=line.trim().split(/\s+/);
        const [id,color,texture,truth]=parts;
        if(parts.length!==4||seen.has(id)||!['白','蓝','棕'].includes(color)||!['纤维纹','光滑'].includes(texture)||!['纸','塑料'].includes(truth)) return '第 '+(index+1)+' 行有重复编号或未知特征，请核对卡片。';
        seen.add(id);
        const guess=(useTexture ? texture==='纤维纹' : color==='白')?'纸':'塑料';
        if(guess===truth) hits++; else errors.push(id);
        results.push(id+' 号：看'+(useTexture?texture:color)+' → 猜'+guess+'；底牌'+truth+'。');
      }
      return [...results,'命中 '+hits+'/'+lines.length+'，错例 '+(errors.join('、')||'无')].join('\n');
    },
    world(v){
      const rows=v.cards.trim().split(/\n/).filter(s=>s.trim()).map(s=>s.trim().split(/\s+/));
      if(!rows.length||rows.some(r=>r.length!==4||!['白','蓝','棕'].includes(r[1])||!['纤维纹','光滑'].includes(r[2])||!['纸','塑料'].includes(r[3]))||new Set(rows.map(r=>r[0])).size!==rows.length) return 'registerClickEvent(function() say("请核对测试卡：编号唯一，颜色、纹理和底牌齐全。",3) end)';
      const data=rows.map(r=>'{'+r.map(s=>JSON.stringify(s.replace(/[\u0000-\u001f]/g,' '))).join(',')+'}').join(',');
      const texture=v.rule.startsWith('纹理');
      return `registerClickEvent(function()
  local cards={${data}}
  local ids={}
  for i,card in ipairs(cards) do ids[i]=card[1].."号 "..card[2].." "..card[3] end
  local n=ask("选择一件测试物品",ids)
  local card=cards[n or 0]
  if not card then say("本次未选择物品",2) return end
  local guess="塑料"
  if ${texture?'card[3]=="纤维纹"':'card[2]=="白"'} then guess="纸" end
  turnTo(guess=="纸" and 90 or 270)
  say("分拣员转向"..guess.."道",2)
  if card[4]==guess then say("翻底牌："..card[4].."，命中",2)
  else say("翻底牌："..card[4].."，请记录错例 "..card[1],2) end
end)`;
    },
    checks:[
      {set:{},expect:'命中 7/10，错例 3、4、8'},
      {set:{rule:'纹理：纤维纹猜纸，光滑猜塑料'},expect:'命中 8/10，错例 5、10'},
      {set:{cards:'11 棕 光滑 纸'},expect:'命中 0/1，错例 11'},
      {set:{cards:'7 蓝 光滑 塑料\n7 白 光滑 纸'},expect:'第 2 行有重复编号'}
    ]
  },
  'g5-01': {
    goal:'只凭蓝顶三窗找出两个候选，再按底座编号取回唯一来源。',
    product:'可改登记册的模型展导览台',
    opening:'两座小塔从背面看一模一样，该读哪一段导览词？',
    prediction:'先猜“蓝顶”会命中几条，再猜编号 B12 会把你送到登记册哪一页。',
    demonstration:'先登记一件，再只添加同外观的 B12，投屏比较候选数。在 Paracraft 搭两座蓝顶三窗塔，分别点底座编号读展签，走到未登记的模型前测试求助。',
    debrief:'外观能告诉我们有哪些可能，哪一格让导览员能指回确切的资料页？',
    student:'在排练台编写 A12 的登记行，加一段自己写的导览词，测试编号查询。在 Paracraft 从空世界建 A12 及展签，并检查底座与数字导览台资料相符。',
    revision:'请参观者只报蓝顶，再补报 B12。复制 V1，加同外观的 B12 及来源页，重放同一查询；拿 C12 检查求助分支。',
    fields:[
      {key:'catalog',label:'展品登记册，每行 编号｜外观｜名称｜来源｜导览词',value:'A12｜蓝顶三窗｜听雨塔｜模型社登记册第4页｜在这里记录模拟雨声。\nB12｜蓝顶三窗｜借风塔｜模型社登记册第7页｜纸风轮展示气流方向。'},
      {key:'query',label:'底座号或外观线索',value:'蓝顶'},
      {key:'by',label:'查询入口',options:['按外观找候选','按编号打开展签']}
    ],
    run(v){
      const rows=v.catalog.trim().split(/\n/).filter(s=>s.trim()).map(s=>s.split(/[|｜]/).map(cell=>cell.trim()));
      const ids=new Set();
      for(const [i,row] of rows.entries()){
        if(row.length!==5||row.some(x=>!x)) return '登记册第 '+(i+1)+' 行缺少完整的五栏。';
        const id=row[0].toUpperCase(); if(ids.has(id)) return '重复编号 '+id+'，请先核对底座。'; ids.add(id);
      }
      const q=v.query.trim();
      if(!q) return '请先读底座编号，或输入一条看得见的外观线索。';
      const hits=rows.filter(([id,look])=>v.by.startsWith('按编号') ? id.toUpperCase()===q.toUpperCase():look.includes(q));
      if(!hits.length) return '没有找到“'+q+'”，请值班员核对登记册。';
      if(hits.length>1) return '候选 '+hits.length+' 件：'+hits.map(([id,,name])=>id+' '+name).join('、')+'。请看底座编号。';
      const [id,,name,source,line]=hits[0];
      return '展签 '+id+' · '+name+'\n'+line+'\n资料来自'+source;
    },
    world(v){
      const rows=v.catalog.trim().split(/\n/).filter(s=>s.trim()).map(s=>s.split(/[|｜]/).map(x=>x.trim()));
      if(!rows.length||rows.some(r=>r.length!==5||r.some(x=>!x))||new Set(rows.map(r=>r[0].toUpperCase())).size!==rows.length) return 'registerClickEvent(function() say("先核对登记册完整性和底座编号。",3) end)';
      const lua = s=>JSON.stringify(String(s).replace(/[\u0000-\u001f]/g,' '));
      const data=rows.map(r=>'{'+r.map(lua).join(',')+'}').join(',');
      return `registerClickEvent(function()
  local items={${data}}
  local mode=ask("你看到了什么？",{"外观线索","底座编号"})
  if mode==1 then
    local clue=${lua(v.query.trim())}
    local count=0
    for _,r in ipairs(items) do
      if clue~="" and string.find(r[2],clue,1,true) then
        count=count+1
        say("候选 "..r[1].." "..r[3],2)
      end
    end
    if count==0 then say("未找到该线索，请读底座号",2)
    elseif count>1 then say("同外观有多件，请核对底座号",2) end
  elseif mode==2 then
    local ids={}
    for i,r in ipairs(items) do ids[i]=r[1] end
    ids[#ids+1]="未登记编号"
    local n=ask("选择读到的编号",ids)
    local r=items[n or 0]
    if r then say(r[3].."："..r[5].." 来源："..r[4],4)
    else say("请值班员核对登记册",2) end
  end
end)`;
    },
    checks:[
      {set:{},expect:'候选 2 件'},
      {set:{query:'b12',by:'按编号打开展签'},expect:'资料来自模型社登记册第7页'},
      {set:{query:'C12',by:'按编号打开展签'},expect:'请值班员核对登记册'},
      {set:{catalog:'K1｜红盖｜小鼓｜自编图册第3页｜敲一敲',query:'红盖'},expect:'敲一敲'}
    ]
  },
  'g5-02': {
    goal:'访客能依据自己的双语展签操作纸偶剧场，作者按登记卡复核动作与成语。',
    product:'竹影台双语操作展签',
    opening:'如果一个访客完全照误译 Press the red button 去做，会看到纸鸟吗？',
    prediction:'先写下访客会按的键和看到的结果，演完用中文核查，看看是不是文字指错路。',
    demonstration:'投屏英文展签和虚构按钮，按红键看首页，再只把译文中的 red 改成 blue，请另一位读英文操作。单独圈出剩下的成语直译。',
    debrief:'哪一处有真实按键动作可以核查？“胸有成竹”还需要用什么语境说明？',
    student:'用给定名称、按钮图例和排练三次的故事写三行英文展签。打开 V1 展签把操作交给同伴，他读指令后自行选键。',
    revision:'保留 V1 译文和访客第一次按键，用相同中文再向 AI 加上小学科技展语境。把自己核实的一句改入 V2，再请访客照新译文操作。',
    fields:[
      {key:'english',label:'英文展签（三行可编辑）',value:'Bamboo Shadow Stage\nPress the red button to see the paper bird spread its wings in shadow.\nAfter three rehearsals, the director has bamboo in her chest.'},
      {key:'button',label:'访客读完展签亲自选择',options:['按红键','按蓝键']},
      {key:'note',label:'作者给访客的中文对照',value:'按蓝键，纸鸟的影子张开翅膀。小导演排练过三次，已经胸有成竹。'}
    ],
    run(v){
      const english=v.english.trim(), note=v.note.trim();
      if(!english||!note) return '请补齐中英两栏，访客才能复核展签。';
      const checks=[];
      if(!english.includes('Bamboo Shadow Stage')) checks.push('与登记卡核对展品英文名。');
      if(/press\s+(?:the\s+)?red\s+button/i.test(english)) checks.push('操作冲突：英文让访客按红键，展台图例规定蓝键开演。');
      if(/bamboo in (?:her|his|my|the) chest/i.test(english)) checks.push('成语需要复查：排练三次说明准备充分。');
      const stage=v.button==='按蓝键'?'舞台亮起 → 纸鸟影子展开翅膀':'返回首页 → 没有演出';
      return [english,'访客实按：'+v.button+' → '+stage,'中文对照：'+note,'指定词句筛查：'+(checks.join(' ')||'未触发三个预设提醒；请访客解释意思并核对原文。')].join('\n');
    },
    checks:[
      {set:{},expect:'操作冲突'},
      {set:{button:'按蓝键',english:'Bamboo Shadow Stage\nPress the blue button. The director is well prepared.'},expect:'纸鸟影子展开翅膀'},
      {set:{english:'Bamboo Shadow Stage\nTry the blue switch.'},expect:'请访客解释意思'},
      {set:{note:''},expect:'请补齐中英两栏'}
    ]
  },
  'g5-03': {
    goal:'按虚构阅读历史算分，增加两条同标签记录后重排两格书架，并解释探索位。',
    product:'可切换读者与探索位的图书角排架器',
    opening:'同样三本候选书，给星星和方方摆的两格书架会一样吗？',
    prediction:'星星添两本实验书前，先猜 A 和 B 哪本排第一，哪一列会变。',
    demonstration:'投屏星星的常规架，展示三本的得分。只加入两条实验记录再排一次；保持历史不动，切换探险架对比第二格。',
    debrief:'哪个标签被推荐得少，只表示历史记录少吗？找一位读者说明探索位怎样改变书架。',
    student:'选择一位虚构读者，编辑三本书的名称和标签，生成 V1 的两格书架，让另一位管理员从明细复算。',
    revision:'管理员给同一位读者增加两条实验记录，保留原榜首和新榜首；换另一位读者核查旧记录不受影响，再用同分的候选书验证排序。',
    fields:[
      {key:'reader',label:'虚构读者',options:['星星','方方','圆圆']},
      {key:'history',label:'该读者的新增记录（每行一个标签，可留空）',value:''},
      {key:'books',label:'候选书按 A、B、C……顺序，每行 书名｜主标签',value:'月轨邮局｜科幻\n纸桥承重赛｜实验\n古城的钟声｜历史'},
      {key:'shelf',label:'两格书架规则',options:['常规架','探险架']}
    ],
    run(v){
      const tags=['科幻','实验','历史'];
      const profiles={'星星':[2,1,0],'方方':[0,1,2],'圆圆':[1,2,0]};
      if(!Object.hasOwn(profiles,v.reader)) return '请选择已登记的虚构读者。';
      const scores=[...profiles[v.reader]];
      for(const t of v.history.split(/\n/).map(x=>x.trim()).filter(Boolean)){
        const index=tags.indexOf(t); if(index<0) return '新增记录“'+t+'”缺少有效的主标签。'; scores[index]++;
      }
      const rows=v.books.trim().split(/\n/).filter(x=>x.trim()).map((line,i)=>{
        const parts=line.split(/[|｜]/).map(x=>x.trim());
        return {name:parts[0],tag:parts[1],valid:parts.length===2&&parts[0]&&tags.includes(parts[1]),score:scores[tags.indexOf(parts[1])],order:i};
      });
      if(rows.length<2||rows.some(x=>!x.valid)) return '至少准备两本书，每行写书名和一个已知主标签。';
      const ranked=[...rows].sort((a,b)=>b.score-a.score||a.order-b.order);
      const rest=ranked.slice(1);
      if(v.shelf==='探险架') rest.sort((a,b)=>a.score-b.score||a.order-b.order);
      return [v.reader+'的历史：'+tags.map((t,i)=>t+scores[i]).join('、'),...rows.map(x=>x.name+'（'+x.tag+'）得 '+x.score+' 分'),'第一格：'+ranked[0].name,'第二格：'+rest[0].name+'（'+(v.shelf==='探险架'?'其余候选中选阅读最少的标签':'其余候选中最高分')+'，同分按录入顺序）'].join('\n');
    },
    checks:[
      {set:{},expect:'第一格：月轨邮局'},
      {set:{history:'实验\n实验'},expect:'第一格：纸桥承重赛'},
      {set:{reader:'方方',shelf:'探险架'},expect:'第二格：月轨邮局'},
      {set:{history:'戏剧'},expect:'缺少有效的主标签'}
    ]
  }
};
