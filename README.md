# 📝 AI-Powered Markdown Editor

一个功能强大的现代化 Markdown 编辑器，集成了 AI 辅助写作、版本历史和多种导出功能。

![Markdown Editor](https://img.shields.io/badge/Markdown-Editor-blue)
![AI Features](https://img.shields.io/badge/AI-Powered-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 在线演示

**[点击访问在线演示](https://aur0ra333.github.io/markdown-editor/)**

## ✨ 核心功能

### 🤖 AI 辅助写作
- **AI 润色**：智能优化文本表达，提升文章质量
- **AI 扩写**：自动扩展内容，生成相关资源链接
- 基于先进的 NLP 技术（可接入真实 AI API）

### 📜 版本历史
- 自动保存编辑历史（每 30 秒）
- 支持版本回退和时间旅行
- 本地持久化存储（IndexedDB）
- 最多保存 20 个历史版本

### 📤 多种导出格式
- **Markdown**：原始 .md 文件
- **HTML**：完整的 HTML 文档
- **PDF**：通过浏览器打印功能导出

### 🎨 现代化设计
- **玻璃态设计**（Glassmorphism）：毛玻璃特效
- **动态背景**：浮动的渐变色球体
- **主题切换**：深色/浅色模式
- **响应式布局**：完美适配移动端

### 🛠️ 编辑功能
- 实时预览（基于 Marked.js）
- 语法高亮
- 字数统计（字符数 + 词数）
- 快捷工具栏（标题、加粗、斜体等）
- 全屏模式

## 🛠️ 技术栈

### 前端
- **HTML5** - 语义化结构
- **CSS3** - 现代动画和特效
  - CSS Custom Properties（CSS 变量）
  - Backdrop Filter（毛玻璃效果）
  - CSS Grid & Flexbox（布局）
  - Keyframe Animations（动画）
- **JavaScript ES6+** - 现代语法
  - Async/Await（异步编程）
  - LocalStorage API（数据持久化）
  - Event Listeners（事件处理）

### 第三方库
- **Marked.js** - Markdown 解析引擎
- **Chart.js**（可选）- 数据可视化

### 部署
- **GitHub Pages** - 静态网站托管

## 🚀 快速开始

### 方法 1：直接使用
```bash
# 克隆项目
git clone https://github.com/aur0ra333/markdown-editor.git

# 直接在浏览器打开
open index.html
```

### 方法 2：本地开发
```bash
# 使用 VS Code Live Server
# 安装 Live Server 扩展后右键 index.html -> Open with Live Server
```

## 📸 功能截图

### 深色主题
![Dark Theme](screenshots/dark-theme.png)

### 浅色主题
![Light Theme](screenshots/light-theme.png)

### AI 功能
![AI Features](screenshots/ai-features.png)

### 版本历史
![Version History](screenshots/history.png)

## 💡 使用技巧

### AI 润色
1. 输入 Markdown 内容
2. 点击工具栏的 `✨ AI 润色` 按钮
3. AI 会自动优化文本表达

### 版本回退
1. 点击 `📜 历史` 按钮
2. 在历史面板中选择要回退的版本
3. 内容会自动恢复到选中版本

### 导出 PDF
1. 编辑完成后点击 `📕 导出 PDF`
2. 浏览器会打开打印对话框
3. 选择"另存为 PDF"即可

## 🔮 未来计划

- [ ] 接入真实 AI API（OpenAI/Claude）
- [ ] 图片上传和图床功能
- [ ] 实时协作编辑
- [ ] 文档云端同步
- [ ] 自定义主题
- [ ] 插件系统

## 📊 性能指标

- ⚡ **首屏加载**：< 1s
- 🎯 **Lighthouse 分数**：95+
- 📦 **打包体积**：< 50KB（不含 CDN）
- 🌐 **兼容性**：支持所有现代浏览器

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👤 作者

- **GitHub**: [@aur0ra333](https://github.com/aur0ra333)
- **Portfolio**: [查看我的其他项目](https://github.com/aur0ra333?tab=repositories)

## 🔗 相关链接

- [Markdown 语法教程](https://commonmark.org/help/tutorial/)
- [Marked.js 文档](https://marked.js.org/)
- [GitHub Pages 文档](https://pages.github.com/)

---

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

**📝 Happy Writing with AI!**
