import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ToolInvocationBadge } from '../ToolInvocationBadge';

afterEach(() => {
  cleanup();
});

describe('ToolInvocationBadge', () => {
  describe('message formatting', () => {
    it('renders "Creating" message for create command', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('Creating App.jsx')).toBeDefined();
    });

    it('renders "Editing" message for str_replace command', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '2',
            toolName: 'str_replace_editor',
            args: { command: 'str_replace', path: '/components/Button.tsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('Editing Button.tsx')).toBeDefined();
    });

    it('renders "Adding to" message for insert command', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '3',
            toolName: 'str_replace_editor',
            args: { command: 'insert', path: '/utils/helpers.js' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('Adding to helpers.js')).toBeDefined();
    });

    it('renders "Viewing" message for view command', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '4',
            toolName: 'str_replace_editor',
            args: { command: 'view', path: '/README.md' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('Viewing README.md')).toBeDefined();
    });

    it('renders "Deleting" message for delete command', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '5',
            toolName: 'file_manager',
            args: { command: 'delete', path: '/old-file.js' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('Deleting old-file.js')).toBeDefined();
    });

    it('renders "Renaming" message for rename command (same directory)', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '6',
            toolName: 'file_manager',
            args: { command: 'rename', path: '/App.jsx', new_path: '/App.tsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('Renaming App.jsx')).toBeDefined();
    });

    it('renders "Moving" message for rename command (different directory)', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '7',
            toolName: 'file_manager',
            args: { command: 'rename', path: '/App.jsx', new_path: '/components/App.jsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('Moving App.jsx')).toBeDefined();
    });
  });

  describe('state-based rendering', () => {
    it('shows loading spinner when state is "call"', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeDefined();
      expect(spinner?.classList.contains('text-blue-600')).toBe(true);
    });

    it('shows loading spinner when state is "partial-call"', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'partial-call',
            result: undefined
          }}
        />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeDefined();
    });

    it('shows success dot when state is "result" with result', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'result',
            result: { success: true }
          }}
        />
      );

      const successDot = container.querySelector('.bg-emerald-500');
      expect(successDot).toBeDefined();
      expect(successDot?.classList.contains('rounded-full')).toBe(true);

      // Should not have spinner
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeNull();
    });

    it('shows loading spinner when state is "result" but no result', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'result',
            result: undefined
          }}
        />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeDefined();
    });
  });

  describe('path display', () => {
    it('displays filename only, not full path', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/components/ui/Button.tsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('Creating Button.tsx')).toBeDefined();
      expect(screen.queryByText('components/ui')).toBeNull();
    });

    it('shows full path in title attribute', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/components/ui/Button.tsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      const badge = container.querySelector('[role="status"]');
      expect(badge?.getAttribute('title')).toBe('/components/ui/Button.tsx');
    });

    it('shows full path in aria-label', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/components/ui/Button.tsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      const badge = container.querySelector('[role="status"]');
      expect(badge?.getAttribute('aria-label')).toBe('Creating /components/ui/Button.tsx');
    });

    it('handles Windows paths with backslashes', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: 'C:\\src\\components\\App.jsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('Creating App.jsx')).toBeDefined();
    });

    it('handles nested paths correctly', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/src/lib/utils/helpers/formatting.ts' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('Creating formatting.ts')).toBeDefined();
    });
  });

  describe('accessibility', () => {
    it('has role="status" for screen readers', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      const badge = container.querySelector('[role="status"]');
      expect(badge).toBeDefined();
    });

    it('includes full path in aria-label', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      const status = screen.getByRole('status');
      expect(status.getAttribute('aria-label')).toBe('Creating /App.jsx');
    });

    it('marks icons as aria-hidden', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      const icon = container.querySelector('[aria-hidden="true"]');
      expect(icon).toBeDefined();
    });

    it('success dot is marked aria-hidden', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'result',
            result: { success: true }
          }}
        />
      );

      const successDot = container.querySelector('.bg-emerald-500');
      expect(successDot?.getAttribute('aria-hidden')).toBe('true');
    });

    it('spinner is marked aria-hidden', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      const spinner = container.querySelector('.animate-spin');
      expect(spinner?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('styling', () => {
    it('applies default styling classes', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'call',
            result: undefined
          }}
        />
      );

      const badge = container.querySelector('[role="status"]');
      expect(badge?.classList.contains('bg-neutral-50')).toBe(true);
      expect(badge?.classList.contains('rounded-lg')).toBe(true);
      expect(badge?.classList.contains('border')).toBe(true);
      expect(badge?.classList.contains('border-neutral-200')).toBe(true);
      expect(badge?.classList.contains('font-mono')).toBe(true);
    });

    it('applies custom className prop', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create', path: '/App.jsx' },
            state: 'call',
            result: undefined
          }}
          className="custom-class"
        />
      );

      const badge = container.querySelector('[role="status"]');
      expect(badge?.classList.contains('custom-class')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles missing tool data gracefully', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: {},
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('str_replace_editor operation')).toBeDefined();
    });

    it('handles missing path argument', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'str_replace_editor',
            args: { command: 'create' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('Creating unknown file')).toBeDefined();
    });

    it('handles unknown tool name', () => {
      render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'unknown_tool',
            args: { command: 'do_something', path: '/file.txt' },
            state: 'call',
            result: undefined
          }}
        />
      );

      expect(screen.getByText('unknown_tool do_something')).toBeDefined();
    });

    it('handles empty args gracefully', () => {
      const { container } = render(
        <ToolInvocationBadge
          toolInvocation={{
            toolCallId: '1',
            toolName: 'file_manager',
            args: {},
            state: 'result',
            result: { success: true }
          }}
        />
      );

      const status = container.querySelector('[role="status"]');
      expect(status).toBeDefined();
    });
  });
});
