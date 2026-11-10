"""Render the independent Bumi lessons from a checkout of bumi-robot-assets."""
import argparse
import base64
import io
import re
from html import escape
from pathlib import Path

from lesson_film import make_lesson_film
import markdown
from PIL import Image
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parents[1]
IMAGE_CDN = 'https://cdn.keepwork.com/keepwork/cdn/bumi-lessons/e5770abee64a32/assets/'
WORLD = 'https://emscripten.keepwork.com/?pid=5316902'
UNITS = ['身体与虚拟世界', '指令与人的判断', '已有模型与行走', '动作数据',
         '执行方式与状态', '像研究者一样验证', '从人的需要出发', '作品与分享']


def page(title, body, prefix=''):
    # Emit real CDN URLs in static HTML, including diagrams rendered inside the archive.
    def image_url(match):
        attr, local, name = match.groups()
        return f'data-local="{local}" {attr}="{IMAGE_CDN}{name}"'
    body = re.sub(r'(src|href)="((?:\.\./)?assets/([^"]+\.webp))"', image_url, body)
    return f'''<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="bumi-images" content="{IMAGE_CDN}"><script src="{prefix}course_images.js"></script><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer"><title>{escape(title)}</title><link rel="stylesheet" href="{prefix}course.css"></head>
<body><main>{body}</main></body></html>
'''


def local_webp(name):
    relative=Path(name).with_suffix('.webp')
    if not (ROOT/relative).is_file():
        raise FileNotFoundError(f'Missing teaching image: {relative}; run render_images.mjs first')
    return '../' + relative.as_posix()


def worksheet(file, entries):
    raw = file.read_text(encoding='utf-8-sig').replace('姓名：', '组内代号：')
    # Protect print-form blanks from Markdown emphasis parsing.
    raw = re.sub(r'_{3,}', 'BUMIBLANK', raw)
    doc = BeautifulSoup(markdown.markdown(raw, extensions=['tables', 'fenced_code', 'sane_lists']), 'html.parser')
    doc.h1.decompose()
    for link in doc.select('a[href]'):
        url = link['href']
        if url.startswith('https://'):
            link['target'], link['rel'] = '_blank', 'noopener noreferrer'
        elif url in entries:
            link['href'] = '../' + entries[url] + '/index.html'
        elif url.startswith('assets/'):
            link['href'] = local_webp(url)
        elif url.endswith('.md'):
            link['href'] = '../index.html'
    for img in doc.select('img'):
        img['src'] = local_webp(img['src'])
        img['loading'] = 'lazy'
    for cell in doc.select('td'):
        if not cell.get_text(strip=True):
            cell.string = 'BUMIBLANK'
    for node in list(doc.find_all(string=re.compile('BUMIBLANK|□'))):
        parts = re.split('(BUMIBLANK|□)', str(node))
        for index, part in enumerate(parts):
            if part in ('BUMIBLANK', '□'):
                field = doc.new_tag('input')
                field['type'] = 'checkbox' if part == '□' else 'text'
                field['aria-label'] = (parts[index+1].strip() if part == '□' else parts[index-1].strip()) or '填写实验记录'
                node.insert_before(field)
            elif part:
                node.insert_before(part)
        node.extract()
    for i, heading in enumerate(doc.select('h2')):
        heading['id'] = f'section-{i}'
    nav = ''.join(f'<a href="#{h["id"]}">{escape(h.get_text())}</a>' for h in doc.select('h2'))
    return f'<details><summary>跳到教学环节</summary><nav>{nav}</nav></details>{doc}'


def workshop(question, teacher):
    direction = ('投屏改写一道展台题。请一位同学接过鼠标，用第一版独立作答，再让全班决定改哪一句。'
                 if teacher else '为下一组同学做一道展台题。先在仿真或纸卡实验中找证据，再把鼠标交给试玩者。')
    return f'''<section id="studio"><div id="make-panel"><h2>{'投屏制作演示' if teacher else '我的观察挑战卡'}</h2><p>{direction}</p>
<label>给试玩者的问题<input id="question" value="{escape(question, quote=True)}"></label>
<label>试玩者要做哪个动作？<textarea id="action" placeholder="写清从哪里开始、要观察什么。"></textarea></label>
<label>完成后可以核对的证据<textarea id="evidence" placeholder="只写本组实际看到的现象，并说明观察条件。"></textarea></label>
<details><summary>{'讲课与制作演示' if teacher else '请 AI 帮我推敲展题'}</summary>
<p>选一个目的，再改写委托。只带本组的实验现象，AI 的建议由试玩者验证。</p>
<button data-mode="ask">提问 · Ask</button> <button data-mode="plan">定方案 · Plan</button> <button data-mode="iterate">试玩后修改</button>
<label>给 AI 的委托<textarea id="request"></textarea></label>
<button id="copy">复制委托</button> <button id="chat">打开制作会话 ↗</button>
{'<button id="lecture">打开讲课会话 ↗</button>' if teacher else ''}
<details><summary>离线练习 · 同桌扮演 AI</summary><p>请同桌指出一个无法从记录核对的词。把它换成看得见的动作或位置，再按改过的提示做一次。</p></details></details>
<button id="first">制作第一版</button></div><div id="preview1"></div><div id="peer-panel"><h2>把鼠标交给试玩者</h2><p>请同伴读第一版的操作，回到动手实验试一次。只改一句提示，再请他完成同一个动作。</p>
<label>试玩者的原话<textarea id="feedback" placeholder="我做到哪一步？我在哪里需要帮助？"></textarea></label>
<label>改进后的操作提示<textarea id="revision"></textarea></label>
<button id="second">制作第二版</button><div id="preview2"></div>
<label>请同伴再做同一动作，记录结果<textarea id="retest"></textarea></label>
</div><button id="export">导出挑战卡与制作记录</button><output id="status" aria-live="polite"></output>
</section><script defer src="../workshop.js"></script>'''


def render(source):
    files = sorted(source.glob('第*课-*.md'))
    entries = {f.name: 'lesson-' + f.name[1:3] + ('-teacher' if '教师教案' in f.name else '-student') for f in files}
    if len(files) != 32 or len(set(entries.values())) != 32:
        raise ValueError('Expected 16 pairs of Bumi worksheets and lesson plans')
    cards = []
    for n in range(1, 17):
        pair = [f for f in files if int(f.name[1:3]) == n]
        teacher = next(f for f in pair if '教师教案' in f.name)
        title = teacher.stem.split('-')[2]
        raw = teacher.read_text(encoding='utf-8-sig')
        question = re.search(r'\| 核心问题 \| (.+?) \|', raw)[1]
        unit = UNITS[(n-1)//2]
        if n % 2:
            cards.append(f'<h2>单元 {(n+1)//2}　{unit}</h2>')
        links = []
        student = next(f for f in pair if f != teacher)
        student_html = worksheet(student, entries)
        for file in pair:
            teach = file == teacher
            role = '教师大屏' if teach else '学生动手'
            folder = entries[file.name]
            links.append(f'<a href="{folder}/index.html">{role}</a>')
            target = ROOT / folder
            target.mkdir(exist_ok=True)
            if n == 14:
                cover_art = '<figure class="lesson-art standalone"><img src="../assets/gallery-two-hands.webp" alt="孩子双手举着风景画，抬头观察展厅中的画作"></figure>'
            else:
                cover_art = f'<figure class="lesson-art" style="--sx:{((n-1)%4)*-100}%;--sy:{((n-1)//4)*-100}%"><img src="../assets/lesson-openings.webp" alt="{escape(title)}的 AI 情境插画"></figure>'
            header = f'''<header class="lesson-mast"><a href="../index.html#lesson-{n}">← 课程目录</a>
<span>{unit}　 /　 {role}</span><div class="lesson-cover"><div><small>第 {n:02} 课　·　Bumi 具身智能</small><h1>{title}</h1><p>{escape(question)}</p></div>{cover_art}</div></header>'''
            controls = f'''<section id="classroom" data-lesson="{n}" data-role="{'teacher' if teach else 'student'}">
<nav class="phase-strip" aria-label="课堂进度"><button data-phase="0">{'全班预测' if teach else '做预测'}</button>
<button data-phase="1">动手实验</button><button data-phase="2">做第一版</button><button data-phase="3">试玩改版</button></nav>
<div class="lesson-desk"><small id="lesson-guide"></small><h2 id="lesson-heading" tabindex="-1"></h2>
<div id="lesson-stage"></div><section id="trial-panel" hidden><h3>本次实验记录</h3><ol id="trial-record" aria-live="polite"></ol>
<button id="to-studio">带上记录做挑战卡 →</button></section></div>
<a class="world-link" href="{WORLD}" target="_blank" rel="noopener noreferrer">另开 Bumi 仿真世界，对照观察 ↗</a></section>'''
            archive = '<details class="lesson-archive"><summary>' + ('备课材料与完整教案' if teach else '打开实验材料袋') + '</summary>' + worksheet(file, entries) + '</details>'
            # Keep worksheet and studio fields in their original order for existing saved drafts.
            if n in (1, 2, 4):
                # Bundle a small body reference so downloaded anatomy/zoom labs also run offline.
                portrait = Image.open(source/'assets/bumi-course/shared/bumi-reference-beautified.png')
                portrait.thumbnail((360, 440))
                encoded = io.BytesIO()
                portrait.save(encoded, 'WEBP', quality=82)
                robot_uri = 'data:image/webp;base64,' + base64.b64encode(encoded.getvalue()).decode('ascii')
                controls = controls.replace('id="classroom"', f'id="classroom" data-robot="{robot_uri}"')
            portable_style = '<script type="text/plain" id="portable-style">' + (ROOT/'course.css').read_text(encoding='utf8') + '</script>'
            film = make_lesson_film(student_html, raw, n, teach, title)
            body = portable_style + header + film + controls + archive + workshop(question, teach) + '<script defer src="../missions.js"></script><script defer src="../classroom.js"></script><script defer src="../figure_shots.js"></script><script defer src="../lesson_film.js"></script>'
            (target/'index.html').write_text(page(title + ' · ' + role, body, '../'), encoding='utf8')
        cards.append(f'<article id="lesson-{n}"><small>第 {n:02} 课</small><h3>{title}</h3><p>{escape(question)}</p><nav>{"".join(links)}</nav></article>')
    hero = f'''<header class="hero">
<img class="hero-scene" src="assets/bumi-meadow.webp" alt="AI 插画：小布米迈步走过方块草地，身后是溪流和层层山坡。">
<div class="hero-copy"><p class="hero-meta">小学五至六年级起点　·　8 单元 / 16 课时</p>
<h1>和小布米一起<br>理解具身智能</h1>
<p>走一步，停一次，换个视角。观察小布米怎样行动，再用自己的发现给同学做一张挑战卡。</p>
<a href="{WORLD}" target="_blank" rel="noopener noreferrer">打开研发仿真世界 ↗</a></div></header>'''
    (ROOT/'index.html').write_text(page('Bumi 具身智能通识课', hero+'<div class="catalog">'+''.join(cards)+'</div>'),encoding='utf8')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source', type=Path, help='Path to bumi-edu-docs-v2')
    render(parser.parse_args().source.resolve())
