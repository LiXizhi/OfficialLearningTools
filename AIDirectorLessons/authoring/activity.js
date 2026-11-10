const find = id => root.querySelector('#' + id);
const feedback = root.querySelector('.feedback');
function group(name) { return root.querySelector('[data-group="' + name + '"]'); }
function select(name, value) {
    const g = group(name);
    if (!g) return;
    for (const button of g.querySelectorAll('button'))
        button.setAttribute('aria-pressed', String(Number(button.dataset.choice) === value));
}
function onChoice(name, fn) {
    const g = group(name);
    if (!g) return;
    g.addEventListener('click', event => {
        const button = event.target.closest('button');
        if (!button) return;
        const value = Number(button.dataset.choice);
        select(name, value);
        fn(value);
    });
}

if (theme === 'snow') {
    let device = 0, prediction = null, condition = 0, trial = 0;
    const devNames = ['🤖 校门刷脸迎宾具身机器人', '🌿 平板拍照识花App', '🏠 客厅智能语音音箱', '💡 教室普通电灯开关'];
    const expectedClass = [0, 0, 1, 2]; // 0=图像识别AI, 1=语音交互AI, 2=普通机器无AI
    const classLabels = ['🤖 AI：图像识别（机器会看+具身迎宾）', '🤖 AI：语音交互（机器会听会说）', '⚙️ 普通机器（固定电路，无AI）'];
    const condLabels = ['☀️ 正常清晰', '🕶️ 遮挡一半/逆光', '📢 环境嘈杂/同音字'];

    function syncSnowCanvas() {
        window.__paintLessonScene({ device, condition });
    }
    select('condition', 0);

    find('density').onchange = () => {
        device = Number(find('density').value);
        prediction = null;
        select('prediction', -1);
        syncSnowCanvas();
        feedback.textContent = '已切换到「' + devNames[device] + '」，请先判断它属于哪一类、用了什么本领。';
    };

    onChoice('prediction', i => {
        prediction = i;
        const right = expectedClass[device] === i;
        feedback.textContent = (right ? '✅ 分类判断正确！' : '💡 再想一想：该设备应归为「' + classLabels[expectedClass[device]] + '」。') + ' 接下来可切换环境条件并点击【运行识别测试】。';
    });

    onChoice('condition', c => {
        condition = c;
        syncSnowCanvas();
        feedback.textContent = '已切换实验条件为「' + condLabels[c] + '」，点击【运行识别测试并记录】观察结果。';
    });

    find('reply').onclick = () => {
        const card = document.createElement('p');
        card.className = 'observation';
        card.textContent = '🪪 我的《AI在哪里观察卡》｜观察设备：' + devNames[device] + ' ｜ 核心类型：' + classLabels[expectedClass[device]] + ' ｜ 识别边界：当遇到遮挡或嘈杂干扰时可能认错，需人工核实 ｜ 🛡️ 安全约定：绝不输入真实姓名、家庭住址、电话号码与同学隐私照片！';
        find('observations').prepend(card);
        feedback.textContent = '✅ 已生成你的《AI在哪里观察卡》与安全小约定（见下方记录栏）！';
        window.dispatchEvent(new CustomEvent('lesson1:lab-complete', { detail: { type: 'card', device: devNames[device] } }));
    };

    find('run').onclick = () => {
        if (prediction === null) {
            feedback.textContent = '请先在第 2 步选择你对该设备类别与AI本领的判断！';
            return;
        }
        syncSnowCanvas();
        const actualClass = expectedClass[device];
        let resultText = '';
        if (device === 3) {
            resultText = '普通电灯开关：不管光线亮暗或周围吵不吵，按下去只会机械接通电路，没有传感器与AI模型。';
        } else if ((device === 0 || device === 1) && condition === 1) {
            resultText = '⚠️ 视觉受遮挡/逆光干扰！图像关键特征丢失，具身机器人识别置信度降至 42% 并主动亮黄灯请老师人工核验（说明AI也会出错）。';
        } else if (device === 2 && condition === 2) {
            resultText = '⚠️ 语音受嘈杂/同音字干扰！把“今天下午下雪”误转写为“今天下午下学”（说明语音识别需核对文字）。';
        } else {
            resultText = '✅ 环境清晰正常：传感器顺利采集特征 → AI模型高置信度（98%）匹配成功 → 具身迎宾机器人挥手问好并开闸！';
        }
        find('weather').textContent = '当前设备：' + devNames[device] + ' · 条件：' + condLabels[condition] + ' · ' + (actualClass === prediction ? '分类判断正确' : '分类待修正');
        feedback.textContent = (actualClass === prediction ? '🎯 类别判断吻合！' : '📌 提示：该设备属于「' + classLabels[actualClass] + '」。') + ' ' + resultText;
        const entry = document.createElement('p');
        entry.className = 'observation';
        entry.textContent = '实验 ' + (++trial) + ' ｜ 设备：' + devNames[device] + ' ｜ 条件：' + condLabels[condition] + ' ｜ 你的判断：' + classLabels[prediction] + ' ｜ 观察结论：' + resultText;
        find('observations').prepend(entry);
        window.dispatchEvent(new CustomEvent('lesson1:lab-complete', { detail: { type: 'run', trial, device: devNames[device], condition: condLabels[condition] } }));
    };
}

if (theme === 'gallery') {
    const claims = [
        '第1句：“五年级科学社团于本周五展出《校园气象站记录仪》，由林老师指导，现场可体验温度计读数。”',
        '第2句：“本次展览一共展出了五份精美的手绘气象观测图表。”',
        '第3句：“该作品曾荣获全市青少年科技创新一等奖，是本校历史上第一次气象展。”'
    ];
    const reasons = [
        '【有据可查】展览时间、社团、展品名称由[档案1]支持，林老师指导与体验读数由[档案3]直接支持。',
        '【事实冲突】草稿写的“五份”与[档案2]明确记载的“共展出 3 份手绘观测图表”直接冲突，必须更正为 3 份！',
        '【无据幻觉】[档案1]-[3]根本没有提到获奖记录或“历史上第一次”，属于生成式AI按高频赞美词概率接龙脑补出的“幻觉”，必须删去或标为待查！'
    ];
    const answers = [];
    let current = 0, promptMode = 0, publishedText = '';

    function refreshGallery() {
        window.__paintLessonScene({ promptMode, claimIdx: current, verdict: answers[current], published: publishedText });
    }

    select('promptmode', 0);
    onChoice('promptmode', mode => {
        promptMode = mode;
        refreshGallery();
        feedback.textContent = mode === 0
            ? '⚠️ 实验观察：使用【模糊无约束提示词（写得越轰动越好）】时，大模型为了凑出华丽辞藻，极易脑补出“五份图表、荣获一等奖”等AI幻觉！'
            : '✅ 实验观察：使用【限定资料提示词（仅据档案[1]-[3]编写，不编造未提奖项）】时，能大幅减少幻觉，但发布前仍需人工逐句核查！';
    });

    function show(i) {
        current = i;
        select('claim', i);
        select('verdict', answers[i]);
        find('claim').textContent = claims[i];
        feedback.textContent = answers[i] === undefined ? '请对照左侧【馆藏真实档案[1]-[3]】，判断这句话属于哪一类。' : reasons[i];
        refreshGallery();
    }
    onChoice('claim', show);
    onChoice('verdict', v => {
        answers[current] = v;
        feedback.textContent = (v === current ? '✅ 核查判断成立！' : '🔍 请再对照馆藏档案核对：') + reasons[current];
        refreshGallery();
    });
    find('publish').onclick = () => {
        const text = find('edit').value.trim();
        if (!text) {
            find('placard').textContent = '请先写下核验修改后的展签内容。';
            return;
        }
        const hasConflict = /五份/.test(text);
        const hasHallucination = /一等奖|首次|第一次|大奖/.test(text);
        publishedText = text;
        refreshGallery();
        if (hasConflict || hasHallucination) {
            find('placard').textContent = '⚠️ 总编辑审校提醒：你的展签里还残留着' + (hasConflict ? '与[档案2]冲突的“五份”（应为3份）' : '') + (hasHallucination ? '档案未提及的“获奖/首次”幻觉词' : '') + '，请继续修改后再发布！';
        } else {
            find('placard').textContent = '✅ 正式展签（已通过事实核验）\n' + text + '\n\n📝【AI辅助创作声明】本展签初稿由 AIChat 生成，经学生编辑对照馆藏档案[1]-[3]更正图表数量并删去无据获奖描述后定稿。';
        }
    };
    show(0);
}

if (theme === 'stage') {
    let hidden = false, current = 0;
    const labels = ['✅ 有据答对', '❌ 无据幻觉或答错', '🛡️ 合理拒答（守边界）', '⚠️ 有据漏答（检索失败）'];
    const questions = [
        '同学提问 1：“请问本周六的科技节演出在哪里举行？”',
        '同学提问 2：“去大礼堂看演出，门票多少钱一张？”',
        '同学提问 3：“去大礼堂看演出，门票多少钱一张？”',
        '同学提问 4：“请问这次演出在学校哪个场馆举办？”'
    ];
    const replies = [
        'AI助手回答：“本周六演出在学校大礼堂举行（引用依据：[E2]）。”',
        'AI助手回答：“门票每张 10 元，凭学生证半价。”',
        'AI助手回答：“当前通知中没有说明票价信息，建议咨询校团委服务台。”',
        'AI助手回答：“抱歉，通知里没有提到举办地点，无法得知。”'
    ];
    const records = [[], []];

    function display() {
        const record = records[Number(hidden)];
        select('case', current);
        select('rating', record[current]);
        find('case').textContent = questions[current] + '\n' + replies[current];
        find('notice').textContent = hidden
            ? '🔬 当前知识库（已移除[E2]地点）：[E1] 本周六14:00举行科技节演出 ｜ [E3] 现场设AI体验区（无地点、无票价）'
            : '📚 当前知识库（完整证据）：[E1] 本周六14:00举行科技节演出 ｜ [E2] 地点在学校大礼堂 ｜ [E3] 现场设AI体验区（无票价）';
        find('scores').textContent = '📊 当前轮次已评测 ' + record.filter(Number.isInteger).length + ' / 4 题 ｜ ' + labels.map((label, i) => label + '：' + record.filter(v => v === i).length + ' 题').join('　');
        window.__paintLessonScene({ hidden, current, records: record });
    }

    onChoice('case', i => {
        current = i;
        feedback.textContent = '';
        display();
    });

    onChoice('rating', v => {
        const expected = (hidden ? [1, 1, 2, 2] : [0, 1, 2, 3])[current];
        records[Number(hidden)][current] = v;
        display();
        const explanations = hidden ? [
            '当[E2]地点被移除后，知识库已无地点证据，助手仍凭空回答“在大礼堂”就从【有据答对】变成了【❌ 无据幻觉】！',
            '知识库始终没有票价信息，助手编造“10元”属于典型的【❌ 无据幻觉】。',
            '知识库没有票价信息，助手诚实说明未提及并引导人工咨询，属于【🛡️ 合理拒答】。',
            '当[E2]地点被移除后，知识库确实没有地点信息，此时助手回答“通知里没有提到地点”就从【有据漏答】变成了得当的【🛡️ 合理拒答】！'
        ] : [
            '知识库[E2]明确写着“在学校大礼堂”，助手准确命中并引用依据，属于【✅ 有据答对】。',
            '知识库中根本没有票价，助手却自信编出“10元、半价”，属于高风险的【❌ 无据幻觉】！',
            '知识库未提票价，助手诚实说明未说明并指引人工咨询，守住了边界，属于【🛡️ 合理拒答】。',
            '知识库[E2]明明写着“在大礼堂”，只因提问把“地点”换成了同义词“场馆”助手就说不知道，属于【⚠️ 有据漏答（检索失败）】。'
        ];
        feedback.textContent = (expected === v ? '🎯 评测判定完全准确！' : '🔍 再核对一次证据链：本题应归为「' + labels[expected] + '」。') + ' ' + explanations[current];
    });

    find('toggle').onclick = () => {
        hidden = !hidden;
        find('toggle').setAttribute('aria-pressed', String(hidden));
        find('toggle').textContent = hidden ? '🔄 恢复知识库里的【[E2]地点】证据' : '🔬 控制变量：隐藏通知里的【[E2]地点】证据';
        display();
        feedback.textContent = hidden
            ? '🔬 已从知识库移除[E2]地点！请重新点击【第 1 题】和【第 4 题】，看看同样的回答在失去证据支持后应该改评为什么！'
            : '📚 已恢复完整知识库（含[E2]大礼堂地点）。';
    };
    display();
}
