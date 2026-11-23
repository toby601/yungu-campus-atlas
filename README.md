# 云谷校区地图

[打开公开地图（Netlify）](https://yungu-campus-atlas.netlify.app/) · [GitHub Pages 镜像](https://toby601.github.io/yungu-campus-atlas/) · [建筑介绍目录](site/buildings/)

地图默认显示地上全校视图。滚轮或控件支持 50%–3200% 缩放，点击复位可回到完整视图。打开左侧“建筑导航”，按分区浏览或搜索楼号与名称。点选后，介绍显示在同一侧栏中，选择 G、B1、B2 查看不同楼层。地下连接包含示意转绘。

## 怎样修改一栋楼的介绍？

1. 到[建筑介绍目录](site/buildings/)找到楼号，例如 [E12 图书中心](site/buildings/E12.md)。
2. 登录 GitHub，打开文件并点击铅笔图标。普通贡献者按提示创建自己的仓库副本。
3. 编辑“介绍”下面的正文。可用空行分段。保留文件名、标题、分类以及“介绍”“来源”两个小标题。在“来源”下面单独填写一个完整公开网址，没有来源可留空。
4. 点击 **Propose changes** 或 **Commit changes**，简述变更并创建 Pull Request。请写明更新依据，特别是开放时间、入住安排等容易变化的信息。
5. 维护者审核合并后，GitHub Pages 自动更新。Netlify 目前通过正式部署命令发布。

文件示例：

```markdown
# 图书中心

分类：教学科研

## 介绍

图书馆大厅位于二层。三层设有自习空间。

## 来源

https://wikilake.netlify.app/buildings/Yungu/E/E12
```

## 本地运行

安装 Node.js 后在仓库根目录执行 `node build.cjs`，从 `site/` 启动静态服务器（例如 `python -m http.server 8000 --directory site`），在浏览器打开 http://localhost:8000 。修改 Markdown 后重新执行构建并刷新。生成文件 `site/catalog.js` 不用手动编辑。

## 项目结构与发布

- `site/buildings/`：逐栋 Markdown 原稿。
- `site/atlas.js`、`site/index.html`、`site/navigation.*`：分层地图、点选与导航源码。
- `site/assets/`：底图、区域图与地下蒙版。
- `design/`：可编辑的 FigCraft 导航设计稿。
- `.github/workflows/pages.yml`：构建和部署 GitHub Pages。Netlify 构建命令为 `node build.cjs`，发布目录为 `site`。

程序代码采用 [MIT 许可证](LICENSE)。底图、工程图转绘及引用介绍的使用权依各自权利人和来源规定；楼宇资料来源见对应 Markdown。
