function buildScene(behavior) {
    let fence='=';
    while(behavior.includes(']'+fence+']')) fence+='=';
    return `local s=createScene({name="${config.id.replace('-','_')}_workshop",dimensions={12,6,10}})
s:box({position={0,0,0},dimensions={12,1,10},blockId=62})
s:group("guide")
s:box({position={10,1,8},dimensions={1,1,0.5},size=0.25,color="#13756a"})
s:box({position={10,2,8},dimensions={0.75,0.5,0.5},size=0.25,color="#ffc45b"})
local model="blocktemplates/"..s.name.."_guide.x"
s:exportVoxelX(model,"guide")
s:requireModels({model})
local movie=s:movie({name="workshop",position={5,1,5},duration=2})
s:actor(movie,{name=s.name.."_guide",filename=model,position={7,1,5},scale=1,animId=0})
s:block({position={5,1,4},blockId=219})
s:editEntity(s:position({5,1,4}),function(e)
    e:SetDisplayName(s.name)
    e:SetNPLCode([${fence}[
${behavior}
]${fence}])
end)
s:block({position={5,1,3},blockId=190,data=5})
return {lever=s:position({5,1,3}),actor=s:position({7,1,5})}`;
}
