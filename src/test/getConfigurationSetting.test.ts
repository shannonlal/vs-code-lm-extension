import * as assert from 'assert';
import * as vscode from 'vscode';
import { GetConfigurationSettingTool } from '../tools/getConfigurationSetting';
import { GetConfigurationSettingParams, ConfigurationSettingInfo } from '../types/getConfigurationSetting';
import { InvalidSettingError, ConfigurationAccessError } from '../errors';

// Create a test-specific subclass to access protected methods
class TestGetConfigurationSettingTool extends GetConfigurationSettingTool {
    public async getSettingInfoTest(settingName: string): Promise<ConfigurationSettingInfo> {
        return this.getSettingInfo(settingName);
    }
}

suite('GetConfigurationSetting Tool Test Suite', () => {
    let tool: TestGetConfigurationSettingTool;

    setup(() => {
        tool = new TestGetConfigurationSettingTool();
    });

    test('Tool has correct metadata', () => {
        assert.strictEqual(tool.name, 'vscode-lm-tools_getConfigurationSetting');
        assert.deepStrictEqual(tool.tags, ['configuration']);
        assert.strictEqual(tool.toolReferenceName, 'getConfigurationSetting');
        assert.strictEqual(tool.displayName, 'Get Configuration Setting');
        assert.ok(tool.modelDescription.length > 0);
    });

    test('Should retrieve valid setting', async () => {
        const options: vscode.LanguageModelToolInvocationOptions<GetConfigurationSettingParams> = {
            input: { settingName: 'editor.fontSize' },
            toolInvocationToken: undefined
        };
        const token = new vscode.CancellationTokenSource().token;

        const result = await tool.invoke(options, token);
        
        assert.ok(result instanceof vscode.LanguageModelToolResult);
        const content = result.content[0];
        assert.ok(content instanceof vscode.LanguageModelTextPart);
        assert.ok(content.value.includes('editor.fontSize'));
    });

    test('Should handle invalid setting name', async () => {
        const options: vscode.LanguageModelToolInvocationOptions<GetConfigurationSettingParams> = {
            input: { settingName: 'invalid.setting.name' },
            toolInvocationToken: undefined
        };
        const token = new vscode.CancellationTokenSource().token;

        const result = await tool.invoke(options, token);
        
        assert.ok(result instanceof vscode.LanguageModelToolResult);
        const content = result.content[0];
        assert.ok(content instanceof vscode.LanguageModelTextPart);
        assert.ok(content.value.includes('Invalid setting name'));
    });

    test('Should handle empty setting name', async () => {
        const options: vscode.LanguageModelToolInvocationOptions<GetConfigurationSettingParams> = {
            input: { settingName: '' },
            toolInvocationToken: undefined
        };
        const token = new vscode.CancellationTokenSource().token;

        const result = await tool.invoke(options, token);
        
        assert.ok(result instanceof vscode.LanguageModelToolResult);
        const content = result.content[0];
        assert.ok(content instanceof vscode.LanguageModelTextPart);
        assert.ok(content.value.includes('Invalid setting name'));
    });

    test('Should handle cancellation', async () => {
        const options: vscode.LanguageModelToolInvocationOptions<GetConfigurationSettingParams> = {
            input: { settingName: 'editor.fontSize' },
            toolInvocationToken: undefined
        };
        const tokenSource = new vscode.CancellationTokenSource();
        tokenSource.cancel();

        const result = await tool.invoke(options, tokenSource.token);
        
        assert.ok(result instanceof vscode.LanguageModelToolResult);
        const content = result.content[0];
        assert.ok(content instanceof vscode.LanguageModelTextPart);
        assert.strictEqual(content.value, 'Operation cancelled');
    });

    test('Should determine setting scope correctly', async () => {
        // Use editor.fontSize which is commonly set in user settings
        const options: vscode.LanguageModelToolInvocationOptions<GetConfigurationSettingParams> = {
            input: { settingName: 'editor.fontSize' },
            toolInvocationToken: undefined
        };
        const token = new vscode.CancellationTokenSource().token;

        const result = await tool.invoke(options, token);
        
        assert.ok(result instanceof vscode.LanguageModelToolResult);
        const content = result.content[0];
        assert.ok(content instanceof vscode.LanguageModelTextPart);
        
        // First verify the setting exists and has a value
        assert.ok(content.value.includes('editor.fontSize'), 'Setting should exist');
        assert.ok(content.value.includes(':'), 'Setting should have a value');
        
        // Then check for scope, with better error message
        assert.ok(
            content.value.includes('user') ||
            content.value.includes('workspace') ||
            content.value.includes('workspaceFolder'),
            `Setting scope not found in response: ${content.value}`
        );
    });

    test('prepareInvocation returns correct result', async () => {
        const options: vscode.LanguageModelToolInvocationPrepareOptions<GetConfigurationSettingParams> = {
            input: { settingName: 'editor.fontSize' }
        };
        const token = new vscode.CancellationTokenSource().token;

        const result = await tool.prepareInvocation(options, token);
        
        assert.ok(result.invocationMessage);
        assert.ok(result.confirmationMessages);
        assert.strictEqual(typeof result.confirmationMessages.title, 'string');
        assert.ok(result.confirmationMessages.message instanceof vscode.MarkdownString);
    });
});