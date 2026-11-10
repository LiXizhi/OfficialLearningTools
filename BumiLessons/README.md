# 和小布米一起理解具身智能

从 [课程目录](index.html) 进入 8 个单元、16 对教师与学生页面。以小学五至六年级为基线，每课约 40 分钟，教师教案另列学段调整与离线活动。

课程取材于 [bumi-robot-assets 的 V2 课程介绍](https://code.kp-para.cn/paracraft/bumi-robot-assets/-/blob/master/bumi-edu-docs-v2/Bumi具身智能通识课程介绍.md)，本次使用的源码提交为 `8bf1479ae757d5c553ea9759578d6a5887d5d4b8`。学生学习单、教师教案与图片说明沿用该版本。动作数据的来源和使用条件见第 14 课。课内实验使用独立的教学模型，页面另有研发仿真世界入口，两种观察分别记录。

课时首先进入逐幕授课，可切到大屏、按左右键翻幕，或按任务跳转。16 张开场情境插画由 AI 生成；供核对的原图按学习单顺序放映，图解支持手动聚焦、连续演示、暂停与还原。第 7 课的时间尺直接读取原表中的角度。师生的逐幕作答保存在各自的页面，并可随挑战卡导出。

互动实验的四个环节依次是预测、动手实验、做第一版、试玩改版。教师端可统计预测票数并进入讲课会话，学生端可自行选择预测、操作并追问。第 4 课先盖住画面数秒停车，再看着黄旗喊停。两次用时与偏差直接带入制作台。其余课时按主题提供关节定位、保留速度的转向轨迹、姿态剪辑、变速播放、流程编排、状态交接、变量比较与证据归类等活动。原教案和学习单放在折叠材料中。

参照五年级气象站样课，每组以实际观察设计一道给同伴的展题，保留第一版、试玩者原话、改过的提示及复测结果。导出的 HTML 自带本课实验。下一组可在自己的窗口重新操作，展开两版展题核对证据。草稿属于当前浏览器；在课堂沙箱中请在离开前导出。教师可分别打开讲课与制作会话。AI 建议和纸卡活动均不能替代仿真实测记录。

本目录独立运行。本地 Live Server 下 AI 教师的互动课程库读取本目录的 course.json。AIChat 发布清单不收录本目录。当前世界通过普通链接打开，待 WebParacraft 发布后再对接 ParacraftTool。

从对应版本的外部资料重新生成 HTML 时，在装有 Python-Markdown、Beautiful Soup 和 Pillow 的环境运行：

```text
py -X utf8 authoring/render.py <bumi-robot-assets>/bumi-edu-docs-v2
```

逐幕编排在 authoring/lesson_film.py，镜头与解说在 figure_shots.js，播放控制在 lesson_film.js。逐课实验任务在 missions.js，课堂活动在 classroom.js，展题制作与离线交付在 workshop.js，样式在 course.css。教学图以 WebP 交付。39 张原 SVG 图使用对应课次的 AI 情境插画重新排版，数据图的几何关系与文字取自上游源图。当前 CDN 图片版为 e5770abee64a32，单张上限 200,000 字节。在源码目录直接打开课件会使用本地图片；从 HTTP 进入时优先加载 CDN 图片，加载失败回退本地。

需要从上游重新制图时，运行 `node authoring/render_images.mjs <bumi-robot-assets>/bumi-edu-docs-v2/assets`，使用现有浏览器测试环境的 Playwright 与 Edge。更新后的 WebP 应先按新目录上传并核对，再更新 render.py 中的 IMAGE_CDN 并生成课件。
