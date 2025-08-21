# Markdown Support for Visual Studio Code <!-- omit in toc -->

[![version](https://img.shields.io/vscode-marketplace/v/yzhang.markdown-all-in-one.svg?style=flat-square&label=vscode%20marketplace)](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)
[![installs](https://img.shields.io/vscode-marketplace/d/yzhang.markdown-all-in-one.svg?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/yzhang-gh/vscode-markdown/main.yml?style=flat-square&branch=master)](https://github.com/yzhang-gh/vscode-markdown/actions)
[![GitHub stars](https://img.shields.io/github/stars/yzhang-gh/vscode-markdown.svg?style=flat-square&label=github%20stars)](https://github.com/yzhang-gh/vscode-markdown)
[![GitHub Contributors](https://img.shields.io/github/contributors/yzhang-gh/vscode-markdown.svg?style=flat-square)](https://github.com/yzhang-gh/vscode-markdown/graphs/contributors)

All you need for Markdown (keyboard shortcuts, table of contents, auto preview and more).

***Note***: VS Code has basic Markdown support out-of-the-box (e.g, **Markdown preview**), please see the [official documentation](https://code.visualstudio.com/docs/languages/markdown) for more information.

**Table of Contents**

- [Features](#features)
  - [Keyboard shortcuts](#keyboard-shortcuts)
  - [Table of contents](#table-of-contents)
  - [List editing](#list-editing)
  - [Print Markdown to HTML](#print-markdown-to-html)
  - [GitHub Flavored Markdown](#github-flavored-markdown)
  - [Math](#math)
  - [Auto completions](#auto-completions)
  - [Others](#others)
- [Available Commands](#available-commands)
- [Keyboard Shortcuts](#keyboard-shortcuts-1)
- [Supported Settings](#supported-settings)

## Features

### Keyboard shortcuts

<p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/gifs/toggle-bold.gif" alt="toggle bold gif" width="282px">
<br>(Typo: multiple words)</p>

<p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/gifs/check-task-list.gif" alt="check task list" width="240px"></p>

See full key binding list in the [keyboard shortcuts](#keyboard-shortcuts-1) section

### Table of contents

<p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/toc.png" alt="toc" width="305px"></p>

- Run command "**Create Table of Contents**" (in the [VS Code Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)) to insert a new table of contents.

- The TOC is **automatically updated** on file save by default. To disable, please change the `toc.updateOnSave` option.

- The **indentation type (tab or spaces)** of TOC can be configured per file. Find the setting in the right bottom corner of VS Code's status bar.

  ***Note***: Be sure to also check the `list.indentationSize` option.

- To make TOC **compatible with GitHub or GitLab**, set option `slugifyMode` accordingly

- Three ways to **control which headings are present** in the TOC:

  <details>
  <summary>Click to expand</summary>

  1. Add `<!-- omit from toc -->` at the end of a heading to ignore it in TOC\
    (It can also be placed above a heading)

  2. Use `toc.levels` setting.

  3. You can also use the `toc.omittedFromToc` setting to omit some headings (and their subheadings) from TOC:

     ```js
     // In your settings.json
     "typst.extension.toc.omittedFromToc": {
       // Use a path relative to your workspace.
       "README.md": [
           "# Introduction",
           "## Also omitted",
       ],
       // Or an absolute path for standalone files.
       "/home/foo/Documents/todo-list.md": [
         "## Shame list (I'll never do these)",
       ]
     }
     ```

     ***Note***:

     - Setext headings (underlined with `===` or `---`) can also be omitted, just put their `# ` and `## ` versions in the setting, respectively.
     - When omitting heading, **make sure headings within a document are unique**. Duplicate headings may lead to unpredictable behavior.

  </details>

- Easily add/update/remove **section numbering**

  <img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/gifs/section-numbers.gif" alt="section numbers" width="768px">

- *In case you are seeing **unexpected TOC recognition**, you can add a `<!-- no toc -->` comment above the list*.

### List editing

<p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/gifs/on-enter-key.gif" alt="on enter key" width="214px"></p>

<p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/gifs/tab-backspace.gif" alt="on tab/backspace key" width="214px"></p>

<p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/gifs/fix-marker.gif" alt="fix ordered list markers" width="214px"></p>

***Note***: By default, this extension tries to determine indentation size for different lists according to [CommonMark Spec](https://spec.commonmark.org/0.29/#list-items). If you prefer to use a fixed tab size, please change the `list.indentationSize` setting.

### Print Markdown to HTML

- Commands `Markdown: Print current document to HTML`
  and `Markdown: Print documents to HTML` (batch mode)

- **Compatible** with other installed Markdown plugins (e.g. [Markdown Footnotes](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-footnotes)).
  The exported HTML should look the same as inside VS Code (except for a few theme colors due to the limitations of APIs).

- Use comment `<!-- title: Your Title -->` (in the first line) to specify a title of the exported HTML.

- Plain links to `.md` files will be converted to `.html`.

- It's recommended to print the exported HTML to PDF with browser (e.g. Chrome) if you want to share your documents with others.

### GitHub Flavored Markdown

- Table formatter

  <p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/gifs/table-formatter.gif" alt="table formatter" width="246px"></p>

  ***Note***: The key binding is <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> on Linux. See [Visual Studio Code Key Bindings](https://code.visualstudio.com/docs/getstarted/keybindings#_keyboard-shortcuts-reference).

- Task lists

### Math

<p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/math.png" alt="math" width="544px"></p>

Please use [Markdown+Math](https://marketplace.visualstudio.com/items?itemName=goessner.mdmath) for dedicated math support. Be sure to disable `math.enabled` option of this extension.

### Auto completions

Tip: also support the option `completion.root`

- Images/Files (respects option `search.exclude`)

  <p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/image-completions.png" alt="image completions" width="351px"></p>

- Math functions (including option `katex.macros`)

  <p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/math-completions.png" alt="math completions" width="154px"></p>

- Reference links

  <p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/reference-link.png" alt="reference links" width="301px"></p>

### Others

- Paste link on selected text

  <p><img src="https://github.com/yzhang-gh/vscode-markdown/raw/master/images/gifs/paste-link.gif" alt="paste link" width="342px"></p>

- Add "Close Preview" keybinding, which allows you to close the preview tab using the same keybinding of "Open Preview" (<kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> or <kbd>Ctrl</kbd> + <kbd>K</kbd> <kbd>V</kbd>).

## Available Commands

- typst-toc: Create Table of Contents
- typst-toc: Update Table of Contents
- typst-toc: Add/Update section numbers
- typst-toc: Remove section numbers
- typst-toc: Toggle code span
- typst-toc: Toggle code block
- typst-toc: Print current document to HTML
- typst-toc: Print documents to HTML
- typst-toc: Toggle math environment
- typst-toc: Toggle list
  - It will cycle through list markers (by default `-`, `*`, `+`, `1.` and `1)`, which can be changed with option `list.toggle.candidate-markers`).

## Keyboard Shortcuts

<details>
<summary>Table</summary>

| Key                                                              | Command                          |
| ---------------------------------------------------------------- | -------------------------------- |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>B</kbd>                    | Toggle bold                      |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>I</kbd>                    | Toggle italic                    |
| <kbd>Alt</kbd>+<kbd>S</kbd> (on Windows)                         | Toggle strikethrough<sup>1</sup> |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>]</kbd>                | Toggle heading (uplevel)         |
| <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>[</kbd>                | Toggle heading (downlevel)       |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>M</kbd>                    | Toggle math environment          |
| <kbd>Alt</kbd> + <kbd>C</kbd>                                    | Check/Uncheck task list item     |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> | Toggle preview                   |
| <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>K</kbd> <kbd>V</kbd>       | Toggle preview to side           |

<sup>1. If the cursor is on a list/task item without selection, strikethrough will be added to the whole item (line)</sup>

</details>

## Supported Settings

<details>
<summary>Table</summary>

| Name                                                    | Default                         | Description                                                                                      |
| ------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ |
| `typst.extension.completion.respectVscodeSearchExclude` | `true`                          | Whether to consider `search.exclude` option when providing file path completions                 |
| `typst.extension.completion.root`                       |                                 | Root folder when providing file path completions (It takes effect when the path starts with `/`) |
| `typst.extension.italic.indicator`                      | `*`                             | Use `*` or `_` to wrap italic text                                                               |
| `typst.extension.bold.indicator`                        | `**`                            | Use `**` or `__` to wrap bold text                                                               |
| `typst.extension.katex.macros`                          | `{}`                            | KaTeX macros e.g. `{ "\\name": "expansion", ... }`                                               |
| `typst.extension.list.indentationSize`                  | `adaptive`                      | Use different indentation size for ordered and unordered list                                    |
| `typst.extension.list.toggle.candidate-markers`         | `[ "-", "*", "+", "1.", "1)" ]` | Use a array for toggle ordered list marker e.g. `["*", "1."]`                                    |
| `typst.extension.orderedList.autoRenumber`              | `true`                          | Auto fix list markers as you edits                                                               |
| `typst.extension.orderedList.marker`                    | `ordered`                       | Or `one`: always use `1.` as ordered list marker                                                 |
| `typst.extension.preview.autoShowPreviewToSide`         | `false`                         | Automatically show preview when opening a Markdown file.                                         |
| `typst.extension.print.absoluteImgPath`                 | `true`                          | Convert image path to absolute path                                                              |
| `typst.extension.print.imgToBase64`                     | `false`                         | Convert images to base64 when printing to HTML                                                   |
| `typst.extension.print.includeVscodeStylesheets`        | `true`                          | Whether to include VS Code's default styles                                                      |
| `typst.extension.print.onFileSave`                      | `false`                         | Print to HTML on file save                                                                       |
| `typst.extension.print.theme`                           | `light`                         | Theme of the exported HTML                                                                       |
| `typst.extension.print.validateUrls`                    | `true`                          | Enable/disable URL validation when printing                                                      |
| `typst.extension.syntax.decorations`                    | `true`                          | Add decorations to ~~strikethrough~~ and `code span`                                             |
| `typst.extension.syntax.decorationFileSizeLimit`        | 50000                           | Don't render syntax decorations if a file is larger than this size (in byte/B)                   |
| `typst.extension.syntax.plainTheme`                     | `false`                         | A distraction-free theme                                                                         |
| `typst.extension.tableFormatter.enabled`                | `true`                          | Enable GFM table formatter                                                                       |
| `typst.extension.toc.slugifyMode`                       | `github`                        | Slugify mode for TOC link generation (`vscode`, `github`, `gitlab` or `gitea`)                   |
| `typst.extension.toc.omittedFromToc`                    | `{}`                            | Lists of headings to omit by project file (e.g. `{ "README.md": ["# Introduction"] }`)           |
| `typst.extension.toc.levels`                            | `1..6`                          | Control the heading levels to show in the table of contents.                                     |
| `typst.extension.toc.orderedList`                       | `false`                         | Use ordered list in the table of contents.                                                       |
| `typst.extension.toc.plaintext`                         | `false`                         | Just plain text.                                                                                 |
| `typst.extension.toc.unorderedList.marker`              | `-`                             | Use `-`, `*` or `+` in the table of contents (for unordered list)                                |
| `typst.extension.toc.updateOnSave`                      | `true`                          | Automatically update the table of contents on save.                                              |

</details>
