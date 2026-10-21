(function(){
'use strict';
const C=ReleaseCore,E=ReleaseEngine,P=ReleasePresets,$=id=>document.getElementById(id);
const clone=o=>JSON.parse(JSON.stringify(o));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state,images={art:null,logo:null,overrides:{}},busy=false,saveTimer,drawTimer,saveChain=Promise.resolve(),revision=0;
const blank=()=>({version:1,presetRevision:2,name:'我的游戏',pack:clone(P),assets:{art:null,logo:null,overrides:{}},layouts:{},selected:P.specs.filter(s=>s.w&&s.kind==='art').map(s=>s.id),activePlatform:'steam',activeId:'steam-header',history:[],demo:false,demoAssets:{art:false,logo:false}});
const spec=()=>state.pack.specs.find(s=>s.id===state.activeId);
const layout=s=>state.layouts[s.id]||(state.layouts[s.id]=C.settings());
const platform=id=>state.pack.platforms.find(p=>p.id===id);
const stamp=()=>new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});
function say(message,error=false){$('message').textContent=message;$('message').className='message'+(error?' error':'');}
function dirty(){revision++;$('save-state').textContent='正在保存…';clearTimeout(saveTimer);const rev=revision;saveTimer=setTimeout(()=>{const snapshot=clone(state);saveChain=saveChain.catch(()=>{}).then(()=>E.save(snapshot)).then(()=>{if(revision===rev)$('save-state').textContent='已保存在此浏览器 · '+stamp();}).catch(()=>{$('save-state').textContent='本地存储不可用，请下载项目备份';});},450);}
function edit(){if(spec())layout(spec()).reviewed=false;dirty();draw();updateChecks();}
function draw(){clearTimeout(drawTimer);drawTimer=setTimeout(drawNow,35);}
function drawNow(){
 const s=spec();if(!s)return;
 const host=$('canvas-host');host.replaceChildren();
 if(!s.w||!s.h){host.innerHTML='<div class="empty-canvas"><h2>先定义这个展示位</h2><p>GOG 的项目要求可能不同。填写你收到的实际尺寸后，即可在这里编排素材。</p><button data-action="edit-spec">填写规格</button></div>';return;}
 if(!E.sourceFor(s,images)){host.innerHTML='<div class="empty-canvas"><svg width="40" height="40" viewBox="0 0 64 64" aria-hidden="true"><rect x="9" y="9" width="46" height="46" rx="3"/><path d="M9 43l15-16 12 12 7-8 12 12M42 20h1"/></svg><h2>'+(s.kind==='art'?'从一张主视觉开始':s.kind==='logo'?'添加透明 Logo':'为这个展示位添加'+(s.kind==='icon'?'图标':'截图'))+'</h2><p>导入一张图片，调整构图，即可生成多平台素材。</p><button class="primary" data-action="'+(s.kind==='art'?'upload-art':s.kind==='logo'?'upload-logo':'upload-override')+'">导入图片</button><button class="text-button" data-action="demo">先试试示例</button></div>';}
 else{const cv=E.render(s,layout(s),images,1000);cv.id='main-canvas';cv.setAttribute('aria-label',s.name+'构图预览，可用构图设置调整');host.append(cv);if($('guides').checked){const guides=document.createElement('div');guides.className='guides';host.append(guides);}wireDrag(cv);}
 document.querySelectorAll('[data-preview]').forEach(el=>{const t=state.pack.specs.find(s=>s.id===el.dataset.preview);el.replaceChildren();if(t?.w&&E.sourceFor(t,images))el.append(E.render(t,layout(t),images,200));else el.innerHTML='<span>'+(!t?.w?'待配置':t?.kind==='logo'?'Logo':t?.kind==='screenshot'?'截图':t?.kind==='icon'?'图标':'主视觉')+'</span>';});
}
function updateChecks(){
 const s=spec();if(!s)return;
 const issues=E.checks(s,layout(s),images);
 $('checks').innerHTML=issues.map(i=>'<li class="'+i.level+'">'+esc(i.text)+'</li>').join('')||'<li class="ok">当前基础检查无异常。最终仍以平台审核为准。</li>';
 $('slot-note').textContent=s.note;
 $('asset-tip-title').textContent=s.kind==='screenshot'?'截图宣发贴士':s.kind==='icon'?'图标识别贴士':s.kind==='logo'?'Logo 交付贴士':'主视觉宣发贴士';
 $('asset-tip').textContent=s.kind==='screenshot'?'每张截图讲清一个玩法亮点，避免多张近似画面。保留真实游戏表现，不把宣传概念图当作实机截图。':s.kind==='icon'?'缩小后检查轮廓是否仍容易辨认。少用细碎文字，优先突出一个有记忆点的游戏元素。':s.kind==='logo'?'使用透明底原图；同时在浅色和深色背景上检查边缘。网站主题仅影响工作区，不会改变导出图片。':s.noLogo?'这类背景由商店叠加界面信息。请使用干净底图，为后续文字和按钮留出空间。':'先传达游戏类型与独特卖点，减少无关元素。不同平台可以调整构图，保留一致的标题与视觉识别。';
 $('provenance').textContent=({official:'已核对公开规格',template:'官方模板尺寸',suggested:'建议工作尺寸',custom:'用户自定义',unverified:'待核实规格'})[s.provenance];
 $('provenance').className='badge '+(s.provenance==='official'?'verified':'pending');
 const source=$('source-link');source.hidden=!s.source;source.href=s.source||'#';source.textContent='查看规格来源'+(s.checked?' · '+s.checked:'');
 $('reviewed').checked=layout(s).reviewed;
 $('export-count').textContent=state.selected.length;
}
function refresh(){
 const focused=document.activeElement;const focusKey=focused?.dataset.platform?['platform',focused.dataset.platform]:focused?.dataset.slot?['slot',focused.dataset.slot]:null;
 $('project-name').value=state.name;
 $('platform-nav').innerHTML=state.pack.platforms.map(p=>{const specs=state.pack.specs.filter(s=>s.platform===p.id);return '<button class="platform-tab '+(state.activePlatform===p.id?'active':'')+'" data-platform="'+p.id+'" aria-pressed="'+(state.activePlatform===p.id)+'"><span>'+esc(p.name)+'</span><span class="count">'+specs.filter(s=>s.w).length+(specs.some(s=>!s.w)?' + 待配':'')+'</span></button>';}).join('');
 $('platform-name').textContent=platform(state.activePlatform)?.name||'平台';
 $('platform-note').textContent=platform(state.activePlatform)?.note||'';
 const list=state.pack.specs.filter(s=>s.platform===state.activePlatform);
 if(!list.some(s=>s.id===state.activeId))state.activeId=list[0]?.id;

 $('thumbnails').innerHTML=list.map(s=>'<button class="thumbnail '+(s.id===state.activeId?'active':'')+'" data-slot="'+s.id+'" aria-pressed="'+(s.id===state.activeId)+'" aria-label="编辑'+esc(s.name)+'"><div class="thumb-image" data-preview="'+s.id+'"></div><span>'+esc(s.name)+'</span><small>'+(s.w?s.w+' × '+s.h:'未配置')+'</small></button>').join('');
 $('slot-select').innerHTML=list.map(s=>'<option value="'+s.id+'">'+esc(s.name)+'</option>').join('');
 $('slot-select').value=state.activeId||'';$('slot-select').disabled=!list.length;
 $('format-count').textContent=list.length+' 项规格';
 const s=spec();$('editor-content').hidden=!s;$('no-slots').hidden=!!s;
 if(s){
  const l=layout(s);$('slot-title').textContent=s.name;$('slot-size').textContent=s.w?s.w+' × '+s.h+' px · '+s.format.toUpperCase():'待配置尺寸';
  for(const key of ['fx','fy','zoom','logoX','logoY','logoScale']){$(key).value=l[key];$(key+'-value').textContent=key==='zoom'?l[key].toFixed(2)+'×':Math.round(l[key]*100)+'%';}
  $('fit').value=l.fit;$('background').value=l.background;$('showLogo').checked=l.showLogo;
  $('logo-settings').hidden=s.kind!=='art'||s.noLogo;
  $('crop-settings').hidden=s.kind==='logo';
  $('override-status').textContent=!E.sourceFor(s,images)?'尚未导入图片':state.assets.overrides[s.id]?'已使用独立图片':'使用'+(s.kind==='art'?'全局主视觉':s.kind==='logo'?'全局 Logo':'独立图片（待添加）');
  $('remove-override').hidden=!state.assets.overrides[s.id];
  $('download-one').disabled=!s.w||!E.sourceFor(s,images);
  updateChecks();
 }
 $('art-label').textContent=images.art?images.art.width+' × '+images.art.height:'添加主视觉';
 $('logo-label').textContent=images.logo?images.logo.width+' × '+images.logo.height:'添加 Logo';
 $('demo-flag').hidden=!state.demo;draw();
 if(focusKey){const target=document.querySelector('[data-'+focusKey[0]+'="'+focusKey[1]+'"]');target?.focus({preventScroll:true});}
 for(const selector of ['#platform-nav .active','#thumbnails .active']){const el=document.querySelector(selector);if(el){const parent=el.parentElement;const r=el.getBoundingClientRect(),pr=parent.getBoundingClientRect();if(r.left<pr.left)parent.scrollLeft-=pr.left-r.left;else if(r.right>pr.right)parent.scrollLeft+=r.right-pr.right;}}
}
async function decodeAssets(data){const result={art:null,logo:null,overrides:{}};for(const key of ['art','logo'])if(data[key])result[key]=await E.imageFrom(data[key]);for(const [id,value] of Object.entries(data.overrides||{})){if(Object.keys(result.overrides).length>200)throw Error('独立图片数量过多。');result.overrides[id]=await E.imageFrom(value);}return result;}
async function validateProject(raw){
 if(!raw||raw.version!==1||!raw.assets||!raw.pack)throw Error('这不是有效的项目备份。');
 const pack=C.validatePack(raw.pack);
 // Upgrade old projects once, preserving user-owned platform definitions.
 if((raw.presetRevision||1)<2){
  for(const id of ['taptap-mobile','taptap-pc']){
   if(pack.platforms.some(p=>p.id===id)||pack.specs.some(s=>P.specs.some(t=>t.platform===id&&t.id===s.id)))continue;
   pack.platforms.push(clone(P.platforms.find(p=>p.id===id)));
   pack.specs.push(...C.validatePack(P).specs.filter(s=>s.platform===id));
  }
 }
 const valid=new Set(pack.specs.map(s=>s.id));
 const built=C.validatePack(P).specs;
 for(const s of pack.specs){const original=built.find(b=>b.id===s.id);if(!original||JSON.stringify(original)!==JSON.stringify(s))s.provenance=s.provenance==='unverified'?'unverified':'custom';}
 const out=blank();out.name=typeof raw.name==='string'?raw.name.slice(0,80):'导入的项目';out.pack=pack;
 out.assets={art:raw.assets.art||null,logo:raw.assets.logo||null,overrides:{}};
 for(const [id,data] of Object.entries(raw.assets.overrides||{}))if(valid.has(id))out.assets.overrides[id]=data;
 for(const s of pack.specs)out.layouts[s.id]=C.settings(raw.layouts?.[s.id]);
 out.selected=Array.isArray(raw.selected)?[...new Set(raw.selected.filter(id=>valid.has(id)))]:[];
 out.activePlatform=pack.platforms.some(p=>p.id===raw.activePlatform)?raw.activePlatform:pack.platforms[0]?.id;
 out.activeId=valid.has(raw.activeId)?raw.activeId:pack.specs[0]?.id;
 out.history=Array.isArray(raw.history)?raw.history.slice(-10).filter(h=>h&&typeof h.date==='string'&&Number.isInteger(h.count)).map(h=>({date:h.date,count:h.count,files:Array.isArray(h.files)?h.files.filter(f=>f&&typeof f.path==='string'&&typeof f.hash==='string').map(f=>({path:f.path.slice(0,200),hash:f.hash.slice(0,64)})):[]})):[];
 out.demoAssets={art:raw.demoAssets?raw.demoAssets.art===true:raw.demo===true,logo:raw.demoAssets?raw.demoAssets.logo===true:raw.demo===true};out.demo=out.demoAssets.art||out.demoAssets.logo;
 const decoded=await decodeAssets(out.assets);return {project:out,decoded};
}
async function upload(kind,file){if(!file)return;const data=await E.readFile(file),im=await E.imageFrom(data);if(kind==='override'){const s=spec();if(!s)return;state.assets.overrides[s.id]=data;images.overrides[s.id]=im;layout(s).reviewed=false;}else{state.assets[kind]=data;images[kind]=im;for(const s of state.pack.specs)layout(s).reviewed=false;state.demoAssets[kind]=false;state.demo=state.demoAssets.art||state.demoAssets.logo;}dirty();refresh();say('图片已加载，只在本地处理。');}
function backup(){E.download(new Blob([JSON.stringify(state)],{type:'application/json'}),C.safeName(state.name)+'.release-project.json');say('项目备份已下载，包含源图、布局和平台规则。');}
async function demo(){
 if((state.assets.art||state.assets.logo)&&!confirm('测试图会替换当前全局主视觉和 Logo。建议先下载备份。继续吗？'))return;
 const c=document.createElement('canvas');c.width=3840;c.height=2160;const x=c.getContext('2d');x.fillStyle='#193b46';x.fillRect(0,0,c.width,c.height);
 x.fillStyle='#a4c1bb';x.fillRect(2100,0,1740,2160);x.fillStyle='#e9b16c';x.beginPath();x.arc(2500,1050,580,0,Math.PI*2);x.fill();x.fillStyle='#e6ede7';x.fillRect(500,420,920,1320);x.fillStyle='#355e68';x.fillRect(650,570,620,1020);
 x.strokeStyle='#ffffff';x.lineWidth=5;x.strokeRect(120,120,3600,1920);x.font='54px sans-serif';x.fillStyle='#ffffff';x.fillText('COMPOSITION TEST / 3840 × 2160',180,1990);x.fillText('仅用于测试裁剪 · 非游戏美术',180,2080);
 const l=document.createElement('canvas');l.width=1400;l.height=350;const lx=l.getContext('2d');lx.fillStyle='#ffffff';lx.font='bold 156px sans-serif';lx.textAlign='center';lx.fillText('YOUR GAME',700,175);lx.font='52px sans-serif';lx.fillText('示例标题 · 请替换',700,275);
 state.assets.art=c.toDataURL();state.assets.logo=l.toDataURL();images.art=await E.imageFrom(state.assets.art);images.logo=await E.imageFrom(state.assets.logo);state.demoAssets={art:true,logo:true};state.demo=true;for(const s of state.pack.specs)layout(s).reviewed=false;dirty();refresh();say('');
}
function wireDrag(cv){let drag;cv.addEventListener('pointerdown',e=>{if(spec().kind==='logo')return;const s=spec(),src=E.sourceFor(s,images);if(!src)return;const st=layout(s),rect=cv.getBoundingClientRect();const g=C.geometry(src.width,src.height,rect.width,rect.height,st.fx,st.fy,st.zoom,st.fit);drag={x:e.clientX,y:e.clientY,fx:st.fx,fy:st.fy,dw:g.dw,dh:g.dh};cv.setPointerCapture(e.pointerId);});
 cv.addEventListener('pointermove',e=>{if(!drag)return;const st=layout(spec());st.fx=C.clamp(drag.fx-(e.clientX-drag.x)/drag.dw,0,1);st.fy=C.clamp(drag.fy-(e.clientY-drag.y)/drag.dh,0,1);for(const key of ['fx','fy']){$(key).value=st[key];$(key+'-value').textContent=Math.round(st[key]*100)+'%';}const updated=E.render(spec(),st,images,1000);cv.getContext('2d').clearRect(0,0,cv.width,cv.height);cv.getContext('2d').drawImage(updated,0,0);});
 const finish=()=>{if(drag){drag=null;edit();}};cv.addEventListener('pointerup',finish);cv.addEventListener('pointercancel',finish);
}
function showRules(){
 $('rules-panel').hidden=false;$('workspace').hidden=true;$('delivery-panel').hidden=true;
 $('rules-json').value=JSON.stringify(state.pack,null,2);$('rules-help').textContent='修改后导入的规格会标为“用户自定义”。支持新增平台；每个平台和展示位 ID 必须唯一。';
 $('spec-platform').innerHTML=state.pack.platforms.map(p=>'<option value="'+p.id+'">'+esc(p.name)+'</option>').join('');
 fillSpecForm(spec());
}
function fillSpecForm(s){$('spec-edit-id').value=s?.id||'';$('spec-id').value=s?.id||'';$('spec-id').readOnly=!!s;$('spec-platform').value=s?.platform||state.activePlatform;$('spec-name').value=s?.name||'';$('spec-w').value=s?.w||'';$('spec-h').value=s?.h||'';$('spec-format').value=s?.format||'png';$('spec-kind').value=s?.kind||'art';$('spec-source').value=s?.source||'';$('spec-note').value=s?.note||'';$('spec-max').value=s?.maxBytes||'';$('spec-noLogo').checked=!!s?.noLogo;$('spec-bounding').checked=!!s?.bounding;$('spec-form-title').textContent=s?'修改展示位':'新增展示位';}
function saveSpec(e){e.preventDefault();const id=$('spec-id').value.trim();const item={id,platform:$('spec-platform').value,name:$('spec-name').value.trim(),w:Number($('spec-w').value),h:Number($('spec-h').value),format:$('spec-format').value,kind:$('spec-kind').value,provenance:'custom',source:$('spec-source').value.trim(),checked:new Date().toISOString().slice(0,10),note:$('spec-note').value.trim(),maxBytes:$('spec-max').value?Number($('spec-max').value):null,noLogo:$('spec-noLogo').checked,bounding:$('spec-bounding').checked};
 const pack=clone(state.pack);const index=pack.specs.findIndex(s=>s.id===id);if(!$('spec-edit-id').value&&index!==-1)throw Error('ID 已存在，请换一个。');if(index===-1)pack.specs.push(item);else pack.specs[index]=item;state.pack=C.validatePack(pack);state.activeId=id;state.activePlatform=item.platform;state.layouts[id]=C.settings(state.layouts[id]);state.layouts[id].reviewed=false;dirty();showWorkspace();say('规格已保存，可立即编排并导出。');}
function showWorkspace(){$('rules-panel').hidden=true;$('delivery-panel').hidden=true;$('workspace').hidden=false;refresh();}
function showDelivery(){
 $('rules-panel').hidden=true;$('workspace').hidden=true;$('delivery-panel').hidden=false;renderDelivery();
}
function renderDelivery(){
 $('delivery-list').innerHTML=state.pack.platforms.map(p=>'<section class="delivery-group"><h3>'+esc(p.name)+'</h3>'+state.pack.specs.filter(s=>s.platform===p.id).map(s=>{const issues=E.checks(s,layout(s),images),errors=issues.filter(i=>i.level==='error');return '<label class="delivery-row"><input type="checkbox" data-export-id="'+s.id+'" '+(state.selected.includes(s.id)?'checked':'')+'><span><strong>'+esc(s.name)+'</strong><small>'+esc(s.id)+'.'+s.format+'</small></span><span class="dimensions">'+(s.w?s.w+' × '+s.h:'未配置')+'</span><span class="'+(errors.length?'error-text':issues.length?'warning-text':'ok-text')+'">'+esc(errors[0]?.text||(issues.length?'有 '+issues.length+' 项待确认':'基础检查无异常'))+'</span></label>';}).join('')+'</section>').join('');
 const selected=state.pack.specs.filter(s=>state.selected.includes(s.id)),errors=selected.reduce((n,s)=>n+E.checks(s,layout(s),images).filter(i=>i.level==='error').length,0);
 $('delivery-summary').textContent='已选 '+selected.length+' 项'+(errors?' · '+errors+' 个阻塞问题':' · 文件将按平台分目录导出');$('export-zip').disabled=busy||!selected.length||errors>0;
 $('history').innerHTML=state.history.length?state.history.slice().reverse().map(h=>'<li><time>'+esc(new Date(h.date).toLocaleString('zh-CN'))+'</time><span>'+h.count+' 个文件</span></li>').join(''):'<li>尚无导出记录</li>';
 $('demo-export').hidden=!state.demo;
}
async function exportZip(){
 if(busy)return;const selected=state.pack.specs.filter(s=>state.selected.includes(s.id));if(!selected.length)throw Error('请至少选择一个展示位。');if(selected.some(s=>E.checks(s,layout(s),images).some(i=>i.level==='error')))throw Error('请先修复所选展示位的阻塞问题。');
 busy=true;$('export-zip').disabled=true;document.querySelectorAll('button,input,select,textarea').forEach(el=>{if(!el.disabled){el.dataset.busyEnabled='1';el.disabled=true;}});
 const entries=[],files=[];const date=new Date().toISOString();try{
  for(let i=0;i<selected.length;i++){
   const s=selected[i];$('export-progress').textContent='正在生成 '+(i+1)+' / '+selected.length+'：'+s.name;await new Promise(r=>setTimeout(r,0));
   const cv=E.render(s,layout(s),images),blob=await E.blobFor(cv,s.format),data=new Uint8Array(await blob.arrayBuffer());
   if(s.maxBytes&&blob.size>s.maxBytes)throw Error(s.name+' 生成后为 '+(blob.size/1000000).toFixed(2)+' MB，超过限制 '+(s.maxBytes/1000000)+' MB。请改用允许的 JPG 格式或简化图像，再导出。');
   const issues=E.checks(s,layout(s),images);
   if(s.kind==='logo'&&s.format==='png'&&!await E.alphaPresent(E.sourceFor(s,images)))issues.push({level:'warning',text:'Logo 源图未检测到透明像素，请人工确认透明背景要求。'});
   const path=s.platform+'/'+C.safeName(s.id)+'.'+s.format,hash=await E.sha(data);
   entries.push({name:path,data});files.push({path,hash,width:cv.width,height:cv.height,bytes:blob.size,spec:s,layout:C.settings(layout(s)),issues});cv.width=1;cv.height=1;
  }
  const old=new Map((state.history.at(-1)?.files||[]).map(f=>[f.path,f.hash]));
  const manifest={application:'GameReleaseTool',version:1,date,project:state.name,demo:state.demo,scope:'selected-image-assets-only',approval:'Not a platform approval or complete submission checklist.',hashAlgorithm:files.every(f=>f.hash)?'SHA-256':null,files,changes:files.map(f=>({path:f.path,state:!old.has(f.path)?'added':f.hash&&old.get(f.path)===f.hash?'unchanged':'changed'})),notExported:state.pack.specs.filter(s=>!state.selected.includes(s.id)).map(s=>({id:s.id,reason:!s.w?'unconfigured':'not-selected'}))};
  entries.push({name:'manifest.json',data:JSON.stringify(manifest,null,2)});
  entries.push({name:'READ-ME.txt',data:'本包仅包含本次勾选的图片，不代表完整上架资料或平台审核通过。\n请查看 manifest.json 中的 issues、规格来源与未导出项。\n'+(state.demo?'当前使用测试图，请勿作为正式游戏素材提交。\n':'')+'GOG 规格须以项目对接要求为准。\n生成时间：'+date});
  E.download(C.zip(entries),C.safeName(state.name)+'-'+date.slice(0,10)+'.zip');
  state.history.push({date,count:files.length,files:files.map(f=>({path:f.path,hash:f.hash||''}))});state.history=state.history.slice(-10);dirty();$('export-progress').textContent='导出完成：'+files.length+' 张图片 + 清单。';say('ZIP 已下载。导出记录和文件校验值已保存在项目中。');
 }finally{busy=false;document.querySelectorAll('[data-busy-enabled]').forEach(el=>{el.disabled=false;delete el.dataset.busyEnabled;});renderDelivery();}
}
async function single(){const s=spec();if(!s||!s.w||!E.sourceFor(s,images))throw Error('此展示位尚不能生成。');const cv=E.render(s,layout(s),images),blob=await E.blobFor(cv,s.format);if(s.maxBytes&&blob.size>s.maxBytes)throw Error('文件超过此规格的体积上限，请调整后重试。');E.download(blob,s.id+'.'+s.format);say('单张图片已下载；基础尺寸符合当前配置，人工检查仍需完成。');}
function guarded(fn){return async(...args)=>{try{await fn(...args);}catch(e){console.error(e);say(e.message||'操作失败，请重试。',true);if(!$('delivery-panel').hidden)$('export-progress').textContent=e.message;}};}
const actions={
 'upload-art':()=>$('art-file').click(),'upload-logo':()=>$('logo-file').click(),'upload-override':()=>$('override-file').click(),
 'demo':demo,'backup':backup,'open-project':()=>$('project-file').click(),'rules':showRules,'edit-spec':showRules,'workspace':showWorkspace,'delivery':showDelivery,'export':exportZip,'single':single,
 'new-spec':()=>fillSpecForm(null),
 'remove-override':()=>{delete state.assets.overrides[spec().id];delete images.overrides[spec().id];edit();refresh();},
 'reset-layout':()=>{state.layouts[spec().id]=C.settings();dirty();refresh();},
 'apply-focus':()=>{const current=layout(spec());for(const s of state.pack.specs)if(s.kind==='art'){const l=layout(s);l.fx=current.fx;l.fy=current.fy;l.reviewed=false;}dirty();refresh();say('已将此焦点应用到全部主视觉展示位；各展示位缩放仍保持独立。');},
 'select-ready':()=>{state.selected=state.pack.specs.filter(s=>!E.checks(s,layout(s),images).some(i=>i.level==='error')).map(s=>s.id);dirty();renderDelivery();},
 'select-none':()=>{state.selected=[];dirty();renderDelivery();},
 'select-platform':()=>{state.selected=state.pack.specs.filter(s=>s.platform===state.activePlatform).map(s=>s.id);dirty();renderDelivery();},
 'export-rules':()=>E.download(new Blob([JSON.stringify(state.pack,null,2)],{type:'application/json'}),'platform-rules.json'),
 'import-rules':()=>$('rules-file').click(),
 'apply-json':()=>{const pack=C.validatePack(JSON.parse($('rules-json').value),true);if(!pack.platforms.length)throw Error('请保留至少一个平台。');if(!confirm('应用规则会替换当前平台列表。已删除槽位的布局不再显示，建议先备份项目。继续吗？'))return;state.pack=pack;state.selected=state.selected.filter(id=>pack.specs.some(s=>s.id===id));state.activePlatform=pack.platforms[0].id;state.activeId=pack.specs[0]?.id;for(const s of pack.specs)layout(s).reviewed=false;dirty();showWorkspace();say('已应用自定义平台规则。');},
 'new-project':async()=>{if(!confirm('开始新项目会替换当前工作区，请先下载备份。继续吗？'))return;state=blank();images={art:null,logo:null,overrides:{}};dirty();showWorkspace();say('已创建新项目。');}
};
async function start(){
 state=blank();
 document.addEventListener('click',guarded(async e=>{if(busy)return;const a=e.target.closest('[data-action]');if(a){a.closest('.project-menu')?.removeAttribute('open');await actions[a.dataset.action]?.();return;}const p=e.target.closest('[data-platform]');if(p){state.activePlatform=p.dataset.platform;refresh();dirty();return;}const s=e.target.closest('[data-slot]');if(s){state.activeId=s.dataset.slot;refresh();dirty();}}));
 for(const kind of ['art','logo','override'])$(kind+'-file').addEventListener('change',guarded(async e=>{await upload(kind,e.target.files[0]);e.target.value='';}));
 $('project-file').addEventListener('change',guarded(async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(file.size>180000000)throw Error('项目备份过大（超过 180 MB）。');const incoming=await validateProject(JSON.parse(await file.text()));if(!confirm('用导入项目替换当前工作区？请确认当前项目已有备份。'))return;state=incoming.project;images=incoming.decoded;dirty();showWorkspace();say('项目已恢复。');}));
 $('rules-file').addEventListener('change',guarded(async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(file.size>1000000)throw Error('规则文件超过 1 MB。');const pack=C.validatePack(JSON.parse(await file.text()),true);$('rules-json').value=JSON.stringify(pack,null,2);say('规则已载入编辑区，检查后点击“应用规则”。');}));
 $('slot-select').addEventListener('change',()=>{state.activeId=$('slot-select').value;refresh();dirty();});
 $('project-name').addEventListener('change',()=>{state.name=$('project-name').value.trim().slice(0,80)||'未命名项目';dirty();});
 for(const key of ['fx','fy','zoom','logoX','logoY','logoScale'])$(key).addEventListener('input',()=>{if(!spec())return;layout(spec())[key]=Number($(key).value);$(key+'-value').textContent=key==='zoom'?Number($(key).value).toFixed(2)+'×':Math.round(Number($(key).value)*100)+'%';edit();});
 for(const key of ['fit','background','showLogo'])$(key).addEventListener('input',()=>{layout(spec())[key]=$(key).type==='checkbox'?$(key).checked:$(key).value;edit();});
 $('reviewed').addEventListener('change',()=>{layout(spec()).reviewed=$('reviewed').checked;dirty();updateChecks();});
 $('guides').addEventListener('change',draw);
 $('delivery-list').addEventListener('change',e=>{const id=e.target.dataset.exportId;if(!id)return;state.selected=e.target.checked?[...new Set([...state.selected,id])]:state.selected.filter(x=>x!==id);dirty();renderDelivery();});
 $('spec-form').addEventListener('submit',guarded(saveSpec));
 $('canvas-host').addEventListener('dragover',e=>{e.preventDefault();$('canvas-host').classList.add('dragover');});
 $('canvas-host').addEventListener('dragleave',()=>$('canvas-host').classList.remove('dragover'));
 $('canvas-host').addEventListener('drop',guarded(async e=>{e.preventDefault();$('canvas-host').classList.remove('dragover');await upload('override',e.dataTransfer.files[0]);}));
 refresh();
 try{const stored=await E.load();if(stored){const loaded=await validateProject(stored);state=loaded.project;images=loaded.decoded;refresh();$('save-state').textContent='已恢复上次工作区';}else $('save-state').textContent='项目自动保存在此浏览器';}catch(e){$('save-state').textContent='本地恢复不可用，请导入备份';say('无法恢复本地工作区：'+e.message,true);}
 rootDebug();
}
function rootDebug(){globalThis.ReleaseApp={getState:()=>clone(state),getImages:()=>images,refresh,validateProject,exportZip,demo};}
start();
})();
