"""Compose classroom scenes from the student tasks and the corresponding instructor directions."""
from html import escape
from pathlib import Path
import re
from bs4 import BeautifulSoup


def teacher_flow(guide):
    section = re.search(r'^## 课堂流程[^\n]*\n(.*?)(?=^## |\Z)', guide, re.M | re.S)
    return [[field.strip() for field in row.strip('|').split('|')] for row in section[1].splitlines()
            if re.match(r'^\|\s*\d', row)]


def diagram(img, context):
    path = img['src']
    alt = img.get('alt') or Path(path).stem
    return f'''<div class="film-diagram" data-diagram="{escape(Path(path).stem)}">
    <div class="film-viewport"><img loading="lazy" src="{escape(path, quote=True)}" alt="{escape(alt, quote=True)}"><i class="film-pointer" hidden></i></div>
    <div class="film-shots"></div><p class="film-narration" aria-live="polite">{escape(context or alt)}</p></div>'''


def make_lesson_film(student_html, teacher_text, number, teacher, title):
    doc = BeautifulSoup(student_html, 'html.parser')
    doc.select_one('details').decompose()
    flow = teacher_flow(teacher_text)
    picture_notes=re.search(r'^## 配图怎样用(.*?)(?=^## |\Z)',teacher_text,re.M|re.S)
    picture_lines=picture_notes[1].splitlines() if picture_notes else []
    scenes = []
    heading = ''
    fragments = []
    active_cue = ''
    active_time = ''
    def flush():
        if fragments:
            scenes.append((heading or title, ''.join(fragments), active_cue, active_time))
            fragments.clear()
    # Keep the worksheet's picture order, including instructions to predict or draw first.
    for tag in list(doc.children):
        if not tag.name:
            continue
        if tag.name in ('h2','h3'):
            flush()
            heading = re.sub(r'^[一二三四五六]+、', '', tag.get_text(strip=True))
            heading = heading.replace('想一想：','')
            raw_name=tag.get_text(strip=True)
            task=re.search(r'任务\s*([A-D])', raw_name)
            for row in flow:
                name=row[1]
                same=(name in raw_name or (task and name.startswith('任务') and task[1] in name)
                      or ('进入小布米世界' in raw_name and name in ('进世界','任务 A'))
                      or ('指令卡' in raw_name and '指令卡' in name)
                      or ('三问' in raw_name or '自我检查' in raw_name) and ('三问' in name or '总结' in name))
                if number==16 and task:
                    same=name=={'A':'展示与问答','B':'整理互评','C':'展示与问答','D':'个人反思'}[task[1]]
                if same:
                    active_cue=row[2 if teacher else 3]
                    active_time=row[0]+' 分钟'
                    break
            if not active_cue:
                active_time,active_cue=flow[0][0]+' 分钟',flow[0][2 if teacher else 3]
            continue
        if tag.name == 'hr' or tag.find('a', href=re.compile(r'\.\./(lesson-|index\.html)')):
            continue
        img = tag if tag.name == 'img' else tag.find('img')
        if img:
            flush()
            caption = tag.find_next_sibling('p')
            caption_text = caption.get_text(strip=True) if caption and caption.find('em') else ''
            if caption_text:
                caption.extract()
            note=next((line for line in picture_lines if (Path(img['src']).stem + '.') in line),'')
            note=re.sub(r'\[([^]]+)\]\([^)]+\)',r'\1',note).replace('**','').strip(' |-').replace(' | ',' · ')
            figure=diagram(img,caption_text)
            if teacher and note:
                figure += '<details class="film-teacher"><summary>这一幕怎样提问</summary><p>'+escape(note)+'</p></details>'
            scenes.append((heading or '观察小布米',figure,active_cue,active_time))
            continue
        if not heading or tag.parent is None:
            continue
        # A new question or table deserves its own screen once the previous scene is full.
        if fragments and (tag.name == 'table' or sum(len(BeautifulSoup(x,'html.parser').get_text()) for x in fragments)>230):
            flush()
        fragments.append(str(tag))
    flush()
    # The guide introduces these reference images separately from the worksheet.
    if number == 1:
        extra=[('进入小布米世界','simulation-web-reference.webp','核对面板：本图保留此前网页测试中的暂停状态。'),
               ('任务 A','body-labeled.webp','先给无标签图作答，再逐个核对。'),
               ('任务 B','body-front.webp','真实模型离线渲染。沿上臂、前臂指认连接处。')]
        for anchor,filename,caption in extra:
            i=max(i for i,scene in enumerate(scenes) if anchor in scene[0])
            path='../assets/bumi-course/lesson-01/'+filename
            name,_,cue,time=scenes[i]
            scenes.insert(i+1,(name,diagram({'src':path,'alt':caption},caption),cue,time))
    def option(i, name):
        return f'<option value="{i}">{i+1:02d}　{escape(name)}</option>'
    pages=[]
    for i,(name,content,cue,time) in enumerate(scenes):
        cue_html = f'<aside class="film-cue"><b>{escape(time)}</b> {escape(cue)}</aside>' if cue else ''
        pages.append(f'<section class="film-page" data-title="{escape(name,quote=True)}" {"hidden" if i else ""}><h2>{escape(name)}</h2>{cue_html}<div class="film-content">{content}</div></section>')
    options=''.join(option(i,scene[0]) for i,scene in enumerate(scenes))
    return f'''<section class="film" id="lesson-film" aria-label="逐幕课堂" data-unit="{(number+1)//2}" data-lesson="{number}">
    <div class="film-bar"><label>课堂导航 <select aria-label="选择课堂画面">{options}</select></label>
    <button type="button" data-theater>放大授课</button><a href="#classroom">进入互动实验 ↓</a></div>
    <div class="film-body">{''.join(pages)}</div><footer><button type="button" data-prev>← 上一幕</button><output class="film-count"></output><button type="button" data-next>下一幕 →</button></footer>
    </section>'''
