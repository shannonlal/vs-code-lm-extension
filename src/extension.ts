import * as vscode from 'vscode';
import { registerListOpenEditorsTool } from './tools/listOpenEditors';
import { registerGetConfigurationSettingTool } from './tools/getConfigurationSetting';
import { registerRevealFileInExplorerTool } from './tools/revealFileInExplorer';

/**
 * Helper function to determine the scope of a configuration setting
 */
function determineSettingScope(
    config: vscode.WorkspaceConfiguration,
    settingName: string
): string {
    const inspection = config.inspect(settingName);
    if (!inspection) {return 'unknown';}

    if (inspection.workspaceFolderValue !== undefined) {return 'workspaceFolder';}
    if (inspection.workspaceValue !== undefined) {return 'workspace';}
    if (inspection.globalValue !== undefined) {return 'user';}
    if (inspection.defaultValue !== undefined) {return 'default';}
    
    return 'unknown';
}

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

    // Register the listOpenEditors command
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

    // Register the getConfigurationSetting command
    const getConfigurationSettingCommand = vscode.commands.registerCommand(
        'vs-code-lm-extension.getConfigurationSetting',
        async () => {
            try {
                // Show input box for setting name
                const settingName = await vscode.window.showInputBox({
                    placeHolder: 'Enter setting name (e.g., "editor.fontSize")',
                    prompt: 'Enter the name of the VS Code setting to retrieve'
                });

                if (!settingName) {
                    return; // User cancelled
                }

                // Get configuration
                const config = vscode.workspace.getConfiguration();
                const value = config.get(settingName);

                if (value === undefined) {
                    vscode.window.showWarningMessage(`Setting "${settingName}" not found`);
                    return;
                }

                // Show setting value
                const scope = determineSettingScope(config, settingName);
                const message = `Setting: ${settingName}\nValue: ${JSON.stringify(value, null, 2)}\nScope: ${scope}`;
                
                vscode.window.showInformationMessage(message);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Error getting configuration: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    );

    // Register the revealFileInExplorer command
    const revealFileInExplorerCommand = vscode.commands.registerCommand(
        'vs-code-lm-extension.revealFileInExplorer',
        async () => {
            try {
                // Show file picker
                const files = await vscode.workspace.findFiles('**/*');
                const items = files.map(file => ({
                    label: vscode.workspace.asRelativePath(file.path),
                    description: file.fsPath
                }));

                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: 'Select a file to reveal in Explorer',
                    title: 'Reveal File in Explorer'
                });

                if (!selected) {
                    return; // User cancelled
                }

                // Reveal the file
                const uri = vscode.Uri.file(selected.description);
                await vscode.commands.executeCommand('revealInExplorer', uri);
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Error revealing file: ${error instanceof Error ? error.message : String(error)}`
                );
            }
        }
    );

    // Add all commands to subscriptions
    context.subscriptions.push(
        listOpenEditorsCommand,
        getConfigurationSettingCommand,
        revealFileInExplorerCommand
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
