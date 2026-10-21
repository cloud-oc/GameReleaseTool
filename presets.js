(function (root) {
'use strict';
const sources = {
 steam: 'https://partner.steamgames.com/doc/store/assets',
 epic: 'https://dev.epicgames.com/docs/epic-games-store/sales-and-marketing/marketing/storefront-media-guide',
 itch: 'https://itch.io/docs/creators/getting-started',
 gog: 'https://items.gog.com/templates/gog_art_assets.zip'
};
const platforms = [
 {id:'steam',name:'Steam',note:'商店胶囊图、库素材与图标。文字内容与授权仍需人工确认。'},
 {id:'epic',name:'Epic Games',note:'通用 Offer 与库图分开交付；后台允许复用通用图。'},
 {id:'gog',name:'GOG',note:'尺寸读取自 GOG 官方 PSD 画板。尚未复刻模板遮罩和安全区，请结合项目后台复核；PNG 为本工具默认交付格式。'},
 {id:'itch',name:'itch.io',note:'封面推荐 630 × 500；截图没有固定尺寸，1920 × 1080 是本工具的工作尺寸。'}
];
const specs = [];
function add(platform,id,name,w,h,extra={}) {
 specs.push({platform,id:platform+'-'+id,name,w,h,format:'png',kind:'art',provenance:'official',source:sources[platform],checked:'2026-10-21',note:'请人工检查游戏标题、内容与授权。',...extra});
}
add('steam','header','商店头图',920,430);
add('steam','small','小型胶囊图',462,174,{note:'请缩小预览，确认游戏名称可读。'});
add('steam','main','主胶囊图',1232,706);
add('steam','vertical','竖版胶囊图',748,896);
add('steam','library','库封面',600,900);
add('steam','library-header','库头图',920,430);
add('steam','hero','库主视觉',3840,1240,{noLogo:true,note:'画面只包含游戏美术，不应包含文字或 Logo；本工具仅隐藏独立 Logo 图层，底图内容需人工确认。'});
add('steam','logo','库 Logo',1280,720,{kind:'logo',note:'保留 Logo 比例，宽 1280 和/或高 720，导出透明 PNG；不会强行填满矩形。',bounding:true});
add('steam','app-icon','应用图标',184,184,{format:'jpg',kind:'icon',note:'请为该槽位上传独立图标。导出 JPG。'});
add('steam','shortcut','快捷方式图标',256,256,{kind:'icon',note:'请上传独立图标；输出 Steam 接受的 PNG，不生成 ICO。'});
add('steam','background','商店页背景',1438,810,{noLogo:true,note:'可选素材；建议低干扰画面。'});
add('steam','screenshot','商店截图',1920,1080,{kind:'screenshot',format:'jpg',note:'官方最低 1920 × 1080、16:9。本槽位导出一张真实截图；可新增展示位处理其余截图。'});
add('epic','landscape','Offer 横图',2560,1440);
add('epic','portrait','Offer 竖图',1200,1600);
add('epic','library-landscape','库横图',2560,1440);
add('epic','library-portrait','库竖图',1200,1600);
add('epic','logo','产品 Logo',960,540,{kind:'logo',maxBytes:1000000,note:'PNG，最大 1 MB；保持比例居中，留白透明。'});
add('epic','carousel','轮播截图',1920,1080,{kind:'screenshot',format:'jpg',maxBytes:4000000,note:'本槽位仅生成一张图片；请上传真实游戏截图，可通过新增规格制作其余截图。'});
add('epic','social','社交分享图',1200,1200,{format:'jpg',maxBytes:4000000});
add('itch','cover','项目封面',630,500,{note:'官方建议尺寸；最低 315 × 250，保持 315:250 比例。'});
add('itch','screenshot','游戏截图',1920,1080,{kind:'screenshot',provenance:'suggested',note:'这是可编辑的工作尺寸，不是 itch.io 强制要求。官方建议提供 3–5 张截图。'});
const gogNote='尺寸来自官方 PSD 画板；请人工按原模板核对安全区、遮罩和构图。PNG 为工具默认格式，最终交付要求以项目后台为准。';
function gog(id,name,w,h,extra={}) { add('gog',id,name,w,h,{provenance:'template',note:gogNote,...extra}); }
gog('main-banner','产品主横幅',1600,740,{noLogo:true,note:gogNote+' 对应 prod_template.psd / prod_main_banner。独立 Logo 另行交付。'});
gog('logo','产品 Logo',1600,740,{kind:'logo',note:gogNote+' 对应 prod_logo，保留透明背景并检查 Logo 安全区。'});
gog('box','产品封面',342,482,{note:gogNote+' 对应 prod_box。'});
gog('background','产品背景',2560,655,{noLogo:true,note:gogNote+' 对应 prod_bg；原模板的淡出效果未自动应用。'});
gog('galaxy-background','GALAXY 背景',2560,670,{noLogo:true,note:gogNote+' 对应 prod_galaxy_background。'});
gog('web-icon','网页图标',98,98,{kind:'icon',note:gogNote+' 对应 prod_web_icon；需要独立图标。'});
gog('galaxy-banner','GALAXY 推广横幅',1540,270,{note:gogNote+' 对应 promo_template.psd / galaxy_banner。'});
gog('social-square','社交推广方图',1200,1200,{note:gogNote+' 对应 social_template.psd / pr_square_post。'});

const tapSource='https://developer.taptap.cn/docs/store/release/publish/material/';
platforms.push(
 {id:'taptap-mobile',name:'TapTap 移动端',note:'中国大陆版 · 5 类素材，截图拆为 3 个独立展示位。1:1 宣传图用于竖版视频，编辑推荐图按需提供。'},
 {id:'taptap-pc',name:'TapTap PC',note:'中国大陆版 · 9 类素材，截图拆为 3 个独立展示位。无 Logo 图请使用不含文字的底图；截图需至少 3 张不同实机画面。'}
);
function tap(platform,id,name,w,h,extra={}){add(platform,id,name,w,h,{source:tapSource,...extra});}
for(const platform of ['taptap-mobile','taptap-pc']){
 tap(platform,'promo-landscape','宣传图 · 16:9',1920,1080,{format:'jpg',maxBytes:4000000,note:'仅保留游戏名称；需兼顾 4:3 裁切，勿使用图标或截图拼贴。'});
 tap(platform,'icon','游戏图标',512,512,{kind:'icon',note:'上传独立直角方形图标，不做圆角。导出时以背景色填充透明区域，请检查图标内容。'});
 for(let i=1;i<=3;i++)tap(platform,'screenshot-'+i,'实机截图 '+i,1280,720,{kind:'screenshot',format:'jpg',maxBytes:4000000,note:'至少提交 3 张不同截图，方向及比例一致。默认横版 1280 × 720；竖屏游戏请将全部截图位改为 720 × 1280。建议每张不超过 1 MB；实机画面至少占一半。'});
}
tap('taptap-mobile','promo-square','宣传图 · 1:1',1440,1440,{format:'jpg',maxBytes:4000000,note:'竖版实机视频需要；主体内容与 16:9 宣传图保持一致。'});
tap('taptap-mobile','featured','编辑推荐图（按需）',1920,1280,{note:'仅编辑推荐游戏使用。后台可能还需 PSD 源文件，本工具只导出图片。'});
tap('taptap-pc','cover-landscape','横版游戏封面',460,215,{maxBytes:3000000});
tap('taptap-pc','cover-portrait','竖版游戏封面',600,900,{maxBytes:3000000});
tap('taptap-pc','logo','游戏 Logo',1280,720,{kind:'logo',bounding:true,maxBytes:4000000,note:'按综合素材规范，宽 1280 或高 720，保持比例输出透明 PNG。请去除源图多余边距。'});
tap('taptap-pc','library','游戏库背景壁纸',3840,1240,{format:'jpg',maxBytes:10000000,noLogo:true,note:'使用无文字、无 Logo 的底图；左侧可能覆盖公告，主体建议居中偏右。界面裁切会随窗口变化。'});
tap('taptap-pc','clean-landscape','无 Logo 横图',1920,1080,{format:'jpg',maxBytes:6000000,noLogo:true,note:'底图本身不能含文字或 Logo；与无 Logo 竖图保持画面主题一致。'});
tap('taptap-pc','clean-portrait','无 Logo 竖图',720,1080,{format:'jpg',maxBytes:6000000,noLogo:true,note:'底图本身不能含文字或 Logo；与无 Logo 横图保持画面主题一致。'});

root.ReleasePresets = {version:1,platforms,specs};
})(globalThis);
