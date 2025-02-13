import * as vscode from 'vscode';
import { registerListOpenEditorsTool } from './tools/listOpenEditors';
import { registerGetConfigurationSettingTool } from './tools/getConfigurationSetting';
import { registerRevealFileInExplorerTool } from './tools/revealFileInExplorer';

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
    console.log('VS Code Language Model Tools extension is now active');

    // Register the Language Model tools
    const listOpenEditorsTool = registerListOpenEditorsTool(context);
    const getConfigurationSettingTool = registerGetConfigurationSettingTool(context);
    const revealFileInExplorerTool = registerRevealFileInExplorerTool(context);
    
    context.subscriptions.push(
        listOpenEditorsTool,
        getConfigurationSettingTool,
        revealFileInExplorerTool
    );

    // Register the listOpenEditors command for backward compatibility
    const listOpenEditorsCommand = vscode.commands.registerCommand('vs-code-lm-extension.listOpenEditors', async () => {
        try {
            // Get all visible editors
            const editors = vscode.window.visibleTextEditors;
            
            if (editors.length === 0) {
                vscode.window.showInformationMessage('No editors are currently open');
                return;
            }

            // Create a list of editor information
            const editorInfo = editors.map(editor => ({
                fileName: editor.document.fileName,
                languageId: editor.document.languageId,
                lineCount: editor.document.lineCount,
                isUntitled: editor.document.isUntitled
            }));

            // Display the information in a quick pick
            const items = editorInfo.map(info => ({
                label: vscode.workspace.asRelativePath(info.fileName),
                description: `${info.languageId} | ${info.lineCount} lines`,
                detail: info.fileName
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select an editor to focus',
                title: 'Open Editors'
            });

            if (selected) {
                // Find and show the selected document
                const doc = await vscode.workspace.openTextDocument(selected.detail);
                await vscode.window.showTextDocument(doc);
            }
        } catch (error) {
            vscode.window.showErrorMessage(
                `Error listing editors: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    });

    context.subscriptions.push(listOpenEditorsCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
