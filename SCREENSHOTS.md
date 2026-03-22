# 📸 项目截图指南

## 如何生成截图

### 方法 1：浏览器截图（推荐）
1. 打开项目：https://aur0ra333.github.io/markdown-editor/
2. 按 F12 打开开发者工具
3. 按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac)
4. 输入 "screenshot"
5. 选择 "Capture full size screenshot"（完整截图）

### 方法 2：截图工具
- Windows: `Win+Shift+S`
- Mac: `Cmd+Shift+4`
- 或使用 Snipaste、Greenshot 等工具

## 需要截图的场景

### 1. 深色主题主界面
- 展示玻璃态设计
- 包含完整的工具栏
- 有示例内容

### 2. 浅色主题
- 点击主题切换按钮
- 展示主题变化效果

### 3. AI 功能演示
- 输入一些文本
- 点击 "AI 润色" 或 "AI 扩写"
- 截图 AI 处理中的状态

### 4. 版本历史
- 点击 "历史" 按钮
- 展示历史版本面板

### 5. 响应式布局
- 调整浏览器窗口到手机尺寸
- 展示移动端适配效果

## 截图存放位置

将截图保存到 `screenshots/` 目录：
```
markdown-editor/
├── screenshots/
│   ├── dark-theme.png
│   ├── light-theme.png
│   ├── ai-features.png
│   └── history.png
├── index.html
├── styles.css
├── app.js
└── README.md
```

## 在 README 中使用截图

```markdown
## 📸 功能截图

### 深色主题
![Dark Theme](screenshots/dark-theme.png)

### 浅色主题
![Light Theme](screenshots/light-theme.png)
```

## 优化建议

1. **截图尺寸**：建议宽度 1200-1600px
2. **文件格式**：使用 PNG（无损压缩）
3. **文件大小**：每张图片 < 500KB
4. **清晰度**：确保文字清晰可读
5. **隐私**：不要包含个人信息

## 快速生成所有截图

1. 打开项目
2. 深色主题截图 → `dark-theme.png`
3. 切换到浅色主题 → `light-theme.png`
4. 输入测试文本，点击 AI 润色 → `ai-features.png`
5. 点击历史按钮 → `history.png`
6. 压缩浏览器宽度到 375px → `mobile.png`

完成！
