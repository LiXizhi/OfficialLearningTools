/* 第 3 课 3.1：模拟 KeepWork AIChat 工作台 7 步回放 + 角色同步 + 直通任务卡按钮 */
(() => {
  const mount = document.getElementById('sim');
  if (!mount || typeof dayRoles === 'undefined') return;

  let roleKey = (window.getCourseRole && window.getCourseRole()) || 'student';
  let stepIdx = 0;
  let playing = false;
  let brainOpen = true;
  let timer = 0;
  let speedMs = 2900;

  const avatarThumbs = {
    student: 'assets/student-scene.webp',
    teacher: 'assets/teacher-scene.webp',
    leader: 'assets/leader-scene.webp',
    founder: 'assets/founder-scene.webp'
  };

  function buildBeats(d) {
    return [
      {
        stage: '第 1 步 · 发起清晰委托',
        narr: `用户在左侧「${d.sessions[0]?.[1] || d.title}」会话中不再只打一句口号，而是写出包含受众与成果的委托。`,
        composer: d.brief,
        brainFiles: [],
        litNodes: [0],
        messages: [
          {
            role: 'user',
            html: `<strong>委托目标：</strong>${esc(d.brief)}<div style="margin-top:6px"><span class="sim-src">🎯 读者：${esc(d.audience)}</span></div>`
          }
        ]
      },
      {
        stage: '第 2 步 · 绑定 raw/ 原始事实',
        narr: `主分身先只读扫描第 ${d.sources.length} 份本地资料，右侧第二大脑亮起对应来源页。`,
        composer: '',
        brainFiles: d.sources.map((s, i) => ({ name: s.split('｜')[0] || `来源${i + 1}`, note: s.split('｜')[1] || s, state: 'lit' })),
        litNodes: [0, 1],
        messages: [
          { role: 'user', html: `<strong>委托目标：</strong>${esc(d.brief)}` },
          {
            role: 'ai',
            html: `收到。先锁定证据范围，避免脑补。<div class="sim-tool"><div class="sim-tool-head"><span class="sim-tool-ico">📁</span><strong>读取 raw/ 与当前目录</strong><span class="sim-tool-status">✓ 已核对 ${d.sources.length} 份</span></div><div class="sim-tool-body">${d.sources.map((s) => `<div>• <code>${esc(s.split('｜')[0])}</code> ${esc(s.split('｜').slice(1).join('｜'))}</div>`).join('')}</div></div>`
          }
        ]
      },
      {
        stage: '第 3 步 · 双分身并行压测',
        narr: `主分身拆出「${d.agents[0]}」和「${d.agents[1]}」两个视角并行检查，防止单个分身既写又吹。`,
        composer: '',
        brainFiles: d.sources.map((s, i) => ({ name: s.split('｜')[0] || `来源${i + 1}`, note: '参与压测核验', state: 'lit' })),
        litNodes: [0, 1, 2],
        messages: [
          { role: 'user', html: `<strong>委托目标：</strong>${esc(d.brief)}` },
          {
            role: 'ai',
            html: `已派出双分身并行压测：
              <div class="sim-agents">
                <div class="sim-agent-card"><strong>⚡ ${esc(d.agents[0])}</strong><p>${esc(d.pair[0])}</p></div>
                <div class="sim-agent-card"><strong>🔍 ${esc(d.agents[1])}</strong><p>${esc(d.pair[1])}</p></div>
              </div>`
          }
        ]
      },
      {
        stage: '第 4 步 · 停下来由人裁决',
        narr: '质疑分身发现事实与外推之间有缺口，工作台把判断卡抛给人来选，而不擅自代做决定。',
        composer: '',
        brainFiles: d.sources.map((s, i) => ({ name: s.split('｜')[0] || `来源${i + 1}`, note: '发现潜在分歧', state: 'lit' })),
        litNodes: [1, 2],
        choice: true,
        messages: [
          { role: 'user', html: `<strong>委托目标：</strong>${esc(d.brief)}` },
          {
            role: 'ai',
            html: `<strong>⚠ 检查出证据断点：</strong>若直接给出无条件结论（<code>${esc(d.before)}</code>），就会越过现有材料边界。请你在下方做选择：`
          }
        ]
      },
      {
        stage: '第 5 步 · 对照修订保留边界',
        narr: '按人工选定的边界修订输出，清楚标明已核实事实与待补条件，同时防止历史错误复发。',
        composer: '',
        brainFiles: d.sources.map((s, i) => ({ name: s.split('｜')[0] || `来源${i + 1}`, note: '已纳入引用依据', state: 'lit' })),
        litNodes: [0, 1, 2],
        messages: [
          { role: 'user', html: `<strong>委托目标：</strong>${esc(d.brief)}` },
          {
            role: 'ai',
            html: `已按你的裁决生成新版交付物：<div class="sim-tool"><div class="sim-tool-head"><span class="sim-tool-ico">✎</span><strong>版本差异对比</strong><span class="sim-tool-status">✓ 边界清晰</span></div><div class="sim-tool-body"><div style="color:#9c3831;text-decoration:line-through">改前风险：${esc(d.before)}</div><div style="color:#21542d;margin-top:4px"><b>改后留痕：</b>${esc(d.after)}</div></div></div>`
          }
        ]
      },
      {
        stage: '第 6 步 · 写回第二大脑与 RSI',
        narr: '不让这次经验随着关网页消失：把新知识页与“防再次踩坑规则”同时写回 Git + Markdown 目录。',
        composer: '',
        brainFiles: [
          ...d.sources.slice(0, 2).map((s) => ({ name: s.split('｜')[0], note: '已索引关联', state: 'lit' })),
          { name: '_wiki/ & RSI 检验规则', note: d.rule, state: 'new' }
        ],
        litNodes: [0, 1, 2, 3],
        messages: [
          { role: 'user', html: `<strong>委托目标：</strong>${esc(d.brief)}` },
          {
            role: 'ai',
            html: `已同步沉淀两条文件资产：
              <div class="sim-tool"><div class="sim-tool-head"><span class="sim-tool-ico">🧠</span><strong>写入 _wiki/ 与 AGENTS.md (RSI)</strong><span class="sim-tool-status">✓ 已入库</span></div><div class="sim-tool-body"><div>• 规则沉淀：<code>${esc(d.rule)}</code></div><div>• 目录状态：可在右侧“第二大脑面板”随时审计回滚。</div></div></div>`
          }
        ]
      },
      {
        stage: '第 7 步 · 盲测交接与复用价值',
        narr: `最后一关不是“自己看着挺好”，而是交给「${d.audience}」盲测验证是否真能复用。`,
        composer: '',
        brainFiles: [
          { name: '_wiki/projects/当前任务.md', note: '附盲测记录与验收标准', state: 'new' },
          { name: '_wiki/index.md', note: '已登记 1 条新摘要', state: 'lit' }
        ],
        litNodes: [0, 1, 2, 3],
        messages: [
          { role: 'user', html: `<strong>委托目标：</strong>${esc(d.brief)}` },
          {
            role: 'ai',
            html: `<strong>✓ 今日可交接结果已就绪：</strong><br>• 盲测安排：${esc(d.handoff)}<br>• 长期价值：${esc(d.value)}<br><div style="margin-top:6px"><span class="sim-src">下一步：点下方“直接填进任务卡”带走这整套配置</span></div>`
          }
        ]
      }
    ];
  }

  function clearTimer() {
    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }
  }

  function render() {
    const d = dayRoles[roleKey] || dayRoles.student;
    const beats = buildBeats(d);
    const beat = beats[stepIdx] || beats[0];

    mount.innerHTML = `
      <div class="sim-section">
        <div class="sim-head">
          <div>
            <p class="eyebrow">3.1 模拟 AIChat 工作台 · 7 步实操回放</p>
            <h2>在真实<em>工作台布局</em>里走一遍同一任务</h2>
            <p>这里和 KeepWork AIChat 的三栏（空间会话栏 + 对话工具链 + 右侧第二大脑面板）一致；第 4 步可直接在聊天流里做裁决。</p>
          </div>
        </div>

        <div class="sim-controls">
          <div class="sim-scenarios" role="group" aria-label="工作台角色场景">
            ${Object.entries(dayRoles).map(([k, rd]) => `
              <button type="button" class="sim-scenario" data-sim-role="${k}" aria-pressed="${k === roleKey ? 'true' : 'false'}">
                <img src="${avatarThumbs[k]}" alt="">
                <span>${esc(rd.label)}</span>
              </button>`).join('')}
          </div>
          <div class="sim-transport">
            <button type="button" id="sim-prev" ${stepIdx <= 0 ? 'disabled' : ''}>上一步</button>
            <button type="button" id="sim-play" class="sim-play">${playing ? '暂停' : '▶ 回放'}</button>
            <button type="button" id="sim-next" ${stepIdx >= beats.length - 1 ? 'disabled' : ''}>下一步</button>
            <button type="button" id="sim-brain-toggle" aria-pressed="${brainOpen ? 'true' : 'false'}">第二大脑面板</button>
            <select id="sim-speed" aria-label="回放速度">
              <option value="2900"${speedMs === 2900 ? ' selected' : ''}>1.0x</option>
              <option value="1800"${speedMs === 1800 ? ' selected' : ''}>1.5x</option>
              <option value="4200"${speedMs === 4200 ? ' selected' : ''}>慢速</option>
            </select>
          </div>
          <div class="sim-progress" role="navigation" aria-label="工作台 7 步进度">
            ${beats.map((_, i) => `<button type="button" data-sim-step="${i}" class="${i < stepIdx ? 'done' : i === stepIdx ? 'current' : ''}" aria-label="第 ${i + 1} 步"><span>${i + 1}</span></button>`).join('')}
          </div>
        </div>

        <div class="sim-device">
          <div class="sim-titlebar">
            <span class="sim-dots"><i></i><i></i><i></i></span>
            <strong>KeepWork AIChat · ${esc(d.label)}工作空间</strong>
            <span class="sim-url">keepwork.com/aichat · 本地 Git 工作区</span>
          </div>

          <div class="sim-shell${brainOpen ? ' sim-brain-open' : ''}">
            <div class="sim-rail" aria-hidden="true">
              <button type="button" class="active" title="对话工作台">💬</button>
              <button type="button" title="知识目录">🧠</button>
              <button type="button" title="分身规则">⚙</button>
              <span class="sim-rail-spacer"></span>
              <img class="sim-rail-avatar" src="${avatarThumbs[roleKey]}" alt="">
            </div>

            <aside class="sim-side" aria-label="当前角色会话列表">
              <div class="sim-side-head">
                <img src="${avatarThumbs[roleKey]}" alt="">
                <div>
                  <strong>${esc(d.label)}主空间</strong>
                  <small>${esc(d.task)}</small>
                </div>
              </div>
              <div class="sim-newchat">+ 新建协同会话</div>
              <div class="sim-sessions">
                ${(d.sessions || []).map((ss, si) => `
                  <div class="sim-session${si === 0 ? ' active' : ''}">
                    <span class="ss-ico">${esc(ss[0])}</span>
                    <div><strong>${esc(ss[1])}</strong><small>${esc(ss[2])}</small></div>
                  </div>`).join('')}
              </div>
              <div class="sim-side-foot">Git 仓库已挂载 · raw/ 只读</div>
            </aside>

            <div class="sim-main">
              <div class="sim-topbar">
                <img src="${avatarThumbs[roleKey]}" alt="">
                <div class="sim-persona">
                  <strong>主分身（调度 ${esc(d.agents.join(' + '))}）</strong>
                  <small><span class="sim-brain-chip">已连 第二大脑</span> <span>受众：${esc(d.audience)}</span></small>
                </div>
                <div class="sim-top-actions"><span>本地工作区在线</span></div>
              </div>

              <div class="sim-chat" id="sim-chat">
                ${beat.messages.map((m) => `
                  <div class="sim-msg ${m.role}">
                    ${m.role === 'user'
                      ? `<img class="sim-avatar" src="${avatarThumbs[roleKey]}" alt="">`
                      : `<span class="sim-avatar ai" aria-hidden="true">AI</span>`}
                    <div class="sim-bubble">${m.html}</div>
                  </div>`).join('')}
                ${beat.choice ? `
                  <div class="sim-choice" id="sim-choice-box">
                    <h4>⚖ 需要你拍板（${esc(d.label)}）：怎么写这份结论？</h4>
                    ${d.options.map((opt, oi) => `<button type="button" data-sim-opt="${oi}">${esc(opt)}</button>`).join('')}
                    <p class="sim-choice-fb" id="sim-choice-fb"></p>
                  </div>` : ''}
              </div>

              <div class="sim-composer">
                <div class="sim-composer-box">
                  <div class="sim-composer-input${beat.composer ? '' : ' placeholder'}">${esc(beat.composer || '输入下一步指示，或引用 //.brain/ 目录文件…')}</div>
                  <div class="sim-composer-bar">
                    <span class="sim-src">📎 @raw/ (${d.sources.length} 份)</span>
                    <span class="sim-model">主分身 · 双路互查</span>
                    <button type="button" class="sim-send" aria-label="发送指示">↑</button>
                  </div>
                </div>
              </div>
            </div>

            <aside class="sim-brain" aria-label="第二大脑实时面板">
              <div class="sim-brain-head">
                <strong>第二大脑图谱</strong>
                <span class="sim-brain-tag">Git+MD</span>
                <button type="button" class="sim-brain-close" id="sim-brain-close" aria-label="收起第二大脑面板">✕</button>
              </div>
              <div class="sim-brain-graph">
                <svg viewBox="0 0 220 96" aria-hidden="true">
                  <line x1="36" y1="48" x2="90" y2="24" stroke="#cbd5e1" stroke-width="1.5"/>
                  <line x1="90" y1="24" x2="152" y2="30" stroke="#cbd5e1" stroke-width="1.5"/>
                  <line x1="90" y1="24" x2="132" y2="72" stroke="#cbd5e1" stroke-width="1.5"/>
                  <line x1="152" y1="30" x2="188" y2="62" stroke="#cbd5e1" stroke-width="1.5"/>
                  ${[
                    [36, 48, 'raw'],
                    [90, 24, 'wiki'],
                    [152, 30, '压测'],
                    [188, 62, 'RSI']
                  ].map(([cx, cy, label], ni) => `
                    <g class="sim-bg-node${(beat.litNodes || []).includes(ni) ? ' lit' : ''}">
                      <circle cx="${cx}" cy="${cy}" r="14" fill="#eef0f6" stroke="#c3c8d8"/>
                      <text x="${cx}" y="${cy + 3}" text-anchor="middle">${label}</text>
                    </g>`).join('')}
                </svg>
              </div>
              <div class="sim-brain-files">
                ${(beat.brainFiles || []).length
                  ? beat.brainFiles.map((f) => `<div class="sim-brain-file ${f.state}"><strong>${f.state === 'new' ? '✨ ' : '📄 '}${esc(f.name)}</strong><small>${esc(f.note)}</small></div>`).join('')
                  : `<div class="sim-brain-file"><strong>⏳ 等待挂载资料</strong><small>下一步将只读检索 raw/ 来源文件</small></div>`}
              </div>
            </aside>
          </div>

          <div class="sim-narration">
            <span class="sim-narr-num">${stepIdx + 1}</span>
            <div>
              <strong>${esc(beat.stage)} <span class="sim-stage-tag">${stepIdx + 1} / ${beats.length}</span></strong>
              <p>${esc(beat.narr)}</p>
            </div>
          </div>
        </div>

        <div class="sim-handoff-bar">
          <p>看完「<b>${esc(d.label)}</b>」这 7 步走法后，直接把它的委托、双分身分工、RSI 规则与盲测标准带进下方四步任务卡，改成你自己的真实题目：</p>
          <button type="button" id="sim-to-practice" class="primary">把这一套填进下方任务卡 →</button>
        </div>
      </div>`;

    mount.querySelectorAll('[data-sim-role]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextRole = btn.dataset.simRole;
        playing = false;
        clearTimer();
        roleKey = nextRole;
        stepIdx = 0;
        window.setCourseRole?.(nextRole, 'sim');
        render();
      });
    });

    mount.querySelector('#sim-prev')?.addEventListener('click', () => {
      playing = false;
      clearTimer();
      stepIdx = Math.max(0, stepIdx - 1);
      render();
    });

    mount.querySelector('#sim-next')?.addEventListener('click', () => {
      playing = false;
      clearTimer();
      stepIdx = Math.min(beats.length - 1, stepIdx + 1);
      render();
    });

    mount.querySelector('#sim-play')?.addEventListener('click', () => {
      playing = !playing;
      if (playing && stepIdx >= beats.length - 1) stepIdx = 0;
      render();
      scheduleNext(beats.length);
    });

    mount.querySelector('#sim-brain-toggle')?.addEventListener('click', () => {
      brainOpen = !brainOpen;
      render();
    });

    mount.querySelector('#sim-brain-close')?.addEventListener('click', () => {
      brainOpen = false;
      render();
    });

    mount.querySelector('#sim-speed')?.addEventListener('change', (e) => {
      speedMs = Number(e.target.value) || 2900;
      if (playing) scheduleNext(beats.length);
    });

    mount.querySelectorAll('[data-sim-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        playing = false;
        clearTimer();
        stepIdx = Number(btn.dataset.simStep) || 0;
        render();
      });
    });

    mount.querySelectorAll('[data-sim-opt]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const oi = Number(btn.dataset.simOpt);
        const fb = mount.querySelector('#sim-choice-fb');
        mount.querySelectorAll('[data-sim-opt]').forEach((other, idx) => {
          other.classList.remove('correct', 'wrong');
          if (idx === oi) other.classList.add(oi === d.correct ? 'correct' : 'wrong');
        });
        if (fb) {
          fb.className = `sim-choice-fb ${oi === d.correct ? 'ok' : 'no'}`;
          fb.textContent = oi === d.correct ? `✓ 判断正确：${d.why}` : `⚠ 这会越界：${d.why}`;
        }
      });
    });

    mount.querySelector('#sim-to-practice')?.addEventListener('click', () => {
      playing = false;
      clearTimer();
      window.applyRoleExampleToPractice?.(roleKey);
      document.getElementById('practice')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    });
  }

  function scheduleNext(total) {
    clearTimer();
    if (!playing) return;
    if (stepIdx >= total - 1) {
      playing = false;
      render();
      return;
    }
    timer = window.setTimeout(() => {
      stepIdx += 1;
      render();
      scheduleNext(total);
    }, speedMs);
  }

  window.addEventListener('courserolechange', (event) => {
    const r = event.detail?.role;
    if (!r || !Object.hasOwn(dayRoles, r) || r === roleKey) return;
    roleKey = r;
    stepIdx = 0;
    playing = false;
    clearTimer();
    render();
  });

  render();

  function esc(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }
})();
