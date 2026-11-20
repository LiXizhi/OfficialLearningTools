// Three subject teachers in one lesson-study group use the same shared observation protocol.
(() => {
  const cdn='https://cdn.keepwork.com/keepwork/cdn/super-individual-lessons/teacher-studio/20261120-r1/';
  const cases=[
    {
      slug:'fractions',name:'异分母分数加法',grade:'五年级数学',teacher:'王老师',source:'五年级下册数学教材',url:'https://v2.ykt.cbern.com.cn/65/document/55c1a821b02647f1856490c4decdfa9b/pdf.pdf',
      goal:'用等长纸条解释为什么要先统一分数单位，再计算 1/2＋1/3。',materials:'每组两根等长纸条、两色笔和一张退出票。',
      legacy:'第 1 页复习同分母；第 2 页列出 1/2＋1/3；第 3 页直接给出通分算式。',hook:'先遮住答案。半条加三分之一条，有没有超过半条？',
      draft:'把两根纸条平均分，涂出两个分数，告诉同桌答案。',a:'甲：两条都平均分了，我数到了五块。乙：我会算 5/6，可不知道要指哪一份。',
      change:'叠齐两根等长纸条，各分六格。先指一格说出它占整条的几分之几，再把三格和两格合起来。',b:'丙指着一格说“这是六分之一”，又指出三格和两格。丁能算出 5/6，还要提醒才会指出共同的一份。',
      question:'只听到“5/6”，还能问什么？',right:'请指着图说，你加起来的每一份有多大。',wrong:'请把答案大声重复一次。',
      research:'记录学生是否既指出相同整体，又指明共同的一份。只报得数单列。',exit:'换成 1/2＋1/4，画图并在你计算的一个单位旁画圈。',scope:'这两次课堂提供了不同解释的例子；明天用一道新题再查能否迁移。'
    },
    {
      slug:'reading',name:'夜间飞行的秘密',grade:'四年级语文',teacher:'林老师',source:'公开教研课例与课堂对话',url:'https://library.camtree.org/bitstreams/d4e902da-4ea2-4120-8b57-d8653036c620/download',
      goal:'提出一个能帮助读懂文章的问题，指出哪条实验记录能回答它，并用自己的话连接证据与解释。',materials:'三张实验摘述卡、问题便笺、每组一支双色笔。',
      legacy:'第 1 页看蝙蝠图；第 2 页列三次实验；第 3 页教师揭晓探路秘密。',hook:'如果只能问一个问题，哪一个能把三次实验串起来？',
      draft:'读三张实验卡，写下你最想问的一个问题。',a:'甲：蝙蝠吃什么？乙：蒙眼时怎么还飞得过去？两人都写了问句，只有乙提到实验条件。',
      change:'先写一个问题，再圈出能帮助回答它的实验句；同桌追问“这句凭什么能帮你回答？”',b:'丙把“蒙眼后还能避开障碍”连到自己的问题。丁圈了“封住嘴后碰到障碍”，仍需追问这句能说明什么。',
      question:'怎样区分“找到了相关句”和“能用这句解释”？',right:'请学生说出句中哪个实验条件支持自己的判断。',wrong:'按问题字数从长到短排序。',
      research:'在提问单上分列“提出问题、指出相关句、解释联系”。未解释联系也保留为反例。',exit:'换一个角度提问：为什么要把蒙眼实验和封嘴实验放在一起读？请用两个条件作答。',scope:'配对材料显示有人会圈句子却说不出理由。下一轮用陌生说明文检验能否迁移。'
    },
    {
      slug:'english',name:'How can I get there?',grade:'六年级英语',teacher:'陈老师',source:'人教版六年级上册 Unit 1',url:'https://www.pep.com.cn/zslth/yyptypzj/xypep/6s/',
      goal:'在校园地图上问路、给出方向和转弯地标；听者能在信息不足时用英语澄清。',materials:'九宫格地图、双人角色卡、一个代替行人的棋子。',
      legacy:'Slide 1: place names. Slide 2: repeat “Turn right.” Slide 3: read the dialogue together.',hook:'You are at the gate. Your partner has the map. How will you find the museum?',
      draft:'Read the directions aloud. Then change roles.',a:'A: Turn right. B: Here? A: Yes. 听者在校门口就右转，最后走到了咖啡馆。',
      change:'Start at the gate, facing north. The speaker names a turning point. The listener asks “At the park?” before moving.',b:'A: Go straight to the park. Turn right there. B: At the park? A: Yes. 听者走到了博物馆。第二组只说 right，仍少地标。',
      question:'听者在校门口就转弯，先练哪一句？',right:'Where do I turn? At the park?',wrong:'Spell the word “museum” again.',
      research:'记录听者起点、第一次转弯的位置、是否主动澄清和最终落点。保留原话。',exit:'换终点到图书馆。两人交换身份，给出一步方向和一个地标，再问一句澄清。',scope:'同一地图上走对不等于能在新地图指路。下周调换起点，再收一次未经提示的对话。'
    }
  ];
  const outlines=[
  [
    [
      "0–4",
      "半条再加三分之一条",
      "请学生独立画出整体。若有人预计 2/5，请他对照“加了以后应比半条长”自行检验，暂缓公布答案。"
    ],
    [
      "4–10",
      "把“怎样分”画出来",
      "A 班先听“平均分”的原指令。老师记下第一种画法和学生解释。B 班沿用两条等长纸，明确叠齐后各折六格。"
    ],
    [
      "10–18",
      "换一种刻度，涂色的长度变了吗？",
      "请助手只主持这段，先等学生指图，再动刻度。追问“颜色没变，什么变了？”由老师翻到下一页。"
    ],
    [
      "18–26",
      "谁能解释五格从哪里来？",
      "请一人讲解，一人指图。听到“分母相加”时，让他检验半张加半张，保留他的第二次解释。"
    ],
    [
      "26–34",
      "换一道题，还能找到共同单位吗？",
      "收一份能解释单位的样例和一份仍需提示的样例。下课前不给学生贴能力标签。"
    ],
    [
      "34–40",
      "留给下一班的证据",
      "老师匿名保存观察，在同一份 lesson-plan.md 修订一句指令。不同班级、不同基础会影响表现；下一次换题再检验。"
    ]
  ],
  [
    [
      "0–4",
      "黑暗里，它怎样绕开障碍？",
      "从生活经验导入，收两张不同角度的问题。若有人问蝙蝠吃什么，先保留问题，再请全班判断今天哪份材料能回答。"
    ],
    [
      "4–10",
      "读三张实验卡",
      "这是供课堂讨论的改写记录。让学生默读教材相应段落后用双色笔分别标记条件与结果。"
    ],
    [
      "10–18",
      "替你的问题选证据",
      "老师说“助手，主持找证据环节”。助手提问后等学生选句、解释，听到完整联系再交还老师。"
    ],
    [
      "18–26",
      "两个同学都提了问题",
      "允许课外问题。教研观察只记录这次任务中的提问、选句、说明联系三项，避免把提问次数当成阅读质量。"
    ],
    [
      "26–34",
      "把单次观察连起来",
      "追问“哪一句支持这半句话？”请一位学生指出只凭蒙眼这条还不能解释的部分。"
    ],
    [
      "34–40",
      "交一张“我的问题和依据”",
      "把匿名作答分为只提问、能定位证据、能解释联系。保留一个反例，晚间据此改变下一班的问题指令。"
    ]
  ],
  [
    [
      "0–4",
      "You have five minutes to find the museum",
      "老师用真实问路语气示范一次。听者背对地图，向看地图的同伴提问；提醒双方先约定朝向。"
    ],
    [
      "4–10",
      "Where do I turn?",
      "让一位学生扮演只能听到指令的游客。第一次故意在起点右转，请说话人补上地标。"
    ],
    [
      "10–18",
      "Guide your partner",
      "老师点名助手读访客台词，随后等待学生实际移动棋子。面向北出发，到公园后右转就是向东一步。"
    ],
    [
      "18–26",
      "Repair a misunderstanding",
      "同伴交换角色，再走一次。教师只记录第一次转弯的地点、澄清语和最后落点。"
    ],
    [
      "26–34",
      "A new destination",
      "沿用上一页地图位置，在纸上从中心格出发。接受其他合乎地图的路线，要求包含转弯点。"
    ],
    [
      "34–40",
      "Leave a voice script for the next pair",
      "听者独立到达才记为完成。只会齐读时，留下未澄清的原话。晚上比较两班样例，下次换地图再试。"
    ]
  ]
];
  window.teacherWorkshop={cases,cdn,outlines};
  const photos={
    home:['teacher-home.webp','在家备课'],a:['teacher-class-a.webp','A 班 · 教室'],review:['teacher-review.webp','晚间复盘'],b:['teacher-class-b.webp','B 班 · 复教']
  };
  window.buildTeacherResearch=function({event,read,index,log,wiki,pagePath,previous}){
    const topic=pagePath('我的科研'),related=pagePath('我的备课'),raw='docs/教研组匿名取样.md',coding='docs/教研组三份证据编码.md',proof='docs/新任务复验.md',out='作品/跨学科试教与研究包.md';
    const emit=(phase,label,user,ai,path,next,focus='')=>event(label,user,ai,path,next,focus,false,{photo:photos[phase],speaker:'教研组'});
    emit('home','从上次的手记提出问题','英语课能跟读的学生，都能给陌生搭档指路吗？','从上一课的复教手记定位问题。',previous.out,undefined,previous.final);
    emit('home','预先约定观察口径','要收什么才能回答？','同一次任务分别记录“独立完成、得到哪句提示后完成、未完成”。保留匿名原话和作品。',topic,read(topic)+'\n\n## 本轮问题\n更换任务后，学生能否独立用证据解释或指导同伴？\n先写口径：独立 / 提示后 / 未完成。保留年级、题目和操作结果。');
    const sample=cases.map(c=>c.grade+'：'+wiki('TeachingArtifacts/202611/'+c.slug+'/B班课堂观察.md')).join('\n');
    emit('a','从三份原件取样','沿词条把三位老师的原件分别打开。','同一张观察表可以借用，三个学科分别看图、读句和走路线。',raw,'# 教研组取样 · 课堂模拟\n'+sample);
    for(const c of cases){
      emit('a','读'+c.grade+'原件','','找学生做过的动作和教师提示；缺项留空。','TeachingArtifacts/202611/'+c.slug+'/B班课堂观察.md',undefined,c.b);
    }
    emit('review','编码并留反例','不能因为报对结果就记成能解释。','数学丁仍需提示，语文丁只圈句子，英语第二组缺地标。保留这三种不同的限制。',coding,'# 匿名证据编码\n数学丁：提示后指出单位。\n语文丁：定位正确，解释联系待查。\n英语第二组：只说 right，缺少转弯点。\n原件：'+wiki(raw));
    emit('review','记录人的检验','两班表现不同，是这条新指令造成的吗？','先查看材料范围，再选择能站得住的结论。',coding,undefined,'提示后');
    emit('home','设计迁移复验','下周再试，不能重复上一次答案。','数学换同单位题、语文换一段说明文、英语换起点。保留同一记录口径。',out,'# 同事可直接试教的教学包\n材料：等长纸条 / 新说明文 / 校园地图。\n先独立完成，再给一句提示，分别记录原话与作品。\n试教依据：'+wiki(coding)+'\n复验结果：等待下周课堂。');
    emit('b','新任务 · 观察一次','英语组先试：把起点换到博物馆，请学生指路去图书馆。','本轮模拟只新增一条英语观察。数学、语文的延迟复验留待实际授课。',proof,'# 新任务复验 · 模拟观察\n英语：听者从博物馆出发，在学校转弯抵达图书馆。说话人独立给出 at the school。\n数学与语文：待测。');
    const final='在本次换起点任务里，这一对学生能独立说出转弯地标。换一组搭档仍需验证。';
    emit('review','按证据更新教学包','把可以确认的一条写进去。','将待测项与已经复验的结果分开。',out,read(out).replace('等待下周课堂。',final)+'\n复验原件：'+wiki(proof));
    emit('review','写回我的科研','','问题、编码与反例能追到各班原件。',topic,read(topic)+'\n'+final+'\n反例与编码：'+wiki(coding)+'\n复验：'+wiki(proof)+'\n教学包：'+wiki(out)+'\n备课：'+wiki(related));
    emit('review','把教学包交给同事','','同事从备课页可找到活动与适用条件。',related,read(related)+'\n跨科试教：'+wiki(out)+'\n研究记录：'+wiki(topic));
    emit('review','登记下一轮','','保留下次取样的位置。',log,read(log)+'\n课堂研究：'+wiki(topic)+'\n下一轮依据：'+wiki(proof));
    return {topic,related:'我的备课',out,raw,final,quote:'教研组取样'};
  };
  window.buildTeacherWorkshop=function({i,event,read,index,log,wiki,pagePath,previous}){
    const c=cases[i], topic=pagePath('我的备课'), related=pagePath('我的科研');
    const raw='docs/'+c.name+'旧PPT逐页摘录.md',base='TeachingArtifacts/202611/'+c.slug+'/';
    const plan=base+'lesson-plan.md', first=base+'A班课堂观察.md',second=base+'B班课堂观察.md',out='作品/'+c.name+'复教手记.md';
    const show=(phase,label,user,ai,path,next,focus='',fresh=false)=>event(label,user,ai,path,next,focus,fresh,{photo:photos[phase],speaker:c.teacher});
    show('home','在家 · 定位旧课',previous?'教研组上节课是怎样记录观察的？':'我有一份去年的 PPT，明天给 A 班，后天给 B 班。同一节课该改哪一页？',previous?'先打开上一次的复教手记，沿用“记下学生做了什么”的办法。':'先查《我的备课》，找到这个单元，再读你提供的课件。',previous?previous.out:index,undefined,previous?previous.final:wiki(topic));
    show('home','读旧 PPT','请 AI课程互动助手读旧课件，标出最值得暂停的一页。','我把这份示例旧课件逐页摘下，原来的页序保留。',raw,'# '+c.name+' · 示例旧 PPT 摘录\n'+c.legacy);
    const original='# '+c.name+'\n班级：A、B 班共用此教案\n目标：'+c.goal+'\n材料：'+c.materials+'\n导入：'+c.hook+'\n旧课件：'+wiki(raw)+'\n课件：[投屏第 3 页](teacher-samples/'+c.slug+'.html#p3)';
    show('home','备课模式 · 保存教案','帮我备这节课。在现有教案中改，别给两个班各建一份。','我把目标和旧课件依据放进本课的 lesson-plan.md。',plan,original);
    show('home','插入互动环节','到互动页时等我点名，只主持这一段，学生答完把课堂交还给我。','我补上提问、等答和观察办法。',plan,original+'\n课堂互动：'+c.draft+'\n观察：'+c.research);
    show('home','登记备课笔记','','以后从《我的备课》就能打开原课件摘录和同一份备课笔记。',topic,read(topic)+'\n\n## '+c.name+'\n备课笔记：'+wiki(plan)+'\n旧课件：'+wiki(raw));
    show('a','次晨 · 新对话查索引','上次备好的课在哪？先帮我看看笔记。','新对话从索引重新进入《我的备课》。',index,undefined,wiki(topic),true);
    show('a','从词条找到教案','','点回昨天登记的教案。',topic,undefined,wiki(plan));
    show('a','给 A 班上课','开始上课。翻到互动页，帮我问这一题，等学生作答。','授课模式读取同一份笔记。'+c.draft,plan,undefined,c.draft);
    show('a','A 班 · 留下证据','我来记下两个匿名回应。活动到这里，我继续讲。','按你的观察保存这两条课堂样例。',first,'# A 班课堂观察 · 模拟材料\n'+c.a+'\n本次依据：'+wiki(plan));
    show('review','记录人的检验','今晚只改一个环节。先看学生在哪一步卡住了。','请根据刚保存的观察判断下一步。',first,undefined,c.a);
    show('review','当晚 · 修订同一份教案','把这条指令改具体，其他条件尽量保持一致。','把旧指令换成新版，并把改动连回 A 班的原话。',plan,read(plan).replace(c.draft,c.change)+'\n修订依据：'+wiki(first));
    show('b','翌日 · B 班重开同课','开始给 B 班上同一节课。先读昨晚的修订，从头开启本次互动。','沿用同一份教案。今天请听新版指令。'+c.change,plan,undefined,c.change,true);
    show('b','B 班 · 复测','收两份回应，把能做到的和仍需提示的分开。','保存 B 班样例，和 A 班分别留档。',second,'# B 班课堂观察 · 模拟材料\n'+c.b+'\n本次教案：'+wiki(plan));
    show('review','写出复教手记','什么证据值得下一次备课使用？','两班材料并列，供下次检验。',out,'# '+c.name+'复教手记\n'+c.change+'\n'+c.scope+'\nA 班：'+wiki(first)+'\nB 班：'+wiki(second)+'\n下次退出票：'+c.exit);
    show('review','回写我的科研','','把观察指标、材料和结论范围写入教研页。',related,read(related)+'\n\n## '+c.name+'\n'+c.research+'\n'+c.scope+'\n复教手记：'+wiki(out)+'\n备课入口：'+wiki(topic));
    show('review','让下次备课找得到','','教学设计和研究记录都能回到课堂原件。',topic,read(topic)+'\n复教手记：'+wiki(out)+'\n观察指标：'+wiki(related));
    show('review','登记改动','','已记录同一份教案的两次使用和修订依据。',log,read(log)+'\n'+c.name+'：'+wiki(plan)+'、'+wiki(out));
    return {topic,related:'我的科研',out,raw,final:c.change,quote:c.legacy};
  };
})();
