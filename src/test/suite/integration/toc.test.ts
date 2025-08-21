import { Selection } from "vscode";
import { resetConfiguration, updateConfiguration } from "../util/configuration";
import { testCommand, Test_Md_File_Path } from "../util/generic";

suite("TOC.", () => {
    suiteSetup(async () => {
        await resetConfiguration();
    });

    suiteTeardown(async () => {
        await resetConfiguration();
    });

    test("Add section numbers", () => {
        return testCommand('typst.extension.toc.addSecNumbers',
            [
                '---',
                'title: test',
                '---',
                '# Heading 1',
                '##  Heading 1.1',
                '   Heading 2',
                '===',
                '```markdown',
                '# _Heading 3',
                '```',
                '## Heading 2.1',
                '## _Heading 2.2 <!-- omit in toc -->',
                '<!--',
                '## _Heading 2.3',
                '-->',
                '## Heading 2.2',
            ],
            new Selection(0, 0, 0, 0),
            [
                '---',
                'title: test',
                '---',
                '# 1 Heading 1',
                '##  1.1 Heading 1.1',
                '   Heading 2',
                '===',
                '```markdown',
                '# _Heading 3',
                '```',
                '## 2.1 Heading 2.1',
                '## _Heading 2.2 <!-- omit in toc -->',
                '<!--',
                '## _Heading 2.3',
                '-->',
                '## 2.2 Heading 2.2',
            ],
            new Selection(0, 0, 0, 0));
    });

    test("Update section numbers", () => {
        return testCommand('typst.extension.toc.addSecNumbers',
            [
                '---',
                'title: test',
                '---',
                '# Heading 1',
                '## 1.2. Heading 1.1',
                '2. Not Heading',
                '===',
                '```markdown',
                '# _Heading 3',
                '```',
                '## 2.1.1. Heading 1.2',
                '## _Heading 2.2 <!-- omit in toc -->',
                '<!--',
                '## _Heading 2.3',
                '-->',
                '## 2.2. Heading 1.3',
            ],
            new Selection(0, 0, 0, 0),
            [
                '---',
                'title: test',
                '---',
                '# 1 Heading 1',
                '## 1.1 Heading 1.1',
                '2. Not Heading',
                '===',
                '```markdown',
                '# _Heading 3',
                '```',
                '## 1.2 Heading 1.2',
                '## _Heading 2.2 <!-- omit in toc -->',
                '<!--',
                '## _Heading 2.3',
                '-->',
                '## 1.3 Heading 1.3',
            ],
            new Selection(0, 0, 0, 0));
    });

    test("Remove section numbers", () => {
        return testCommand('typst.extension.toc.removeSecNumbers',
            [
                '---',
                'title: test',
                '---',
                '# 1. Heading 1',
                '## 1.1. Heading 1.1',
                '2. Not Heading',
                '===',
                '```markdown',
                '# _Heading 3',
                '```',
                '## 2.1. Heading 2.1',
                '## _Heading 2.2 <!-- omit in toc -->',
                '<!--',
                '## _Heading 2.3',
                '-->',
                '## 2.2. Heading 2.2',
            ],
            new Selection(0, 0, 0, 0),
            [
                '---',
                'title: test',
                '---',
                '# Heading 1',
                '## Heading 1.1',
                '2. Not Heading',
                '===',
                '```markdown',
                '# _Heading 3',
                '```',
                '## Heading 2.1',
                '## _Heading 2.2 <!-- omit in toc -->',
                '<!--',
                '## _Heading 2.3',
                '-->',
                '## Heading 2.2',
            ],
            new Selection(0, 0, 0, 0));
    });

    test("Section numbering starting level", () => {
        return testCommand('typst.extension.toc.addSecNumbers',
            [
                '# Heading <!-- omit in toc -->',
                '## Heading 1',
                '## Heading 2',
                '## Heading 3',
            ],
            new Selection(0, 0, 0, 0),
            [
                '# Heading <!-- omit in toc -->',
                '## 1 Heading 1',
                '## 2 Heading 2',
                '## 3 Heading 3',
            ],
            new Selection(0, 0, 0, 0));
    });

    test("Section numbering and `toc.levels`", async () => {
        await updateConfiguration({ config: [["typst.extension.toc.levels", "2..6"]] });
        await testCommand('typst.extension.toc.addSecNumbers',
            [
                '# Heading',
                '## Heading 1',
                '## Heading 2',
                '## Heading 3',
            ],
            new Selection(0, 0, 0, 0),
            [
                '# Heading',
                '## 1 Heading 1',
                '## 2 Heading 2',
                '## 3 Heading 3',
            ],
            new Selection(0, 0, 0, 0)
        );
        await resetConfiguration();
    });
});
