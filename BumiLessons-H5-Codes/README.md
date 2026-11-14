# 和小布米一起学 NPL 代码编程

参考同仓库 [BumiLessons-H5](../BumiLessons-H5/README.md) 的教学组织与页面样式，将小布米“NPL代码编程”面板现有的 12 个示例整理为独立课程。

直接打开 [index.html](index.html) 选择身份，也可打开[学生学习单](student.html)或[教师教案](teacher.html)。基线为小学 5–6 年级，每课 40 分钟；教师版提供低年级支持和初高中提高活动。当前为课程设计稿，尚未经过课堂试教。

| 课次 | 内容 | 学生 | 教师 |
| --- | --- | --- | --- |
| 01 | 顺序执行：把任务拆成指令 | [学习单](student.html#l01) | [教案](teacher.html#l01) |
| 02 | 转向：先走、再转、再走 | [学习单](student.html#l02) | [教案](teacher.html#l02) |
| 03 | 循环：让一组动作重复执行 | [学习单](student.html#l03) | [教案](teacher.html#l03) |
| 04 | 变量：用一个名字保存速度 | [学习单](student.html#l04) | [教案](teacher.html#l04) |
| 05 | 条件判断：读取状态，选择分支 | [学习单](student.html#l05) | [教案](teacher.html#l05) |
| 06 | 自己设计：组合前进与转向 | [学习单](student.html#l06) | [教案](teacher.html#l06) |
| 07 | 配色：整机方案与部件颜色 | [学习单](student.html#l07) | [教案](teacher.html#l07) |
| 08 | 回放控制：播放、暂停和慢放 | [学习单](student.html#l08) | [教案](teacher.html#l08) |
| 09 | 迎宾小助手：编排迎宾脚本 | [学习单](student.html#l09) | [教案](teacher.html#l09) |
| 10 | 彩色巡逻队：用列表组织循环 | [学习单](student.html#l10) | [教案](teacher.html#l10) |
| 11 | 小小舞台导演：衔接行走与回放 | [学习单](student.html#l11) | [教案](teacher.html#l11) |
| 12 | 速度观察员：重复观察与公平比较 | [学习单](student.html#l12) | [教案](teacher.html#l12) |

每课都有完整示例和复制按钮、代码讲解、流程示意，以及 A 预测、B 运行记录、C 单处修改、D 解释与自评。教师版另外提供 40 分钟流程、A–D 参考回答、常见误解、评价和课后记录；同一课内可切换查看学生学习单。

## 使用

学生可在任务 C 点「使用本课示例」，修改一处，点「复制我的代码」并进入世界试运行。已有草稿会保留。支持新版课程查看器的 AIChat 可以在课程标签保存学习单并打开同一会话的小布米世界；独立打开的学习记录保存在课程网址下。

- 课堂使用[同一个小布米世界](https://webparacraft.keepwork.com/?pid=5316902)。等待加载，按需要加载机器人，打开“NPL代码编程”，选择对应示例或粘贴课程中的代码。课程页用于学习和记录，代码在世界中运行；世界需要联网。
- 填写和代码草稿仅保存在本机当前浏览器，使用独立的 `bumi-npl-h5:v1:` 保存空间。不会上传，也不会覆盖原课程的记录。不同网址、浏览器或电脑之间不自动同步，清理浏览数据会丢失填写；重要作品请复制另存。共用设备时使用“清空本课填写”。
- “打印本课”只打印当前课程；教师页只打印当前分栏。流程示意可点击“放大”，按 Esc 退出。复制权限不可用时，代码会被选中，按 Ctrl+C（Mac：⌘C）即可。
- 保留原 H5 的嵌入式世界和学生页适配。在支持的 AIChat 预览中，教师页可在课程内打开学生页，世界也在课程内显示；独立打开时使用新标签页。嵌入预览不显示打印按钮。
- 拷贝课程时带齐三个 HTML、`assets/`、`world-launcher.js` 和 `embedded-preview.js`。运行页面不需要 `_content/`、`_tools/`，也不需要安装依赖或启动服务器。

## 课程源与维护

- `_content/lessons-01-04.json`、`lessons-05-08.json`、`lessons-09-12.json`：逐课学生内容和教师教案。
- `_content/examples.json`：从共享 `BumiCodeExamples.lua` 提取的完整示例快照。示例编号、顺序和代码与编程面板对应。
- `_tools/reference.css`、`reference.js`：原 H5 的样式与交互基础，调整了独立保存键和课次深链定位。
- `_tools/course.css`、`course.js`、`build.py`：编程课程的代码展示、复制和页面生成。

修改课程源后，在本目录运行：

```text
python _tools/build.py
```

可同时核对当前共享示例，路径由工作区实际位置提供：

```text
python _tools/build.py --examples-source <共享脚本根>/script/apps/Aries/Creator/Game/Robot/BumiCodeExamples.lua
```

生成器仅使用 Python 标准库，检查 12 课编号、示例对应、教师流程合计 40 分钟、A–D 配对、本地链接与图片、重复 ID、师生分离和保存键；还会将 HTML 中解码后的完整代码与示例快照逐字比较。不要直接修改生成的 HTML。

## 内容与素材来源

完整示例和 API 行为依据 Paracraft 共享 `BumiCodeExamples.lua`、`BumiCodeRunner.lua` 和 `BumiCodePage.lua`。有时长的运动按仿真运动时间执行，`wait` 按现实时间等待；速度是目标指令，`healthy` 只表示行走策略状态。课程不提供自主识人、避障、测距或训练新模型的能力。

页面样式、入口适配、草地插画和机器人配图沿用同仓库 BumiLessons-H5。机器人图来自其真实模型离线渲染，草地插画作为装饰；流程图是程序示意。它们都不是本次 Web 运行证据。

舞蹈等回放来自世界已有的 Cryyzz/Lafan1_Retarget_To_BUMI-GMR 动作数据，版本 `00287add3026f38bb6748e15c857790b2a3abcd6`，许可为 CC-BY-NC-4.0，仅限非商业使用且需署名。本目录不附回放数据；播放不计算实时物理平衡。代码遵循[仓库许可证](../LICENSE)，引用素材保留各自权利。
