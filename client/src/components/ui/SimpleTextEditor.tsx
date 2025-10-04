import React, { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered } from 'lucide-react';

interface SimpleTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxWords?: number;
}

const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter description...',
  maxWords = 500,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Count words in text
  const countWords = (text: string): number => {
    const cleaned = text.trim();
    return cleaned.length === 0 ? 0 : cleaned.split(/\s+/).length;
  };

  const wordCount = countWords(value);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const words = countWords(newValue);
    
    // If word count exceeds max, don't update
    if (words > maxWords) {
      return;
    }
    
    onChange(newValue);
  };

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = 
      value.substring(0, start) + 
      prefix + selectedText + suffix + 
      value.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertHeading = (level: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end) || 'Heading';
    
    const prefix = '#'.repeat(level) + ' ';
    const newText = 
      value.substring(0, start) + 
      prefix + selectedText + 
      value.substring(end);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="space-y-2">
      {/* Formatting Toolbar */}
      <div className="flex gap-1 p-2 bg-muted rounded-t-md border border-b-0 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(1)}
          title="Large Heading"
          className="h-8 px-2 text-lg font-bold"
        >
          H1
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(2)}
          title="Medium Heading"
          className="h-8 px-2 text-base font-bold"
        >
          H2
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertHeading(3)}
          title="Small Heading"
          className="h-8 px-2 text-sm font-bold"
        >
          H3
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormatting('**')}
          title="Bold"
          className="h-8 w-8 p-0"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormatting('*')}
          title="Italic"
          className="h-8 w-8 p-0"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const lines = value.substring(0, start).split('\n');
            const currentLine = lines[lines.length - 1];
            if (!currentLine.startsWith('• ')) {
              insertFormatting('• ', '');
            }
          }}
          title="Bullet List"
          className="h-8 w-8 p-0"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const textarea = textareaRef.current;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const lines = value.substring(0, start).split('\n');
            const currentLine = lines[lines.length - 1];
            if (!currentLine.match(/^\d+\./)) {
              insertFormatting('1. ', '');
            }
          }}
          title="Numbered List"
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
      </div>

      {/* Text Area */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={10}
        className="rounded-t-none font-mono text-sm resize-y min-h-[200px]"
      />

      {/* Info Bar */}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        <span>Use # for headings (# H1, ## H2, ### H3), ** for bold, * for italic, • for bullets</span>
        <span className={wordCount > maxWords ? 'text-red-500 font-semibold' : ''}>
          {wordCount}/{maxWords} words
        </span>
      </div>
    </div>
  );
};

export default SimpleTextEditor;
