/* Local speech chunking only. Cleo integrates this helper into Listen; no audio or requests here. */
(function(){
 'use strict';
 function chunks(value,limit=200){
  const points=Array.from(String(value??'')),out=[];
  const size=Math.max(16,Math.min(1000,Math.floor(Number(limit)||200)));
  let offset=0;
  while(offset<points.length){
   let end=Math.min(points.length,offset+size);
   if(end<points.length){
    const lower=offset+Math.floor(size*.5);
    for(let i=end;i>lower;i--)if(/[\s.!?。！？।۔]/u.test(points[i-1])){end=i;break}
   }
   out.push(points.slice(offset,end).join(''));offset=end;
  }
  return out;
 }
 window.OriviaVoiceText={chunks};
})();
