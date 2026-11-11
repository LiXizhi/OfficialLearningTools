# 超级学生 AI 通识课 · 批量制作手册

一批按课号排期，一课交付教师大屏页和学生动手页。先做通一课，再把已验证的步骤用于同批其他课。续做时，从台账里第一项缺少交付物的步骤开始。

## 1. 开批次，先写学生要交付的作品

从 [课程大纲](authoring/curriculum.json) 取课号、平台、原有目标和实验。沿用已有目录名与课程顺序，每个年级保持 4 节 Paracraft 和 4 节 AIChat。每课先填下面五项，能写出同伴的验收动作，再开始写页面。

| 课号 | 谁会使用作品 | 第一版最小作品 | 同伴怎样验收 | 第二版用什么重测 |
| --- | --- | --- | --- | --- |
| g3-01 | 第一次报到的新生 | 能回应清晰、遮挡两种纸校牌的迎宾机器人 | 遮住星星后，能否从台词知道该找谁 | 同一张卡、同样遮挡，只改求助台词 |
| g5-04 | 科学展台的小观众 | 一道能答、能重试的气象题 | 故意答错一次，看反馈后能否自己再读图 | 用第一版的错误答案重试，比较新提示 |
| g8-05 | 接班的科技节咨询员 | 附公告和四条固定答复的体检卡 | 给每条答复判定并指出依据 | 只撤下地点证据；保留四句答复，逐题复判 |

备齐可核对的材料，例如模拟公告、练习读数、角色脚本和预期结果。标明来源及可使用范围。把需要学生亲自决定的地方留出来，例如选欢迎动作、选题、取舍一张图或改哪句反馈。

## 2. 编排同一堂课的两个入口

| 步骤 | 教师大屏 · 40 分钟参考 | 学生动手 · 每屏一个动作 |
| --- | --- | --- |
| 提问 · 5 分钟 | 投屏展示道具或公告，念一句委托，先听全班预测 | 看材料，写自己的问题；读过 AI 回复后再追问一次 |
| 制定计划 · 8 分钟 | 投票选一种做法，当场定下可观察的验收条件 | 从两种方案里选一种，改写委托，记下选择的理由 |
| 准备素材 · 7 分钟 | 展示实际用图位置；需要生图时，让全班看缩小后的图再取舍 | 做一张提示牌或封面，或整理本课所需的证据表；记录素材来源和选用理由 |
| 制作第一版 · 12 分钟 | 在同一主对话发出委托，打开生成的网页或世界，把鼠标交给试玩者 | 从空白作品开始，打开第一版，试正常情况和一个意外情况，保留第一版 |
| 试玩改版 · 8 分钟 | 记录试玩者原话，只改一个地方，重复原操作 | 另存第二版，记录前后结果，交付能独立打开的作品和自己的制作记录 |

每屏准备一句可直接念的引导、一个可编辑的委托、一次操作和一个能看见的完成信号。复制和追问使用学生眼前改过的文字。课内离线示例标明“示例”，制作记录区分模拟体验和实际生成、打开、运行的作品。

## 3. 决定哪些图需要 image-gen

| 图的用途 | 制作方式 | 验收 |
| --- | --- | --- |
| 场景、封面、角色、求助标志 | 先看已有授权素材；需要原创画面时按下节生图 | 写明主体、动作、构图、留白和使用位置；用实际投屏尺寸及手机尺寸查看裁切 |
| 读数、坐标、公告、证据编号、标准答案 | 用已核对的数据和 HTML、表格或画布排版 | 逐项核对数据；断图时题目仍可作答 |
| 指认真实软件入口 | 对实际界面截图，脱敏并裁到相关控件 | 与当前按钮名、操作路径相符 |

每张正式生成图必须为 **WebP，单文件严格小于 200,000 字节**。这批生产素材上七牛 CDN，课件源码引用验收过的 HTTPS URL。气象样课内嵌图片的方式可供查看构图；后续批量课件按 CDN 流程接图。该规范面向课件制作方，学生课堂上的生图练习不需要上传到公共 CDN。

### 生图和本地验收

以下命令从 **apps 仓库根目录**运行。示例使用 macOS/Linux shell。每张图在仓库外的批次工作目录保存一份请求，例如 `image-request.json`。将示例中的输出目录换成本批实际路径。

```json
{
  "prompt": "小学新生报到处的纸艺插画。一位小机器人停在校门旁，抬手指向值班台。横向构图，左上留白给课件标题。画面不用文字、校徽和真人照片。",
  "n": 1,
  "outputDir": "/tmp/lesson-batch/g3-01/images",
  "webp": { "maxKB": 195, "allowResize": true }
}
```

```sh
GEN=.github/skills/gen-image/scripts/gen-image.mjs
REQ=/tmp/lesson-batch/g3-01/image-request.json
node "$GEN" list
node "$GEN" dry-run --request "$REQ"
node "$GEN" generate --request "$REQ"
```

使用仓库已配置的模型、私有凭证和 Sharp 环境。生成器的 `maxKB` 按 1024 字节计算，填 195 的上限是 199,680 字节，给严格边界留有余量。遇到压缩失败保留原图，先在本地重新编码；付费生成超时先查本次结果。把最终选中的 WebP 命名为“用途-版本”，如 `gate-help-v1.webp`。为改图递增版本，便于旧课件继续使用原图。

下面的命令检查 WebP 文件头和实际字节数，并输出台账所需的 SHA-256。用图片查看器打开同一文件，检查清晰度、裁切和透明边缘。最终只将验收通过的 WebP 加入上传清单。

```sh
ASSET=/tmp/lesson-batch/g3-01/gate-help-v1.webp
python3 - "$ASSET" <<'PY'
import hashlib, sys
from pathlib import Path
p = Path(sys.argv[1])
b = p.read_bytes()
if p.suffix.lower() != ".webp" or b[:4] != b"RIFF" or b[8:12] != b"WEBP":
    raise SystemExit(f"WebP 格式检查失败：{p}")
if len(b) >= 200_000:
    raise SystemExit(f"文件超限：{len(b)} 字节")
print(p.name, len(b), hashlib.sha256(b).hexdigest())
PY
```

### 上传 CDN、回读、接入课件

使用 apps 的 `.github/skills/upload-deploy-cdn-files/` 通用文件上传器，依赖和私有凭证按该目录的 `SKILL.md` 配置。指定课号前缀；同课多张图可在同一命令中逐个列出。整目录参数会递归上传，把原图、请求文件和临时稿留在上传清单之外。

```sh
LESSON=g3-01
python3 .github/skills/upload-deploy-cdn-files/qiniu_upload_local_files.py \
  --prefix "keepwork/cdn/ai-director-lessons/$LESSON/" "$ASSET"
```

1. 从上传器的逐文件成功结果复制实际 URL 和 object key，按文件名核对本批数量。对每张成功图执行下面的回读；`CDN_URL` 设置为刚复制的 HTTPS 地址。
2. 回读成功后把 URL 写入 `authoring/` 中该课的素材引用。为图片写能表达教学信息的替代文字，保留明确的宽高或比例。屏蔽 CDN 请求再打开一遍，确认仍能读引导、做题、导出记录。
3. 续跑时，已验收的同一版本先用原 URL 回读比对，相同就复用；对失败项查清路径、网络或凭证后单独重试。哈希不一致时检查缓存和版本名，再决定是否上传新版本。按既有上传技能处理可选的资源 Git 镜像留档。

```sh
# 在与 ASSET 相同的 shell 中设置 CDN_URL 后运行
(
  set -eu
  : "${CDN_URL:?请先设置上传器返回的完整 HTTPS 地址}"
  fetched=$(mktemp)
  trap 'rm -f "$fetched"' EXIT
  curl --proto '=https' --fail --silent --show-error "$CDN_URL" -o "$fetched"
  cmp "$ASSET" "$fetched"
  echo "CDN 图片与本地验收文件逐字节一致"
)
```

## 4. 接入源码并生成师生页

- 在 [课程大纲](authoring/curriculum.json) 定位课目。类似迎宾和问答体检的课可复用 [项目课页面](authoring/project-lessons.mjs) 与 [互动逻辑](authoring/project-workshop.js)，为新课显式接入 [静态页面生成器](authoring/build.mjs)。需要自定义读数或带回作品试玩时，参考 [气象页](authoring/weather/page.mjs) 和 [气象互动](authoring/weather/workshop.js)。
- 复用师生切换、朗读、复制、示例、草稿和作品导出。Paracraft 课提供可运行的 CodeBlock、建景脚本、打开世界的入口和两种测试条件。主对话、悬浮与全屏沿用现有课件协议。详细约定见 [课程贡献指南](AGENTS.md)。
- 在 **AIChat 目录**执行以下静态课件生成与检查。对本次改过的每个 JS/MJS 都运行一次语法检查。生成器会重写整套静态页，先看当前差异，生成后核对课号、师生页和目录。保留已有工作区修改。

```sh
COURSES=tools/OfficialLearningTools/AIDirectorLessons
node --check "$COURSES/authoring/build.mjs"
node "$COURSES/authoring/build.mjs"
node scripts/inventory_packages.mjs
git -C tools/OfficialLearningTools diff --check
git -C tools/OfficialLearningTools status --short
```

## 5. 逐课验收，按批交付

| 验收面 | 实际操作 | 台账里记录什么 |
| --- | --- | --- |
| 教师独立页和 AIChat 内嵌页 | 从目录进入，投屏、选方案、复制改过的委托，在主对话继续；切回当前步骤 | 教师页路径，主对话和草稿是否保留 |
| 学生页和窄屏 | 新开页面，只靠页内引导做完；中途刷新；禁用剪贴板或断图再走一次 | 学生页路径、续做位置、人工复制与断图结果 |
| 作品 | 在独立窗口打开第一、二版，用同一输入重测；Paracraft 课实际打开世界并运行正常和异常分支 | 两版作品、操作、观察结果、学生制作记录 |
| 资源 | 对照清单检查每张生成图的格式、字节数、画面和 CDN 回读结果 | 用途、来源/模型、版本、字节、SHA-256、object key、实际 URL、替代文字 |
| 课程库回归 | 用 VS Code Live Server 打开 AIChat，设置 `TEST_BASE_URL` 为实际 AIChat 目录 URL；运行下列命令 | 用例结果，真实账号实测、浏览器夹具或离线示例的覆盖范围及待测项 |

```sh
node --test tests/unit/classroom_external_catalog.test.mjs tests/e2e/classroom_external_catalog.test.mjs
```

**复制这两行表头即可开批。** 一课一行进度，一图一行素材；同一图用于两个入口时写明两个使用位置。无生图的课在进度栏填“无需生图”。交接时写出失败项和下一步，新批次可直接读取上批已经核验的素材记录。

```text
课号 | 平台 | 目标读者/作品 | 验收动作 | 教师页 | 学生页 | 素材状态 | 第一版/第二版结果 | 验证环境 | 当前进度/下一步
课号 | 用途/使用位置 | 来源/模型/请求文件 | 文件与版本 | 尺寸 | 字节数 | SHA-256 | CDN object key | CDN URL | 替代文字 | 回读结果
```

**下次批量委托示例**

> 按《批量制作手册》处理 g4-01 至 g4-04。先列出四课各自的作品、读者和验收动作，再逐课完成师生双页。需要新图时生成 WebP，每张小于 200,000 字节，上传七牛 CDN、回读一致后接入课件。最后按课号交付预览入口、两版作品的重测结果、素材台账和待测项。

如本批还包含课程发布，按 OfficialLearningTools 独立源码仓库和 apps 的发布流程分别核验提交、主仓和镜像，再交付线上入口。素材 CDN 回读与课程上线分别记录。
