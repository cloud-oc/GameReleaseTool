(function(){
'use strict';
const key='gamereleasetool-theme',media=matchMedia('(prefers-color-scheme: dark)');
let mode='system';try{const saved=localStorage.getItem(key);if(['system','light','dark'].includes(saved))mode=saved;}catch{}
function apply(){document.documentElement.dataset.theme=mode==='system'?(media.matches?'dark':'light'):mode;document.documentElement.dataset.themeMode=mode;const glyph=document.getElementById('theme-icon');if(glyph)glyph.setAttribute('href','#i-'+({system:'system',light:'sun',dark:'moon'})[mode]);}
apply();media.addEventListener('change',()=>{if(mode==='system')apply();});
document.addEventListener('DOMContentLoaded',()=>{const field=document.getElementById('theme-mode');field.value=mode;apply();field.addEventListener('change',()=>{mode=field.value;try{localStorage.setItem(key,mode);}catch{}apply();});});
window.addEventListener('storage',event=>{if(event.key!==key)return;mode=['light','dark'].includes(event.newValue)?event.newValue:'system';apply();const field=document.getElementById('theme-mode');if(field)field.value=mode;});
})();