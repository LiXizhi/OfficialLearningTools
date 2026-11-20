// Short, non-identifying excerpts. Source locations below refer to the author's local archive.
const archive = {
  october:{path:'docs/meetings/2026-10-05-second-brain-llm-wiki.md',kind:'会议整理',origin:'该文件开头的 source_url 指向腾讯会议转写分享。教学页只收录有关段落。'},
  fde:{path:'docs/meetings/2026-10-09-second-brain-fde.md',kind:'会议整理',origin:'原始会议转写由 tmeet 导出；本页展示整理稿的《结论与未决事项》。'},
  workshop:{path:'sources/workshop/2026-10-24.md',kind:'培训逐字稿',origin:'课堂收录了 10 月 24 日培训录音的一句原话。时间和行号对应完整逐字稿。'},
  versions:{path:'sources/workshop/2026-10-24-25-havo-ai-native-workshop.md',kind:'工作坊练习记录',origin:'课堂收录了分组练习的结论。完整记录还列有四张练习原图及其时间。'},
  asr:{path:'docs/meetings/2026-10-29-aichat-persona-transcript.md',kind:'原始逐字稿',origin:'10 月 29 日彩排的 74 段 ASR 原文。可凭段号或引文在原文件定位。'},
  report:{path:'docs/meetings/2026-10-29-aichat-persona-school.md',kind:'彩排整理与会后追加',origin:'会后追加的交付要求写在《决议与待办》，对应产物在 docs/2026/beijing4-ai-campus-20261028/v4/second-brain-talk.md。'},
  git:{path:'_wiki/log.md',kind:'真实维护日志',origin:'在个人库 Git 中查看 git show --stat 43b82e68，再查看该提交对 _wiki/index.md、_wiki/concepts/second-brain.md 和 _wiki/projects/aichat-tool.md 的修改。'},
  plan:{path:'docs/meetings/2026-11-07-ai-education-business-discussion.md',kind:'需求讨论整理',origin:'《AI 助教：降低使用门槛》。原始会议入口见文件头的 source_url。'},
  demo:{path:'docs/meetings/2026-11-08-education-ai-product-workshop.md',kind:'演示归档（含现场原话）',origin:'该归档的 source_url 为连续录音入口。可在演示段按引文定位；同日另一段录制与它部分重合。'},
  product:{path:'_wiki/projects/aichat-tool.md',kind:'真实项目知识页',origin:'《2026-11-07 AI 助教简化方向》与《2026-11-08 现场演示》分别链接需求与演示归档。'}
};
const scenes = [
  ['会后整理','desk','同事要你写一份能交接的说明：下次什么时候谈？能向老师介绍什么？先从一份可能写错的自动纪要入手。'],
  ['参加工作坊','workshop','你带着同一份说明去参加培训。群里发来数字和几张练习图。哪些能成为日后引用的证据？'],
  ['准备学校宣讲','rehearsal','现在要把经验讲给老师。你听彩排录音，核对讲稿，决定什么可以当场演示、什么还需要查。'],
  ['跟进课堂演示','classroom','一线同事要做现场展示。你要交付一份能用的回答：哪个动作演示成功了？哪个还没打通？依据在哪里？']
];
// title, received, question, reading decision, destination, fact key, resulting line, evidence.
const events = [
  {g:0,date:'10 月 5 日',title:'“七八号见”，是哪两天？',input:'自动纪要把见面日期写成了六月。会议却发生在十月五日。',ask:'能直接往日历里填一个确定日期吗？',reason:'先找日期和说这句话时的上下文。能推到候选日，还少一次双方确认。',dest:'log',key:'dates',line:'10 月 7—8 日为候选会面日，时间地点待确认。',src:'october',loc:'决议与待办 · 第 4 项',quote:'明天是6号……七八号的时候我们抽个时间见面'},
  {g:0,date:'10 月 5 日',title:'纪要把两方的工作写反了',input:'同事准备复述会议成果，发现平台摘要把两方介绍的系统对调了。',ask:'要不要把摘要里的分工直接写进项目页？',reason:'回到发言顺序核对归属。课堂只保存今后查证的方法；人名和一次性介绍留在原件。',dest:'concept',key:'verify',line:'提取分工前，先回到逐字稿核对是谁介绍了什么。',src:'october',loc:'开头 · 平台总结校正',quote:'平台 AI 总结把双方技术归属写反。'},
  {g:0,date:'10 月 9 日',title:'“在做”能写成“做完”吗？',input:'准备介绍试点进度时，会上提到两个案例，随后又补充了它们的进展。',ask:'应该把它们放进已完成案例，还是进行中的案例？',reason:'保留发言者最后补充的状态。要升级为“已验收”，还需要验收材料。',dest:'project',key:'pilot',line:'两项试点仍在进行，完成情况需另行核验。',src:'fde',loc:'结论与未决事项 · 试点',quote:'已有两家案例被主讲随后限定为“做的过程中”'},
  {g:1,date:'10 月 24 日',title:'白板上那个百分比是谁算的？',input:'工作坊有人报了用户偏好的比例。同桌追问，这来自用户调查，还是临时问了模型？',ask:'能把这组数字写进下周给同事的说明吗？',reason:'读原话，发现没有调查样本。保留“需要调查”这个问题，讲义里不采用比例。',dest:'concept',key:'numbers',line:'模型给出的用户比例缺少样本与计算过程，仅列为待查问题。',src:'workshop',loc:'00:09:33–00:10:36 · 第 476 行',quote:'我问的豆包，没有问评论。'},
  {g:1,date:'10 月 24—25 日',title:'群里两张图，哪张已经定稿？',input:'群里练习图画出了“学习成长”，逐字稿尾部却在讨论是否单列。',ask:'晚一点听到的一句发言，能覆盖先前的图吗？',reason:'两份材料反映练习的不同版本，缺少定稿决定。把分歧和两种出处放在一起，交给负责人确认。',dest:'concept',key:'conflict',line:'练习图与讨论记录的分组有分歧，两种版本并列，最终选择待确认。',src:'versions',loc:'四 · 群中可见的练习版本',quote:'最终选择待确认。'},
  {g:2,date:'10 月 29 日',title:'老师问：我已经有很多 PPT 了',input:'彩排讲到老师的硬盘。PPT 已经在，大脑还要保存什么？',ask:'要再复制一份 PPT，还是写一条带出处的结论？',reason:'AI 读维护规则和总索引，找到课堂副本里的“资料核对方法”词条，把新解释写进去，再连回彩排逐字稿。',dest:'concept',key:'map',line:'知识页连接相关概念与原始资料。回答时可以从索引走回当时的 PPT 或逐字稿。',src:'asr',loc:'05:01–06:02 · 段 19',quote:'第二大脑是要从这些文件中找到它们之间的关系'},
  {g:2,date:'10 月 29 日',title:'教研组需要做法，私人笔记怎么办？',input:'下一页要向学校解释，老师是否需要把个人大脑里的东西都交给团队。',ask:'推给团队的是整份私人笔记，还是获准分享的经验？',reason:'仍写进已有概念页，补上分享的范围。由本人挑选可共享的经验，再给学校使用。',dest:'concept',key:'share',line:'教师可选择把经验或工作方法同步给学校，个人资料保留在个人脑。',src:'asr',loc:'个人脑与学校公共脑 · 第 130 行',quote:'老师的私人大脑，他有些数据他也不一定跟学校完全共享'},
  {g:2,date:'10 月 29 日',title:'屏幕上那句话是谁发的？',input:'彩排来不及接通群消息，于是讨论由人手动输入一条，展示预期效果。',ask:'截图能证明分身已经自动发言吗？',reason:'把手工输入标成场景演示。截图能说明界面里的效果，不能证明发送动作来自分身。',dest:'project',key:'mock',line:'群消息可手动输入作场景演示；自动发送仍需实测。',src:'asr',loc:'讨论手动输入 · 第 246 行',quote:'打上去它就唯一的缺点就是你没有 ai 发送这一点'},
  {g:2,date:'10 月 29 日',title:'助手没说话，能把原因写死吗？',input:'同事先猜提示词没写好，紧接着又说程序也可能有问题。',ask:'交接时能只写“改一下提示词就好”吗？',reason:'同一份原稿可以更新第二处。记录观察到的现象，把两个解释列为待排查项。',dest:'project',key:'silence',line:'现象：分身未发言。可能原因有提示词、程序问题，根因待查。',src:'asr',loc:'相邻两段 · 第 246、250 行',quote:'对。或者是有 bug 的对。'},
  {g:2,date:'10 月 29 日',title:'会后改了交付方式，旧话还算数吗？',input:'会上说要把讲解剪成约十五分钟的视频。会后又要求在本地方案页加按钮，手动推进讲解。',ask:'同事明天该交什么？还能查到当初的视频设想吗？',reason:'会中方案留在原文；项目页标上会后更新。检查实际讲稿，确认新交付物有据可查。',dest:'project',key:'delivery',line:'本次交付改为方案页的手动讲解；会上曾讨论约十五分钟视频。',src:'report',loc:'决议与待办 · 会后追加',quote:'此为新的交付形式，不是会议原决议；本次不制作配音或视频。'},
  {g:2,date:'10 月 29 日归档',title:'一场彩排，到底改了哪些文件？',input:'同事想查为什么讲稿、产品页和概念页都变了。现在打开真实维护日志和 Git 记录。',ask:'能把这次改动从输入一直对到输出吗？',reason:'真实提交 43b82e68 同时涉及逐字稿、会议整理、概念页、项目页、总索引、维护日志与演讲稿。它们各管一件事。',dest:'log',key:'receipt',line:'彩排入库：保留 ASR 原稿；更新概念、项目、索引和讲解稿。Git 记录 43b82e68 可核对。',src:'git',loc:'2026-10-29 ingest · 第 1438 行起',quote:'更新 [[second-brain]] 与 [[aichat-tool]]'},
  {g:3,date:'11 月 7 日',title:'老师提出：我上课时自己控场',input:'讨论把助教的范围收小：课前准备材料，上课由老师翻 PPT，需要时再叫助手调出来。',ask:'这个想法今天可以标成“已经能用”吗？',reason:'新需求有现成的产品项目页可归入。先写“拟这样做”，把演示留作下一次核对。',dest:'project',key:'lesson',line:'设计方向：课前准备材料，课上由教师控场并按需调出。等待演示。',src:'plan',loc:'AI 助教：降低使用门槛',quote:'课堂上老师照常控场和翻 PPT，在特定页通过语音调用事先准备的材料、讲解或互动。'},
  {g:3,date:'11 月 8 日',title:'昨天的想法，今天哪一步演出来了？',input:'现场先准备电磁场互动课件，再用语音找文件、打开课件。昨天那条“等待演示”终于有了新材料。',ask:'整套系统都通过了吗？还是其中一个动作有了证据？',reason:'只升级“找回并打开这个课件”的状态，同时保留昨天的需求来源。交接给教师时可以写下这次演示的具体操作。',dest:'project',key:'lesson',line:'11 月 8 日已现场演示：用语音找回并打开电磁场 H5。教师继续控场。',src:'demo',loc:'演示到的机制 · 第 115–116 行',quote:'帮我找一下贝壳文件夹里电磁场相关的课件'},
  {g:3,date:'11 月 8 日',title:'遥控器能代替屏幕上的两个按钮吗？',input:'同事看到了麦克风硬件，准备在说明里写“一键录音、一键发指令”。',ask:'现场看到的硬件到底能做哪一步？',reason:'回到演示里的限制。将已见到的“静音”与尚未打通的“双按钮联动”分成两条，避免同事照着错误承诺去演示。',dest:'project',key:'buttons',line:'当场硬件可切换收音；与“开始录音／开始语音”两个软件按钮的联动尚未打通。',src:'demo',loc:'收声／按钮 · 第 157 行',quote:'不能代替你两个按钮（开始录音、开始语音）'},
  {g:3,date:'11 月 9 日核对',title:'又收到一份录音，要再算一次成功吗？',input:'另一份较短录音也出现了素材库和遥控器，时间恰好落在昨天长录音之内。',ask:'两份文件能算两次独立演示吗？',reason:'对齐时间段和演示次序，记为同场重叠录制。另一个入口有用，演示次数仍然是一次。',dest:'log',key:'duplicate',line:'补录同一场演示的第二个入口；去重，无新增独立验证。',src:'demo',loc:'同日重叠录制 · 第 19 行',quote:'内容为本文件前段的同一场演示与讨论'},
  {g:3,date:'交接练习',title:'要不要给“课堂现场验证”单开一页？',input:'需求、模拟演示、真机试用已经在同一页反复出现。另一位老师来问：哪些可以照着演？',ask:'这个问题会反复用到，你想给它单独留一个入口吗？',reason:'这是课程设计的询问。已有项目页够用时，沿用原页。如果经常需要独立交接，可新建词条、登记索引、保留双向引用。',dest:'project',key:'review',line:'交接答复：电磁场课件已有演示依据；遥控器双按钮联动尚待实测。',src:'product',loc:'2026-11-08 现场演示 · 第 465 行起',quote:'按钮与硬件尚未打通'}
];
