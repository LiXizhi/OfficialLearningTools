/* 第 3 课 3.2：四步任务卡工坊（保持 10 字段、localStorage 与 course.html 宿主缓存契约） */
(() => {
  const { initTablist, bindCopyButton } = window.CourseUI || {};
  const form = document.getElementById('sheet');
  const titleHeading = document.getElementById('sheet-title');
  const tasksSelect = document.getElementById('tasks');
  const exampleBtn = document.getElementById('example');
  const newBtn = document.getElementById('new');
  const doneBtn = document.getElementById('done');
  const downloadBtn = document.getElementById('download');
  const downloadMdBtn = document.getElementById('download-md');
  const statusEl = document.getElementById('task-status');
  const copyWrap = document.getElementById('copy-text');
  const copyPre = document.getElementById('copy-pre');
  const copyBtn = document.getElementById('copy-btn');
  const copyFb = document.getElementById('copy-fb');
  const chipsWrap = document.getElementById('intent-chips');
  const tablistEl = document.getElementById('practice-tabs');
  const stepPrev = document.getElementById('step-prev');
  const stepNext = document.getElementById('step-next');

  if (!form || typeof dayRoles === 'undefined') return;

  const CH = 'aichat.external-tool.v1';
  const prefix = 'super-individual-lessons.task.';
  const fields = ['title', 'brief', 'materials', 'roles', 'decision', 'knowledge', 'agent', 'change', 'review', 'pilot'];

  const fieldStepMap = {
    title: 0,
    brief: 0,
    materials: 0,
    roles: 1,
    decision: 1,
    knowledge: 2,
    agent: 2,
    change: 2,
    review: 2,
    pilot: 3
  };

  const labels = {
    title: '任务标题',
    brief: '给主分身的清晰委托',
    materials: '绑定的真实材料',
    roles: '双分身并行分工',
    decision: '冲突裁决与人工拍板',
    knowledge: '写进 _wiki/ 的知识页',
    agent: '可复用规则 / Skill',
    change: '新增材料或反例',
    review: 'RSI 规则与知识页修订',
    pilot: '盲测交接与试点通过标准'
  };

  let activeStep = 0;
  let dirty = false;
  let currentTask = null;
  let tasks = [];

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function validTask(t) {
    return Boolean(t) &&
      typeof t.id === 'string' &&
      /^[a-f0-9-]{36}$/i.test(t.id) &&
      Object.hasOwn(dayRoles, t.role) &&
      fields.every((f) => typeof t[f] === 'string');
  }

  function emptyTask(roleKey) {
    const r = Object.hasOwn(dayRoles, roleKey) ? roleKey : 'student';
    const base = { id: uuid(), role: r, updatedAt: Date.now() };
    fields.forEach((f) => { base[f] = ''; });
    return base;
  }

  function exampleDataForRole(roleKey) {
    const r = Object.hasOwn(dayRoles, roleKey) ? roleKey : 'student';
    const d = dayRoles[r];
    return {
      title: d.task,
      brief: d.brief,
      materials: d.sources.join('\n'),
      roles: `${d.agents[0]}：${d.pair[0]}\n${d.agents[1]}：${d.pair[1]}`,
      decision: `原风险版本：${d.before}\n人工裁决后：${d.after}（原因：${d.why}）`,
      knowledge: `_wiki/projects/${r}-card.md（整合 ${d.sources.length} 份 raw/ 来源，若来源冲突并列保留，不覆盖原文）`,
      agent: d.rule,
      change: '新增一轮同伴测试或现场补充材料后，核查前提是否仍然成立。',
      review: '把遗漏检查点补写进上述规则，下次启动分身时自动触发防错。',
      pilot: `${d.handoff}\n价值与验收：${d.value}`
    };
  }

  let savedInBrowser = true;
  let latestSave = '';
  let saveTimeout = 0;

  function readLocalTasks() {
    const found = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith(prefix)) continue;
        try {
          const parsed = JSON.parse(localStorage.getItem(k) || 'null');
          if (validTask(parsed)) found.push(parsed);
        } catch { /* skip malformed item */ }
      }
      savedInBrowser = true;
    } catch {
      savedInBrowser = false;
    }
    found.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return found;
  }

  function persistTask(t) {
    if (!validTask(t)) return;
    t.updatedAt = Date.now();
    try {
      localStorage.setItem(prefix + t.id, JSON.stringify(t));
      savedInBrowser = true;
      if (window.CourseWrapper?.embedded) {
        window.CourseWrapper.sendWrapper('tool:cache:set', { key: prefix + t.id, requestId: uuid(), value: t });
      }
    } catch {
      savedInBrowser = false;
      if (window.CourseWrapper?.embedded) {
        latestSave = uuid();
        window.CourseWrapper.sendWrapper('tool:cache:set', { key: prefix + t.id, requestId: latestSave, value: t });
        if (statusEl) statusEl.textContent = '正在同步保存任务卡…';
        window.clearTimeout(saveTimeout);
        saveTimeout = window.setTimeout(() => {
          if (latestSave && statusEl) statusEl.textContent = '当前窗口尚未确认保存，可直接下载任务卡。';
        }, 2200);
      }
    }
  }

  const tabCtrl = initTablist
    ? initTablist(
        tablistEl,
        () => ['ppanel-0', 'ppanel-1', 'ppanel-2', 'ppanel-3'].map((id) => document.getElementById(id)),
        (idx) => {
          activeStep = idx;
          if (stepPrev) stepPrev.disabled = idx <= 0;
          if (stepNext) stepNext.disabled = idx >= 3;
        }
      )
    : { activate() {} };

  stepPrev?.addEventListener('click', () => tabCtrl.activate(Math.max(0, activeStep - 1), false));
  stepNext?.addEventListener('click', () => tabCtrl.activate(Math.min(3, activeStep + 1), false));

  function renderSelect() {
    if (!tasksSelect) return;
    tasksSelect.innerHTML = '';
    tasks.forEach((t, idx) => {
      const opt = document.createElement('option');
      opt.value = t.id;
      const roleName = dayRoles[t.role]?.label || t.role;
      opt.textContent = `${idx + 1}. [${roleName}] ${t.title.trim() || '未命名任务卡'}`;
      if (currentTask && t.id === currentTask.id) opt.selected = true;
      tasksSelect.appendChild(opt);
    });
  }

  function renderChips(roleKey) {
    if (!chipsWrap) return;
    const d = dayRoles[roleKey] || dayRoles.student;
    const chips = d.intentChips || [];
    chipsWrap.innerHTML = '';
    if (!chips.length) return;
    const lead = document.createElement('span');
    lead.textContent = `点选补充（${d.label}）：`;
    chipsWrap.appendChild(lead);
    chips.forEach((text) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = `+ ${text.split('：')[0]}`;
      b.title = text;
      b.addEventListener('click', () => {
        const briefEl = form.elements.brief;
        if (!briefEl) return;
        const val = briefEl.value.trim();
        if (!val.includes(text)) {
          briefEl.value = val ? `${val}\n${text}` : text;
          syncFormToTask();
          persistTask(currentTask);
          if (statusEl) statusEl.textContent = `已加入委托要素：「${text.split('：')[0]}」`;
        }
      });
      chipsWrap.appendChild(b);
    });
  }

  function loadTaskIntoForm(task) {
    currentTask = task;
    fields.forEach((f) => {
      const input = form.elements[f];
      if (input) input.value = task[f] || '';
    });
    const d = dayRoles[task.role] || dayRoles.student;
    const idx = Math.max(1, tasks.findIndex((x) => x.id === task.id) + 1);
    if (titleHeading) titleHeading.textContent = `第 ${idx} 张工作卡 · ${d.label}视角`;
    if (exampleBtn) exampleBtn.textContent = `填入【${d.label}】示例`;
    renderChips(task.role);
    renderSelect();
    if (copyWrap && !copyWrap.hidden) renderPlainTextBox();
  }

  function syncFormToTask() {
    if (!currentTask) return;
    fields.forEach((f) => {
      const input = form.elements[f];
      if (input) currentTask[f] = input.value;
    });
    dirty = true;
    renderSelect();
  }

  function formatPlainText(t) {
    const roleLabel = dayRoles[t.role]?.label || t.role;
    return [
      `# 超级个体任务卡（${roleLabel}视角）`,
      ...fields.map((f) => `【${labels[f]}】\n${t[f]?.trim() || '（待补充）'}`)
    ].join('\n\n');
  }

  function formatMarkdownBundle(t) {
    const roleLabel = dayRoles[t.role]?.label || t.role;
    const dateStr = new Date().toISOString().slice(0, 10);
    return `---
role: ${roleLabel}
updated: ${dateStr}
status: draft
---

# ${t.title.trim() || '未命名第二大脑项目卡'}

## 1. 给主分身的清晰委托
${t.brief.trim() || '（待补充受众、产出物与禁编红线）'}

## 2. raw/ 绑定的真实材料
${t.materials.trim() || '（列出只读原始出处文件）'}

## 3. _wiki/ 核心页与双分身核验
- **双分身职责**：
${t.roles.trim() || '（执行分身 / 质疑分身分工）'}

- **人类裁决记录**：
${t.decision.trim() || '（写明冲突处理决定）'}

- **知识页组织计划**：
${t.knowledge.trim() || '（一份资料 ≠ 一个词条；标明并入哪一主题页）'}

> [!warning] Contradiction（如遇相反来源请并列保留）
> - 来源 A：……
> - 来源 B：……
> - 裁决状态：待核验 / 已人工定稿

## 4. AGENTS.md / RSI 迭代规则
- **可复用规则**：${t.agent.trim() || '（写下防再错检查项）'}
- **新增材料或反例**：${t.change.trim() || '（暂无）'}
- **RSI 修订动作**：${t.review.trim() || '（暂无）'}

## 5. 盲测交接与试点通过标准
${t.pilot.trim() || '（交给未参与前序过程的人独立验证一遍）'}
`;
  }

  function renderPlainTextBox() {
    if (!copyWrap || !copyPre || !currentTask) return;
    copyPre.textContent = formatPlainText(currentTask);
    copyWrap.hidden = false;
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  form.addEventListener('input', () => {
    syncFormToTask();
    persistTask(currentTask);
  });

  exampleBtn?.addEventListener('click', () => {
    const r = window.getCourseRole?.() || currentTask?.role || 'student';
    applyRoleExample(r, true);
  });

  newBtn?.addEventListener('click', () => {
    const r = window.getCourseRole?.() || 'student';
    const blank = emptyTask(r);
    tasks.unshift(blank);
    dirty = false;
    persistTask(blank);
    loadTaskIntoForm(blank);
    tabCtrl.activate(0, false);
    if (copyWrap) copyWrap.hidden = true;
    if (statusEl) statusEl.textContent = `已新建空白工作卡（${dayRoles[r].label}视角）。`;
    form.elements.title?.focus();
  });

  tasksSelect?.addEventListener('change', () => {
    const chosen = tasks.find((t) => t.id === tasksSelect.value);
    if (!chosen) return;
    dirty = false;
    loadTaskIntoForm(chosen);
    window.setCourseRole?.(chosen.role, 'practice');
    if (statusEl) statusEl.textContent = `已切换到：「${chosen.title || '未命名任务卡'}」`;
  });

  doneBtn?.addEventListener('click', () => {
    syncFormToTask();
    const requiredFields = ['title', 'brief', 'materials', 'roles', 'decision', 'knowledge', 'agent', 'pilot'];
    const missing = requiredFields.find((f) => !currentTask[f]?.trim());
    if (missing) {
      const targetStep = fieldStepMap[missing] ?? 0;
      tabCtrl.activate(targetStep, false);
      if (statusEl) statusEl.textContent = `还差第 ${targetStep + 1} 步的「${labels[missing]}」未填写，已帮你跳到该步。`;
      form.elements[missing]?.focus();
      return;
    }
    persistTask(currentTask);
    renderPlainTextBox();
    if (statusEl) statusEl.textContent = '已完成检查并保存进本浏览器！下方可复制纯文本，或导出 .txt / .md 文件。';
  });

  downloadBtn?.addEventListener('click', () => {
    syncFormToTask();
    persistTask(currentTask);
    const slug = (currentTask.title || 'super-individual-task').replace(/[\\/:*?"<>|]/g, '-').slice(0, 40);
    downloadFile(`${slug}.txt`, formatPlainText(currentTask), 'text/plain;charset=utf-8');
    if (statusEl) statusEl.textContent = '已导出 .txt 任务卡。';
  });

  downloadMdBtn?.addEventListener('click', () => {
    syncFormToTask();
    persistTask(currentTask);
    const slug = (currentTask.title || 'second-brain-card').replace(/[\\/:*?"<>|]/g, '-').slice(0, 40);
    downloadFile(`${slug}.md`, formatMarkdownBundle(currentTask), 'text/markdown;charset=utf-8');
    if (statusEl) statusEl.textContent = '已导出第二大脑 .md 启动包（含 frontmatter 与冲突标记模板）。';
  });

  if (bindCopyButton && copyBtn) {
    bindCopyButton(copyBtn, () => formatPlainText(currentTask), copyFb, '复制纯文本任务卡');
  }

  function applyRoleExample(targetRole, forceOverwrite = true) {
    const r = Object.hasOwn(dayRoles, targetRole) ? targetRole : 'student';
    if (!currentTask) {
      currentTask = emptyTask(r);
      tasks.unshift(currentTask);
    }
    if (forceOverwrite || !dirty) {
      const data = exampleDataForRole(r);
      currentTask.role = r;
      fields.forEach((f) => { currentTask[f] = data[f] || ''; });
      dirty = false;
    }
    persistTask(currentTask);
    loadTaskIntoForm(currentTask);
    tabCtrl.activate(0, false);
    if (statusEl) statusEl.textContent = `已填入「${dayRoles[r].label}」完整示例，现在可以按步骤改成你的实际题目。`;
  }

  window.applyRoleExampleToPractice = (r) => applyRoleExample(r || window.getCourseRole?.(), true);

  window.syncPilotDiagnostic = (text, sourceRole) => {
    if (!text) return;
    if (!currentTask) {
      currentTask = emptyTask(sourceRole || window.getCourseRole?.() || 'student');
      tasks.unshift(currentTask);
    }
    if (sourceRole && Object.hasOwn(dayRoles, sourceRole) && !dirty) {
      currentTask.role = sourceRole;
    }
    currentTask.pilot = text;
    if (!currentTask.title?.trim()) {
      const d = dayRoles[currentTask.role] || dayRoles.student;
      currentTask.title = `${d.label}首个第二大脑试点`;
    }
    persistTask(currentTask);
    loadTaskIntoForm(currentTask);
    window.openCourseLesson?.(3, 'practice');
    tabCtrl.activate(3, false);
    if (statusEl) statusEl.textContent = '已把第 4 课六问试点诊断写回第 ④ 步，可继续检查或导出 .md！';
    form.elements.pilot?.focus();
  };

  window.getActivePracticeSummary = () => {
    if (!currentTask) return '';
    return formatPlainText(currentTask).slice(0, 2400);
  };

  window.addEventListener('courserolechange', (event) => {
    const r = event.detail?.role;
    if (!r || !Object.hasOwn(dayRoles, r) || event.detail?.source === 'practice') return;
    if (!dirty && currentTask) {
      const isBlank = fields.every((f) => !currentTask[f]?.trim());
      if (!isBlank) {
        applyRoleExample(r, true);
        return;
      }
      currentTask.role = r;
      loadTaskIntoForm(currentTask);
    } else if (exampleBtn) {
      exampleBtn.textContent = `填入【${dayRoles[r].label}】示例`;
      renderChips(r);
    }
  });

  // 初始化已有卡片或空白卡片（在沙箱宿主中等待 host:cache，避免写入空卡覆盖记忆）
  tasks = readLocalTasks();
  if (!tasks.length) {
    const initRole = window.getCourseRole?.() || 'student';
    const starter = emptyTask(initRole);
    tasks.push(starter);
    if (savedInBrowser) persistTask(starter);
  }
  loadTaskIntoForm(tasks[0]);

  // 与宿主 course.html 同步读写用户级缓存（aichat.external-tool.v1 顶层格式）
  if (window.CourseWrapper?.embedded) {
    const readId = uuid();
    window.addEventListener('message', (event) => {
      if (!window.CourseWrapper.fromWrapper(event)) return;
      const m = event.data;
      if (m.type !== 'host:cache') return;
      if (m.requestId === readId && Array.isArray(m.value)) {
        const loaded = m.value.map((raw) => raw?.value ?? raw).filter(validTask);
        if (loaded.length) {
          const currentUntouched =
            !dirty &&
            currentTask &&
            fields.every((f) => !currentTask[f]?.trim());
          if (currentUntouched) {
            tasks = tasks.filter((t) => t.id !== currentTask.id);
          }
          loaded.forEach((item) => {
            if (!tasks.some((t) => t.id === item.id)) tasks.push(item);
          });
          tasks.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          loadTaskIntoForm(tasks[0]);
        }
      }
      if (m.requestId && m.requestId === latestSave) {
        latestSave = '';
        window.clearTimeout(saveTimeout);
        if (statusEl) {
          statusEl.textContent = m.ok ? '已保存在当前浏览器。' : '浏览器存储不可用，可下载任务卡保存。';
        }
      }
    });
    window.CourseWrapper.sendWrapper('tool:cache:get', { key: prefix, requestId: readId });
  }
})();
