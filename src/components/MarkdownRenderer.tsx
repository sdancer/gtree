
"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown (tables, etc.)

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  return (
    <ReactMarkdown
      className={`prose prose-sm dark:prose-invert max-w-none font-mono ${className}`}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
