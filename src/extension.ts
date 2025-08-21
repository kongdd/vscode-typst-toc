'use strict';

import { ExtensionContext, languages } from 'vscode';
// import { configManager } from "./configuration/manager";
// import { contextServiceManager } from "./editor-context-service/manager"
// import { commonMarkEngine, mdEngine } from "./markdownEngine";
// import { extendMarkdownIt } from "./markdown-it-plugin-provider";
// import { config as configNls } from './nls';
import * as toc from './toc';
import * as fmt from './formatting';
// import { importZolaSlug } from './util/slugify';

export function activate(context: ExtensionContext) {
    // configNls({ extensionContext: context });

    // context.subscriptions.push(
    //     configManager, contextServiceManager//, commonMarkEngine, mdEngine
    // );

    // wasm modules need to be imported asynchronously (or any modules relying on them synchronously need to be imported asynchronously)
    // importZolaSlug().then(() => {
    //     // we need to wait for the wasm module to be loaded before we can use it, it should only take a few milliseconds
    //     // if we move the activateMdExt function outside of this promise, slugify might be called before the wasm module has loaded which will cause it to fail
    //     activateMdExt(context);
    // });
    // return { extendMarkdownIt };
    toc.activate(context);

    // Typst word pattern - supports Typst syntax for text formatting
    // *bold* and **bolder** text patterns
    languages.setLanguageConfiguration('typst', {
        wordPattern: /(\*{1,2}|_+|`+)?[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+(-+[\p{Alphabetic}\p{Number}\p{Nonspacing_Mark}]+)*(\*{1,2}|_+|`+)?/gu
    });
    return {};
}
