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
    }
    function reset(){round=0;replay();}
    byId('turn').onclick=()=>{round++;replay();};byId('reset').onclick=reset;
    for(const id of ['reason','action','approach'])byId(id).oninput=reset;
    show();reset();
    if(parent!==window){
      function report(){parent.postMessage({channel:'aichat.external-tool.v1',type:'tool:sample-height',height:Math.ceil(document.body.getBoundingClientRect().height)},'*');}
      report();new ResizeObserver(report).observe(document.body);
    }
  }
  return `<!doctype html>
<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>再看一条，还是收起手机？</title>
<style>
*{box-sizing:border-box}body{margin:0;padding:clamp(12px,3vw,28px);background:#f8f7ef;color:#203d35;font:16px/1.55 system-ui,sans-serif}main,nav{max-width:880px;margin:auto}main{display:grid}section{grid-area:1/1;visibility:hidden;min-width:0}section.active{visibility:visible}h2{margin:6px 0;font:700 clamp(22px,3vw,32px)/1.25 Georgia,serif}small,b{color:#286354}p{margin:8px 0}label{display:block;margin:8px 0}input,select,textarea,button{font:inherit;border:1px solid #adc1b5;border-radius:7px;padding:6px 10px;max-width:100%}input,textarea{display:block;width:100%}button{background:#255647;color:white;cursor:pointer}button:disabled{opacity:.48}nav{display:flex;gap:14px;align-items:center;justify-content:center;border-top:1px solid #bbcbbf;padding-top:10px}#turns{height:12em;overflow:auto;background:#fff;border-radius:8px;padding:0 12px;margin:10px 0}#turns p:nth-child(even){background:#e9f0e6}blockquote{margin:12px 0;padding:14px;background:white;border-left:4px solid #be9353}
</style>
<main>
<section><small>第 1 页 · 发现触发点 · 5 分钟</small><h2>作业发完了，手为什么还停在屏幕上？</h2><blockquote>21:30，小禾用手机拍完作业。群里跳出一条新消息，短视频也开始自动播放。原定洗漱的时间到了。</blockquote><p>两人一组，指出故事里的一次有用使用，以及让小禾继续刷下去的那个瞬间。</p><p>听见提示音是触发点，点开群聊是动作，马上知道队友说了什么是即时回报。换一种动作，还能照顾他在意的事吗？观察员把这三件事分别记下。</p></section>
<section><small>第 2 页 · 学生制作两张角色卡 · 8 分钟</small><h2>给两位 AI 各写一个立场</h2>
<label>小禾 AI 舍不得放下的理由<input id="reason" maxlength="90" value="怕队友约好明天的时间，我会错过"></label>
<label>同伴 AI 第一种开场 <select id="approach"><option value="order">直接下命令</option><option value="ask">先听理由，再让对方选</option></select></label>
<label>给小禾一个可选的小动作<input id="action" maxlength="90" value="先回复集合时间，再把手机放到书桌上充电"></label><p>小禾可以拒绝。同伴每轮只说一句，之后等小禾自己作选择。</p></section>
<section><small>第 3 页 · 两轮对照实验 · 17 分钟</small><h2>哪一句让小禾愿意试一试？</h2><p>离线预演使用预写分支。逐句演一遍，回第 2 页只换开场，再演一次。实课用同样的角色卡向 AI 请求新对话。</p>
<div id="turns" aria-live="polite" tabindex="0" aria-label="两位 AI 的对话"></div><button id="turn">显示下一句</button> <button id="reset">重演本轮</button></section>
<section><small>第 4 页 · 退出票 · 10 分钟</small><h2>把“少看一会儿”改成能试一次的约定</h2>
<label>哪句原话改变了对话？<textarea rows="2" placeholder="圈出小禾接受、犹豫或拒绝时说的原话"></textarea></label><label>替虚构角色写一张行动卡<textarea rows="2" placeholder="当……出现，我先……。如果又拿起手机，我就……。"></textarea></label><p>同桌读一遍：知道什么时刻开始、具体做什么、没做到怎样再试吗？课堂上角色的承诺只代表这段对话。</p></section>
</main><nav><button id="prev">← 上一页</button><output id="count"></output><button id="next">下一页 →</button></nav>
<script>(${runActivity.toString()})();</script></html>`;
};
