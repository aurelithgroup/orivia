/* Presentation only: caller supplies already-vetted citeSegments() output.
   Keep source mapping and unknown markers in the existing citation parser. */
export function referenceLabel(source) {
  try { const u=new URL(source.url);if(u.protocol!=='https:'||u.username||u.password)return null;return u.hostname.replace(/^www\./,''); } catch { return null; }
}
export function renderCompactReferences(segments, document, {sourceLabel='Source', openLabel='opens in a new tab'}={}) {
  return segments.map(segment=>{
    if(segment.text!=null)return document.createTextNode(segment.text);
    const host=referenceLabel(segment.src||{});
    if(!host)return document.createTextNode('['+segment.n+']');
    const a=document.createElement('a');a.className='orivia-reference';
    a.href=segment.src.url;a.target='_blank';a.rel='noopener noreferrer';
    a.textContent=host;a.title=segment.src.title||host;
    a.setAttribute('aria-label',`${sourceLabel} ${segment.n}: ${segment.src.title||host} — ${openLabel}`);
    return a;
  });
}
