// Classroom example. These half-lives are illustrative, not fitted to a learner.
window.brainVocabulary=(()=>{
  const words=[
    {word:'borrow',meaning:'借入',sentence:'May I borrow your pencil?',response:'看到 bor 才想起来',independent:false},
    {word:'return',meaning:'归还',sentence:'I will return it tomorrow.',response:'独立说出整句',independent:true}
  ];
  const cards=words.map(w=>w.word+'（'+w.meaning+'）　'+w.sentence).join('\n');
  const check='11 月 12 日遮住课本，看中文说英文。'+words.map(w=>w.word+'：'+w.response+'。').join('');
  const observed=result=>({solo:'correct on the first try',hint:'correct after a hint',retry:'correct after a retry'})[result];
  function halfLife(w,result){
    if(w.independent)return 4;
    if(!result)return 1;
    return result==='solo'?2:0.5;
  }
  const due=result=>13+Math.ceil(-halfLife(words[0],result)*Math.log2(.7));
  const borrowLine=result=>'borrow | '+(result?'Nov 13: '+observed(result):'Nov 12: needed a hint')+' | half-life: '+halfLife(words[0],result)+(halfLife(words[0],result)===1?' day':' days')+' | next review: Nov '+(result?due(result):13);
  const assumptions='课堂假设：初始半衰期 2 天。第一次独立答对就加倍，用了提示或答错后重试就减半。在估计回忆率低于 70% 的第一个整天复习。';
  const forecast=assumptions+'\n'+cards+'\n'+borrowLine()+'\nreturn | Nov 12: recalled independently | half-life: 4 days | next review: Nov 15';
  const probability=(w,days,result)=>2**(-(days+(result&&w.independent?1:0))/halfLife(w,result));
  const percent=(w,days,result)=>Math.round(100*probability(w,days,result))+'%';
  const x=days=>43+days*50;
  function graph(days=1,result){
    const y=p=>118-99*p;
    const curves=words.map(w=>{
      const points=Array.from({length:71},(_,i)=>x(i/10)+','+y(probability(w,i/10,result))).join(' ');
      return '<polyline class="recall-'+w.word+'" points="'+points+'" />';
    }).join('');
    return '<svg viewBox="0 0 420 147" role="img" aria-label="两词从复习后开始的估计回忆率，borrow 实线下降较快，return 虚线下降较慢">'+
      '<path d="M43 19V118H393 M43 49H393" fill="none" stroke="#bccabd"/><g fill="#435c50" font-size="11"><text x="4" y="23">100%</text><text x="10" y="52">70%</text><text x="18" y="121">0%</text><text x="41" y="136">当天</text><text x="375" y="136">7 天</text></g>'+curves+'<line class="recall-cursor" x1="'+x(days)+'" x2="'+x(days)+'" y1="19" y2="118" stroke="#58645b" stroke-dasharray="2 3"/></svg>';
  }
  const legend=(days,result)=>words.map(w=>'<span class="recall-'+w.word+'">'+w.word+'　'+percent(w,days,result)+'</span>').join('');
  function mount(host,result){
    const initial=Number(host.querySelector("input")?.value??1);
    host.innerHTML='<h2>How much will I remember?</h2><p lang="en">'+(result?'Nov 13: borrow was '+observed(result)+'. Next review: Nov '+due(result)+'. Return was last practised on Nov 12.':'Nov 12: I needed a hint for borrow. I recalled return on my own.')+' Move the slider to explore the estimate.</p>'+graph(initial,result)+
      '<label>距本次复习 <input type="range" min="0" max="7" value="1" aria-label="距本次复习的天数"> <output></output></label>'+
      '<p class="recall-results" aria-live="polite"></p><details><summary>这些估计是怎么算的？</summary><p>'+assumptions+' 回忆率按 2 的（−间隔天数 ÷ 半衰期）次方估计。真实复习时要把下一次的表现记回来，再调整间隔。 <a href="https://aclanthology.org/P16-1174/" target="_blank" rel="noopener noreferrer">半衰期模型出处</a></p></details>';
    const input=host.querySelector('input'),cursor=host.querySelector('line');
    input.value=initial;
    function update(){
      const days=Number(input.value);
      const cursorX=x(days);
      cursor.setAttribute('x1',cursorX);cursor.setAttribute('x2',cursorX);
      host.querySelector('output').textContent=days+' 天';
      host.querySelector('.recall-results').innerHTML=legend(days,result);
    }
    input.oninput=update;update();
  }
  const preview=result=>'<figure class="recall-chart recall-preview"><figcaption>Two days after Nov '+(result?'13':'12')+' · estimated recall</figcaption>'+graph(2,result)+'<p class="recall-results">'+legend(2,result)+'</p></figure>';
  function comparison(result){
    const line=r=>Array.from({length:31},(_,i)=>(3+i*3)+','+(36-33*probability(words[0],i/10,r))).join(' ');
    return '<figure class="wb-curve-change"><svg viewBox="0 0 96 40" role="img" aria-label="Estimated recall for borrow: yesterday dashed, today solid"><polyline points="'+line()+'" stroke="#85877e" stroke-dasharray="3 2"/><polyline points="'+line(result)+'" stroke="#235b4c"/></svg><figcaption><b>borrow · two-day estimate</b><br>Yesterday '+percent(words[0],2)+' → today '+percent(words[0],2,result)+'</figcaption></figure>';
  }
  return {cards,check,forecast,mount,preview,comparison,borrowLine,observed,due};
})();
