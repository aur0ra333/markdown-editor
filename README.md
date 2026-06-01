# Markdown 编辑器

一个轻量的 Markdown 编辑和预览工具，适合记录学习笔记、整理项目文档和快速导出页面内容。

## 在线演示

[访问在线演示](https://aur0ra333.github.io/markdown-editor/)

## 功能

- 实时预览：基于 Marked.js 解析 Markdown，支持 GitHub Flavored Markdown。
- 快捷工具栏：快速插入标题、粗体、斜体、链接、图片、引用、列表和代码。
- 文档整理：一键清理多余空行和标题间距，让文档结构更规整。
- 常用模板：快速插入背景、目标、方案、待办等基础文档结构。
- 本地版本历史：每 30 秒自动保存一次，最多保留最近 20 个版本。
- 导出能力：支持下载 Markdown、导出 HTML，并可通过浏览器打印保存为 PDF。
- 主题切换：支持深色和浅色模式。

## 技术栈

- HTML5
- CSS3：CSS 变量、Grid、Flexbox、响应式布局
- JavaScript ES6+
- Marked.js
- LocalStorage
- GitHub Pages

## 本地运行

```bash
git clone https://github.com/aur0ra333/markdown-editor.git
cd markdown-editor
```

直接打开 `index.html`，或使用本地静态服务运行：

```bash
python -m http.server 8080
```

## 可继续优化

- 增加文档搜索和替换
- 支持导入本地 `.md` 文件
- 增加快捷键说明
- 支持自定义导出样式

## 作者

- GitHub: [@aur0ra333](https://github.com/aur0ra333)
- Portfolio: [查看其他项目](https://aur0ra333.github.io/modern-portfolio-demo/)
