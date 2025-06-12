
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

// Props para un textarea simple que puede aceptar HTML
interface RichTextEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  onChange: (value: string) => void; // onChange ahora recibe un string directamente del evento del textarea
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className, ...props }) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      className={cn(
        "w-full p-2 border rounded bg-card text-card-foreground min-h-[300px] font-mono text-sm", // Added font-mono and text-sm for HTML
        className
      )}
      placeholder="Ingrese el contenido HTML del correo aquí..."
      {...props} // Pasa otras props de textarea como rows, cols, etc.
    />
  );
};

export default RichTextEditor;
