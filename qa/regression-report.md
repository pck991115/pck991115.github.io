# 回归测试报告

测试时间：2026-07-07 08:07（Asia/Shanghai）

## 结论

通过。第二轮自动化回归 `failed: 0`。

## 发现的问题

首轮测试发现所有依赖 React 的交互都没有响应：

- 桌面搜索按钮无法打开弹窗
- `⌘K` 无法打开搜索
- 笔记页主题筛选按钮无法切换
- 笔记列表搜索无变化
- 移动端菜单无法展开
- 移动端搜索无法打开

根因是开发模式下 Astro React 渲染器导入 `react-dom/client.js` 失败：

```text
The requested module '/node_modules/react-dom/client.js?...' does not provide an export named 'createRoot'
```

该错误导致 `astro-island` 一直停留在 `ssr: true`，React 组件没有完成水合，页面只剩静态 HTML。

## 修复

在 `astro.config.mjs` 中：

- 将服务 host 改为 `0.0.0.0`，方便远程预览/端口转发。
- 增加 Vite alias，将 `react-dom/client.js` 指向 `react-dom/client`。
- 增加 `optimizeDeps.include`，确保 React、ReactDOM、Phosphor 图标在开发模式下被正确预优化。

## 覆盖范围

自动化点击验证：

- 首页 React 组件水合
- 桌面搜索按钮打开弹窗
- 搜索输入筛选结果
- 搜索关闭按钮
- `⌘K` 快捷键
- 笔记页 React 组件水合
- URL `theme` 参数初始化筛选
- 笔记主题按钮切换
- 笔记列表搜索空状态
- 简历打印按钮
- 移动端菜单展开
- 移动端遮罩关闭
- 移动端搜索按钮
- `/`、`/notes/`、`/projects/`、`/about/`、`/resume/`、`/now/` 路由访问
- 前端运行时错误检查

## 验证命令

```bash
node qa/regression-test.mjs
npm run build
```

最终结果：

```text
failed: 0
npm run build: passed
```
