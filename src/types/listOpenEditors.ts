import * as vscode from 'vscode';

/**
 * Information about an open editor
 */
export interface EditorInfo {
    /**
     * Full file path of the editor
     */
    filePath: string;

    /**
     * File name without path
     */
    fileName: string;

    /**
     * Language ID of the document (e.g., 'typescript', 'javascript')
     */
    languageId: string;

    /**
     * Whether the document has unsaved changes
     */
    isDirty: boolean;

    /**
     * The view column the editor is in (1, 2, 3, etc.)
     */
    viewColumn: number | undefined;

    /**
     * Whether this is the active editor
     */
    isActive: boolean;
}

/**
 * Parameters for the ListOpenEditors tool
 * Currently empty as the tool doesn't require any parameters
 */
export interface ListOpenEditorsParams {
    // Future parameters can be added here if needed
}

/**
 * Convert a VS Code TextEditor to EditorInfo
 */
export function toEditorInfo(editor: vscode.TextEditor, isActive: boolean): EditorInfo {
    return {
        filePath: editor.document.uri.fsPath,
        fileName: editor.document.uri.fsPath.split('/').pop() || '',
        languageId: editor.document.languageId,
        isDirty: editor.document.isDirty,
        viewColumn: editor.viewColumn,
        isActive
    };
}

/**
 * Format editor information as a string
 */
export function formatEditorInfo(editor: EditorInfo): string {
    return `${editor.fileName} (${editor.languageId})${editor.isDirty ? ' [unsaved]' : ''}${editor.isActive ? ' [active]' : ''}`;
}