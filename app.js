marked.setOptions({
    breaks: true,
    gfm: true
});

const input = document.getElementById('markdown-input');
const previewContent = document.getElementById('preview-content');
const htmlContent = document.getElementById('html-content');
const charCount = document.getElementById('char-count');
const wordCount = document.getElementById('word-count');
const themeToggle = document.getElementById('theme-toggle');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const headingCount = document.getElementById('heading-count');
const lastSaved = document.getElementById('last-saved');
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

let currentVersionIndex = -1;
let versionHistory = [];
let documents = [];
let currentDocId = null;
let currentMatchIndex = -1;

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

> 提示：可以先点击“插入模板”，再根据实际内容修改。

## 表格示例

| 功能 | 状态 |
| --- | --- |
| 实时预览 | 已完成 |
| 文档库 | 已完成 |
| 导出 HTML | 已完成 |
`;

function updatePreview() {
    const markdown = input.value;
    const html = marked.parse(markdown);

    previewContent.innerHTML = html;
    addHeadingAnchors();
    htmlContent.textContent = previewContent.innerHTML;
    charCount.textContent = `${markdown.length} 字符`;

    const words = markdown.trim().split(/\s+/).filter(Boolean);
    wordCount.textContent = `${words.length} 词`;

    updateOutline();
    updateChecks(markdown);
    updateSearchCount();
    saveDraft();
}

function addHeadingAnchors() {
    previewContent.querySelectorAll('h1, h2, h3').forEach((heading, index) => {
        heading.id = `heading-${index}`;
    });
}

function updateOutline() {
    const headings = [...previewContent.querySelectorAll('h1, h2, h3')].map((heading) => ({
        id: heading.id,
        level: Number(heading.tagName.replace('H', '')),
        title: heading.textContent.trim()
    }));

    headingCount.textContent = headings.length;

    if (!headings.length) {
        outlineList.innerHTML = '<p>输入标题后自动生成目录。</p>';
        return;
    }

    outlineList.innerHTML = headings.map((heading) => `
        <button class="outline-item level-${heading.level}" type="button" onclick="scrollToHeading('${heading.id}')">
            ${heading.title}
        </button>
    `).join('');
}

function scrollToHeading(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateChecks(markdown) {
    checkTitle.classList.toggle('done', /^#\s+.+/m.test(markdown));
    checkLength.classList.toggle('done', markdown.trim().length >= 200);
    checkCode.classList.toggle('done', /```|^\s*[-*]\s+/m.test(markdown));
}

function insertMarkdown(syntax) {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = input.value.substring(start, end);
    const before = input.value.substring(0, start);
    const after = input.value.substring(end);

    const snippets = {
        '# ': `${syntax}${selected || '标题'}`,
        '**': `**${selected || '文本'}**`,
        '*': `*${selected || '文本'}*`,
        '[ ]( )': `[${selected || '链接文本'}](https://example.com)`,
        '![ ]( )': `![${selected || '图片描述'}](https://example.com/image.png)`,
        '> ': `> ${selected || '引用内容'}`,
        '- ': `- ${selected || '列表项'}`,
        '`  `': `\`${selected || 'code'}\``
    };

    const inserted = snippets[syntax] || syntax;
    input.value = before + inserted + after;
    input.focus();
    input.setSelectionRange(before.length + inserted.length, before.length + inserted.length);
    updatePreview();
}

function formatMarkdown() {
    if (!input.value.trim()) {
        showNotification('请先输入内容', 'info');
        return;
    }

    const formatted = input.value
        .replace(/[ \t]+$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/([^\n])\n(#{1,6}\s)/g, '$1\n\n$2')
        .replace(/(#{1,6}\s.*)\n([^\n#])/g, '$1\n\n$2')
        .trim();

    input.value = `${formatted}\n`;
    updatePreview();
    showNotification('格式已整理', 'success');
}

function insertTemplate() {
    const template = `# 文档标题

## 背景

说明这篇文档要解决的问题。

## 目标

- 目标一
- 目标二

## 方案

描述实现思路、关键步骤或核心内容。

## 待办

- [ ] 补充细节
- [ ] 检查格式
`;

    insertAtCursor(template);
    showNotification('已插入模板', 'success');
}

function insertAtCursor(text) {
    const start = input.selectionStart;
    const before = input.value.substring(0, start);
    const after = input.value.substring(input.selectionEnd);
    input.value = before + text + after;
    input.focus();
    input.setSelectionRange(before.length + text.length, before.length + text.length);
    updatePreview();
}

function copyContent() {
    navigator.clipboard.writeText(htmlContent.textContent).then(() => {
        showNotification('HTML 已复制到剪贴板', 'success');
    }).catch((error) => {
        console.error('复制失败:', error);
        showNotification('复制失败，请检查浏览器权限', 'error');
    });
}

function downloadFile() {
    downloadBlob(input.value, `${getSafeTitle()}.md`, 'text/markdown');
    showNotification('Markdown 文件已下载', 'success');
}

function exportHTML() {
    const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(docTitleInput.value || '导出的文档')}</title>
    <style>
        body {
            max-width: 800px;
            margin: 0 auto;
            padding: 32px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            line-height: 1.7;
            color: #1f2937;
        }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
        pre { background: #111827; color: #f9fafb; padding: 16px; border-radius: 8px; overflow-x: auto; }
        blockquote { border-left: 4px solid #2563eb; margin-left: 0; padding-left: 16px; color: #4b5563; }
        img { max-width: 100%; height: auto; }
        a { color: #2563eb; }
    </style>
</head>
<body>
${previewContent.innerHTML}
</body>
</html>`;

    downloadBlob(fullHTML, `${getSafeTitle()}.html`, 'text/html');
    showNotification('HTML 文件已导出', 'success');
}

function exportPDF() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        showNotification('浏览器阻止了弹窗，请允许后重试', 'error');
        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
            <meta charset="UTF-8">
            <title>${escapeHtml(docTitleInput.value || '导出的文档')}</title>
            <style>
                body {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 24px;
                    font-family: Arial, "Microsoft YaHei", sans-serif;
                    line-height: 1.7;
                }
                pre { white-space: pre-wrap; }
            </style>
        </head>
        <body>${previewContent.innerHTML}</body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
    showNotification('已打开打印窗口，可另存为 PDF', 'success');
}

function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
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
    return text.replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

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
    const now = new Date().toLocaleString('zh-CN');
    const title = docTitleInput.value.trim() || '未命名文档';
    const payload = {
        id: currentDocId || crypto.randomUUID(),
        title,
        content: input.value,
        updatedAt: now
    };

    const index = documents.findIndex((doc) => doc.id === payload.id);
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
        documentList.innerHTML = '<p>保存后会显示在这里。</p>';
        return;
    }

    documentList.innerHTML = documents.slice(0, 6).map((doc) => `
        <button class="document-item ${doc.id === currentDocId ? 'active' : ''}" onclick="openDocument('${doc.id}')">
            <span>${escapeHtml(doc.title)}</span>
            <small>${doc.updatedAt}</small>
        </button>
    `).join('');
}

function openDocument(id) {
    const doc = documents.find((item) => item.id === id);
    if (!doc) return;

    currentDocId = doc.id;
    docTitleInput.value = doc.title;
    input.value = doc.content;
    lastSaved.textContent = doc.updatedAt.replace(/\d{4}\/\d{1,2}\/\d{1,2}\s*/, '');
    updatePreview();
    renderDocuments();
    showNotification('文档已打开', 'success');
}

function createNewDocument() {
    currentDocId = null;
    docTitleInput.value = '未命名文档';
    input.value = '# 未命名文档\n\n开始记录你的内容。\n';
    lastSaved.textContent = '未保存';
    updatePreview();
    renderDocuments();
}

function importMarkdownFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
        currentDocId = null;
        docTitleInput.value = file.name.replace(/\.(md|markdown|txt)$/i, '');
        input.value = String(reader.result || '');
        lastSaved.textContent = '未保存';
        updatePreview();
        renderDocuments();
        showNotification('文件已导入，可继续编辑或保存', 'success');
    };
    reader.readAsText(file);
}

function saveDraft() {
    localStorage.setItem('markdownDraft', JSON.stringify({
        title: docTitleInput.value,
        content: input.value,
        currentDocId
    }));
}

function loadDraft() {
    const saved = localStorage.getItem('markdownDraft');
    if (!saved) {
        input.value = defaultContent;
        return;
    }

    try {
        const draft = JSON.parse(saved);
        docTitleInput.value = draft.title || '项目说明文档';
        input.value = draft.content || defaultContent;
        currentDocId = draft.currentDocId || null;
    } catch {
        input.value = defaultContent;
    }
}

function updateSearchCount() {
    const query = searchInput.value;
    if (!query) {
        searchCount.textContent = '0 处匹配';
        currentMatchIndex = -1;
        return;
    }

    const matches = getMatches(query);
    searchCount.textContent = `${matches.length} 处匹配`;
    if (!matches.length) currentMatchIndex = -1;
}

function getMatches(query) {
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return [...input.value.matchAll(new RegExp(escaped, 'gi'))].map((match) => match.index);
}

function findNextMatch() {
    const query = searchInput.value;
    const matches = getMatches(query);
    if (!query || !matches.length) {
        showNotification('没有找到匹配内容', 'info');
        return;
    }

    currentMatchIndex = (currentMatchIndex + 1) % matches.length;
    const start = matches[currentMatchIndex];
    input.focus();
    input.setSelectionRange(start, start + query.length);
}

function replaceCurrentMatch() {
    const query = searchInput.value;
    if (!query) return;

    const selection = input.value.substring(input.selectionStart, input.selectionEnd);
    if (selection.toLowerCase() !== query.toLowerCase()) {
        findNextMatch();
        return;
    }

    insertAtCursor(replaceInput.value);
    showNotification('已替换当前匹配', 'success');
}

function replaceAllMatches() {
    const query = searchInput.value;
    if (!query) return;

    const matches = getMatches(query);
    if (!matches.length) {
        showNotification('没有找到匹配内容', 'info');
        return;
    }

    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    input.value = input.value.replace(new RegExp(escaped, 'gi'), replaceInput.value);
    updatePreview();
    showNotification(`已替换 ${matches.length} 处`, 'success');
}

document.querySelectorAll('.btn-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-toggle').forEach((item) => item.classList.remove('active'));
        btn.classList.add('active');

        const isPreview = btn.dataset.view === 'preview';
        previewContent.style.display = isPreview ? 'block' : 'none';
        htmlContent.style.display = isPreview ? 'none' : 'block';
    });
});

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggle.querySelector('.icon').textContent = isLight ? '☀️' : '🌙';
    localStorage.setItem('markdownEditorTheme', isLight ? 'light' : 'dark');
});

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((error) => {
            console.error('全屏失败:', error);
            showNotification('全屏失败', 'error');
        });
    } else {
        document.exitFullscreen();
    }
});

fileInput.addEventListener('change', (event) => {
    const [file] = event.target.files;
    if (file) importMarkdownFile(file);
    fileInput.value = '';
});

docTitleInput.addEventListener('input', saveDraft);
searchInput.addEventListener('input', updateSearchCount);

document.addEventListener('keydown', (event) => {
    if (!event.ctrlKey && !event.metaKey) return;

    const key = event.key.toLowerCase();
    if (key === 's') {
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 18px;
        background: ${type === 'success' ? '#2563eb' : type === 'error' ? '#dc2626' : '#374151'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.2);
        z-index: 10000;
        animation: slideInRight 0.2s ease-out;
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.2s ease-out';
        setTimeout(() => notification.remove(), 200);
    }, 1800);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(360px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(360px); opacity: 0; }
    }
`;
document.head.appendChild(style);

function saveToHistory() {
    const content = input.value;
    const timestamp = new Date().toLocaleString('zh-CN');

    if (versionHistory.length && versionHistory[versionHistory.length - 1].content === content) {
        return;
    }

    versionHistory.push({ content, timestamp });
    if (versionHistory.length > 20) {
        versionHistory.shift();
    }

    currentVersionIndex = versionHistory.length - 1;
    localStorage.setItem('markdownHistory', JSON.stringify(versionHistory));
    lastSaved.textContent = timestamp.replace(/\d{4}\/\d{1,2}\/\d{1,2}\s*/, '');
}

function loadHistory() {
    const saved = localStorage.getItem('markdownHistory');
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
    const existingPanel = document.getElementById('history-panel');
    if (existingPanel) {
        existingPanel.remove();
        return;
    }

    const panel = document.createElement('div');
    panel.id = 'history-panel';
    panel.style.cssText = `
        position: fixed;
        right: 20px;
        top: 96px;
        width: 320px;
        max-height: 520px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 18px;
        z-index: 1000;
        overflow-y: auto;
        box-shadow: 0 20px 50px rgba(15, 23, 42, 0.24);
    `;

    const historyList = versionHistory.map((version, index) => `
        <button class="history-item ${index === currentVersionIndex ? 'active' : ''}" onclick="restoreVersion(${index})">
            <span>版本 ${index + 1}</span>
            <small>${version.timestamp}</small>
        </button>
    `).reverse().join('');

    panel.innerHTML = `
        <div class="history-header">
            <h3>版本历史</h3>
            <button onclick="toggleHistory()" aria-label="关闭">&times;</button>
        </div>
        <p class="history-count">共 ${versionHistory.length} 个版本</p>
        <div class="history-list">
            ${historyList || '<div class="empty-history">暂无历史记录</div>'}
        </div>
    `;

    document.body.appendChild(panel);
}

function restoreVersion(index) {
    if (index < 0 || index >= versionHistory.length) return;

    currentVersionIndex = index;
    input.value = versionHistory[index].content;
    updatePreview();
    showNotification(`已恢复到版本 ${index + 1}`, 'success');
    toggleHistory();
}

loadDocuments();
loadDraft();
input.addEventListener('input', updatePreview);
updatePreview();
loadHistory();
setInterval(saveToHistory, 30000);

const savedTheme = localStorage.getItem('markdownEditorTheme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    themeToggle.querySelector('.icon').textContent = '☀️';
}
