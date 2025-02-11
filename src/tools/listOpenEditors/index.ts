import * as vscode from 'vscode';
import { 
    ListOpenEditorsParams, 
    EditorInfo,
    toEditorInfo,
    formatEditorInfo
} from '../../types/listOpenEditors';
import { 
    EditorAccessError, 
    NoEditorsOpenError
} from '../../errors';

/**
 * Tool for listing all open editors in VS Code
 */
export class ListOpenEditorsTool implements vscode.LanguageModelTool<ListOpenEditorsParams> {
    readonly name = 'vscode-lm-tools_listOpenEditors';
    readonly tags = ['editors'];
    readonly toolReferenceName = 'listOpenEditors';
    readonly displayName = 'List Open Editors';
    readonly modelDescription = 'Lists all open editors in VS Code with their details';

    /**
     * Prepare the tool invocation with user confirmation
     */
    async prepareInvocation(
        _options: vscode.LanguageModelToolInvocationPrepareOptions<ListOpenEditorsParams>,
        _token: vscode.CancellationToken
    ): Promise<vscode.PreparedToolInvocation> {
        return {
            invocationMessage: 'Listing open editors',
            confirmationMessages: {
                title: 'List Open Editors',
                message: new vscode.MarkdownString('List all open editors in VS Code?')
            }
        };
    }

    /**
     * Execute the tool to list open editors
     */
    async invoke(
        _options: vscode.LanguageModelToolInvocationOptions<ListOpenEditorsParams>,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolResult> {
        try {
            // Check for cancellation
            if (token.isCancellationRequested) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart('Operation cancelled')
                ]);
            }

            const { editors, activeEditor } = await this.getEditorInfo();
            const formattedText = this.formatEditorList(editors, activeEditor);
            
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(formattedText)
            ]);
        } catch (error) {
            if (error instanceof NoEditorsOpenError) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart('No editors are currently open')
                ]);
            }
            throw new EditorAccessError(
                error instanceof Error ? error.message : 'Unknown error occurred'
            );
        }
    }

    /**
     * Format the editor information into a readable string
     * Protected to allow access from test subclass
     */
    protected formatEditorList(editors: EditorInfo[], activeEditor?: EditorInfo): string {
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
     * Protected to allow access from test subclass
     */
    protected async getEditorInfo(): Promise<{ editors: EditorInfo[], activeEditor?: EditorInfo }> {
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
    return vscode.lm.registerTool(tool.name, tool);
}