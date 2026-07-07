# 如何添加笔记、图片和视频

这个站点的笔记都放在 `src/content/notes/` 目录里，每一篇就是一个 Markdown 文件。

## 1. 新建一篇笔记

在 `src/content/notes/` 下新建一个文件，例如：

```text
src/content/notes/my-first-note.md
```

文件名会成为访问地址的一部分。上面的例子发布后地址是：

```text
/notes/my-first-note/
```

## 2. 笔记模板

复制下面这段作为开头：

```md
---
title: 我的第一篇笔记
description: 用一句话说明这篇笔记解决什么问题。
date: 2026-07-07
theme: 知识管理
tags: [写作, 知识管理]
readingTime: 5 分钟
---

这里开始写正文。

## 一个小标题

正文支持普通 Markdown：列表、链接、引用、代码块、图片等。
```

`theme` 目前只能填这三个之一：

- `知识管理`
- `理财学习`
- `职业成长`

如果不想发布，可以临时加一行：

```md
draft: true
```

## 3. 添加图片

推荐把图片放到：

```text
public/media/images/
```

例如：

```text
public/media/images/note-system.png
```

然后在笔记里这样引用：

```md
![我的笔记系统截图](/media/images/note-system.png)
```

图片会自动适配文章宽度。

## 4. 添加本地视频

推荐把视频放到：

```text
public/media/videos/
```

例如：

```text
public/media/videos/demo.mp4
```

然后在笔记里用 HTML：

```html
<video controls src="/media/videos/demo.mp4"></video>
```

如果视频文件很大，不建议直接放进 GitHub 仓库。可以上传到 B 站、YouTube、腾讯云 COS、阿里云 OSS 等，再用外链嵌入。

## 5. 嵌入在线视频

Markdown 里可以直接写 iframe，例如：

```html
<iframe
  src="https://www.youtube.com/embed/视频ID"
  title="视频标题"
  allowfullscreen
></iframe>
```

国内访问场景可以优先用 B 站嵌入代码。

## 6. 本地预览

添加或修改笔记后运行：

```bash
npm run dev
```

打开：

```text
http://localhost:4321/
```

## 7. 发布

提交并推送到 GitHub 的 `main` 分支后，运行构建，并将 `dist/` 发布到 `gh-pages` 分支即可更新线上站点。
