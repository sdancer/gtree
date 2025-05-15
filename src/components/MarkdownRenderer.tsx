
"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown (tables, etc.)
// Changed from 'Prism as SyntaxHighlighter' to 'PrismLight as SyntaxHighlighter'
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// Assuming atomDark is a named export from the styles/prism/index.js as hinted by previous error messages
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'; 
// Import purescript language support (and any other languages you need)
import purescript from 'react-syntax-highlighter/dist/esm/languages/prism/purescript';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';

// Register languages with SyntaxHighlighter (which is now PrismLight)
SyntaxHighlighter.registerLanguage('purescript', purescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('markdown', markdown);

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  return (
    <ReactMarkdown
      className={`prose prose-sm dark:prose-invert max-w-none font-mono ${className}`}
      remarkPlugins={[remarkGfm]}
      components={{
        code({node, inline, className: codeClassName, children, ...props}) {
          const match = /language-(\w+)/.exec(codeClassName || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={atomDark} 
              language={match[1]}
              PreTag="div"
              // @ts-ignore
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={codeClassName} {...props}>
              {children}
            </code>
          );
        }
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
