import * as assert from 'assert';
import * as vscode from 'vscode';
import { RevealFileInExplorerTool } from '../tools/revealFileInExplorer';
import { FileNotFoundError } from '../errors';

suite('RevealFileInExplorer Tool Test Suite', () => {
    let tool: RevealFileInExplorerTool;

    setup(() => {
        tool = new RevealFileInExplorerTool();
    });

    test('Should have correct tool properties', () => {
        assert.strictEqual(tool.name, 'vscode-lm-tools_revealFileInExplorer');
        assert.strictEqual(tool.toolReferenceName, 'revealFileInExplorer');
        assert.strictEqual(tool.displayName, 'Reveal File in Explorer');
        assert.deepStrictEqual(tool.tags, ['explorer', 'navigation']);
        assert.ok(tool.modelDescription.length > 0);
    });

    test('Should prepare invocation with correct messages', async () => {
        const token = new vscode.CancellationTokenSource().token;
        const options: vscode.LanguageModelToolInvocationPrepareOptions<{ filePath: string }> = {
            input: { filePath: 'test/file.txt' }
        };

        const result = await tool.prepareInvocation(options, token);
        
        assert.ok(result.invocationMessage);
        assert.ok(result.confirmationMessages);
        assert.strictEqual(typeof result.confirmationMessages.title, 'string');
        assert.ok(result.confirmationMessages.message instanceof vscode.MarkdownString);
        assert.ok(result.confirmationMessages.message.value.includes('test/file.txt'));
    });

    test('Should handle cancellation', async () => {
        const tokenSource = new vscode.CancellationTokenSource();
        const options: vscode.LanguageModelToolInvocationOptions<{ filePath: string }> = {
            input: { filePath: 'test/file.txt' },
            toolInvocationToken: undefined
        };

        // Cancel the token
        tokenSource.cancel();

        const result = await tool.invoke(options, tokenSource.token);
        assert.ok(result instanceof vscode.LanguageModelToolResult);
        const content = result.content[0];
        assert.ok(content instanceof vscode.LanguageModelTextPart);
        assert.strictEqual(content.value, 'Operation cancelled');
    });

    test('Should throw FileNotFoundError for invalid file', async () => {
        const token = new vscode.CancellationTokenSource().token;
        const options: vscode.LanguageModelToolInvocationOptions<{ filePath: string }> = {
            input: { filePath: 'nonexistent/file.txt' },
            toolInvocationToken: undefined
        };

        // Mock the VS Code command to simulate file not found
        const originalExecuteCommand = vscode.commands.executeCommand;
        try {
            vscode.commands.executeCommand = async (_command: string, ..._args: any[]): Promise<any> => {
                throw new Error('File not found');
            };

            await assert.rejects(
                () => tool.invoke(options, token),
                (error: Error) => {
                    assert.ok(error instanceof FileNotFoundError);
                    assert.strictEqual(error.message, 'File not found or cannot be accessed: nonexistent/file.txt');
                    return true;
                }
            );
        } finally {
            vscode.commands.executeCommand = originalExecuteCommand;
        }
    });

    test('Should successfully reveal existing file', async () => {
        const token = new vscode.CancellationTokenSource().token;
        const options: vscode.LanguageModelToolInvocationOptions<{ filePath: string }> = {
            input: { filePath: 'test/file.txt' },
            toolInvocationToken: undefined
        };

        // Mock the VS Code command to simulate success
        const originalExecuteCommand = vscode.commands.executeCommand;
        try {
            vscode.commands.executeCommand = async (_command: string, ..._args: any[]): Promise<any> => {
                return Promise.resolve();
            };

            const result = await tool.invoke(options, token);
            assert.ok(result instanceof vscode.LanguageModelToolResult);
            const content = result.content[0];
            assert.ok(content instanceof vscode.LanguageModelTextPart);
            assert.strictEqual(content.value, 'File "test/file.txt" revealed in Explorer');
        } finally {
            vscode.commands.executeCommand = originalExecuteCommand;
        }
    });
});