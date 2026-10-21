(function(root){
'use strict';
const C=root.ReleaseCore;
async function imageFrom(data) {
 if(typeof data!=='string'||!/^data:image\/(png|jpeg|webp);base64,/.test(data))throw Error('只接受 PNG、JPG 或 WebP 静态图片。');
 if(data.length>42000000)throw Error('单张图片超过 30 MB，请先压缩。');
 const im=new Image();im.src=data;await im.decode();
 if(im.width*im.height>64000000||im.width>16384||im.height>16384)throw Error('图片过大：请控制在 6400 万像素、单边 16384 像素以内。');
 return im;
}
function readFile(file) {
 if(file.size>30000000) return Promise.reject(Error('文件超过 30 MB，请先压缩。'));
 return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('文件读取失败，请重新选择。'));r.readAsDataURL(file);});
}
function sourceFor(spec,assets){return assets.overrides?.[spec.id]||(spec.kind==='logo'?assets.logo:spec.kind==='art'?assets.art:null);}
function makeCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function render(spec,setting,assets,maxWidth=0){
 const src=sourceFor(spec,assets),dim=C.dimensions(spec,src);
 if(!dim.w||!dim.h)throw Error('请先填写展示位尺寸。');
 const scale=maxWidth?Math.min(1,maxWidth/dim.w,650/dim.h):1;
 const cv=makeCanvas(Math.max(1,Math.round(dim.w*scale)),Math.max(1,Math.round(dim.h*scale))),ctx=cv.getContext('2d',{colorSpace:'srgb'});
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 const st=C.settings(setting);
 if(spec.kind!=='logo'||spec.format==='jpg'){ctx.fillStyle=st.background;ctx.fillRect(0,0,cv.width,cv.height);}
 if(src){
  const g=C.geometry(src.width,src.height,cv.width,cv.height,st.fx,st.fy,spec.kind==='logo'?1:st.zoom,spec.kind==='logo'?'contain':st.fit);
  ctx.drawImage(src,g.x,g.y,g.dw,g.dh);
 }
 if(spec.kind==='art'&&!spec.noLogo&&st.showLogo&&assets.logo){
  const logo=assets.logo;const lw=cv.width*st.logoScale;
  const ls=Math.min(lw/logo.width,cv.height*.8/logo.height);
  const w=logo.width*ls,h=logo.height*ls;
  ctx.drawImage(logo,(cv.width-w)*st.logoX,(cv.height-h)*st.logoY,w,h);
 }
 return cv;
}
async function blobFor(canvas,format){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('浏览器编码图片失败，请缩小尺寸重试。')),format==='jpg'?'image/jpeg':'image/png',.92));}
function checks(spec,setting,assets) {
 const issues=[],src=sourceFor(spec,assets),st=C.settings(setting);
 if(!spec.w||!spec.h)issues.push({level:'error',text:'尚未配置尺寸，无法导出。'});
 if(!src)issues.push({level:'error',text:spec.kind==='logo'?'缺少 Logo 图片。':spec.kind==='icon'?'请为此展示位上传独立图标。':spec.kind==='screenshot'?'请为此展示位上传真实截图。':'缺少主视觉图片。'});
 if(spec.provenance!=='official')issues.push({level:'warning',text:spec.provenance==='template'?'仅核对官方 PSD 画板尺寸；安全区、模板效果和最终格式需人工确认。':spec.provenance==='suggested'?'当前为建议工作尺寸，并非平台固定要求。':spec.provenance==='unverified'?'平台规格尚未核实。':'用户自定义规格，请自行核对平台要求。'});
 if(src&&spec.w&&spec.h){
  const dim=C.dimensions(spec,src),g=C.geometry(src.width,src.height,dim.w,dim.h,st.fx,st.fy,spec.kind==='logo'?1:st.zoom,spec.kind==='logo'?'contain':st.fit);
  if(g.scale>1.01)issues.push({level:'warning',text:'原图将被放大 '+g.scale.toFixed(2)+' 倍，可能模糊。'});
 }
 if(spec.kind==='art'&&!spec.noLogo&&st.showLogo&&!assets.logo)issues.push({level:'warning',text:'未加载独立 Logo；请确认主视觉中已包含合适的游戏标题。'});
 if(!st.reviewed)issues.push({level:'warning',text:'尚未人工确认构图、文字、安全区及素材授权。'});
 return issues;
}
async function alphaPresent(image){const c=makeCanvas(Math.min(image.width,512),Math.min(image.height,512));const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,c.width,c.height);const data=ctx.getImageData(0,0,c.width,c.height).data;for(let i=3;i<data.length;i+=4)if(data[i]<255)return true;return false;}
async function sha(data){if(!root.crypto?.subtle)return null;return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),x=>x.toString(16).padStart(2,'0')).join('');}
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}
let dbPromise;
function db(){if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open('release-workbench-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('projects');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});return dbPromise;}
async function save(project){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction('projects','readwrite');tx.objectStore('projects').put(project,'current');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}
async function load(){const d=await db();return new Promise((resolve,reject)=>{const req=d.transaction('projects').objectStore('projects').get('current');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
root.ReleaseEngine={imageFrom,readFile,sourceFor,render,blobFor,checks,alphaPresent,sha,download,save,load};
})(globalThis);
