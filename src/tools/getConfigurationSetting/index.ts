import * as vscode from 'vscode';
import { 
    GetConfigurationSettingParams, 
    ConfigurationSettingInfo, 
    formatSettingInfo 
} from '../../types/getConfigurationSetting';
import { 
    InvalidSettingError, 
    ConfigurationAccessError 
} from '../../errors';

/**
 * Tool for retrieving VS Code configuration settings
 */
export class GetConfigurationSettingTool implements vscode.LanguageModelTool<GetConfigurationSettingParams> {
    readonly name = 'vscode-lm-tools_getConfigurationSetting';
    readonly tags = ['configuration'];
    readonly toolReferenceName = 'getConfigurationSetting';
    readonly displayName = 'Get Configuration Setting';
    readonly modelDescription = 'Retrieves the value of a specified VS Code configuration setting';

    /**
     * Prepare the tool invocation with user confirmation
     */
    async prepareInvocation(
        options: vscode.LanguageModelToolInvocationPrepareOptions<GetConfigurationSettingParams>,
        _token: vscode.CancellationToken
    ): Promise<vscode.PreparedToolInvocation> {
        return {
            invocationMessage: `Getting configuration setting: ${options.input.settingName}`,
            confirmationMessages: {
                title: 'Get Configuration Setting',
                message: new vscode.MarkdownString(`Get value of VS Code setting "${options.input.settingName}"?`)
            }
        };
    }

    /**
     * Execute the tool to get configuration setting
     */
    async invoke(
        options: vscode.LanguageModelToolInvocationOptions<GetConfigurationSettingParams>,
        token: vscode.CancellationToken
    ): Promise<vscode.LanguageModelToolResult> {
        try {
            if (token.isCancellationRequested) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart('Operation cancelled')
                ]);
            }

            const settingInfo = await this.getSettingInfo(options.input.settingName);
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(formatSettingInfo(settingInfo))
            ]);
        } catch (error) {
            if (error instanceof InvalidSettingError) {
                return new vscode.LanguageModelToolResult([
                    new vscode.LanguageModelTextPart(error.message)
                ]);
            }
            throw new ConfigurationAccessError(
                error instanceof Error ? error.message : 'Unknown error occurred'
            );
        }
    }

    /**
     * Get information about a configuration setting
     * Protected to allow access from test subclass
     */
    protected async getSettingInfo(settingName: string): Promise<ConfigurationSettingInfo> {
        if (!settingName || typeof settingName !== 'string') {
            throw new InvalidSettingError(String(settingName));
        }

        const config = vscode.workspace.getConfiguration();
        const value = config.get(settingName);

        if (value === undefined) {
            throw new InvalidSettingError(settingName);
        }

        return {
            name: settingName,
            value,
            scope: this.determineSettingScope(config, settingName)
        };
    }

    /**
     * Determine the scope of a configuration setting
     * Private helper method
     */
    private determineSettingScope(
        config: vscode.WorkspaceConfiguration,
        settingName: string
    ): 'user' | 'workspace' | 'workspaceFolder' | undefined {
        const inspection = config.inspect(settingName);
        if (!inspection) return undefined;

        // Check for explicitly set values first
        if (inspection.workspaceFolderValue !== undefined) return 'workspaceFolder';
        if (inspection.workspaceValue !== undefined) return 'workspace';
        if (inspection.globalValue !== undefined) return 'user';
        
        // If there's a default value but no explicit setting, consider it user scope
        // since that's where VS Code stores default values
        if (inspection.defaultValue !== undefined) return 'user';
        
        return undefined;
    }
}

/**
 * Create and register the GetConfigurationSetting tool
 */
export function registerGetConfigurationSettingTool(_context: vscode.ExtensionContext): vscode.Disposable {
    const tool = new GetConfigurationSettingTool();
    return vscode.lm.registerTool(tool.name, tool);
}