# 用第二大脑成为超级个体

在官方课堂库选择《超级个体培训课》，或直接打开 [课程首页](index.html)。首次先读共享通识（开场加四节：第二大脑、工作循环、分身、圈子），再选择身份，学生路线四节课，教师和企业路线各五节课。第一课用 25 分钟完成保存、换新对话找回原件、引用并应用。后面的课沿用前一课的成果，练习比较、核验和迁移。

| 身份 | 第一份材料 | 结课作品 |
| --- | --- | --- |
| 学生（小学高年级至初中） | 分数错题卡 | 同学能试用的一页学习指南 |
| 学校老师 | 复用旧 PPT 的互动教案、A/B 班观察和晚间修订 | 同事可直接试教的教学包 |
| IT 企业员工或管理者 | 有出处的项目决策记录 | 用新项目检验过的交接或决策指南 |

企业路线在第三、四课可切换交付物。每节课含虚构材料、分步演示、可修改和复制的练习话术及作品自评。第一课准备能连接第二大脑的 AIChat 环境；设备暂未连通时可以先看示范，稍后完成真实存取。真实文件和作品由学员在自己的第二大脑中保存。

## 课程入口与进度

共享通识以课程作者第二大脑里的一手记录讲述，全文用第一人称“我”，不出现真名。开场 `foundation-intro.js` 讲超级个体的定义、超级个体到超级组织的三级台阶、认知共生体研究远景（可点击设备图，底图 `assets/super-individual-future.webp`）和成为超级个体的阶段自测。四节的文案、截图与练习在 `foundation.js`，由 `app.js` 渲染。

每节都有一个“真实记录回放”工作台：`foundation-bench.js` 左边显示场景截图与对话，右边显示第二大脑目录和文件（新增、删除按行对比，可点出处打开原件）。四段记录在 `foundation-bench-data.js`，依次为：口述日记折入已有知识页、用四个模块制作并压缩分享 H5、同一个大脑服务分享页与 CAIO 分身、同步公司脑时去敏并跳过 private 页面。每一步都对应日记、日志或 README 里的条目；新增内容必须能指回原件，不得编造。截图 `assets/real-*.webp` 已模糊头像、个人名称与目录名。第四节末尾折叠保留 `circle-story.js` 的分身组圈演示，页面标明它是虚构的未来设想。

<details><summary>科学展三联画生成提示词</summary>

An editorial illustration-story triptych for a Chinese lesson about future AI companions at a school science fair. One square sheet, exactly three equal-height wide horizontal cinematic panels stacked edge to edge, top, middle, bottom, each one a continuous single scene full width, with straight cuts at one-third and two-thirds; zero gutters, no lettering, no numbers, no arrows, no legible text. Consistent characters and real props: a Chinese young adult woman teacher in a moss-green overshirt and a Chinese adult male volunteer in a warm ochre jacket with round glasses, red tabletop robot car. TOP: morning, the woman alone at a workshop table cross-checking a paper test notebook against a laptop with the small red robot and unplugged cable clearly visible. MIDDLE: near-future scene, the woman and man approaching each other across the same brightly lit exhibition hall by the robot stand, individual phones displaying small different softly luminous green and amber signals, suggesting that their assistants recognise a common task before they speak. BOTTOM: at close range, the man pushes the red car and the woman checks its wheels with the Wi-Fi router visibly unplugged; one colleague records the result on a tablet. Hand-painted editorial narrative, warm natural daylight, tactile gouache on paper, realistic people and postures, recognisable objects, wide balanced composition. Frame each scene independently so it can be displayed as a separate wide illustration. No holographic UI, no logos.

</details>

企业路线的第5课以 CEO 的一个早晨为案例。内容依据[峰会情境对话](https://keepwork.com/api/raw/official/docs/2026/super-organization-summit.html)，练习核对门店承诺、修订共享岗位卡和确定对外合作范围。

教师五节课统一采用「四步工作台实录 → 课堂大屏课件与逐页讲稿（或跨科证据总表）→ A/B 班迭代与备课组教研实录 → 3 道课后小问答」四段式结构。前三课配有[五年级数学](teacher-samples/fractions.html)、[四年级语文](teacher-samples/reading.html)、[六年级英语](teacher-samples/english.html)的 6 页课堂大屏 H5 和对应目录的 `lesson-plan.md`；第四课以统一三维观察表（独立完成 / 提示后完成 / 未完成）汇总三科匿名证据、保留典型反例并追踪隔周无提示延迟复验；第五课以七年级手机使用情境从零生成独立 4 页 H5，核对真实页序与控件后在同一份教案写逐页讲稿，组织双 AI 单变量劝说对照实验。各课件可独立打开，PageUp/PageDown 与左右键可翻页，点击逐页大纲可同步切换内嵌预览页码。教师场景取自内置 ImageGen 按产品参考图创作的四联画：家中备课、手持白色翻页笔在首班上课、晚上复盘、平行班复教。

- 首页和 `#intro` 将共享通识图文卡放在三张身份卡前。首次选择身份或打开课次深链，会先进入通识再返回目标。通识完成状态在三套课间共享，随时可从首页或身份课重看。独立页与课堂库均可用 `#foundation`（`#foundation/1` 至 `/5`）进入。
- 独立页按身份保存浏览位置、看过示范、实操自评和企业交付物选择。课堂库里的沙箱通过课程专属缓存保存相同字段；缺少缓存支持时使用页面内进度。旧版 v3 记录保留。
- 课程悬浮时，当前身份、任务和验收标准可供主聊天助教使用。学员自己复制、粘贴并发送话术。

2026-11-20 起，通识不再播放科学展短片；`foundation_player.js`、`film/` 与 `assets/films/` 作为源文件保留，页面不再加载。

`data.js` 维护身份路线的材料和作品标准。`app.js` 管理课程导航、进度及课堂桥接。`scene.js` 提供身份实操课的模拟界面。

短片源文件说明：`film/studio.js` 搭建 Three.js 场景，`direction.js` 编排动作与摄影机；重绘命令为 `node film/render.mjs <three.min.js 路径> <Playwright 所在项目的 package.json> assets/films`。

## 课程依据

| 教学内容 | 依据及改编 |
| --- | --- |
| 超级个体、碳硅融合、一人多分身、对自己透明、从岗位组织到圈子组织、三种入口 | 2026-10-28 日记《碳基与硅基的融合：从第二大脑到超级组织》原文引用。 |
| 成为超级个体的阶段 | 2026-11-09 口述原件 `docs/2026/super-individual-stages.md`（三个阶段外加盈利目标）。 |
| 三层结构、200 节点目标、第一信源、冲突并列 | 第二大脑维护规则 `AGENTS.md`、《第二大脑》概念页与 2026-10-05 LLM Wiki 交流纪要。 |
| 超级个体 → 超级团队 → 超级组织、四模块循环、落地四步 | 已发布的 CAIO 介绍页与[分享页《超级个体时代》](https://cdn.keepwork.com/official/docs/2026/super-individual-sharing/index.html)。 |
| 工作台回放的四段记录 | `_wiki/log.md` 2026-10-31 ingest、11-09 ingest、11-18 brain-sync 与 correction；分享页 README；CAIO 计划 2026-10-31 与 11-01 纠正。 |
| 分身调用工具并留下业务记录 | 2026-10-31 KeepWork CRM 合成测试截图（非真实客户、非生产环境）。 |
| 认知共生体远景 | [36氪报道](https://www.toutiao.com/article/7709292047487828480/)与[论文](https://arxiv.org/abs/2611.05376)；设备图示为研究设想。 |
