/* 第 4 课：超级个体 → 超级团队 → 超级公司、AI 原生原则、WorkBuddy 对照、CAIO/FDE 与首次诊断六问 */
(() => {
  const { el, bindCopyButton, createCheckpointCard } = window.CourseUI || {};
  const mount = document.getElementById('org');
  if (!mount || !el || typeof dayRoles === 'undefined') return;

  const evoStages = [
    {
      ico: '🧑💻',
      title: '超级个体',
      short: '一人多分身 · 管住个人第二大脑',
      detail: '<b>起点：</b>一个人通过 Git + Markdown 第二大脑和双分身压测，把口头想法变成可核验的知识页、任务卡与自动化检查规则。'
    },
    {
      ico: '🤝',
      title: '超级团队',
      short: '多个人脑交汇 · 组织脑单源事实',
      detail: '<b>跃迁：</b>团队公共规程、项目材料和 CRM 记录留在组织脑（单源真相），成员个人工作记忆各自独立、按圈子授权按需回流（brain-sync）。'
    },
    {
      ico: '🏢',
      title: '超级公司 / 网络',
      short: '小核心 + 可复用分身节点协同',
      detail: '<b>演进方向（试点与推演并存）：</b>核心人数保持精简，把大量重复调研、核查、客服与交付前哨拆成可跨圈层协作的数字分身服务。'
    }
  ];

  const diagnosticLabels = [
    ['action', '1. 高频核心动作：哪一件每周重复做的事最值得先做试点？'],
    ['sources', '2. 可控事实源：原始材料从哪来？（raw/ 放哪些文档或记录）'],
    ['risk', '3. 最大失误红线：哪一步绝不允许 AI 替人拍板或瞎编？'],
    ['baseline', '4. 验收人与旧耗时：谁来验收？原来人工做一次要多久？'],
    ['owner', '5. 责任边界：谁维护组织知识页，谁在个人分支试跑？'],
    ['validation', '6. 通过标准：怎样算这第一张一页试点跑通了？']
  ];

  let roleKey = (window.getCourseRole && window.getCourseRole()) || 'student';

  function buildDiagnosticText(values, d) {
    return `# 首个第二大脑试点 · 一页诊断卡（${d.label}视角）
- 高频动作：${values.action || '（待补充）'}
- 可控来源：${values.sources || '（待补充）'}
- 红线边界：${values.risk || '（待补充）'}
- 验收基准：${values.baseline || '（待补充）'}
- 维护分工：${values.owner || '（待补充）'}
- 通过标准：${values.validation || '（待补充）'}`;
  }

  mount.innerHTML = `
    <section class="idea" aria-label="超级组织、信任网络与组织交付">
      <div class="idea-block">
        <p class="idea-kicker"><b>4.1</b> 组织跃迁 · PRINCIPLES &amp; CIRCLES</p>
        <h2>从<em>超级个体</em>到<em>超级公司</em>：岗位组织 vs 圈子组织</h2>
        <p class="idea-sub">当工具从“帮你写一段话”变成“记住整个项目的依据并并行核查”，组织协作的最小单元也会跟着变化。</p>
        <div class="idea-card">
          <div class="org-evolution" id="org-evo" role="group" aria-label="组织演进三阶段"></div>
          <div class="org-detail" id="org-evo-detail"></div>

          <div class="org-vs" style="margin-top:14px">
            <div class="ov-old">
              <h4>传统岗位制组织（易卡点）</h4>
              <ul>
                <li>经验锁在个人聊天记录与微信零碎文件里，人走知识断层。</li>
                <li>每次接力靠口头对齐，下家分不清“已验证事实”与“临时猜测”。</li>
                <li>每扩张业务就要线性招更多手写协调的人。</li>
              </ul>
            </div>
            <div class="ov-new">
              <h4>AI 原生圈子组织（方向与原则）</h4>
              <ul>
                <li>知识留在版本化目录：项目共有进组织脑，个人草稿留个人脑。</li>
                <li>跨圈子合作只交接带出处、带红线的可执行任务卡。</li>
                <li>个人核心靠多路分身把单点深度拉高，而非靠堆人头传话。</li>
              </ul>
            </div>
          </div>

          <div class="ops-principles">
            <div class="principle-card">
              <h4>主分身 vs 子分身（.agents/ &amp; &amp; /协作） <span class="ep-badge shipped">已实现</span></h4>
              <p>你只管面向单一主分身入口委托目标；需要起草、挑刺或专门工具时，由主分身按 <code>.agents/</code> 规范触发子分身并通过 <code>&amp;</code> 昵称或 <code>/协作</code> 协同完成。</p>
            </div>
            <div class="principle-card">
              <h4>朋友圈 ≠ 工作台 <span class="ep-badge shipped">已实现</span></h4>
              <p>个人第二大脑默认只对本人透明可控；外部群聊或跨成员协作只通过圈子授权视图暴露必要卡片，避免私密试错和敏感材料外泄。</p>
            </div>
            <div class="principle-card">
              <h4>智能密度 &amp; 3–10 篇 CLI + Skills <span class="ep-badge shipped">已实现</span></h4>
              <p>不要写一万字大而无当的系统提示。把高频操作浓缩进 3–10 个经测试的 CLI 工具与简洁 Skill 说明书，让模型把算力花在真核查上。</p>
            </div>
            <div class="principle-card">
              <h4>Stress Test Agent（对抗压测分身） <span class="ep-badge pilot">试点方法</span></h4>
              <p>对外输出重大报价、合同建议、教案或实验结论前，固定跑一轮只负责找反例与算术漏洞的压测分身，问题摆到人前再发。</p>
            </div>
          </div>
        </div>
      </div>

      <div class="idea-block">
        <p class="idea-kicker"><b>4.2</b> 信任网络 · CREDIBILITY</p>
        <h2>跨组织分身与可审计信任网络 <span class="ep-badge pilot">当前状态混合：已实现 + 试点推演</span></h2>
        <p class="idea-sub">未来和陌生同行合作，不只是互加微信问一句“靠谱吗”，而是按权限先校验对方留痕过的功能卡、案例出处与边界声明。</p>
        <div class="trust-grid">
          <div class="trust-item">
            <strong>目录与权限隔离（Git + KeepWork 圈子） <span class="ep-badge shipped">已实现</span></strong>
            <span>第二大脑放在可控仓与权限圈子里：谁改了哪一页、引用哪份 <code>raw/</code> 文档，全部可回溯不靠口说。</span>
          </div>
          <div class="trust-item">
            <strong>keepwork-crm 组织客情与项目脑 <span class="ep-badge pilot">试点实践</span></strong>
            <span>把线索沟通记录、需求约束、试跑指标统合进结构化客户档案页，交接给下一位 FDE 或交付同学时不再从零问起。</span>
          </div>
          <div class="trust-item">
            <strong>分身先核对契约再邀约人工 <span class="ep-badge pilot">试点方法</span></strong>
            <span>双方对接分身先互查预算红线、输入材料齐备度与盲测验收指标，把无谓来回沟通降到正式拍板前。</span>
          </div>
          <div class="trust-item">
            <strong>“招募可信分身节点”组织形态（2027–2036） <span class="ep-badge vision">远期推演</span></strong>
            <span>从聘请全职传话岗位，逐步演化到按任务契约接入经过长期检验的外部个人/机构分身节点。</span>
          </div>
        </div>
      </div>

      <div class="idea-block">
        <p class="idea-kicker"><b>4.3</b> 工具边界与服务路径 · WORKBUDDY &amp; CAIO / FDE</p>
        <h2>WorkBuddy 桌面助手 vs KeepWork 组织脑，及两种落地角色</h2>
        <div class="delivery-duo">
          <div class="wb-box">
            <h4>WorkBuddy 桌面工作台 <span class="ep-badge shipped">个人桌边效率</span></h4>
            <p>适合个人日常快速调起文档、邮件、即时灵感处理，是贴身的个人生产力桌面侧翼，重在“随手快”。</p>
          </div>
          <div class="wb-box kw">
            <h4>KeepWork 组织脑 &amp; AIChat <span class="ep-badge shipped">组织复利底座</span></h4>
            <p>承担 <code>raw/ + _wiki/ + .agents/</code> 团队单源事实库、成员 <code>fork brain / brain-sync</code> 与圈子权限边界，重在“跨人交接不断档”。</p>
          </div>
        </div>

        <div class="caio-card">
          <div class="caio-left">
            <span class="cl-badge">ROLE · 首席 AI 官（CAIO）伴跑构想</span>
            <h3>首席 AI 官 + 驻场工程师</h3>
            <p>很多中小团队并不缺“工具软件”，而是缺一位能用 6 周帮助团队建立组织第二大脑、培训首批内部骨干并守住红线的人。</p>
            <p class="cl-quote">重要披露：下方价格仅作课程中的口述业务假设示范（非官网标准报价），请按实际试点工时谈契约。</p>
          </div>
          <div class="caio-right">
            <h4>CAIO 服务形态拆解 <span class="ep-badge vision">定价假设·口述口径</span></h4>
            <div class="caio-steps">
              <div class="caio-step">
                <b>1</b>
                <div><strong>轻顾问 / 诊断陪跑（假设参考约 1,000 元/月档）</strong><span>每月固定复盘核心工作卡、Lint 检查组织脑漏洞，帮负责人挑首个可试点环节。</span></div>
              </div>
              <div class="caio-step">
                <b>2</b>
                <div><strong>专职辅助建脑（假设参考 5,000–20,000 元/月档）</strong><span>代梳理高频 SOP 成 <code>_wiki/</code> 与测试分身，建立周度 RSI 更新节奏并带出内部接班人。</span></div>
              </div>
            </div>
            <p class="caio-note">判断标准：不要为“概念”付费，要盯住一个月后团队成员是否真的能脱离顾问自己维护和盲测卡片。</p>
          </div>
        </div>

        <div class="fde-steps">
          <div class="fde-step">
            <h4>FDE 第 1 步：摸底入脑 <span class="ep-badge pilot">现场工程试点</span></h4>
            <p>用下方“首次诊断六问”锁定单一高痛点动作，收集 5–10 份真材料进 <code>raw/</code> 并确定人工验收基准。</p>
          </div>
          <div class="fde-step">
            <h4>FDE 第 2 步：双分身跑通</h4>
            <p>做出可复用的任务卡与压测校验规则，让团队原本从零干的 45 分钟环节先稳定缩成可控复审。</p>
          </div>
          <div class="fde-step">
            <h4>FDE 第 3 步：fork 交接撤出</h4>
            <p>把组织脑与 <code>brain-sync</code> 交回给内部负责同学，用陌生同事盲测过关作为结项标准。</p>
          </div>
        </div>
      </div>

      <div class="idea-block">
        <p class="idea-kicker"><b>4.4</b> 交互式工具 · SIX-QUESTION DIAGNOSTIC</p>
        <h2>首次诊断六问 · 一页试点卡生成器</h2>
        <p class="idea-sub">带学生社团、教研组、部门或客户启动首个试点前，先填清这 6 个问题；填完可直接复制，或一键同步回第 3 课任务卡第 ④ 步。</p>
        <div class="idea-card">
          <div class="toolbar" style="margin-top:0">
            <button type="button" id="diag-fill-role">按当前视角填入模板</button>
            <span class="wiki-role-chip" id="diag-role-chip">当前视角：学生</span>
          </div>
          <div class="diag-grid" id="diag-grid">
            ${diagnosticLabels.map(([name, label]) => `
              <label>${label}
                <input type="text" name="diag_${name}" id="diag-${name}" placeholder="点击填写或上方一键预填示例">
              </label>`).join('')}
          </div>
          <pre id="diag-output" class="diag-output" aria-label="生成的一页试点诊断卡预览"></pre>
          <div class="copy-row">
            <button type="button" id="diag-copy" class="copy-btn">复制一页试点诊断卡</button>
            <button type="button" id="diag-to-practice" class="primary">写入第 3 课任务卡第 ④ 步 →</button>
            <span id="diag-copy-fb" class="status-inline" role="status" aria-live="polite"></span>
          </div>
        </div>
      </div>

      <div id="l4-checkpoint"></div>

      <p class="idea-boundary">
        <strong>认识论边界声明：</strong>
        本课程刻意区分三类信息——
        ① <b>已实现（shipped）</b>：单人/小团队离线用 Git + Markdown 第二大脑、第 3 课工作台任务卡与 <code>.md</code> 导出、<code>.agents/</code> 与 <code>/协作</code> 分身规则；
        ② <b>试点方法（pilot）</b>：<code>keepwork-crm</code> 组织跟进、跨团队 <code>fork brain / brain-sync</code> 与 FDE 三步介入；
        ③ <b>远期推演/假设（vision）</b>：CAIO 月费区间、2027–2036 跨组织分身招募网络推演。请根据你自己的真实环境取舍落地。
      </p>
    </section>`;

  const evoWrap = mount.querySelector('#org-evo');
  const evoDetail = mount.querySelector('#org-evo-detail');
  function selectEvo(idx) {
    const s = evoStages[idx] || evoStages[0];
    evoWrap.querySelectorAll('.org-stage').forEach((b, bi) => b.setAttribute('aria-pressed', bi === idx ? 'true' : 'false'));
    evoDetail.innerHTML = `${s.detail}<small>点击上方不同规模节点，查看组织记忆与分身边界怎么变化。</small>`;
  }
  evoStages.forEach((s, i) => {
    if (i > 0) evoWrap.appendChild(el('span', { className: 'org-arrow', 'aria-hidden': 'true', textContent: '→' }));
    const btn = el('button', { type: 'button', className: 'org-stage', 'aria-pressed': i === 0 ? 'true' : 'false' });
    btn.innerHTML = `<span class="os-ico">${s.ico}</span><h3>${s.title}</h3><p>${s.short}</p>`;
    btn.addEventListener('click', () => selectEvo(i));
    evoWrap.appendChild(btn);
  });
  selectEvo(0);

  const diagInputs = Object.fromEntries(diagnosticLabels.map(([k]) => [k, mount.querySelector(`#diag-${k}`)]));
  const diagOutput = mount.querySelector('#diag-output');
  const diagRoleChip = mount.querySelector('#diag-role-chip');
  const diagFillBtn = mount.querySelector('#diag-fill-role');
  const diagCopyBtn = mount.querySelector('#diag-copy');
  const diagCopyFb = mount.querySelector('#diag-copy-fb');
  const diagToPracticeBtn = mount.querySelector('#diag-to-practice');

  function currentDiagValues() {
    const out = {};
    for (const [k, inp] of Object.entries(diagInputs)) out[k] = inp?.value?.trim() || '';
    return out;
  }

  function refreshDiagnosticPreview() {
    const d = dayRoles[roleKey] || dayRoles.student;
    if (diagRoleChip) diagRoleChip.textContent = `当前视角：${d.label}`;
    if (diagOutput) diagOutput.textContent = buildDiagnosticText(currentDiagValues(), d);
  }

  function fillDiagnosticFromRole(targetRole) {
    const r = Object.hasOwn(dayRoles, targetRole) ? targetRole : 'student';
    roleKey = r;
    const sample = dayRoles[r].diagnosticSample || {};
    for (const [k, inp] of Object.entries(diagInputs)) {
      if (inp) inp.value = sample[k] || '';
    }
    refreshDiagnosticPreview();
  }

  Object.values(diagInputs).forEach((inp) => {
    inp?.addEventListener('input', refreshDiagnosticPreview);
  });

  diagFillBtn?.addEventListener('click', () => fillDiagnosticFromRole(roleKey));

  if (bindCopyButton && diagCopyBtn) {
    bindCopyButton(diagCopyBtn, () => diagOutput?.textContent || '', diagCopyFb, '复制一页试点诊断卡');
  }

  diagToPracticeBtn?.addEventListener('click', () => {
    const txt = diagOutput?.textContent || '';
    window.syncPilotDiagnostic?.(txt, roleKey);
  });

  mount.querySelector('#l4-checkpoint').appendChild(
    createCheckpointCard({
      title: '4.5 第 4 课自检：给团队或客户启动首个 AI 分身试点，第一步先定什么？',
      prompt: '对照本课介绍的 FDE 工程方法与首次诊断六问，哪种开局方式最稳？',
      options: [
        'A. 用诊断六问锁定一件高频痛点，备好 5–10 份真材料进 raw/、标出禁编红线与旧耗时基准，让盲测同事独立跑通一遍。',
        'B. 先不看原有材料和验收标准，一次性把公司全部流程全换成自由对话机器人。',
        'C. 只追求做一份看起来很炫的 PPT 报价，不需要组织知识页和人工核验。'
      ],
      correct: 0,
      explain: '先把单点场景的材料、红线、验收人和耗时基准框死，跑通第一个可复用的卡片，才能稳定复制。'
    })
  );

  fillDiagnosticFromRole(roleKey);

  window.addEventListener('courserolechange', (event) => {
    const r = event.detail?.role;
    if (!r || !Object.hasOwn(dayRoles, r) || r === roleKey) return;
    fillDiagnosticFromRole(r);
  });
})();
