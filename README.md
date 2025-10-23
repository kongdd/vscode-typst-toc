# typst-title-numering for VSCode <!-- omit in toc -->

> Typst章节标题自动编号

[![version](https://img.shields.io/vscode-marketplace/v/yzhang.markdown-all-in-one.svg?style=flat-square&label=vscode%20marketplace)](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)
[![installs](https://img.shields.io/vscode-marketplace/d/yzhang.markdown-all-in-one.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/yzhang-gh/vscode-markdown/main.yml?style=flat-square&branch=master)](https://github.com/yzhang-gh/vscode-markdown/actions)
[![GitHub stars](https://img.shields.io/github/stars/yzhang-gh/vscode-markdown.svg?style=flat-square&label=github%20stars)](https://github.com/yzhang-gh/vscode-markdown)
[![GitHub Contributors](https://img.shields.io/github/contributors/yzhang-gh/vscode-markdown.svg?style=flat-square)](https://github.com/yzhang-gh/vscode-markdown/graphs/contributors)


在vscode插件商店中搜索`typst-title-numering`，安装。

## 使用方法

- 使用快捷键`Ctrl + Shift + u`自动更新编号；

- 如果想移除编号，需要在vscode控制面板使用，`remove section numbering`命令。


## 示例

```typst
// = LEVEL1，隐藏的一级标题，下文H1章节编号从2开始
// = LEVEL1，隐藏的一级标题，下文H1章节编号从3开始

这样可以方便的从任意一章开始编号，不同章节放到不同的typst文件中。

= 3 LEVEL1

$ 
  y 
  = x + 1 // 公式里面的"="不会被当作标题标记，但"="不能单独空一行
$

== LEVEL2 // <!-- omit in toc -->

这是不参与编号的章节。`// <!-- omit in toc -->`后面不要写其他文字。

*用途*：摘要，参考文献，Acknowledgements等不需要编号的章节。


== 3.1 LEVEL2

因为前面有三个隐藏的一级标题，一个omit的二级标题，因此章节编号为3.1。


=== 3.1.1 LEVEL3

- 使用快捷键`Ctrl + Shift + u`自动更新编号；

- 如果想移除编号，需要在vscode控制面板使用，`remove section numbering`命令。

```

<!-- 
## 2 Developer

```
npm install
npm run build | npm test
vsce package | code --install-extension .\typst-toc-numering-0.1.1.vsix
``` 
-->
