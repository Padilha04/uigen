/**
 * Utility for formatting tool invocation messages into user-friendly display text.
 * Converts technical tool names and commands into clear action messages.
 */

export interface ToolMessageResult {
  action: string;      // "Creating", "Editing", "Deleting", etc.
  target: string;      // Filename only (e.g., "App.jsx")
  fullPath: string;    // Complete path (e.g., "/App.jsx")
  verb: string;        // "create", "edit", "delete" (for future icon support)
}

/**
 * Formats a tool invocation into a user-friendly message.
 *
 * @param toolName - The name of the tool being invoked
 * @param args - The tool arguments containing command, path, etc.
 * @returns Structured message data for display
 *
 * @example
 * formatToolMessage('str_replace_editor', { command: 'create', path: '/App.jsx' })
 * // Returns: { action: 'Creating', target: 'App.jsx', fullPath: '/App.jsx', verb: 'create' }
 */
export function formatToolMessage(
  toolName: string,
  args: Record<string, any>
): ToolMessageResult {
  // Validate inputs
  if (!toolName || !args || typeof args !== 'object') {
    return {
      action: toolName || 'Tool',
      target: 'operation',
      fullPath: 'unknown',
      verb: 'unknown'
    };
  }

  const { command, path, new_path } = args;
  const fileName = (path && typeof path === 'string') ? extractFileName(path) : 'unknown file';
  const fullPath = (path && typeof path === 'string') ? path : (path === '' ? '' : 'unknown path');

  // Handle str_replace_editor
  if (toolName === 'str_replace_editor') {
    switch (command) {
      case 'create':
        return { action: 'Creating', target: fileName, fullPath, verb: 'create' };
      case 'str_replace':
        return { action: 'Editing', target: fileName, fullPath, verb: 'edit' };
      case 'insert':
        return { action: 'Adding to', target: fileName, fullPath, verb: 'edit' };
      case 'view':
        return { action: 'Viewing', target: fileName, fullPath, verb: 'view' };
      default:
        return { action: toolName, target: command || 'operation', fullPath, verb: 'unknown' };
    }
  }

  // Handle file_manager
  if (toolName === 'file_manager') {
    switch (command) {
      case 'delete':
        return { action: 'Deleting', target: fileName, fullPath, verb: 'delete' };
      case 'rename':
        const isMove = new_path && detectRenameType(path, new_path) === 'move';
        const action = isMove ? 'Moving' : 'Renaming';
        return { action, target: fileName, fullPath, verb: 'rename' };
      default:
        return { action: toolName, target: command || 'operation', fullPath, verb: 'unknown' };
    }
  }

  // Fallback for unknown tools
  return {
    action: toolName,
    target: command || 'operation',
    fullPath,
    verb: 'unknown'
  };
}

/**
 * Extracts the filename from a path string.
 * Handles both forward slashes and backslashes.
 *
 * @param path - File path to extract filename from
 * @returns The filename without directory path
 *
 * @example
 * extractFileName('/components/Button.tsx') // 'Button.tsx'
 * extractFileName('C:\\src\\App.jsx')       // 'App.jsx'
 */
function extractFileName(path: string): string {
  if (!path) return 'unknown file';

  // Normalize backslashes to forward slashes
  const normalized = path.replace(/\\/g, '/');

  // Split and filter empty parts
  const parts = normalized.split('/').filter(Boolean);

  // Return last part or the original if no separators
  return parts[parts.length - 1] || normalized;
}

/**
 * Detects whether a rename operation is actually a move to a different directory.
 *
 * @param oldPath - Original file path
 * @param newPath - New file path
 * @returns 'rename' if in same directory, 'move' if different directory
 *
 * @example
 * detectRenameType('/App.jsx', '/App.tsx')               // 'rename'
 * detectRenameType('/App.jsx', '/components/App.jsx')    // 'move'
 */
function detectRenameType(oldPath: string, newPath: string): 'rename' | 'move' {
  if (!oldPath || !newPath) return 'rename';

  // Extract directory paths
  const oldDir = oldPath.substring(0, oldPath.lastIndexOf('/'));
  const newDir = newPath.substring(0, newPath.lastIndexOf('/'));

  return oldDir === newDir ? 'rename' : 'move';
}
