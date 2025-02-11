# System Architecture & Patterns

## Extension Structure

```
src/
  ├── tools/                     # Tool implementations
  │   ├── listOpenEditors.ts     # List open editors tool
  │   ├── getConfiguration.ts    # Get configuration tool
  │   └── revealFile.ts         # Reveal file tool
  ├── extension.ts              # Main extension file
  └── types.ts                  # Type definitions
```

## Design Patterns

1. **Tool Registration Pattern**

   - Each tool is a separate class implementing LanguageModelTool interface
   - Tools are registered with VS Code LM API during extension activation
   - Tools follow a consistent pattern for input validation and response formatting

2. **Error Handling Pattern**

   - Comprehensive error handling for tool invocations
   - Clear error messages for users
   - Graceful fallbacks when operations fail

3. **Configuration Pattern**
   - Tools access VS Code configuration through workspace API
   - Settings are validated before use
   - Default values provided where appropriate

## Implementation Guidelines

1. Each tool should:

   - Have clear input validation
   - Provide meaningful feedback
   - Handle errors gracefully
   - Be independently testable

2. Extension should:
   - Load tools dynamically
   - Register all tools during activation
   - Clean up resources during deactivation
