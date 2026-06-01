# Markdown 编辑器

一个轻量的 Markdown 文档工作台，适合记录学习笔记、整理项目文档和快速导出页面内容。项目重点练习文本编辑、状态持久化、本地文件读取、搜索替换、版本历史和导出流程。

## 在线演示

[访问在线演示](https://aur0ra333.github.io/markdown-editor/)

## 功能

- 实时预览：基于 Marked.js 解析 Markdown，支持 GitHub Flavored Markdown。
- 本地文档库：使用 LocalStorage 保存多篇文档，支持打开、更新和自动草稿恢复。
- 文件导入：支持导入 `.md`、`.markdown`、`.txt` 文件继续编辑。
- 搜索替换：支持关键词匹配、下一个匹配、单次替换和全部替换。
- 文档目录：根据 H1-H3 标题生成目录，并支持跳转到预览区对应标题。
- 快捷工具栏：快速插入标题、粗体、斜体、链接、图片、引用、列表和代码。
- 文档整理：一键清理多余空行和标题间距，让文档结构更规整。
- 本地版本历史：每 30 秒自动保存一次，最多保留最近 20 个版本。
- 导出能力：支持下载 Markdown、导出 HTML，并可通过浏览器打印保存为 PDF。
- 快捷键：`Ctrl/Cmd + S` 保存、`Ctrl/Cmd + F` 搜索、`Ctrl/Cmd + B/I` 加粗/斜体。

## 技术栈

- HTML5
- CSS3：CSS 变量、Grid、Flexbox、响应式布局
- JavaScript ES6+
- Marked.js
- LocalStorage
- FileReader API
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
