# AIDirectorLessons (超级学生AI通识课) Agent Guide

本目录存放 **超级学生AI通识课（3–9 年级，共 7 个年级 × 8 课 = 56 课，112 个师生课时页 + 1 个总目录页）** 的课程源码与生成的静态单页课件。任何后续迭代、扩写或重做样课时，**必须先阅读本文件与所引用的第二大脑文档，严格遵守以下核心规则，不得遗漏或破坏**。

---

## 一、核心育人目标：培养“超级个体”（引用自李西峙第二大脑 `c:/lxzsrc/LiXizhiDocs`）

本课程不是传统的“菜单操作说明书”或“应试刷题课”，而是面向中小学的 **“超级个体（Super Individual）”启蒙与实战体系**。迭代任何课件前，必须对齐第二大脑（`c:/lxzsrc/LiXizhiDocs`，在 AIChat 中映射为 `//.brain/`）中的核心教育与产品哲学：

1. **什么是超级个体（碳基真人 + 硅基第二大脑与分身）**
   - 权威来源：[c:/lxzsrc/LiXizhiDocs/AGENTS.md](file:///c:/lxzsrc/LiXizhiDocs/AGENTS.md)、[_wiki/concepts/second-brain.md](file:///c:/lxzsrc/LiXizhiDocs/_wiki/concepts/second-brain.md)、`notes/Xizhi's Diary/2026.10.28 碳基与硅基的融合：从第二大脑到超级组织 Xizhi.md`。
   - 核心定义：**碳基的学生本人 + 硅基的 AI 工作台、第二大脑与具身智能分身 = 超级个体（小导演 / 小架构师 / 一人剧组）**。
   - **四模块工作闭环**：
     1. **工作台（AIChat AI 工作台）**：学生作为“导演/提出目标的人”，清楚说出自己的意图、条件与安全边界，调度智能体协作，并检查确认结果。
     2. **工具 / Runtime（Paracraft 3D 世界 & 虚拟具身机器人）**：把想法落地为可观察、可交互、可运行的 3D 场景、虚拟具身机器人行为（CodeBlock）与动画短片。
     3. **第二大脑（Second Brain / 个人作品与经验卡）**：把经过控制变量实验核验后的观察发现、提示词配方、排障经验与安全约定沉淀为可追溯的个人知识卡片。
     4. **社交圈子（课堂展示与同伴互评）**：带着自己做出的真实作品与同学、老师交流核验。

2. **成为超级个体的三个阶段（映射到学生动手闯关设计）**
   - 权威来源：[_wiki/notes/diary-business.md](file:///c:/lxzsrc/LiXizhiDocs/_wiki/notes/diary-business.md#L249-L258)、`docs/2026/super-individual-stages.md`、[_wiki/notes/diary-education.md](file:///c:/lxzsrc/LiXizhiDocs/_wiki/notes/diary-education.md)。
   - **阶段 1｜从死记硬背打字到“清楚说出意图”（指挥 AI 与工具动手）**：学生不必死记硬背复杂语法，而是学会用结构化提示词（角色 + 感知条件 + 行动规则 + 安全边界）指挥 AI 工作台与 Paracraft。
   - **阶段 2｜从被动等结果到“主动控制变量核验”（做 AI 的裁判与总导演）**：AI 会受环境遮挡/噪音干扰，也会产生无据幻觉。学生必须通过**“只改变一个条件”的控制变量实验**亲自验证、修正错误，坚守人工最终判断。
   - **阶段 3｜沉淀个人第二大脑，产出可独立分享的作品**：“服务让人变懒，创造让人变强”（`2017.01.03 Service Decreases Creativity`）；每节课的终点不是做完选择题，而是生成一份属于学生自己的、可展示可复用的 **《超级个体作品卡》或 3D 具身机器人世界**。

---

## 新建或重做课时的编写顺序

1. **先定作品和读者。** 用一句学生听得懂的委托写清“给谁做、对方拿到后要完成什么”。先写一项可观察的验收动作，再倒推第一版需要的材料、功能与提示词。例如“新同学独自打开挑战卡，答错一次后能按提示再试”。课件备齐脱敏材料和可核对的数据，留给学生决定题目、玩法、素材或改法。
2. **把五项能力写成制作动作。** 依课题安排提问、Plan、生图、Implement、Iterate 的练习重点。提问给出可改的起步句和根据回答继续追问的入口。Plan 让学生取舍并确认验收条件。生图让学生描述画面、看实际生成图、决定取用或重画。Implement 在 AIChat 对应 Craft，要求打开生成的文件或世界并试用。Iterate 留下第一版，用真实观察提出一个具体修改，在第二版重复原操作。结果出乎预料时再给必要的原理或排障说明。
3. **分别编排师生任务。** 教师页写出现场动手的顺序，逐步给出一句可念的引导、一个投屏动作和一个需要全班作的决定。讨论与制作使用同一个主对话；课件可全屏展示，悬浮时向主对话提供整课材料与当前进度。学生页从空白作品起步，给足独立完成同类任务的材料，允许作出与教师不同的选择。
4. **逐屏解决上手问题。** 每屏让人看懂现在要做什么、点哪里、完成后应看到什么。用场景图交代任务，用实际工作台截图指认 Ask、Plan、Craft 或文件预览入口。将学生已选的目标和素材带入可编辑委托，复制、打开和追问都使用眼前这段文字。区分 AI 插画和可验证的题图、真实工作台产物和课内模拟；制作记录如实注明采用的素材和亲自完成的步骤。

### 用作品走查师生两端

- **走一遍教师课。** 从空白工作区开始，投屏提问、选方案、做出并打开第一版。请试玩者操作，带一句具体反馈回主对话，改出第二版并重测。核对切回课件时不会丢草稿或重复发送。
- **走一遍学生课。** 从全新的学生入口开始，仅靠页内引导改写一段委托、打开工作台、返回课件、试玩并导出作品。在独立窗口重新打开交付物。再检查窄屏、刷新续做，以及剪贴板、弹窗或联网受限时页面给出的下一步。
- **收两件东西。** 一件是下一位读者可以使用的作品，一件是学生自己的制作记录，含问题、计划取舍、用图理由（涉及生图时）、试玩发现与重测结果。验收报告分清真实账号实测、浏览器夹具验证和课内示例练习。

气象站样课的教学示例见 [README](README.md)。复用实现时，可分别查看[师生页面结构](authoring/weather/page.mjs)和[会话、提示词与试玩交互](authoring/weather/workshop.js)。

## 二、五大刚性约束（Core Rules — 严禁改丢）

### 规则 1：必须结合 Paracraft，部分课程结合“虚拟具身机器人”
- **平台配比硬性要求**：每个年级（3–9 年级）的 8 节课中，必须严格保持 **4 节 `Paracraft`（标记为 `"P"`）+ 4 节 `AIChat`（标记为 `"A"`）**，全套课程共 28 节 Paracraft 课与 28 节 AIChat 课。
- **虚拟具身机器人（Virtual Embodied Robot）融合**：
  - Paracraft 课程不仅限于静态搭建，还必须结合 **3D 虚拟具身机器人 / 智能体 NPC**（如：3 年级校门刷脸迎宾具身机器人与规则闯关机器人、4 年级 3D 智能分拣机器人、6 年级校园路线仿真与巡检机器人、7 年级多模态无障碍导览机器人、8 年级搭载 RAG 知识库的校园咨询台具身智能体 NPC、9 年级智慧校园综合服务机器人原型）。
  - 让学生在零硬件门槛下，直观操控并验证具身智能 **“环境感知（视觉/语音/路标检测）→ 大脑决策（规则算法/AI模型/提示词约束）→ 具身行动与安全降级”** 的完整闭环。

### 规则 2：一半在普通教室的课（教师大屏），一半动手的机房课（学生自助）
- **师生双端必须各自“开箱即用”，绝不能同一套页面简单换标题**：
  - **普通教室课（教师大屏课 `g<年级>-<课号>-teacher/index.html`）**：老师仅用一台电脑和投影大屏即可授课。提供 40 分钟五步课堂环节切换栏、全班举手投票计数器、可打开和复制的演示提示词与展开即读的逐字串词。涉及 Paracraft 时，按规则 4 提供折叠的建景脚本。
  - **机房动手课（学生上机课 `g<年级>-<课号>-student/index.html`）**：学生从独立入口即可完成，配闯关进度、语音读题和分步自检。关卡随作品安排：Paracraft 样课可以走“做实验 → 问 AI → 运行机器人 → 保存作品卡”；AIChat 样课可以走“提问 → Plan → 生图 → Craft 实现 → 试玩迭代”。

### 规则 3：开箱即用标准 —— AI 工作台输入文字支持“一键复制 + 一键打开”
- 课中所有需要学生在 **AI 工作台（`AIChat`）** 中输入的文字/提示词：
  1. 必须直接展示在醒目的提示词卡片中，并提供**点选式参数积木**（让学生点几下按钮就能组合出自己的个性化提示词，培养“说出意图”的能力）；
  2. 必须配备 **[📋 一键复制文字]** 按钮（写入剪贴板并给出明确状态提示）；
  3. 嵌入 AIChat 时直接使用主对话，不打开专用窗口。独立课件保留提示词复制入口。提示用户在哪里粘贴、何时发送，并为复制失败提供手动选择文字的入口。
  4. 必须配备 **[⚡ 在本页立即模拟 AI 回复]** 按钮（保证学生在未联网、未登录或切换窗口前，也能在本页零延迟看到 AI 工作台的结构化生成结果并完成核验）。

### 规则 4：开箱即用标准 —— Paracraft 代码参考 `paracraft-cli` 折叠写出
- 凡涉及 Paracraft 的课程，必须在页面中提供真正的、开箱即用的命令与折叠代码：
  1. **[🎮 一键打开 Paracraft 3D 世界]** 按钮（支持内嵌宿主命令唤起 `paracraft` 工具或直接打开 WebParacraft）；
  2. **零门槛快捷命令条**（严格符合 [tools/Paracraft/paracraft-commands.js](file:///c:/lxzsrc/apps/official/apps/tools/AIChat/tools/Paracraft/paracraft-commands.js) 白名单，如 `/worldenv`、`/say`、`/snow`、`/time`、`/setblock`），每条命令配 **[📋 一键复制命令]**；
  3. **折叠代码块 `<details>`（必含两层代码，均配一键复制）**：
     - **层 A：虚拟具身机器人 `CodeBlock`（代码方块）NPL 行为脚本**（遵循 [code-blocks.md](file:///c:/lxzsrc/keepworkExtension/skills/paracraft-create/references/code-blocks.md) 运行语义：如 `setActorValue`、`registerClickEvent`、`say`、`walkForward`、`turnTo`、`ask`、感知条件判断与异常降级）；
     - **层 B：参考 [paracraft-cli.md](file:///c:/lxzsrc/keepworkExtension/docs/paracraft-cli.md) 与 [codeblock-playground.lua](file:///c:/lxzsrc/keepworkExtension/skills/paracraft-create/examples/codeblock-playground.lua) 的 3D 场景一键生成代码**（包含 `createScene` + `s:box` + `s:movie` + `s:actor` + `s:editEntity` 完整 Lua 源码，以及对应的 `paracraft_cli` MCP 调用 JSON 与“一键复制让 AI 自动帮我建好场景的提示词”）。

### 规则 5：严格对标《中小学人工智能通识课程体系设计》大纲
- **四维八能与设计主线**：`01 认知启蒙（知AI·懂影响）` → `02 工具应用（会工具·懂数据）` → `03 项目实践（会拆解·能判断）` → `04 责任反思（善协作·守边界）`。
- **五步教学法**：`① 情境导入` → `② 概念理解` → `③ 工具体验` → `④ 项目实践` → `⑤ 伦理反思`。
- **治理四条底线**：工具白名单、数据最小化（严禁输入真实姓名、家庭住址、电话、身份证号与同学隐私照片）、AI使用标注与学术诚信、人工最终判断。

---

## 三、示范互动样课进展（Sample Lessons）

1. **`g3-01`（索引 `0` · 小学低段第 1 课 · 开箱即用标杆样课）**：《AI在哪里：寻找身边的智能助手》
   - **学生端（[g3-01-student/index.html](g3-01-student/index.html)）**：超级个体四关自助闯关工作台（内置 🔊 语音读题、校门虚拟具身迎宾机器人交互实验台、点选式 AI 工作台提示词生成器 + 一键复制/打开/本页模拟、Paracraft 快捷命令 + 折叠 `CodeBlock` 与 `paracraft-cli` 代码、一键生成《超级个体·AI观察与具身机器人作品卡》）。
   - **教师端（[g3-01-teacher/index.html](g3-01-teacher/index.html)）**：40 分钟大屏互动授课台（内置五步课堂环节切换器、全班举手投票计分器、教师大屏一键演示 AI 提示词卡、折叠 `paracraft-cli` 一键建景代码与展开即读的逐字授课串词）。
2. **`g5-04`（索引 `19` · 小学高段 · AIChat）**：《我用 AI 做了一个气象站挑战》。独立模块位于 `authoring/weather/`。教师在主对话中讨论并制作；学生选择温度或图表任务，依次提问、做 Plan、生图、用 Craft 实现、试玩并修改。原展签核查实验保留在材料袋中。
3. **`g8-05`（索引 `44` · 初中阶段 · AIChat）**：《生成式AI与模型评测：给校园问答助手做“四象限体检”》

---

## 四、开发、生成与验证流程

1. **只改 `authoring/` 源码，不直接手改生成后的 HTML**：
   - 课程大纲与样课数据：[authoring/curriculum.json](authoring/curriculum.json)
   - 第一课开箱即用师生工作台模块：`authoring/lesson1_turnkey.mjs`
   - 互动样课组件与画布：[authoring/activity.mjs](authoring/activity.mjs)、[authoring/scene.js](authoring/scene.js)、[authoring/activity.js](authoring/activity.js)、[authoring/activity.css](authoring/activity.css)
   - 页面构建脚本与样式：[authoring/build.mjs](authoring/build.mjs)、[authoring/course.css](authoring/course.css)
2. **重新生成全部静态页面**：
   ```bash
   node tools/OfficialLearningTools/AIDirectorLessons/authoring/build.mjs
   ```
3. **验证清单**：
   - `node --check` 检查所有修改的 `.js` / `.mjs`
   - `node scripts/inventory_packages.mjs` 验证包清单完整性
   - 运行 `tests/unit/classroom_external_catalog.test.mjs` 与 `tests/e2e/classroom_external_catalog.test.mjs`（Windows 下可设 `TEST_BROWSER_CHANNEL=msedge`）
