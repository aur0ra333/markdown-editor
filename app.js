// 初始化 marked.js 配置
marked.setOptions({
    breaks: true,
    gfm: true
});

let currentView = 'preview';
let isDarkTheme = true;

// 实时预览
document.getElementById('markdown-input').addEventListener('input', function() {
    const markdown = this.value;
    const html = marked.parse(markdown);
    
    document.getElementById('preview-content').innerHTML = html;
    document.getElementById('html-content').textContent = html;
    
    // 更新字符统计
    document.getElementById('char-count').textContent = `${markdown.length} 字符`;
    
    // 更新词数统计
    const words = markdown.trim().split(/\s+/).filter(word => word.length > 0);
    document.getElementById('word-count').textContent = `${words.length} 词`;
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
        showNotification('HTML 已复制到剪贴板！', 'success');
    }).catch(err => {
        console.error('复制失败:', err);
        showNotification('复制失败', 'error');
    });
}

// 下载 Markdown 文件
function downloadFile() {
    const markdown = document.getElementById('markdown-input').value;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('文件已下载！', 'success');
}

// 导出为 HTML 文件
function exportHTML() {
    const html = document.getElementById('html-content').textContent;
    const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>导出的文档</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 6px; overflow-x: auto; }
        blockquote { border-left: 4px solid #667eea; padding-left: 1em; color: #666; }
        img { max-width: 100%; height: auto; }
        a { color: #667eea; }
    </style>
</head>
<body>
${html}
</body>
</html>`;
    
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('HTML 文件已导出！', 'success');
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

// 主题切换
document.getElementById('theme-toggle').addEventListener('click', function() {
    document.body.classList.toggle('light-theme');
    isDarkTheme = !isDarkTheme;
    
    const icon = this.querySelector('.icon');
    icon.textContent = isDarkTheme ? '🌙' : '☀️';
    
    localStorage.setItem('markdownEditorTheme', isDarkTheme ? 'dark' : 'light');
});

// 全屏功能
document.getElementById('fullscreen-btn').addEventListener('click', function() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('全屏失败:', err);
        });
    } else {
        document.exitFullscreen();
    }
});

// 通知提示
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#f5576c'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 默认内容
const defaultContent = `# 欢迎使用 Markdown 编辑器

这是一个**实时预览**的 Markdown 编辑器，采用现代玻璃态设计。

## 功能特性

- ✨ 实时预览
- 📋 复制 HTML
- 💾 下载 Markdown 文件
- 📄 导出 HTML 文件
- 🌙 主题切换（深色/浅色）
- ⛶ 全屏模式
- 📊 字数统计

## 代码示例

\`\`\`javascript
function hello() {
    console.log('Hello World!');
}
\`\`\`

> 💡 提示：使用上方工具栏快速插入 Markdown 语法

## 表格示例

| 功能 | 状态 |
|------|------|
| 实时预览 | ✅ |
| 主题切换 | ✅ |
| 导出 HTML | ✅ |
`;

// 初始化
document.getElementById('markdown-input').value = defaultContent;
document.getElementById('markdown-input').dispatchEvent(new Event('input'));

// 加载保存的主题
const savedTheme = localStorage.getItem('markdownEditorTheme');
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    document.getElementById('theme-toggle').querySelector('.icon').textContent = '☀️';
    isDarkTheme = false;
}
