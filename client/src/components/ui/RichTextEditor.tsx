import React, { useMemo, useRef, useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxWords?: number;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter description...',
  maxWords = 500,
}) => {
  const [ReactQuill, setReactQuill] = useState<any>(null);
  const quillRef = useRef<any>(null);

  // Dynamically import ReactQuill to avoid SSR issues and React 19 compatibility
  useEffect(() => {
    import('react-quill').then((module) => {
      setReactQuill(() => module.default);
    });
  }, []);

  // Count words in HTML content
  const countWords = (html: string): number => {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length === 0 ? 0 : text.split(' ').length;
  };

  const wordCount = useMemo(() => countWords(value), [value]);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ color: [] }, { background: [] }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'color',
    'background',
    'link',
  ];

  const handleChange = (content: string) => {
    const words = countWords(content);
    
    // If word count exceeds max, don't update
    if (words > maxWords) {
      return;
    }
    
    onChange(content);
  };

  // Show loading state while ReactQuill is being imported
  if (!ReactQuill) {
    return (
      <div className="rich-text-editor">
        <div className="border rounded-md p-4 bg-muted/20 min-h-[200px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rich-text-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-background"
      />
      <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
        <span>Rich text formatting available</span>
        <span className={wordCount > maxWords ? 'text-red-500 font-semibold' : ''}>
          {wordCount}/{maxWords} words
        </span>
      </div>
      <style>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-size: 14px;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
        .rich-text-editor .ql-toolbar {
          background: hsl(var(--muted));
          border-color: hsl(var(--border));
          border-radius: 0.5rem 0.5rem 0 0;
        }
        .rich-text-editor .ql-container {
          border-color: hsl(var(--border));
          border-radius: 0 0 0.5rem 0.5rem;
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: normal;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
