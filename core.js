(function (root) {
'use strict';
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function geometry(iw,ih,w,h,fx=.5,fy=.5,zoom=1,fit='cover') {
 const scale=(fit==='contain'?Math.min(w/iw,h/ih):Math.max(w/iw,h/ih))*zoom;
 const dw=iw*scale, dh=ih*scale;
 const x=dw>w?clamp(w/2-fx*dw,w-dw,0):(w-dw)/2;
 const y=dh>h?clamp(h/2-fy*dh,h-dh,0):(h-dh)/2;
 return {x,y,dw,dh,scale};
}
function dimensions(spec,logo) {
 if(spec.bounding && logo) {const s=Math.min(spec.w/logo.width,spec.h/logo.height);return {w:Math.max(1,Math.round(logo.width*s)),h:Math.max(1,Math.round(logo.height*s))};}
 return {w:spec.w,h:spec.h};
}
function safeName(s) {return String(s).normalize('NFKC').replace(/[^a-zA-Z0-9_\-\u4e00-\u9fff]/g,'_').slice(0,70)||'asset';}
function text(s,max=600) {return typeof s==='string'?s.slice(0,max):'';}
function validatePack(raw,imported=false) {
 if(!raw || !Array.isArray(raw.platforms)||!Array.isArray(raw.specs)||raw.platforms.length<1||raw.platforms.length>50||raw.specs.length>200) throw Error('规则文件需要 platforms 与 specs 数组，最多 50 个平台、200 个规格。');
 const ids=new Set(), pids=new Set();
 const validId=s=>typeof s==='string'&&!['constructor','prototype','__proto__'].includes(s)&&/^[a-z][a-z0-9-]{0,59}$/.test(s);
 const platforms=raw.platforms.map(p=>{
  if(!p||!validId(p.id)||pids.has(p.id)||!text(p.name,60)) throw Error('平台 ID 需唯一，由小写字母、数字、连字符组成，并填写名称。');
  pids.add(p.id);return {id:p.id,name:text(p.name,60),note:text(p.note)};
 });
 const specs=raw.specs.map(s=>{
  if(!s||!validId(s.id)||ids.has(s.id)||!pids.has(s.platform)||!text(s.name,80)) throw Error('规格 ID 重复、格式错误，或引用的平台不存在。');
  ids.add(s.id);
  const pending=s.w===null&&s.h===null;
  if(!pending&&(!Number.isInteger(s.w)||!Number.isInteger(s.h)||s.w<16||s.h<16||s.w>8192||s.h>8192||s.w*s.h>32000000)) throw Error('宽高须为 16–8192 的整数，且总像素不超过 3200 万。待配置槽位的宽高都须为 null。');
  if(!['png','jpg'].includes(s.format)||!['art','logo','icon','screenshot'].includes(s.kind)) throw Error('仅支持 png/jpg 格式和 art/logo/icon/screenshot 类型。');
  if(s.bounding&&s.kind!=='logo')throw Error('最大边界导出只适用于 Logo 类型。');
  if(s.maxBytes!=null&&(!Number.isInteger(s.maxBytes)||s.maxBytes<1000||s.maxBytes>100000000)) throw Error('文件体积上限须在 1000–100000000 字节之间。');
  const provenance=imported?'custom':(['official','template','suggested','unverified','custom'].includes(s.provenance)?s.provenance:'custom');
  return {id:s.id,platform:s.platform,name:text(s.name,80),w:s.w,h:s.h,format:s.format,kind:s.kind,provenance,source:/^https?:\/\//.test(s.source||'')?text(s.source,1000):'',checked:text(s.checked,30),note:text(s.note),maxBytes:s.maxBytes||null,bounding:!!s.bounding,noLogo:!!s.noLogo};
 });
 return {version:1,platforms,specs};
}
function settings(raw={}) {
 const number=(key,value,min,max)=>Number.isFinite(raw[key])?clamp(raw[key],min,max):value;
 return {fx:number('fx',.5,0,1),fy:number('fy',.5,0,1),zoom:number('zoom',1,1,3),fit:raw.fit==='contain'?'contain':'cover',logoX:number('logoX',.5,0,1),logoY:number('logoY',.78,0,1),logoScale:number('logoScale',.55,.1,1),showLogo:raw.showLogo!==false,background:/^#[0-9a-f]{6}$/i.test(raw.background)?raw.background:'#172530',reviewed:raw.reviewed===true};
}
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=(n&1)?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc32(data) {let c=0xffffffff;for(const b of data)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function zip(entries) {
 if(entries.length>65535)throw Error('文件数超出 ZIP 限制。');
 const enc=new TextEncoder(),parts=[],central=[];let offset=0;
 for(const e of entries) {
  if(e.name.includes('..')||e.name.startsWith('/')||e.name.includes('\\'))throw Error('无效的归档路径。');
  const name=enc.encode(e.name),data=e.data instanceof Uint8Array?e.data:enc.encode(e.data);
  const crc=crc32(data),local=new Uint8Array(30+name.length),v=new DataView(local.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,33,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,name.length,true);local.set(name,30);
  parts.push(local,data);
  const c=new Uint8Array(46+name.length),cv=new DataView(c.buffer);
  cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(14,33,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);c.set(name,46);central.push(c);offset+=local.length+data.length;
 }
 const len=central.reduce((a,b)=>a+b.length,0),end=new Uint8Array(22),ev=new DataView(end.buffer);
 if(offset+len>0xffffffff)throw Error('导出包超过 4 GB，请分批导出。');
 ev.setUint32(0,0x06054b50,true);ev.setUint16(8,entries.length,true);ev.setUint16(10,entries.length,true);ev.setUint32(12,len,true);ev.setUint32(16,offset,true);
 return new Blob([...parts,...central,end],{type:'application/zip'});
}
root.ReleaseCore={clamp,geometry,dimensions,safeName,validatePack,settings,crc32,zip};
if(typeof module!=='undefined')module.exports=root.ReleaseCore;
})(globalThis);
