# 超级个体：四件事，一个 AIChat

面向**学生和老师**的 AI 原生入门课，约 40 分钟。学员原本只会浅度使用 ChatGPT 或 WorkBuddy；学完后知道自己会和 AI 一起在这四个地方工作：

| # | 四件事 | 一句话 | 在 KeepWork AIChat 里 |
| --- | --- | --- | --- |
| 1 | AI 工作台 | 说清楚，AI 就帮你动手 | 聊天区 + 右侧文件和预览 |
| 2 | 第二大脑 | 让 AI 记住你，越用越懂你 | 左侧“第二大脑”、知识图谱 |
| 3 | AI 工具 | 工具是给 AI 用的 | “工具”目录，AI 在对话中自动调用 |
| 4 | 人机圈子 | 圈子里，有人也有 AI | 顶部“圈子”、我的分身、钉钉/飞书群 |

直接用浏览器打开 [index.html](index.html)，或在 AIChat 课堂库中打开（课程会悬浮在 AIChat 上方，并把当前课告诉主聊天里的 AI 助教）。

## 每课的固定版式

1. **生活场景动画**：一个动起来的 KeepWork AIChat 窗口，学生版（小林）和老师版（王老师）各一套；可播放、暂停、逐步点击，系统“减少动态效果”时只逐步显示。
2. **三句要点**，加一张真实 AIChat 界面截图（点开放大）。
3. **在 AIChat 里试一试**：可修改的练习话术，点“复制”后到 AIChat 输入框粘贴并按回车。课程内外行为一致，只复制到剪贴板，不会替学员发送。
4. **一道自检题**：答对后顶栏该课显示 ✓。

开场是“AI 原生的一天”动画，收尾是一张 “AIChat 地图”、5 条 AI 原生习惯（可打印）和小词典。

## 文件

| 文件 | 作用 |
| --- | --- |
| `index.html` | 页面骨架：顶栏、开场、四课容器、收尾 |
| `data.js` | 全部课程内容：四件事、场景分镜（学生/老师）、练习话术、自检、习惯、小词典 |
| `scene.js` | 场景播放器与模拟 AIChat 窗口、收尾地图 |
| `app.js` | 路由（`#intro #lesson-1..4 #finish`）、身份、进度（`localStorage: super-individual.course.v3`）、复制、自检、课堂库悬浮与 `tool-context` 桥接 |
| `course.css` / `scene.css` | 页面版式 / 模拟窗口与动画 |
| `assets/art-*.webp` | 五张统一风格的生活场景插画（AI 生成，无文字） |
| `assets/workbench/brain/tools/circles.webp` | 四件事对应的 AIChat 真实界面截图 |

只改内容时，编辑 `data.js` 即可。

## 内容来源

- 四层模块（工作台 / 第二大脑 / 工具 / 圈子）与“碳基 + 硅基”的超级个体论述：`LiXizhiDocs` 中的 `notes/Xizhi's Diary/2026.10.28 碳基与硅基的融合：从第二大脑到超级组织`、`_wiki/concepts/second-brain.md`、`docs/2026/super-individual-stages.md`。
- 精简原则参考 `docs/2026/xiaoetong-trust-sharing/README.md`：每个模块写清“图 + 角色 + 产出”，每章只留一句要点。
- 场景中的人物和数据都是虚构示例；动画里的界面经过简化。
