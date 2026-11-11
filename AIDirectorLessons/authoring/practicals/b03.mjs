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
    checks:[
      {set:{},expect:'候选 2 件'},
      {set:{query:'b12',by:'按编号打开展签'},expect:'资料来自模型社登记册第7页'},
      {set:{query:'C12',by:'按编号打开展签'},expect:'请值班员核对登记册'},
      {set:{catalog:'K1｜红盖｜小鼓｜自编图册第3页｜敲一敲',query:'红盖'},expect:'敲一敲'}
    ]
  },
