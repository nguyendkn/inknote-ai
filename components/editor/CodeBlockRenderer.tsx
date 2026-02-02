"use client";

import React from "react";
import { ExecutableCodeBlock } from "./ExecutableCodeBlock";

interface CodeProps {
  children?: React.ReactNode;
  className?: string;
  node?: unknown;
}

const EXECUTABLE_LANGUAGES = ["bash", "shell", "sh", "zsh"];

export function CodeBlockRenderer({
  children,
  className,
  ...props
}: CodeProps) {
  // Extract language from className (e.g., "language-bash")
  const match = /language-(\w+)/.exec(className || "");
  const language = match?.[1]?.toLowerCase();

  // Get the code content as string
  const code = String(children).replace(/\n$/, "");

  // Check if this is an executable language
  const isExecutable = language && EXECUTABLE_LANGUAGES.includes(language);

  // Only wrap block code (has language) in ExecutableCodeBlock
  // Inline code won't have a language class
  if (isExecutable && language) {
    return (
      <ExecutableCodeBlock code={code} language={language} className={className} />
    );
  }

  // Default code rendering for non-executable languages
  return (
    <code className={className} {...props}>
      {children}
    </code>
  );
}

interface PreProps {
  children?: React.ReactNode;
  className?: string;
}

export function PreBlockRenderer({ children, className, ...props }: PreProps) {
  // Check if the child is our ExecutableCodeBlock
  // If so, don't wrap in pre since ExecutableCodeBlock handles its own styling
  if (React.isValidElement(children)) {
    const childType = children.type;
    // Check if it's a code element with executable language
    if (
      typeof childType === "function" &&
      (childType as React.FC).name === "ExecutableCodeBlock"
    ) {
      return <>{children}</>;
    }

    // Check if it's CodeBlockRenderer that will render ExecutableCodeBlock
    const childProps = children.props as CodeProps;
    if (childProps?.className) {
      const match = /language-(\w+)/.exec(childProps.className || "");
      const language = match?.[1]?.toLowerCase();
      if (language && EXECUTABLE_LANGUAGES.includes(language)) {
        return <>{children}</>;
      }
    }
  }

  // Default pre rendering for non-executable code
  return (
    <pre className={className} {...props}>
      {children}
    </pre>
  );
}
