import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Parse markdown-style text to HTML
  const parseMarkdown = (text: string): string => {
    let html = text;
    
    // Remove HTML tags first
    html = html.replace(/<[^>]*>/g, '');
    
    // Headers (must be at start of line)
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-semibold mb-3 mt-4">$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mb-3 mt-4">$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br />');
    
    // Bullet points (• or -)
    html = html.replace(/^[•\-]\s(.+)$/gm, '<li class="ml-4">$1</li>');
    
    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li.*?<\/li>(\s*<br \/>)*)+/g, (match) => {
      return '<ul class="list-disc list-inside space-y-1 my-2">' + match.replace(/<br \/>/g, '') + '</ul>';
    });
    
    // Numbered lists (1. 2. 3. etc)
    html = html.replace(/^\d+\.\s(.+)$/gm, '<li class="ml-4">$1</li>');
    
    return html;
  };

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;
