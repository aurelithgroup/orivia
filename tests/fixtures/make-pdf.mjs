/* Test PDFs built byte by byte (no PDF library needed): plain page objects, or pages hidden inside a compressed object
   stream with a compressed cross-reference stream, which is how many phone and office apps save PDFs. */
import zlib from 'node:zlib';
const enc=s=>Buffer.from(s,'latin1');
/** A plain PDF 1.4 with `pages` pages and a classic xref table. */
export function plainPdf(pages){
 const objs=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids ['+Array.from({length:pages},(_,i)=>(i+3)+' 0 R').join(' ')+'] /Count '+pages+' >>',
  ...Array.from({length:pages},()=>'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>')];
 let out='%PDF-1.4\n',offsets=[];objs.forEach((o,i)=>{offsets.push(out.length);out+=(i+1)+' 0 obj\n'+o+'\nendobj\n'});
 const x=out.length;out+='xref\n0 '+(objs.length+1)+'\n0000000000 65535 f \n'+offsets.map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+(objs.length+1)+' /Root 1 0 R >>\nstartxref\n'+x+'\n%%EOF\n';
 return new Uint8Array(enc(out));
}
/** PDF 1.5: catalog, page tree and every page inside one Flate-compressed object stream; xref stream (also compressed). */
export function objectStreamPdf(pages){
 const inner=[['1','<< /Type /Catalog /Pages 2 0 R >>'],['2','<< /Type /Pages /Kids ['+Array.from({length:pages},(_,i)=>(i+3)+' 0 R').join(' ')+'] /Count '+pages+' >>'],
  ...Array.from({length:pages},(_,i)=>[String(i+3),'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] >>'])];
 let body='',header=[];for(const [n,o] of inner){header.push(n+' '+body.length);body+=o+'\n'}
 const head=header.join(' ')+'\n',raw=enc(head+body),packed=zlib.deflateSync(raw);
 const osNum=inner.length+1,xrNum=osNum+1;
 let out=enc('%PDF-1.5\n%\xE2\xE3\xCF\xD3\n');const osOffset=out.length;
 out=Buffer.concat([out,enc(osNum+' 0 obj\n<< /Type /ObjStm /N '+inner.length+' /First '+head.length+' /Filter /FlateDecode /Length '+packed.length+' >>\nstream\n'),packed,enc('\nendstream\nendobj\n')]);
 const xrOffset=out.length;
 // xref stream rows: type(1) field2(4) field3(2)
 const row=(t,a,b)=>{const r=Buffer.alloc(7);r[0]=t;r.writeUInt32BE(a,1);r.writeUInt16BE(b,5);return r};
 const rows=[row(0,0,65535),...inner.map((_,i)=>row(2,osNum,i)),row(1,osOffset,0),row(1,xrOffset,0)];
 const xr=zlib.deflateSync(Buffer.concat(rows));
 out=Buffer.concat([out,enc(xrNum+' 0 obj\n<< /Type /XRef /Size '+(xrNum+1)+' /W [1 4 2] /Root 1 0 R /Filter /FlateDecode /Length '+xr.length+' >>\nstream\n'),xr,enc('\nendstream\nendobj\nstartxref\n'+xrOffset+'\n%%EOF\n')]);
 return new Uint8Array(out);
}
/** An encrypted PDF (trailer names an /Encrypt dictionary). */
export function encryptedPdf(){const p=Buffer.from(plainPdf(2)).toString('latin1').replace('/Root 1 0 R >>','/Root 1 0 R /Encrypt << /Filter /Standard /V 2 /R 3 /Length 128 /P -4 >> >>');return new Uint8Array(enc(p))}
/** A damaged PDF: a header and a compressed object stream whose data is not valid Flate. */
export function brokenPdf(){return new Uint8Array(enc('%PDF-1.5\n5 0 obj\n<< /Type /ObjStm /N 3 /First 10 /Filter /FlateDecode /Length 12 >>\nstream\nnot-deflate!\nendstream\nendobj\n%%EOF\n'))}
