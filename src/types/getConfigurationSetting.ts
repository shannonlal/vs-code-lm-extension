import * as vscode from 'vscode';

/**
 * Parameters for the get_configuration_setting tool
 */
export interface GetConfigurationSettingParams {
    settingName: string;
}

/**
 * Information about a VS Code configuration setting
 */
export interface ConfigurationSettingInfo {
    name: string;
    value: unknown;
    scope?: 'user' | 'workspace' | 'workspaceFolder';
}

/**
 * Format configuration setting information into a readable string
 */
export function formatSettingInfo(info: ConfigurationSettingInfo): string {
    return `${info.name}: ${JSON.stringify(info.value)}${info.scope ? ` (${info.scope})` : ''}`;
}