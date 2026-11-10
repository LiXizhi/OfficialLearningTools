// Interactive visual canvas renderer for the 3 sample AI General Education lessons.
const root = document.querySelector('.activity');
const canvas = root.querySelector('canvas');
const ctx = canvas.getContext('2d');
const theme = root.dataset.theme;

function rect(color, x, y, w, h, r = 0) {
    ctx.fillStyle = color;
    if (!r) { ctx.fillRect(x, y, w, h); return; }
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
}
function strokeRect(color, x, y, w, h, lineWidth = 2, r = 0, dash = []) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(dash);
    ctx.beginPath();
    if (r) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.restore();
}
function circle(color, x, y, r) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
}
function text(str, x, y, color = '#142f37', font = '600 15px "Microsoft YaHei", sans-serif', align = 'left') {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
}
function arrow(x1, y1, x2, y2, color = '#155c67', dashed = false) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5;
    if (dashed) ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 9 * Math.cos(angle - 0.4), y2 - 9 * Math.sin(angle - 0.4));
    ctx.lineTo(x2 - 9 * Math.cos(angle + 0.4), y2 - 9 * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function paintSnowScene(state = {}) {
    const dev = state.device ?? 0;
    const cond = state.condition ?? 0;
    const names = ['🤖 校门刷脸迎宾具身机器人', '🌿 平板拍照识花', '🏠 智能语音音箱', '💡 普通电灯开关'];
    const isAI = dev !== 3;
    const condLabels = ['☀️ 环境正常（画面清晰 / 声音清楚）', '🕶️ 视觉干扰（逆光遮挡一半特征）', '📢 语音干扰（周围嘈杂 / 同音字）'];

    // Background
    rect('#eaf3f5', 0, 0, 800, 510);
    rect('#124952', 0, 0, 800, 52);
    text('小学低段第1课 · 校园与虚拟具身机器人 AI 探索实验室', 20, 32, '#ffffff', '700 17px "Microsoft YaHei", sans-serif');
    text(condLabels[cond], 780, 32, '#ffd97d', '600 14px "Microsoft YaHei", sans-serif', 'right');

    // Left: Scene Visual Box
    rect('#ffffff', 20, 68, 430, 275, 14);
    strokeRect('#b8d0d4', 20, 68, 430, 275, 2, 14);
    rect('#d7ecef', 20, 68, 430, 40, 14);
    text('当前观察：' + names[dev], 32, 94, '#103f47', '700 15px "Microsoft YaHei", sans-serif');
    rect(isAI ? '#146c54' : '#6c757d', 326, 76, 110, 24, 12);
    text(isAI ? '🤖 AI具身/智能' : '⚙️ 普通机器', 381, 93, '#ffffff', '700 12px "Microsoft YaHei", sans-serif', 'center');

    // Draw specific device illustration inside (20, 110, 430, 230)
    if (dev === 0) {
        // Paracraft 3D Virtual Embodied Greeting Robot at School Gate
        rect('#f3f8f9', 36, 120, 398, 206, 10);
        // 3D Voxel Embodied Robot body + head + antenna
        rect('#2b5876', 54, 188, 52, 72, 8); // torso
        rect('#3a7bd5', 58, 144, 44, 40, 8); // voxel robot head
        rect('#00d2ff', 77, 130, 6, 14, 2);  // antenna
        circle(cond === 0 ? '#2ec4b6' : '#ff6b6b', 80, 128, 5); // status beacon
        // Robot camera eyes & chest screen
        circle('#00f5d4', 71, 162, 5);
        circle('#00f5d4', 89, 162, 5);
        rect('#10252b', 64, 198, 32, 24, 4);
        text('AI', 80, 215, '#4dd4ac', '700 12px sans-serif', 'center');
        text('具身迎宾机器人', 80, 278, '#103f47', '700 11px "Microsoft YaHei", sans-serif', 'center');

        // Camera vision cone & Student face preview screen
        rect('#10252b', 124, 150, 78, 96, 6);
        circle('#ffdfc4', 163, 192, 21);
        circle('#222', 155, 187, 2.5);
        circle('#222', 171, 187, 2.5);
        if (cond === 1) {
            rect('#222', 145, 181, 36, 10, 2);
            rect('#78909c', 147, 194, 32, 15, 4);
            strokeRect('#e63946', 135, 164, 56, 54, 2, 4, [4, 3]);
            text('遮挡 42%', 163, 237, '#ff6b6b', '700 11px sans-serif', 'center');
        } else {
            strokeRect('#2ec4b6', 135, 164, 56, 54, 2, 4);
            circle('#2ec4b6', 155, 187, 3.5);
            circle('#2ec4b6', 171, 187, 3.5);
            circle('#2ec4b6', 163, 201, 3.5);
            text('特征匹配 98%', 163, 237, '#4dd4ac', '700 11px sans-serif', 'center');
        }
        // Gate barrier & Embodied action output
        rect('#5c767d', 222, 230, 26, 80, 4);
        if (cond === 1 || cond === 2) {
            rect('#e63946', 244, 242, 165, 13, 4);
            text('⚠️ 具身动作：停步亮黄灯', 228, 178, '#c1121f', '700 13px "Microsoft YaHei", sans-serif');
            text('语音：“请摘下遮挡或请老师核验”', 228, 202, '#7f1d1d', '600 12px "Microsoft YaHei", sans-serif');
        } else {
            rect('#2a9d8f', 230, 148, 13, 95, 4);
            text('✅ 具身动作：挥手迎宾+开闸', 228, 178, '#146c54', '700 13px "Microsoft YaHei", sans-serif');
            text('语音：“同学早安，欢迎入校！”', 228, 202, '#103f47', '600 12px "Microsoft YaHei", sans-serif');
        }
    } else if (dev === 1) {
        // Plant Recognition App
        rect('#f3f8f9', 36, 120, 398, 206, 10);
        // Leaf drawing
        circle('#52b788', 145, 220, 42);
        circle('#40916c', 165, 210, 34);
        rect('#2d6a4f', 115, 218, 75, 4);
        if (cond === 1) {
            rect('#374151', 125, 180, 68, 65, 6);
            text('阴影遮挡叶片边缘', 159, 217, '#ffffff', '600 11px sans-serif', 'center');
        }
        // Tablet frame
        strokeRect(cond === 1 ? '#e63946' : '#2a9d8f', 95, 162, 130, 115, 3, 10, [6, 4]);
        text(cond === 1 ? '❓ 疑似：塑料绿植 (38%)' : '✅ 识别结果：月季叶 (96%)', 245, 195, cond === 1 ? '#c1121f' : '#146c54', '700 14px "Microsoft YaHei", sans-serif');
        text(cond === 1 ? '原因：关键叶脉与锯齿被遮挡' : '依据：卵形叶片 + 边缘锯齿特征', 245, 225, '#455a64', '13px "Microsoft YaHei", sans-serif');
    } else if (dev === 2) {
        // Smart Voice Speaker
        rect('#f3f8f9', 36, 120, 398, 206, 10);
        rect('#2b4c59', 82, 185, 76, 105, 18);
        circle('#4dd4ac', 120, 205, 18);
        circle('#122b34', 120, 205, 10);
        // Sound waves
        for (let i = 1; i <= 3; i++) {
            strokeRect(cond === 2 ? '#e63946' : '#2a9d8f', 168 + i * 12, 205 - i * 12, 6, i * 24, 2, 3);
        }
        rect('#ffffff', 225, 145, 190, 65, 8);
        strokeRect('#90b4bc', 225, 145, 190, 65, 1.5, 8);
        text('🎙️ 你说：“今天下午下雪”', 238, 170, '#142f37', '600 13px "Microsoft YaHei", sans-serif');
        text(cond === 2 ? '📝 转写：“今天下午下学”(错!)' : '📝 转写：“今天下午下雪”(准!)', 238, 196, cond === 2 ? '#c1121f' : '#146c54', '700 13px "Microsoft YaHei", sans-serif');

        rect('#e3f2fd', 225, 225, 190, 65, 8);
        text(cond === 2 ? '🔊 音箱答：“放学请注意安全”' : '🔊 音箱答：“下雪天路面湿滑”', 238, 255, '#0d3b66', '600 13px "Microsoft YaHei", sans-serif');
        text(cond === 2 ? '⚠️ 嘈杂+同音字导致语音识别偏差' : '✅ 语音识别 + 语义理解 + 语音合成', 238, 278, '#555', '12px "Microsoft YaHei", sans-serif');
    } else {
        // Ordinary Light Switch
        rect('#f3f8f9', 36, 120, 398, 206, 10);
        rect('#d8e2dc', 85, 175, 84, 100, 8);
        rect('#ffffff', 105, 198, 44, 54, 4);
        circle('#ffd166', 310, 210, 34);
        rect('#adb5bd', 298, 244, 24, 18, 3);
        arrow(175, 225, 265, 225, '#6c757d');
        text('电线物理通断', 220, 212, '#495057', '600 12px "Microsoft YaHei", sans-serif', 'center');
        text('⚙️ 普通机器：只会按固定电路通断亮灭', 75, 152, '#495057', '700 14px "Microsoft YaHei", sans-serif');
        text('不会看图像、不会听声音、没有AI模型判断', 75, 305, '#6c757d', '13px "Microsoft YaHei", sans-serif');
    }

    // Right: AI Principle Box (470, 68, 310, 275)
    rect('#ffffff', 470, 68, 310, 275, 14);
    strokeRect('#b8d0d4', 470, 68, 310, 275, 2, 14);
    rect('#155c67', 470, 68, 310, 40, 14);
    text('🧠 为什么它是（或不是）AI？', 488, 94, '#ffffff', '700 15px "Microsoft YaHei", sans-serif');

    const steps = isAI ? [
        ['① 感知环境（输入）', dev === 2 ? '麦克风采集声音波形' : '摄像头采集图像画面', '#e0f2f1'],
        ['② AI模型分析（大脑）', cond === 0 ? '提取特征并与训练模型匹配' : '⚠️ 特征受干扰，匹配度下降', cond === 0 ? '#e0f2f1' : '#ffebee'],
        ['③ 智能反应（输出）', cond === 0 ? '准确识别并做出行动 (96%+)' : '❌ 识别偏差：需人工核实！', cond === 0 ? '#e8f5e9' : '#fff3e0']
    ] : [
        ['① 物理按键（输入）', '手指按下塑料翘板开关', '#f1f3f5'],
        ['② 固定电路（无AI模型）', '金属片接触导电，不会动脑分析', '#f1f3f5'],
        ['③ 固定动作（输出）', '不管周围是谁，永远只管通电亮灯', '#f1f3f5']
    ];
    steps.forEach(([t, d, bg], idx) => {
        const y = 122 + idx * 70;
        rect(bg, 486, y, 278, 54, 8);
        text(t, 498, y + 22, '#103f47', '700 13px "Microsoft YaHei", sans-serif');
        text(d, 498, y + 43, '#37474f', '12.5px "Microsoft YaHei", sans-serif');
        if (idx < 2) arrow(625, y + 54, 625, y + 70, '#155c67');
    });

    // Bottom: Five-Step & Safety Summary Banner (20, 358, 760, 134)
    rect('#ffffff', 20, 358, 760, 134, 14);
    strokeRect('#b8d0d4', 20, 358, 760, 134, 2, 14);
    rect('#fff8e6', 36, 372, 728, 48, 8);
    text('📌 核心结论：AI应用 = 感知（看/听）+ 模型判断 + 行动；但环境遮挡或嘈杂时 AI 也会出错！', 50, 401, '#8a5a00', '700 14px "Microsoft YaHei", sans-serif');
    rect('#e8f5e9', 36, 430, 728, 48, 8);
    text('🛡️ 小学低段《AI安全小约定》：不输入真实姓名、家庭住址、电话号码、身份证号，不上传同学隐私照片！', 50, 459, '#1b5e20', '700 14px "Microsoft YaHei", sans-serif');
}

function paintGalleryScene(state = {}) {
    const promptMode = state.promptMode ?? 0; // 0 = vague prompt, 1 = constrained prompt
    const claimIdx = state.claimIdx ?? 0;
    const verdict = state.verdict;
    const published = state.published || '';

    rect('#faf3eb', 0, 0, 800, 510);
    rect('#7c3626', 0, 0, 800, 52);
    text('小学高段样课 · 生成式AI提示词与“AI幻觉”事实核查台', 20, 32, '#ffffff', '700 17px "Microsoft YaHei", sans-serif');
    text(promptMode === 0 ? '当前实验：模糊无约束提示词（易出幻觉）' : '当前实验：限定资料提示词（减少幻觉）', 780, 32, '#ffe0b2', '600 14px "Microsoft YaHei", sans-serif', 'right');

    // Left Box: Reliable Archive Card (20, 68, 250, 280)
    rect('#ffffff', 20, 68, 250, 280, 12);
    strokeRect('#d4b098', 20, 68, 250, 280, 2, 12);
    rect('#95452c', 20, 68, 250, 38, 12);
    text('📋 馆藏真实档案（核查依据）', 34, 93, '#ffffff', '700 14px "Microsoft YaHei", sans-serif');

    const archives = [
        ['[档案1] 展品与时间', '五年级科学社本周五展出', '《校园气象站记录仪》'],
        ['[档案2] 展出数量', '共展出 3 份手绘观测图表', '（记录连续7天气温降水）'],
        ['[档案3] 指导与体验', '林老师担任指导教师，', '参观者可现场体验读数']
    ];
    archives.forEach(([h, l1, l2], idx) => {
        const y = 118 + idx * 72;
        const active = (claimIdx === 0 && (idx === 0 || idx === 2)) || (claimIdx === 1 && idx === 1);
        rect(active ? '#fff3e0' : '#f8f5f2', 32, y, 226, 62, 8);
        strokeRect(active ? '#e65100' : '#e0d4c8', 32, y, 226, 62, active ? 2 : 1, 8);
        text(h, 42, y + 20, '#7c3626', '700 12.5px "Microsoft YaHei", sans-serif');
        text(l1, 42, y + 39, '#2b2b2b', '12px "Microsoft YaHei", sans-serif');
        text(l2, 42, y + 55, '#555555', '12px "Microsoft YaHei", sans-serif');
    });

    // Center Box: AI Generation & Verification Lens (290, 68, 240, 280)
    rect('#ffffff', 290, 68, 240, 280, 12);
    strokeRect('#d4b098', 290, 68, 240, 280, 2, 12);
    rect('#b85d3b', 290, 68, 240, 38, 12);
    text('🤖 AI词语接龙与事实比对', 304, 93, '#ffffff', '700 14px "Microsoft YaHei", sans-serif');

    const claimTitles = ['正在核查：第 1 句', '正在核查：第 2 句', '正在核查：第 3 句'];
    const claimSnippets = [
        ['“科学社周五展出气象仪”', '✅ 对应[档案1][档案3]', '#2e7d32', '#e8f5e9'],
        ['“一共展出五份观测图表”', '❌ 与[档案2]“3份”冲突！', '#c62828', '#ffebee'],
        ['“曾获市级一等奖、首次展”', '❓ 档案未提！属AI脑补幻觉', '#ef6c00', '#fff3e0']
    ];
    const [snip, diag, color, bg] = claimSnippets[claimIdx];
    text(claimTitles[claimIdx], 306, 130, '#7c3626', '700 14px "Microsoft YaHei", sans-serif');
    rect(bg, 304, 144, 212, 78, 8);
    strokeRect(color, 304, 144, 212, 78, 2, 8);
    text(snip, 314, 172, '#1f2937', '700 13px "Microsoft YaHei", sans-serif');
    text(diag, 314, 202, color, '700 12.5px "Microsoft YaHei", sans-serif');

    rect('#f8f5f2', 304, 236, 212, 96, 8);
    text('💡 为什么AI会“多说一句”？', 314, 258, '#7c3626', '700 12.5px "Microsoft YaHei", sans-serif');
    text('大模型按概率接龙高频词（如', 314, 279, '#444', '12px "Microsoft YaHei", sans-serif');
    text('“展览→荣获大奖”），看起来很', 314, 297, '#444', '12px "Microsoft YaHei", sans-serif');
    text('通顺，但未核对真实档案！', 314, 315, '#444', '12px "Microsoft YaHei", sans-serif');

    // Evidence connector arrows
    if (claimIdx === 0) arrow(258, 148, 304, 175, '#2e7d32');
    else if (claimIdx === 1) arrow(258, 220, 304, 185, '#c62828', true);

    // Right Box: Final Placard Preview (550, 68, 230, 280)
    rect('#ffffff', 550, 68, 230, 280, 12);
    strokeRect('#d4b098', 550, 68, 230, 280, 2, 12);
    rect('#4a3531', 550, 68, 230, 38, 12);
    text('🖼️ 展厅正式展牌预览', 566, 93, '#ffffff', '700 14px "Microsoft YaHei", sans-serif');

    rect('#fffdf9', 564, 118, 202, 146, 8);
    strokeRect('#c89f81', 564, 118, 202, 146, 1.5, 8);
    text('《校园气象站记录仪》展签', 576, 140, '#7c3626', '700 13px "Microsoft YaHei", sans-serif');
    const previewLines = (published || '本周五由五年级科学社展出3份手绘气象图表（林老师指导）。').match(/.{1,13}/g) || [];
    previewLines.slice(0, 4).forEach((line, idx) => {
        text(line, 576, 166 + idx * 20, '#222', '12.5px "Microsoft YaHei", sans-serif');
    });
    rect('#e8f5e9', 564, 276, 202, 58, 8);
    text('✅ 已核对馆藏档案[1]-[3]', 574, 298, '#1b5e20', '700 12px "Microsoft YaHei", sans-serif');
    text('📝 已标注：AIChat初稿+人工审校', 574, 318, '#2e7d32', '11.5px "Microsoft YaHei", sans-serif');

    // Bottom: Three-Step Verification & Governance Rule (20, 362, 760, 130)
    rect('#ffffff', 20, 362, 760, 130, 12);
    strokeRect('#d4b098', 20, 362, 760, 130, 2, 12);
    text('🔍 生成式AI内容“三步核查法”与诚信规范：', 38, 390, '#7c3626', '700 15px "Microsoft YaHei", sans-serif');
    const boxes = [
        ['1. 有据可查（保留）', '时间、数量、人物在可靠原文中有直接原句支持', '#e8f5e9', '#1b5e20'],
        ['2. 事实冲突（更正）', '数字或属性与原文矛盾（如3份写成5份），按原文改回', '#ffebee', '#b71c1c'],
        ['3. 无据幻觉（删/查）', '原文未提的奖项或“首次”，必须删去或标明待查并附AI使用声明', '#fff3e0', '#e65100']
    ];
    boxes.forEach(([t, d, bg, fg], idx) => {
        const x = 36 + idx * 246;
        rect(bg, x, 404, 234, 72, 8);
        text(t, x + 12, 428, fg, '700 13px "Microsoft YaHei", sans-serif');
        const parts = d.match(/.{1,17}/g) || [d];
        parts.slice(0, 2).forEach((p, pi) => text(p, x + 12, 448 + pi * 18, '#333', '11.5px "Microsoft YaHei", sans-serif'));
    });
}

function paintStageScene(state = {}) {
    const hidden = Boolean(state.hidden);
    const current = state.current ?? 0;
    const records = state.records || [];

    rect('#f1eff8', 0, 0, 800, 510);
    rect('#3f2e66', 0, 0, 800, 52);
    text('初中样课 · 校园问答助手 RAG 黑箱拆解与四象限评测看板', 20, 32, '#ffffff', '700 17px "Microsoft YaHei", sans-serif');
    text(hidden ? '🔬 实验状态：已移除知识库[E2]地点' : '📚 实验状态：完整知识库（含时间与地点）', 780, 32, '#ffd166', '600 14px "Microsoft YaHei", sans-serif', 'right');

    // Left Box: Knowledge Base (RAG Evidence Store) (20, 68, 250, 275)
    rect('#ffffff', 20, 68, 250, 275, 12);
    strokeRect('#c5bce0', 20, 68, 250, 275, 2, 12);
    rect('#59457f', 20, 68, 250, 38, 12);
    text('📚 校园权威知识库 (RAG)', 34, 93, '#ffffff', '700 14px "Microsoft YaHei", sans-serif');

    const docs = [
        ['[E1] 举办时间（已收录）', '本周六 14:00 举行校园演出', '#e8f5e9', '#1b5e20'],
        [hidden ? '[E2] 举办地点（已移除!）' : '[E2] 举办地点（已收录）', hidden ? '❌ 地点字段已从通知中删去' : '在学校大礼堂举行', hidden ? '#ffebee' : '#e8f5e9', hidden ? '#c62828' : '#1b5e20'],
        ['[缺失项] 票价与私人电话', '通知未说明票价（无证据）', '#fff3e0', '#e65100']
    ];
    docs.forEach(([h, d, bg, fg], idx) => {
        const y = 118 + idx * 72;
        rect(bg, 32, y, 226, 60, 8);
        text(h, 42, y + 23, fg, '700 12.5px "Microsoft YaHei", sans-serif');
        text(d, 42, y + 45, '#333333', '12px "Microsoft YaHei", sans-serif');
    });

    // Center Box: Black-Box RAG Pipeline for Current Case (286, 68, 228, 275)
    rect('#ffffff', 286, 68, 228, 275, 12);
    strokeRect('#c5bce0', 286, 68, 228, 275, 2, 12);
    rect('#4a3b6b', 286, 68, 228, 38, 12);
    text('⚙️ 当前测试题黑箱追踪', 302, 93, '#ffffff', '700 14px "Microsoft YaHei", sans-serif');

    const qList = ['Q1 问：演出在哪里？', 'Q2 问：门票多少钱？', 'Q3 问：门票多少钱？', 'Q4 问：演出在哪里？'];
    const aList = ['答：“在学校大礼堂。”', '答：“每张票10元。”', '答：“通知未写明票价。”', '答：“通知未写明地点。”'];
    const hasEvidence = [hidden ? false : true, false, false, hidden ? false : true][current];
    const expectedIdx = (hidden ? [1, 1, 2, 2] : [0, 1, 2, 3])[current];
    const ratingNames = ['✅ 有据答对', '❌ 无据幻觉/答错', '🛡️ 合理拒答', '⚠️ 有据漏答'];

    const flow = [
        ['① 用户提问', qList[current], '#f3f0fa'],
        ['② 知识库检索证据', hasEvidence ? '🟢 命中[E2]地点证据' : '🟠 知识库无此项证据', hasEvidence ? '#e8f5e9' : '#fff3e0'],
        ['③ 助手实际输出', aList[current], '#f3f0fa'],
        ['④ 科学评测归类', '应评为：' + ratingNames[expectedIdx], '#ede7f6']
    ];
    flow.forEach(([t, d, bg], idx) => {
        const y = 114 + idx * 54;
        rect(bg, 298, y, 204, 46, 6);
        text(t, 308, y + 18, '#4a3b6b', '700 11.5px "Microsoft YaHei", sans-serif');
        text(d, 308, y + 36, '#1f2937', '600 12px "Microsoft YaHei", sans-serif');
    });

    // Right Box: 2x2 Four-Quadrant Evaluation Matrix (530, 68, 250, 275)
    rect('#ffffff', 530, 68, 250, 275, 12);
    strokeRect('#c5bce0', 530, 68, 250, 275, 2, 12);
    rect('#59457f', 530, 68, 250, 38, 12);
    text('📊 四象限评测矩阵 (2×2)', 546, 93, '#ffffff', '700 14px "Microsoft YaHei", sans-serif');

    const quads = [
        [0, '✅ 有据答对', '有证据 + 准确作答', 542, 118, '#e8f5e9', '#1b5e20'],
        [2, '🛡️ 合理拒答', '无证据 + 诚实说未知', 660, 118, '#e3f2fd', '#0d47a1'],
        [3, '⚠️ 有据漏答', '有证据 + 却说不知道', 542, 224, '#fff8e1', '#e65100'],
        [1, '❌ 无据幻觉', '无证据 + 凭空瞎编', 660, 224, '#ffebee', '#b71c1c']
    ];
    quads.forEach(([qCode, title, sub, x, y, bg, fg]) => {
        const count = records.filter(v => v === qCode).length;
        const isCurrentExpected = expectedIdx === qCode;
        rect(bg, x, y, 108, 96, 8);
        strokeRect(isCurrentExpected ? fg : '#d0c8e8', x, y, 108, 96, isCurrentExpected ? 2.5 : 1, 8);
        text(title, x + 8, y + 24, fg, '700 12.5px "Microsoft YaHei", sans-serif');
        text(sub, x + 8, y + 44, '#444', '10.5px "Microsoft YaHei", sans-serif');
        text('已评：' + count + ' 题', x + 8, y + 78, fg, '700 14px "Microsoft YaHei", sans-serif');
    });

    // Bottom Summary Box (20, 358, 760, 134)
    rect('#ffffff', 20, 358, 760, 134, 12);
    strokeRect('#c5bce0', 20, 358, 760, 134, 2, 12);
    rect('#ede7f6', 36, 372, 728, 48, 8);
    text('🎯 核心原理：评价生成式AI不能只看“话术流不流利”，必须对照给定证据评判【忠实度】与【拒答边界】！', 50, 401, '#3f2e66', '700 13.5px "Microsoft YaHei", sans-serif');
    rect('#fff3e0', 36, 430, 728, 48, 8);
    text('🔬 控制变量发现：当移除[E2]地点后，仍答“在大礼堂”会从【有据答对】变成【无据幻觉】，答“未说明”则变为【合理拒答】！', 50, 459, '#bf360c', '700 13px "Microsoft YaHei", sans-serif');
}

window.__paintLessonScene = function(state = {}) {
    if (theme === 'snow') paintSnowScene(state);
    if (theme === 'gallery') paintGalleryScene(state);
    if (theme === 'stage') paintStageScene(state);
};
window.__paintLessonScene({});
