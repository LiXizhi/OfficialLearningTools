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
    checks:[{set:{},expect:'左站 2 件，右站 1 件'},{set:{jobs:'红、蓝、黄'},expect:'黄件 → 右站（误投'},{set:{jobs:'紫、蓝',policy:'红向左，蓝向右，其余停步'},expect:'紫件 → 起点待确认'},{set:{jobs:''},expect:'发车单为空'}]
  },
