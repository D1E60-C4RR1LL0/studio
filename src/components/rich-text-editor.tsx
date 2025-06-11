
"use client";

import React, { useMemo } from 'react';
import type { ReactQuillProps } from 'react-quill';
// Import Quill styles. Make sure react-quill is installed.
import 'react-quill/dist/quill.snow.css'; 
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Dynamically import ReactQuill using next/dynamic
// This is the preferred way in Next.js for client-side only components.
const QuillNoSSR = dynamic(
  () => import('react-quill'), // react-quill exports its class as the default CJS export
  {
    ssr: false, // Ensure it's not rendered on the server
    loading: () => ( // Optional: component to show while ReactQuill is loading
      <textarea
        rows={15}
        className={cn("w-full p-2 border rounded bg-card text-card-foreground")}
        placeholder="Cargando editor de texto enriquecido..."
        disabled
      />
    ),
  }
);

interface RichTextEditorProps extends ReactQuillProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className, ...props }) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],
      
      ['link', 'image', 'video'], 
      // The 'table' button is not standard in Quill's core toolbar options without plugins.
      // Users can still paste or edit HTML tables if the underlying HTML is supported by Quill.

      ['clean']                                         // remove formatting button
    ],
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'color', 'background', 'align',
    // 'table' // Add if a table module/plugin is actively used and configured
  ];

  return (
    <div className={cn("bg-card text-card-foreground", className)}>
      <QuillNoSSR
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        {...props}
      />
    </div>
  );
};

export default RichTextEditor;
