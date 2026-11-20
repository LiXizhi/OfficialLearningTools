// 共享通识：开场 + 四节。第 1 项（开场）由 foundation-intro.js 渲染；其余各节由 app.js 渲染。
window.brainFoundation = [
  {
    name:'开场', title:'什么是超级个体？',
    lead:'碳基的我与硅基的我，共同构成一个超级个体。',
    question:'你现在处在哪个阶段？下一步最想先解决什么？'
  },
  {
    name:'第二大脑', title:'第二大脑：资料有来处，方法能复用',
    lead:'第二大脑不是一堆聊天记录，而是一个可以长期积累的文件夹。原始资料、知识地图和维护规则分开放：人提供资料、做判断；AI 负责阅读、提炼、交叉链接和记账。',
    layers:[
      ['原始资料','日记、口述、会议纪要、作业、业务记录','只读，不直接篡改。每个结论都能追回这里。'],
      ['知识地图','_wiki/ 里按主题组织的知识页','一页一个主题，每句话对应原件。新信息折进已有的页。'],
      ['维护规则','AGENTS.md 与 Skills','规定 AI 怎么读、怎么核对、怎么更新、怎么调用工具做事。']
    ],
    image:'real-brain-graph.webp', alt:'第二大脑知识图谱，圆点是知识页，连线是引用关系。',
    imageNote:'知识图谱：224 个知识页、1309 条链接。圆点是主题页，连线是页与页之间的引用。',
    rules:[
      ['核心地图约 200 页以内','资料可以有几千份，核心知识页要少而精，才找得到、改得动。'],
      ['以第一信源为准','文档常常过期。优先追到正在运行的系统和当前生效的文件。'],
      ['冲突并列标记','两份原件说法不同，就把两种说法都留下，不悄悄覆盖。']
    ],
    activityTitle:'练习：哪句话可以写进知识页？',
    activity:`
      <p>AI 整理一次交流记录时，起草了这样一句：<q>企业第二大脑都已控制在 200 个节点以内，效果比 CEO 更懂公司。</q>展开原件，决定写哪一句。</p>
      <details><summary>查看会议原件</summary><blockquote>核心知识地图应控制在 200 个以内的 Wiki 节点。这是组织目标，不是所有部署已达成的统计结果。“比 CEO 更懂公司”属期望与效果评价，不是验收结果。</blockquote></details>
      <fieldset class="source-choice"><legend>你会把哪句话写进知识页？</legend>
        <button type="button" data-verdict="wrong" data-feedback="再读原件：200 个节点是目标，不是统计结果；“比 CEO 更懂公司”只是期望。把目标写成事实，就是编造。">企业第二大脑都已控制在 200 个节点以内，效果比 CEO 更懂公司。</button>
        <button type="button" data-verdict="right" data-feedback="对。目标写成目标，期望写成期望。以后谁读这页，都知道哪些还没验证。">核心地图以 200 个节点以内为目标；“比 CEO 更懂公司”是期望，不是验收结果。</button>
      </fieldset><p class="answer" role="status"></p>`,
    question:'你手边哪三份资料最值得先放进第二大脑？它们各自该进哪一层？'
  },
  {
    name:'工作循环', title:'四个模块：提出目标，调用经验，形成成果，协作反馈',
    lead:'在工作台上提出目标，带着第二大脑里的背景，调用工具形成成果，再进入圈子协作完成事情，把经验带回自己——这四步连起来，就是超级个体的日常工作方式。',
    modules:[
      ['工作台','提出目标，检查结果','real-workbench.webp','任务约定与可以确认的结果','工作台：提出目标、安排任务、检查结果'],
      ['第二大脑','让经验接续生长','real-brain-graph.webp','可追溯的依据与可复用的方法','第二大脑：按主题组织的知识图谱'],
      ['工具','把想法变成成果','real-tools.webp','能打开、能修改的页面、表格、课件','工具目录：按任务调用的各类工具'],
      ['圈子','让能力进入真实关系','circles.webp','分工、交付记录与再次合作','圈子：真人与分身围绕共同目标协作']
    ],
    evidence:{
      title:'看分身做事，也看它留下了什么',
      text:'左边，分身在工作台调用 CRM 工具提交线索，并如实汇报调用回执：“工具请求 8 次，收到返回 8 次，不代表业务已成功”；右边，业务系统里留下了一条可核对的线索记录。',
      images:[['crm-chat-lead.webp','工作台：分身调用工具并回读结果'],['crm-lead.webp','业务系统：留下的线索记录']]
    },
    activityTitle:'练习：每个模块留下什么？',
    activity:`
      <p>给每个模块选出它最主要留下的东西。</p>
      <div class="match-quiz">
        ${[['工作台','goal'],['第二大脑','proof'],['工具','work'],['圈子','trust']].map(([m,a])=>`<label><b>${m}</b><select data-expect="${a}"><option value="">请选择</option><option value="work">能打开、能修改的成果</option><option value="goal">任务约定与要确认的结果</option><option value="trust">分工、交付记录与再次合作</option><option value="proof">可以追溯的依据与方法</option></select><span aria-live="polite"></span></label>`).join('')}
      </div>`,
    question:'想一件你这周要做的事。它在工作台怎么说？要从大脑里找什么？用什么工具？最后交给谁确认？'
  },
  {
    name:'分身', title:'一个大脑，几个分身',
    lead:'我在公司里是一个角色，在家庭里是另一个角色，在项目或学校里又是不同的角色。这些分身共享同一个第二大脑：一个分身带回的经验，经过核对，另一个分身就能接着用。',
    image:'real-share-fusion.webp', alt:'碳基的我加硅基的我，共享同一个第二大脑，工作、家庭、学习分身进入不同圈子并带回经验。',
    transparent:'这种状态叫“对自己透明”：自己的不同角色、不同经历能在个人超脑中互相看见。这首先是一个人内部的信息互通，而不是把私有内容向外公开；各个分身只按角色和授权取用内容。',
    entries:[
      ['成年人','从工作开始','过去需要反复交代的背景留在第二大脑里；不同项目的分身带着这些背景参与协作，再把新进展带回来。'],
      ['孩子','从学习和成长开始','学习中的问题、作品、兴趣和探索逐渐汇成自己的大脑，老师与家长的分身围绕成长协作。'],
      ['老人','从人生经历开始','人生经历、记忆和日常交流，随着讲述与交流不断沉淀进自己的第二大脑。']
    ],
    activityTitle:'练习：分身能读什么？',
    activity:`
      <fieldset class="source-choice"><legend>外部访客在线面试我的分身，问起私人脑里的客户细节。</legend>
        <button type="button" data-verdict="right" data-feedback="对。对外分身只读公开资料；没有依据就直说。">只用公开资料回答；没有依据就直说。</button>
        <button type="button" data-verdict="wrong" data-feedback="对外分身没有私人脑的授权。分身按角色和授权使用内容。">去私人脑里查，回答得越完整越好。</button>
      </fieldset><p class="answer" role="status"></p>
      <fieldset class="source-choice"><legend>“对自己透明”是不是意味着，分身可以把全部日记发到工作群？</legend>
        <button type="button" data-verdict="wrong" data-feedback="对自己透明是指个人内部的信息互通，不是把私有内容向外公开。">是，透明就是全部公开。</button>
        <button type="button" data-verdict="right" data-feedback="对。本人能总览整个大脑，各个分身只按角色和授权取用内容。">不是。内部可以互相连接，对外只给授权的部分。</button>
      </fieldset><p class="answer" role="status"></p>`,
    question:'如果给自己配两个分身，你会让它们各管什么？哪些资料只给其中一个看？'
  },
  {
    name:'圈子', title:'从超级个体，到超级团队、超级组织',
    lead:'一个人用第二大脑和分身完成任务，是超级个体。几个真人和分身围绕一个目标组成圈子、明确直接负责人，是超级团队。经过确认的经验进入组织的大脑，新人和别的团队都能复用，就走向超级组织。',
    image:'super-learning-vision.webp', alt:'超级教师、超级学校、超级学生，人主导方向，分身延展能力，经验持续生长。',
    brains:[
      ['个人脑','日记、判断、私人记录','只属于个人。分身按角色和授权取用。'],
      ['团队／公司脑','经过选择和去敏的产品、技术、方法','团队内按权限共享。从个人脑推送前先去敏。'],
      ['公共脑','课程、场景模板、公开资料','面向所有人。贡献经过授权和审核。']
    ],
    paths:[
      ['学校、企业','先共建组织脑，再派生个人脑','负责人与员工一起整理业务知识；成员从组织脑获得自己的工作起点。'],
      ['孩子、老人','先进入公共场景，在体验中长出个人脑','先提供课程、场景和工具；个人在学习、讲述、创作中持续积累。']
    ],
    future:{image:'real-share-crossorg.webp', alt:'公司甲、公司乙的公共大脑汇入私人大脑，分身 A、B 分别受雇于两家公司。',
      text:'当分身足够强大，也可以受雇于外部组织，同一个私人大脑连接几家公司的公共知识。到那时，合作信任落到四件事上：它是谁的分身、被授权做什么、过去完成过什么、遇到问题找谁。'},
    activityTitle:'练习：这些内容该放进哪个脑？',
    activity:`
      <p>判断下面四类内容分别该放在哪里。</p>
      <div class="match-quiz">
        ${[['个人日记','mine'],['去掉金额、股权、薪酬后的产品主线','team'],['去掉特定公司名的公开分享稿','public'],['标着 visibility: private 的人员底册','mine']].map(([m,a])=>`<label><b>${m}</b><select data-expect="${a}"><option value="">请选择</option><option value="mine">留在个人脑</option><option value="team">推送到公司脑</option><option value="public">公开发布</option></select><span aria-live="polite"></span></label>`).join('')}
      </div>`,
    caio:{title:'在组织里落地：从一个真实任务开始',
      steps:[
        ['选场景，定基线','选一个高频、有明确产物的任务，记下现在的耗时与质量标准。'],
        ['建脑，配角色与工具','整理资料、知识地图与 Skills，配好分身和项目圈。'],
        ['做成一次，再换条件','先跑通一次，再换一组条件重做，检验方法是否真的能复用。'],
        ['让团队独立完成','员工自己更新资料、完成新任务，做到成果可用、方法可复用、人人会操作。']
      ]},
    question:'你所在的团队里，哪一份经验最值得从某个人的脑子里，搬进大家都能用的团队脑？'
  }
];
// Intrinsic sizes reserve layout space before lazy images load.
window.foundationImageSizes = {'real-workbench.webp':[1135,724],'real-tools.webp':[1100,806],'real-brain-graph.webp':[448,444],'real-share-cover.webp':[805,400],'real-share-fusion.webp':[605,502],'real-share-crossorg.webp':[475,417],'real-caio-deliver.webp':[812,241],'real-caio-principle.webp':[812,268],'super-learning-vision.webp':[1280,720],'crm-chat-lead.webp':[1100,620],'crm-lead.webp':[1100,802],'circles.webp':[1695,928]};
