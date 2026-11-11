import {readFileSync} from 'node:fs';

const read = name => readFileSync(new URL(name, import.meta.url), 'utf8');
const lessons = {
  gate: {
    grade: '三年级', id: 'g3-01', place: '新生报到处', artifact: '校门迎宾机器人',
    titles: ['从零做校门迎宾机器人', '做一个会求助的迎宾机器人'],
    briefs: ['把鼠标交给一位“新同学”。他拿着纸校牌站到校门口，机器人会怎样迎接他？再用纸遮住校牌，看他能不能听懂下一步该找谁。', '给第一次来学校的小朋友做个向导。准备一张画着星星的纸校牌和一张遮挡纸。让机器人看见星星时欢迎，看不清时也能帮上忙。'],
    choices: ['说一句欢迎词', '向前一步再招手'],
    material: '道具是虚构的星星校牌。清晰时欢迎，遮住时停步求助。只用两个模拟输入，无需摄像头或同学照片。',
    sampleHint: '请留在原地，举起星星卡，请旁边的值班老师帮忙。',
    steps: [
      ['提问','它看见了什么？','举起星星卡，再遮住一半。先请大家猜机器人第二次会怎么做，再问“你希望它怎么做？”','拿纸盖住半颗星。你还能确定这是什么吗？写下一句想问机器人的话。','为什么按灯的开关每次都有同样的结果，认星星的机器人却可能看不清？用纸卡举个例子。','开关按下就接通电路。机器人要从图像找特征，星星缺了一半，判断就可能变。','我的问题'],
      ['定规则','先决定它怎么欢迎','投票选一个欢迎动作。请一位同学演机器人，另一位举纸卡，只演清晰和遮挡两次。','选一个欢迎动作。请同桌按你的规则演一遍，遮住卡时他应该停在哪里？','请列两行计划，每行写看到什么、做什么、孩子该怎么办。等我确认再建世界。','清晰 → 欢迎；遮挡 → 原地停步，请老师确认。两次测试只换纸卡状态。','我选的动作和停步条件'],
      ['画标志','做一块孩子认得出的提示牌','请全班决定牌上画谁、箭头指哪里。投屏生成的图，缩到小牌大小，问最后一排能否看懂。','想象小朋友还不识很多字。请 AI 画一张求助牌，缩小看一次，决定采用还是重画。','请画一张校门求助牌：一位值班老师、一个箭头，留出加字的位置。不要出现真人照片。','离线草图方案：箭头指向值班台，老师图标旁只留“请找老师”。检查箭头方向后再使用。','我采用的图或草图，以及原因'],
      ['建世界','让第一位访客试一次','投屏新建 Paracraft 世界，展开下方建景材料。运行后请一名同学点机器人，选正常、再选遮挡。','从空白世界开始。展开建景材料，把建景委托带到主对话。打开做出的世界，点机器人，试两种条件，另存第一版。','请在空白 Paracraft 世界搭校门和可点击的迎宾角色，按选定计划写 CodeBlock。提供清晰和遮挡两个模拟选项，让我实际运行。','纸面排练：点清晰卡和遮挡卡，比一比两种反应。实际世界中也请点角色验证。','第一版实际做了什么？只做纸面排练也请注明'],
      ['改回应','把鼠标交给下一位新同学','让试玩者照原话说出卡住的地方。保留第一版，只改遮挡时的指引，再请他重走一次。','请同伴故意遮住星星。他知道接下来找谁吗？写一句更具体的指引，另存第二版，用同一张纸卡再试。','保留第一版，在第二版只修改看不清时的指引。保持正常迎宾动作不变，列出同一遮挡条件的重测方法。','比较两版遮挡回应。请试玩者指出下一步要找的人，再记录他做了什么。','同伴的原话，以及改后重试的结果']
    ]
  },
  audit: {
    grade: '八年级', id: 'g8-05', place: '科技节咨询台', artifact: '校园问答体检卡',
    titles: ['从零做校园问答体检卡', '给校园问答助手做一次体检'],
    briefs: ['投屏一则三行公告。请全班当评测员：助手说“票价十元”，你能指出它的依据吗？一起做张体检卡，让下一班能复查你的结论。','科技节咨询台请你验收问答助手。做一张可以交给同伴独立使用的体检卡：每个判断都要能回到公告，公告改了还要重新判。'],
    choices: ['先查地点', '先查票价'],
    material: '练习公告：[E1] 本周六 14:00 举行科技节演出。[E2] 地点在学校大礼堂。[E3] 现场设 AI 体验区。公告未说明票价。',
    sampleHint: '先核对 E2 是否还在，再判断答复能否引用地点。',
    steps: [
      ['提问','十元的依据在哪一行？','投屏练习公告和“门票十元”的答复。先请一位同学找到证据，再请另一位说出助手应该怎样回答。','逐行读公告。试着给“地点在大礼堂”和“票价十元”各标一条依据。哪句标不出来？','公告没写票价，是否能回答“免费”？请解释原因，再用一个新问法考我。','免费和十元都需要票价证据。稳妥的答复是“公告未说明票价”。','我的问题和一次追问'],
      ['定标准','把四种结果分清楚','让全班先投票选第一道测试题。把“资料有没有依据”和“助手怎样回答”写在黑板上。','选择先查地点还是票价。拟四种答复，分别覆盖有据答对、无据编造、合理拒答、有据漏答。','给我四条测试用例，列问题、固定答复、资料依据和预期判断。先给计划，等我核对。','地点答礼堂为有据答对；票价答十元为无据编造；票价答未说明为合理拒答；地点答未知为有据漏答。','首题与判定依据'],
      ['画说明','让证据跟得上答复','请 AI 画咨询台封面。让全班找出哪些元素可以画，哪些文字和证据编号必须另外排版。','给卡片设计封面。对照原公告手动排 E1–E3，缩小画面，确认图不会遮住依据。','画科技节咨询台的封面插图，右侧留白；不要在图里画公告文字、价格或答案。','离线排版草案：左边画咨询台，右边放可选中的公告文本；删去会暗示票价的票券数字。','我用的素材，以及证据怎样保持可读'],
      ['做首版','做出同学能独立使用的体检卡','投屏制作单文件网页。打开第一版，请同学先判后看解析，故意选错一次，观察反馈。','请 AI 生成 index.html，在文件面板点开预览。逐题判断再看依据，保留第一版和一次误判。','做一个独立打开的 HTML 体检卡：含公告、四条固定答复、可点选四种结论，选后显示对应依据。保存第一版。','离线卡保留四条固定答复。请逐题选择结论，对照原公告检查解析。','第一版中的一条具体观察'],
      ['撤证重测','同一句话还算答对吗？','仅撤掉 E2，保持四句答复不变。让同一位同学再判地点两题，给出前后标签及理由。','保留第一版，在第二版加入撤掉 E2 的开关。先预测哪两题会变，再让同伴试；票价两题也要复测。','另存第二版，加入隐藏或恢复 E2 的开关。四句回答保持原样，评判随证据更新。按同伴反馈补一句核查提示。','撤掉 E2 后，“大礼堂”变为无据作答，“公告未说明地点”变为合理拒答；两道票价题的判定保持原样。','同伴的反馈、两道地点题的前后判断和票价复测结果']
    ]
  }
};

export function projectLesson(gate, teacher, archive) {
  const key = gate ? 'gate' : 'audit';
  const lesson = lessons[key];
  const role = teacher ? '教师大屏' : '学生动手';
  const title = lesson.titles[teacher ? 0 : 1];
  const board = gate ? '<small>新生的练习校牌</small><strong aria-label="星星图案">★</strong><span>星星班 · 新生体验日</span>' : '<small>科技节 · 练习公告</small><strong>周六 14:00</strong><span>E2　学校大礼堂<br>E3　现场设 AI 体验区</span>';
  const body = `<div class="fieldbook" data-role="${teacher ? 'teacher' : 'student'}"><div class="mast"><a href="../index.html#${lesson.id.slice(0,2)}">← 课程目录</a><b>${lesson.place}</b><span>${lesson.grade} · ${role}</span></div>
    <div class="hero"><div class="hero-copy"><small>${lesson.place} / ${role}</small><h1>${title}</h1><p>${lesson.briefs[teacher ? 0 : 1]}</p><button class="primary" id="begin">开始${teacher ? '投屏授课' : '我的作品'}</button></div><aside class="project-prop">${board}</aside></div>
    <nav class="strip" aria-label="制作步骤">${lesson.steps.map(([name], i) => `<button data-step="${i}">${name}</button>`).join('')}</nav>
    <div id="desk" tabindex="-1"><div class="workhead"><div><small id="phase"></small><h2 id="heading"></h2></div><button id="speak">朗读引导</button></div><p id="lead"></p>
    <div class="panels"><div class="sheet"><h3>手边的材料</h3><p>${lesson.material}</p><label for="plan">${gate ? '清晰时的动作' : '第一道测试题'}</label><select id="plan">${lesson.choices.map(x=>`<option>${x}</option>`).join('')}</select>
    ${teacher ? '<div class="actions"><button id="vote">为所选方案加一票</button><output id="votes"></output></div>' : ''}
    <button id="open-materials" class="quiet">打开本课实验材料</button><label for="note" id="note-label"></label><textarea id="note" rows="3"></textarea></div>
    <div class="sheet prompt"><h3>${teacher ? '请全班一起改这段委托' : '我的 AI 委托'}</h3><label for="request">改成自己的话</label><textarea id="request" rows="5"></textarea><button id="recompose" class="quiet" hidden>按现在的选择重新组合委托</button><div class="actions"><button id="copy" data-chat-copy>和 AI 聊</button></div><p>复制后在 AIChat 主对话粘贴、确认并发送，后续步骤沿用同一对话。</p><details><summary>看到实际回复，再追问一句</summary><label for="follow">我的追问或决定</label><textarea id="follow" rows="2"></textarea><button id="copy-follow" data-chat-copy>和 AI 聊</button></details><button id="example">在本页用示例练习</button><p id="sample-output" hidden></p></div></div>
    <section id="prototype" hidden><h3>可试玩的课内示例</h3><label for="hint">第二版的${gate ? '求助台词' : '核查提示'}</label><input id="hint" type="text" maxlength="160"><iframe title="课内示例试玩" sandbox="allow-scripts" class="returned"></iframe><button id="export"></button></section>
    <div class="stepfoot"><span id="status" role="status"></span><button id="next" class="primary"></button></div></div>
    <details class="extra" id="materials"><summary>${gate ? '打开 Paracraft、建景代码与纸卡实验' : '打开四象限实验台与评测材料'}</summary>${archive}</details>
    <details class="extra"><summary>整课路线与我的制作记录</summary><ol>${lesson.steps.map((row,i)=>`<li><b>${row[1]}</b><p>${row[teacher ? 2 : 3]}</p><p data-record="${i}"></p></li>`).join('')}</ol></details><div class="endlinks"><a href="../${lesson.id}-${teacher ? 'student' : 'teacher'}/index.html">切换到${teacher ? '学生动手' : '教师大屏'} →</a></div></div>
    <style>${read('weather/weather.css')}
    #materials{overflow-wrap:anywhere}#materials .intro small{white-space:normal}#materials input,#materials select{max-width:100%}#materials code{white-space:pre-wrap}.project-prop{align-self:center;justify-self:center;display:grid;gap:8px;box-sizing:border-box;width:min(85%,380px);margin:20px;padding:24px;background:${gate ? '#fff5c7' : '#e2eeef'};border:2px solid var(--ink);border-radius:12px;box-shadow:5px 5px 0 var(--ink);transform:rotate(-2deg)}.project-prop strong{font-size:clamp(30px,4vw,56px);line-height:1.15;color:${gate ? '#99551b' : '#194c50'}}#prototype iframe{display:block;width:100%;height:320px;margin:12px 0;border:1px solid var(--rule)}.fieldbook .strip{position:static}
    </style>`;
  return {body, script:`(() => {const lesson=${JSON.stringify(lesson)}, gate=${gate}, teacher=${teacher};\n${read('project-workshop.js')}\n})();`};
}
