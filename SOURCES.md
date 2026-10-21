# 规格来源与核实记录

核对日期：2026-10-21。内置规格只覆盖首版图片工作流，不能代表全部上架要求。部分字段（例如通用 PNG 输出）是工具选项，不是对官方所有要求的完整复述。

## Steam

https://partner.steamgames.com/doc/store/assets

内置 12 个规格。截图使用官方最低尺寸 1920 × 1080；库 Logo 采用最大边界等比输出，而不是强行输出 1280 × 720 的不透明矩形。

## Epic Games Store

https://dev.epicgames.com/docs/epic-games-store/sales-and-marketing/marketing/storefront-media-guide

内置 7 个规格。Offer 与 Library 横图 2560 × 1440、竖图 1200 × 1600；产品 Logo 960 × 540、PNG、1 MB；轮播图片 1920 × 1080、4 MB；社交分享图 1200 × 1200、JPG、4 MB。体积上限按十进制字节保守检查。

## itch.io

https://itch.io/docs/creators/getting-started

封面 315:250 比例，最低 315 × 250，推荐 630 × 500。官方没有要求截图必须为固定尺寸，因此工具中的 1920 × 1080 标为“建议工作尺寸”。

## GOG

官方开发者文档：
https://docs.gog.com/basic-game-assets/

该文档直接链接的官方模板 ZIP：
https://items.gog.com/templates/gog_art_assets.zip

下载包 SHA-256：
`50222fd566382488f2b7888ece1c0ae5596bf84d73b86600be229a587c9a2468`

读取方式：直接解析 PSD 的 artboardRect（Left/Top/Right/Bottom）元数据，以右减左、下减上得到尺寸。未把多画板总画布误当作导出尺寸，排除了标注 MOCKUPS / DO NOT EXPORT 的画板。

| PSD 文件 | 画板名 | 本工具预设 | 尺寸 |
|---|---|---|---|
| prod_template.psd | prod_main_banner | 产品主横幅 | 1600 × 740 |
| prod_template.psd | prod_logo | 产品 Logo | 1600 × 740 |
| prod_template.psd | prod_box | 产品封面 | 342 × 482 |
| prod_template.psd | prod_bg | 产品背景 | 2560 × 655 |
| prod_template.psd | prod_galaxy_background | GALAXY 背景 | 2560 × 670 |
| prod_template.psd | prod_web_icon | 网页图标 | 98 × 98 |
| promo_template.psd | galaxy_banner | GALAXY 推广横幅 | 1540 × 270 |
| social_template.psd | pr_square_post | 社交推广方图 | 1200 × 1200 |

模板说明要求导出时隐藏 CUT/COVER AREA、SAFE SPACE、CROP MARKS 等辅助图层，并保持 Logo 透明。工具只复用了画板尺寸，尚未实现这些模板的逐项安全区、遮罩、淡出等设计处理，也不生成分层 PSD。GOG 预设采用 PNG 作为工具默认输出，最终格式及最新要求须按实际项目后台核实。

原始 GOG 文件仅用于核实，未随本工具重新分发。建议从上面的官方链接下载模板交叉检查。

## TapTap · 2026-10-21
- 分类参考：https://www.yunheculture.com/releasecanvas/ （移动端 5 类、PC 9 类）
- 中国大陆综合规范：https://developer.taptap.cn/docs/store/release/publish/material/
- PC 指引：https://developer.taptap.cn/docs/pc-store/guide/pc-material/
- Logo 的宽或高边界及通用文件上限按综合规范处理；PC 指引的 Logo 表述不同，提交时仍以后台为准。
- 本工具选用平台允许的 PNG/JPG；每端截图组展开为 3 个独立槽位。不生成视频或 PSD。
