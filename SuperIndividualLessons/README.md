# 用第二大脑成为超级个体

在官方课堂库选择《超级个体培训课》，或直接打开 [课程首页](index.html)。首次先读共享通识《什么是第二大脑？》，再选择身份，学生路线四节课，教师和企业路线各五节课。第一课用 25 分钟完成保存、换新对话找回原件、引用并应用。后面的课沿用前一课的成果，练习比较、核验和迁移。

| 身份 | 第一份材料 | 结课作品 |
| --- | --- | --- |
| 学生（小学高年级至初中） | 分数错题卡 | 同学能试用的一页学习指南 |
| 学校老师 | 复用旧 PPT 的互动教案、A/B 班观察和晚间修订 | 同事可直接试教的教学包 |
| IT 企业员工或管理者 | 有出处的项目决策记录 | 用新项目检验过的交接或决策指南 |

企业路线在第三、四课可切换交付物。每节课含虚构材料、分步演示、可修改和复制的练习话术及作品自评。第一课准备能连接第二大脑的 AIChat 环境；设备暂未连通时可以先看示范，稍后完成真实存取。真实文件和作品由学员在自己的第二大脑中保存。

## 课程入口与进度

通识第一章先并列展示随身 AI 的研究远景和今天可以操作的第二大脑工作台。中文图解的可点击标注及说明在 `foundation-intro.js`，底图在 `assets/super-individual-future.webp`。修改标注无需重新生成图片。

通识第四章用五幕科学展推演分身协作，第一章开场也有直达入口。场景、对话、成员可见的消息和交接原件在 `circle-story.js`。相遇组圈是未来设想，所有确认动作只改变本次教学示例。三幕插画使用内置 ImageGen 生成，裁为 `assets/circle-workbench.webp`、`assets/circle-encounter.webp` 和 `assets/circle-test.webp`。

<details><summary>科学展三联画生成提示词</summary>

An editorial illustration-story triptych for a Chinese lesson about future AI companions at a school science fair. One square sheet, exactly three equal-height wide horizontal cinematic panels stacked edge to edge, top, middle, bottom, each one a continuous single scene full width, with straight cuts at one-third and two-thirds; zero gutters, no lettering, no numbers, no arrows, no legible text. Consistent characters and real props: a Chinese young adult woman teacher in a moss-green overshirt and a Chinese adult male volunteer in a warm ochre jacket with round glasses, red tabletop robot car. TOP: morning, the woman alone at a workshop table cross-checking a paper test notebook against a laptop with the small red robot and unplugged cable clearly visible. MIDDLE: near-future scene, the woman and man approaching each other across the same brightly lit exhibition hall by the robot stand, individual phones displaying small different softly luminous green and amber signals, suggesting that their assistants recognise a common task before they speak. BOTTOM: at close range, the man pushes the red car and the woman checks its wheels with the Wi-Fi router visibly unplugged; one colleague records the result on a tablet. Hand-painted editorial narrative, warm natural daylight, tactile gouache on paper, realistic people and postures, recognisable objects, wide balanced composition. Frame each scene independently so it can be displayed as a separate wide illustration. No holographic UI, no logos.

</details>

企业路线的第5课以 CEO 的一个早晨为案例。内容依据[峰会情境对话](https://keepwork.com/api/raw/official/docs/2026/super-organization-summit.html)，练习核对门店承诺、修订共享岗位卡和确定对外合作范围。

教师第5课以七年级手机使用情境从零生成独立 H5，核对真实页序后在同一份教案写逐页演讲稿。学生自定义两张 AI 角色卡，按原话对照两轮对话。页内预演和可下载的离线 H5 共用工作台展示的源文件。

教师前三课配有[五年级数学](teacher-samples/fractions.html)、[四年级语文](teacher-samples/reading.html)、[六年级英语](teacher-samples/english.html)的 H5 和对应目录的 lesson-plan.md。课堂情节均为模拟。各页可独立读取，PageUp/PageDown 与左右键可翻页。内嵌预览、逐页大纲与 AI课程互动助手备课/授课入口位于工作台下方。第四课比较三科的证据、反例与延迟复验。教师场景取自内置 ImageGen 按产品参考图创作的四联画：家中备课、手持白色翻页笔在 A 班上课、晚上复盘、B 班复教。课件开场图分别表现等长纸条、铃铛间飞行的蝙蝠和问路街区。

- 首页和 `#intro` 将共享通识图文卡放在三张身份卡前。四个通识章节各配校园科学展短片和概念插画。首次选择身份或打开课次深链，会先进入通识再返回目标。通识完成状态在三套课间共享，随时可从首页或身份课重看。独立页与课堂库均可用 `#foundation` 进入。
- 独立页按身份保存浏览位置、看过示范、实操自评和企业交付物选择。课堂库里的沙箱通过课程专属缓存保存相同字段；缺少缓存支持时使用页面内进度。旧版 v3 记录保留。
- 课程悬浮时，当前身份、任务和验收标准可供主聊天助教使用。学员自己复制、粘贴并发送话术。

每章先交代人物、眼前的难题和一个观察问题。30 秒短片有一段开场和四幕故事，普通话旁白和画面内字幕同步讲出动作、原因和结果。人物在同一处展台拔线、操作电脑、修改检查单、交接和验收。点击播放可连看，上一幕和下一幕可逐张查看成片剧照。LLM Wiki 章会在展示两次测试之后暂停，请学员判断依据，再看修订结果。课堂助教能读到当前动作与判断。

`foundation.js` 维护分幕字幕、动作描述和练习。`foundation_player.js` 以视频时间同步播放、停顿和字幕。`data.js` 维护身份路线的材料和作品标准。`app.js` 管理课程导航、进度及课堂桥接。`scene.js` 提供身份实操课的模拟界面。

短片和剧照位于 `assets/films/`。制作源文件在 `film/`，其中 `studio.js` 搭建 Three.js 场景、角色和道具，`direction.js` 编排动作、屏幕内容与摄影机。重绘需要 Three.js r160 的浏览器脚本、Playwright、ffmpeg 和 ffprobe，以及带简体中文桌面语音的 Windows PowerShell。使用 `node film/render.mjs <three.min.js 路径> <Playwright 所在项目的 package.json> assets/films` 输出四部 H.264 短片及各幕剧照。学生端直接读取本地媒体。

## 课程依据

| 教学内容 | 依据及改编 |
| --- | --- |
| 原件、知识地图、维护规则 | 2026-10-05 的 LLM Wiki 研讨，个人第二大脑的维护说明及《第二大脑》概念页。课程把第一信源、交叉链接与冲突核验改编成两次离线测试。 |
| 真人、共同记忆与多个分身 | 2026-10-28《碳基与硅基的融合：从第二大脑到超级组织》，以及 11 月 9 日有关超级个体成长阶段的口述。 |
| AIChat 四部分与个人脑、公共脑 | 2026-10-29 校园第二大脑讲稿中有关工作台、知识关系、工具、圈子和学校公共脑的章节。[公开图文分享](https://cdn.keepwork.com/official/docs/2026/xiaoetong-trust-sharing/index.html) |
| 交接会与实操复验 | 由一手工作实践提炼。用虚构科学展和报表需求练习区分稳定方法与实时状态、个人验证与共享审定、团队决议与待办。 |
| 换一个助手后还能接续什么 | 借鉴“认知共生体”报道从日常场景发问的叙述方式。课程以原创展台故事追问经验如何留存、人自己如何判断。[延伸阅读](https://www.toutiao.com/article/7709292047487828480/) |
