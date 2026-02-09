import { describe, it, expect } from 'vitest';
import { formatToolMessage, type ToolMessageResult } from '../tool-message-formatter';

describe('formatToolMessage', () => {
  describe('str_replace_editor tool', () => {
    it('formats create command correctly', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create',
        path: '/App.jsx'
      });

      expect(result).toEqual({
        action: 'Creating',
        target: 'App.jsx',
        fullPath: '/App.jsx',
        verb: 'create'
      });
    });

    it('formats str_replace command correctly', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'str_replace',
        path: '/components/Button.tsx'
      });

      expect(result).toEqual({
        action: 'Editing',
        target: 'Button.tsx',
        fullPath: '/components/Button.tsx',
        verb: 'edit'
      });
    });

    it('formats insert command correctly', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'insert',
        path: '/utils/helpers.js'
      });

      expect(result).toEqual({
        action: 'Adding to',
        target: 'helpers.js',
        fullPath: '/utils/helpers.js',
        verb: 'edit'
      });
    });

    it('formats view command correctly', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'view',
        path: '/README.md'
      });

      expect(result).toEqual({
        action: 'Viewing',
        target: 'README.md',
        fullPath: '/README.md',
        verb: 'view'
      });
    });

    it('handles unknown str_replace_editor command', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'unknown_command',
        path: '/file.txt'
      });

      expect(result).toEqual({
        action: 'str_replace_editor',
        target: 'unknown_command',
        fullPath: '/file.txt',
        verb: 'unknown'
      });
    });
  });

  describe('file_manager tool', () => {
    it('formats delete command correctly', () => {
      const result = formatToolMessage('file_manager', {
        command: 'delete',
        path: '/old-file.js'
      });

      expect(result).toEqual({
        action: 'Deleting',
        target: 'old-file.js',
        fullPath: '/old-file.js',
        verb: 'delete'
      });
    });

    it('formats rename command (same directory) correctly', () => {
      const result = formatToolMessage('file_manager', {
        command: 'rename',
        path: '/App.jsx',
        new_path: '/App.tsx'
      });

      expect(result).toEqual({
        action: 'Renaming',
        target: 'App.jsx',
        fullPath: '/App.jsx',
        verb: 'rename'
      });
    });

    it('formats rename command (different directory) as move', () => {
      const result = formatToolMessage('file_manager', {
        command: 'rename',
        path: '/App.jsx',
        new_path: '/components/App.jsx'
      });

      expect(result).toEqual({
        action: 'Moving',
        target: 'App.jsx',
        fullPath: '/App.jsx',
        verb: 'rename'
      });
    });

    it('handles rename without new_path', () => {
      const result = formatToolMessage('file_manager', {
        command: 'rename',
        path: '/file.txt'
      });

      expect(result).toEqual({
        action: 'Renaming',
        target: 'file.txt',
        fullPath: '/file.txt',
        verb: 'rename'
      });
    });

    it('handles unknown file_manager command', () => {
      const result = formatToolMessage('file_manager', {
        command: 'unknown',
        path: '/file.txt'
      });

      expect(result).toEqual({
        action: 'file_manager',
        target: 'unknown',
        fullPath: '/file.txt',
        verb: 'unknown'
      });
    });
  });

  describe('filename extraction', () => {
    it('extracts filename from root path', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create',
        path: '/App.jsx'
      });

      expect(result.target).toBe('App.jsx');
    });

    it('extracts filename from nested path', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create',
        path: '/components/ui/Button.tsx'
      });

      expect(result.target).toBe('Button.tsx');
    });

    it('extracts filename from deeply nested path', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create',
        path: '/src/lib/utils/helpers/formatting.ts'
      });

      expect(result.target).toBe('formatting.ts');
    });

    it('handles Windows-style paths with backslashes', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create',
        path: 'C:\\Users\\amand\\src\\App.jsx'
      });

      expect(result.target).toBe('App.jsx');
    });

    it('handles mixed slashes in path', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create',
        path: '/components\\Button/index.tsx'
      });

      expect(result.target).toBe('index.tsx');
    });

    it('handles path without leading slash', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create',
        path: 'components/Button.tsx'
      });

      expect(result.target).toBe('Button.tsx');
    });

    it('handles single filename without directory', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create',
        path: 'App.jsx'
      });

      expect(result.target).toBe('App.jsx');
    });
  });

  describe('edge cases and error handling', () => {
    it('handles missing path argument', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create'
      });

      expect(result).toEqual({
        action: 'Creating',
        target: 'unknown file',
        fullPath: 'unknown path',
        verb: 'create'
      });
    });

    it('handles missing command argument', () => {
      const result = formatToolMessage('str_replace_editor', {
        path: '/App.jsx'
      });

      expect(result).toEqual({
        action: 'str_replace_editor',
        target: 'operation',
        fullPath: '/App.jsx',
        verb: 'unknown'
      });
    });

    it('handles empty path string', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create',
        path: ''
      });

      expect(result).toEqual({
        action: 'Creating',
        target: 'unknown file',
        fullPath: '',
        verb: 'create'
      });
    });

    it('handles null args object', () => {
      const result = formatToolMessage('str_replace_editor', null as any);

      expect(result).toEqual({
        action: 'str_replace_editor',
        target: 'operation',
        fullPath: 'unknown',
        verb: 'unknown'
      });
    });

    it('handles undefined args object', () => {
      const result = formatToolMessage('str_replace_editor', undefined as any);

      expect(result).toEqual({
        action: 'str_replace_editor',
        target: 'operation',
        fullPath: 'unknown',
        verb: 'unknown'
      });
    });

    it('handles empty args object', () => {
      const result = formatToolMessage('str_replace_editor', {});

      expect(result).toEqual({
        action: 'str_replace_editor',
        target: 'operation',
        fullPath: 'unknown path',
        verb: 'unknown'
      });
    });

    it('handles missing toolName', () => {
      const result = formatToolMessage('', {
        command: 'create',
        path: '/App.jsx'
      });

      expect(result).toEqual({
        action: 'Tool',
        target: 'operation',
        fullPath: 'unknown',
        verb: 'unknown'
      });
    });

    it('handles unknown tool name', () => {
      const result = formatToolMessage('unknown_tool', {
        command: 'do_something',
        path: '/file.txt'
      });

      expect(result).toEqual({
        action: 'unknown_tool',
        target: 'do_something',
        fullPath: '/file.txt',
        verb: 'unknown'
      });
    });

    it('handles path with only slashes', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create',
        path: '///'
      });

      expect(result.target).toBe('///');
    });

    it('handles non-string args values gracefully', () => {
      const result = formatToolMessage('str_replace_editor', {
        command: 'create',
        path: 123 as any
      });

      expect(result.target).toBe('unknown file');
    });
  });

  describe('rename vs move detection', () => {
    it('detects rename in root directory', () => {
      const result = formatToolMessage('file_manager', {
        command: 'rename',
        path: '/old.js',
        new_path: '/new.js'
      });

      expect(result.action).toBe('Renaming');
    });

    it('detects rename in nested directory', () => {
      const result = formatToolMessage('file_manager', {
        command: 'rename',
        path: '/components/OldButton.tsx',
        new_path: '/components/NewButton.tsx'
      });

      expect(result.action).toBe('Renaming');
    });

    it('detects move from root to subdirectory', () => {
      const result = formatToolMessage('file_manager', {
        command: 'rename',
        path: '/App.jsx',
        new_path: '/src/App.jsx'
      });

      expect(result.action).toBe('Moving');
    });

    it('detects move between subdirectories', () => {
      const result = formatToolMessage('file_manager', {
        command: 'rename',
        path: '/components/Button.tsx',
        new_path: '/ui/Button.tsx'
      });

      expect(result.action).toBe('Moving');
    });

    it('detects move to parent directory', () => {
      const result = formatToolMessage('file_manager', {
        command: 'rename',
        path: '/components/ui/Button.tsx',
        new_path: '/components/Button.tsx'
      });

      expect(result.action).toBe('Moving');
    });
  });
});
