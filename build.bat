@echo off
set header_tpl="<div style=\"padding:12px 0;width:100%;overflow:hidden;border-bottom: 1px solid #eee;color: #5c6163;font-size:14px;\"><div style=\"float:right;\">��_PAGENUM_ҳ</div><div>_SECTION_</div></div>"
set is_debug=0
set inputFile=all.html
set outputFile=laravel56_doc_zh_cn.pdf
if %is_debug% equ 1 (
  set inputFile=debug.html
  set outputFile=debug.pdf
)
cd html_files
echo "%inputFile% ------  %outputFile%" 
ebook-convert "%inputFile%" "../%outputFile%" -v --paper-size=a4 --breadth-first --level1-toc=//h:h1 --level2-toc=//h:h2 --level3-toc=//h:h3 --authors="����" --pdf-page-margin-left=18 --pdf-page-margin-right=18 --pdf-header-template=%header_tpl% --pdf-footer-template=%header_tpl%
cd ..