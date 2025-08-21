import * as vscode from "vscode";

/**
 * `[id, value]`
 */
export type IConfigurationRecord<T = unknown> = readonly [string, T];

const Default_Config: readonly IConfigurationRecord[] = [
    ["typst.extension.toc.levels", "1..6"],
    ["typst.extension.toc.unorderedList.marker", "-"],
    ["typst.extension.toc.orderedList", false],
    ["typst.extension.toc.plaintext", false],
    ["typst.extension.toc.updateOnSave", true],
    ["typst.extension.toc.slugifyMode", "github"],
    ["typst.extension.toc.omittedFromToc", Object.create(null)],
    ["markdown.extension.preview.autoShowPreviewToSide", false],
    ["markdown.extension.orderedList.marker", "ordered"],
    ["markdown.extension.italic.indicator", "*"],
    ["markdown.extension.bold.indicator", "**"],
    ["markdown.extension.tableFormatter.normalizeIndentation", false],
    ["markdown.extension.tableFormatter.delimiterRowNoPadding", false],
    ["editor.insertSpaces", true],
    ["editor.tabSize", 4],
];

export function resetConfiguration(configurationTarget: vscode.ConfigurationTarget | boolean = true): Promise<void> {
    return updateConfiguration({ config: Default_Config, configurationTarget });
}

/**
 * A wrapper for `vscode.WorkspaceConfiguration.update()`.
 *
 * @param configurationTarget Defaults to `true` (Global).
 * @param overrideInLanguage Defaults to `undefined`.
 */
export async function updateConfiguration({
    config,
    configurationTarget = true,
    overrideInLanguage,
}: {
    config: Iterable<IConfigurationRecord>;
    configurationTarget?: vscode.ConfigurationTarget | boolean;
    overrideInLanguage?: boolean;
}): Promise<void> {
    const configObj = vscode.workspace.getConfiguration();
    for (const [id, value] of config) {
        await configObj.update(id, value, configurationTarget, overrideInLanguage);
    }
}
