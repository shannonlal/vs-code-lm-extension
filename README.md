# VS Code Language Model Tools

A Visual Studio Code extension that provides tools for language model integration, enabling AI assistants to interact with VS Code more effectively.

## Features

### List Open Editors Tool

The List Open Editors tool provides language models with information about currently open editors in VS Code. This includes:

- File paths and names
- Language types
- Editor status (dirty/clean)
- Active editor information
- Editor layout (view columns)

#### Usage in Language Models

```typescript
// Example tool invocation
await vscode.lm.invokeTool("vscode-lm-tools_listOpenEditors", {});
```

The tool will:

1. Request user confirmation
2. Collect information about all open editors
3. Return formatted results including:
   - List of all open editors
   - Details about each editor
   - Currently active editor

#### Manual Usage

The extension also provides a command palette entry:

1. Open the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Search for "List Open Editors"
3. Select an editor from the list to focus it

## Installation

1. Download the VSIX file from the releases page
2. Install in VS Code:
   - Open the command palette
   - Select "Install from VSIX..."
   - Choose the downloaded file

Or install directly from the VS Code Marketplace:

1. Open VS Code
2. Go to the Extensions view (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for "VS Code Language Model Tools"
4. Click Install

## Development

### Prerequisites

- Node.js 18 or higher
- VS Code

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/shannonlal/vs-code-lm-extension.git
   cd vs-code-lm-extension
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Open in VS Code:
   ```bash
   code .
   ```

### Development Commands

- `npm run compile` - Compile the extension
- `npm run watch` - Watch for changes and recompile
- `npm run test` - Run tests
- `npm run lint` - Lint the code
- `npm run package` - Create VSIX package

### Testing

The extension includes comprehensive tests:

- Unit tests for core functionality
- Integration tests with VS Code API
- Manual testing scenarios

Run tests with:

```bash
npm test
```

### Architecture

The extension follows a modular architecture:

```
src/
  ├── types/         # TypeScript interfaces and types
  ├── errors/        # Custom error definitions
  ├── tools/         # Tool implementations
  └── test/          # Test files
```

Each tool is implemented as a separate module with:

- Clear interface definitions
- Comprehensive error handling
- User confirmation flows
- Detailed documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details
