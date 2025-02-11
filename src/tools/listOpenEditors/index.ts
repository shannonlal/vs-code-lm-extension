import * as vscode from 'vscode';
import { 
    ListOpenEditorsParams, 
    EditorInfo,
    toEditorInfo,
    formatEditorInfo
} from '../../types/listOpenEditors';
import { 
    EditorAccessError, 
    NoEditorsOpenError, 
    UserCancellationError 
} from '../../errors';

/**
 * Tool for listing all open editors in VS Code
 */
export class ListOpenEditorsTool {
    readonly name = 'vscode-lm-tools_listOpenEditors';
    readonly tags = ['editors'];
    readonly toolReferenceName = 'listOpenEditors';
    readonly displayName = 'List Open Editors';
    readonly modelDescription = 'Lists all open editors in VS Code with their details';

    /**
     * Ask for user confirmation before listing editors
     */
    async prepareInvocation(): Promise<boolean> {
        const result = await vscode.window.showInformationMessage(
            'The language model would like to list all open editors. Continue?',
            'Yes',
            'No'
        );

        if (result !== 'Yes') {
            throw new UserCancellationError(this.name);
        }

        return true;
    }

    /**
     * Format the editor information into a readable string
     */
    formatEditorList(editors: EditorInfo[], activeEditor?: EditorInfo): string {
        const lines: string[] = [];
        
        lines.push(`Found ${editors.length} open editor${editors.length === 1 ? '' : 's'}:`);
        lines.push('');
        
        editors.forEach(editor => {
            lines.push(`- ${formatEditorInfo(editor)}`);
        });

        if (activeEditor) {
            lines.push('');
            lines.push('Active editor:');
            lines.push(`- ${formatEditorInfo(activeEditor)}`);
        }

        return lines.join('\n');
    }

    /**
     * Get information about all open editors
     */
    async getEditorInfo(): Promise<{ editors: EditorInfo[], activeEditor?: EditorInfo }> {
        const editors = vscode.window.visibleTextEditors;
            
        if (!editors || editors.length === 0) {
            throw new NoEditorsOpenError();
        }

        const activeEditor = vscode.window.activeTextEditor;
        const editorInfos = editors.map(editor => 
            toEditorInfo(editor, editor === activeEditor)
        );

        return {
            editors: editorInfos,
            activeEditor: activeEditor ? toEditorInfo(activeEditor, true) : undefined
        };
    }
}

/**
 * Create and register the ListOpenEditors tool
 */
export function registerListOpenEditorsTool(_context: vscode.ExtensionContext): vscode.Disposable {
    const tool = new ListOpenEditorsTool();
    
    return vscode.lm.registerTool(tool.name, {
        async invoke(_options: vscode.LanguageModelToolInvocationOptions<ListOpenEditorsParams>): Promise<vscode.LanguageModelToolResult> {
            try {
                await tool.prepareInvocation();
                const { editors, activeEditor } = await tool.getEditorInfo();
                
                return {
                    content: [{
                        type: 'text',
                        text: tool.formatEditorList(editors, activeEditor)
                    }]
                };
            } catch (error) {
                if (error instanceof NoEditorsOpenError || 
                    error instanceof UserCancellationError) {
                    return {
                        content: [{
                            type: 'text',
                            text: error.message
                        }]
                    };
                }

                throw new EditorAccessError(
                    error instanceof Error ? error.message : 'Unknown error occurred'
                );
            }
        }
    });
}