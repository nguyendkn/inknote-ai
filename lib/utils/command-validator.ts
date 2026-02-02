/**
 * Command Validator - Detects potentially dangerous bash commands
 */

interface DangerousPattern {
  pattern: RegExp;
  reason: string;
  severity: "warning" | "danger";
}

const DANGEROUS_PATTERNS: DangerousPattern[] = [
  // File system destruction
  {
    pattern: /rm\s+(-[rf]+\s+|--recursive\s+|--force\s+)*[\/~]/i,
    reason: "Recursive delete from root or home directory",
    severity: "danger",
  },
  {
    pattern: /rm\s+-[rf]*\s+\.\.\//i,
    reason: "Recursive delete of parent directory",
    severity: "danger",
  },

  // Disk operations
  {
    pattern: /mkfs/i,
    reason: "Format filesystem",
    severity: "danger",
  },
  {
    pattern: /dd\s+if=/i,
    reason: "Low-level disk write operation",
    severity: "danger",
  },
  {
    pattern: />\s*\/dev\/(sda|nvme|hd|vd)/i,
    reason: "Direct disk write",
    severity: "danger",
  },

  // System control
  {
    pattern: /shutdown|reboot|poweroff|halt/i,
    reason: "System power control",
    severity: "warning",
  },
  {
    pattern: /systemctl\s+(stop|disable|mask)/i,
    reason: "Stopping system services",
    severity: "warning",
  },

  // Remote script execution
  {
    pattern: /curl\s+.*\|\s*(ba)?sh/i,
    reason: "Remote script execution via curl",
    severity: "danger",
  },
  {
    pattern: /wget\s+.*\|\s*(ba)?sh/i,
    reason: "Remote script execution via wget",
    severity: "danger",
  },
  {
    pattern: /curl\s+.*>\s*.*\.sh\s*&&\s*(ba)?sh/i,
    reason: "Download and execute script",
    severity: "danger",
  },

  // Dangerous permissions
  {
    pattern: /chmod\s+(-R\s+)?777/i,
    reason: "Setting insecure permissions (777)",
    severity: "warning",
  },
  {
    pattern: /chmod\s+(-R\s+)?\+s/i,
    reason: "Setting SUID bit",
    severity: "warning",
  },

  // Fork bomb patterns
  {
    pattern: /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;?\s*:/i,
    reason: "Fork bomb detected",
    severity: "danger",
  },

  // Dangerous redirects
  {
    pattern: />\s*\/dev\/null\s*2>&1\s*&/i,
    reason: "Silent background execution",
    severity: "warning",
  },

  // Environment manipulation
  {
    pattern: /export\s+PATH\s*=\s*[^$]/i,
    reason: "Overwriting PATH environment variable",
    severity: "warning",
  },

  // History manipulation
  {
    pattern: /history\s+-c|rm\s+.*\.bash_history/i,
    reason: "Clearing command history",
    severity: "warning",
  },
];

export interface ValidationResult {
  isDangerous: boolean;
  reason?: string;
  severity?: "warning" | "danger";
}

/**
 * Validate a command for potential dangers
 */
export function validateCommand(command: string): ValidationResult {
  // Normalize command (remove extra whitespace)
  const normalizedCommand = command.trim().replace(/\s+/g, " ");

  for (const { pattern, reason, severity } of DANGEROUS_PATTERNS) {
    if (pattern.test(normalizedCommand)) {
      return {
        isDangerous: true,
        reason,
        severity,
      };
    }
  }

  return { isDangerous: false };
}

/**
 * Format error messages to be user-friendly
 */
export function formatErrorMessage(
  error: string,
  exitCode: number | null
): string {
  const errorLower = error.toLowerCase();

  if (errorLower.includes("command not found") || errorLower.includes("not recognized")) {
    return "Command not found. Make sure it's installed and in your PATH.";
  }

  if (errorLower.includes("permission denied")) {
    return "Permission denied. You may need elevated permissions to run this command.";
  }

  if (errorLower.includes("no such file or directory")) {
    return "File or directory not found. Check the path and try again.";
  }

  if (errorLower.includes("connection refused") || errorLower.includes("could not resolve")) {
    return "Network error. Check your internet connection and try again.";
  }

  if (errorLower.includes("timeout") || errorLower.includes("timed out")) {
    return "Command timed out. The operation took too long to complete.";
  }

  if (exitCode !== null && exitCode !== 0) {
    return `Command exited with code ${exitCode}. ${error || "Check the output for details."}`;
  }

  return error || "An unknown error occurred.";
}
