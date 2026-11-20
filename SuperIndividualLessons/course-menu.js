(() => {
  const menu = document.querySelector('.course-menu');
  const groups = menu.querySelector('nav');
  const course = new URL(menu.dataset.index, location.href);
  const examples = new URL('preview/principles/index.html', course);
  const inExamples = location.pathname === examples.pathname;
  if (!inExamples) course.search = location.search;

  function group(label, entries) {
    const heading = document.createElement('h2');
    heading.textContent = label;
    const section = document.createElement('section');
    section.append(heading);
    for (const [title, url] of entries) {
      const link = document.createElement('a');
      link.href = url;
      link.textContent = title;
      section.append(link);
    }
    groups.append(section);
  }
  group('共享通识', [
    ['开场与共同记忆 · 超级个体的今天与未来',course.href+'#foundation/1'],
    ['第二大脑的工作原理 · 16 个案例', examples.href],
    ...window.brainFoundation.slice(1).map((chapter, i) => [i===2?'协作与信任 · 分身怎样组圈':chapter.name, course.href + '#foundation/' + (i + 2)])
  ]);
  const practice = new URL(course);
  practice.searchParams.set('browse','1');
  for (const [id, track] of Object.entries(window.brainCourses)) {
    group(track.label, [
      ...track.lessons.map((lesson, i) => ['第 '+(i+1)+' 课 · '+lesson.title, practice.href+'#'+id+'/lesson-'+(i+1)]),
      ...(id!=='enterprise'?[]:[['第5课',practice.href+'#'+id+'/lesson-5']]),
      ...(id==='teacher'?[['第5课 · 心理活动：从零制作 H5',practice.href+'#teacher/lesson-5']]:[]),
      ['结课作品', practice.href+'#'+id+'/finish']
    ]);
  }
  function markCurrent() {
    for (const a of groups.querySelectorAll('a')) {
      const target = new URL(a.href);
      if(target.hash.endsWith('/lesson-5'))a.hidden=!document.querySelector('nav.lessons a[href="'+target.hash+'"]');
      const here = inExamples ? target.pathname === examples.pathname :
        target.pathname === course.pathname && target.hash === location.hash;
      if (here) a.setAttribute('aria-current','page');
      else a.removeAttribute('aria-current');
    }
  }
  markCurrent();
  window.addEventListener('coursepagechange',markCurrent);
  menu.addEventListener('toggle', () => { if (menu.open) markCurrent(); });
  groups.addEventListener('click', event => {
    if (!event.target.closest('a')) return;
    menu.open = false;
    if (inExamples && event.target.closest('a').pathname === examples.pathname) {
      event.preventDefault();
      menu.querySelector('summary').focus();
    }
  });
  document.addEventListener('pointerdown', event => { if (!menu.contains(event.target)) menu.open = false; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
})();
