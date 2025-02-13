/**
 * Base class for all extension errors
 */
export class VSCodeLMExtensionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'VSCodeLMExtensionError';
    }
}

/**
 * Error thrown when no editors are open
 */
export class NoEditorsOpenError extends VSCodeLMExtensionError {
    constructor() {
        super('No editors are currently open in VS Code');
        this.name = 'NoEditorsOpenError';
    }
}

/**
 * Error thrown when there's a problem accessing editor information
 */
export class EditorAccessError extends VSCodeLMExtensionError {
    constructor(details: string) {
        super(`Failed to access editor information: ${details}`);
        this.name = 'EditorAccessError';
    }
}

/**
 * Error thrown when tool registration fails
 */
export class ToolRegistrationError extends VSCodeLMExtensionError {
    constructor(toolName: string, details: string) {
        super(`Failed to register tool ${toolName}: ${details}`);
        this.name = 'ToolRegistrationError';
    }
}

/**
 * Error thrown when tool invocation fails
 */
export class ToolInvocationError extends VSCodeLMExtensionError {
    constructor(toolName: string, details: string) {
        super(`Failed to invoke tool ${toolName}: ${details}`);
        this.name = 'ToolInvocationError';
    }
}

/**
 * Error thrown when user cancels tool operation
 */
export class UserCancellationError extends VSCodeLMExtensionError {
    constructor(toolName: string) {
        super(`Operation cancelled by user for tool ${toolName}`);
        this.name = 'UserCancellationError';
    }
}

/**
 * Error thrown when an invalid setting name is provided
 */
export class InvalidSettingError extends VSCodeLMExtensionError {
    constructor(settingName: string) {
        super(`Invalid setting name: ${settingName}`);
        this.name = 'InvalidSettingError';
    }
}

/**
 * Error thrown when there's a problem accessing configuration settings
 */
export class ConfigurationAccessError extends VSCodeLMExtensionError {
    constructor(details: string) {
        super(`Failed to access configuration: ${details}`);
        this.name = 'ConfigurationAccessError';
    }
}

/**
 * Error thrown when a file cannot be found or accessed
 */
export class FileNotFoundError extends VSCodeLMExtensionError {
    constructor(filePath: string) {
        super(`File not found or cannot be accessed: ${filePath}`);
        this.name = 'FileNotFoundError';
    }
}

/**
 * Convert any error to a user-friendly message
 */
export function toUserFriendlyError(error: unknown): string {
    if (error instanceof VSCodeLMExtensionError) {
        return error.message;
    }
    
    if (error instanceof Error) {
        return `An unexpected error occurred: ${error.message}`;
    }
    
    return 'An unknown error occurred';
}