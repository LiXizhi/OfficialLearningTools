// Generate standalone course pages aligned with the K-12 AI General Education Curriculum Design PPT
// and Second Brain (c:/lxzsrc/LiXizhiDocs) Super-Individual turnkey authoring standards.
import fs from 'node:fs';
import {classroomActivity} from './activity.mjs';
import {catalogStyle, renderCatalog} from './catalog.mjs';
import {projectLesson} from './project-lessons.mjs';
import {studioPage, studios} from './studio.mjs';
import {weatherPage} from './weather/page.mjs';
import {
  renderLesson1Student,
  renderLesson1Teacher,
  renderStandardTurnkeyBlock,
  TURNKEY_RUNTIME_JS
} from './lesson1_turnkey.mjs';
import {fileURLToPath} from 'node:url';

const read = name => fs.readFileSync(new URL(name, import.meta.url), 'utf8');
const {framework, grades, gradeMeta, lessons, samples} = JSON.parse(read('curriculum.json'));
const style = read('course.css');
const html = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const pc = 'https://webparacraft.keepwork.com/keepwork/online.html';
const ai = 'https://keepwork.com/chat';
const course = '超级学生AI通识课';

function save(path, title, body, script = '') {
  const dest = new URL('../' + path, import.meta.url);
  fs.mkdirSync(fileURLToPath(new URL('./', dest)), {recursive: true});
  if (path !== 'index.html') {
    const [grade, number, mode] = path.split('/')[0].split('-');
    const id = grade + '-' + number;
    const index = (Number(grade.slice(1)) - 3) * 8 + Number(number) - 1;
    const special = [0,19,44].includes(index);
    const studio = studioPage(id, mode === 'teacher', lessons[index][0], special);
    if (special) {
      body += studio.body;
      body = body.replace('class="endlinks">', 'class="endlinks"><a href="#studio-extension">拓展挑战</a>');
    } else {
      const headerEnd = body.indexOf('</header>') + '</header>'.length;
      body = body.slice(0,headerEnd) + studio.body + '<details><summary>打开原课实验、工具箱与教案</summary>' + body.slice(headerEnd) + '</details>';
    }
    script += '\n' + studio.script;
    const control = '<button type="button" id="lesson-fullscreen" hidden aria-pressed="false">全屏</button>';
    if (body.includes('class="mast"')) body = body.replace('</span></div>', '</span>' + control + '</div>');
    else body = body.replace('</nav>', control + '</nav>');
    script = read('chat-copy.js') + '\n' + script + '\n' + read('lesson-window.js');
  }
  // Announce the generated page identity, including back/forward and grade anchors.
  script += `
(() => {
    if (parent === window) return;
    function reportPage() {
      const grade = /^#g[3-9]$/.test(location.hash) ? location.hash : '';
      const page = ${JSON.stringify(path)} + ${path === 'index.html' ? 'grade' : "''"};
      parent.postMessage({channel:'aichat.external-tool.v1', type:'tool:director-page', page}, '*');
    }
    addEventListener('pageshow', reportPage);
    addEventListener('hashchange', reportPage);
    reportPage();
  })();`;
  const isIndex = path === 'index.html';
  const pageTitle = isIndex ? html(course) : html(title) + ' · ' + course;
  const pageStyle = isIndex ? catalogStyle : style;
  const out = '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + pageTitle + '</title><style>' + pageStyle + '</style><main>' + body + '</main>' + (script ? '<script>' + script + '</script>' : '') + '</html>';
  fs.writeFileSync(dest, out.replace(/[ \t]+$/gm, ''));
}

const section = (h, b) => '<section><h2>' + html(h) + '</h2>' + b + '</section>';
const paras = xs => xs.map(x => '<p>' + html(x) + '</p>').join('');
const list = xs => '<ol>' + xs.map(x => '<li>' + html(x) + '</li>').join('') + '</ol>';
const details = (h, b) => '<details><summary>' + html(h) + '</summary>' + paras([b]) + '</details>';

function quiz(sample) {
  const labels = [...new Set(sample.cases.map(c => c[1]))];
  return sample.cases.map(([q, a, why]) => '<fieldset data-answer="' + html(a) + '"><legend>' + html(q) + '</legend>' + labels.map(l => '<button type="button" aria-pressed="false">' + html(l) + '</button>').join('') + '<p role="status" data-why="' + html(why) + '"></p></fieldset>').join('');
}

const quizJs = `for (const box of document.querySelectorAll('fieldset')) box.addEventListener('click', e=>{
  if (e.target.tagName !== 'BUTTON') return;
  for (const b of box.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b===e.target));
  const note=box.querySelector('p');
  note.textContent=e.target.textContent===box.dataset.answer?'✅ 判断成立。'+note.dataset.why:'🔍 再检查一次依据：'+note.dataset.why;
});`;

const coding = {
  3: '在角色关联的代码方块中拼好沿路移动、路口条件判断、到达终点停止三步；先用最短路径验证方向是否正确。',
  4: '把分类标签或材质特征存入变量，用“如果／否则”把角色移向对应分拣区或待人工复核区；先用一件特征明确的物品测试。',
  5: '在电影方块的时间轴中依次编排全景、近景、特写三个镜头与字幕说明，先单独预览每一镜再连播。',
  6: '在角色代码方块里编排移动、转向和固定等待时间，每次实验只改变一个参数并记录耗时。',
  7: '在角色代码方块中先拼直行和终点停止，再在路口检查前方路标状态，条件成立时转向，验证感知与执行逻辑。',
  8: '在咨询台智能体（NPC）的代码方块中为同义提问、未知问题和含糊提问编写分支响应，未知问题引导至公告栏或人工服务点。',
  9: '在原型场景入口配置清晰的目标、操作与隐私声明牌，确保初次接触的用户不靠口头提示即可走通核心流程。'
};

const catalog = [];

for (const [i, [p, title, task, normal, change, classroom]] of lessons.entries()) {
  const g = 3 + Math.floor(i / 8), n = i % 8 + 1;
  const meta = gradeMeta[g - 3];
  const chapter = meta.chapters[n - 1] || ('第' + n + '章');
  const platform = p === 'P' ? 'Paracraft 3D虚拟仿真（含虚拟具身机器人）' : 'AIChat 智能助手工作台';
  const sample = samples[i];
  const paths = {};

  for (const mode of ['teacher', 'student']) {
    const teacher = mode === 'teacher';
    const role = teacher ? '教师大屏课' : '学生上机课';
    const path = 'g' + g + '-' + String(n).padStart(2, '0') + '-' + mode + '/index.html';
    paths[mode] = path;
    if (g === 5 && n === 4) {
      const page = weatherPage(teacher, classroomActivity(i, sample));
      save(path, title + ' · ' + role, page.body, page.script);
      continue;
    }
    const start = p === 'P' ? '在 Paracraft 的创作入口新建一个空白世界。' : '在 AIChat 主对话中说出你的任务。';

    const lessonId = 'g'+g+'-'+String(n).padStart(2,'0');
    const counterpart = '../'+lessonId+'-'+(teacher?'student':'teacher')+'/index.html';
    let b = '<nav><a href="../index.html#g'+g+'">← 课程目录</a><a href="'+counterpart+'">'+(teacher?'看学生上机页':'看教师大屏页')+' →</a></nav>';
    b += '<header class="lesson-entry '+mode+'"><small>'+g+' 年级 · 第 '+n+' 课 · '+(p==='P'?'Paracraft':'AIChat')+'</small>';
    b += '<div class="entry-role">'+(teacher?'教师大屏 · 全班共用一块屏':'学生上机 · 我的制作手账')+'</div>';
    b += '<h1>'+html(title)+'</h1><p><strong>本课目标　</strong>'+html(studios[lessonId].objective || normal)+'</p></header>';

    const materialStart = b.length;
    if (i === 0 && sample) {
      // Flagship Turnkey Lesson 1 (g3-01-teacher & g3-01-student)
      const labHtml = classroomActivity(0, sample);
      const quizHtml = quiz(sample);
      b += teacher
        ? renderLesson1Teacher(sample, labHtml, quizHtml)
        : renderLesson1Student(sample, labHtml, quizHtml);

      b += '<details><summary>📦 展开查看：本课“五步教学法”完整教案、教师六件套与五维过程评价量表</summary><div class="grid-2">'
        + '<div class="card-box"><h3>1. 教师支持“六件套”与材料清单</h3><p><strong>基础包：</strong>本页开箱即用互动课件、随堂检测、脱敏演示数据。</p><p><strong>提升包：</strong>AIChat 工作台 + Paracraft 3D 虚拟具身机器人环境（含本页折叠的 <code>CodeBlock</code> 与 <code>paracraft-cli</code> 脚本）。</p><p><strong>治理包：</strong>工具白名单、数据最小化检查单、《AI安全小约定》。</p></div>'
        + '<div class="card-box"><h3>2. 五维过程评价量表</h3><p>① <strong>认知理解：</strong>能否区分AI感知应用与普通固定电路开关；<br>② <strong>实践过程：</strong>是否完成正常与遮挡/嘈杂两次控制变量实验；<br>③ <strong>项目成果：</strong>是否生成《超级个体·AI观察与具身机器人作品卡》；<br>④ <strong>反思责任：</strong>是否遵守不上传个人隐私的四条安全底线；<br>⑤ <strong>表达交流：</strong>能否清楚说明AI为什么会出错及如何人工复核。</p></div>'
        + '</div></details>';
    } else {
      if (sample) {
        b += classroomActivity(i, sample);
      } else {
        b += '<section class="card-box"><h2>🎯 本课教什么（核心教学目标与评价证据）</h2>'
          + '<p><strong>核心任务：</strong>' + html(task) + '</p>'
          + '<p><strong>基础达标证据：</strong>' + html(normal) + '</p>'
          + '<p><strong>控制变量/进阶探究：</strong>' + html(change) + '</p>'
          + '<p><strong>学段安全与伦理边界：</strong>' + html(meta.boundary) + '</p></section>';
      }

      b += renderStandardTurnkeyBlock({
        p, g, n, title, task, normal, change, meta,
        codingHint: coding[g]
      });

      if (sample) {
        b += '<details open><summary>' + (teacher ? '📖 展开五步教学法完整教案、随堂检测与教师六件套' : '🛠️ 展开上机实践步骤、随堂检测与评价标准') + '</summary>';
      }

      if (teacher) {
        b += section('🧭 五步教学法 · 40 分钟课堂流程（教师大屏主导）', list([
          '【第1步｜情境导入 · 0—5 分钟】真实问题切入：' + classroom,
          '【第2步｜概念理解 · 5—13 分钟】原理拆解与预测：结合本课主题（' + chapter + '），请学生先写出或说出自己的判断与理由，同桌互查依据。',
          '【第3步｜工具体验 · 13—25 分钟】白名单工具实操：' + start + task + ' 核对基础达标证据：' + normal,
          '【第4步｜项目实践 · 25—35 分钟】控制变量与对比实验：只改变一个条件——' + change + ' 请学生对比前后变化并记录过程证据。',
          '【第5步｜伦理反思 · 35—40 分钟】安全边界与过程评价：围绕“' + meta.boundary + '”开展反思；离堂思考：' + (sample?.exit || '如果换一个真实校园场景，你会先核查哪项数据或边界条件？')
        ]));
      } else {
        b += section('🛠️ 五步上机实践指南（学生独立闯关 · 约 25—40 分钟）', list([
          '【第1步｜明确问题与环境准备】' + start + ' 回顾课堂导入问题：' + classroom,
          '【第2步｜说出意图与基础实操】使用上方【和 AI 聊】或进入 Paracraft：' + task,
          '【第3步｜核对第一轮证据】检查是否达到预期结果：' + normal,
          '【第4步｜控制变量对比实验】只改变一个条件再运行一次：' + change,
          '【第5步｜伦理自查与成果提交】对照安全规范（不录入个人隐私、如实标注AI辅助过程），整理两次实验对比记录并存入个人第二大脑。'
        ]));
      }

      if (sample) {
        b += section(teacher ? '🧑‍🏫 教师示范步骤与排障锦囊' : '📋 动手操作分步清单', paras([sample.prep]) + list(sample.steps) + details('遇到困难时展开排障锦囊', sample.fix));
        b += section(teacher ? '🗳️ 随堂概念与伦理辨析（全班先投票，再点选揭示）' : '✅ 随堂自测（先判断，再看证据解析）', quiz(sample));
        b += section(teacher ? '🎓 离堂思辨题与过程评价标准' : '🏆 独立挑战与成果提交要求', paras([sample.exit]) + details('点击查看参考解析', sample.answer) + paras(['【本课过程评价产出物】' + sample.proof]));
      } else {
        if (!teacher && i === 42) {
          b += section('🧪 微型词频分类器编写指南（双路线）', paras([
            '手写探究路线：在空白 HTML 中录入“时间查询、地点查询”两组带标签问句，按词切分并统计两类词频权重；输入测试问句累计得分，平分时显示“待人工确认”。',
            'AI协作路线：在 AIChat 中提供自己编写的 6 条训练样本，要求生成单文件 HTML 词频分类器，展示每个词的权重得分，再用预留的 2 道闭卷测试题验证，体会训练与重训过程。'
          ]));
        }
        b += details('💡 课堂常见卡点与排障锦囊', p === 'P'
          ? '先确保起点、关键路标与终点能在同一视角看清；先用最简单的1个正常样本跑通流程，再逐步加入分支条件或例外物品。'
          : '将“参考资料/已知条件”与“具体任务要求”分段输入，每次只改一个提示词条件；对比前后变化时开启新对话以免旧上下文干扰。');
      }

      b += '<details><summary>📦 面向教师的“六件套”课程支持与五维评价量表</summary><div class="grid-2">'
        + '<div class="card-box"><h3>1. 资源与材料清单</h3><p><strong>基础包：</strong>本页互动课件/大纲、课堂学习单、公开/模拟脱敏数据。</p><p><strong>提升包：</strong>' + html(platform) + ' 实操环境。</p><p><strong>治理包：</strong>工具白名单、数据最小化检查单、《AI辅助创作声明》模板。</p></div>'
        + '<div class="card-box"><h3>2. 五维过程评价量表</h3><p>① <strong>认知理解：</strong>能否说清本课AI原理与技术边界；<br>② <strong>实践过程：</strong>是否完整保留两次对比实验记录；<br>③ <strong>项目成果：</strong>作品或结论是否有证据支撑；<br>④ <strong>反思责任：</strong>是否遵守隐私保护与AI标注规范；<br>⑤ <strong>表达交流：</strong>能否清楚汇报方案与改进方向。</p></div>'
        + '</div></details>';

      if (sample) b += '</details>';
    }

    b += '<footer><a '+(p === 'A' ? 'data-chat-link ' : '')+'class="action" target="_blank" rel="noopener" href="' + (p === 'P' ? pc : ai) + '">打开 ' + (p === 'P' ? 'Paracraft' : 'AIChat') + ' 实操环境 ↗</a> <a href="../g' + g + '-' + String(n).padStart(2, '0') + '-' + (teacher ? 'student' : 'teacher') + '/index.html">切换到：' + (teacher ? '学生上机课' : '教师大屏课') + ' →</a></footer>';
    if (i === 0 || i === 44) {
      const archive = b.slice(materialStart);
      const page = projectLesson(i === 0, teacher, archive);
      save(path, title + ' · ' + role, page.body, quizJs + '\n' + TURNKEY_RUNTIME_JS + '\n' + page.script);
      continue;
    }
    save(path, title + ' · ' + role, b, (sample ? quizJs + '\n' : '') + TURNKEY_RUNTIME_JS);
  }
  catalog.push({idx: i, g, n, chapter, title, platform: p === 'P' ? 'Paracraft' : 'AIChat', sample: Boolean(sample), task, ...paths});
}

const home = renderCatalog({course, framework, grades, gradeMeta, catalog, studios});
save('index.html', course, home.body, home.script);
