import * as vscode from 'vscode';
import { BaseToolResponse } from './base';

/**
 * Parameters for the reveal file in explorer tool
 */
export interface RevealFileInExplorerParams {
    /**
     * Path to the file to reveal in explorer
     */
    filePath: string;
}

/**
 * Response from the reveal file in explorer tool
 */
export interface RevealFileInExplorerResponse extends BaseToolResponse {
    /**
     * Path of the revealed file
     */
    filePath: string;
}