import * as vscode from 'vscode';

/**
 * Base interface for all tool responses
 */
export interface BaseToolResponse {
    success: boolean;
    message?: string;
    error?: Error;
}

/**
 * Base interface for all language model tools
 */
export interface BaseLanguageModelTool<T = unknown, R extends BaseToolResponse = BaseToolResponse> {
    /**
     * Unique name for the tool
     */
    readonly name: string;

    /**
     * Tags for categorizing the tool
     */
    readonly tags: string[];

    /**
     * Tool reference name used in VS Code commands
     */
    readonly toolReferenceName: string;

    /**
     * Display name shown in VS Code UI
     */
    readonly displayName: string;

    /**
     * Description of the tool for language models
     */
    readonly modelDescription: string;

    /**
     * Prepare tool invocation with user confirmation if needed
     */
    prepareInvocation(context: vscode.ExtensionContext): Promise<boolean>;

    /**
     * Execute the tool operation
     * @param params Tool specific parameters
     * @returns Tool specific response
     */
    invoke(params: T): Promise<R>;
}