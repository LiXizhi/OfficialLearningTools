// The establishing shot and the four story beats each last six seconds.
let foundationNarrationMuted = false;
window.createFoundationPlayer = function createFoundationPlayer(figure, lesson, chapter) {
  const shotSeconds = 6;
  const scenes = [{action:lesson.place,voice:lesson.opening,text:lesson.term,visual:lesson.filmAlt},...lesson.rounds];
  const video = figure.querySelector('video');
  const still = figure.querySelector('[data-still]');
  const previous = figure.querySelector('[data-previous]');
  const current = figure.querySelector('[data-current]');
  const phase = figure.querySelector('[data-phase]');
  const voice = figure.querySelector('[data-voice]');
  const play = figure.querySelector('[data-play]');
  const mute = figure.querySelector('[data-mute]');
  const prev = figure.querySelector('[data-prev]');
  const next = figure.querySelector('[data-next]');
  const status = figure.querySelector('[data-video-status]');
  const base = 'assets/films/exhibit-'+chapter;
  let index = 0, stillMode = true, finished = false, atQuestion = false, unavailable = false;
  let request = 0;

  function controls() {
    prev.disabled = index === 0;
    next.disabled = index === scenes.length-1;
    play.disabled = unavailable;
    if (unavailable) play.textContent = '逐幕看剧照';
    else if (!video.paused) play.textContent = '暂停';
    else if (atQuestion) play.textContent = '看修订结果';
    else if (finished) play.textContent = '重新播放';
    else play.textContent = stillMode ? '播放短片' : '继续播放';
  }
  function caption(to) {
    index = to;
    const round = scenes[index];
    current.textContent = round.text;
    previous.hidden = index < 2;
    previous.textContent = index >= 2 ? '上一幕：'+scenes[index-1].text : '';
    phase.textContent = index ? '第'+index+'幕 · '+round.action : '开场 · '+lesson.place;
    voice.textContent = round.voice;
    figure.dataset.round = String(index);
    figure.querySelector('[data-record-title]').textContent = index ? lesson.record : lesson.name;
    video.setAttribute('aria-label',round.visual);
    controls();
  }
  function showStill(to) {
    stop();
    stillMode = true; finished = false; atQuestion = false;
    still.src = base+(to ? '-'+to+'.webp' : '.jpg');
    still.alt = scenes[to].visual+' '+scenes[to].voice;
    still.hidden = false;
    caption(to);
  }
  function stop() {
    request++;
    video.pause();
    controls();
  }
  // Check against the video clock even if a background tab skipped a timeupdate.
  const checkpoint = scenes.findIndex(round=>round.checkpoint);
  function sync() {
    if (stillMode || atQuestion) return;
    const t = video.currentTime;
    const to = Math.min(scenes.length-1,Math.floor(t/shotSeconds));
    if (checkpoint >= 0 && index <= checkpoint && t >= (checkpoint+1)*shotSeconds-.38) {
      video.pause();
      atQuestion = true;
      video.currentTime = (checkpoint+1)*shotSeconds-.14;
      caption(checkpoint);
    } else if (index !== to) caption(to);
  }
  function fallback() {
    unavailable = true;
    showStill(index);
    status.textContent = '当前设备无法播放短片，可用上一幕、下一幕查看现场剧照。';
  }
  play.addEventListener('click',async () => {
    if (!video.paused) { stop(); return; }
    const attempt = ++request;
    if (finished) { caption(0); finished = false; stillMode = true; }
    if (atQuestion) { atQuestion = false; caption(index+1); stillMode = true; }
    if (stillMode) video.currentTime = index*shotSeconds;
    stillMode = false;
    try {
      await video.play();
      if (attempt !== request) return;
      still.hidden = true;
      const frame = video.parentElement;
      if (frame.getBoundingClientRect().bottom > innerHeight) frame.scrollIntoView({block:'nearest'});
      controls();
    } catch (error) {
      if (attempt !== request || error.name === 'AbortError') return;
      if (video.error || error.name === 'NotSupportedError') fallback();
      else { status.textContent = '播放暂时中断，可以再次点击播放。'; controls(); }
    }
  });
  video.addEventListener('playing',()=>{ status.textContent=''; controls(); });
  video.addEventListener('pause',controls);
  video.addEventListener('timeupdate',sync);
  video.addEventListener('ended',()=>{finished = true; controls();});
  video.addEventListener('error',fallback);
  function setMute(muted) {
    foundationNarrationMuted = muted;
    video.muted = muted;
    mute.textContent = '旁白'+(muted?'关':'开');
    mute.setAttribute('aria-pressed',String(!muted));
  }
  setMute(foundationNarrationMuted);
  mute.addEventListener('click',()=>setMute(!video.muted));
  prev.addEventListener('click',()=>showStill(index-1));
  next.addEventListener('click',()=>showStill(index+1));
  showStill(0);
  if (video.error) fallback();
  return {stop};
};
