const sourceTitles={
  october:'10.05 · 两套系统与下一次见面',fde:'10.09 · 试点进度讨论',
  workshop:'10.24 · 培训现场逐字稿',versions:'10.24–25 · 工作坊分组练习',
  asr:'10.29 · 学校宣讲彩排逐字稿',report:'10.29 · 彩排整理与交付要求',
  plan:'11.07 · 老师怎样使用助教',demo:'11.08 · 课件与遥控器现场演示',
  git:'知识库维护日志',product:'AI 助教项目原页'
};

function sourceDetail(selected){
  return '<h3>'+escapeHtml(sourceTitles[events[selected].src])+'</h3>'+evidence(selected);
}

function sourceLibrary(selected){
  const root={folders:new Map(),files:[]};
  for(const [id,entry] of Object.entries(archive)){
    let folder=root;
    for(const part of entry.path.split('/').slice(0,-1)){
      if(!folder.folders.has(part))folder.folders.set(part,{folders:new Map(),files:[]});
      folder=folder.folders.get(part);
    }
    folder.files.push(id);
  }
  function list(folder,prefix){
    let html='';
    for(const [part,child] of folder.folders){
      // Compact a chain such as docs/meetings into one folder row.
      let node=child,path=part;
      while(!node.files.length&&node.folders.size===1){
        const [name,next]=node.folders.entries().next().value;
        path+='/'+name;node=next;
      }
      const full=prefix+path+'/';
      html+='<details open data-group="'+escapeHtml(full)+'"><summary>'+escapeHtml(path)+'/</summary><div>'+list(node,full)+'</div></details>';
    }
    for(const id of folder.files){
      const active=id===events[selected].src;
      const n=active?selected:events.findIndex(e=>e.src===id);
      html+='<button data-source="'+n+'" data-entry="'+id+'" aria-current="'+active+'" title="'+escapeHtml(archive[id].path)+'">'+escapeHtml(sourceTitles[id])+'</button>';
    }
    return html;
  }
  return '<div class="source-split"><nav class="source-library" aria-label="来源文件目录"><details open data-group="/"><summary>个人资料库/</summary><div>'+list(root,'')+'</div></details></nav><section class="source-detail" aria-label="所选文件原文">'+sourceDetail(selected)+'</section></div>';
}
