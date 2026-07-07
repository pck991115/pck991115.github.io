# 庞成康的个人知识主页

一个用于沉淀学习内容、公开项目和职业成长记录的中文个人主页。

## 技术栈

- Astro 静态站
- React islands：搜索、移动端菜单、笔记筛选
- Markdown 内容集合
- Pagefind 静态搜索索引
- GitHub Pages 部署

## 本地开发

```bash
npm install
npm run dev
```

默认访问：

```text
http://localhost:4321/
```

## 构建

```bash
npm run build
```

构建产物在 `dist/`，Pagefind 索引会生成到 `dist/pagefind/`。

## 添加内容

笔记放在：

```text
src/content/notes/
```

详细说明见：

[docs/ADDING_CONTENT.md](docs/ADDING_CONTENT.md)

## 部署

当前仓库使用 `gh-pages` 分支发布静态构建产物。更新内容后运行：

```bash
npm run build
```

然后将 `dist/` 发布到 `gh-pages` 分支。
