// Each run function also powers the corresponding standalone visitor activity.
export default {
  'g3-08': {
    goal: '让访客按兴趣找到展牌，独立说出本领、失误和安全用法；发现缺格时能请作者补展签。',
    product: '会带路的 AI 观察手册',
    opening: '我只有三分钟，想看会听话的机器。谁能带我直接到它的展位？',
    prediction: '预测选择“听和说”时会到哪一站。如果拿掉那张展牌的安全提醒，导览员该说什么？',
    demonstration: '投屏运行完整手册，只删语音展位的最后一格，再用同一兴趣参观。对照缺格提示后打开实际 Paracraft 世界，点入口导览员，查看它带到的那块展牌。',
    debrief: '访客从哪一格知道广播声会盖住方向词？他能照着哪一句再问一次？',
    student: '按五格做三张自己的观察牌。浏览器排练能带到对应兴趣的展位后，打开实际 Paracraft 搭三块展牌，给导览员加点击选站，再让新同学参观。',
    revision: '让隔壁班同学选“听和说”，请他说出实际应对办法。只改语音牌的安全提醒，保持入口和兴趣不变，让他重走并复述。',
    fields: [
      {key:'cards',label:'展签，每行用“｜”隔开本领组、名称、场景、本领、失误、安全提醒',value:'看｜识叶助手｜植物角｜看叶形猜名称｜遮住叶缘会认错｜查观察手册\n听和说｜语音导览员｜走廊｜听问题说方向｜广播盖住方向词｜安静后再问一次\n创作｜绘本助手｜故事社｜按文字画鸟｜两只画成三只｜作者数鸟并标注AI辅助'},
      {key:'interest',label:'访客想看',options:['听和说','看','创作','全部展位']}
    ],
    run(v) {
      const interest = (v.interest || '').trim();
      const result = [];
      let found = 0;
      const fields = ['名称','场景','本领','失误','安全提醒'];
      for (const [i,line] of (v.cards || '').split(/\r?\n/).entries()) {
        if (!line.trim()) continue;
        const [group,...info] = line.split(/[|｜]/).map(x=>x.trim());
        if (group !== interest && interest !== '全部展位') continue;
        found++;
        result.push('入口 → 第' + (i+1) + '展位 ' + (info[0] || '未命名'));
        for (const [n,label] of fields.entries()) {
          result.push(label + '：' + (info[n] || '请作者补上' + label));
        }
      }
      return found ? result.join('\n') : '入口停步：没有找到这个兴趣的展牌，请查看全部展位。';
    },
    world(v) {
      const quote = text => '"' + String(text).replace(/["\\\x00-\x1f\x7f]/g, ch=>'\\'+String(ch.charCodeAt(0)).padStart(3,'0')) + '"';
      const rows = (v.cards || '').split(/\r?\n/).filter(x=>x.trim()).map(x=>x.split(/[|｜]/).map(t=>t.trim()));
      if (!rows.length) return 'registerClickEvent(function() say("还没有展牌，请先填好观察卡。", 4) end)';
      const entries = rows.map(([group,name,scene,skill,mistake,tips],i)=>{
        const route = (i+1)+'号展位 '+(group || '待分类')+' · '+(name || '未命名');
        const lines = [['场景',scene],['本领',skill],['失误',mistake],['安全提醒',tips]].map(([label,x])=>quote(label+'：'+(x || '请作者补上'+label)));
        return '{'+[quote(route),...lines].join(',')+'}';
      });
      return `local stands = {${entries.join(',')}}
registerClickEvent(function()
  local choices = {}
  for i = 1, #stands do choices[i] = stands[i][1] end
  local i = ask("想参观哪块展牌？", choices)
  local card = stands[i]
  if not card then return end
  turnTo(90)
  walkForward(i)
  say(card[1], 2)
  for j = 2, 5 do say(card[j], 3) end
  turnTo(270)
  walkForward(i)
  say("回到入口，请下一位访客选站。", 2)
end)`;
    },
    checks: [
      {set:{},expect:'入口 → 第2展位 语音导览员'},
      {set:{cards:'听和说｜钟声助手｜礼堂｜听钟声｜回声时会数错｜'},expect:'请作者补上安全提醒'},
      {set:{cards:'创作｜绘本助手｜社团｜画鸟｜多画一只｜数一遍'},expect:'没有找到这个兴趣的展牌'}
    ]
  },
  'g4-02': {
    goal: '把六件文具的长度统一成厘米并排序，保留来源；发现裸数字时从排名中移出，核对后能恢复原位。',
    product: '值日生文具排序架',
    opening: '纸夹只有三厘米，为什么在一张表里会跑到直尺前面？',
    prediction: '把纸夹的 30 mm 只改成 30，猜猜它会在队列中移动还是暂时退出。',
    demonstration: '运行六件文具表，点读最长和最短记录。仅删纸夹的单位再运行，用测量原卡的30毫米恢复，核对它重回第六名。',
    debrief: '纸夹回到第六名的依据是哪个单位？表里的“叮”为什么不能点开播放？',
    student: '按列录入或替换自己的文具卡，保留单位、数量和文字速记。制作排序架，打开首版确认六件齐全，点明图像和音频要另采文件。',
    revision: '请值日生故意录入漏单位长度。只修正该项，用同一降序再排一次，比较待查栏与末位是否都改变。',
    fields: [
      {key:'items',label:'每行用｜分开 名称、长度含单位、件数、外观速记、声音速记',value:'直尺｜15 cm｜1｜透明长条｜啪\n铅笔｜12 cm｜2｜黄杆｜嗒\n橡皮｜4 cm｜1｜白块｜咚\n粉笔｜6 cm｜3｜白棒｜嗒\n胶棒｜8 cm｜1｜圆筒｜咚\n纸夹｜30 mm｜4｜银色弯丝｜叮'},
      {key:'order',label:'架上顺序',options:['从长到短','从短到长']}
    ],
    run(v) {
      const valid = [], issues = [];
      for (const line of (v.items || '').split(/\r?\n/).filter(x=>x.trim())) {
        const [name,length,count,look,sound] = line.split(/[|｜]/).map(x=>x.trim());
        const match = /^(\d+(?:\.\d+)?)\s*(cm|mm|厘米|毫米)$/i.exec(length || '');
        if (!name || !match || !Number.isFinite(Number(match[1])) || Number(match[1]) <= 0 || !/^[1-9]\d*$/.test(count || '')) {
          issues.push('待查：' + (name || '无名卡') + '，请核对正长度、单位和件数（原卡 ' + (length || '空') + '）。');
          continue;
        }
        const cm = Number(match[1]) / (/^(mm|毫米)$/i.test(match[2]) ? 10 : 1);
        valid.push({name,cm,count,look,sound,length});
      }
      valid.sort((a,b)=>v.order === '从短到长' ? a.cm-b.cm : b.cm-a.cm);
      const ranks = valid.map((r,i)=> (i+1)+'．'+r.name+' '+r.cm+'厘米（原卡 '+r.length+'，'+r.count+'件）；文字速记：'+(r.look || '未记')+'／'+(r.sound || '未记'));
      return [...ranks,...issues].join('\n') || '架上没有文具，请录入一张测量卡。';
    },
    checks: [
      {set:{},expect:'6．纸夹 3厘米'},
      {set:{order:'从短到长'},expect:'1．纸夹 3厘米'},
      {set:{items:'纸夹｜30｜4｜银色弯丝｜叮'},expect:'待查：纸夹'},
      {set:{items:'书签｜75 mm｜1｜蓝色｜啪'},expect:'1．书签 7.5厘米'}
    ]
  },
  'g4-03': {
    goal: '在同一对绿瓶上逐步揭示特征，亲眼看见候选项何时缩小；复合物按部件各查一次。',
    product: '可改样本的特征放大镜',
    opening: '垃圾站收到一张只有“绿”字的观察卡，为什么两只瓶子都举了手？',
    prediction: '只公开“透光”，候选会少一只吗？公开“能按瘪”以后呢？',
    demonstration: '以绿色、透光、能按瘪、光滑为观察对象。先只揭颜色，再逐次揭透光和硬软，将两次候选个数写在黑板上，检查消掉的是哪张卡。',
    debrief: '是哪一条新证据排除了玻璃瓶？零个候选说明新物一定不存在，还是提醒我们再补样本？',
    student: '录入六件参考物，做可改变揭示层数的放大镜；用三项可见特征核查一次，再用白盒或自己设计的观察卡测试。',
    revision: '请同桌只凭绿色猜一回，保留猜测；给带盖纸杯拆成杯身和盖两条观察，分别补样本后用同两行重查。',
    fields: [
      {key:'library',label:'参考物，每行 名称｜颜色｜透光性｜硬软｜纹理｜材质',value:'A瓶｜绿｜透光｜坚硬｜光滑｜玻璃\nB瓶｜绿｜透光｜能按瘪｜光滑｜塑料\nC盒｜白｜不透光｜可折｜有纸纤维｜纸\nD盒｜白｜不透光｜轻软｜有细颗粒｜泡沫\nE片｜棕｜不透光｜可折｜有纸纤维｜纸\nF罐｜透明｜透光｜坚硬｜光滑｜玻璃'},
      {key:'observations',label:'待查物或部件，每行 名称｜颜色｜透光性｜硬软｜纹理',value:'访客的瓶子｜绿｜透光｜能按瘪｜光滑'},
      {key:'layers',label:'揭开线索',options:['只看颜色','再看透光性','再看硬软','看全部四项']}
    ],
    run(v) {
      const parse = s=>(s || '').split(/\r?\n/).filter(x=>x.trim()).map(x=>x.split(/[|｜]/).map(x=>x.trim()));
      const references = parse(v.library).filter(row=>row.length===6 && row.every(Boolean));
      const questions = parse(v.observations);
      const levels = ['只看颜色','再看透光性','再看硬软','看全部四项'];
      const count = levels.indexOf(v.layers)+1;
      if (!references.length || !questions.length || !count) return '请补齐参考物、待查部件和揭示层数。';
      return questions.map(([name,...features])=>{
        const visible = features.slice(0,count);
        if (!name || visible.length!==count || visible.some(x=>!x)) return (name || '待查物')+'：当前层缺少线索，暂不归类。';
        const hits = references.filter(row=>visible.every((f,i)=>row[i+1]===f));
        const labels = [...new Set(hits.map(row=>row[5]))];
        return name+'，揭开 '+visible.join('／')+' → '+hits.length+' 张匹配卡：'+(hits.map(row=>row[0]).join('、') || '无')+'。'+(labels.length ? '可能材质：'+labels.join('、') : '现有参考物不够，请补卡或复核。');
      }).join('\n');
    },
    checks: [
      {set:{},expect:'2 张匹配卡：A瓶、B瓶'},
      {set:{layers:'再看硬软'},expect:'1 张匹配卡：B瓶'},
      {set:{observations:'新盒｜蓝｜不透光｜可折｜有纸纤维'},expect:'现有参考物不够'},
      {set:{observations:'新盒｜白',layers:'再看硬软'},expect:'当前层缺少线索'}
    ]
  },
  'g4-04': {
    goal: '保留两位标注者的原判，找出分歧；同一文件夹换两张参考签重测，能追查带偏结果的参考卡号。',
    product: '可以追查错签的双人校对台',
    opening: '同桌和我给白盒贴了不同的标签。是有人粗心，还是证据真的不够？',
    prediction: '如果3号和4号的证据不改，标签却一起换成纸，固定规则会给文件夹贴什么？',
    demonstration: '运行正确参考袋，记录6号文件夹的机器签与依据。只改3、4的参考标签再运行，检查两人的原签是否保持原样。向真正的AI询问时单独记录它的回复。',
    debrief: '谁能指出两张使规则改口的原卡？白盒与混合物又在哪些地方需要人继续确认？',
    student: '自己与同桌分别对八张卡填写一列，两人完成后再放入校对台。用四张正确参考卡出首版，按卡号检查每项分歧，再试两个错签。',
    revision: '请新标注员用相同的6号卡查错。只修正一张塑料参考签，看规则是否转为待核；再修另一张，记录同一输入何时恢复正确。',
    fields: [
      {key:'refs',label:'参考袋，每行 编号｜证据｜标签',value:'1｜纸纤维｜纸\n2｜纸纤维｜纸\n3｜塑料标记｜塑料\n4｜塑料标记｜塑料'},
      {key:'samples',label:'独立记录，每行 物品｜证据｜我的签｜同桌签；混合物部件用＋分开',value:'1草稿纸｜纸纤维｜纸｜纸\n2瓦楞纸｜纸纤维｜纸｜纸\n3瓶盖｜塑料标记｜塑料｜塑料\n4尺｜塑料标记｜塑料｜塑料\n5纸袋｜纸纤维｜纸｜纸\n6文件夹｜塑料标记｜塑料｜塑料\n7白盒｜无证据｜纸｜待核\n8带纸套的塑料盒｜纸纤维＋塑料标记｜纸＋塑料｜塑料'}
    ],
    run(v) {
      const parse = s=>(s || '').split(/\r?\n/).filter(x=>x.trim()).map(x=>x.split(/[|｜]/).map(x=>x.trim()));
      const refs = parse(v.refs).filter(r=>r.length===3 && r.every(Boolean));
      const rows = parse(v.samples);
      if (!rows.length) return '还没有独立记录，请两位标注员各自填写。';
      return rows.map(([name,evidence,a,b])=>{
        const parts = (evidence || '').split(/[+＋]/);
        const guesses = parts.map(part=>{
          const hits = refs.filter(r=>r[1]===part.trim());
          const labels = [...new Set(hits.map(r=>r[2]))];
          return (labels.length===1 ? labels[0] : '待核')+'（依据卡 '+(hits.map(r=>r[0]).join('、') || '无')+'）';
        });
        return (name || '无名卡')+'：模拟签 '+guesses.join('＋')+'；我的／同桌 '+(a || '未填')+'／'+(b || '未填')+'，'+(!a || !b ? '尚未完成双人独立记录' : a===b ? '两人一致' : '有分歧，请翻原卡。');
      }).join('\n');
    },
    checks: [
      {set:{},expect:'6文件夹：模拟签 塑料（依据卡 3、4）'},
      {set:{refs:'3｜塑料标记｜纸\n4｜塑料标记｜纸'},expect:'6文件夹：模拟签 纸（依据卡 3、4）'},
      {set:{refs:'3｜塑料标记｜塑料\n4｜塑料标记｜纸'},expect:'6文件夹：模拟签 待核（依据卡 3、4）'},
      {set:{},expect:'7白盒：模拟签 待核（依据卡 无）'}
    ]
  },
  'g4-05': {
    goal: '用双通道站实际执行两种判断顺序，逐件追踪走过的门、终点和步数。',
    product: '会印出过门脚印的分拣站',
    opening: '布片干干净净，能不能直接走进纸道？哪扇门会把它拦住？',
    prediction: '先问干净不干净时，干净布片比原先多走还是少走一道门？它的终点会改变吗？',
    demonstration: '用路线甲依次放入四张卡，再只切换门的顺序，投屏对照C、D轨迹。在实际 Paracraft 点分拣站入口，放置相同物品，逐门计步。',
    debrief: '哪张卡少走了一步，哪张多走了一步？班上能从轨迹解释为什么两条路送到相同终点吗？',
    student: '先在浏览器排练四卡，画出每个“否”的出口，再打开实际 Paracraft 搭材质门、洁净门和两条回收道，点击机器人测试第一件纸卡。',
    revision: '请同桌用D卡先走甲路、再走乙路；只移动两门的顺序，复测同一张干净布卡，记录终点与步数。',
    fields: [
      {key:'route',label:'机器人过门顺序',options:['先查材质','先查干净']},
      {key:'cards',label:'每行 卡名｜材质｜干净或有污点',value:'A卡｜纸｜干净\nB卡｜塑料｜干净\nC卡｜纸｜有污点\nD卡｜布｜干净'}
    ],
    run(v) {
      const lines = (v.cards || '').split(/\r?\n/).filter(x=>x.trim());
      if (!lines.length) return '入口等待图卡。';
      return lines.map(line=>{
        const [name,material,clean] = line.split(/[|｜]/).map(x=>x.trim());
        if (!name || !material || !['干净','有污点'].includes(clean)) return (name || '未命名')+'：资料不全，停在入口检查图卡。';
        const gates = [['材质门',['纸','塑料'].includes(material)],['洁净门',clean==='干净']];
        if (v.route==='先查干净') gates.reverse();
        const steps = [];
        let destination = material+'道';
        for (const [gate,pass] of gates) {
          steps.push(gate+'：'+(pass ? '是' : '否'));
          if (!pass) { destination='退回入口'; break; }
        }
        return name+'｜'+steps.join(' → ')+' → '+destination+'（'+steps.length+'步）';
      }).join('\n');
    },
    world(v) {
      const quote = text => '"' + String(text).replace(/["\\\x00-\x1f\x7f]/g, ch=>'\\'+String(ch.charCodeAt(0)).padStart(3,'0')) + '"';
      const cards = (v.cards || '').split(/\r?\n/).filter(x=>x.trim()).map(x=>x.split(/[|｜]/).map(t=>t.trim()));
      if (!cards.length) return 'registerClickEvent(function() say("入口等待图卡。", 3) end)';
      const entries = cards.map(([name,mat,clean])=>'{'+[name || '未命名',mat || '',clean || ''].map(quote).join(',')+'}');
      return `local cards = {${entries.join(',')}}
local materialFirst = ${v.route==='先查干净'?'false':'true'}
registerClickEvent(function()
  local names = {}
  for i = 1, #cards do names[i] = cards[i][1] end
  local c = cards[ask("入口投哪张图卡？", names)]
  if not c then return end
  if c[2] == "" or (c[3] ~= "干净" and c[3] ~= "有污点") then say("资料不全，回原卡核查。", 3) return end
  local gates = {"材质门","洁净门"}
  if not materialFirst then gates = {"洁净门","材质门"} end
  local steps = 0
  turnTo(90)
  for i = 1, 2 do
    walkForward(1)
    steps = steps + 1
    local pass = (gates[i] == "材质门" and (c[2] == "纸" or c[2] == "塑料")) or (gates[i] == "洁净门" and c[3] == "干净")
    if not pass then
      say(gates[i] .. "：否。退回入口，过了" .. steps .. "道门。", 4)
      turnTo(270) walkForward(steps) return
    end
    say(gates[i] .. "：是。", 2)
  end
  local dir = 0
  if c[2] == "塑料" then dir = 180 end
  turnTo(dir) walkForward(1)
  say("到达" .. c[2] .. "道，走过两道门。", 3)
  turnTo((dir+180)%360) walkForward(1)
  turnTo(270) walkForward(steps)
end)`;
    },
    checks: [
      {set:{},expect:'D卡｜材质门：否 → 退回入口（1步）'},
      {set:{route:'先查干净'},expect:'D卡｜洁净门：是 → 材质门：否 → 退回入口（2步）'},
      {set:{cards:'彩纸｜纸｜干净'},expect:'纸道（2步）'},
      {set:{cards:'破卡｜塑料｜'},expect:'资料不全'}
    ]
  },
  'g4-06': {
    goal: '用同一组六件物品对比两版分拣规则，找出唯一因阈值改变而改道的物品。',
    product: '六件跑一轮的例外复核台',
    opening: '机器人看见带塑料盖的纸杯，到底该选哪条道，还是请一个人来看看？',
    prediction: '把复核线从两格污点改成一格，哪件最可能改道？混合纸杯会跟着变吗？',
    demonstration: '固定六件样品，以两格为第一版规则运行，再将第二版阈值改为一格，圈出唯一改道行。在实际 Paracraft 点击机器人投05号，走到人工复核台检查原因。',
    debrief: '哪条轨迹说明“混合优先”？再严一格影响的是哪一件，值日员要多审几件？',
    student: '浏览器里先排练复核台，能说出两个例外原因后，在实际 Paracraft 搭纸道、塑料道和人工台。点机器人投单一、混合、有污点三种卡，核查去向。',
    revision: '让值日员按01到06号投完两轮。只改污点线，找出改道者；用同一张05卡请他在复核台复述原因。',
    fields: [
      {key:'threshold',label:'第二版污点达到几格送人工复核（第一版固定2格）',options:['2','1','3']},
      {key:'load',label:'每行 名称｜材质（纸、塑料或混合）｜污点格数',value:'01白纸｜纸｜0\n02透明瓶｜塑料｜0\n03带盖纸杯｜混合｜0\n04油纸巾｜纸｜3\n05酸奶盒｜塑料｜1\n06夹片｜塑料｜0'}
    ],
    run(v) {
      if (!['1','2','3'].includes(v.threshold)) return '请先选1、2或3格的复核线。';
      const limit = Number(v.threshold);
      const results = [];
      let changes=0;
      for (const line of (v.load || '').split(/\r?\n/).filter(x=>x.trim())) {
        const [name,material,spots] = line.split(/[|｜]/).map(x=>x.trim());
        if (!name || !['纸','塑料','混合'].includes(material) || !/^\d+$/.test(spots || '')) {
          results.push((name || '无名件')+'：缺少有效标签，暂停投件并请人核对。'); continue;
        }
        const lane = edge=>material==='混合' ? '复核（混合材质）' : Number(spots)>=edge ? '复核（污点达线）' : material+'道';
        const first=lane(2), second=lane(limit);
        if (first!==second) changes++;
        results.push(name+'：'+first+' → '+second+(first===second ? '，原路线' : '，改道'));
      }
      if (!results.length) return '传送带是空的，请放入练习件。';
      return results.join('\n')+'\n共 '+changes+' 件改道。';
    },
    world(v) {
      const quote = text => '"' + String(text).replace(/["\\\x00-\x1f\x7f]/g, ch=>'\\'+String(ch.charCodeAt(0)).padStart(3,'0')) + '"';
      const rows=(v.load || '').split(/\r?\n/).filter(x=>x.trim()).map(x=>x.split(/[|｜]/).map(t=>t.trim()));
      if (!rows.length) return 'registerClickEvent(function() say("传送带空了，请放入练习件。", 3) end)';
      const entries=rows.map(([name,mat,spots])=>'{'+[quote(name || '无名件'),quote(mat || ''),/^\d+$/.test(spots || '') && Number.isSafeInteger(Number(spots)) ? Number(spots) : -1].join(',')+'}');
      const limit=['1','2','3'].includes(v.threshold) ? Number(v.threshold) : -1;
      return `local cards = {${entries.join(',')}}
registerClickEvent(function()
  local names = {}
  for i = 1, #cards do names[i] = cards[i][1] end
  local c = cards[ask("本轮投哪一件？", names)]
  if not c then return end
  local version = ask("用哪一版污点线？", {"第一版（2格）","第二版（${limit}格）"})
  if version ~= 1 and version ~= 2 then return end
  local limit = 2
  if version == 2 then limit = ${limit} end
  if limit < 1 or c[3] < 0 or (c[2] ~= "纸" and c[2] ~= "塑料" and c[2] ~= "混合") then say("资料不全，暂停投件。", 3) return end
  local lane, dir = "纸道", 90
  if c[2] == "混合" then lane,dir = "人工复核：先分清部件",0
  elseif c[3] >= limit then lane,dir = "人工复核：污点达到复核线",0
  elseif c[2] == "塑料" then lane,dir = "塑料道",270 end
  turnTo(dir) walkForward(2)
  say(c[1] .. " → " .. lane, 4)
  turnTo((dir+180)%360) walkForward(2)
end)`;
    },
    checks: [
      {set:{},expect:'共 0 件改道'},
      {set:{threshold:'1'},expect:'05酸奶盒：塑料道 → 复核（污点达线），改道'},
      {set:{threshold:'1'},expect:'共 1 件改道'},
      {set:{load:'待查杯｜纸｜未知'},expect:'暂停投件'},
      {set:{threshold:'3',load:'拼接杯｜混合｜3'},expect:'复核（混合材质） → 复核（混合材质）'}
    ]
  }
};
