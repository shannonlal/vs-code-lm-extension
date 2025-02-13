import * as vscode from 'vscode';
import { RevealFileInExplorerParams } from '../../types/revealFileInExplorer';
import { FileNotFoundError, UserCancellationError } from '../../errors';

/**
 * Tool for revealing files in the VS Code Explorer
 */
export class RevealFileInExplorerTool implements vscode.LanguageModelTool<RevealFileInExplorerParams> {
    readonly name = 'vscode-lm-tools_revealFileInExplorer';
    readonly tags = ['explorer', 'navigation'];
    readonly toolReferenceName = 'revealFileInExplorer';
    readonly displayName = 'Reveal File in Explorer';
    readonly modelDescription = 'Reveals and selects a specified file in the VS Code Explorer sidebar';

    /**
     * Prepare the tool invocation with user confirmation
     */
    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<RevealFileInExplorerParams>,
        _token: vscode.CancellationToken
    ): Promise<vscode.PreparedToolInvocation> {
        return {
            invocationMessage: `Revealing file: ${options.input.filePath}`,
            confirmationMessages: {
                title: 'Reveal File in Explorer',
                message: new vscode.MarkdownString(`Reveal and select "${options.input.filePath}" in the Explorer?`)
            }
        };
    }

    /**
     * Execute the tool to reveal a file in the explorer
     */
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<RevealFileInExplorerParams>,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolResult> {
        try {
            // Check for cancellation
            if (token.isCancellationRequested) {
                throw new UserCancellationError(this.name);
            }

            const filePath = options.input.filePath;
            const uri = vscode.Uri.file(filePath);

            // Try to reveal the file in explorer
            await vscode.commands.executeCommand('revealInExplorer', uri);

            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(`File "${filePath}" revealed in Explorer`)
            ]);
        } catch (error) {
            if (error instanceof UserCancellationError) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart('Operation cancelled')
                ]);
            }

            throw new FileNotFoundError(options.input.filePath);
        }
    }
}

/**
 * Create and register the RevealFileInExplorer tool
 */
export function registerRevealFileInExplorerTool(_context: vscode.ExtensionContext): vscode.Disposable {
    const tool = new RevealFileInExplorerTool();
    return vscode.lm.registerTool(tool.name, tool);
}