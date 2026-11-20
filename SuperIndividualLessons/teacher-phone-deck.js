// The workbench, the inline preview and the downloadable H5 use the same document.
window.makePhoneLessonHTML=function(){
  function runActivity(){
    const byId=id=>document.getElementById(id);
    const slides=[...document.querySelectorAll('section')];
    let page=0,round=0;
    function show(){
      slides.forEach((slide,i)=>{slide.inert=i!==page;slide.classList.toggle('active',i===page);});
      byId('count').textContent=(page+1)+' / '+slides.length;
      byId('prev').disabled=page===0;byId('next').disabled=page===slides.length-1;
      if(parent!==window)parent.postMessage({channel:'aichat.external-tool.v1',type:'tool:sample-page',page:page+1},'*');
    }
    byId('prev').onclick=()=>{page--;show();};
    byId('next').onclick=()=>{page++;show();};
    function replay(){
      const reason=byId('reason').value.trim()||'怕错过朋友的消息';
      const action=byId('action').value.trim()||'回一句晚安，把手机放到书桌上充电';
      const ask=byId('approach').value==='ask';
      const turns=[
        ['小禾 AI','我还想看一眼，因为'+reason+'。'],
        ['同伴 AI',ask?'你最放心不下什么？要不要先处理这件事，再选个收手机的办法？':'别看了！现在就放下，一晚上都别碰。'],
        ['小禾 AI',ask?'你愿意听我的理由。我想试试这个办法：'+action+'。':'可我说的是“'+reason+'”。你没问我，我还不想收。'],
        ['同伴 AI',ask?'你想在什么时候开始？如果又想拿起来，哪一步可以再做一次？':'那我换个问法：怎样做，既能照顾你在意的事，也能让你去休息？']
      ];
      const log=byId('turns');log.replaceChildren();
      for(const [who,words] of turns.slice(0,round)){
        const p=document.createElement('p'),b=document.createElement('b');b.textContent=who+'　';p.append(b,words);log.append(p);
      }
      log.scrollTop=log.scrollHeight;
      byId('turn').disabled=round===turns.length;
      byId('mode-badge').textContent=ask?'当前实验分支：先倾听理由，再协商小动作':'当前实验分支：直接下命令（可回第 2 页切换对照）';
    }
    function reset(){round=0;replay();}
    byId('turn').onclick=()=>{round++;replay();};byId('reset').onclick=reset;
    for(const id of ['reason','action','approach'])byId(id).oninput=reset;
    window.addEventListener('message',e=>{
      if(e.data?.channel==='aichat.external-tool.v1'&&e.data.type==='host:sample-goto'){
        const target=Number(e.data.page);
        if(Number.isInteger(target)&&target>=1&&target<=slides.length){page=target-1;show();}
      }
    });
    show();reset();
    if(parent!==window){
      function report(){parent.postMessage({channel:'aichat.external-tool.v1',type:'tool:sample-height',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');}
      report();new ResizeObserver(report).observe(document.body);
    }
  }
  return `<!doctype html>
<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>再看一条，还是收起手机？ · 七年级心理班会</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:clamp(12px,2.6vw,24px);background:#f8f7ef;color:#203d35;font:15.5px/1.55 "Microsoft YaHei",system-ui,sans-serif}header,main,nav{max-width:880px;margin:auto}header{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding-bottom:8px;margin-bottom:8px;border-bottom:1px solid #cdd8cf;font-size:13.5px;color:#286354}main{display:grid}section{grid-area:1/1;visibility:hidden;min-width:0;padding:4px 0 12px}section.active{visibility:visible}h2{margin:5px 0 8px;font:700 clamp(21px,3vw,30px)/1.28 Georgia,"Songti SC",serif}small,b{color:#286354}p{margin:7px 0}label{display:block;margin:8px 0;font-weight:600}input,select,textarea,button{font:inherit;font-weight:400;border:1px solid #adc1b5;border-radius:8px;padding:7px 10px;max-width:100%;background:#fff;color:#1d3830}input,textarea{display:block;width:100%;margin-top:4px}button{background:#255647;color:#fff;font-weight:600;cursor:pointer;padding:7px 14px}button.secondary{background:#fff;color:#255647}button:disabled{opacity:.48;cursor:default}nav{display:flex;gap:14px;align-items:center;justify-content:center;border-top:1px solid #bbcbbf;padding-top:10px}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}.cards div{padding:9px 11px;background:#fff;border:1px solid #d5e0d7;border-radius:9px;font-size:13.5px}.cards b{display:block;margin-bottom:2px}.role-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:8px 0}.role-box{padding:10px 12px;background:#fff;border:1px solid #cfdcd2;border-radius:10px}#mode-badge{display:inline-block;padding:2px 9px;border-radius:999px;background:#e3efe8;color:#204d3f;font-size:12.5px;font-weight:600}#turns{height:11.5em;overflow:auto;background:#fff;border:1px solid #d3dfd6;border-radius:10px;padding:6px 12px;margin:8px 0}#turns p{padding:5px 8px;border-radius:7px}#turns p:nth-child(even){background:#eaf2e8}blockquote{margin:10px 0;padding:12px 14px;background:#fff;border-left:4px solid #be9353;border-radius:0 9px 9px 0}@media(max-width:640px){.cards,.role-grid{grid-template-columns:1fr}}
</style>
<header><b>七年级心理健康 · 主题班会课件</b><span>《再看一条，还是收起手机？》（40 分钟双 AI 角色实验）</span></header>
<main>
<section><small>第 1 页 / 4 · 发现触发点（0–5 分钟）</small><h2>作业发完了，手为什么还停在屏幕上？</h2><blockquote>21:30，七年级学生小禾（虚构人物）用手机拍完作业发进班级群。刚想锁屏，群里跳出队友的新消息，短视频也开始自动连播。原定洗漱休息的时间到了。</blockquote><p>两人一组，先区分故事里的“正事使用”与“继续刷下去的触发瞬间”：</p><div class="cards"><div><b>① 触发点</b>听见群提示音与自动连播画面</div><div><b>② 惯性动作</b>顺手点开群聊与下一条视频</div><div><b>③ 在意的事</b>马上知道队友明天约球安排</div></div></section>
<section><small>第 2 页 / 4 · 学生制作两张角色卡（5–13 分钟）</small><h2>给两位 AI 各写一个真实立场</h2><div class="role-grid"><div class="role-box"><b>角色 B · 小禾 AI（允许拒绝）</b><label>小禾 AI 舍不得放下的理由<input id="reason" maxlength="90" value="怕队友约好明天的时间，我会错过"></label><label>给小禾一个可选的小动作<input id="action" maxlength="90" value="先回复集合时间，再把手机放到书桌上充电"></label></div><div class="role-box"><b>角色 A · 同伴 AI（单变量对照）</b><label>同伴 AI 第一句话的方式<select id="approach"><option value="order">直接下命令</option><option value="ask">先听理由，再让对方选</option></select></label><p>实验规则：两轮保持小禾的理由不变，只切换同伴的第一句话，观察小禾是抵触拒绝还是愿意自己提办法。</p></div></div></section>
<section><small>第 3 页 / 4 · 两轮对照实验（13–30 分钟）</small><h2>哪一句开场，让小禾愿意试一试？</h2><span id="mode-badge"></span><p>逐句点按演完第一轮，再回第 2 页只换同伴开场重演第二轮。正式上课时，同桌把同样的两张角色卡发给两个独立 AI 对话。</p>
<div id="turns" aria-live="polite" tabindex="0" aria-label="两位 AI 的对话"></div><div><button id="turn" type="button">显示下一句</button> <button id="reset" class="secondary" type="button">重演本轮</button></div></section>
<section><small>第 4 页 / 4 · 微行动出门条（30–40 分钟）</small><h2>把笼统的“以后少玩”，改成明晚能试一次的小约定</h2>
<label>哪句原话改变了对话走向？<textarea rows="2" placeholder="圈出小禾接受、犹豫或拒绝时说的那句原话"></textarea></label><label>替虚构角色小禾写一张可执行行动卡<textarea rows="2" placeholder="当明晚群消息一响，我先……。如果洗漱后又想拿手机，我就……。"></textarea></label><p>同桌互读检验：是否写清了“触发时刻＋具体动作”？注：课堂角色回应只代表本次模拟对话。</p></section>
</main><nav><button id="prev" type="button">← 上一页</button><output id="count"></output><button id="next" type="button">下一页 →</button></nav>
<script>(${runActivity.toString()})();</script></html>`;
};
