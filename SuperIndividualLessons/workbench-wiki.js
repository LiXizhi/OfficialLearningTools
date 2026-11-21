// Opening notebooks are fictional prior work. A page without an opening source
// enters the file tree only after the learner in the scenario agrees to create it.
window.brainWiki = {
  student: {
    pages: {
      数学学习: {scope:'按单元整理我会解释的数学方法、错题和验算。', source:'上周的小数练习', excerpt:'0.5 和 0.50 在数线上是同一个点。我能画出来，但还想试试怎样用图解释分数。'},
      英语学习: {scope:'把学过的词放回句子里，记下回忆结果和下次复习日期。',source:'11月10日英语课的两句话',get excerpt(){return window.brainVocabulary.cards;}},
      我的学习进展: {scope:'记下各科这周学会了什么、用什么证明、下回练什么。', source:'周五学习回顾', excerpt:'这周的两篇观察日记都把“我看到的”和“我猜的”写在了一起。下周找同桌帮我圈一句。'},
      语文学习: {scope:'把阅读、观察写作和同学的试读意见按单元整理。'}
    },
    lessons: [
      {home:'数学学习',heading:'分数加法',related:'我的学习进展',entry:'第一次能用等长纸条说明为什么先通分。下回换一题，看看离开纸条还能不能解释。'},
      {home:'数学学习',heading:'分数加法',related:'我的学习进展',entry:'这次已经会通分。下一次练习要检查份数相加的那一行，先试一道同分母题。'},
      {home:'英语学习',heading:'借铅笔的两句话',related:'我的学习进展',entry:'11 月 13 日先遮住 borrow 造句，15 日再试 return。自测后把独立想起、用了提示或暂时想不起记回英语页。'},
      {home:'语文学习',heading:'观察作文',related:'我的学习进展',entry:'以前会把观察写成全班的结论。现在同桌能按指南找到时间和地点；下篇日记再试一次。',reason:'学习回顾里已有两篇观察日记，今天又有作文和同桌的试读。以后改作文想一起找这些记录，可以单开《语文学习》吗？'}
    ]
  },
  teacher: {
    pages: {
      我的备课: {scope:'按教学单元整理开场题、课堂活动和同事能接手的教案。',source:'下周备课便笺',excerpt:'周二要上异分母加法。先用一道题听学生说理由，再决定要不要发纸条。'},
      我的科研: {scope:'保留课堂研究的问题、匿名观察、证据范围和待验证的解释。',source:'教研组观察约定',excerpt:'这月想观察学生怎样解释分数单位。每次记下原话和追问；只报答案时，暂时不能判断他的想法。'}
    },
    lessons: [
      {home:'我的备课',related:'我的科研'},
      {home:'我的备课',related:'我的科研'},
      {home:'我的备课',related:'我的科研'},
      {home:'我的科研',related:'我的备课'}
    ]
  },
  enterprise: {
    pages: {
      报表试点项目: {project:true,scope:'跟踪日报从试点到交付的目标、决定、负责人和验收结果。',source:'报表试点立项便笺',excerpt:'先帮三个团队看到昨日报表。周一开评审，讨论交付时间，再决定怎么做。'},
      团队协作: {scope:'整理跨项目都用得上的评审、交接和确认办法。',source:'上次交接复盘',excerpt:'接手人问“这是谁答应做的？”今后的交接单在行动旁写上负责人，并链接当时的讨论。'},
      库存预警项目: {project:true,scope:'跟踪缺货通知和月底盘点各自的业务窗口、验证和待决事项。'}
    },
    lessons: [
      {home:'报表试点项目',heading:'日报时限与异常指标',related:'团队协作',entry:'交接时把工程承诺与产品待办分开：补跑由陈禾验证，节假日时限找产品确认。'},
      {home:'报表试点项目',heading:'日报时限与异常指标',related:'团队协作',entry:'需求变更逐项记确认人。产品确认了节假日的日报时间；客服提出的十五分钟预警还要找产品核预算。'},
      {home:'报表试点项目',heading:'实施交接',related:'团队协作',entry:'交接单把已承诺的补跑验证交给工程，把无批复的预算列在依赖栏；接手人可点开两次讨论核对。'},
      {home:'库存预警项目',heading:'预警与盘点',related:'团队协作',entry:'接手新需求先问允许等多久。将十分钟缺货通知和月底盘点拆开，各做一次验收。',reason:'门店提出的是库存项目，有自己的用户、交付时限和验收。报表试点还在运行。给新项目单开《库存预警项目》吗？'}
    ],
    manager: [
      {heading:'风险与决策',entry:'评审简报将事实、成本推断、待批预算分栏。请产品带来批复，再讨论扩大实时范围。'},
      {entry:'评审两个业务窗口时分别问允许延迟、值班人和成本。未获答复的条件留在待决栏。'}
    ]
  }
};
