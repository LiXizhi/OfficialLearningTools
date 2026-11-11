export default {
  'g3-02': {
    goal: '遮住一处特征后，从两件候选中找出仍与可见线条相符的所有物品。',
    product: '可换道具的失物观察卡',
    opening: '圆口和直筒都看得见，你能断定右边有把手吗？',
    prediction: '请猜移走“弯把手”这条线索后，候选会从几件变成几件。',
    demonstration: '把两幅自画杯图并排放大，用三条线索运行。保留原图、候选与线索，只盖住弯把手再运行，数数留下的候选。说明此处匹配人工写下的特征。',
    debrief: '哪条可见线索排除了乙？纸片拿走了一条线索，能说明把手消失了吗？',
    student: '先画两件东西，每件写一行名字与特征；把图里确实看见的词填入观察栏，运行并导出。用同一张画请 AIChat 的视觉助手描述所见，把真实回复和此处的词语匹配分别记下。',
    revision: '请值日生遮住关键部位后重新认领。若新道具也符合旧线索，补入候选表，再用原线索重跑两版。',
    fields: [
      {key:'catalog',label:'道具：每行写 名称｜能看到的特征，用顿号隔开',value:'甲带把杯｜圆口、直筒、弯把手\n乙纸杯｜圆口、直筒\n丙勺子｜椭圆头、细柄'},
      {key:'seen',label:'清晰图中看见的线条',value:'圆口、直筒、弯把手'},
      {key:'covered',label:'纸片盖住哪条线索？留空表示未遮挡',value:''}
    ],
    run(v){
      const words = s => s.split(/[、，,\s]+/u).filter(Boolean);
      const hidden = new Set(words(v.covered));
      const visible = words(v.seen).filter(x => !hidden.has(x));
      if (!visible.length) return '没有可用线索；请移开一角遮纸，再写一条实际看见的线。';
      const candidates = [];
      for (const line of v.catalog.split('\n').filter(s => s.trim())) {
        const [name, features] = line.split(/[｜|]/);
        if (!name.trim() || !features?.trim()) return '请修好道具行：' + line;
        if (visible.every(x => words(features).includes(x))) candidates.push(name.trim());
      }
      return '露出的线条：' + visible.join('、') + '\n相符候选：' + (candidates.join('、') || '没有') + '\n' +
        (candidates.length === 1 ? '在这张道具表中只有一种符合；请核对原图。' : candidates.length ? '还有多种可能，请找一条能区分它们的新线索。' : '先检查画上的线和道具表是否用了同一个词。');
    },
    checks:[{set:{},expect:'相符候选：甲带把杯\n'},{set:{covered:'弯把手'},expect:'相符候选：甲带把杯、乙纸杯'},{set:{seen:''},expect:'没有可用线索'}]
  },
  'g3-03': {
    goal:'把实际转写与原稿逐字对齐，说出要改的词，再按核准稿播报。',
    product:'广播员的逐字对稿台',
    opening:'广播让我们拿“篮子”，原稿说拿“蓝纸”。机器读得顺，广播就能发吗？',
    prediction:'猜一猜“蓝纸”变成“篮子”需要几次单字替换；如果漏掉“蓝”字，又该怎样修？',
    demonstration:'投屏原稿和练习转写，运行对字。只删掉转写中的“蓝”，重新对字；比较漏字和换字的修补办法。回到 AIChat 口述一次，带回实际转写做同样核对。',
    debrief:'哪一处改动会让听众拿错东西？校对后的稿子由人确认过了吗？',
    student:'写一则没有个人信息的短通知；在允许语音输入时，读一遍并粘贴真实转写，核准后在工作台用朗读试听，也可交同桌代读。没有语音时沿用模拟转写并标清。',
    revision:'请同桌按试听内容拿道具。只把容易听错的词换成更清楚的说法，同速重读，分开保存两次原稿与转写。',
    fields:[{key:'script',label:'原稿（限 120 字）',value:'请拿蓝纸，到星星台集合。'},{key:'transcript',label:'转写文字（可用练习稿或换成真实结果）',value:'请拿篮子，到星星台集合。'}],
    run(v){
      const chars = s => Array.from(s.replace(/[\s，。！？、,.!?]/gu,''));
      const a = chars(v.script), b = chars(v.transcript);
      if (!a.length || !b.length) return '缺一份文字。请把原稿和转写都放到对应格，再对字。';
      if (Math.max(a.length,b.length)>120) return '请分段对稿，每段最多 120 个字。';
      const table = Array.from({length:a.length+1},(_,i)=>Array.from({length:b.length+1},(_,j)=>i ? j ? 0 : i : j));
      for(let i=1;i<=a.length;i++) for(let j=1;j<=b.length;j++){
        table[i][j]=Math.min(table[i-1][j-1]+Number(a[i-1]!==b[j-1]),table[i-1][j]+1,table[i][j-1]+1);
      }
      const edits=[];
      let i=a.length,j=b.length;
      while(i || j){
        const score=table[i][j];
        if(i && j && score===table[i-1][j-1]+Number(a[i-1]!==b[j-1])){
          if(a[i-1]!==b[j-1]) edits.push('原稿第'+i+'字：把“'+b[j-1]+'”换为“'+a[i-1]+'”');
          i--;j--;
        } else if(i && score===table[i-1][j]+1) { edits.push('原稿第'+i+'字：补上“'+a[i-1]+'”');i--; }
        else { edits.push('转写第'+j+'字：删去多出的“'+b[j-1]+'”');j--; }
      }
      return '忽略空格和停顿标点，共需 '+edits.length+' 处单字修改。\n'+(edits.reverse().join('\n') || '两份用字相同。')+'\n人工核准时请读原稿：'+v.script;
    },
    checks:[{set:{},expect:'共需 2 处'},{set:{transcript:'请拿纸，到星星台集合。'},expect:'补上“蓝”'},{set:{transcript:''},expect:'缺一份文字'}]
  },
  'g3-04': {
    goal:'让三件货物依次经过判断站，能指出“否则”把哪一件误送到了蓝站。',
    product:'红蓝货站逐件调度器',
    opening:'队尾混进一块黄色方块。如果只问一次“红不红”，它会去哪？',
    prediction:'先写下红、蓝、黄三件货的目的地，再看逐件轨迹。',
    demonstration:'在浏览器排练红蓝红，记录站内件数；只把末件换黄，旧规则再跑。打开实际 Paracraft，点起点机器人输黄件，核对它走到哪，再展示改变分支后的行动。',
    debrief:'轨迹里的哪一次判断放走了黄件？蓝件在新版还能去原来的站吗？',
    student:'先在浏览器排练，写自己的发车单，再打开空白 Paracraft 世界，搭左右站；给起点机器人装入颜色判断 CodeBlock，点角色逐件发车并记录到站顺序。',
    revision:'请接班同学给两个版本发相同的红蓝黄三件，比较末件位置，再按原发车单核查两站件数。',
    fields:[{key:'jobs',label:'发车单，按顺序写颜色，用顿号隔开',value:'红、蓝、红'},{key:'policy',label:'分流指令',options:['红向左，否则向右','红向左，蓝向右，其余停步']}],
    run(v){
      const jobs=v.jobs.split(/[、，,\s]+/u).filter(Boolean);
      if(!jobs.length) return '发车单为空，机器人留在起点。';
      const stops=[[],[],[]], trips=[];
      for(const [index,color] of jobs.entries()){
        const gate=color==='红'?0:color==='蓝'||v.policy==='红向左，否则向右'?1:2;
        stops[gate].push(color);
        trips.push((index+1)+'号 '+color+'件 → '+['左站','右站','起点待确认'][gate]+(gate===1 && color!=='蓝'?'（误投，右站只收蓝）':''));
      }
      return trips.join('\n')+'\n卸货后：左站 '+stops[0].length+' 件，右站 '+stops[1].length+' 件，待确认 '+stops[2].length+' 件。';
    },
    world(v){
      const quote=s=>JSON.stringify(String(s).replace(/[\u0000-\u001f]/gu,' '));
      const jobs=v.jobs.split(/[、，,\s]+/u).filter(Boolean);
      const strict=v.policy==='红向左，蓝向右，其余停步';
      return [
        'registerClickEvent(function()',
        '  local trip = ask("从同一起点发车", {"跑我的发车单","只换末件为黄，再跑","单独试蓝件"})',
        '  if trip ~= 1 and trip ~= 2 and trip ~= 3 then return end',
        '  local jobs = {'+jobs.map(quote).join(', ')+'}',
        '  if trip == 3 then jobs = {"蓝"} end',
        '  if #jobs == 0 then say("没有货物，留在起点。", 2) return end',
        '  if trip == 2 then jobs[#jobs] = "黄" end',
        '  for i, color in ipairs(jobs) do',
        '    if color == "红" then',
        '      turnTo(-90)\n      walkForward(2, 1)\n      say(color.."件到左站", 2)\n      walkForward(-2, 1)',
        '    elseif color == "蓝" or '+(strict?'false':'true')+' then',
        '      turnTo(90)\n      walkForward(2, 1)\n      say(color.."件到右站，请对照站牌检查", 2)\n      walkForward(-2, 1)',
        '    else say(color.."件留在起点，等待人工确认。", 2) end',
        '    turnTo(0)',
        '  end',
        'end)'
      ].join('\n');
    },
    checks:[{set:{},expect:'左站 2 件，右站 1 件'},{set:{jobs:'红、蓝、黄'},expect:'黄件 → 右站（误投'},{set:{jobs:'紫、蓝',policy:'红向左，蓝向右，其余停步'},expect:'紫件 → 起点待确认'},{set:{jobs:''},expect:'发车单为空'}]
  },
  'g3-05': {
    goal:'选一个结局把三幕接成可读的故事，标出最后一句是谁写的，再用原前两幕试听另一结局。',
    product:'图书角三幕分镜排演册',
    opening:'小机器人在地毯上捡到一张无名借书卡，读者到第几幕才该知道它怎么做？',
    prediction:'把结局从 A 换到 B，哪些台词和作者标签应该跟着换？',
    demonstration:'投屏前两幕，暂停让全班猜。保留镜头、原稿和角色，只切换结局排演一次，指认最后一幕中变化的动作及署名。',
    debrief:'读者能指出第二幕哪一处提示接上了结局吗？你保留了哪一句自己的话？',
    student:'写自己的开头、线索和两种结局，给每幕台词注明出处。选 A 排演，保存副本，请同伴读到第二幕先猜。用 AIChat 补写时，先把作者标签标清。',
    revision:'让同伴读相同前两幕再试 B；如果不知道值班员为何出现，只改第三幕加入照应拾物牌的动作，再按原结局重读。',
    fields:[
      {key:'one',label:'第一幕台词：作者标签｜正文',value:'我想的｜小机器人捡起地毯上的无名借书卡。'},
      {key:'two',label:'第二幕台词：作者标签｜正文',value:'我想的｜借阅台挂着一块“拾物交给值班员”的牌子。'},
      {key:'a',label:'结局 A：作者标签｜正文',value:'我改写｜小机器人照着牌子把卡交给值班员。'},
      {key:'b',label:'结局 B：作者标签｜正文',value:'我想的｜它先画一张寻卡提示，再请值班员保管卡。'},
      {key:'ending',label:'这一次演哪条路线？',options:['结局 A','结局 B','暂停在第二幕']}
    ],
    run(v){
      const pending=v.ending==='暂停在第二幕';
      const lines=[v.one,v.two,...(pending?[]:[v.ending==='结局 B'?v.b:v.a])];
      const scenes=[];
      for(const [i,line] of lines.entries()){
        const pos=line.search(/[｜|]/u);
        if(pos<1 || !line.slice(pos+1).trim()) return '第 '+(i+1)+' 幕还没写全。请补“作者标签｜台词”。';
        scenes.push('镜头 '+(i+1)+'〔'+line.slice(0,pos).trim()+'〕\n'+line.slice(pos+1).trim());
      }
      return scenes.join('\n\n')+(pending?'\n\n镜头停在拾物线索上。请读者说出自己的结局，再选 A 或 B。':'\n\n落幕 · '+v.ending+'。请指出前一幕怎样给这个动作留下线索。');
    },
    checks:[{set:{},expect:'镜头 3〔我改写〕'},{set:{ending:'结局 B',b:'我想的｜机器人用纸折了一个卡套。'},expect:'机器人用纸折了一个卡套。'},{set:{ending:'暂停在第二幕'},expect:'镜头停在拾物线索上'},{set:{a:'我改写｜'},expect:'第 3 幕还没写全'}]
  },
  'g3-06': {
    goal:'把编出的开门时间追到原公告；揭开新证据后能重判同一条答复。',
    product:'错题诊所的公告查证台',
    opening:'有人非常肯定地说“九点开门”。我们手上的公告究竟有没有写？',
    prediction:'同一句答复，给公告补一条时间记录后，判定会变成什么？如果补的是十点呢？',
    demonstration:'先用两行公告核对“开门时间｜九点”，给公告只加“开门时间｜九点”重测，再改为十点。让全班从输出指回证据行，辨别无证据和有反证。',
    debrief:'两次都有“九点”这个猜测，为什么只有一次可以盖章？遇到相互矛盾的公告行该找谁？',
    student:'为公告病例写两条可核实事实，拿示例答复运行。可换成便条病例，把作者补写的“重的东西｜盒子”作为证据；在 AIChat 先用原便条提问、再用补写便条重问，记录真实回答。',
    revision:'请同桌扮演核查员，先查缺项，再补一行证据；让他在两版使用原来的答复，并检查相反证据和未知是不是得到不同提示。',
    fields:[{key:'source',label:'公开练习资料，每行一条：项目｜事实',value:'日期｜周六\n地点｜纸屋'},{key:'claim',label:'要核查的固定答复：项目｜说法',value:'开门时间｜九点'}],
    run(v){
      const parse=s=>{
        const p=s.split(/[｜|]/u).map(x=>x.trim());
        return p.length===2 && p.every(Boolean)?p:null;
      };
      const claim=parse(v.claim);
      if(!claim) return '请写清要核查的项目和说法，例如“地点｜纸屋”。';
      const matches=[];
      for(const [i,line] of v.source.split('\n').entries()){
        if(!line.trim()) continue;
        const row=parse(line);
        if(!row) return '资料第 '+(i+1)+' 行需要补成“项目｜事实”。';
        if(row[0]===claim[0]) matches.push({number:i+1,value:row[1]});
      }
      if(!matches.length) return '待查：资料中没有“'+claim[0]+'”条目。\n请找公告发布人确认，暂不填写“'+claim[1]+'”。';
      const values=new Set(matches.map(m=>m.value));
      const lines=matches.map(m=>'第 '+m.number+' 行写着“'+m.value+'”').join('\n');
      if(values.size>1) return '待人工核实：同一项目有冲突记录。\n'+lines;
      return (values.has(claim[1])?'已核实：答复与原文相同。':'有出入：请对照原文字面检查说法。')+'\n'+lines;
    },
    checks:[{set:{},expect:'没有“开门时间”条目'},{set:{source:'地点｜纸屋\n开门时间｜九点'},expect:'已核实：答复与原文相同'},{set:{source:'开门时间｜十点'},expect:'有出入'},{set:{source:'开门时间｜十点\n开门时间｜九点'},expect:'有冲突记录'}]
  },
  'g3-07': {
    goal:'将带隐私标签的练习信留在起点，移走无关资料以后还能清楚问出活动目标。',
    product:'送信机器人与安全问题拼装台',
    opening:'要问下雨天可以玩什么，机器人需要先知道你的地址吗？',
    prediction:'只抽走信封上的隐私条，问题本身还能读懂吗？还有一个标签没抽走会怎样？',
    demonstration:'用虚构标签在浏览器排练组信，先加两种标签，再只改变保留标签的开关。实际打开 Paracraft 后点展板送信员，依次选原信和改写信，观察停步或放行。',
    debrief:'取走标签后哪些活动条件仍在？程序看见标签能拦截，没看见标签时谁来检查？',
    student:'用活动目标、安全条件与虚构标签拼第一版。打开 Paracraft 建展板，贴出五类隐私和安全改写；点送信员，把两封信分别送到停步线或待核查门。',
    revision:'请第一次来参观的队员在两版用同一封带姓名和住址标签的练习信试玩，修改安全条件后重测，听他说出活动目标；所有信只在练习世界展示。',
    fields:[{key:'goalText',label:'练习目标，只写活动问题，不填真人资料',value:'下雨天可以玩什么游戏？'},{key:'condition',label:'可保留的安全活动条件',value:'室内，不用球。'},{key:'tags',label:'虚构隐私标签，用顿号隔开。可填姓名、住址、电话、身份证号、同学照片',value:'姓名、住址'},{key:'mode',label:'拼信方式',options:['贴上标签','抽走标签']}],
    run(v){
      if(!v.goalText.trim()) return '还没有活动问题；请先写想完成什么。';
      const tags=v.tags.split(/[、，,\s]+/u).filter(Boolean);
      const known=['姓名','住址','电话','身份证号','同学照片'];
      const bad=tags.find(x=>!known.includes(x));
      if(bad) return '练习只收五种虚构标签。请从标签说明中选词，不填真实资料。';
      const kept=v.mode==='抽走标签'?[]:[...new Set(tags)];
      const msg=v.goalText.trim()+' '+v.condition.trim()+kept.map(x=>'〔'+x+'〕').join('');
      return '排练信：'+msg.trim()+'\n'+(kept.length?'停在线内；还贴着 '+kept.length+' 类隐私标签：'+kept.join('、')+'。':'进入人工核查门。请逐字检查活动文字里还有没有私密内容。')+'\n本台只演练标签，不会寄出消息。';
    },
    world(v){
      const quote=s=>JSON.stringify(String(s).replace(/[\u0000-\u001f]/gu,' '));
      const valid=['姓名','住址','电话','身份证号','同学照片'];
      const tags=v.tags.split(/[、，,\s]+/u).filter(Boolean);
      const ready=Boolean(v.goalText.trim()) && tags.every(x=>valid.includes(x));
      const practice=quote(v.goalText.trim()+' '+v.condition.trim());
      return [
        'registerClickEvent(function()',
        ready ? '  local pick = ask("送信排练：这次检查哪一封？", {"按我的设置组信","同题重测：抽走标签","意外来信：贴上照片标签"})' : '  say("请先填写活动问题，并只使用规定的虚构标签。", 3)\n  return',
        ...(ready?[
          '  if pick == 3 then',
          '    say("停在线内，取下同学照片标签。", 3)',
          '  elseif pick == 1 and '+(v.mode==='贴上标签' && tags.length?'true':'false')+' then',
          '    say('+quote('停在线内，先取下：'+tags.join('、'))+', 3)',
          '  elseif pick == 1 or pick == 2 then',
          '    say('+practice+', 3)',
          '    turnTo(90)\n    walkForward(1, 1)\n    say("到人工核查门；请读信，确认没有隐私。", 3)\n    walkForward(-1, 1)',
          '  end'
        ]:[]),
        'end)'
      ].join('\n');
    },
    checks:[{set:{},expect:'还贴着 2 类隐私标签'},{set:{mode:'抽走标签'},expect:'进入人工核查门'},{set:{tags:'电话、同学照片'},expect:'还贴着 2 类隐私标签：电话、同学照片'},{set:{goalText:''},expect:'还没有活动问题'}]
  }
};
