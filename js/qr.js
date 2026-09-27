/* Minimal QR code generator (byte mode, error correction level M).
   Adapted from Project Nayuki's QR Code generator (MIT licence), trimmed for Orivia's links.
   qrSvg(text, {size, dark, light}) returns an <svg> string. */
(function(){
  const ECC = [-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28];
  const BLOCKS = [-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49];
  const FORMAT_ECL = 0; // M
  function rawModules(ver){
    let r = (16*ver + 128)*ver + 64;
    if(ver >= 2){ const n = Math.floor(ver/7) + 2; r -= (25*n - 10)*n - 55; if(ver >= 7) r -= 36; }
    return r;
  }
  const dataCodewords = ver => Math.floor(rawModules(ver)/8) - ECC[ver]*BLOCKS[ver];
  function rsMul(x, y){ let z = 0; for(let i=7;i>=0;i--){ z = (z<<1) ^ ((z>>>7)*0x11D); z ^= ((y>>>i)&1)*x; } return z & 0xFF; }
  function rsDivisor(deg){ const r = new Array(deg).fill(0); r[deg-1] = 1; let root = 1;
    for(let i=0;i<deg;i++){ for(let j=0;j<r.length;j++){ r[j] = rsMul(r[j], root); if(j+1 < r.length) r[j] ^= r[j+1]; } root = rsMul(root, 2); } return r; }
  function rsRemainder(data, div){ const r = div.map(()=>0);
    for(const b of data){ const f = b ^ r.shift(); r.push(0); div.forEach((c,i)=> r[i] ^= rsMul(c, f)); } return r; }
  function encode(text){
    const bytes = Array.from(new TextEncoder().encode(text));
    let ver = 1;
    for(;;ver++){ if(ver > 40) throw new Error('Too long'); const cc = ver < 10 ? 8 : 16;
      if(4 + cc + bytes.length*8 <= dataCodewords(ver)*8) break; }
    const bits = []; const put = (v, n) => { for(let i=n-1;i>=0;i--) bits.push((v>>>i)&1); };
    put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach(b=>put(b,8));
    const cap = dataCodewords(ver)*8;
    put(0, Math.min(4, cap - bits.length)); put(0, (8 - bits.length % 8) % 8);
    for(let p=0xEC; bits.length < cap; p ^= 0xEC ^ 0x11) put(p, 8);
    const data = []; for(let i=0;i<bits.length;i+=8){ let b=0; for(let k=0;k<8;k++) b = (b<<1)|bits[i+k]; data.push(b); }
    /* split into blocks, add error correction, interleave */
    const nb = BLOCKS[ver], ecl = ECC[ver], raw = Math.floor(rawModules(ver)/8);
    const nShort = nb - raw % nb, shortLen = Math.floor(raw/nb);
    const div = rsDivisor(ecl), blocks = [];
    for(let i=0,k=0;i<nb;i++){ const d = data.slice(k, k + shortLen - ecl + (i < nShort ? 0 : 1)); k += d.length;
      const e = rsRemainder(d, div); if(i < nShort) d.push(0); blocks.push(d.concat(e)); }
    const all = [];
    for(let i=0;i<blocks[0].length;i++) blocks.forEach((b,j)=>{ if(i !== shortLen - ecl || j >= nShort) all.push(b[i]); });
    return draw(ver, all);
  }
  function draw(ver, codewords){
    const size = ver*4 + 17, M = [], F = [];
    for(let i=0;i<size;i++){ M.push(new Array(size).fill(false)); F.push(new Array(size).fill(false)); }
    const set = (x,y,d) => { M[y][x] = d; F[y][x] = true; };
    for(let i=0;i<size;i++){ set(6,i,i%2===0); set(i,6,i%2===0); }
    const finder = (x,y) => { for(let dy=-4;dy<=4;dy++) for(let dx=-4;dx<=4;dx++){ const d = Math.max(Math.abs(dx),Math.abs(dy)), xx=x+dx, yy=y+dy;
      if(xx>=0&&xx<size&&yy>=0&&yy<size) set(xx,yy,d!==2&&d!==4); } };
    finder(3,3); finder(size-4,3); finder(3,size-4);
    const al = []; if(ver > 1){ const n = Math.floor(ver/7)+2, step = ver===32 ? 26 : Math.ceil((ver*4+4)/(n*2-2))*2;
      al.push(6); for(let p=size-7; al.length<n; p-=step) al.splice(1,0,p); }
    al.forEach((a,i)=>al.forEach((b,j)=>{ if((i===0&&j===0)||(i===0&&j===al.length-1)||(i===al.length-1&&j===0)) return;
      for(let dy=-2;dy<=2;dy++) for(let dx=-2;dx<=2;dx++) set(a+dx,b+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1); }));
    const drawFormat = mask => {
      const data = FORMAT_ECL << 3 | mask; let rem = data; for(let i=0;i<10;i++) rem = (rem<<1) ^ ((rem>>>9)*0x537);
      const b = (data<<10 | rem) ^ 0x5412;
      for(let i=0;i<=5;i++) set(8,i,(b>>>i)&1); set(8,7,(b>>>6)&1); set(8,8,(b>>>7)&1); set(7,8,(b>>>8)&1);
      for(let i=9;i<15;i++) set(14-i,8,(b>>>i)&1);
      for(let i=0;i<8;i++) set(size-1-i,8,(b>>>i)&1);
      for(let i=8;i<15;i++) set(8,size-15+i,(b>>>i)&1);
      set(8,size-8,true);
    };
    drawFormat(0);
    if(ver >= 7){ let rem = ver; for(let i=0;i<12;i++) rem = (rem<<1) ^ ((rem>>>11)*0x1F25); const b = ver<<12 | rem;
      for(let i=0;i<18;i++){ const bit = (b>>>i)&1, a = size-11+i%3, c = Math.floor(i/3); set(a,c,bit); set(c,a,bit); } }
    let i = 0;
    for(let right=size-1; right>=1; right-=2){ if(right===6) right = 5;
      for(let v=0; v<size; v++) for(let j=0;j<2;j++){ const x = right-j, up = ((right+1)&2)===0, y = up ? size-1-v : v;
        if(!F[y][x] && i < codewords.length*8){ M[y][x] = ((codewords[i>>>3] >>> (7-(i&7)))&1) === 1; i++; } } }
    const maskFn = [(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,
      (x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
    const applyMask = m => { for(let y=0;y<size;y++) for(let x=0;x<size;x++) if(!F[y][x] && maskFn[m](x,y)) M[y][x] = !M[y][x]; };
    const penalty = () => { let p = 0;
      for(let pass=0;pass<2;pass++) for(let a=0;a<size;a++){ let run = 1;
        for(let b=1;b<size;b++){ const cur = pass ? M[b][a] : M[a][b], prev = pass ? M[b-1][a] : M[a][b-1];
          if(cur===prev){ run++; if(run===5) p+=3; else if(run>5) p++; } else run = 1; } }
      for(let y=0;y<size-1;y++) for(let x=0;x<size-1;x++){ const c = M[y][x]; if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1]) p+=3; }
      const pat = [true,false,true,true,true,false,true];
      for(let y=0;y<size;y++) for(let x=0;x<=size-7;x++){
        let h=true, v=true; for(let k=0;k<7;k++){ if(M[y][x+k]!==pat[k]) h=false; if(M[x+k][y]!==pat[k]) v=false; }
        const light = (arr) => arr.every(z=>!z);
        if(h){ const L4 = x>=4 ? light([M[y][x-1],M[y][x-2],M[y][x-3],M[y][x-4]]) : true, R4 = x+11<=size ? light([M[y][x+7],M[y][x+8],M[y][x+9],M[y][x+10]]) : true; if(L4||R4) p+=40; }
        if(v){ const L4 = x>=4 ? light([M[x-1][y],M[x-2][y],M[x-3][y],M[x-4][y]]) : true, R4 = x+11<=size ? light([M[x+7][y],M[x+8][y],M[x+9][y],M[x+10][y]]) : true; if(L4||R4) p+=40; } }
      let dark = 0; M.forEach(r=>r.forEach(c=>{ if(c) dark++; })); const tot = size*size;
      p += (Math.ceil(Math.abs(dark*20 - tot*10)/tot) - 1) * 10; return p; };
    let best = 0, bestP = Infinity;
    for(let m=0;m<8;m++){ applyMask(m); drawFormat(m); const p = penalty(); if(p < bestP){ bestP = p; best = m; } applyMask(m); }
    applyMask(best); drawFormat(best);
    return M;
  }
  window.qrMatrix = encode;
  window.qrSvg = function(text, o={}){
    const M = encode(text), n = M.length, q = 4, S = n + q*2;
    let d = ''; M.forEach((r,y)=>r.forEach((c,x)=>{ if(c) d += `M${x+q},${y+q}h1v1h-1z`; }));
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${o.size||240}" height="${o.size||240}" shape-rendering="crispEdges" role="img" aria-label="QR code"><rect width="${S}" height="${S}" fill="${o.light||'#fff'}"/><path d="${d}" fill="${o.dark||'#1C2733'}"/></svg>`;
  };
})();
