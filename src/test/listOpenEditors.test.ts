import * as assert from 'assert';
import * as vscode from 'vscode';
import { ListOpenEditorsTool } from '../tools/listOpenEditors';
import { EditorInfo } from '../types/listOpenEditors';
import { NoEditorsOpenError } from '../errors';

// Create a test-specific subclass to access protected methods
class TestListOpenEditorsTool extends ListOpenEditorsTool {
    // These methods are already protected in the parent class,
    // so we can access them directly in tests
    public async getEditorInfoTest(): Promise<{ editors: EditorInfo[], activeEditor?: EditorInfo }> {
        return this.getEditorInfo();
    }

    public formatEditorListTest(editors: EditorInfo[], activeEditor?: EditorInfo): string {
        return this.formatEditorList(editors, activeEditor);
    }
}

suite('ListOpenEditors Tool Test Suite', () => {
    let tool: TestListOpenEditorsTool;

    setup(() => {
        tool = new TestListOpenEditorsTool();
    });

    test('Tool has correct metadata', () => {
        assert.strictEqual(tool.name, 'vscode-lm-tools_listOpenEditors');
        assert.deepStrictEqual(tool.tags, ['editors']);
        assert.strictEqual(tool.toolReferenceName, 'listOpenEditors');
        assert.strictEqual(tool.displayName, 'List Open Editors');
        assert.ok(tool.modelDescription.length > 0);
    });

    test('formatEditorList formats correctly', () => {
        const mockEditors: EditorInfo[] = [
            {
                filePath: '/path/to/file1.ts',
                fileName: 'file1.ts',
                languageId: 'typescript',
                isDirty: false,
                viewColumn: 1,
                isActive: true
            },
            {
                filePath: '/path/to/file2.js',
                fileName: 'file2.js',
                languageId: 'javascript',
                isDirty: true,
                viewColumn: 2,
                isActive: false
            }
        ];

        const result = tool.formatEditorListTest(mockEditors, mockEditors[0]);
        
        assert.ok(result.includes('Found 2 open editors'));
        assert.ok(result.includes('file1.ts (typescript) [active]'));
        assert.ok(result.includes('file2.js (javascript) [unsaved]'));
        assert.ok(result.includes('Active editor:'));
    });

    test('getEditorInfo throws NoEditorsOpenError when no editors', async () => {
        // Mock empty editors array
        const originalVisibleEditors = vscode.window.visibleTextEditors;
        Object.defineProperty(vscode.window, 'visibleTextEditors', {
            get: () => []
        });

        try {
            await assert.rejects(
                () => tool.getEditorInfoTest(),
                NoEditorsOpenError
            );
        } finally {
            // Restore original
            Object.defineProperty(vscode.window, 'visibleTextEditors', {
                get: () => originalVisibleEditors
            });
        }
    });

    test('prepareInvocation returns correct result', async () => {
        const token = new vscode.CancellationTokenSource().token;
        const options: vscode.LanguageModelToolInvocationPrepareOptions<{}> = {
            input: {}
        };

        const result = await tool.prepareInvocation(options, token);
        
        assert.ok(result.invocationMessage);
        assert.ok(result.confirmationMessages);
        assert.strictEqual(typeof result.confirmationMessages.title, 'string');
        assert.ok(result.confirmationMessages.message instanceof vscode.MarkdownString);
    });

    test('invoke handles no editors', async () => {
        const token = new vscode.CancellationTokenSource().token;
        const options: vscode.LanguageModelToolInvocationOptions<{}> = {
            input: {},
            toolInvocationToken: undefined
        };

        // Mock empty editors array
        const originalVisibleEditors = vscode.window.visibleTextEditors;
        Object.defineProperty(vscode.window, 'visibleTextEditors', {
            get: () => []
        });

        try {
            const result = await tool.invoke(options, token);
            assert.ok(result instanceof vscode.LanguageModelToolResult);
            const content = result.content[0];
            assert.ok(content instanceof vscode.LanguageModelTextPart);
            assert.strictEqual(content.value, 'No editors are currently open');
        } finally {
            // Restore original
            Object.defineProperty(vscode.window, 'visibleTextEditors', {
                get: () => originalVisibleEditors
            });
        }
    });

    test('invoke handles cancellation', async () => {
        const tokenSource = new vscode.CancellationTokenSource();
        const options: vscode.LanguageModelToolInvocationOptions<{}> = {
            input: {},
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
});