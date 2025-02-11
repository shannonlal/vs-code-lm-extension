import * as assert from 'assert';
import * as vscode from 'vscode';
import { ListOpenEditorsTool } from '../tools/listOpenEditors';
import { EditorInfo } from '../types/listOpenEditors';
import { NoEditorsOpenError, UserCancellationError } from '../errors';

suite('ListOpenEditors Tool Test Suite', () => {
    let tool: ListOpenEditorsTool;

    setup(() => {
        tool = new ListOpenEditorsTool();
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

        const result = tool.formatEditorList(mockEditors, mockEditors[0]);
        
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
                () => tool.getEditorInfo(),
                NoEditorsOpenError
            );
        } finally {
            // Restore original
            Object.defineProperty(vscode.window, 'visibleTextEditors', {
                get: () => originalVisibleEditors
            });
        }
    });

    test('prepareInvocation handles user cancellation', async () => {
        // Mock window.showInformationMessage to simulate 'No' response
        const showMessage = vscode.window.showInformationMessage;
        vscode.window.showInformationMessage = async () => 'No';

        try {
            await assert.rejects(
                () => tool.prepareInvocation(),
                UserCancellationError
            );
        } finally {
            // Restore original
            vscode.window.showInformationMessage = showMessage;
        }
    });

    test('prepareInvocation proceeds with user confirmation', async () => {
        // Mock window.showInformationMessage to simulate 'Yes' response
        const showMessage = vscode.window.showInformationMessage;
        vscode.window.showInformationMessage = async () => 'Yes';

        try {
            const result = await tool.prepareInvocation();
            assert.strictEqual(result, true);
        } finally {
            // Restore original
            vscode.window.showInformationMessage = showMessage;
        }
    });
});