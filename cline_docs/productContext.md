# VS Code Language Model Tools Extension

## Purpose

This extension aims to enhance VS Code's functionality by registering custom tools with the VS Code Language Model API. These tools will provide improved editor interaction capabilities and workspace awareness.

## Problems Solved

1. Limited contextual awareness of open editors and workspace state
2. Difficulty in accessing VS Code configuration programmatically
3. Manual file navigation inefficiencies

## Core Functionality

The extension will provide three main tools:

1. list_open_editors - Shows currently open editor tabs
2. get_configuration_setting - Retrieves VS Code configuration values
3. reveal_file_in_explorer - Helps navigate to specific files in the workspace

## Target Users

- VS Code users who want improved editor interaction
- Developers using AI assistants that need workspace context
- Users who want streamlined file navigation
