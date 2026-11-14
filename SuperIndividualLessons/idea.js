/* 第 1 课 1.2-1.4（理念与 3+1 成长路径） + 第 2 课（Git+Markdown 第二大脑、RAG 对比、四动作与建脑闭环） */
(() => {
  const { el, initTablist, createCheckpointCard } = window.CourseUI || {};
  const individualMount = document.getElementById('idea-individual');
  const brainMount = document.getElementById('idea-brain');
  if (!el || typeof dayRoles === 'undefined') return;

  const stagesData = [
    {
      num: '能力 1',
      title: '口喷时代 · 临场即兴问答',
      pain: '痛点：次次像重新雇新人',
      gain: '起步：先敢开口拆问题',
      img: 'assets/stage-1-voice.webp',
      alt: '口喷时代示意图：零散口述想法等待整理',
      detail: '靠临时聊天碰运气，说完就散。AI 不知道你的读者、手头证据和历史教训，每次打开窗口都得重讲一遍背景。'
    },
    {
      num: '能力 2',
      title: '燃烧 Token · 长上下文堆料',
      pain: '痛点：费钱且跨天易失真',
      gain: '进步：开始附带原始文档',
      img: 'assets/stage-2-tokens.webp',
      alt: '燃烧 Token 阶段示意图：海量长上下文堆积但缺秩序',
      detail: '把整本教材、长会议纪要一次贴给 AI，单次好用了不少，但缺少持久化结构与检验规则，换个会话还是容易漏前提或互相打架。'
    },
    {
      num: '能力 3',
      title: '建脑 RSI · 一人多分身',
      pain: '关键跃迁：经验沉淀进文件',
      gain: '效果：越用越稳可交接',
      img: 'assets/stage-3-brain.webp',
      alt: '第二大脑建脑与分身协同示意图',
      detail: '用 Git + Markdown 维护第二大脑（raw/ 放事实，_wiki/ 写聚合页），在 .agents/ 里区分执行分身与质疑分身；每次纠错后通过 RSI 写回规则，形成复利。'
    },
    {
      num: '商业检验',
      title: 'AI Native 产品与持续盈利',
      pain: '检验标准：外人愿不愿持续用',
      gain: '闭环：知识变成可复制服务',
      img: 'assets/stage-4-product.webp',
      alt: 'AI Native 产品交付与长期复利示意图',
      detail: '能力是否真正过关，不止看“自己省了多少时间”，还要看能否变成社团工具、标准化教案或客户订阅的微产品并持续交付收益。'
    }
  ];

  const opsData = [
    {
      key: 'ingest',
      title: 'Ingest 摄取',
      sub: '只录真事进 raw/，再更新词条',
      detail: '新材料先原样存进 raw/ 并标日期与来源，再由分身判断是否需要更新 _wiki/ 中的主题页或项目页。记住：一份新资料不等于新建一个词条文件。'
    },
    {
      key: 'query',
      title: 'Query 查询',
      sub: '先读 index.md 定位，再下判断',
      detail: '提问时不再盲猜向量块，而是先翻 _wiki/index.md 的摘要目录，按 [[wikilink]] 追踪关联页面，并只对明确覆盖到的事实做结论。'
    },
    {
      key: 'lint',
      title: 'Lint 巡检',
      sub: '查断链、陈旧结论与前后矛盾',
      detail: '定期让巡检分身检查：有没有过时草稿当成定论？有没有两条来源打架却未标 `> [!warning] Contradiction`？发现即标注，不悄悄掩盖。'
    },
    {
      key: 'rsi',
      title: 'RSI 自改进',
      sub: '把“这次踩的坑”写成下次规则',
      detail: '一次任务被用户打回或同伴复测失败时，不只改当前结果，而是把拦截条件写进 AGENTS.md、.agents/ 提示或检验清单，下次自动防错。'
    }
  ];

  const loopNodes = [
    {
      id: 0,
      title: '① 素材收集（raw/）',
      who: '人收集约束 + 原始文件入库',
      desc: '把笔记、录音转写、合同约束、课堂记录留在只读 raw/，标明出处与日期，作为后续一切核验的底层凭证。',
      x: 190,
      y: 66
    },
    {
      id: 1,
      title: '② 知识整理与合并（_wiki/）',
      who: 'AI 主整理 + 人审计关键页',
      desc: '按主题/项目归并进 _wiki/*.md，更新 index.md 目录与 log.md 流水；出现分歧时并列保留两方来源，不强行二选一。',
      x: 314,
      y: 190
    },
    {
      id: 2,
      title: '③ 分身并行工作（.agents/）',
      who: '主分身委托 + 质疑分身压测',
      desc: '写清读者与边界红线后，一个分身负责产出草案，另一个分身对照 raw/ 与 _wiki/ 专门挑缺口、反例和算术错误。',
      x: 190,
      y: 314
    },
    {
      id: 3,
      title: '④ 检验与 RSI 回流（Lint）',
      who: '盲测反馈 → 修订规则与词条',
      desc: '经过外人盲测或真实试跑后，把有效模板固化进 Skill / 检查规则，把无效或变化了的边界更新回 _wiki/，进入下一轮。',
      x: 66,
      y: 190
    }
  ];

  function renderLesson1Idea() {
    if (!individualMount) return;
    individualMount.innerHTML = `
      <section class="idea" id="idea-individual-sec" aria-label="超级个体核心定义与成长路径">
        <div class="idea-block">
          <p class="idea-kicker"><b>1.2</b> 核心定义 · CARBON + SILICON</p>
          <h2>碳基 + 硅基：<em>一人多分身</em>，对自己透明、对圈子有边界</h2>
          <p class="idea-sub">所谓“超级个体”，不是什么都自己手搓，也不是把方向权交给黑箱，而是把个人判断力放进可控的数字分身网络。</p>
          <div class="idea-card">
            <div class="fusion">
              <div class="fusion-side fusion-carbon">
                <p class="fusion-tag">CARBON · 碳基核心（人）</p>
                <h3>定方向 · 划红线 · 做最终裁决</h3>
                <ul>
                  <li>定义真正想服务的人与可检验目标</li>
                  <li>识别哪些材料可靠、哪些矛盾暂不能下结论</li>
                  <li>承担真实责任与外部盲测反馈</li>
                </ul>
              </div>
              <div class="fusion-plus" aria-hidden="true">+</div>
              <div class="fusion-side fusion-silicon">
                <p class="fusion-tag">SILICON · 硅基阵列（AI 分身）</p>
                <h3>并行执行 · 反方质询 · 持久记忆</h3>
                <ul>
                  <li>阅读数百页 Git + Markdown 原文并定位出处</li>
                  <li>拆出“起草分身”与“挑刺分身”互相压测</li>
                  <li>按规则把踩坑经验写回第二大脑目录</li>
                </ul>
              </div>
            </div>
            <div class="fusion-result">
              <strong>= 一人多分身团队</strong>
              <span>你的每个常规身份（学生/老师/部门/创业）都可以有独立记忆体与专业角色：</span>
              <div class="fusion-avatars">
                <span class="fusion-avatar"><i>主</i>统筹主分身</span>
                <span class="fusion-avatar"><i>查</i>证据核验分身</span>
                <span class="fusion-avatar"><i>写</i>对外交接分身</span>
                <span class="fusion-avatar"><i>巡</i>Lint 巡检分身</span>
              </div>
            </div>
            <div class="fusion-boundary-grid">
              <div class="fusion-boundary-box">
                <strong>对自己透明（可审计、可版本回滚）</strong>
                第二大脑放在本地可见的文件夹 + Git 里：AI 读了哪页、改了哪条、哪两份事实冲突，本人打开就能看到。
              </div>
              <div class="fusion-boundary-box">
                <strong>对外部有边界（圈子分级授权）</strong>
                个人私密工作记忆不等于公开朋友圈；进入学习圈或项目圈协作时，只授权指定知识子集与只读/草稿权限。
              </div>
            </div>
          </div>
        </div>

        <div class="idea-block">
          <p class="idea-kicker"><b>1.3</b> 成长路径 · FOUR STAGES</p>
          <h2><em>3 个能力阶段 + 1 个商业检验</em>：别停在“烧 Token”</h2>
          <p class="idea-sub">点击下方 4 张卡片对照你目前的阶段：能力提升主要靠第 1→3 阶的建脑与 RSI，是否跑通价值还要接受第 4 项外人检验。</p>
          <div class="idea-card">
            <div id="stages-grid" class="stages" role="group" aria-label="超级个体成长阶段"></div>
            <figure id="stage-figure" class="stage-figure">
              <img id="stage-img" src="assets/stage-1-voice.webp" alt="">
              <figcaption>
                <strong id="stage-fig-title"></strong>
                <span id="stage-fig-desc"></span>
                <small id="stage-fig-meta"></small>
              </figcaption>
            </figure>
          </div>
        </div>

        <div id="l1-checkpoint"></div>
      </section>`;

    const stagesGrid = individualMount.querySelector('#stages-grid');
    const stageFig = individualMount.querySelector('#stage-figure');
    const stageImg = individualMount.querySelector('#stage-img');
    const stageTitle = individualMount.querySelector('#stage-fig-title');
    const stageDesc = individualMount.querySelector('#stage-fig-desc');
    const stageMeta = individualMount.querySelector('#stage-fig-meta');

    function selectStage(idx) {
      const s = stagesData[idx] || stagesData[0];
      stagesGrid.querySelectorAll('.stage-card').forEach((c, ci) => {
        c.setAttribute('aria-pressed', ci === idx ? 'true' : 'false');
      });
      stageFig.classList.remove('swap');
      void stageFig.offsetWidth;
      stageFig.classList.add('swap');
      stageImg.src = s.img;
      stageImg.alt = s.alt;
      stageTitle.textContent = `${s.num} · ${s.title}`;
      stageDesc.textContent = s.detail;
      stageMeta.textContent = `${s.pain} ｜ ${s.gain}`;
    }

    stagesData.forEach((s, i) => {
      const btn = el('button', { type: 'button', className: 'stage-card', 'aria-pressed': i === 0 ? 'true' : 'false' });
      btn.innerHTML = `
        <span class="stage-num">${s.num}</span>
        <h3>${s.title}</h3>
        <span class="stage-pain">${s.pain}</span>
        <span class="stage-gain">${s.gain}</span>`;
      btn.addEventListener('click', () => selectStage(i));
      stagesGrid.appendChild(btn);
    });
    selectStage(0);

    individualMount.querySelector('#l1-checkpoint').appendChild(
      createCheckpointCard({
        title: '1.4 第 1 课自检：为什么进入第 3 阶段后不能只靠“越聊越长”？',
        prompt: '在 LiXizhiDocs 第二大脑实践中，为什么单次把几万字资料丢进一个超长窗口仍不稳定？',
        options: [
          'A. 因为单次对话缺持久化知识页与独立质疑/检验规则，换天或遇冲突事实仍会忘前提或顺口脑补。',
          'B. 因为大模型一次只能读取几十个字，必须每次重打一遍所有问题。',
          'C. 因为只有把所有公司机密全公开到朋友圈，AI 才能理解上下文。'
        ],
        correct: 0,
        explain: '真正的分水岭在“文件化沉淀 + 双分身互查 + 规则回流”，而不是一味拉单轮上下文长度。'
      })
    );
  }

  function renderLesson2Brain() {
    if (!brainMount) return;
    brainMount.innerHTML = `
      <section class="idea" id="idea-brain-sec" aria-label="第二大脑目录与运营方法">
        <div class="idea-block">
          <p class="idea-kicker"><b>2.1</b> 结构拆解 · GIT + MARKDOWN</p>
          <h2>一套真正在跑的<em>第二大脑</em>里放什么？</h2>
          <p class="idea-sub">不神秘、不绑定专有软件：就是一个普通文件夹加 Git 版本历史。切换不同标签，看它如何随着你选择的“视角”长出真实目录。</p>
          <div class="idea-card">
            <div class="wiki-role-note">
              <span>当前演示目录内容已对齐全课角色视角：</span>
              <span class="wiki-role-chip" id="wiki-role-label">学生</span>
            </div>

            <div id="brain-tabs" class="ui-tablist" role="tablist" aria-label="第二大脑四层目录预览">
              <button type="button" role="tab" id="btab-0" aria-selected="true" aria-controls="bpanel-0" tabindex="0">raw/ 原始事实</button>
              <button type="button" role="tab" id="btab-1" aria-selected="false" aria-controls="bpanel-1" tabindex="-1">_wiki/index &amp; log</button>
              <button type="button" role="tab" id="btab-2" aria-selected="false" aria-controls="bpanel-2" tabindex="-1">_wiki/projects/ 词条页</button>
              <button type="button" role="tab" id="btab-3" aria-selected="false" aria-controls="bpanel-3" tabindex="-1">AGENTS.md &amp; Skills</button>
            </div>

            <div id="bpanel-0" class="ui-tabpanel" role="tabpanel" aria-labelledby="btab-0"></div>
            <div id="bpanel-1" class="ui-tabpanel" role="tabpanel" aria-labelledby="btab-1" hidden></div>
            <div id="bpanel-2" class="ui-tabpanel" role="tabpanel" aria-labelledby="btab-2" hidden></div>
            <div id="bpanel-3" class="ui-tabpanel" role="tabpanel" aria-labelledby="btab-3" hidden></div>

            <div class="wiki-scale-bar" aria-label="词条规模治理原则">
              <div class="wiki-scale-item">
                <strong>起步 ~10 篇</strong>
                <span>记住硬规矩：<b>一份资料 ≠ 一个词条</b>。多份原始素材应汇聚到少数清晰主题页。</span>
              </div>
              <div class="wiki-scale-item">
                <strong>成长期 50–100 篇</strong>
                <span>按人/项目/概念归档，依靠 <code>index.md</code> 摘要地图和 <code>[[wikilink]]</code> 横向串联。</span>
              </div>
              <div class="wiki-scale-item">
                <strong>边界 ~200 篇内</strong>
                <span>单库保持约 200 篇以内：优先修订合并旧页，遇矛盾必须双源并列保留而非偷偷重写历史。</span>
              </div>
            </div>
          </div>
        </div>

        <div class="idea-block">
          <p class="idea-kicker"><b>2.2</b> 方式对比 · WHY LLM WIKI</p>
          <h2>对比：<em>裸聊 AI</em> vs <em>纯向量 RAG</em> vs <em>LLM Wiki 第二大脑</em></h2>
          <p class="idea-sub">纯向量 RAG 每次都现切碎块、不攒跨篇综合判断；第二大脑靠提前梳理与持续合并，降低漏背景与硬编风风险。</p>
          <div class="idea-card rag-table-wrap">
            <table class="rag-table">
              <thead>
                <tr>
                  <th>对比维度</th>
                  <th>裸聊 AI（只靠单窗对话）</th>
                  <th>纯向量 RAG（临时检索片段）</th>
                  <th>Git + Markdown LLM Wiki</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>知识是否复利</th>
                  <td>关掉窗口就清零，下月还要重复贴背景</td>
                  <td>只按相似度拼段落，不会把多次结论整合成长页</td>
                  <td class="good">每次任务产出的校验结论写回 <code>_wiki/</code>，越用越厚</td>
                </tr>
                <tr>
                  <th>矛盾事实处理</th>
                  <td>经常顺着用户口吻二选一，掩盖冲突</td>
                  <td>同时召回两段冲突切片却无上下文时间先后</td>
                  <td class="good">用 <code>&gt; [!warning] Contradiction</code> 并列两份出处交给人类定夺</td>
                </tr>
                <tr>
                  <th>幻觉治理能力</th>
                  <td>缺上下文时容易靠语感填补细节</td>
                  <td>片段脱离上下文仍可能拼接误判</td>
                  <td class="good">沿来源路径核验与分身反方检查，减少凭空回答（仍需人审计关键拍板）</td>
                </tr>
                <tr>
                  <th>迁移与团队交接</th>
                  <td>锁在个人聊天记录里，外人看不见推理证据</td>
                  <td>切片在黑箱向量库，新人难以直接翻阅改动</td>
                  <td class="good">纯文本目录可读可 Diff，直接用 Git/KeepWork 共享或 fork</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="idea-block">
          <p class="idea-kicker"><b>2.3</b> 运营闭环 · FOUR OPERATIONS &amp; LOOP</p>
          <h2>日常四动作与建脑四模块循环</h2>
          <p class="idea-sub">点击四项日常动作，或点击下方环图节点，查看一次高质量任务是如何从事实走进可复用规则的。</p>
          <div class="idea-card">
            <div id="ops-grid" class="ops-grid" role="group" aria-label="第二大脑四项日常操作"></div>
            <div id="op-detail" class="op-detail"></div>

            <div class="loop-wrap">
              <svg id="loop-svg" class="loop-svg" viewBox="0 0 380 380" role="img" aria-label="第二大脑四模块循环示意图">
                <circle cx="190" cy="190" r="124" fill="none" stroke="#cbd5c0" stroke-width="2" stroke-dasharray="6 6"/>
                <path d="M190 66 A124 124 0 0 1 314 190" fill="none" stroke="#4c7a3f" stroke-width="2.5"/>
                <path d="M314 190 A124 124 0 0 1 190 314" fill="none" stroke="#4f46e5" stroke-width="2.5"/>
                <path d="M190 314 A124 124 0 0 1 66 190" fill="none" stroke="#4c7a3f" stroke-width="2.5"/>
                <path d="M66 190 A124 124 0 0 1 190 66" fill="none" stroke="#b45309" stroke-width="2.5"/>
                <text x="190" y="186" text-anchor="middle" fill="#23382b" font-size="14" font-weight="700">越用越准</text>
                <text x="190" y="206" text-anchor="middle" fill="#636e60" font-size="11">点四个模块看职责</text>
              </svg>
              <div id="loop-info" class="loop-info"></div>
            </div>
          </div>
        </div>

        <div class="idea-block">
          <p class="idea-kicker"><b>2.4</b> 建脑路径 · TWO STARTING ROUTES</p>
          <h2>个人与组织，两条实用建脑起步路径</h2>
          <div class="paths-compare">
            <div class="path-box">
              <h3>路径 A · 个人与学习者：场景公共脑 → 个人脑</h3>
              <ul>
                <li>先接入经校验的公共学科/领域图谱或课程模板，少从零手写目录。</li>
                <li>把自己的作业草稿、错题、实验照片和纠错规则放进个人 <code>raw/</code> 与 <code>_wiki/</code>。</li>
                <li>每做完一个单元，提炼一条只属于自己的核查规则进 <code>AGENTS.md</code>。</li>
              </ul>
            </div>
            <div class="path-box org-path">
              <h3>路径 B · 团队与客户组织：组织脑 → 成员个人脑（fork / brain-sync）</h3>
              <ul>
                <li>公共规范、SOP 与项目里程碑留在机构组织脑（单源事实，不各自乱拷副本）。</li>
                <li>成员通过 <code>fork brain</code> 拉出个人工作脑处理日常笔记与草稿，再经授权的 <code>brain-sync</code> 回流定稿。</li>
                <li>个人脑里的私人试错笔记不自动泄露进组织公共池，保证边界清楚。</li>
              </ul>
            </div>
          </div>
        </div>

        <div id="l2-checkpoint"></div>
      </section>`;

    const wikiRoleLabel = brainMount.querySelector('#wiki-role-label');
    const brainTabsEl = brainMount.querySelector('#brain-tabs');
    const panelIds = ['bpanel-0', 'bpanel-1', 'bpanel-2', 'bpanel-3'];
    const panelKeys = ['raw', 'index', 'entry', 'skill'];

    function renderBrainPanels(roleKey) {
      const d = dayRoles[roleKey] || dayRoles.student;
      if (wikiRoleLabel) wikiRoleLabel.textContent = `${d.label} · ${d.task}`;
      panelKeys.forEach((pk, idx) => {
        const panel = brainMount.querySelector(`#${panelIds[idx]}`);
        const data = d.brainPreview?.[pk];
        if (!panel || !data) return;
        const treeHtml = (data.tree || [])
          .map((item, li) => `<div class="wiki-tree-item${li === 1 ? ' active' : ''}"><span>${escHtml(item)}</span><span>${li === 1 ? '查看中' : ''}</span></div>`)
          .join('');
        const conflictHtml = data.contradiction
          ? `<div class="wiki-contradiction"><strong>⚠ 冲突保留规则（不掩盖矛盾）：</strong>${escHtml(data.contradiction)}</div>`
          : '';
        panel.innerHTML = `
          <div class="wiki-pane-grid">
            <div>
              <div class="wiki-tree" aria-label="目录结构">${treeHtml}</div>
              <p class="idea-note"><b>这一层负责：</b>${escHtml(data.note)}</p>
            </div>
            <div class="wiki-meta-list">
              <pre class="wiki-code">${escHtml(data.code)}</pre>
              ${conflictHtml}
            </div>
          </div>`;
      });
    }

    initTablist(brainTabsEl, () => panelIds.map((id) => brainMount.querySelector(`#${id}`)));
    renderBrainPanels(window.getCourseRole?.() || 'student');

    const opsGrid = brainMount.querySelector('#ops-grid');
    const opDetail = brainMount.querySelector('#op-detail');
    function selectOp(idx) {
      const op = opsData[idx] || opsData[0];
      opsGrid.querySelectorAll('.op-btn').forEach((b, bi) => b.setAttribute('aria-pressed', bi === idx ? 'true' : 'false'));
      opDetail.innerHTML = `<strong>${escHtml(op.title)}</strong>：${escHtml(op.detail)}`;
    }
    opsData.forEach((op, i) => {
      const btn = el('button', { type: 'button', className: 'op-btn', 'aria-pressed': i === 0 ? 'true' : 'false' });
      btn.innerHTML = `<strong>${op.title}</strong><span>${op.sub}</span>`;
      btn.addEventListener('click', () => selectOp(i));
      opsGrid.appendChild(btn);
    });
    selectOp(0);

    const loopSvg = brainMount.querySelector('#loop-svg');
    const loopInfo = brainMount.querySelector('#loop-info');
    function selectLoop(idx) {
      const n = loopNodes[idx] || loopNodes[0];
      loopSvg.querySelectorAll('.loop-node').forEach((g, gi) => {
        g.classList.toggle('active', gi === idx);
        g.setAttribute('aria-pressed', gi === idx ? 'true' : 'false');
      });
      loopInfo.innerHTML = `
        <h3>${escHtml(n.title)}</h3>
        <p>${escHtml(n.desc)}</p>
        <p class="loop-who">协同分工：${escHtml(n.who)}</p>
        <p class="loop-hint">提示：四步循环并不是一次性做完——每次外人复测挑出的问题，都会直接喂给下一步的 RSI。</p>`;
    }

    loopNodes.forEach((n, i) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', `loop-node${i === 0 ? ' active' : ''}`);
      g.setAttribute('role', 'button');
      g.setAttribute('tabindex', '0');
      g.setAttribute('aria-label', n.title);
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', n.x);
      c.setAttribute('cy', n.y);
      c.setAttribute('r', '42');
      c.setAttribute('fill', '#ffffff');
      c.setAttribute('stroke', '#4c7a3f');
      c.setAttribute('stroke-width', '2.5');
      const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t1.setAttribute('x', n.x);
      t1.setAttribute('y', n.y - 2);
      t1.setAttribute('text-anchor', 'middle');
      t1.textContent = n.title.split('（')[0];
      const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t2.setAttribute('x', n.x);
      t2.setAttribute('y', n.y + 15);
      t2.setAttribute('text-anchor', 'middle');
      t2.setAttribute('class', 'loop-sub');
      t2.textContent = (n.title.split('（')[1] || '').replace('）', '');
      g.append(c, t1, t2);
      g.addEventListener('click', () => selectLoop(i));
      g.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectLoop(i);
        }
      });
      loopSvg.appendChild(g);
    });
    selectLoop(0);

    brainMount.querySelector('#l2-checkpoint').appendChild(
      createCheckpointCard({
        title: '2.5 第 2 课自检：新拿到一份访谈纪要或课堂笔记时该怎么收编？',
        prompt: '在按 Git + Markdown 运营第二大脑时，以下哪一项符合建脑规范？',
        options: [
          'A. 原文档放进 raw/ 留档；然后判断它补充了哪个已有主题页或项目页并更新正文，若与旧口径冲突则保留双来源矛盾标记。',
          'B. 每拿到 1 份 PDF/文档就机械地 1:1 建 1 个独立词条页，旧矛盾直接删掉保留最新一句。',
          'C. 把内容直接丢给单次聊天，让它下次自己再去猜文件夹在哪里。'
        ],
        correct: 0,
        explain: '“一份资料 ≠ 一个词条”，且第二大脑禁止为了表面干净而偷偷覆盖相反证据。'
      })
    );

    window.addEventListener('courserolechange', (event) => {
      if (event.detail?.role) renderBrainPanels(event.detail.role);
    });
  }

  function escHtml(str) {
    return String(str ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  renderLesson1Idea();
  renderLesson2Brain();
})();
