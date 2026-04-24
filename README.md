# ResumeEditor Pro

一个基于 `React + Vite + Tailwind CSS + Milkdown` 的 Markdown 简历编辑器。你可以在左侧编写或可视化编辑 Markdown，在右侧实时预览排版效果，并直接打印为适合 A4 的 PDF 简历。

## 项目特性

- 支持两种编辑模式：源码模式和 `Milkdown` 所见即所得模式
- Markdown 内容实时渲染，右侧同步预览简历版式
- 内置简历模板，开箱即可开始修改
- 支持字体、页边距、标题字号、正文行高等版式微调
- 支持为模块标题、电话、邮箱切换图标
- 针对 A4 打印做了专门样式优化，可直接导出 PDF
- 首次进入编辑器时带有简单的新手引导

## 适用场景

- 想用 Markdown 快速维护个人简历
- 想从网页直接打印出 PDF 简历
- 想在源码编辑和富文本编辑之间自由切换
- 想基于现有页面继续扩展自己的简历生成器

## 技术栈

- `React 19`
- `TypeScript`
- `Vite`
- `Tailwind CSS v4`
- `Milkdown Crepe`
- `react-markdown`
- `driver.js`
- `lucide-react`

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

项目启动后，按 Vite 控制台输出访问本地地址即可。

### 3. 构建生产版本

```bash
npm run build
```

构建产物默认输出到 `dist/` 目录。

### 4. 本地预览构建结果

```bash
npm run preview
```

## 可用脚本

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

说明：

- `dev`：启动开发服务器
- `build`：执行生产构建
- `preview`：本地预览构建产物
- `lint`：当前实际执行的是 `tsc --noEmit`，用于 TypeScript 类型检查

## 使用方式

1. 进入首页后点击开始编辑
2. 在左侧切换 `源码` 或 `Milkdown` 模式编写简历
3. 在右侧查看实时预览效果
4. 通过顶部工具栏调整字体、边距、字号和行高
5. 点击 `下载 MD` 导出当前 Markdown
6. 点击 `打印 PDF`，通过浏览器打印保存为 PDF

## Markdown 约定

项目内置了一份默认模板，位置在 [src/constants/template.md](/src/constants/template.md:1)。

当前渲染逻辑对以下结构做了增强处理：

- `#`：通常作为姓名或主标题
- `##`：作为简历分区标题，并自动匹配默认图标
- `###`、`####`：会尝试识别 `标题 | 时间` 这样的结构并左右排布
- 包含电话、邮箱的段落会自动识别并以联系方式样式展示
- 普通链接会保留点击能力，邮箱链接会自动规范为 `mailto:`

## 项目结构

```text
src/
  App.tsx                       应用主界面与简历渲染逻辑
  main.tsx                      入口文件
  index.css                     全局样式、打印样式、Milkdown 主题覆盖
  components/
    LandingPage.tsx             落地页
    MilkdownEditor.tsx          Milkdown 编辑器封装
  constants/
    template.md                 默认简历模板
  lib/
    utils.ts                    通用工具函数
```

## 环境变量

仓库中保留了 `.env.example`，其中包含：

- `GEMINI_API_KEY`
- `APP_URL`

但按当前代码实现来看，这两个变量并不是项目核心功能运行所必需的。README 保留这一点是为了避免误导使用者：

- `vite.config.ts` 中仍注入了 `process.env.GEMINI_API_KEY`
- 代码主体里目前没有实际使用 Gemini 生成内容的逻辑

如果你后续准备接入 AI 生成功能，可以继续沿用这套环境变量命名。

## 已知注意事项

- `package.json` 里的 `dev` 和 `preview` 脚本固定使用 `443` 端口，但 `vite.config.ts` 中的 `server.port` 和 `preview.port` 是 `3000`。实际以脚本命令为准。
- `clean` 脚本使用了 `rm -rf dist`，这在 Windows PowerShell 环境下通常不可直接使用；如果需要跨平台清理，建议后续改成更兼容的方式。
- 仓库里存在一些历史遗留内容，例如 AI Studio 默认 README、Gemini 相关依赖和环境变量，占位成分较多。
- 源码中部分中文文本当前存在编码异常现象，如果后续要对外发布，建议统一检查文件编码。

## License

当前仓库里还没有明确的开源许可证文件。如果你准备公开发布，建议补充 `LICENSE`。
