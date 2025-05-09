
"use client";

// This is a very basic Markdown renderer. For more complex needs, consider react-markdown.
// It handles paragraphs, headings, bold, italics, and unordered lists.
// This is a placeholder and not a full markdown parser.
// In a production app, use a library like `react-markdown`.

import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = "" }) => {
  const lines = content.split('\n');

  const renderLine = (line: string, index: number) => {
    if (line.startsWith('# ')) {
      return <h1 key={index} className="text-2xl font-bold mt-2 mb-1">{line.substring(2)}</h1>;
    }
    if (line.startsWith('## ')) {
      return <h2 key={index} className="text-xl font-semibold mt-1 mb-1">{line.substring(3)}</h2>;
    }
    if (line.startsWith('### ')) {
      return <h3 key={index} className="text-lg font-medium mt-1 mb-0.5">{line.substring(4)}</h3>;
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>;
    }
    // Basic bold and italic
    let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    if (line.trim() === '') return <br key={index} />;
    return <p key={index} dangerouslySetInnerHTML={{ __html: processedLine }} className="my-0.5" />;
  };
  
  // Group list items
  const elements = [];
  let currentListItems: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('- ') || line.startsWith('* ')) {
      currentListItems.push(line);
    } else {
      if (currentListItems.length > 0) {
        elements.push(<ul key={`ul-${elements.length}`} className="my-1 pl-5">{currentListItems.map((item, idx) => renderLine(item, idx))}</ul>);
        currentListItems = [];
      }
      elements.push(renderLine(line, i));
    }
  }
  if (currentListItems.length > 0) {
     elements.push(<ul key={`ul-${elements.length}`} className="my-1 pl-5">{currentListItems.map((item, idx) => renderLine(item, idx))}</ul>);
  }


  return <div className={`prose prose-sm dark:prose-invert max-w-none font-mono ${className}`}>{elements}</div>;
};

export default MarkdownRenderer;
