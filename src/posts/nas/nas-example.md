---
title: NAS 折腾记录示例
date: 2026-10-02
tags: [NAS, 折腾]
description: 这是一篇放在 nas 子文件夹里的示例文章，演示如何分类和添加图片。
---

## 前言

这篇文章放在 `src/posts/nas/` 子文件夹里，slug 会自动变成 `nas-nas-example`，访问地址是 `/blog/nas-nas-example`。

## 如何添加图片

把图片放在 `public/images/posts/nas-nas-example/` 目录下，然后在文章里用绝对路径引用：

![示例图片](/blog/images/posts/nas-nas-example/example.jpg)

## 目录结构示例

```
src/posts/
├── hello-world.md              # 根目录文章
└── nas/                        # NAS 分类
    └── nas-example.md          # NAS 分类下的文章

public/images/posts/
└── nas-nas-example/            # 对应文章的图片文件夹
    └── example.jpg
```
