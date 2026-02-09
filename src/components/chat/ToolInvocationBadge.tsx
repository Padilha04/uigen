import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatToolMessage } from "@/lib/utils/tool-message-formatter";

interface ToolInvocationBadgeProps {
  toolInvocation: {
    toolCallId: string;
    toolName: string;
    args: Record<string, any>;
    state: "partial-call" | "call" | "result";
    result?: any;
  };
  className?: string;
}

/**
 * Displays a user-friendly badge for AI tool invocations.
 * Converts technical tool names into readable actions like "Creating App.jsx".
 *
 * @example
 * <ToolInvocationBadge
 *   toolInvocation={{
 *     toolCallId: "123",
 *     toolName: "str_replace_editor",
 *     args: { command: "create", path: "/App.jsx" },
 *     state: "result",
 *     result: {}
 *   }}
 * />
 */
export function ToolInvocationBadge({
  toolInvocation,
  className
}: ToolInvocationBadgeProps) {
  const message = formatToolMessage(
    toolInvocation.toolName,
    toolInvocation.args
  );

  const isComplete = toolInvocation.state === "result" && toolInvocation.result;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 mt-2 px-3 py-1.5",
        "bg-neutral-50 rounded-lg text-xs font-mono",
        "border border-neutral-200",
        className
      )}
      role="status"
      aria-label={`${message.action} ${message.fullPath}`}
      title={message.fullPath}
    >
      {isComplete ? (
        <div
          className="w-2 h-2 rounded-full bg-emerald-500"
          aria-hidden="true"
        />
      ) : (
        <Loader2
          className="w-3 h-3 animate-spin text-blue-600"
          aria-hidden="true"
        />
      )}
      <span className="text-neutral-700">
        {message.action} {message.target}
      </span>
    </div>
  );
}
