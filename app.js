// 初始化 marked.js 配置
marked.setOptions({
    breaks: true,
    gfm: true
});

let currentView = 'preview';

// 实时预览
document.getElementById('markdown-input').addEventListener('input', function() {
    const markdown = this.value;
    const html = marked.parse(markdown);
    
    document.getElementById('preview-content').innerHTML = html;
    document.getElementById('html-content').textContent = html;
    
    // 更新字符统计
    document.getElementById('char-count').textContent = `${markdown.length} 字符`;
});

// 插入 Markdown 语法
function insertMarkdown(syntax) {
    const textarea = document.getElementById('markdown-input');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    
    let newText;
    if (syntax.includes('[]')) {
        newText = before + syntax.replace('[ ]', `[${selection || '文本'}]`) + after;
    } else if (syntax.includes('`  `')) {
        newText = before + '`' + (selection || 'code') + '`' + after;
    } else {
        newText = before + syntax + selection + syntax + after;
    }
    
    textarea.value = newText;
    textarea.focus();
    
    // 触发 input 事件
    textarea.dispatchEvent(new Event('input'));
}

// 复制 HTML
function copyContent() {
    const html = document.getElementById('html-content').textContent;
    navigator.clipboard.writeText(html).then(() => {
        alert('HTML 已复制到剪贴板！');
    }).catch(err => {
        console.error('复制失败:', err);
    });
}

// 下载文件
function downloadFile() {
    const markdown = document.getElementById('markdown-input').value;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
}

// 切换预览模式
document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const view = this.dataset.view;
        currentView = view;
        
        if (view === 'preview') {
            document.getElementById('preview-content').style.display = 'block';
            document.getElementById('html-content').style.display = 'none';
        } else {
            document.getElementById('preview-content').style.display = 'none';
            document.getElementById('html-content').style.display = 'block';
        }
    });
});

// 默认内容
const defaultContent = `# 欢迎使用 Markdown 编辑器

这是一个**实时预览**的 Markdown 编辑器。

## 功能特性

- ✨ 实时预览
- 📋 复制 HTML
- 💾 下载文件
- 🎨 语法高亮

## 代码示例

\`\`\`javascript
function hello() {
    console.log('Hello World!');
}
\`\`\`

> 开始输入，立即看到效果！
`;

// 初始化
document.getElementById('markdown-input').value = defaultContent;
document.getElementById('markdown-input').dispatchEvent(new Event('input'));
