@echo off
set header_tpl="<div style=\"margin:12px 0;padding-bottom: 10px;width:100%;overflow:hidden;border-bottom: 1px solid #eee;color: #5c6163;font-size:14px;\"><div style=\"float:right;\">第 _PAGENUM_ 页</div><div>_SECTION_</div></div>"
set footer_tpl="<div style=\"margin:12px 0;padding-top: 10px;width:100%;overflow:hidden;border-top: 1px solid #eee;color: #5c6163;font-size:14px;\"><div style=\"float:right;\">第 _PAGENUM_ 页</div><div>_SECTION_</div></div>"
set is_debug=0
set inputFile=all.html
set outputFile=laravel56_doc_zh_cn.pdf
if %is_debug% equ 1 (
  set inputFile=debug.html
  set outputFile=debug.pdf
)
cd html_files
echo "%inputFile% ------  %outputFile%"
set metaOption=--title "laravel 5.6 中文文档"  --authors="流光" --comments="本PDF文档由流光整理制作 [https://github.com/liuguangw/laravel_doc]"
set commonOption=--language=zh-hans --chapter-mark=pagebreak --page-breaks-before=/  --paper-size=a4 --breadth-first
set tocOption=--level1-toc=//h:h1 --level2-toc=//h:h2 --level3-toc=//h:h3
set marginOption=--pdf-page-margin-left=18 --pdf-page-margin-right=18 --pdf-page-margin-top=38 --pdf-page-margin-bottom=38
set templateOption=--pdf-header-template=%header_tpl% --pdf-footer-template=%footer_tpl%
ebook-convert "%inputFile%" "../%outputFile%" -v   %commonOption% %tocOption% %marginOption% %templateOption% %metaOption%
cd ..