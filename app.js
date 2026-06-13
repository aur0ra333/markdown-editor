// =============================================================================
// Markdown 编辑器 — 核心逻辑
// =============================================================================

marked.setOptions({
    breaks: true,
    gfm: true
});

// =============================================================================
// DOM 引用
// =============================================================================
const input = document.getElementById('markdown-input');
const previewContent = document.getElementById('preview-content');
const htmlContent = document.getElementById('html-content');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const lineCount = document.getElementById('line-count');
const themeToggle = document.getElementById('theme-toggle');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const headingCount = document.getElementById('heading-count');
const lastSaved = document.getElementById('last-saved');
const autoSaveIndicator = document.getElementById('auto-save-indicator');
const outlineList = document.getElementById('outline-list');
const checkTitle = document.getElementById('check-title');
const checkLength = document.getElementById('check-length');
const checkCode = document.getElementById('check-code');
const docTitleInput = document.getElementById('document-title');
const documentCount = document.getElementById('document-count');
const documentList = document.getElementById('document-list');
const fileInput = document.getElementById('file-input');
const searchInput = document.getElementById('search-input');
const replaceInput = document.getElementById('replace-input');
const searchCount = document.getElementById('search-count');
const regexToggle = document.getElementById('regex-toggle');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');

// =============================================================================
// 状态
// =============================================================================
let currentVersionIndex = -1;
let versionHistory = [];
let documents = [];
let currentDocId = null;
let currentMatchIndex = -1;
let useRegex = false;
let undoStack = [];
let redoStack = [];
let lastUndoPushTime = 0;
let isUndoRedo = false;

// =============================================================================
// 撤销 / 重做 (Undo/Redo)
// =============================================================================
const UNDO_DEBOUNCE = 500;
const MAX_UNDO = 100;

function pushUndo(content) {
    if (isUndoRedo) return;
    const now = Date.now();
    // 500ms 内的连续输入合并为一条记录
    if (now - lastUndoPushTime < UNDO_DEBOUNCE && undoStack.length > 0) {
        undoStack[undoStack.length - 1] = content;
    } else {
        undoStack.push(content);
        if (undoStack.length > MAX_UNDO) undoStack.shift();
    }
    lastUndoPushTime = now;
    redoStack = []; // 新操作清空重做栈
    updateUndoRedoButtons();
}

function undo() {
    if (undoStack.length <= 1) return;
    isUndoRedo = true;
    redoStack.push(undoStack.pop());
    input.value = undoStack[undoStack.length - 1];
    updatePreview();
    updateUndoRedoButtons();
    isUndoRedo = false;
    input.focus();
}

function redo() {
    if (redoStack.length === 0) return;
    isUndoRedo = true;
    undoStack.push(redoStack.pop());
    input.value = undoStack[undoStack.length - 1];
    updatePreview();
    updateUndoRedoButtons();
    isUndoRedo = false;
    input.focus();
}

function updateUndoRedoButtons() {
    const canUndo = undoStack.length > 1;
    const canRedo = redoStack.length > 0;
    undoBtn.disabled = !canUndo;
    redoBtn.disabled = !canRedo;
    undoBtn.style.opacity = canUndo ? '1' : '0.4';
    redoBtn.style.opacity = canRedo ? '1' : '0.4';
}

function resetUndoRedo() {
    undoStack = [];
    redoStack = [];
    lastUndoPushTime = 0;
    updateUndoRedoButtons();
}

// =============================================================================
// 默认内容
// =============================================================================
const defaultContent = `# Markdown 编辑器

这是一个用于记录笔记、整理文档和预览排版的轻量工具。左侧编写 Markdown，右侧实时查看效果，也可以导出为 HTML 或通过浏览器保存为 PDF。

## 常用功能

- 实时预览
- 本地文档库和自动草稿
- 快捷插入标题、链接、引用和代码
- 搜索、替换和格式整理
- 本地保存最近 20 个历史版本
- 导出 Markdown、HTML 和 PDF

## 代码示例

\`\`\`javascript
function hello() {
    console.log('Hello Markdown');
}
\`\`\`

> 提示：可以先点击"插入模板"，再根据实际内容修改。

## 表格示例

| 功能 | 状态 |
| --- | --- |
| 实时预览 | 已完成 |
| 文档库 | 已完成 |
| 导出 HTML | 已完成 |
`;

// =============================================================================
// 预览渲染
// =============================================================================
function updatePreview() {
    const markdown = input.value;
    const html = marked.parse(markdown);

    previewContent.innerHTML = html;
    addHeadingAnchors();

    // 代码语法高亮（highlight.js 自动检测语言）
    previewContent.querySelectorAll('pre code').forEach(function (block) {
        hljs.highlightElement(block);
    });

    htmlContent.textContent = previewContent.innerHTML;
    charCount.textContent = markdown.length + ' 字符';

    const words = markdown.trim().split(/\s+/).filter(Boolean);
    wordCount.textContent = words.length + ' 词';

    const lines = markdown.split('\n').length;
    lineCount.textContent = lines + ' 行';

    updateOutline();
    updateChecks(markdown);
    updateSearchCount();
    highlightSearchInPreview();
    saveDraft();
}

function addHeadingAnchors() {
    previewContent.querySelectorAll('h1, h2, h3').forEach(function (heading, index) {
        heading.id = 'heading-' + index;
    });
}

// =============================================================================
// 文档目录
// =============================================================================
function updateOutline() {
    var headings = [].slice.call(previewContent.querySelectorAll('h1, h2, h3')).map(function (heading) {
        return {
            id: heading.id,
            level: Number(heading.tagName.replace('H', '')),
            title: heading.textContent.trim()
        };
    });

    headingCount.textContent = headings.length;

    if (!headings.length) {
        outlineList.innerHTML = '<p>输入标题后自动生成目录。</p>';
        return;
    }

    outlineList.innerHTML = headings.map(function (heading) {
        return '<button class="outline-item level-' + heading.level + '" type="button" onclick="scrollToHeading(\'' + heading.id + '\')">' +
            heading.title +
            '</button>';
    }).join('');
}

function scrollToHeading(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// =============================================================================
// 写作检查
// =============================================================================
function updateChecks(markdown) {
    checkTitle.classList.toggle('done', /^#\s+.+/m.test(markdown));
    checkLength.classList.toggle('done', markdown.trim().length >= 200);
    checkCode.classList.toggle('done', /```|^\s*[-*]\s+/m.test(markdown));
}

// =============================================================================
// 工具栏插入
// =============================================================================
function insertMarkdown(syntax) {
    var start = input.selectionStart;
    var end = input.selectionEnd;
    var selected = input.value.substring(start, end);
    var before = input.value.substring(0, start);
    var after = input.value.substring(end);

    var snippets = {
        '# ': (syntax + (selected || '标题')),
        '**': '**' + (selected || '文本') + '**',
        '*': '*' + (selected || '文本') + '*',
        '[ ]( )': '[' + (selected || '链接文本') + '](https://example.com)',
        '![ ]( )': '![' + (selected || '图片描述') + '](https://example.com/image.png)',
        '> ': '> ' + (selected || '引用内容'),
        '- ': '- ' + (selected || '列表项'),
        '`  `': '`' + (selected || 'code') + '`'
    };

    var inserted = snippets[syntax] || syntax;
    input.value = before + inserted + after;
    input.focus();
    input.setSelectionRange(before.length + inserted.length, before.length + inserted.length);
    updatePreview();
}

// =============================================================================
// 格式整理
// =============================================================================
function formatMarkdown() {
    if (!input.value.trim()) {
        showNotification('请先输入内容', 'info');
        return;
    }

    var formatted = input.value
        .replace(/[ \t]+$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
        .replace(/(#{1,6}\s.*)\n([^\n#])/g, '$1\n\n$2')
        .trim();

    input.value = formatted + '\n';
    updatePreview();
    showNotification('格式已整理', 'success');
}

function insertTemplate() {
    var template = '# 文档标题\n\n## 背景\n\n说明这篇文档要解决的问题。\n\n## 目标\n\n- 目标一\n- 目标二\n\n## 方案\n\n描述实现思路、关键步骤或核心内容。\n\n## 待办\n\n- [ ] 补充细节\n- [ ] 检查格式\n';
    insertAtCursor(template);
    showNotification('已插入模板', 'success');
}

function insertAtCursor(text) {
    var start = input.selectionStart;
    var before = input.value.substring(0, start);
    var after = input.value.substring(input.selectionEnd);
    input.value = before + text + after;
    input.focus();
    input.setSelectionRange(before.length + text.length, before.length + text.length);
    updatePreview();
}

// =============================================================================
// 复制 / 导出
// =============================================================================
function copyContent() {
    navigator.clipboard.writeText(htmlContent.textContent).then(function () {
        showNotification('HTML 已复制到剪贴板', 'success');
    }).catch(function (error) {
        console.error('复制失败:', error);
        showNotification('复制失败，请检查浏览器权限', 'error');
    });
}

function downloadFile() {
    downloadBlob(input.value, getSafeTitle() + '.md', 'text/markdown');
    showNotification('Markdown 文件已下载', 'success');
}

function exportHTML() {
    var fullHTML = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>' + escapeHtml(docTitleInput.value || '导出的文档') + '</title>\n    <style>\n        body {\n            max-width: 800px;\n            margin: 0 auto;\n            padding: 32px;\n            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;\n            line-height: 1.7;\n            color: #1f2937;\n        }\n        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }\n        pre { background: #111827; color: #f9fafb; padding: 16px; border-radius: 8px; overflow-x: auto; }\n        blockquote { border-left: 4px solid #2563eb; margin-left: 0; padding-left: 16px; color: #4b5563; }\n        img { max-width: 100%; height: auto; }\n        a { color: #2563eb; }\n    </style>\n</head>\n<body>\n' + previewContent.innerHTML + '\n</body>\n</html>';

    downloadBlob(fullHTML, getSafeTitle() + '.html', 'text/html');
    showNotification('HTML 文件已导出', 'success');
}

function exportPDF() {
    // 创建隐藏的打印专用 iframe，替代 window.open() 方案
    var iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;border:none;z-index:99999;background:#fff;';
    document.body.appendChild(iframe);

    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write('<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n    <meta charset="UTF-8">\n    <title>' + escapeHtml(docTitleInput.value || '导出的文档') + '</title>\n    <style>\n        @page {\n            margin: 20mm;\n            size: A4;\n        }\n        body {\n            max-width: 800px;\n            margin: 0 auto;\n            padding: 24px;\n            font-family: "Source Sans 3", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;\n            line-height: 1.7;\n            color: #17202a;\n        }\n        h1, h2, h3, h4, h5, h6 {\n            page-break-after: avoid;\n        }\n        pre, blockquote, table, img {\n            page-break-inside: avoid;\n        }\n        pre {\n            white-space: pre-wrap;\n            word-wrap: break-word;\n            background: #f3f4f6;\n            padding: 15px;\n            border-radius: 8px;\n            overflow-x: auto;\n        }\n        code {\n            background: #f3f4f6;\n            padding: 2px 6px;\n            border-radius: 4px;\n            font-family: "Courier New", "Cascadia Code", monospace;\n        }\n        pre code {\n            background: none;\n            padding: 0;\n        }\n        blockquote {\n            border-left: 4px solid #2563eb;\n            margin-left: 0;\n            padding-left: 16px;\n            color: #4b5563;\n        }\n        img { max-width: 100%; height: auto; }\n        a { color: #2563eb; }\n        table { border-collapse: collapse; width: 100%; }\n        th, td { border: 1px solid #d9e2ec; padding: 8px 12px; text-align: left; }\n    </style>\n</head>\n<body>\n' + previewContent.innerHTML + '\n</body>\n</html>');
    iframeDoc.close();

    iframe.onload = function () {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (e) {
            console.error('打印失败:', e);
            showNotification('打印失败，请尝试使用浏览器打印功能', 'error');
        }
        // 延迟移除 iframe，等待打印对话框关闭
        setTimeout(function () {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 2000);
    };

    // 如果 onload 已经触发（部分浏览器），手动调用
    setTimeout(function () {
        try {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        } catch (e) {
            // 忽略
        }
        setTimeout(function () {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 2000);
    }, 500);

    showNotification('已打开打印窗口，可另存为 PDF', 'success');
}

function downloadBlob(content, filename, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function getSafeTitle() {
    return (docTitleInput.value || 'document')
        .trim()
        .replace(/[\\/:*?"<>|]/g, '-')
        .replace(/\s+/g, '-')
        .slice(0, 60) || 'document';
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (char) {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[char];
    });
}

// =============================================================================
// 文档库
// =============================================================================
function loadDocuments() {
    try {
        documents = JSON.parse(localStorage.getItem('markdownDocuments') || '[]');
    } catch (error) {
        console.error('文档库读取失败:', error);
        documents = [];
    }
    renderDocuments();
}

function saveCurrentDocument() {
    var now = new Date().toLocaleString('zh-CN');
    var title = docTitleInput.value.trim() || '未命名文档';
    var payload = {
        id: currentDocId || crypto.randomUUID(),
        title: title,
        content: input.value,
        updatedAt: now
    };

    var index = documents.findIndex(function (doc) { return doc.id === payload.id; });
    if (index >= 0) {
        documents[index] = payload;
    } else {
        documents.unshift(payload);
    }

    currentDocId = payload.id;
    localStorage.setItem('markdownDocuments', JSON.stringify(documents));
    lastSaved.textContent = now.replace(/\d{4}\/\d{1,2}\/\d{1,2}\s*/, '');
    renderDocuments();
    showNotification('已保存到本地文档库', 'success');
}

function renderDocuments() {
    documentCount.textContent = documents.length;

    if (!documents.length) {
        documentList.innerHTML = '<p class="doc-empty-msg">保存后会显示在这里。</p>';
        return;
    }

    documentList.innerHTML = documents.map(function (doc) {
        var isActive = doc.id === currentDocId ? ' active' : '';
        return '<div class="document-item-wrapper' + isActive + '">' +
            '<button class="document-item" onclick="openDocument(\'' + doc.id + '\')">' +
                '<span class="doc-item-title">' + escapeHtml(doc.title) + '</span>' +
                '<small>' + doc.updatedAt + '</small>' +
            '</button>' +
            '<div class="document-item-actions">' +
                '<button class="btn-doc-action btn-doc-rename" onclick="event.stopPropagation();renameDocument(\'' + doc.id + '\')" title="重命名">&#9998;</button>' +
                '<button class="btn-doc-action btn-doc-delete" onclick="event.stopPropagation();deleteDocument(\'' + doc.id + '\')" title="删除">&times;</button>' +
            '</div>' +
        '</div>';
    }).join('');
}

function renameDocument(id) {
    var doc = documents.find(function (d) { return d.id === id; });
    if (!doc) return;
    var newName = prompt('重命名文档：', doc.title);
    if (newName !== null && newName.trim() !== '') {
        doc.title = newName.trim();
        localStorage.setItem('markdownDocuments', JSON.stringify(documents));
        if (currentDocId === id) {
            docTitleInput.value = doc.title;
        }
        renderDocuments();
        showNotification('文档已重命名', 'success');
    }
}

function deleteDocument(id) {
    var doc = documents.find(function (d) { return d.id === id; });
    if (!doc) return;
    if (!confirm('确定要删除文档 "' + doc.title + '" 吗？\n此操作不可撤销。')) return;

    documents = documents.filter(function (d) { return d.id !== id; });
    if (currentDocId === id) {
        currentDocId = null;
    }
    localStorage.setItem('markdownDocuments', JSON.stringify(documents));
    renderDocuments();
    showNotification('文档已删除', 'success');
}

function openDocument(id) {
    var doc = documents.find(function (item) { return item.id === id; });
    if (!doc) return;

    currentDocId = doc.id;
    docTitleInput.value = doc.title;
    input.value = doc.content;
    lastSaved.textContent = doc.updatedAt.replace(/\d{4}\/\d{1,2}\/\d{1,2}\s*/, '');
    resetUndoRedo();
    pushUndo(input.value);
    updatePreview();
    renderDocuments();
    showNotification('文档已打开', 'success');
}

function createNewDocument() {
    currentDocId = null;
    docTitleInput.value = '未命名文档';
    input.value = '# 未命名文档\n\n开始记录你的内容。\n';
    lastSaved.textContent = '未保存';
    resetUndoRedo();
    pushUndo(input.value);
    updatePreview();
    renderDocuments();
}

function importMarkdownFile(file) {
    var reader = new FileReader();
    reader.onload = function () {
        currentDocId = null;
        docTitleInput.value = file.name.replace(/\.(md|markdown|txt)$/i, '');
        input.value = String(reader.result || '');
        lastSaved.textContent = '未保存';
        resetUndoRedo();
        pushUndo(input.value);
        updatePreview();
        renderDocuments();
        showNotification('文件已导入，可继续编辑或保存', 'success');
    };
    reader.readAsText(file);
}

// =============================================================================
// 草稿 / 自动保存
// =============================================================================
function saveDraft() {
    localStorage.setItem('markdownDraft', JSON.stringify({
        title: docTitleInput.value,
        content: input.value,
        currentDocId: currentDocId
    }));

    // 更新自动保存指示器
    var now = new Date();
    var timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    autoSaveIndicator.textContent = '已保存 ' + timeStr;
    autoSaveIndicator.classList.add('saved');
    setTimeout(function () {
        autoSaveIndicator.classList.remove('saved');
    }, 2000);
}

function loadDraft() {
    var saved = localStorage.getItem('markdownDraft');
    if (!saved) {
        input.value = defaultContent;
        return;
    }

    try {
        var draft = JSON.parse(saved);
        docTitleInput.value = draft.title || '项目说明文档';
        input.value = draft.content || defaultContent;
        currentDocId = draft.currentDocId || null;
    } catch (e) {
        input.value = defaultContent;
    }
}

// =============================================================================
// 搜索 / 替换（增强版）
// =============================================================================
function updateSearchCount() {
    var query = searchInput.value;
    if (!query) {
        searchCount.textContent = '0 处匹配';
        currentMatchIndex = -1;
        return;
    }

    var matches = getMatches(query);
    searchCount.textContent = matches.length + ' 处匹配';
    if (!matches.length) currentMatchIndex = -1;
}

function getMatches(query) {
    if (!query) return [];
    try {
        var flags = 'g' + (useRegex ? '' : 'i');
        var pattern;
        if (useRegex) {
            pattern = new RegExp(query, flags);
        } else {
            pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
        }
        return [].slice.call(input.value.matchAll(pattern)).map(function (match) { return match.index; });
    } catch (e) {
        return [];
    }
}

function getSearchPattern() {
    var query = searchInput.value;
    if (!query) return null;
    try {
        if (useRegex) {
            return new RegExp(query, 'gi');
        } else {
            return new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        }
    } catch (e) {
        return null;
    }
}

function findNextMatch() {
    var query = searchInput.value;
    var matches = getMatches(query);
    if (!query || !matches.length) {
        showNotification('没有找到匹配内容', 'info');
        return;
    }

    currentMatchIndex = (currentMatchIndex + 1) % matches.length;
    var start = matches[currentMatchIndex];
    input.focus();
    input.setSelectionRange(start, start + query.length);
    // 滚动到选中的匹配位置（在 textarea 中）
    var lineHeight = parseInt(getComputedStyle(input).lineHeight, 10) || 25;
    var linesBefore = input.value.substring(0, start).split('\n').length - 1;
    input.scrollTop = linesBefore * lineHeight - input.clientHeight / 2;
}

function replaceCurrentMatch() {
    var query = searchInput.value;
    if (!query) return;

    var selection = input.value.substring(input.selectionStart, input.selectionEnd);
    var pattern = getSearchPattern();
    if (pattern && pattern.test(selection)) {
        // 当前选中内容匹配搜索词，执行替换
        var start = input.selectionStart;
        var end = input.selectionEnd;
        input.value = input.value.substring(0, start) + replaceInput.value + input.value.substring(end);
        input.setSelectionRange(start, start + replaceInput.value.length);
        updatePreview();
        showNotification('已替换当前匹配', 'success');
    } else {
        findNextMatch();
    }
}

function replaceAllMatches() {
    var query = searchInput.value;
    if (!query) return;

    var matches = getMatches(query);
    if (!matches.length) {
        showNotification('没有找到匹配内容', 'info');
        return;
    }

    var pattern = getSearchPattern();
    if (!pattern) return;

    input.value = input.value.replace(pattern, replaceInput.value);
    updatePreview();
    showNotification('已替换 ' + matches.length + ' 处', 'success');
}

// =============================================================================
// 搜索高亮（预览区）
// =============================================================================
function highlightSearchInPreview() {
    // 先移除已有高亮
    previewContent.querySelectorAll('mark.search-highlight').forEach(function (el) {
        var parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });

    var query = searchInput.value.trim();
    if (!query) return;

    var pattern = getSearchPattern();
    if (!pattern) return;

    highlightTextNodes(previewContent, pattern);
}

function highlightTextNodes(element, pattern) {
    var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    var nodesToReplace = [];

    while (walker.nextNode()) {
        var node = walker.currentNode;
        if (!node.textContent.trim()) continue;
        var parent = node.parentElement;
        if (!parent) continue;
        if (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') continue;
        if (parent.closest('mark.search-highlight')) continue;
        if (parent.closest('pre')) continue; // 跳过代码块
        pattern.lastIndex = 0;
        if (pattern.test(node.textContent)) {
            nodesToReplace.push(node);
        }
    }

    nodesToReplace.forEach(function (node) {
        var fragment = document.createDocumentFragment();
        var lastIndex = 0;
        var match;
        pattern.lastIndex = 0;
        var text = node.textContent;

        while ((match = pattern.exec(text)) !== null) {
            if (match.index > lastIndex) {
                fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
            }
            var mark = document.createElement('mark');
            mark.className = 'search-highlight';
            mark.textContent = match[0];
            fragment.appendChild(mark);
            lastIndex = pattern.lastIndex;
            if (match[0].length === 0) pattern.lastIndex++;
        }

        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
        node.parentNode.replaceChild(fragment, node);
    });
}

// =============================================================================
// 视图切换
// =============================================================================
document.querySelectorAll('.btn-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
        document.querySelectorAll('.btn-toggle').forEach(function (item) { item.classList.remove('active'); });
        btn.classList.add('active');

        var isPreview = btn.dataset.view === 'preview';
        previewContent.style.display = isPreview ? 'block' : 'none';
        htmlContent.style.display = isPreview ? 'none' : 'block';
    });
});

// =============================================================================
// 主题切换
// =============================================================================
themeToggle.addEventListener('click', function () {
    document.body.classList.toggle('light-theme');
    var isLight = document.body.classList.contains('light-theme');
    themeToggle.querySelector('.icon').textContent = isLight ? '\u2600\uFE0F' : '\uD83C\uDF19';
    localStorage.setItem('markdownEditorTheme', isLight ? 'light' : 'dark');
});

// =============================================================================
// 全屏
// =============================================================================
fullscreenBtn.addEventListener('click', function () {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(function (error) {
            console.error('全屏失败:', error);
            showNotification('全屏失败', 'error');
        });
    } else {
        document.exitFullscreen();
    }
});

// =============================================================================
// 文件导入
// =============================================================================
fileInput.addEventListener('change', function (event) {
    var file = event.target.files[0];
    if (file) importMarkdownFile(file);
    fileInput.value = '';
});

// =============================================================================
// 标题输入
// =============================================================================
docTitleInput.addEventListener('input', saveDraft);

// =============================================================================
// 搜索输入
// =============================================================================
searchInput.addEventListener('input', function () {
    updateSearchCount();
    highlightSearchInPreview();
});

// =============================================================================
// 正则开关
// =============================================================================
regexToggle.addEventListener('change', function () {
    useRegex = regexToggle.checked;
    currentMatchIndex = -1;
    updateSearchCount();
    highlightSearchInPreview();
});

// =============================================================================
// 键盘快捷键
// =============================================================================
document.addEventListener('keydown', function (event) {
    if (!event.ctrlKey && !event.metaKey) return;

    var key = event.key.toLowerCase();

    if (key === 'z') {
        if (event.shiftKey) {
            event.preventDefault();
            redo();
        } else {
            event.preventDefault();
            undo();
        }
    } else if (key === 'y') {
        event.preventDefault();
        redo();
    } else if (key === 's') {
        event.preventDefault();
        saveCurrentDocument();
    } else if (key === 'f') {
        event.preventDefault();
        searchInput.focus();
    } else if (key === 'b') {
        event.preventDefault();
        insertMarkdown('**');
    } else if (key === 'i') {
        event.preventDefault();
        insertMarkdown('*');
    }
});

// =============================================================================
// 通知
// =============================================================================
function showNotification(message, type) {
    if (!type) type = 'info';
    var notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.textContent = message;
    notification.style.cssText = 'position:fixed;top:20px;right:20px;padding:12px 18px;background:' +
        (type === 'success' ? '#2563eb' : type === 'error' ? '#dc2626' : '#374151') +
        ';color:white;border-radius:8px;box-shadow:0 12px 30px rgba(15,23,42,0.2);z-index:10000;animation:slideInRight 0.2s ease-out;';

    document.body.appendChild(notification);
    setTimeout(function () {
        notification.style.animation = 'slideOutRight 0.2s ease-out';
        setTimeout(function () { notification.remove(); }, 200);
    }, 1800);
}

var notificationStyle = document.createElement('style');
notificationStyle.textContent = '@keyframes slideInRight{from{transform:translateX(360px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOutRight{from{transform:translateX(0);opacity:1}to{transform:translateX(360px);opacity:0}}';
document.head.appendChild(notificationStyle);

// =============================================================================
// 版本历史（保留原有功能）
// =============================================================================
function saveToHistory() {
    var content = input.value;
    var timestamp = new Date().toLocaleString('zh-CN');

    if (versionHistory.length && versionHistory[versionHistory.length - 1].content === content) {
        return;
    }

    versionHistory.push({ content: content, timestamp: timestamp });
    if (versionHistory.length > 20) {
        versionHistory.shift();
    }

    currentVersionIndex = versionHistory.length - 1;
    localStorage.setItem('markdownHistory', JSON.stringify(versionHistory));
    lastSaved.textContent = timestamp.replace(/\d{4}\/\d{1,2}\/\d{1,2}\s*/, '');
}

function loadHistory() {
    var saved = localStorage.getItem('markdownHistory');
    if (!saved) return;

    try {
        versionHistory = JSON.parse(saved);
        currentVersionIndex = versionHistory.length - 1;
    } catch (error) {
        console.error('历史记录解析失败:', error);
        versionHistory = [];
    }
}

function toggleHistory() {
    var existingPanel = document.getElementById('history-panel');
    if (existingPanel) {
        existingPanel.remove();
        return;
    }

    var panel = document.createElement('div');
    panel.id = 'history-panel';
    panel.style.cssText = 'position:fixed;right:20px;top:96px;width:320px;max-height:520px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;z-index:1000;overflow-y:auto;box-shadow:0 20px 50px rgba(15,23,42,0.24);';

    var historyList = versionHistory.map(function (version, index) {
        return '<button class="history-item ' + (index === currentVersionIndex ? 'active' : '') + '" onclick="restoreVersion(' + index + ')">' +
            '<span>版本 ' + (index + 1) + '</span>' +
            '<small>' + version.timestamp + '</small>' +
        '</button>';
    }).reverse().join('');

    panel.innerHTML = '<div class="history-header"><h3>版本历史</h3><button onclick="toggleHistory()" aria-label="关闭">&times;</button></div>' +
        '<p class="history-count">共 ' + versionHistory.length + ' 个版本</p>' +
        '<div class="history-list">' + (historyList || '<div class="empty-history">暂无历史记录</div>') + '</div>';

    document.body.appendChild(panel);
}

function restoreVersion(index) {
    if (index < 0 || index >= versionHistory.length) return;

    currentVersionIndex = index;
    input.value = versionHistory[index].content;
    updatePreview();
    showNotification('已恢复到版本 ' + (index + 1), 'success');
    toggleHistory();
}

// =============================================================================
// 初始化
// =============================================================================
loadDocuments();
loadDraft();
pushUndo(input.value);
input.addEventListener('input', function () {
    pushUndo(input.value);
    updatePreview();
});
updatePreview();
loadHistory();
setInterval(saveToHistory, 30000);

var savedTheme = localStorage.getItem('markdownEditorTheme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.querySelector('.icon').textContent = '\u2600\uFE0F';
}