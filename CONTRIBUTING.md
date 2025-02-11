# Contributing to VS Code Language Model Tools Extension

Thank you for your interest in contributing to the VS Code Language Model Tools Extension! This document provides guidelines and steps for contributing.

## Development Setup

1. Prerequisites:

   - Node.js (LTS version recommended)
   - Visual Studio Code
   - Git

2. Setup Steps:

   ```bash
   # Clone the repository
   git clone https://github.com/shannonlal/vs-code-lm-extension.git
   cd vs-code-lm-extension

   # Install dependencies
   npm install
   ```

3. Build and Test:

   ```bash
   # Build the extension
   npm run compile

   # Run tests
   npm test
   ```

## Development Workflow

1. Create a new branch for your feature/fix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure:

   - Code follows existing style
   - All tests pass
   - New features include tests
   - Documentation is updated

3. Commit your changes:

   ```bash
   git commit -m "Description of your changes"
   ```

4. Push to your fork and submit a pull request

## Pull Request Guidelines

1. Include a clear description of the changes
2. Link any related issues
3. Update documentation as needed
4. Ensure all tests pass
5. Follow existing code style

## Adding New Language Model Tools

When adding new tools:

1. Create a new directory under `src/tools` for your tool
2. Implement the `LanguageModelTool` interface
3. Register the tool in `package.json` under `contributes.languageModelTools`
4. Add tests for your tool
5. Update documentation

## Code Style

- Use TypeScript
- Follow existing code formatting
- Add JSDoc comments for public APIs
- Use meaningful variable and function names
- Keep functions focused and small

## Testing

- Write unit tests for new functionality
- Test error cases
- Test tool invocation and cancellation
- Run existing tests before submitting PR

## Documentation

- Update README.md for new features
- Add JSDoc comments to public APIs
- Include examples where appropriate
- Document any breaking changes

## Questions or Problems?

Feel free to open an issue for:

- Bug reports
- Feature requests
- Documentation improvements
- General questions

Thank you for contributing!
