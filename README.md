# 云谷校区地图

## 修改建筑介绍

在 GitHub 打开 `site/buildings/` 中对应楼号的 JSON，点击编辑按钮。修改 `summary` 中的中文介绍，填写 `url` 作为资料来源，提交 Pull Request。维护者审核合并后，由已连接的 Netlify 项目重新构建。各楼的介绍分别维护，组标 D1–D20 共用一份文件。

## 本地预览与部署

使用 Node.js 运行 `node build.cjs`，再打开 `site/index.html`。构建无需安装依赖。Netlify 的构建命令和发布目录已写入 netlify.toml。设计源文件位于 design/。
