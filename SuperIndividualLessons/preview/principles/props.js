// Close-ups of what the person is handling. The editor and the scene share one clock.
function createPropDrawing(canvas){
  const c=canvas.getContext('2d');
  if(!c)return ()=>{};
  c.scale(2,2);
  const ink='#34564c',cream='#fff8dd',ochre='#e9bb71',rust='#ad5841';
  function box(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
  function circle(x,y,r,color){c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
  function stroke(points,color,width=2){
    c.strokeStyle=color;c.lineWidth=width;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
  }
  function text(s,x,y,size,color=ink){c.fillStyle=color;c.font='bold '+size+'px "Microsoft YaHei", sans-serif';c.fillText(s,x,y);}
  function slip(x,y,w,h){
    box(x+2,y+2,w,h,'#baad8d');box(x,y,w,h,cream);
    for(let i=0;i<3;i++)box(x+5,y+6+i*6,w*(i===2?.43:.72),1.4,'#aaab8f');
  }
  function calendar(t,checked){
    box(42,3,70,48,'#d8c9a7');box(44,2,70,46,cream);box(44,2,70,9,rust);
    text(checked?'10 月':'6 月',59,38,19);
    if(checked&&t<1){
      c.save();c.translate(44,11);c.scale(1,Math.max(.01,1-t));
      box(0,0,70,36,'#f0dfbd');text('6 月',17,26,18);c.restore();
    }
  }
  function monitor(pos,t,checked){
    box(23,1,111,43,ink);box(27,5,103,35,'#e0ece2');box(71,44,14,5,ink);box(58,49,41,3,ink);
    if(pos===12 && checked){
      const reveal=Math.min(1,t*1.6);
      box(31,8,95*reveal,28,'#8cb9a6');
      if(reveal>.5){
        for(const r of [7,12,17]){
          c.strokeStyle='#daf1d9';c.lineWidth=1;c.beginPath();c.ellipse(75,23,r*1.5,r*.62,0,0,Math.PI*2);c.stroke();
        }
        stroke([[75,9],[75,37]],rust,3);circle(105,23,7,cream);
        const a=-1+t*2;stroke([[105,23],[105+6*Math.cos(a),23+6*Math.sin(a)]],rust,2);
      }
    }else if(pos===7){
      box(32,10,55,9,'#e0c196');box(53,24,Math.max(4,66*t),10,'#97bd9f');
    }else if(pos===8){
      text('…',62,30,22);circle(113,13,3,checked?rust:ochre);
    }else{
      slip(32,9,28,25);box(67,13,42*t,3,'#7b9d85');box(67,23,30*t,3,'#b99e74');
    }
  }
  function recordings(t,checked){
    for(let row=0;row<2;row++){
      const x=row?64-(checked?t*35:0):16,y=6+row*24,w=row?58:120;
      box(x,y,w,17,row?'#e7c691':'#c5d9c1');
      for(let i=3;i<w-2;i+=4){const h=2+Math.abs(Math.sin((i+(row?13:0))*.27))*10;box(x+i,y+(17-h)/2,2,h,ink);}
    }
    if(checked)stroke([[29,23],[29,30]],rust,1.5);
  }
  return (pos,t,checked)=>{
    c.clearRect(0,0,160,54);c.save();
    const kind=staging[pos][0];
    if(kind==='calendar')calendar(t,checked);
    else if(kind==='screen')monitor(pos,t,checked);
    else if(kind==='remote'){
      box(48,8,65,33,'#a8baab');box(51,6,60,32,'#223e37');
      circle(67,21,6,checked&&t>.45?'#f8da94':'#6e9181');circle(92,21,4,'#7d9389');
      const y=40-Math.sin(t*Math.PI)*16;circle(68,y,6,'#e4ac84');box(62,y,12,18,'#e4ac84');
    }else if(pos===14)recordings(t,checked);
    else if(kind==='folder'){
      box(29,15,96,28,'#ba8e52');box(29,10,34,10,'#ba8e52');
      slip(50,2+13*t,54,30);box(27,25,101,22,ochre);
    }else if(kind==='stack'){
      slip(23,4,63,39);slip(65+t*(checked?17:7),11,63,38);
      if(checked){stroke([[88,34],[94,39],[106,25]],ink,2.5);}
    }else if(kind==='stamp'){
      slip(27,14,106,34);
      const y=2+15*Math.sin(t*Math.PI);box(86,y,8,12,ink);box(73,y+10,34,6,rust);
      if(t>.48)text('进行中',70,40,12,rust);
    }else{
      slip(25,3,103,45);
      const end=42+63*t;stroke([[42,30],[end,30]],rust,2.5);
      stroke([[end,30],[end+16,13]],ink,4);
    }
    c.restore();
  };
}
