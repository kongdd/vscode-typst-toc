'use strict';

import * as path from 'path';
// import * as stringSimilarity from 'string-similarity';
import { CancellationToken, CodeLens, CodeLensProvider, commands, EndOfLine, ExtensionContext, languages, Position, Range, TextDocument, TextDocumentWillSaveEvent, TextEditor, Uri, window, workspace, WorkspaceEdit } from 'vscode';

// import { commonMarkEngine, mdEngine, Token } from './markdownEngine';
// import type * as MarkdownSpec from "./contract/MarkdownSpec";
import * as vscode from "vscode";

const enum LanguageIdentifier {
    Html = "html",
    Json = "json",
    Markdown = "markdown",
    PlainText = "plaintext",
}

const Regexp_Fenced_Code_Block = /^ {0,3}(?<fence>(?<char>[`~])\k<char>{2,})[^`\r\n]*$[^]*?^ {0,3}\k<fence>\k<char>* *$/gm;

export function isMdDocument(doc: vscode.TextDocument | undefined): boolean {
    if (doc) {
        const extraLangIds = vscode.workspace.getConfiguration("typst.extension").get<Array<string>>("extraLangIds");
        const langId = doc.languageId;
        if (extraLangIds?.includes(langId)) {
            return true;
        }
        if (langId === LanguageIdentifier.Markdown) {
            return true;
        }
    }
    return false;
}


type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Represents the essential properties of a heading.
 */
interface IHeadingBase {
    /** The heading level. */
    level: HeadingLevel;

    /**
     * The raw content of the heading according to the CommonMark Spec.
     * Can be **multiline**.
     */
    rawContent: string;

    /** The **zero-based** index of the beginning line of the heading in original document. */
    lineIndex: number;

    /** `true` to show in TOC. `false` to omit from TOC. */
    canInToc: boolean;
}

/**
 * Workspace config
 */
const docConfig = { tab: '  ', eol: '\r\n' };
const tocConfig = { startDepth: 1, endDepth: 6, listMarker: '-', orderedList: false, updateOnSave: false, plaintext: false, tabSize: 2 };

export function activate(context: ExtensionContext) {
    context.subscriptions.push(
        // commands.registerCommand('typst.extension.toc.create', createToc),
        // commands.registerCommand('typst.extension.toc.update', updateToc),
        commands.registerCommand('typst.extension.toc.addSecNumbers', addSectionNumbers),
        commands.registerCommand('typst.extension.toc.removeSecNumbers', removeSectionNumbers),
        // workspace.onWillSaveTextDocument(onWillSave),
    );
}

//#region TOC operation entrance

function addSectionNumbers() {
    const editor = window.activeTextEditor;

    if (!editor || !isMdDocument(editor.document)) {
        return;
    }

    loadTocConfig(editor);

    const doc = editor.document;
    const toc: readonly Readonly<IHeadingBase>[] = getAllRootHeading(doc, true, true)
        .filter(i => i.canInToc && i.level >= tocConfig.startDepth && i.level <= tocConfig.endDepth);

    if (toc.length === 0) {
        return;
    }

    const startDepth = Math.max(tocConfig.startDepth, Math.min(...toc.map(h => h.level)));

    let secNumbers = [0, 0, 0, 0, 0, 0];
    let edit = new WorkspaceEdit();
    toc.forEach(entry => {
        const level = entry.level;
        const lineNum = entry.lineIndex;

        secNumbers[level - 1] += 1;
        secNumbers.fill(0, level);
        // const secNumStr = [...Array(level - startDepth + 1).keys()].map(num => `${secNumbers[num + startDepth - 1]}.`).join('');
        const secNumStr = [...Array(level - startDepth + 1).keys()].map(num => `${secNumbers[num + startDepth - 1]}`).join('.');

        const lineText = doc.lineAt(lineNum).text;
        if (/^[=#]/.test(lineText)) {
            const newText = lineText.replace(/^(\s{0,3}[=#]+ +)((?:\d{1,9}\.?)* )?(.*)/, (_, g1, _g2, g3) => `${g1}${secNumStr} ${g3}`);
            edit.replace(doc.uri, doc.lineAt(lineNum).range, newText);
        }
    });

    return workspace.applyEdit(edit);
}

function removeSectionNumbers() {
    const editor = window.activeTextEditor;
    if (!editor || !isMdDocument(editor.document)) {
        return;
    }
    const doc = editor.document;
    const toc: readonly Readonly<IHeadingBase>[] = getAllRootHeading(doc, false, false);
    let edit = new WorkspaceEdit();
    toc.forEach(entry => {
        const lineNum = entry.lineIndex;
        const lineText = doc.lineAt(lineNum).text;
        const newText = lineText.includes('=') || lineText.includes('#')
            ? lineText.replace(/^(\s{0,3}[=#]+ +)((?:\d{1,9}\.?)* )?(.*)/, (_, g1, _g2, g3) => `${g1}${g3}`)
            : lineText.replace(/^(\s{0,3})((?:\d{1,9}\.?)* )?(.*)/, (_, g1, _g2, g3) => `${g1}${g3}`);
        edit.replace(doc.uri, doc.lineAt(lineNum).range, newText);
    });

    return workspace.applyEdit(edit);
}


/**
 * Returns a list of user defined excluded headings for the given document.
 * They are defined in the `toc.omittedFromToc` setting.
 * @param doc The document.
 */
function getProjectExcludedHeadings(doc: TextDocument): readonly Readonly<{ level: number, text: string; }>[] {
    const configObj = workspace.getConfiguration('typst.extension.toc').get<{ [path: string]: string[]; }>('omittedFromToc');

    if (typeof configObj !== 'object' || configObj === null) {
        window.showErrorMessage(`\`omittedFromToc\` must be an object (e.g. \`{"README.md": ["# Introduction"]}\`)`);
        return [];
    }

    const docUriString = doc.uri.toString();
    const docWorkspace = workspace.getWorkspaceFolder(doc.uri);
    const workspaceUri = docWorkspace ? docWorkspace.uri : undefined;

    // A few possible duplicate entries are bearable, thus, an array is enough.
    const omittedHeadings: string[] = [];

    for (const filePath of Object.keys(configObj)) {
        let entryUri: Uri;

        // Convert file system path to VS Code Uri.
        if (path.isAbsolute(filePath)) {
            entryUri = Uri.file(filePath);
        } else if (workspaceUri !== undefined) {
            entryUri = Uri.joinPath(workspaceUri, filePath);
        } else {
            continue; // Discard this entry.
        }

        // If the entry matches the document, read it.
        if (entryUri.toString() === docUriString) {
            if (Array.isArray(configObj[filePath])) {
                omittedHeadings.push(...configObj[filePath]);
            } else {
                window.showErrorMessage('Each property value of `omittedFromToc` setting must be a string array.');
            }
        }
    }

    return omittedHeadings.map(heading => {
        const matches = heading.match(/^ {0,3}(#{1,6})[ \t]+(.*)$/);
        if (matches === null) {
            window.showErrorMessage(`Invalid entry "${heading}" in \`omittedFromToc\``);
            return { level: -1, text: '' };
        }
        const [, sharps, name] = matches;
        return {
            level: sharps.length,
            text: name
        };
    });
}


/**
 * Updates `tocConfig` and `docConfig`.
 * @param editor The editor, from which we detect `docConfig`.
 */
function loadTocConfig(editor: TextEditor): void {
    const tocSectionCfg = workspace.getConfiguration('typst.extension.toc');
    const tocLevels = tocSectionCfg.get<string>('levels')!;
    let matches;
    if (matches = tocLevels.match(/^([1-6])\.\.([1-6])$/)) {
        tocConfig.startDepth = Number(matches[1]);
        tocConfig.endDepth = Number(matches[2]);
    }
    tocConfig.orderedList = tocSectionCfg.get<boolean>('orderedList')!;
    tocConfig.listMarker = tocSectionCfg.get<string>('unorderedList.marker')!;
    tocConfig.plaintext = tocSectionCfg.get<boolean>('plaintext')!;
    tocConfig.updateOnSave = tocSectionCfg.get<boolean>('updateOnSave')!;

    // Load workspace config
    docConfig.eol = editor.document.eol === EndOfLine.CRLF ? '\r\n' : '\n';

    let tabSize = Number(editor.options.tabSize);
    // Seems not robust.
    if (workspace.getConfiguration('typst.extension.list', editor.document.uri).get<string>('indentationSize') === 'adaptive') {
        tabSize = tocConfig.orderedList ? 3 : 2;
    }

    const insertSpaces = editor.options.insertSpaces;
    if (insertSpaces) {
        docConfig.tab = ' '.repeat(tabSize);
    } else {
        docConfig.tab = '\t';
    }
}

//#region Public utility

/**
 * Gets all headings in the root of the text document.
 *
 * The optional parameters default to `false`.
 * @returns In ascending order of `lineIndex`.
 */
export function getAllRootHeading(doc: TextDocument, respectMagicCommentOmit: boolean = false, respectProjectLevelOmit: boolean = false): Readonly<IHeadingBase>[] {
    /**
     * Replaces line content with empty.
     * @param foundStr The multiline string.
     */
    const replacer = (foundStr: string) => foundStr.replace(/[^\r\n]/g, '');

    /*
     * Text normalization
     * ==================
     * including:
     *
     * 1. (easy) YAML front matter, tab to spaces, HTML comment, Markdown fenced code blocks
     * 2. (complex) Setext headings to ATX headings
     * 3. Remove trailing space or tab characters.
     *
     * Note:
     * When recognizing or trimming whitespace characters, comply with the CommonMark Spec.
     * Do not use anything that defines whitespace as per ECMAScript, like `trim()`. <https://tc39.es/ecma262/#sec-trimstring>
     */

    // (easy)
    const lines: string[] = doc.getText()
        .replace(/^---.+?(?:\r?\n)---(?=[ \t]*\r?\n)/s, replacer) //// Remove YAML front matter
        .replace(/^\t+/gm, (match: string) => '    '.repeat(match.length)) // <https://spec.commonmark.org/0.29/#tabs>
        .replace(/^( {0,3})<!--([^]*?)-->.*$/gm, (match: string, leading: string, content: string) => {
            // Remove HTML block comment, together with all the text in the lines it occupies. <https://spec.commonmark.org/0.29/#html-blocks>
            // Exclude our magic comment.
            if (leading.length === 0 && /omit (in|from) toc/.test(content)) {
                return match;
            } else {
                return replacer(match);
            }
        })
        .replace(Regexp_Fenced_Code_Block, replacer)                 //// Remove fenced code blocks (and #603, #675)
        .split(/\r?\n/g);

    // Do transformations as many as possible in one loop, to save time.
    lines.forEach((lineText, i, arr) => {
        // (complex) Setext headings to ATX headings.
        // Still cannot perfectly handle some weird cases, for example:
        // * Multiline heading.
        // * A setext heading next to a list.
        if (
            i < arr.length - 1 // The current line is not the last.
            && /^ {0,3}(?:=+|-+)[ \t]*$/.test(arr[i + 1]) // The next line is a setext heading underline.
            && /^ {0,3}[^ \t\f\v]/.test(lineText)         // The indentation of the line is 0~3.
            && !/^ {0,3}#{1,6}(?: |\t|$)/.test(lineText)  // The line is not an ATX heading.
            && !/^ {0,3}(?:[*+-]|\d{1,9}(?:\.|\)))(?: |\t|$)/.test(lineText) // The line is not a list item.
            && !/^ {0,3}>/.test(lineText)                 // The line is not a block quote.
            // #629: Consecutive thematic breaks false positive. <https://github.com/commonmark/commonmark.js/blob/75474b071da06535c23adc17ac4132213ab31934/lib/blocks.js#L36>
            && !/^ {0,3}(?:(?:-[ \t]*){3,}|(?:\*[ \t]*){3,}|(?:_[ \t]*){3,})[ \t]*$/.test(lineText)
        ) {
            arr[i] = (arr[i + 1].includes('=') ? '# ' : '## ') + lineText;
            arr[i + 1] = '';
        }

        // Remove trailing space or tab characters.
        // Since they have no effect on subsequent operations, and removing them can simplify those operations.
        // <https://github.com/commonmark/commonmark.js/blob/75474b071da06535c23adc17ac4132213ab31934/lib/blocks.js#L503-L507>
        arr[i] = arr[i].replace(/[ \t]+$/, '');
    });

    /*
     * Mark omitted headings
     * =====================
     *
     * - headings with magic comment `<!-- omit from toc -->` (on their own)
     * - headings from `getProjectExcludedHeadings()` (and their subheadings)
     *
     * Note:
     * * We have trimmed trailing space or tab characters for every line above.
     * * We have performed leading tab-space conversion above.
     */

    const projectLevelOmittedHeadings = respectProjectLevelOmit ? getProjectExcludedHeadings(doc) : [];

    /**
     * Keep track of the omitted heading's depth to also omit its subheadings.
     * This is only for project level omitting.
     */
    let ignoredDepthBound: HeadingLevel | undefined = undefined;

    const toc: IHeadingBase[] = [];

    for (let i: number = 0; i < lines.length; i++) {
        const crtLineText = lines[i];

        // <https://spec.commonmark.org/0.29/#atx-headings>
        var ishead = /(^[#=]{1,6}\s)|(^\/\/ {0,3}[#=]{1,6}(\s|$))/.test(crtLineText); // 匹配typst和markdown标题

        // Skip non-ATX heading lines.
        if (!ishead) continue;

        // Extract heading info.
        const matches = /^(?:\/\/|) {0,3}([#=]{1,6})(.*)$/.exec(crtLineText)!;
        const entry: IHeadingBase = {
            level: matches[1].length as HeadingLevel,
            rawContent: matches[2].replace(/^[ \t]+/, '').replace(/[ \t]+#+[ \t]*$/, ''),
            lineIndex: i,
            canInToc: true,
        };

        // Omit because of magic comment
        if (
            respectMagicCommentOmit
            && entry.canInToc
            && (
                // The magic comment is above the heading.
                (
                    i > 0
                    && /^<!-- omit (in|from) toc -->$/.test(lines[i - 1])
                )

                // The magic comment is at the end of the heading.
                || /<!-- omit (in|from) toc -->$/.test(crtLineText)
            )
        ) {
            entry.canInToc = false;
        }

        // Omit because of `projectLevelOmittedHeadings`.
        if (respectProjectLevelOmit && entry.canInToc) {
            // Whether omitted as a subheading
            if (ignoredDepthBound !== undefined && entry.level > ignoredDepthBound) {
                entry.canInToc = false;
            }

            // Whether omitted because it is in `projectLevelOmittedHeadings`.
            if (entry.canInToc) {
                if (projectLevelOmittedHeadings.some(({ level, text }) => level === entry.level && text === entry.rawContent)) {
                    entry.canInToc = false;
                    ignoredDepthBound = entry.level;
                } else {
                    // Otherwise reset ignore bound.
                    ignoredDepthBound = undefined;
                }
            }
        }

        toc.push(entry);
    }
    return toc;
}

/**
 * Gets all headings in the root of the text document, with additional TOC specific properties.
 * @returns In ascending order of `lineIndex`.
 */
export function getAllTocEntry(doc: TextDocument, {
    respectMagicCommentOmit = false,
    respectProjectLevelOmit = false,
}: {
    respectMagicCommentOmit?: boolean;
    respectProjectLevelOmit?: boolean;
}): readonly Readonly<IHeadingBase>[] {
    const rootHeadings: readonly Readonly<IHeadingBase>[] = getAllRootHeading(doc, respectMagicCommentOmit, respectProjectLevelOmit);
    return rootHeadings;
}
