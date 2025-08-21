import * as vscode from "vscode";
import LanguageIdentifier from "../contract/LanguageIdentifier";


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
