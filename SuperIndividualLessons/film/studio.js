// Authoring set for the four science-fair films. Three.js r160, Y up, actors face +Z.
function buildExhibit(THREE, canvas) {
  const T = THREE;
  const render = new T.WebGLRenderer({canvas, antialias:true, preserveDrawingBuffer:true});
  render.setSize(canvas.width, canvas.height, false);
  render.shadowMap.enabled = true;
  render.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.background = new T.Color(0xd9ddc8);
  const camera = new T.PerspectiveCamera(34, canvas.width/canvas.height, .05, 60);
  scene.add(new T.HemisphereLight(0xfff6df,0xb2a69a,2.1));
  const sun = new T.DirectionalLight(0xffedcc,2.65);
  sun.position.set(-3,7,5); sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-6,right:6,top:5,bottom:-4});
  sun.shadow.normalBias=.014; scene.add(sun);

  const mats=new Map();
  function paint(color) {
    if (!mats.has(color)) mats.set(color,new T.MeshStandardMaterial({color,roughness:.78}));
    return mats.get(color);
  }
  const ball=new T.SphereGeometry(1,24,18), cube=new T.BoxGeometry(1,1,1);
  const tube=new T.CylinderGeometry(1,1,1,16);
  function group(parent,x=0,y=0,z=0) {
    const g=new T.Group(); parent.add(g); g.position.set(x,y,z); return g;
  }
  function mesh(p,geo,color,x,y,z,w,h,d) {
    const m=new T.Mesh(geo,paint(color)); p.add(m);
    m.position.set(x,y,z); m.scale.set(w,h,d);
    m.castShadow=true; m.receiveShadow=true; return m;
  }
  const box=(...args)=>mesh(args[0],cube,...args.slice(1));
  const egg=(...args)=>mesh(args[0],ball,...args.slice(1));
  const cyl=(...args)=>mesh(args[0],tube,...args.slice(1));
  const v=(x,y,z)=>new T.Vector3(x,y,z);
  function poseRod(m,a,b,r) {
    m.position.copy(a).lerp(b,.5); m.scale.set(r,a.distanceTo(b),r);
    m.quaternion.setFromUnitVectors(v(0,1,0),b.clone().sub(a).normalize());
  }
  function rod(p,c,a,b,r) { const m=cyl(p,c,0,0,0,1,1,1); poseRod(m,a,b,r);return m; }
  function surface(p,w,h,x,y,z,pixels=640) {
    const c=document.createElement('canvas'); c.width=pixels;c.height=Math.round(pixels*h/w);
    const ctx=c.getContext('2d'); const texture=new T.CanvasTexture(c);
    texture.colorSpace=T.SRGBColorSpace;
    const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture}));
    panel.position.set(x,y,z);p.add(panel);
    return {ctx,c,texture,panel};
  }
  function words(ctx,str,x,y,size,color,weight=700){
    ctx.font=weight+' '+size+'px "Microsoft YaHei", sans-serif';ctx.fillStyle=color;ctx.fillText(str,x,y);
  }
  function plaque(p,label,x,y,z,w,h,bg,fg) {
    const {ctx,c,texture}=surface(p,w,h,x,y,z);
    ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);
    ctx.textAlign='center';ctx.textBaseline='middle';
    words(ctx,label,c.width/2,c.height/2,c.height*.60,fg);texture.needsUpdate=true;
  }
  // Painted wood walls, panelling, an arched bank of windows and festival bunting.
  box(scene,0xb0714c,0,-.085,.5,15,.15,11);
  for(let i=-7;i<8;i++) box(scene,0xc18c66,i,-.008,.5,.99,.012,11);
  box(scene,0x97beb0,0,2.4,-2.9,15,5,.15);
  box(scene,0x386d67,0,.4,-2.8,15,.8,.10);
  box(scene,0xf6cc93,0,.84,-2.70,15,.07,.14);
  for (const x of [-4.4,3.65,5.9]) {
    box(scene,0xe6b883,x,2.19,-2.68,2.05,2.3,.1);
    box(scene,0xaee0dc,x,2.19,-2.60,1.88,2.12,.08);
    for (const i of [-.61,0,.61]) box(scene,0xf8dec0,x+i,2.19,-2.53,.047,2.14,.05);
    box(scene,0xf9dec0,x,2.24,-2.52,1.91,.052,.06);
    box(scene,0xdba573,x,1.09,-2.51,2.17,.11,.25);
  }
  box(scene,0xb67c4e,-.37,2.22,-2.62,4.68,1.9,.14);
  box(scene,0x23524e,-.37,2.22,-2.53,4.52,1.73,.06);
  const board=surface(scene,4.4,1.60,-.37,2.22,-2.48);
  const bc=board.ctx;bc.fillStyle='#285853';bc.fillRect(0,0,640,board.c.height);
  words(bc,'校园科学展',30,93,60,'#fff0c8');
  words(bc,'S C I E N C E   F A I R',32,139,21,'#bfd8bc');
  bc.strokeStyle='#edc575';bc.lineWidth=3;bc.beginPath();bc.ellipse(514,118,67,25,-.48,0,Math.PI*2);bc.stroke();
  bc.beginPath();bc.ellipse(516,118,29,69,-.48,0,Math.PI*2);bc.stroke();
  bc.beginPath();bc.arc(515,120,8,0,Math.PI*2);bc.fillStyle='#edc575';bc.fill();board.texture.needsUpdate=true;
  const flagColors=[0xeaa047,0xf0cc84,0x559b92,0xd77251];
  for(let i=-6;i<=6;i++){
    const x=i*.54,y=3.04+.020*x*x;
    rod(scene,0x785849,v(x-.27,y+.012,-1.9),v(x+.27,y-.012,-1.9),.009);
    const geo=new T.BufferGeometry();
    geo.setAttribute('position',new T.Float32BufferAttribute([-.17,0,0,0,-.29,0,.17,0,0],3));geo.computeVertexNormals();
    mesh(scene,geo,flagColors[(i+8)%4],x,y,-1.88,1,1,1);
  }
  // Worktop, museum-green apron, maker drawers, warm pools of contact shadow.
  box(scene,0xb87349,0,.93,.43,4.75,.14,1.18);
  box(scene,0xe8b783,0,1.01,.43,4.83,.065,1.22);
  box(scene,0x44726b,0,.62,.91,4.57,.5,.12);
  for(const x of [-2.1,2.1]) for(const z of [-.01,.9]) box(scene,0x905632,x,.44,z,.14,.86,.14);
  plaque(scene,'机器人展台',-.89,.61,.979,1.19,.27,'#e8c792','#31544f');
  const audience=group(scene,-2.65,0,-.4);
  cyl(audience,0xc47851,0,.29,0,.31,.54,.31);
  for(let i=0;i<11;i++){const a=i*2.4; const leaf=egg(audience,i%2?0x387765:0x558954,Math.cos(a)*.19,.75+(i%3)*.10,Math.sin(a)*.15,.105,.36,.065);leaf.rotation.z=-Math.cos(a)*.55;leaf.rotation.x=Math.sin(a)*.55;}
  const ink=0x263735,skin=0xe5a780, hair=0x382e2a;
  function actor(type,x,z){
    const teacher=type==='teacher',girl=type==='he', cloth=girl?0xeaa13e:teacher?0x3e796a:0x538eac;
    const g=group(scene,x,0,z);
    for(const side of [-1,1]) {cyl(g,0x34505a,side*.115,.40,0,.102,.69,.10);egg(g,0x41382f,side*.115,.10,.07,.13,.10,.18);}
    egg(g,cloth,0,1.02,-.005,.314,.473,.223);
    cyl(g,skin,0,1.44,0,.105,.18,.10);
    const head=group(g,0,1.66,0);
    egg(head,skin,0,0,0,.305,.356,.274);
    for(const side of [-1,1]) egg(head,skin,side*.30,-.015,.008,.063,.093,.057);
    egg(head,hair,0,.173,-.041,.311,.247,.276);
    for(let i=0;i<5;i++){
      const fringe=egg(head,hair,-.195+i*.091,.163+(i-1)*.017,.194,.104,.111,.075);
      fringe.rotation.z=-.5;
    }
    if(girl){for(const s of [-1,1]){egg(head,hair,s*.247,-.018,-.12,.097,.193,.112);egg(head,0xc76443,s*.255,-.175,-.12,.08,.041,.075);egg(head,hair,s*.274,-.27,-.132,.079,.126,.075);}}
    if(teacher) egg(head,hair,.04,.13,-.26,.19,.16,.16);
    const eyes=group(head);
    for(const s of [-1,1]){
      egg(eyes,ink,s*.115,.015,.251,.032,.045,.020);
      egg(eyes,0xffffe1,s*.115-.008,.027,.271,.009,.009,.004);
      const brow=egg(head,hair,s*.112,.084,.25,.065,.014,.016);brow.rotation.z=s*.09;
      egg(head,0xe59576,s*.186,-.067,.215,.048,.022,.012);
      if(teacher || type==='peer') {
        const rim=new T.Mesh(new T.TorusGeometry(.080,.009,8,30),paint(0x4f493b));
        rim.position.set(s*.112,.012,.268); head.add(rim);
      }
    }
    if(!girl) rod(head,ink,v(-.04,.025,.272),v(.04,.025,.272),.008);
    egg(head,skin,0,-.043,.271,.045,.044,.048);
    const smile=new T.CatmullRomCurve3([v(-.056,-.113,.259),v(0,-.129,.264),v(.052,-.110,.259)]);
    head.add(new T.Mesh(new T.TubeGeometry(smile,9,.007,6,false),paint(0x945850)));
    for(const s of [-1,1]){
      rod(g,girl?0xf8d781:0xd6e7df,v(s*.102,1.43,.125),v(0,1.31,.213),.025);
    }
    rod(g,0x46726c,v(-.07,1.34,.205),v(.022,1.12,.219),.010);
    rod(g,0x46726c,v(.075,1.34,.201),v(.022,1.12,.219),.010);
    box(g,0xffe7ac,.022,1.075,.22,.088,.114,.018);
    function arm(side) {
      const shoulder=v(side*.253,1.29,.015);
      const upper=cyl(g,cloth,0,0,0,1,1,1), lower=cyl(g,skin,0,0,0,1,1,1);
      const elbow=egg(g,skin,0,0,0,.065,.065,.065);
      const hand=egg(g,skin,0,0,0,.071,.067,.087);
      return (target)=>{
        const wrist=g.worldToLocal(target.clone());
        const joint=shoulder.clone().lerp(wrist,.49);
        joint.x+=side*.10;joint.y-=.115;joint.z-=.065;
        poseRod(upper,shoulder,joint,.091);poseRod(lower,joint,wrist,.061);
        elbow.position.copy(joint);hand.position.copy(wrist);
      };
    }
    return {g,head,eyes,left:arm(-1),right:arm(1),x,z};
  }
  const he=actor('he',-.76,-.15),peer=actor('peer',-1.72,-.22),teacher=actor('teacher',1.70,-.25);
  function robot(parent,x,y,z,scale,color) {
    const g=group(parent,x,y,z);g.scale.setScalar(scale);
    for(const s of [-1,1]){
      const wheel=cyl(g,ink,s*.225,.133,0,.128,.081,.128);wheel.rotation.z=Math.PI/2;
      const hub=cyl(g,0xc89454,s*.272,.133,0,.055,.014,.055);hub.rotation.z=Math.PI/2;
    }
    egg(g,color,0,.298,0,.245,.177,.19);
    const h=group(g,0,.52,0);
    egg(h,color,0,0,0,.252,.184,.167);egg(h,ink,0,0,.132,.205,.095,.05);
    for(const s of [-1,1])egg(h,0x9ce7d8,s*.080,.008,.178,.026,.033,.012);
    rod(h,0x496966,v(0,.15,0),v(.045,.26,0),.014);
    egg(h,0xe9a04d,.045,.27,0,.038,.038,.038);
    const arm=group(g,-.225,.33,0); rod(arm,color,v(0,0,0),v(-.14,-.06,0),.042);
    egg(arm,color,-.14,-.06,0,.056,.067,.044);
    return {g,h,arm};
  }
  const rover=robot(scene,-1.62,1.044,.62,1.04,0xd89547);
  const twins=[robot(scene,-.29,1.05,.63,.55,0x71b5ad),robot(scene,1.66,1.05,.64,.55,0xc99db8)];
  // Hinge and socket share the same local frame as the plug in the cable shot.
  const laptop=group(scene,.65,1.045,.43);
  box(laptop,0x536865,0,.023,.14,1.05,.044,.63);
  for(let row=0;row<4;row++)for(let i=-5;i<=5;i++)box(laptop,0x293f41,i*.079,.051,-.002+row*.056,.067,.012,.045);
  box(laptop,0x809591,0,.05,.329,.245,.006,.12);
  const lid=group(laptop,0,.045,-.13);lid.rotation.x=-.105;
  box(lid,0x2b4142,0,.333,0,1.06,.665,.048);
  const display=surface(lid,.955,.54,0,.336,.028,576);
  box(laptop,0x253a37,-.528,.027,.20,.018,.034,.097);
  const plug=group(scene);box(plug,0xc57839,0,0,0,.095,.054,.072);box(plug,0xe5cc9e,.057,0,0,.044,.042,.05);
  const cable=Array.from({length:10},()=>cyl(scene,0xd1843e,0,0,0,1,1,1));
  function cord(pos){
    plug.position.copy(pos);
    const path=new T.CatmullRomCurve3([pos.clone().add(v(-.035,0,0)),v(pos.x-.16,1.07,pos.z+.035),v(-.32,1.065,.99),v(-.40,.98,1.09),v(-.43,.61,1.13)]);
    for(let i=0;i<cable.length;i++) poseRod(cable[i],path.getPoint(i/10),path.getPoint((i+1)/10),.014);
  }
  const folder=group(scene,1.72,1.05,.48);
  box(folder,0x456e69,0,.045,0,.6,.09,.46);box(folder,0xfaf0d4,0,.1,0,.55,.028,.42);
  box(folder,0x62938a,0,.121,0,.61,.029,.46);
  const sheet=group(scene,-.52,1.05,.56);
  box(sheet,0xa76b40,0,0,0,.64,.038,.55);
  const paper=surface(sheet,.61,.51,0,.022,0,400); paper.panel.rotation.x=-Math.PI/2;
  const pen=group(scene);rod(pen,0x283e3c,v(0,0,0),v(.095,.18,-.026),.016);
  egg(pen,0xddae72,0,.002,0,.015,.021,.015);
  const stamp=group(scene);box(stamp,0xae4f3c,0,.025,0,.16,.05,.13);
  cyl(stamp,0xb3663d,0,.08,0,.03,.09,.03);egg(stamp,0xbe7650,0,.14,0,.072,.044,.06);
  return {T,canvas,render,scene,camera,v,words,he,peer,teacher,rover,twins,laptop,display,plug,cord,sheet,paper,pen,stamp,folder};
}
