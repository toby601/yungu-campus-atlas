# 云谷校区地图

[打开校园地图](https://toby601.github.io/yungu-campus-atlas/) · [浏览建筑介绍](site/buildings/README.md)

这是一张西湖大学云谷校区的交互地图。你可以查找楼号、对照地上与地下区域，也可以选择建筑、校门或步道上的位置，规划经过多个地点的步行或骑行路线。

## 使用地图

- **找建筑**　默认打开地上层 G。搜索楼号或名称，或直接点选楼体，即可查看建筑名称和介绍。
- **看地下层**　切换到 B1 或 B2 可与地上底图对照。部分地下范围和连接依据资料示意绘制。
- **规划路线**　点「路线」选择起终点，也可以从建筑详情点「从这里出发」或「去这里」。点「添加途经点」可安排多个停靠地点，地图上的数字对应列表顺序。
- **选择出行方式**　步行可经过 E10 学术环首层，骑行沿室外路网规划。距离按地图比例估算，时间按步行约 4.5 公里/小时、骑行约 12 公里/小时估算。室内段为示意，实际通行以现场为准。
- **手机上看全程**　双指缩放、单指拖动地图。向下收起路线面板可继续查看路线，点「结束规划」退出。

## 贡献建筑介绍

1. 在[建筑介绍目录](site/buildings/README.md)按楼号找到 Markdown 文件，例如 [E12 图书中心](site/buildings/E12.md)。
2. 登录 GitHub，点文件右上方的铅笔进入编辑。如果提示创建仓库副本，按提示操作。
3. 在「介绍」下修改正文，段落之间留一个空行。保留文件名、楼名标题、分类以及「介绍」「来源」两个小标题。「来源」下可填写一个可公开访问的完整网址，暂无来源可留空。
4. 保存修改并创建 Pull Request，简述改了什么、依据是什么。维护者合并到 main 后，GitHub Pages 会自动构建并发布。

## 本地预览与维护

在仓库根目录运行以下命令，然后打开[本地地图](http://localhost:8000/)。

```sh
node build.cjs
python -m http.server 8000 --directory site
```

修改建筑介绍后，重新运行第一条命令并刷新页面。`site/catalog.js` 由构建生成。

| 内容 | 位置 |
| --- | --- |
| 建筑介绍原稿 | [site/buildings/](site/buildings/README.md) |
| 分层地图与点选 | [site/atlas.js](site/atlas.js) |
| 路线规划与途经点 | [site/walking.js](site/walking.js) |
| 底图与地下蒙版 | [site/assets/](site/assets/) |
| FigCraft 导航设计稿 | [design/](design/) |
| 自动发布流程 | [.github/workflows/pages.yml](.github/workflows/pages.yml) |

调整地上底图后，安装 Pillow 和 NumPy，依次运行 `python tools/build-walk-grid.py` 和 `python tools/build-walk-edges.py`，更新步道与建筑边缘的连接数据。

程序代码采用 [MIT 许可证](LICENSE)。底图、工程图转绘及引用资料的使用依各自权利人和来源规定，建筑资料出处见对应的 Markdown 文件。
