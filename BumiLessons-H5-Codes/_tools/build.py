"""由本目录课程源生成可直接打开的 H5；仅使用 Python 标准库。"""
from pathlib import Path
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import re
import argparse

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / '_tools'
WORLD = 'https://webparacraft.keepwork.com/?pid=5316902'
API = 'https://cdn.keepwork.com/para-robot/robotics/bumi/bumi-edu-coding/api.html'
TITLE = '和小布米一起学 NPL 代码编程'
UNITS = [
    ('单元一', '把动作写成程序', [1, 2, 3]),
    ('单元二', '用数据和判断控制', [4, 5, 6]),
    ('单元三', '颜色与动作数据', [7, 8]),
    ('单元四', '综合创作与观察', [9, 10, 11, 12]),
]


def e(value):
    return escape(str(value), quote=True)


def ul(items, ordered=False, cls=''):
    tag = 'ol' if ordered else 'ul'
    return f'<{tag} class="{cls}">' + ''.join(f'<li>{e(x)}</li>' for x in items) + f'</{tag}>'


def field(label, code=False):
    css = 'cell code-draft' if code else 'cell'
    return f'<label class="field-label">{e(label)}<textarea class="{css}" aria-label="{e(label)}" rows="{7 if code else 2}" spellcheck="false"></textarea></label>'


def section(title, text):
    return f'<section class="sec"><h2>{e(title)}</h2>{text}</section>'


def task(letter, title, text):
    return f'<section class="sec"><h2 class="task-heading"><b>{letter}</b>{e(title)}</h2>{text}</section>'


def table(headers, rows, fill=False, label='观察记录'):
    out = '<div class="tblw"><table><thead><tr>'
    out += ''.join(f'<th scope="col">{e(c)}</th>' for c in headers)
    out += '</tr></thead><tbody>'
    for row in rows:
        assert len(row) == len(headers), (headers, row)
        out += '<tr>'
        for col, value in enumerate(row):
            if col == 0:
                out += f'<th scope="row">{e(value)}</th>'
            elif fill:
                out += f'<td><textarea class="cell" rows="2" aria-label="{e(label)} · {e(row[0])} · {e(headers[col])}">{e(value)}</textarea></td>'
            else:
                out += f'<td>{e(value)}</td>'
        out += '</tr>'
    return out + '</tbody></table></div>'


def highlighted(code):
    pattern = r'(--[^\n]*|"(?:\\.|[^"\\])*"|\b(?:local|for|in|do|end|if|then|else|true|false|nil)\b|\b\d+(?:\.\d+)?\b|\b(?:bumi\.[A-Za-z]+|wait|print|ipairs)\b)'
    parts, cursor = [], 0
    for m in re.finditer(pattern, code):
        parts.append(e(code[cursor:m.start()]))
        token = m.group()
        kind = 'comment' if token.startswith('--') else 'string' if token.startswith('"') else 'number' if token[0].isdigit() else 'function' if token.startswith('bumi.') or token in ('wait', 'print', 'ipairs') else 'keyword'
        parts.append(f'<span class="{kind}">{e(token)}</span>')
        cursor = m.end()
    parts.append(e(code[cursor:]))
    return ''.join(parts)


def code_card(lesson):
    return f'<div class="code-card"><div class="code-caption"><span>面板示例 {e(lesson["example"]["label"])}</span><button type="button" class="noprint" data-copy-code>复制代码</button></div><pre tabindex="0" aria-label="第 {lesson["number"]} 课完整 NPL 示例"><code>{highlighted(lesson["example"]["code"])}</code></pre></div>'


def unit_for(number):
    return next((a, b) for a, b, numbers in UNITS if number in numbers)


def figure(lesson, suffix):
    ident = f'l{lesson["number"]:02d}-{suffix}-flow'
    return f'<figure class="fig" id="{ident}"><div class="fig-h"><b>把程序读成步骤</b><button class="zoom" type="button">放大</button></div><div class="fig-b">{ul(lesson["flow"], True, "code-flow")}</div><figcaption><span class="kind">程序示意</span>帮助理解执行顺序；实际现象请到小布米世界观察并记录。</figcaption></figure>'


def world_link(label='打开小布米世界 ↗'):
    return f'<a class="tbtn go" href="{WORLD}" target="_blank" rel="noopener">{e(label)}</a>'


def student(lesson, suffix='s'):
    number = lesson['number']
    content = '<p class="lede">学生学习单 · 小学 5–6 年级 · 40 分钟 · 可小组共用设备，也可观察教师投影。</p>'
    content += f'<div class="question"><span class="qi">?</span><p>{e(lesson["question"])}</p></div>'
    content += section('今天要做到', ul(lesson['goals'], cls='lesson-goals'))
    content += section('先进入同一个世界', f'{world_link()}<p>等待世界加载；需要时点击“加载小布米机器人”，再打开“NPL代码编程”。在“选择示例”中选“{e(lesson["example"]["label"])}”，也可复制下方代码到输入框。</p><div class="world-route"><span>小布米世界</span><i>→</i><span>NPL代码编程</span><i>→</i><span>{e(lesson["example"]["label"])}</span><i>→</i><span>run</span></div><p>指令库中的图块可拖入或点击插入；需要调整参数时，可编辑图块参数或代码。先读程序，再点 run。需要中止时点 Stop；重新从起点比较时，可先点 reset。运行结果看小布米、面板状态和下方输出。</p><p class="lede">本页用来学习、复制和记录，程序在小布米世界中运行。若当前世界没有“NPL代码编程”入口，请告诉老师，并记录本次未完成网页实操。</p>')
    content += task('A', '先预测，再读代码', f'<p>{e(lesson["predict"])}</p>{field("我的预测与理由")}{figure(lesson, suffix)}{code_card(lesson)}')
    concepts = '<div class="concept-grid">' + ''.join(f'<div class="concept"><b>{e(c["term"])}</b><p>{e(c["text"])}</p></div>' for c in lesson['concepts']) + '</div>'
    notes = '<dl class="code-notes">' + ''.join(f'<dt><code>{e(r["code"])}</code></dt><dd>{e(r["text"])}</dd>' for r in lesson['read']) + '</dl>'
    content += section('读懂这几个地方', concepts + notes)
    obs = lesson['observation']
    observation_mode = '<p>我的观察方式：<label class="ck"><input type="checkbox" aria-label="观察方式：小组网页操作">小组网页操作</label><label class="ck"><input type="checkbox" aria-label="观察方式：教师投影">教师投影</label><label class="ck"><input type="checkbox" aria-label="观察方式：本次未完成网页实操">本次未完成网页实操</label></p>'
    content += task('B', '运行一次，留下证据', ul(lesson['steps'], True) + observation_mode + table(obs['columns'], obs['rows'], True) + field('我看到的状态、输出或现象'))
    content += task('C', '改一处，再试一次', f'<p>{e(lesson["modify"]["instruction"])}</p><div class="callout info"><p>{e(lesson["modify"]["focus"])}</p></div>{field("我改了哪一处？预测什么会变化？")}{field("我的改进代码（记录草稿，请复制到世界中运行）", True)}{field("再次运行后，实际变化与我的预测") }<h3>还有时间，试试</h3><p>{e(lesson["challenge"])}</p>')
    content += task('D', '用记录解释', ''.join(field(q) for q in lesson['reflection']) + '<h3>自我检查</h3>' + ''.join(f'<p><label class="ck"><input type="checkbox" aria-label="自我检查：{e(c)}">{e(c)}</label></p>' for c in lesson['selfCheck']))
    content += '<div class="callout"><p>收尾：点 Stop，确认程序已停止。回放课确认片段已停止并归位。需要恢复外观时，先保留代码，再点“返回主面板”→“配色”→“恢复默认配色”。重要作品请先复制另存。保留本次记录，不补编没观察到的结果。</p></div>'
    return content


def teacher(lesson):
    t = lesson['teacher']
    number = lesson['number']
    content = f'<p class="lede">教师教案 · 小学 5–6 年级，40 分钟的设计基线 · <a href="#l{number:02d}-s">本课学生学习单</a></p>'
    content += section('本课一览', f'<p><strong>核心问题：</strong>{e(lesson["question"])}</p>{ul(t["targets"])}<p><strong>对应示例：</strong>{e(lesson["example"]["label"])}。成果为 A 预测、B 运行记录、C 一次修改、D 证据解释。允许口述、指认和同伴代写。</p>')
    content += section('课前用同一世界预演', world_link() + ul(t['prepare'], True) + '<p>等待世界加载，加载小布米，进入“NPL代码编程”，选本课示例。先确认 run、Stop、reset 和输出区可用。没有编程入口或回放资源不可用时反馈维护人员，使用下方备用方式，并如实记录未完成网页实操。</p>')
    rows = [[f'{p["minutes"]} 分钟', p['title'], p['activity'], p['prompt']] for p in t['plan']]
    content += section('40 分钟课堂流程', table(['时间', '环节', '教师与学生活动', '追问'], rows) + '<p class="lede">35 分钟时缩短展示与拓展各约 2–3 分钟，保留 A–D；45 分钟时增加一轮 C 修改验证。2–3 人共用时轮换操作员、观察员、记录员。</p>')
    content += section('示例与讲解重点', code_card(lesson) + figure(lesson, 't') + '<dl class="code-notes">' + ''.join(f'<dt><code>{e(r["code"])}</code></dt><dd>{e(r["text"])}</dd>' for r in lesson['read']) + '</dl>')
    content += section('A–D 参考回答与观察依据', table(['学生任务', '参考与判断依据'], [[a['task'], a['text']] for a in t['answers']]) + '<p class="lede">参考描述用于核对概念；学生实测可能不同，先核对操作和状态，再讨论原因，不要求数据符合预设。</p>')
    content += section('常见误解', ul(t['pitfalls']))
    content += section('怎样评价', ul(t['assessment']) + '<p>评价记录是否支持解释、修改是否清楚、表达是否如实。不按设备速度、打字快慢或动作是否炫酷评分。</p>')
    content += section('支持与提高', f'<p><strong>需要支持的学生／低年级：</strong>{e(t["adaptation"]["support"])}</p><p><strong>初高中与进阶：</strong>{e(t["adaptation"]["extension"])}</p>')
    content += section('设备或网络异常时', f'<p>{e(t["fallback"])}</p><p>备用材料用于阅读程序和预测，不能当成本次 Web 实操证据。保留问题描述，课后再核验。</p>')
    content += section('课后记录', field('本课实际完成到哪个任务？使用了哪种观察方式？') + field('学生最常见的理解或误解，以及一条原话') + field('下次调整什么？需要核验哪些现象？'))
    return content


def tools_bar():
    return '<div class="tools noprint"><span>填写仅保存在本机当前浏览器。</span><button type="button" data-act="print">打印本课</button><button type="button" data-act="clear">清空本课填写</button></div><p class="storage-hint noprint" role="status">请在关闭页面前稍候，让填写自动保存；共用设备时课前清空本课填写。</p>'


def navigation(lesson, lessons):
    n = lesson['number']
    left = f'<a href="#l{n-1:02d}"><small>← 上一课 · 第 {n-1:02d} 课</small>{e(lessons[n-2]["title"])}</a>' if n > 1 else '<a href="#home"><small>←</small>课程目录</a>'
    right = f'<a class="nx" href="#l{n+1:02d}"><small>下一课 · 第 {n+1:02d} 课 →</small>{e(lessons[n]["title"])}</a>' if n < 12 else '<a class="nx" href="#home"><small>→</small>回到课程目录</a>'
    return '<nav class="lnav noprint" aria-label="课次导航">' + left + right + '</nav>'


def lesson_view(lesson, lessons, role):
    n = lesson['number']
    unit, subject = unit_for(n)
    image = 'stand-34-whiteBlue.webp' if n in (7, 9, 10) else 'stand-34-blackGold.webp' if n == 11 else 'dance-490.webp' if n == 8 else 'walk-2.webp' if n in (2, 3, 4, 6, 12) else 'stand-34.webp'
    head = f'<section class="view lesson" id="l{n:02d}" data-title="第 {n:02d} 课 {e(lesson["title"])}"><header class="lhead"><div class="lnum"><small>LESSON</small>{n:02d}</div><div><p class="lmeta"><span class="chip k">{"学生学习单" if role == "student" else "教师教案"}</span><span class="chip">{unit} · {subject}</span><span class="chip">40 分钟</span></p><h1>{e(lesson["title"])}</h1><p class="lede">{e(lesson["subtitle"])}</p></div><img class="rb" src="assets/robot/{image}" alt="" loading="lazy"></header>'
    if role == 'teacher':
        body = f'<div class="tabs noprint"><a href="#l{n:02d}" data-pane="t">教师教案</a><a href="#l{n:02d}-s" data-pane="s">学生学习单</a></div><div class="panes"><div class="pane doc" data-pane="t" data-save="l{n:02d}-t">{teacher(lesson)}</div><div class="pane doc" data-pane="s" data-save="l{n:02d}-s">{student(lesson)}</div></div>'
    else:
        body = f'<div class="doc" data-save="l{n:02d}">{student(lesson)}</div>'
    return head + body + tools_bar() + navigation(lesson, lessons) + '</section>'


def hero(role):
    return f'<div class="hero"><div><p class="course-label">BUMI / NPL CODE LAB</p><h1>和小布米一起<br>学 NPL 代码编程</h1><p class="sub">12 个示例，12 次动手探索。<br>把想法写成程序，用观察说明结果。</p><div class="acts"><a class="tbtn go" href="#l01">从第 01 课开始</a>{world_link("打开小布米世界 ↗")}</div></div><img class="hero-backdrop" src="assets/bumi-meadow.webp" alt="" aria-hidden="true" width="1942" height="809" fetchpriority="high"></div>'


def home(lessons, role):
    cards = '<div class="hgrid"><div class="hcard"><h3>读 · 改 · 跑 · 讲</h3><p>先预测、读代码，再到同一个小布米世界运行。每课改一处，用自己的记录解释变化。</p></div><div class="hcard"><h3>一台小布米，小组轮换</h3><p>操作员写代码，观察员看动作与输出，记录员留下证据。也可以一起观察教师投影。</p></div><div class="hcard"><h3>把学习留在这里</h3><p>任务单和代码草稿可直接填写，自动保存在当前浏览器；支持打印本课，不上传填写内容。</p></div></div>'
    cards += '<div class="callout info"><p>适用基线：小学 5–6 年级，每课 40 分钟。前 8 课学习基础，后 4 课综合应用。编程控制使用已有行走策略与动作数据；本课程不训练新模型。</p></div>'
    for unit, title, numbers in UNITS:
        cards += f'<section class="unit"><h2><b>{unit}</b>{title}</h2><div class="lcards">'
        for n in numbers:
            lesson = lessons[n-1]
            cards += f'<a class="lcard" href="#l{n:02d}"><span class="n">{n:02d}</span><b>{e(lesson["title"])}</b><span>{e(lesson["subtitle"])}</span></a>'
        cards += '</div></section>'
    cards += '<section class="sec"><h2>三件事，始终分清</h2><p><strong>运动指令：</strong>给已有行走策略目标，不等于精确位移；<strong>轨迹回放：</strong>播放已有动作数据，不计算实时物理平衡；<strong>状态与输出：</strong>只说明程序读取或打印的内容，不代表自主识别人、障碍物或意图。</p><p class="lede">机器人配图沿用原 H5 的真实模型离线渲染；流程图是程序示意，都不是本次网页运行截图。学习结果请以课堂观察和记录说明。</p></section>'
    return '<section class="view" id="home" data-title="课程目录">' + hero(role) + cards + '</section>'


def overview(lessons):
    rows = [[f'{l["number"]:02d} · {l["title"]}', l['goals'][0], l['goals'][-1]] for l in lessons]
    content = section('课程定位与使用', '<p>这是一套独立的 12 课编程课程，承接“和小布米一起理解具身智能”的体验，用面板已有示例学习程序表达。设计基线为小学 5–6 年级，每课 40 分钟；初高中可加深分析，低年级可由教师操作、学生口述。</p><p>每课 A 预测、B 运行、C 修改、D 解释；学生页只保留任务与记录，教师页含教案、参考回答及对应学生学习单。每个网页会话只有一台 Bumi，安排小组角色轮换。</p><p>课前按本课完整步骤预演，不需要安装仿真软件。首次进入课堂世界等待加载，按页面提示处理；编程入口或资源不齐时向维护人员反馈，不把备用阅读当作实操。</p>' + world_link())
    content += section('12 课路径与可观察成果', table(['课次', '本课学习', '解释与成果'], rows))
    content += section('通用操作与判断', table(['操作／读数', '教学中怎样理解'], [['run', '开始当前程序；先结束上一次，再运行修改后的版本。'], ['Stop', '中止程序、清零并暂停仿真；正在回放时停止并归位。折叠面板不会停止，返回主面板会停止并保留会话草稿。'], ['reset', '停止、清零并重置姿态；保留当前代码，配色另行恢复。'], ['wait(秒)', '等待现实时间；不是暂停整个世界或精确运动计时。'], ['forward / turnLeft 等有时长运动', '按仿真实际运动时间推进，结束后清零；转向示例是原地转。'], ['status().healthy', '读取时行走策略是否正常，不是碰撞检测、访客识别或任务成功。'], ['status().speed', '当前速度指令，不是实测行走速度。'], ['动作回放', '已有轨迹的播放，停止后归位并保持暂停。']]))
    content += section('评价与课堂组织', '<p>重点看学生是否把预测和实测分开、能否说清改了什么、结论是否有记录支持。允许口述、指图、同伴代写，不以设备性能或程序一次运行成功与否评分。课末确认 Stop，保留现象记录。</p><p>35–45 分钟的调整、预期现象、误解、支持与提高分别在逐课教案中提供。当前内容是课程设计稿，尚未经过课堂试教；每次备课需核对当前世界的界面和资源。</p>')
    content += section('资源与来源', f'<p>界面风格、世界入口适配与机器人配图沿用同仓库 BumiLessons-H5；完整示例来自 Paracraft 共享 BumiCodeExamples.lua，API 语义依据 BumiCodeRunner.lua 与 BumiCodePage.lua。<a href="{API}" target="_blank" rel="noopener">查看 Bumi NPL API 帮助 ↗</a>。</p><p>回放动作来自 Cryyzz/Lafan1_Retarget_To_BUMI-GMR 的既有数据，固定版本 00287add3026f38bb6748e15c857790b2a3abcd6，采用 CC-BY-NC-4.0：仅限非商业使用，展示需署名。课程不附动作数据，世界中的具体资源与限制以当前版本说明为准。</p>')
    return '<section class="view doc" id="overview" data-title="教师使用说明"><header class="lhead"><div><p class="course-label">TEACHER GUIDE</p><h1>课程总览与使用说明</h1></div></header>' + content + '</section>'


def side(lessons, role):
    text = '<nav class="side" aria-label="课程目录"><a href="#home" data-view="home">课程目录</a>'
    if role == 'teacher':
        text += '<a href="#overview" data-view="overview">课程总览与使用说明</a>'
    for unit, title, numbers in UNITS:
        text += f'<h6>{unit} · {title}</h6>'
        for n in numbers:
            text += f'<a href="#l{n:02d}" data-view="l{n:02d}"><span class="n">{n:02d}</span>{e(lessons[n-1]["title"])}<span class="dot" title="本机有填写记录"></span></a>'
    return text + '<p class="tip">小圆点表示本机有填写记录。<br>本页学习和记录；代码在小布米世界中运行。</p></nav>'


def document(role, body, nav=''):
    css = (TOOLS/'reference.css').read_text(encoding='utf-8') + '\n' + (TOOLS/'course.css').read_text(encoding='utf-8')
    title = f'{TITLE} · {"学生版" if role == "student" else "教师版" if role == "teacher" else "课程入口"}'
    top = '<button class="tbtn" id="menu" type="button" data-act="menu" aria-label="打开课程目录">☰</button>' if nav else ''
    top += f'<a class="brand" href="#home"><img src="assets/robot/stand-front.webp" alt=""><span>NPL 代码编程 · 小布米</span></a><span class="role-tag">{"学生版" if role=="student" else "教师版" if role=="teacher" else "12 课"}</span><span class="sp"></span>'
    if role == 'teacher':
        top += '<a class="tbtn hide-s" href="student.html" target="_blank" rel="noopener">学生页面 ↗</a><a class="tbtn hide-s" href="#overview">使用说明</a>'
    top += world_link('小布米世界 ↗')
    scripts = ''.join('<script>\n'+(TOOLS/name).read_text(encoding='utf-8')+'\n</script>' for name in ['reference.js','course.js']) if nav else ''
    if nav:
        scripts += '<script src="world-launcher.js"></script><script src="embedded-preview.js"></script>'
    return f'<!doctype html>\n<html lang="zh-CN" class="role-{role}" data-page="{role}" data-site="{e(title)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="小布米 NPL 代码编程课程：12 个示例、学生学习单与教师教案"><title>{e(title)}</title><style>\n{css}\n</style></head><body><header class="top">{top}</header>{nav}<main'+(' style="margin-left:0"' if not nav else '')+f'>{body}</main><div id="fig-store"></div><div class="modal" role="dialog" aria-label="放大查看"><div class="box"></div></div><div class="toast" role="status" aria-live="polite"></div>{scripts}</body></html>\n'


class PageAudit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids, self.links, self.src, self.codes = [], [], [], []
        self.in_pre, self.current_code = False, []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get('id'):
            self.ids.append(a['id'])
        if tag == 'a' and a.get('href'):
            self.links.append(a['href'])
        if a.get('src'):
            self.src.append(a['src'])
        if tag == 'pre':
            self.in_pre, self.current_code = True, []

    def handle_data(self, data):
        if self.in_pre:
            self.current_code.append(data)

    def handle_endtag(self, tag):
        if tag == 'pre' and self.in_pre:
            self.codes.append(''.join(self.current_code))
            self.in_pre = False


def validate_pages(examples):
    pages = {}
    for name in ['index.html', 'student.html', 'teacher.html']:
        parser = PageAudit()
        parser.feed((ROOT/name).read_text(encoding='utf-8'))
        assert len(parser.ids) == len(set(parser.ids)), f'{name}: 重复 ID'
        pages[name] = parser
    for name, page in pages.items():
        for target in page.src + page.links:
            url = urlsplit(target)
            if url.scheme or url.netloc:
                continue
            local = unquote(url.path)
            if local:
                assert (ROOT/local).is_file(), f'{name}: 缺失 {local}'
            if url.fragment:
                other = pages.get(local or name)
                assert other is not None, f'{name}: 无法核对 {target}'
                fragment = unquote(url.fragment)
                if fragment.endswith('-s') and fragment[:3] in other.ids:
                    continue
                assert fragment in other.ids, f'{name}: 缺失锚点 {target}'
    s = (ROOT/'student.html').read_text(encoding='utf-8')
    assert '参考回答' not in s and 'data-pane="t"' not in s and 'teacher.html' not in s
    assert 'bumi-h5:' not in s and 'bumi-npl-h5:v1:' in s
    assert pages['student.html'].codes == [x['code'] for x in examples], '学生页代码与示例不一致'
    assert pages['teacher.html'].codes == [x['code'] for x in examples for _ in range(2)], '教师页代码与示例不一致'
    print('自检通过：12 课师生配对、40 分钟流程、示例对应、本地链接/图片、唯一 ID、独立保存键。')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--examples-source', type=Path, help='可选：核对当前共享 BumiCodeExamples.lua')
    args = parser.parse_args()
    lessons = []
    for file in sorted((ROOT/'_content').glob('lessons-*.json')):
        lessons.extend(json.loads(file.read_text(encoding='utf-8-sig')))
    lessons.sort(key=lambda l: l['number'])
    assert [l['number'] for l in lessons] == list(range(1, 13)), '需完整 12 课'
    examples = json.loads((ROOT/'_content/examples.json').read_text(encoding='utf-8'))
    assert len(examples) == 12
    if args.examples_source:
        source = args.examples_source.read_text(encoding='utf-8-sig')
        matches = re.findall(r'\{id = "([^"]+)", label = L"([^"]+)", code = \[=\[(.*?)\]=\]\}', source, re.S)
        actual = [{'id': key, 'label': label, 'code': code.strip()+'\n'} for key, label, code in matches]
        assert examples == actual, '课程示例快照与共享源码不一致，请核对后同步 examples.json'
        print('当前共享源码核对通过：12 个示例代码逐字一致。')
    for l, example in zip(lessons, examples):
        assert l['exampleId'] == example['id'], l['number']
        assert example['label'] == f'{l["number"]:02d} {l["title"]}', l['number']
        assert sum(p['minutes'] for p in l['teacher']['plan']) == 40, l['number']
        assert [a['task'] for a in l['teacher']['answers']] == ['A', 'B', 'C', 'D'], l['number']
        assert all(len(l[k]) >= 2 for k in ['goals', 'concepts', 'flow', 'read', 'steps', 'reflection', 'selfCheck'])
        l['example'] = example
    for role in ['student', 'teacher']:
        body = home(lessons, role)
        if role == 'teacher':
            body += overview(lessons)
        body += ''.join(lesson_view(l, lessons, role) for l in lessons)
        (ROOT/f'{role}.html').write_text(document(role, body, side(lessons, role)), encoding='utf-8')
    entry = '<section class="view" id="home" style="max-width:1050px">' + hero('entry')
    # 入口页的起始课链接指向学生页；不依赖脚本跳转。
    entry = entry.replace('href="#l01"', 'href="student.html#l01"')
    entry += '<div class="entry-grid"><a class="entry-card" href="student.html"><span class="course-label">STUDENT</span><b>我是学生</b><p>从预测开始，读懂代码，运行观察，再完成一次修改。</p><span class="link">打开 12 课学习单 →</span></a><a class="entry-card" href="teacher.html"><span class="course-label">TEACHER</span><b>我是教师</b><p>查看课程路径、40 分钟教案、参考回答与课堂评价。</p><span class="link">打开教师教案 →</span></a></div><p class="lede">小学 5–6 年级，40 分钟／课的设计基线。可直接打开，支持填写保存与打印；课程尚待课堂试教。</p></section>'
    (ROOT/'index.html').write_text(document('entry', entry), encoding='utf-8')
    validate_pages(examples)
    print('已生成 index.html、student.html、teacher.html。')


if __name__ == '__main__':
    main()
