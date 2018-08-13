@echo off
set header_tpl="<div style=\"padding:12px 0;width:100%;overflow:hidden;border-bottom: 1px solid #eee;color: #5c6163;font-size:14px;\"><div style=\"float:right;\">ตฺ_PAGENUM_าณ</div><div>_SECTION_</div></div>"
ebook-convert all.html output.pdf -v --paper-size=a4 --pdf-page-margin-left=18 --pdf-page-margin-right=18 --pdf-header-template=%header_tpl% --pdf-footer-template=%header_tpl%